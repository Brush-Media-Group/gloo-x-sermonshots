import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AssemblyAI, Transcript } from 'assemblyai';

@Injectable()
export class AssemblyaiService {
  private client: AssemblyAI;
  constructor(private configService: ConfigService) {
    this.client = new AssemblyAI({
      apiKey: this.configService.get<string>('ASSEMBLYAI_API_KEY') ?? '',
    });
  }

  async transcribeVideo(url: string): Promise<Transcript> {
    const transcript = await this.client.transcripts.transcribe({
      audio_url: url,
      auto_chapters: true,
      content_safety: true,
    });

    return transcript;
  }
}
