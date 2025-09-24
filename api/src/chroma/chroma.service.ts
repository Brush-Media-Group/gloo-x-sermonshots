import { Injectable, OnModuleInit } from '@nestjs/common';
import { ChromaClient, Collection } from 'chromadb';
import { ConfigService } from '@nestjs/config';
import type { Chapter } from 'assemblyai';
import { OpenAIEmbeddingFunction } from "@chroma-core/openai";

@Injectable()
export class ChromaService implements OnModuleInit {
  private client: ChromaClient;
  private transcripts!: Collection;
  private chapters!: Collection;
  private embedding: OpenAIEmbeddingFunction;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.client = new ChromaClient({
      host: this.configService.get<string>('CHROMADB_URL'),
      port: this.configService.get<number>('CHROMADB_PORT'),
    });
    
    this.embedding = new OpenAIEmbeddingFunction({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: "text-embedding-3-small",
    });
      
    // Ensure collections exist
    this.transcripts = await this.client.getOrCreateCollection({
      name: 'transcripts',
      embeddingFunction: this.embedding,
    });
    
    this.chapters = await this.client.getOrCreateCollection({
      name: 'chapters',
      embeddingFunction: this.embedding,
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
