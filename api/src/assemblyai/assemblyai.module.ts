import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssemblyaiService } from './assemblyai.service';

@Module({
  imports: [ConfigModule],
  providers: [AssemblyaiService],
  exports: [AssemblyaiService],
})
export class AssemblyaiModule {}
