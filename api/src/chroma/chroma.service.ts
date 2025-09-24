import { Injectable, OnModuleInit } from '@nestjs/common';
import { ChromaClient, Collection } from 'chromadb';
import { ConfigService } from '@nestjs/config';
import type { Chapter } from 'assemblyai';

@Injectable()
export class ChromaService implements OnModuleInit {
  private client: ChromaClient;
  private transcripts!: Collection;
  private chapters!: Collection;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.client = new ChromaClient({
      host: this.configService.get<string>('CHROMADB_URL'),
      port: this.configService.get<number>('CHROMADB_PORT'),
    });

    // Ensure collections exist
    this.transcripts = await this.client.getOrCreateCollection({
      name: 'transcripts',
    });
    this.chapters = await this.client.getOrCreateCollection({
      name: 'chapters',
    });
  }

  async addTranscript(transcriptId: string, text: string) {
    await this.transcripts.add({
      ids: [transcriptId],
      documents: [text],
      metadatas: [{ transcription_id: transcriptId }],
    });
  }

  async addChapters(transcriptId: string, chapters: Chapter[]) {
    await this.chapters.add({
      ids: chapters.map((_, i) => `${transcriptId}-chapter-${i}`),
      documents: chapters.map((c) => `${c.headline}\n${c.summary}\n${c.gist}`),
      metadatas: chapters.map((c) => ({
        transcription_id: transcriptId,
        start: c.start,
        end: c.end,
      })),
    });
  }
}
