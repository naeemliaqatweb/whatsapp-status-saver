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
  appSource: WhatsAppType;
}

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
}

export interface StatusCounts {
  images: number;
  videos: number;
  saved: number;
  chats: number;
}
