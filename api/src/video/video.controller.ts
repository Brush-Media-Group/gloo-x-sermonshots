import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoTranscribeDto } from './video.dto';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('transcribe')
  async transcribeVideos(@Body() videoTranscribeDto: VideoTranscribeDto) {
    return this.videoService.transcribeVideos(videoTranscribeDto);
  }

  @Get('search')
  async searchVideos(@Query('query') query: string) {
    if (!query) {
      return {
        query: '',
        totalResults: 0,
        results: [],
        relatedContent: []
      };
    }
    return this.videoService.searchVector(query);
  }

  @Get('health')
  async healthCheck() {
    return { status: 'ok', message: 'Video API is running' };
  }
}
