import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { VideoProcessor } from './video.processor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './video.entity';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AssemblyaiModule } from 'src/assemblyai/assemblyai.module';
import { ChromaModule } from 'src/chroma/chroma.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([Video]),
    ConfigModule,
    HttpModule,
    AssemblyaiModule,
    ChromaModule,
    BullModule.registerQueue({ name: 'video' }),
  ],
  controllers: [VideoController],
  providers: [VideoService, VideoProcessor],
  exports: [VideoService],
})
export class VideoModule {}
