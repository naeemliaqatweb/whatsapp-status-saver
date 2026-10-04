export type WhatsAppType = 'whatsapp' | 'business';

export type MediaType = 'image' | 'video';

export type TabType = 'images' | 'videos' | 'saved';

export interface StatusMediaItem {
  id: string;
  type: MediaType;
  uri: string;
  thumbnailUri?: string;
  fileName: string;
  filePath: string;
  timeAgo: string;
  timestamp: number;
  sizeBytes?: number;
  isSaved: boolean;
  appSource: WhatsAppType; // 'whatsapp' or 'business'
}

export interface StatusCounts {
  images: number;
  videos: number;
  saved: number;
}
