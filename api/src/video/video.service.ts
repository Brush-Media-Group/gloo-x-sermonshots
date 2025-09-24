import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './video.entity';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { VideoListResponse, VideoTranscribeDto } from './video.dto';
import { firstValueFrom } from 'rxjs';
import { AssemblyaiService } from 'src/assemblyai/assemblyai.service';
import { ChromaService } from 'src/chroma/chroma.service';

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
  ) {}

  async transcribeVideos(params: VideoTranscribeDto): Promise<number[]> {
    this.logger.log(`Transcribing videos for page ${params.page} and limit ${params.limit}`);
    const baseUrl = this.configService.get<string>('SERMONSHOTS_API_URL');

    let videoList: VideoListResponse;

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<VideoListResponse>(
          `${baseUrl}/videos?page=${params.page}&limit=${params.limit}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'auth-token': params.accessToken,
            },
          },
        ),
      );

      videoList = data;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`Error fetching videos: ${error.message}`);
      } else {
        this.logger.error(`Unexpected error: ${error}`);
      }
      throw error;
    }

    const results: number[] = [];

    for (const video of videoList.items) {
      const transcript = await this.assemblyaiService.transcribeVideo(
        video.file.publicUrl,
      );

      if (transcript.status === 'error') {
        this.logger.error(
          `Transcription error for video ID ${video.id}: ${transcript.error}`,
        );
        continue; // Skip to the next video on error
      }

      await Promise.all([
        this.videoRepository
          .createQueryBuilder('video')
          .insert()
          .values({
            user_id: video.owner,
            transcript_id: transcript.id,
            title: video.name,
            raw_transcript: JSON.stringify(transcript),
            video_url: video.file.publicUrl,
            video_thumbnail_url: video.preview.publicUrl,
            is_public: true,
          })
          .execute(),
        this.chromaService.addTranscript(
          transcript.id,
          transcript.text || '',
          video.owner,
        ),
        this.chromaService.addChapters(
          transcript.id,
          transcript.chapters ?? [],
        ),
      ]);

      results.push(video.id);
    }

    return results;
  }

  async getVideoByTranscriptId(transcriptId: string) {
    return this.videoRepository.findOne({ where: { transcript_id: transcriptId }});
  }

  async searchVector(searchTerm: string) {
    this.logger.log(`Searching for: ${searchTerm}`);
    try {
      const chromaResults = await this.chromaService.searchVector(searchTerm);
      this.logger.log(`Chroma results: ${chromaResults.length}`);
      // Transform the results to match the frontend interface
      const results = await Promise.all(
        chromaResults.map(async (result: any) => {
          const video = await this.getVideoByTranscriptId(result.transcription_id);
          const chapters = (JSON.parse(video?.raw_transcript || '{}'))?.chapters || [];
          return {
            transcription_id: result.transcription_id,
            videoUrl: video?.video_url || '',
            text: result.doc || '',
            title: video?.title || 'Untitled Video',
            chapters: chapters.map(chapter => (
              {
                title: chapter.headline,
                summary: chapter.summary,
                start: chapter.start,
                end: chapter.end,
              }
             )),
            thumbnail: video?.video_thumbnail_url || '', // Add thumbnail logic if available
          };
        })
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
