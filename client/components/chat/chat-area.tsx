'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Hash, 
  Bell, 
  BellOff, 
  Pin, 
  Users, 
  Search,
  Phone,
  Video,
  Settings,
} from 'lucide-react';
import type { Message, User, Channel } from '@/lib/types';
import { MessageItem } from './message-item';
import { MessageInput } from './message-input';
import { Button } from '@/components/ui/button';
import { useChat } from '@/context/ChatContext';
import { useTyping } from '@/hooks/useTyping';

interface ChatAreaProps {
  channel: Channel;
  messages: Message[];
  users: User[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
}

export function ChatArea({
  channel,
  messages,
  users,
  currentUserId,
  onSendMessage,
  onReply,
  onReact,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { typingUsers } = useChat();
  const { handleTyping } = useTyping(channel.id);
  const typingUsernames = Object.values(typingUsers);

  const getUserById = (userId: string, msgSender?: any): User => {
    if (msgSender && typeof msgSender === 'object') {
      return {
        id: msgSender._id || msgSender.id || userId,
        username: msgSender.username || 'user',
        displayName: msgSender.displayName || msgSender.username || 'User',
        email: msgSender.email || '',
        avatar: msgSender.avatar || '',
        status: msgSender.status || 'offline',
        bio: msgSender.bio || '',
        createdAt: msgSender.createdAt || new Date(),
      };
    }
    const found = users.find(u => u.id === userId);
    if (found) return found;
    return {
      id: userId,
      username: 'user',
      displayName: 'User',
      email: '',
      avatar: '',
      status: 'offline' as const,
      bio: '',
      createdAt: new Date(),
    };
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Group messages by same sender within 5 minutes
  const shouldGroupMessage = (msg: Message, prevMsg?: Message) => {
    if (!prevMsg) return false;
    if (msg.senderId !== prevMsg.senderId) return false;
    const timeDiff = new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime();
    return timeDiff < 5 * 60 * 1000;
  };

  return (
    <div className="flex h-full flex-1 flex-col bg-background">
      {/* Channel Header */}
      <div className="flex h-12 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold text-foreground">{channel.name}</span>
          {channel.description && (
            <>
              <div className="h-4 w-px bg-border" />
              <span className="text-sm text-muted-foreground truncate max-w-xs">
                {channel.description}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pin className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Users className="h-4 w-4" />
          </Button>
          <div className="relative ml-2">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search"
              className="h-8 w-40 rounded-md bg-secondary pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Channel Welcome */}
        <div className="p-4 pb-6">
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Hash className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">Welcome to #{channel.name}!</h2>
          <p className="text-muted-foreground">
            This is the start of the #{channel.name} channel. {channel.description}
          </p>
        </div>

        {/* Messages */}
        <div className="pb-4">
          {messages.map((message, index) => (
            <MessageItem
              key={message.id}
              message={message}
              sender={getUserById(message.senderId, (message as any).sender)}
              currentUserId={currentUserId}
              isGrouped={shouldGroupMessage(message, messages[index - 1])}
              onReply={onReply}
              onReact={onReact}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Typing Indicator */}
      <div className="h-6 px-4 text-xs text-muted-foreground">
        {typingUsernames.length > 0 && (
          <span className="animate-pulse">
            {typingUsernames.join(', ')} {typingUsernames.length === 1 ? 'is' : 'are'} typing...
          </span>
        )}
      </div>

      {/* Message Input */}
      <MessageInput
        channelName={channel.name}
        onSend={onSendMessage}
        onTyping={handleTyping}
      />
    </div>
  );
}
