'use client';

import { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Headphones, 
  HeadphoneOff,
  Phone,
  PhoneOff,
  Monitor,
  Settings,
  Users,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { sampleUsers, sampleVoiceRooms } from '@/lib/sample-data';

export function VoiceRoom() {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  const room = sampleVoiceRooms[0];
  const participants = room.participants.map(p => ({
    ...p,
    user: sampleUsers.find(u => u.id === p.oderId),
  })).filter(p => p.user);

  return (
    <div className="flex h-screen bg-background">
      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-3">
            <Volume2 className="h-5 w-5 text-online" />
            <div>
              <h1 className="font-semibold text-foreground">{room.name}</h1>
              <p className="text-xs text-muted-foreground">
                {participants.length} participant{participants.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Users className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Participants Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className={cn(
                  'relative flex flex-col items-center justify-center rounded-xl border p-6 transition-all',
                  participant.isSpeaking
                    ? 'border-online bg-online/10 ring-2 ring-online/50'
                    : 'border-border bg-card'
                )}
              >
                {/* Avatar */}
                <div className="relative mb-4">
                  <img
                    src={participant.user!.avatar}
                    alt={participant.user!.displayName}
                    className={cn(
                      'h-20 w-20 rounded-full object-cover',
                      participant.isMuted && 'opacity-50'
                    )}
                    crossOrigin="anonymous"
                  />
                  {participant.isSpeaking && (
                    <div className="absolute inset-0 animate-pulse rounded-full ring-4 ring-online/30" />
                  )}
                </div>

                {/* Name */}
                <p className="font-medium text-foreground">
                  {participant.user!.displayName}
                </p>

                {/* Status Icons */}
                <div className="mt-2 flex items-center gap-2">
                  {participant.isMuted && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/20">
                      <MicOff className="h-3.5 w-3.5 text-destructive" />
                    </div>
                  )}
                  {participant.isDeafened && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/20">
                      <HeadphoneOff className="h-3.5 w-3.5 text-destructive" />
                    </div>
                  )}
                  {participant.isScreenSharing && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                      <Monitor className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add current user */}
            <div
              className={cn(
                'relative flex flex-col items-center justify-center rounded-xl border p-6 transition-all',
                'border-primary bg-primary/5 ring-2 ring-primary/30'
              )}
            >
              <div className="relative mb-4">
                <img
                  src={sampleUsers[0].avatar}
                  alt={sampleUsers[0].displayName}
                  className={cn(
                    'h-20 w-20 rounded-full object-cover',
                    isMuted && 'opacity-50'
                  )}
                  crossOrigin="anonymous"
                />
              </div>
              <p className="font-medium text-foreground">
                {sampleUsers[0].displayName}
                <span className="ml-1 text-xs text-muted-foreground">(You)</span>
              </p>
              <div className="mt-2 flex items-center gap-2">
                {isMuted && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/20">
                    <MicOff className="h-3.5 w-3.5 text-destructive" />
                  </div>
                )}
                {isDeafened && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/20">
                    <HeadphoneOff className="h-3.5 w-3.5 text-destructive" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="border-t border-border bg-card p-4">
          <div className="flex items-center justify-center gap-3">
            <Button
              variant={isMuted ? 'destructive' : 'secondary'}
              size="lg"
              className="h-12 w-12 rounded-full"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button
              variant={isDeafened ? 'destructive' : 'secondary'}
              size="lg"
              className="h-12 w-12 rounded-full"
              onClick={() => setIsDeafened(!isDeafened)}
            >
              {isDeafened ? <HeadphoneOff className="h-5 w-5" /> : <Headphones className="h-5 w-5" />}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="h-12 w-12 rounded-full"
            >
              <Monitor className="h-5 w-5" />
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="h-12 rounded-full px-6"
              onClick={() => setIsConnected(false)}
            >
              <PhoneOff className="mr-2 h-5 w-5" />
              Leave
            </Button>
          </div>
        </div>
      </div>

      {/* Participants Sidebar */}
      <div className="hidden w-64 border-l border-border bg-sidebar lg:block">
        <div className="p-4">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
            IN VOICE — {participants.length + 1}
          </h2>
          <div className="space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-3 rounded-lg px-2 py-1.5"
              >
                <div className="relative">
                  <img
                    src={participant.user!.avatar}
                    alt={participant.user!.displayName}
                    className="h-8 w-8 rounded-full object-cover"
                    crossOrigin="anonymous"
                  />
                  {participant.isSpeaking && (
                    <div className="absolute inset-0 rounded-full ring-2 ring-online" />
                  )}
                </div>
                <span className="flex-1 truncate text-sm text-foreground">
                  {participant.user!.displayName}
                </span>
                <div className="flex items-center gap-1">
                  {participant.isMuted && <MicOff className="h-3.5 w-3.5 text-destructive" />}
                  {participant.isScreenSharing && <Monitor className="h-3.5 w-3.5 text-primary" />}
                </div>
              </div>
            ))}
            {/* Current User */}
            <div className="flex items-center gap-3 rounded-lg bg-secondary/50 px-2 py-1.5">
              <img
                src={sampleUsers[0].avatar}
                alt={sampleUsers[0].displayName}
                className="h-8 w-8 rounded-full object-cover"
                crossOrigin="anonymous"
              />
              <span className="flex-1 truncate text-sm text-foreground">
                {sampleUsers[0].displayName}
              </span>
              {isMuted && <MicOff className="h-3.5 w-3.5 text-destructive" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
