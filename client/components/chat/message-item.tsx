'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { 
  MoreHorizontal, 
  Reply, 
  Smile, 
  Pin, 
  Pencil, 
  Trash2,
  Check,
  CheckCheck,
} from 'lucide-react';
import type { Message, User } from '@/lib/types';
import { AvatarWithStatus } from './avatar-with-status';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MessageItemProps {
  message: Message;
  sender: User;
  currentUserId: string;
  isGrouped?: boolean;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onPin?: (messageId: string) => void;
}

export function MessageItem({
  message,
  sender,
  currentUserId,
  isGrouped = false,
  onReply,
  onReact,
  onEdit,
  onDelete,
  onPin,
}: MessageItemProps) {
  const [showActions, setShowActions] = useState(false);
  const isOwn = message.senderId === currentUserId;
  const isRead = message.readBy.length > 0;

  return (
    <div
      className={cn(
        'group relative flex gap-4 px-4 py-0.5 hover:bg-secondary/30 transition-colors',
        isGrouped ? 'mt-0' : 'mt-4'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar or Timestamp */}
      <div className="w-10 shrink-0">
        {!isGrouped ? (
          <AvatarWithStatus user={sender} size="md" showStatus={false} />
        ) : (
          <span className="hidden text-xs text-muted-foreground group-hover:block">
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {!isGrouped && (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground hover:underline cursor-pointer">
              {sender.displayName}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
            </span>
            {message.edited && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
            {message.pinned && (
              <Pin className="h-3 w-3 text-primary" />
            )}
          </div>
        )}

        <div className="text-sm text-foreground/90 break-words whitespace-pre-wrap">
          {message.content}
        </div>

        {/* Attachments */}
        {message.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.attachments.map((attachment) => (
              <div key={attachment.id} className="overflow-hidden rounded-lg">
                {attachment.type === 'image' ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="max-h-80 max-w-md rounded-lg object-cover"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
                    <span className="text-sm">{attachment.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reactions */}
        {message.reactions.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {message.reactions.map((reaction, idx) => (
              <button
                key={idx}
                className={cn(
                  'flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm transition-colors',
                  reaction.users.includes(currentUserId)
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-secondary hover:bg-secondary/80'
                )}
                onClick={() => onReact?.(message.id, reaction.emoji)}
              >
                <span>{reaction.emoji}</span>
                <span className="text-xs">{reaction.users.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Read Receipt */}
        {isOwn && (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            {isRead ? (
              <>
                <CheckCheck className="h-3 w-3 text-primary" />
                <span>Read</span>
              </>
            ) : (
              <>
                <Check className="h-3 w-3" />
                <span>Sent</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="absolute -top-3 right-4 flex items-center gap-0.5 rounded-lg border border-border bg-card p-0.5 shadow-lg animate-fade-in">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onReact?.(message.id, '👍')}
          >
            <Smile className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onReply?.(message.id)}
          >
            <Reply className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onPin?.(message.id)}>
                <Pin className="mr-2 h-4 w-4" />
                {message.pinned ? 'Unpin Message' : 'Pin Message'}
              </DropdownMenuItem>
              {isOwn && (
                <>
                  <DropdownMenuItem onClick={() => onEdit?.(message.id)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Message
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(message.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Message
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
