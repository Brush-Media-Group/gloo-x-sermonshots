import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ChromaClient, Collection, Metadata } from 'chromadb';
import { ConfigService } from '@nestjs/config';
import type { Chapter } from 'assemblyai';
import { OpenAIEmbeddingFunction } from '@chroma-core/openai';

interface ChapterMetadata {
  transcription_id: string;
  start: number;
  end: number;
  user_id?: string;
  [key: string]: any; // Index signature for ChromaDB compatibility
}

interface TranscriptMetadata {
  transcription_id: string;
  user_id: string;
  chunk_index?: number;
  [key: string]: any; // Index signature for ChromaDB compatibility
}

interface SearchResult {
  doc: string;
  transcription_id: string;
  user_id?: string;
}

interface ChapterResult {
  content: string;
  start: number;
  end: number;
  score: number;
}

// Constants for better maintainability
const SEARCH_CONSTANTS = {
  DEFAULT_TRANSCRIPT_TOKENS: 7000,
  DEFAULT_CHAPTER_TOKENS: 6000,
  TOKENS_TO_CHARS_RATIO: 4,
  MIN_CHUNK_RATIO: 0.5,
  MAX_RELEVANCE_SCORE: 99,
  MIN_RELEVANCE_SCORE: 1,
  DEFAULT_CHAPTER_LIMIT: 3,
} as const;

