export interface AIAnalysis {
	answersQuestion: boolean;
	relevantExcerpts: string[];
	bestAnswer: string;
	confidence: number;
	reasoning: string;
}

export interface VideoResult {
	transcription_id: string;
	videoUrl: string;
	text: string;
	chapters: Chapter[];
	title?: string;
	thumbnail?: string;
	aiAnalysis?: AIAnalysis;
}

export interface Chapter {
	title: string;
	summary: string;
	start: number;
	end: number;
}

export interface RelatedVideo {
	id: string;
	title: string;
	snippet: string;
	thumbnail?: string;
	videoUrl?: string;
}

export interface SearchResponse {
	results: VideoResult[];
	relatedContent: RelatedVideo[];
	query: string;
	totalResults: number;
	aiEnhanced?: boolean;
}
