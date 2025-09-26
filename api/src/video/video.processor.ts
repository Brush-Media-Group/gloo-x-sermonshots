import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { VideoService } from './video.service';
import { VideoCsvRecord } from './video.dto';

@Processor('video')
export class VideoProcessor extends WorkerHost {
  private readonly logger = new Logger(VideoProcessor.name);

  constructor(private readonly videoService: VideoService) {
    super();
  }

  async process(job: Job) {
    await this.videoService.processTranscription(job.data as VideoCsvRecord);
  }
}
