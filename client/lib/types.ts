export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  bio: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: Date;
  createdAt: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  channelId: string;
  timestamp: Date;
  edited?: boolean;
  editedAt?: Date;
  replyTo?: string;
  reactions: Reaction[];
  attachments: Attachment[];
  pinned?: boolean;
  readBy: string[];
}

export interface Reaction {
  emoji: string;
  users: string[];
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  url: string;
  size: number;
  thumbnail?: string;
}

export interface Channel {
  id: string;
  name: string;
  type: 'dm' | 'group' | 'voice' | 'text';
  description?: string;
  icon?: string;
  members: string[];
  createdAt: Date;
  lastMessage?: Message;
  unreadCount: number;
  pinnedMessages: string[];
}

export interface Server {
  id: string;
  name: string;
  icon: string;
  ownerId: string;
  members: string[];
  channels: Channel[];
  createdAt: Date;
  description?: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface Notification {
  id: string;
  type: 'message' | 'mention' | 'friend_request' | 'system';
  title: string;
  content: string;
  read: boolean;
  createdAt: Date;
  link?: string;
  fromUserId?: string;
}

export interface VoiceParticipant {
  id: string;
  oderId: string;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  isScreenSharing: boolean;
  isCameraOn: boolean;
}

export interface VoiceRoom {
  id: string;
  name: string;
  serverId: string;
  participants: VoiceParticipant[];
  maxParticipants?: number;
}

export type Theme = 'light' | 'dark' | 'system';

export interface UserSettings {
  theme: Theme;
  notifications: {
    messages: boolean;
    mentions: boolean;
    friendRequests: boolean;
    sounds: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    allowDirectMessages: boolean;
    showReadReceipts: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
  };
}
