export type WhatsAppType = 'whatsapp' | 'business';

export type MediaType = 'image' | 'video';

export type TabType = 'images' | 'videos' | 'saved' | 'chats';

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

export type RecoveredMediaType = 'voice' | 'audio' | 'image' | 'video' | 'document' | null;

export interface RecoveredChat {
  id: string;
  senderName: string;
  packageName: string;
  appType: WhatsAppType;
  lastMessage: string;
  timestamp: number;
  timeAgo: string;
  isDeleted: boolean;
  totalMessages: number;
  deletedCount: number;
  mediaType?: RecoveredMediaType;
}

export interface RecoveredMessage {
  id: string;
  senderName: string;
  text: string;
  timestamp: number;
  timeAgo: string;
  timeFormatted: string;
  isDeleted: boolean;
  appType: WhatsAppType;
  mediaType?: RecoveredMediaType;
  mediaUri?: string | null;
  mediaDuration?: number; // duration in seconds
  mediaSize?: number; // bytes
}

export interface StatusCounts {
  images: number;
  videos: number;
  saved: number;
  chats: number;
}
