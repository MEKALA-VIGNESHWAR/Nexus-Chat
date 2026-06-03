'use client';

import { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  Monitor,
  MonitorOff,
  Maximize,
  Minimize,
  MoreVertical,
  Users,
  MessageSquare,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { sampleUsers } from '@/lib/sample-data';

interface VideoParticipant {
  id: string;
  user: typeof sampleUsers[0];
  isMuted: boolean;
  isCameraOn: boolean;
  isSpeaking: boolean;
  isPinned?: boolean;
}

export function VideoCall() {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pinnedUser, setPinnedUser] = useState<string | null>('user-2');
  const [showParticipants, setShowParticipants] = useState(true);

  const participants: VideoParticipant[] = [
    { id: 'user-2', user: sampleUsers[1], isMuted: false, isCameraOn: true, isSpeaking: true },
    { id: 'user-3', user: sampleUsers[2], isMuted: true, isCameraOn: true, isSpeaking: false },
    { id: 'user-4', user: sampleUsers[3], isMuted: false, isCameraOn: false, isSpeaking: false },
  ];

  const pinnedParticipant = participants.find(p => p.id === pinnedUser);
  const otherParticipants = participants.filter(p => p.id !== pinnedUser);

  return (
    <div className="flex h-screen bg-black">
      {/* Main Video Area */}
      <div className="relative flex flex-1 flex-col">
        {/* Pinned/Main Video */}
        <div className="relative flex-1">
          {pinnedParticipant && (
            <div className="absolute inset-0">
              {pinnedParticipant.isCameraOn ? (
                <div className="relative h-full w-full">
                  <img
                    src={pinnedParticipant.user.avatar}
                    alt={pinnedParticipant.user.displayName}
                    className="h-full w-full object-cover"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-secondary">
                  <img
                    src={pinnedParticipant.user.avatar}
                    alt={pinnedParticipant.user.displayName}
                    className="h-32 w-32 rounded-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
              )}
              
              {/* Name Overlay */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span className="rounded-md bg-black/60 px-2 py-1 text-sm font-medium text-white">
                  {pinnedParticipant.user.displayName}
                </span>
                {pinnedParticipant.isMuted && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60">
                    <MicOff className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
                {pinnedParticipant.isSpeaking && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-online">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Self View (Picture-in-Picture) */}
          <div className="absolute bottom-4 right-4 h-36 w-48 overflow-hidden rounded-xl border-2 border-white/20 shadow-xl">
            {isCameraOn ? (
              <img
                src={sampleUsers[0].avatar}
                alt="You"
                className="h-full w-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-secondary">
                <img
                  src={sampleUsers[0].avatar}
                  alt="You"
                  className="h-16 w-16 rounded-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>
            )}
            <div className="absolute bottom-2 left-2 flex items-center gap-1">
              <span className="rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">You</span>
              {isMuted && <MicOff className="h-3 w-3 text-white" />}
            </div>
          </div>

          {/* Top Controls */}
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>

          <div className="absolute right-4 top-4 flex items-center gap-2">
            <div className="rounded-full bg-black/40 px-3 py-1.5 text-sm text-white">
              12:34
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60"
              onClick={() => setShowParticipants(!showParticipants)}
            >
              <Users className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Participant Thumbnails */}
        <div className="flex gap-2 overflow-x-auto bg-black/80 p-3">
          {otherParticipants.map((participant) => (
            <button
              key={participant.id}
              onClick={() => setPinnedUser(participant.id)}
              className={cn(
                'relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg transition-all',
                pinnedUser === participant.id
                  ? 'ring-2 ring-primary'
                  : 'ring-1 ring-white/20 hover:ring-white/40'
              )}
            >
              {participant.isCameraOn ? (
                <img
                  src={participant.user.avatar}
                  alt={participant.user.displayName}
                  className="h-full w-full object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-secondary">
                  <img
                    src={participant.user.avatar}
                    alt={participant.user.displayName}
                    className="h-10 w-10 rounded-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
              )}
              <div className="absolute bottom-1 left-1 flex items-center gap-1">
                <span className="rounded bg-black/60 px-1 py-0.5 text-[10px] text-white truncate max-w-[80px]">
                  {participant.user.displayName.split(' ')[0]}
                </span>
                {participant.isMuted && <MicOff className="h-2.5 w-2.5 text-white" />}
              </div>
              {participant.isSpeaking && (
                <div className="absolute inset-0 rounded-lg ring-2 ring-online" />
              )}
            </button>
          ))}
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-center gap-3 bg-card/95 p-4 backdrop-blur">
          <Button
            variant={isMuted ? 'destructive' : 'secondary'}
            size="lg"
            className="h-12 w-12 rounded-full"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Button
            variant={!isCameraOn ? 'destructive' : 'secondary'}
            size="lg"
            className="h-12 w-12 rounded-full"
            onClick={() => setIsCameraOn(!isCameraOn)}
          >
            {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          <Button
            variant={isScreenSharing ? 'default' : 'secondary'}
            size="lg"
            className={cn(
              'h-12 w-12 rounded-full',
              isScreenSharing && 'nexus-gradient text-white'
            )}
            onClick={() => setIsScreenSharing(!isScreenSharing)}
          >
            {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="h-12 w-12 rounded-full"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="h-12 w-12 rounded-full"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
          <div className="mx-2 h-8 w-px bg-border" />
          <Button
            variant="destructive"
            size="lg"
            className="h-12 rounded-full px-6"
          >
            <PhoneOff className="mr-2 h-5 w-5" />
            Leave
          </Button>
        </div>
      </div>

      {/* Participants Sidebar */}
      {showParticipants && (
        <div className="w-72 border-l border-border bg-card">
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <h2 className="font-semibold text-foreground">Participants</h2>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
              {participants.length + 1}
            </span>
          </div>
          <div className="p-3 space-y-2">
            {/* Current User */}
            <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-2">
              <div className="relative">
                <img
                  src={sampleUsers[0].avatar}
                  alt="You"
                  className="h-10 w-10 rounded-full object-cover"
                  crossOrigin="anonymous"
                />
                {!isCameraOn && (
                  <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive">
                    <VideoOff className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  You (Host)
                </p>
              </div>
              <div className="flex items-center gap-1">
                {isMuted && <MicOff className="h-4 w-4 text-muted-foreground" />}
              </div>
            </div>

            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-secondary/30">
                <div className="relative">
                  <img
                    src={participant.user.avatar}
                    alt={participant.user.displayName}
                    className="h-10 w-10 rounded-full object-cover"
                    crossOrigin="anonymous"
                  />
                  {!participant.isCameraOn && (
                    <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive">
                      <VideoOff className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {participant.user.displayName}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {participant.isMuted && <MicOff className="h-4 w-4 text-muted-foreground" />}
                  {participant.isSpeaking && (
                    <div className="h-2 w-2 rounded-full bg-online animate-pulse" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
