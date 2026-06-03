'use client';

import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';

interface AvatarWithStatusProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const statusSizeClasses = {
  sm: 'h-2.5 w-2.5 border',
  md: 'h-3 w-3 border-2',
  lg: 'h-3.5 w-3.5 border-2',
  xl: 'h-4 w-4 border-2',
};

const statusColors = {
  online: 'bg-online',
  away: 'bg-away',
  busy: 'bg-busy',
  offline: 'bg-offline',
};

export function AvatarWithStatus({
  user,
  size = 'md',
  showStatus = true,
  className,
}: AvatarWithStatusProps) {
  return (
    <div className={cn('relative inline-block', className)}>
      <img
        src={user.avatar}
        alt={user.displayName}
        className={cn(
          sizeClasses[size],
          'rounded-full object-cover ring-2 ring-background'
        )}
        crossOrigin="anonymous"
      />
      {showStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-background',
            statusSizeClasses[size],
            statusColors[user.status]
          )}
          title={user.status}
        />
      )}
    </div>
  );
}
