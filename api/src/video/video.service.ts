import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './video.entity';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { VideoListResponse } from './video.types';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(
    @InjectRepository(Video)
    private videoRepository: Repository<Video>,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async search(searchTerm: string): Promise<Video[]> {
    return this.videoRepository
      .createQueryBuilder('video')
      .where('lower(title) LIKE lower(:title)', {
        title: `%${searchTerm}%`,
      })
      .getMany();
  }

  async processVideos(): Promise<VideoListResponse> {
    const baseUrl = this.configService.get<string>(
      'PUBLIC_SERMONSHOTS_API_URL',
    );
    const apiKey = this.configService.get<string>('SERMONSHOTS_ACCOUNT_JWT');

    try {
      const { data } = await firstValueFrom(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.httpService.get<VideoListResponse>(`${baseUrl}/videos`, {
          headers: {
            'auth-token': apiKey,
          },
        }),
      );

      return data as VideoListResponse;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(
          `Error fetching videos: ${error.message} - ${error.response?.data}`,
        );
      } else {
        this.logger.error(`Unexpected error: ${error}`);
      }
      throw error;
    }
  }
}
