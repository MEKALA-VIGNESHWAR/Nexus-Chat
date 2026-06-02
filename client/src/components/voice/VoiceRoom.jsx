import React, { useEffect, useRef } from 'react';
import { MicOff, VolumeX, User } from 'lucide-react';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';

// Simple sub-component to render and play a peer's audio stream
function RemotePeerAudio({ peer, isDeafened }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current && peer.stream) {
      audioRef.current.srcObject = peer.stream;
    }
  }, [peer.stream]);

  return (
    <audio
      ref={audioRef}
      autoPlay
      playsInline
      muted={isDeafened || peer.isMuted}
      className="hidden"
    />
  );
}

export default function VoiceRoom({
  roomName,
  peers = [],
  localStream,
  isMuted,
  isDeafened,
}) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full bg-slate-950 p-6 rounded-2xl border border-slate-900 shadow-inner">
      {/* Voice Channel Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md">
            Voice Connected
          </span>
          <h2 className="text-xl font-bold text-slate-100 mt-2">{roomName || 'Voice Lobby'}</h2>
        </div>
        <div className="text-xs text-slate-400 font-medium bg-slate-900 border border-slate-800/80 px-3 py-1.5 rounded-lg">
          {peers.length + 1} {peers.length === 0 ? 'Participant' : 'Participants'}
        </div>
      </div>

      {/* Grid of Users */}
      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max overflow-y-auto pr-1 custom-scrollbar">
        {/* Local User */}
        <div className="flex flex-col items-center justify-center p-5 bg-slate-900/60 border border-slate-800 rounded-2xl relative group overflow-hidden transition-all duration-300 hover:border-indigo-500/30">
          <div className={`relative p-1 rounded-full border-2 transition-all duration-300 ${
            !isMuted ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' : 'border-transparent'
          }`}>
            <Avatar
              src={user?.avatar?.url}
              alt={user?.username}
              size="lg"
            />
            {isMuted && (
              <span className="absolute bottom-0 right-0 bg-rose-500 text-white p-1 rounded-full ring-2 ring-slate-900">
                <MicOff className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <span className="text-sm font-semibold text-slate-200 mt-3 truncate w-full text-center">
            {user?.username} (You)
          </span>
          <span className="text-[10px] text-slate-500 font-medium">Local Stream</span>
        </div>

        {/* Remote Peers */}
        {peers.map((peer) => {
          // Play the remote peer's stream
          return (
            <div
              key={peer.socketId || peer.userId}
              className="flex flex-col items-center justify-center p-5 bg-slate-900/60 border border-slate-800 rounded-2xl relative group overflow-hidden transition-all duration-300 hover:border-indigo-500/30"
            >
              <RemotePeerAudio peer={peer} isDeafened={isDeafened} />
              
              <div className={`relative p-1 rounded-full border-2 transition-all duration-300 ${
                peer.stream && !peer.isMuted && !isDeafened
                  ? 'border-indigo-500 shadow-lg shadow-indigo-500/10 animate-pulse'
                  : 'border-transparent'
              }`}>
                <Avatar
                  src={peer.avatar?.url || peer.avatar}
                  alt={peer.username}
                  size="lg"
                />
                {(peer.isMuted || isDeafened) && (
                  <span className="absolute bottom-0 right-0 bg-rose-500 text-white p-1 rounded-full ring-2 ring-slate-900">
                    {isDeafened ? (
                      <VolumeX className="w-3.5 h-3.5" />
                    ) : (
                      <MicOff className="w-3.5 h-3.5" />
                    )}
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold text-slate-200 mt-3 truncate w-full text-center">
                {peer.username}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {peer.stream ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
