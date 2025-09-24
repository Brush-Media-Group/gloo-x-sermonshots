import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ChromaClient, Collection } from 'chromadb';
import { ConfigService } from '@nestjs/config';
import type { Chapter } from 'assemblyai';
import { OpenAIEmbeddingFunction } from '@chroma-core/openai';

interface ChapterMetadata {
  transcription_id: string;
  start: number;
  end: number;
  [key: string]: any; // Index signature for ChromaDB compatibility
}

interface TranscriptMetadata {
  transcription_id: string;
  chunk_index?: number;
  [key: string]: any; // Index signature for ChromaDB compatibility
}

@Injectable()
export class ChromaService implements OnModuleInit {
  private client: ChromaClient;
  private transcripts!: Collection;
  private chapters!: Collection;
  private embedding: OpenAIEmbeddingFunction;
  private logger = new Logger(ChromaService.name);

  constructor(
    private configService: ConfigService,
  ) { }

  private chunkText(text: string, maxTokens: number = 7000): string[] {
    // Rough estimation: 1 token ≈ 4 characters for English text
    const maxChars = maxTokens * 4;
    
    if (text.length <= maxChars) {
      return [text];
    }

    const chunks: string[] = [];
    let currentIndex = 0;

    while (currentIndex < text.length) {
      let endIndex = currentIndex + maxChars;
      
      // If we're not at the end, try to break at a sentence or word boundary
      if (endIndex < text.length) {
        // Look for sentence boundary (. ! ?)
        const sentenceEnd = text.lastIndexOf('.', endIndex);
        const exclamationEnd = text.lastIndexOf('!', endIndex);
        const questionEnd = text.lastIndexOf('?', endIndex);
        
        const bestSentenceEnd = Math.max(sentenceEnd, exclamationEnd, questionEnd);
        
        if (bestSentenceEnd > currentIndex + maxChars * 0.5) {
          endIndex = bestSentenceEnd + 1;
        } else {
          // Fall back to word boundary
          const wordEnd = text.lastIndexOf(' ', endIndex);
          if (wordEnd > currentIndex + maxChars * 0.5) {
            endIndex = wordEnd;
          }
        }
      }

      chunks.push(text.slice(currentIndex, endIndex).trim());
      currentIndex = endIndex;
    }

    return chunks;
  }

  async onModuleInit() {
    this.client = new ChromaClient({
      host: this.configService.get<string>('CHROMADB_URL'),
      port: this.configService.get<number>('CHROMADB_PORT'),
    });

    this.embedding = new OpenAIEmbeddingFunction({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: "text-embedding-3-large",
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

  async addTranscript(transcriptId: string, text: string, userId: string) {
    console.log(`Adding transcript ${transcriptId} to Chroma`);
    
    const chunks = this.chunkText(text);
    console.log(`Split transcript into ${chunks.length} chunks`);
    
    if (chunks.length === 1) {
      // Single chunk, use original ID
      await this.transcripts.add({
        ids: [transcriptId],
        documents: [chunks[0]],
        metadatas: [{ transcription_id: transcriptId, user_id: userId }],
      });
    } else {
      // Multiple chunks, add chunk index to ID
      const ids = chunks.map((_, i) => `${transcriptId}-chunk-${i}`);
      const metadatas = chunks.map((_, i) => ({ 
        transcription_id: transcriptId, 
        chunk_index: i 
      }));
      
      await this.transcripts.add({
        ids,
        documents: chunks,
        metadatas,
      });
    }
  }

  async addChapters(transcriptId: string, chapters: Chapter[]) {
    console.log(`Adding chapters for transcript ${transcriptId}`);
    
    const ids: string[] = [];
    const documents: string[] = [];
    const metadatas: ChapterMetadata[] = [];
    
    chapters.forEach((chapter, i) => {
      const chapterText = `${chapter.headline}\n${chapter.summary}\n${chapter.gist}`;
      
      // Check if chapter content is too long and chunk if necessary
      const chunks = this.chunkText(chapterText, 6000); // Smaller limit for chapters
      
      if (chunks.length === 1) {
        ids.push(`${transcriptId}-chapter-${i}`);
        documents.push(chunks[0]);
        metadatas.push({
          transcription_id: transcriptId,
          start: chapter.start,
          end: chapter.end,
        });
      } else {
        // Split large chapter into sub-chunks
        chunks.forEach((chunk, chunkIndex) => {
          ids.push(`${transcriptId}-chapter-${i}-chunk-${chunkIndex}`);
          documents.push(chunk);
          metadatas.push({
            transcription_id: transcriptId,
            start: chapter.start,
            end: chapter.end,
          });
        });
      }
    });
    
    if (ids.length > 0) {
      await this.chapters.add({
        ids,
        documents,
        metadatas,
      });
    }
  }

  async searchVector(searchTerm: string) {
    console.log(`Searching for: ${searchTerm}`);
    const chaptersQuery = await this.chapters.query({
      queryTexts: [searchTerm],
    });

    const results = await Promise.all(
      chaptersQuery.documents[0].map(async (doc, i) => { 
        const metadata = chaptersQuery?.metadatas?.[0]?.[i] as unknown as ChapterMetadata;
        const transcription_id = metadata?.transcription_id;
        return {
          doc,
          transcription_id,
          start: metadata?.start,
          end: metadata?.end,
        };
      })
    );

    return results;
  }
}
