'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Hash, 
  Volume2, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  Plus,
  Lock,
} from 'lucide-react';
import type { Server, Channel } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface ServerSidebarProps {
  server: Server;
  activeChannel: string;
  onChannelSelect: (channelId: string) => void;
}

export function ServerSidebar({ server, activeChannel, onChannelSelect }: ServerSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    text: true,
    voice: true,
  });

  const textChannels = server.channels.filter(c => c.type === 'text');
  const voiceChannels = server.channels.filter(c => c.type === 'voice');

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div className="flex h-full w-60 flex-col bg-sidebar">
      {/* Server Header */}
      <div className="flex h-12 items-center justify-between border-b border-sidebar-border px-4">
        <h2 className="truncate text-sm font-semibold text-sidebar-foreground">
          {server.name}
        </h2>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {/* Text Channels */}
        <ChannelCategory
          title="Text Channels"
          expanded={expandedCategories.text}
          onToggle={() => toggleCategory('text')}
        >
          {textChannels.map(channel => (
            <ChannelItem
              key={channel.id}
              channel={channel}
              active={activeChannel === channel.id}
              onClick={() => onChannelSelect(channel.id)}
            />
          ))}
        </ChannelCategory>

        {/* Voice Channels */}
        <ChannelCategory
          title="Voice Channels"
          expanded={expandedCategories.voice}
          onToggle={() => toggleCategory('voice')}
        >
          {voiceChannels.map(channel => (
            <ChannelItem
              key={channel.id}
              channel={channel}
              active={activeChannel === channel.id}
              onClick={() => onChannelSelect(channel.id)}
            />
          ))}
        </ChannelCategory>
      </div>

      {/* User Panel */}
      <div className="border-t border-sidebar-border p-2">
        <div className="flex items-center justify-between rounded-md bg-sidebar-accent/50 p-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary" />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-sidebar-foreground">John Doe</span>
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ChannelCategoryProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function ChannelCategory({ title, expanded, onToggle, children }: ChannelCategoryProps) {
  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-1 px-1 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {title}
        <Plus className="ml-auto h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
      {expanded && <div className="mt-1 space-y-0.5">{children}</div>}
    </div>
  );
}

interface ChannelItemProps {
  channel: Channel;
  active: boolean;
  onClick: () => void;
}

function ChannelItem({ channel, active, onClick }: ChannelItemProps) {
  const Icon = channel.type === 'voice' ? Volume2 : Hash;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{channel.name}</span>
      {channel.unreadCount > 0 && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
          {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
        </span>
      )}
    </button>
  );
}
