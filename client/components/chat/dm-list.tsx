'use client';

import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Search, Plus, MessageSquare } from 'lucide-react';
import type { Channel, User } from '@/lib/types';
import { AvatarWithStatus } from './avatar-with-status';
import { Button } from '@/components/ui/button';

interface DMListProps {
  conversations: Channel[];
  users: User[];
  activeConversation: string | null;
  onConversationSelect: (channelId: string) => void;
}

export function DMList({
  conversations,
  users,
  activeConversation,
  onConversationSelect,
}: DMListProps) {
  const getUserForDM = (dm: Channel, currentUserId: string = 'user-1') => {
    const otherUserId = dm.members.find(id => id !== currentUserId);
    return users.find(u => u.id === otherUserId);
  };

  return (
    <div className="flex h-full w-60 flex-col bg-sidebar">
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b border-sidebar-border px-4">
        <h2 className="text-sm font-semibold text-sidebar-foreground">
          Direct Messages
        </h2>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Find or start a conversation"
            className="h-9 w-full rounded-md bg-input pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Friends Section */}
      <div className="px-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-sm">Friends</span>
        </Button>
      </div>

      <div className="mx-4 my-2 h-px bg-border" />

      {/* DM Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Direct Messages
        </span>
        <Button variant="ghost" size="icon" className="h-5 w-5">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2">
        {conversations.map((dm) => {
          const user = getUserForDM(dm);
          if (!user) return null;

          return (
            <button
              key={dm.id}
              onClick={() => onConversationSelect(dm.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-2 py-2 transition-colors',
                activeConversation === dm.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <AvatarWithStatus user={user} size="sm" />
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-medium">
                    {user.displayName}
                  </span>
                  {dm.lastMessage && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(dm.lastMessage.timestamp), { addSuffix: false })}
                    </span>
                  )}
                </div>
                {dm.lastMessage && (
                  <p className="truncate text-xs text-muted-foreground">
                    {dm.lastMessage.content}
                  </p>
                )}
              </div>
              {dm.unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                  {dm.unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
