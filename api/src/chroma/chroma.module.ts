import { Module } from '@nestjs/common';
import { ChromaService } from './chroma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [ChromaService],
  exports: [ChromaService],
})
export class ChromaModule {}
