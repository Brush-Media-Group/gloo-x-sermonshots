import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './video.entity';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AssemblyaiService } from 'src/assemblyai/assemblyai.service';
import { ChromaService } from 'src/chroma/chroma.service';
import { OpenaiService } from 'src/openai/openai.service';
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
    private openaiService: OpenaiService,
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
      // Step 1: Search transcripts first (similarity search). We're hardcoding the user id for now as we have limited data sets.
      this.logger.debug('Step 1: Performing transcript similarity search');
      const transcriptResults =
        await this.chromaService.searchTranscripts(searchTerm, '419', 3);

      if (transcriptResults.length === 0) {
        return {
          query: searchTerm,
          totalResults: 0,
          results: [],
          relatedContent: [],
          aiEnhanced: true,
        };
      }

      // Step 2: Transform transcript results and prepare for AI analysis
      const results = await Promise.all(
        transcriptResults.map(async (result: any) => {
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

          // Initially, no chapters are marked as relevant (will be determined by AI)
          const processedChapters = chapters.map((chapter, index) => {
            const chapterTranscript = extractChapterTranscript(
              chapter.start,
              chapter.end,
            );

            return {
              title: chapter.headline || `Chapter ${index + 1}`,
              summary: chapter.summary,
              start: chapter.start,
              end: chapter.end,
              transcript: chapterTranscript,
              isRelevant: false, // Will be updated after AI analysis
              relevanceScore: null, // Will be updated after AI analysis
            };
          });

          return {
            transcription_id: result.transcription_id,
            videoUrl: video?.video_url || '',
            text: result.doc || '',
            title: video?.title || 'Untitled Video',
            chapters: processedChapters,
            thumbnail: video?.video_thumbnail_url || '',
            relevantChapters: [], // Will be populated after AI analysis
          };
        }),
      );

      // Step 3: Run OpenAI analysis on transcript results
      this.logger.debug(
        `Step 2: Running OpenAI analysis for ${results.length} results`,
      );
      const analysisData = results.map((result) => ({
        transcription_id: result.transcription_id,
        transcriptText: result.text,
        chapters: result.chapters,
      }));

      const analysisMap = await this.openaiService.batchAnalyzeResults(
        searchTerm,
        analysisData,
      );

      // filter results
      const filteredResults = results.filter((result) => {
        // Apply any additional filtering logic here
        const analysis = analysisMap.get(result.transcription_id);
        return analysis && analysis.confidence > 0.5; // Example: filter out low-confidence results
      });

      // Step 4: Use AI analysis results to search for relevant chapters
      this.logger.debug(
        'Step 3: Searching for relevant chapters using AI analysis results',
      );

      // Collect all search terms from AI analysis and transcript IDs
      const searchTermsForChapters: string[] = [];
      const transcriptIds: string[] = [];

      filteredResults.forEach((result) => {
        const analysis = analysisMap.get(result.transcription_id);
        if (analysis && analysis.answersQuestion) {
          transcriptIds.push(result.transcription_id);

          // Add best answer and relevant excerpts as search terms
          if (analysis.bestAnswer) {
            searchTermsForChapters.push(analysis.bestAnswer);
          }
          if (
            analysis.relevantExcerpts &&
            analysis.relevantExcerpts.length > 0
          ) {
            searchTermsForChapters.push(...analysis.relevantExcerpts);
          }
        }
      });

      // Search chapters using AI-derived terms
      let chapterSearchResults = new Map();
      if (searchTermsForChapters.length > 0 && transcriptIds.length > 0) {
        chapterSearchResults =
          await this.chromaService.searchChaptersForTranscripts(
            searchTermsForChapters,
            transcriptIds,
          );
      }

      // Step 5: Enhance results with AI analysis and chapter relevance
      const enhancedResults = filteredResults.map((result) => {
        const analysis = analysisMap.get(result.transcription_id);
        const matchingChapters =
          chapterSearchResults.get(result.transcription_id) || [];

        // Create a map of matching chapters by their start/end times for easy lookup
        const matchingChapterMap = new Map();
        matchingChapters.forEach((matchingChapter: any) => {
          const key = `${matchingChapter.start}-${matchingChapter.end}`;
          matchingChapterMap.set(key, {
            score: matchingChapter.score,
            content: matchingChapter.content,
          });
        });

        // Update chapters with relevance information
        const updatedChapters = result.chapters.map((chapter) => {
          const key = `${chapter.start}-${chapter.end}`;
          const matchingInfo = matchingChapterMap.get(key);

          return {
            ...chapter,
            isRelevant: !!matchingInfo,
            relevanceScore: matchingInfo?.score || null,
          };
        });

        return {
          ...result,
          chapters: updatedChapters,
          relevantChapters: matchingChapters,
          aiAnalysis: analysis || {
            answersQuestion: false,
            relevantExcerpts: [],
            bestAnswer: '',
            confidence: 0,
            reasoning: 'Analysis not available',
          },
        };
      });

      // Sort results by AI confidence and relevance
      enhancedResults.sort((a, b) => {
        // First prioritize results that answer the question
        if (a.aiAnalysis.answersQuestion && !b.aiAnalysis.answersQuestion)
          return -1;
        if (!a.aiAnalysis.answersQuestion && b.aiAnalysis.answersQuestion)
          return 1;

        // Then sort by confidence score
        return b.aiAnalysis.confidence - a.aiAnalysis.confidence;
      });

      // Step 6: Get related content from transcripts
      this.logger.debug('Step 4: Searching for related content');
      const relatedContent = await this.getRelatedContent(searchTerm);

      return {
        query: searchTerm,
        totalResults: enhancedResults.length,
        results: enhancedResults,
        relatedContent: relatedContent,
        aiEnhanced: true, // Flag to indicate AI analysis was performed
      };
    } catch (error) {
      this.logger.error(`Error searching for vector: ${error}`);
      return { error: 'Internal server error' };
    }
  }

  async getRelatedContent(searchTerm: string) {
    try {
      // Search transcripts excluding user_id "419". We're hardcoding this for now as we have limited data sets.
      const relatedTranscriptResults = await this.chromaService.searchTranscriptsExcludingUserId(
        searchTerm,
        '419',
        3 // Limit to 3 related results
      );

      // Transform results to match expected format
      const relatedContent = await Promise.all(
        relatedTranscriptResults.map(async (result: any) => {
          const video = await this.getVideoByTranscriptId(result.transcription_id);
          
          return {
            transcription_id: result.transcription_id,
            videoUrl: video?.video_url || '',
            title: video?.title || 'Untitled Video',
            thumbnail: video?.video_thumbnail_url || '',
            text: result.doc || '',
          };
        }),
      );

      return relatedContent;
    } catch (error) {
      this.logger.error(`Error getting related content: ${error}`);
      return [];
    }
  }
}
