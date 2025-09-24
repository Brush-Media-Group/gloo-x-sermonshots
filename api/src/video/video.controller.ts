import { Controller, Post, Body } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoTranscribeDto } from './video.dto';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('transcribe')
  async transcribeVideos(@Body() videoTranscribeDto: VideoTranscribeDto) {
    return this.videoService.transcribeVideos(videoTranscribeDto);
  }
}
