import { Controller, Get, Post, Query } from '@nestjs/common';
import { VideoService } from './video.service';
import { Video } from './video.entity';
import { VideoListResponse } from './video.types';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get()
  async search(
    @Query('search_context') search_context: string,
  ): Promise<Video[]> {
    return this.videoService.search(search_context);
  }

  @Post('process')
  async processVideos(): Promise<VideoListResponse> {
    return this.videoService.processVideos();
  }
}
