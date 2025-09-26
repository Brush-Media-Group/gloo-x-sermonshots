import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './video.entity';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AssemblyaiService } from 'src/assemblyai/assemblyai.service';
import { ChromaService } from 'src/chroma/chroma.service';
import * as fs from 'fs';
import * as path from 'path';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { VideoCsvRecord } from './video.dto';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    private httpService: HttpService,
    private configService: ConfigService,
    private assemblyaiService: AssemblyaiService,
    private chromaService: ChromaService,
    @InjectQueue('video') private videoQueue: Queue,
  ) {}

  async transcribeVideos(): Promise<void> {
    const csvFilePath = path.join(process.cwd(), './data/videos.csv');
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');
    const items = lines.slice(1).map((line) => {
      const values = line.split(',');
      const item: VideoCsvRecord = {
        user_id: '',
        title: '',
        video_url: '',
        video_thumbnail_url: '',
        createdAt: '',
      };
      headers.forEach((header, idx) => {
        item[header.trim().replace(/^"|"$/g, '')] = values[idx]
          .trim()
          .replace(/^"|"$/g, '');
      });
      return item;
    });
    const videoList = items;

    for (const video of videoList) {
      await this.videoQueue.add('transcribe', video);
      this.logger.debug(
        `transcribeVideos: Queueing transcription for video title: ${video.title}`,
      );
    }

    return;
  }

  async processTranscription(video: VideoCsvRecord) {
    this.logger.debug(
      `processTranscription: Processing transcription for video title: ${video.title}`,
    );

    const transcript = await this.assemblyaiService.transcribeVideo(
      video.video_url,
    );

    if (transcript.status === 'error') {
      this.logger.error(
        `processTranscription: Transcription error for video title ${video.title}: ${transcript.error}`,
      );
      return; // Skip to the next video on error
    }

    await Promise.all([
      this.videoRepository
        .createQueryBuilder('video')
        .insert()
        .values({
          user_id: video.user_id,
          transcript_id: transcript.id,
          title: video.title,
          raw_transcript: JSON.stringify(transcript),
          video_url: video.video_url,
          video_thumbnail_url: video.video_thumbnail_url,
          is_public: true,
        })
        .execute(),
      this.chromaService.addTranscript(
        transcript.id,
        transcript.text || '',
        video.user_id,
      ),
      this.chromaService.addChapters(transcript.id, transcript.chapters ?? []),
    ]);

    this.logger.debug(
      `processTranscription: Completed processing for video title: ${video.title}`,
    );
  }

  async getVideoByTranscriptId(transcriptId: string) {
    return this.videoRepository.findOne({
      where: { transcript_id: transcriptId },
    });
  }

  async searchVector(searchTerm: string) {
    this.logger.debug(`Searching for: ${searchTerm}`);
    try {
      const chromaResults = await this.chromaService.searchVector(searchTerm);
      // Transform the results to match the frontend interface
      const results = await Promise.all(
        chromaResults.map(async (result: any) => {
          const video = await this.getVideoByTranscriptId(
            result.transcription_id,
          );
          const fullTranscript = JSON.parse(video?.raw_transcript || '{}');
          const chapters = fullTranscript?.chapters || [];
          const words = fullTranscript?.words || [];

          // Helper function to extract transcript text for a chapter
          const extractChapterTranscript = (
            startTime: number,
            endTime: number,
          ): string => {
            if (!words || words.length === 0) return '';

            const chapterWords = words.filter(
              (word: any) => word.start >= startTime && word.end <= endTime,
            );

            return chapterWords.map((word: any) => word.text).join(' ');
          };

          // Create a map of matching chapters by their start/end times for easy lookup
          const matchingChapterMap = new Map();
          if (result.matchingChapters) {
            result.matchingChapters.forEach((matchingChapter: any) => {
              const key = `${matchingChapter.start}-${matchingChapter.end}`;
              matchingChapterMap.set(key, {
                score: matchingChapter.score,
                content: matchingChapter.content,
              });
            });
          }

          return {
            transcription_id: result.transcription_id,
            videoUrl: video?.video_url || '',
            text: result.doc || '',
            title: video?.title || 'Untitled Video',
            chapters: chapters.map((chapter, index) => {
              const key = `${chapter.start}-${chapter.end}`;
              const matchingInfo = matchingChapterMap.get(key);
              const chapterTranscript = extractChapterTranscript(
                chapter.start,
                chapter.end,
              );

              return {
                title: chapter.headline || `Chapter ${index + 1}`,
                summary: chapter.summary,
                start: chapter.start,
                end: chapter.end,
                transcript: chapterTranscript, // Add full transcript text for this chapter
                isRelevant: !!matchingInfo, // Mark if this chapter is relevant to search
                relevanceScore: matchingInfo?.score || null,
              };
            }),
            thumbnail: video?.video_thumbnail_url || '',
            // Add summary of most relevant chapters
            relevantChapters: result.matchingChapters || [],
          };
        }),
      );

      return {
        query: searchTerm,
        totalResults: results.length,
        results,
        relatedContent: [], // Can be enhanced later
      };
    } catch (error) {
      this.logger.error(`Error searching for vector: ${error}`);
      return { error: 'Internal server error' };
    }
  }
}
