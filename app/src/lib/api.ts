import { PUBLIC_API_BASE_URL } from '$env/static/public';

// API configuration and types
export interface VideoResult {
  transcription_id: string;
  videoUrl: string;
  text: string;
  chapters: Chapter[];
  title?: string;
  thumbnail?: string;
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
}

// API base URL from environment variable with fallback
const API_BASE_URL = PUBLIC_API_BASE_URL || 'http://localhost:3001';

/**
 * Test API connection
 */
export async function testConnection(): Promise<{ status: string; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/videos/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API connection test failed:', error);
    throw error;
  }
}

/**
 * Search for videos based on a query
 */
export async function searchVideos(query: string): Promise<SearchResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/videos/search?query=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Search API error:', error);
    
    // Return mock data for development
    //return getMockSearchResults(query);
    return { results: [], relatedContent: [], query, totalResults: 0 };
  }
}

/**
 * Fetch chapters for a specific video (legacy function for compatibility)
 */
export async function fetchChapters() {
  try {
    const response = await fetch(`${API_BASE_URL}/chapters`);
    
    if (!response.ok) {
      throw new Error(`Fetch chapters failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Chapters API error:', error);
    
    // Return mock data for development
    return {
      videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      chapters: [
        {
          id: 1,
          title: "Introduction",
          summary: "Welcome and opening remarks",
          start: 0,
          end: 30
        },
        {
          id: 2,
          title: "Main Content",
          summary: "Core discussion points",
          start: 30,
          end: 120
        }
      ]
    };
  }
}

/**
 * Mock search results for development
 */
function getMockSearchResults(query: string): SearchResponse {
  return {
    query,
    totalResults: 2,
    results: [
      {
        transcription_id: "1",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        title: `Search Result for "${query}" - Video 1`,
        text: "This is a sample transcript for the first video result. It contains detailed information about the topic you searched for. The content goes into depth about various aspects of the subject matter, providing valuable insights and explanations that help viewers understand the key concepts being discussed.",
        chapters: [
          {
            title: "Introduction to " + query,
            summary: "Opening discussion about the main topic",
            start: 0,
            end: 45
          },
          {
            title: "Deep Dive Analysis",
            summary: "Detailed exploration of key concepts",
            start: 45,
            end: 120
          },
          {
            title: "Practical Applications",
            summary: "Real-world examples and use cases",
            start: 120,
            end: 180
          }
        ]
      },
      {
        transcription_id: "2",
        videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
        title: `Search Result for "${query}" - Video 2`,
        text: "This is another sample transcript for the second video result. It provides additional perspectives on the searched topic, offering complementary information that builds upon the first result. The discussion includes expert opinions and detailed analysis of the subject matter.",
        chapters: [
          {
            title: "Background Context",
            summary: "Historical perspective and background information",
            start: 0,
            end: 60
          },
          {
            title: "Current Trends",
            summary: "Latest developments and current state",
            start: 60,
            end: 150
          },
          {
            title: "Future Outlook",
            summary: "Predictions and future implications",
            start: 150,
            end: 210
          }
        ]
      }
    ],
    relatedContent: [
      {
        id: "related-1",
        title: "Related Topic A",
        snippet: "Brief description of related content that might interest you based on your search."
      },
      {
        id: "related-2", 
        title: "Related Topic B",
        snippet: "Another piece of related content that provides additional context to your search query."
      },
      {
        id: "related-3",
        title: "Related Topic C", 
        snippet: "Third related item that expands on themes from your original search results."
      }
    ]
  };
}