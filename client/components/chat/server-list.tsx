'use client';

import { cn } from '@/lib/utils';
import { Plus, Compass } from 'lucide-react';
import type { Server } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface ServerListProps {
  servers: Server[];
  activeServer: string | null;
  onServerSelect: (serverId: string) => void;
  onHomeClick: () => void;
  isHome: boolean;
}

export function ServerList({
  servers,
  activeServer,
  onServerSelect,
  onHomeClick,
  isHome,
}: ServerListProps) {
  return (
    <div className="flex h-full w-[72px] flex-col items-center gap-2 bg-sidebar py-3">
      {/* Home / DMs Button */}
      <ServerIcon
        active={isHome}
        onClick={onHomeClick}
        className="nexus-gradient"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </ServerIcon>

      <div className="mx-3 h-0.5 w-8 rounded-full bg-border" />

      {/* Server List */}
      <div className="flex flex-1 flex-col items-center gap-2 overflow-y-auto scrollbar-thin">
        {servers.map((server) => (
          <ServerIcon
            key={server.id}
            active={activeServer === server.id}
            onClick={() => onServerSelect(server.id)}
            hasNotification={server.channels.some((c) => c.unreadCount > 0)}
          >
            {server.icon.length === 1 ? (
              <span className="text-lg font-semibold">{server.icon}</span>
            ) : (
              <img
                src={server.icon}
                alt={server.name}
                className="h-full w-full object-cover"
                crossOrigin="anonymous"
              />
            )}
          </ServerIcon>
        ))}
      </div>

      <div className="mx-3 h-0.5 w-8 rounded-full bg-border" />

      {/* Add Server */}
      <ServerIcon onClick={() => {}}>
        <Plus className="h-5 w-5 text-green-500" />
      </ServerIcon>

      {/* Explore */}
      <ServerIcon onClick={() => {}}>
        <Compass className="h-5 w-5 text-green-500" />
      </ServerIcon>
    </div>
  );
}

interface ServerIconProps {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  hasNotification?: boolean;
  className?: string;
}

function ServerIcon({
  children,
  active = false,
  onClick,
  hasNotification = false,
  className,
}: ServerIconProps) {
  return (
    <div className="group relative">
      {/* Active Indicator */}
      <div
        className={cn(
          'absolute -left-3 top-1/2 h-2 w-1 -translate-y-1/2 rounded-r-full bg-foreground transition-all',
          active ? 'h-10' : hasNotification ? 'h-2' : 'h-0 group-hover:h-5'
        )}
      />

      <Button
        variant="ghost"
        onClick={onClick}
        className={cn(
          'relative h-12 w-12 overflow-hidden p-0 transition-all duration-200',
          active ? 'rounded-2xl' : 'rounded-3xl hover:rounded-2xl',
          active ? 'bg-primary text-primary-foreground' : 'bg-secondary',
          className
        )}
      >
        {children}
      </Button>
    </div>
  );
}
