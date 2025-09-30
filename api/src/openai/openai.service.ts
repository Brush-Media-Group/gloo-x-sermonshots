import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface AnalyzedResult {
  answersQuestion: boolean;
  relevantExcerpts: string[];
  bestAnswer: string;
  confidence: number;
  reasoning: string;
}

@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn('OpenAI API key not found. AI analysis will be disabled.');
      return;
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async analyzeSearchResult(
    query: string,
    transcriptText: string,
    chapters: any[]
  ): Promise<AnalyzedResult> {
    if (!this.openai) {
      return {
        answersQuestion: false,
        relevantExcerpts: [],
        bestAnswer: '',
        confidence: 0,
        reasoning: 'OpenAI service not available'
      };
    }

    try {
      const prompt = this.buildAnalysisPrompt(query, transcriptText, chapters);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a biblical scholar and sermon analyst. Your task is to analyze sermon transcripts and determine if they answer specific faith-related questions, then extract the most relevant parts that provide the best answers.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return this.parseAnalysisResponse(content);
    } catch (error) {
      this.logger.error(`Error analyzing search result: ${error}`);
      return {
        answersQuestion: false,
        relevantExcerpts: [],
        bestAnswer: '',
        confidence: 0,
        reasoning: `Analysis failed: ${error.message}`
      };
    }
  }

  private buildAnalysisPrompt(query: string, transcriptText: string, chapters: any[]): string {
    const chapterSummaries = chapters
      .map((chapter, index) => `Chapter ${index + 1}: ${chapter.title || 'Untitled'} - ${chapter.summary || 'No summary'}`)
      .join('\n');

    return `
Question/Query: "${query}"

Sermon Transcript:
${transcriptText}

Chapter Summaries:
${chapterSummaries}

Please analyze this sermon transcript and determine:

1. Does this sermon content answer or address the question/query?
2. What are the most relevant excerpts (2-3 short passages) that directly relate to the question?
3. What is the best single answer or insight from this sermon that addresses the question?
4. How confident are you that this sermon addresses the question? (0-100%)
5. Provide reasoning for your assessment.

Respond in the following JSON format:
{
  "answersQuestion": boolean,
  "relevantExcerpts": ["excerpt1", "excerpt2", "excerpt3"],
  "bestAnswer": "The most relevant answer or insight from the sermon",
  "confidence": number (0-100),
  "reasoning": "Brief explanation of why this sermon does/doesn't answer the question"
}

Focus on extracting actual quotes or paraphrases from the sermon content. If the sermon doesn't address the question, be honest about it.
`;
  }

  private parseAnalysisResponse(content: string): AnalyzedResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        answersQuestion: parsed.answersQuestion || false,
        relevantExcerpts: Array.isArray(parsed.relevantExcerpts) ? parsed.relevantExcerpts : [],
        bestAnswer: parsed.bestAnswer || '',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
        reasoning: parsed.reasoning || 'No reasoning provided'
      };
    } catch (error) {
      this.logger.error(`Error parsing OpenAI response: ${error}`);
      return {
        answersQuestion: false,
        relevantExcerpts: [],
        bestAnswer: '',
        confidence: 0,
        reasoning: 'Failed to parse AI analysis'
      };
    }
  }

  async batchAnalyzeResults(
    query: string,
    results: Array<{ transcriptText: string; chapters: any[]; transcription_id: string }>
  ): Promise<Map<string, AnalyzedResult>> {
    const analysisMap = new Map<string, AnalyzedResult>();
    
    // Process results in parallel but with a reasonable concurrency limit
    const batchSize = 3;
    for (let i = 0; i < results.length; i += batchSize) {
      const batch = results.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (result) => {
        const analysis = await this.analyzeSearchResult(
          query,
          result.transcriptText,
          result.chapters
        );
        return { id: result.transcription_id, analysis };
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ id, analysis }) => {
        analysisMap.set(id, analysis);
      });
    }

    return analysisMap;
  }
}
