import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { VideoService } from './video.service';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('transcribe')
  async transcribeVideos() {
    return this.videoService.transcribeVideos();
  }

  @Get('search')
  async searchVideos(@Query('query') query: string) {
    if (!query) {
      return {
        query: '',
        totalResults: 0,
        results: [],
        relatedContent: [],
      };
    }
    return this.videoService.searchVector(query);
  }

  @Get('health')
  healthCheck() {
    return { status: 'ok', message: 'Video API is running' };
  }
}
