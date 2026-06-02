import React from 'react';
import { Mic, MicOff, Volume2, VolumeX, PhoneOff } from 'lucide-react';
import Button from '../common/Button';

export default function VoiceControls({
  isMuted,
  onToggleMute,
  isDeafened,
  onToggleDeafen,
  onDisconnect,
}) {
  return (
    <div className="flex items-center justify-center gap-4 px-6 py-4 bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-md">
      {/* Mute Button */}
      <button
        onClick={onToggleMute}
        className={`p-3.5 rounded-xl border transition-all duration-200 ${
          isMuted
            ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30'
            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
        }`}
        title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
      >
        {isMuted ? <MicOff className="w-5.5 h-5.5" /> : <Mic className="w-5.5 h-5.5" />}
      </button>

      {/* Deafen Button */}
      <button
        onClick={onToggleDeafen}
        className={`p-3.5 rounded-xl border transition-all duration-200 ${
          isDeafened
            ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30'
            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
        }`}
        title={isDeafened ? 'Undeafen Audio' : 'Deafen Audio'}
      >
        {isDeafened ? <VolumeX className="w-5.5 h-5.5" /> : <Volume2 className="w-5.5 h-5.5" />}
      </button>

      {/* Disconnect Button */}
      <button
        onClick={onDisconnect}
        className="p-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white border border-red-500/20 transition-all duration-200 shadow-lg shadow-red-600/20 active:scale-95"
        title="Leave Voice Room"
      >
        <PhoneOff className="w-5.5 h-5.5" />
      </button>
    </div>
  );
}