@Injectable()
export class ChromaService implements OnModuleInit {
  private client: ChromaClient;
  private transcripts!: Collection;
  private chapters!: Collection;
  private embedding: OpenAIEmbeddingFunction;
  private logger = new Logger(ChromaService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Helper method to extract search results from ChromaDB query response
   */
  private extractSearchResults(
    documents: string[],
    metadatas: (Metadata | null)[] | null | undefined,
    includeUserId = false
  ): SearchResult[] {
    return documents.map((doc, i) => {
      const metadata = metadatas?.[i] as unknown as TranscriptMetadata;
      const result: SearchResult = {
        doc,
        transcription_id: metadata?.transcription_id,
      };
      
      if (includeUserId && metadata?.user_id) {
        result.user_id = metadata.user_id;
      }
      
      return result;
    });
  }

  /**
   * Helper method to calculate normalized relevance score
   */
  private calculateRelevanceScore(rawScore: number, maxDistance: number): number {
    return Math.round(
      (1 - rawScore / maxDistance) * SEARCH_CONSTANTS.MAX_RELEVANCE_SCORE + SEARCH_CONSTANTS.MIN_RELEVANCE_SCORE
    );
  }

  /**
   * Helper method to validate search parameters
   */
  private validateSearchParams(searchTerm: string, nResults?: number): void {
    if (!searchTerm?.trim()) {
      throw new Error('Search term cannot be empty');
    }
    if (nResults !== undefined && (nResults < 1 || nResults > 100)) {
      throw new Error('nResults must be between 1 and 100');
    }
  }

  /**
   * Helper method to deduplicate search results by transcription_id
   * Keeps the result with the best (lowest) distance score for each transcript
   */
  private deduplicateResults(
    documents: string[],
    metadatas: (Metadata | null)[] | null | undefined,
    distances: (number | null)[] | null | undefined,
    includeUserId = false
  ): SearchResult[] {
    const resultMap = new Map<string, { result: SearchResult; distance: number }>();

    documents.forEach((doc, i) => {
      const metadata = metadatas?.[i] as unknown as TranscriptMetadata;
      const distance = distances?.[i] || Infinity;
      const transcription_id = metadata?.transcription_id;

      if (!transcription_id) return;

      const result: SearchResult = {
        doc,
        transcription_id,
      };

      if (includeUserId && metadata?.user_id) {
        result.user_id = metadata.user_id;
      }

      // Keep the result with the best (lowest) distance for each transcript
      const existing = resultMap.get(transcription_id);
      if (!existing || distance < existing.distance) {
        resultMap.set(transcription_id, { result, distance });
      }
    });

    // Extract just the results, sorted by distance (best first)
    return Array.from(resultMap.values())
      .sort((a, b) => a.distance - b.distance)
      .map(item => item.result);
  }

  private chunkText(text: string, maxTokens: number = SEARCH_CONSTANTS.DEFAULT_TRANSCRIPT_TOKENS): string[] {
    // Rough estimation: 1 token ≈ 4 characters for English text
    const maxChars = maxTokens * SEARCH_CONSTANTS.TOKENS_TO_CHARS_RATIO;

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

        const bestSentenceEnd = Math.max(
          sentenceEnd,
          exclamationEnd,
          questionEnd,
        );

        if (bestSentenceEnd > currentIndex + maxChars * SEARCH_CONSTANTS.MIN_CHUNK_RATIO) {
          endIndex = bestSentenceEnd + 1;
        } else {
          // Fall back to word boundary
          const wordEnd = text.lastIndexOf(' ', endIndex);
          if (wordEnd > currentIndex + maxChars * SEARCH_CONSTANTS.MIN_CHUNK_RATIO) {
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
      modelName: 'text-embedding-3-large',
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
    this.logger.debug(`Adding transcript ${transcriptId} to Chroma`);

    const chunks = this.chunkText(text);
    this.logger.debug(`Split transcript into ${chunks.length} chunks`);

    if (chunks.length === 1) {
      // Single chunk, use original ID
      const metadata: Metadata = {
        transcription_id: transcriptId,
        user_id: userId,
      };
      await this.transcripts.add({
        ids: [transcriptId],
        documents: [chunks[0]],
        metadatas: [metadata],
      });
    } else {
      // Multiple chunks, add chunk index to ID
      const ids = chunks.map((_, i) => `${transcriptId}-chunk-${i}`);
      const metadatas = chunks.map((_, i) => ({
        transcription_id: transcriptId,
        user_id: userId,
        chunk_index: i,
      }));

      await this.transcripts.add({
        ids,
        documents: chunks,
        metadatas,
      });
    }
  }

  async addChapters(transcriptId: string, chapters: Chapter[]) {
    this.logger.debug(`Adding chapters for transcript ${transcriptId}`);

    const ids: string[] = [];
    const documents: string[] = [];
    const metadatas: ChapterMetadata[] = [];

    chapters.forEach((chapter, i) => {
      const chapterText = `${chapter.headline}\n${chapter.summary}\n${chapter.gist}`;

      // Check if chapter content is too long and chunk if necessary
      const chunks = this.chunkText(chapterText, SEARCH_CONSTANTS.DEFAULT_CHAPTER_TOKENS);

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

  async searchTranscripts(searchTerm: string, userId: string, nResults: number = 5): Promise<SearchResult[]> {
    this.validateSearchParams(searchTerm, nResults);
    this.logger.debug(`Searching transcripts for: ${searchTerm}, user_id: ${userId}`);

    try {
      const transcriptsQuery = await this.transcripts.query({
        queryTexts: [searchTerm],
        nResults: nResults * 3, // Get more results to account for deduplication
        where: { user_id: userId }, // Filter by user_id
      });

      if (!transcriptsQuery.documents?.[0]) {
        return [];
      }

      // Deduplicate results by transcription_id and limit to requested count
      const deduplicatedResults = this.deduplicateResults(
        transcriptsQuery.documents[0] as string[],
        transcriptsQuery.metadatas?.[0],
        transcriptsQuery.distances?.[0]
      );

      return deduplicatedResults.slice(0, nResults);
    } catch (error) {
      this.logger.error(`Error searching transcripts: ${error}`);
      throw new Error('Failed to search transcripts');
    }
  }

  async searchTranscriptsByUserId(searchTerm: string, userId: string, nResults: number = 5): Promise<SearchResult[]> {
    this.validateSearchParams(searchTerm, nResults);
    this.logger.debug(`Searching transcripts for user ${userId} with term: ${searchTerm}`);

    try {
      const transcriptsQuery = await this.transcripts.query({
        queryTexts: [searchTerm],
        nResults: Math.min(nResults * 4, 30), // Get more results for deduplication
        where: { user_id: userId },
      });

      if (!transcriptsQuery.documents?.[0]) {
        return [];
      }

      // Deduplicate results by transcription_id and limit to requested count
      const deduplicatedResults = this.deduplicateResults(
        transcriptsQuery.documents[0] as string[],
        transcriptsQuery.metadatas?.[0],
        transcriptsQuery.distances?.[0]
      );

      return deduplicatedResults.slice(0, nResults);
    } catch (error) {
      this.logger.error(`Error searching transcripts by user ID: ${error}`);
      throw new Error('Failed to search transcripts by user ID');
    }
  }

  async searchTranscriptsExcludingUserId(searchTerm: string, excludeUserId: string, nResults: number = 5): Promise<SearchResult[]> {
    this.validateSearchParams(searchTerm, nResults);
    this.logger.debug(`Searching transcripts excluding user ${excludeUserId} with term: ${searchTerm}`);

    try {
      const transcriptsQuery = await this.transcripts.query({
        queryTexts: [searchTerm],
        nResults: Math.min(nResults * 5, 40), // Get more results for deduplication and filtering
        where: { user_id: { $ne: excludeUserId } },
      });

      if (!transcriptsQuery.documents?.[0]) {
        return [];
      }

      // Deduplicate results by transcription_id and limit to requested count
      const deduplicatedResults = this.deduplicateResults(
        transcriptsQuery.documents[0] as string[],
        transcriptsQuery.metadatas?.[0],
        transcriptsQuery.distances?.[0],
        true // Include user_id in results
      );

      return deduplicatedResults.slice(0, nResults);
    } catch (error) {
      this.logger.error(`Error searching transcripts excluding user ID: ${error}`);
      throw new Error('Failed to search transcripts excluding user ID');
    }
  }

  async searchChaptersForTranscripts(
    searchTerms: string[], 
    transcriptIds: string[]
  ): Promise<Map<string, ChapterResult[]>> {
    if (!searchTerms.length || !transcriptIds.length) {
      return new Map();
    }

    this.logger.debug(`Searching chapters for transcripts: ${transcriptIds.join(', ')} with terms: ${searchTerms.join(', ')}`);

    try {
      // Combine all search terms into one query for better results
      const combinedSearchTerm = searchTerms.join(' ');
      
      const chaptersQuery = await this.chapters.query({
        queryTexts: [combinedSearchTerm],
        nResults: Math.min(transcriptIds.length * 10, 50), // Scale with transcript count
      });

      if (!chaptersQuery.documents?.[0] || !chaptersQuery.distances?.[0]) {
        return new Map();
      }

      // Find max distance for normalization
      const allDistances = chaptersQuery.distances[0].filter(
        (d): d is number => d !== null,
      );
      const maxDistance = Math.max(...allDistances, 1); // Avoid division by zero

      // Group results by transcript ID and filter for our target transcripts
      const resultsByTranscript = new Map<string, ChapterResult[]>();

      chaptersQuery.documents[0].forEach((chapterDoc, chapterIndex) => {
        const chapterMetadata = chaptersQuery?.metadatas?.[0]?.[
          chapterIndex
        ] as unknown as ChapterMetadata;
        
        const transcription_id = chapterMetadata?.transcription_id;
        
        // Only include chapters from our target transcripts
        if (transcription_id && transcriptIds.includes(transcription_id)) {
          const rawScore = chaptersQuery.distances[0][chapterIndex] || 0;
          const relevance = this.calculateRelevanceScore(rawScore, maxDistance);
          
          const chapterResult: ChapterResult = {
            content: chapterDoc as string,
            start: chapterMetadata.start,
            end: chapterMetadata.end,
            score: relevance,
          };

          if (!resultsByTranscript.has(transcription_id)) {
            resultsByTranscript.set(transcription_id, []);
          }
          resultsByTranscript.get(transcription_id)!.push(chapterResult);
        }
      });

      // Sort chapters within each transcript by relevance score and limit to top chapters
      resultsByTranscript.forEach((chapters, transcriptId) => {
        chapters.sort((a, b) => b.score - a.score);
        resultsByTranscript.set(transcriptId, chapters.slice(0, SEARCH_CONSTANTS.DEFAULT_CHAPTER_LIMIT));
      });

      return resultsByTranscript;
    } catch (error) {
      this.logger.error(`Error searching chapters for transcripts: ${error}`);
      throw new Error('Failed to search chapters for transcripts');
    }
  }

  async searchVector(searchTerm: string): Promise<any[]> {
    this.validateSearchParams(searchTerm);
    this.logger.debug(`Searching for: ${searchTerm}`);

    try {
      // Search both transcripts and chapters in parallel
      const [transcriptsQuery, chaptersQuery] = await Promise.all([
        this.transcripts.query({
          queryTexts: [searchTerm],
          nResults: 15, // Get more results to account for deduplication
        }),
        this.chapters.query({
          queryTexts: [searchTerm],
          nResults: 20, // Get more chapters for better matching
        }),
      ]);

      if (!transcriptsQuery.documents?.[0] || !chaptersQuery.documents?.[0]) {
        return [];
      }

      // Deduplicate transcript results by transcription_id
      const deduplicatedTranscripts = this.deduplicateResults(
        transcriptsQuery.documents[0] as string[],
        transcriptsQuery.metadatas?.[0],
        transcriptsQuery.distances?.[0]
      );

      // Limit to top 5 unique transcripts
      const limitedTranscripts = deduplicatedTranscripts.slice(0, 5);

      // Find max distance for normalization
      const allDistances = (chaptersQuery.distances?.[0] ?? []).filter(
        (d): d is number => d !== null,
      );
      const maxDistance = Math.max(...allDistances, 1); // Avoid division by zero

      const results = limitedTranscripts.map((transcriptResult) => {
        const transcription_id = transcriptResult.transcription_id;

        // Find matching chapters for this transcript
        const matchingChapters: ChapterResult[] = [];

        // Look through chapter search results for this transcript
        chaptersQuery.documents[0].forEach((chapterDoc, chapterIndex) => {
          const chapterMetadata = chaptersQuery?.metadatas?.[0]?.[chapterIndex] as unknown as ChapterMetadata;
          
          if (chapterMetadata?.transcription_id === transcription_id) {
            const rawScore = chaptersQuery.distances?.[0]?.[chapterIndex] || 0;
            const relevance = this.calculateRelevanceScore(rawScore, maxDistance);
            
            matchingChapters.push({
              content: chapterDoc as string,
              start: chapterMetadata.start,
              end: chapterMetadata.end,
              score: relevance,
            });
          }
        });

        // Sort chapters by relevance score (higher is more relevant)
        matchingChapters.sort((a, b) => b.score - a.score);
        
        return {
          doc: transcriptResult.doc,
          transcription_id,
          matchingChapters: matchingChapters.slice(0, SEARCH_CONSTANTS.DEFAULT_CHAPTER_LIMIT),
        };
      });

      return results;
    } catch (error) {
      this.logger.error(`Error in vector search: ${error}`);
      throw new Error('Failed to perform vector search');
    }
  }
}
