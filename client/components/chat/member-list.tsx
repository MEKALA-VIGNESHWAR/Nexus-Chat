'use client';

import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';
import { AvatarWithStatus } from './avatar-with-status';
import { Crown, Shield } from 'lucide-react';

interface MemberListProps {
  members: User[];
  ownerId?: string;
  className?: string;
}

export function MemberList({ members, ownerId, className }: MemberListProps) {
  const onlineMembers = members.filter(m => m.status === 'online' || m.status === 'busy' || m.status === 'away');
  const offlineMembers = members.filter(m => m.status === 'offline');

  return (
    <div className={cn('flex h-full w-60 flex-col bg-sidebar', className)}>
      <div className="flex-1 overflow-y-auto px-2 py-4">
        {/* Online Members */}
        <div className="mb-4">
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Online — {onlineMembers.length}
          </h3>
          <div className="space-y-0.5">
            {onlineMembers.map(member => (
              <MemberItem 
                key={member.id} 
                member={member} 
                isOwner={member.id === ownerId}
              />
            ))}
          </div>
        </div>

        {/* Offline Members */}
        {offlineMembers.length > 0 && (
          <div>
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Offline — {offlineMembers.length}
            </h3>
            <div className="space-y-0.5">
              {offlineMembers.map(member => (
                <MemberItem 
                  key={member.id} 
                  member={member}
                  isOwner={member.id === ownerId}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface MemberItemProps {
  member: User;
  isOwner?: boolean;
  isModerator?: boolean;
}

function MemberItem({ member, isOwner, isModerator }: MemberItemProps) {
  return (
    <button className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-sidebar-accent/50 group">
      <AvatarWithStatus 
        user={member} 
        size="sm" 
        className={cn(
          member.status === 'offline' && 'opacity-50'
        )}
      />
      <div className="flex flex-1 items-center gap-1.5 min-w-0">
        <span className={cn(
          'truncate text-sm',
          member.status === 'offline' 
            ? 'text-muted-foreground' 
            : 'text-sidebar-foreground'
        )}>
          {member.displayName}
        </span>
        {isOwner && (
          <Crown className="h-3.5 w-3.5 shrink-0 text-yellow-500" />
        )}
        {isModerator && !isOwner && (
          <Shield className="h-3.5 w-3.5 shrink-0 text-primary" />
        )}
      </div>
    </button>
  );
}
