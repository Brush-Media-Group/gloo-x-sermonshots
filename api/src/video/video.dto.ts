export interface VideoListResponse {
  items: VideoItem[];
  total: number;
}

export interface VideoItem {
  id: number;
  owner: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  url: string;
  status: string;
  format: string;
  source: string;
  metadata: {
    done: boolean;
    progressPercent: number;
    duration: number;
  };
  transcriptionOptions: {
    automaticLanguageDetection: boolean;
    language: string;
  };
  audio: MediaFile;
  preview: MediaFile;
  file: MediaFile;
}

export interface MediaFile {
  id: number;
  remoteUrl: string;
  publicUrl: string;
  cloudLocation: string;
  isRemoved: boolean;
  owner: string;
  createdAt: string;
  lastUsed: string;
  deletedAt: string;
  type: string;
  fileLocation: string;
}

export class VideoTranscribeDto {
  accessToken: string;
  page: number;
  limit: number;
}

export interface VideoCsvRecord {
  user_id: string;
  title: string;
  video_url: string;
  video_thumbnail_url: string;
  createdAt: string;
}
