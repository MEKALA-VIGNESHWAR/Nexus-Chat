import React, { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useVoice } from '../hooks/useVoice';
import { Mic, MicOff, PhoneCall, ArrowLeft, Loader2, VolumeX, User, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/common/Avatar';
import VoiceRoom from '../components/voice/VoiceRoom';
import VoiceControls from '../components/voice/VoiceControls';

export default function VoicePage() {
  const { rooms, loadingRooms, fetchRooms } = useChat();
  const navigate = useNavigate();
  const [activeVoiceRoomId, setActiveVoiceRoomId] = useState(null);
  const [activeRoomName, setActiveRoomName] = useState('');
  const [isDeafened, setIsDeafened] = useState(false);

  // Initialize the voice hook
  const {
    peers,
    localStream,
    isMuted,
    inVoiceRoom,
    error: voiceError,
    joinVoiceRoom,
    leaveVoiceRoom,
    toggleMute,
  } = useVoice(activeVoiceRoomId);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Handle joining a voice room
  const handleJoin = async (roomId, name) => {
    setActiveVoiceRoomId(roomId);
    setActiveRoomName(name);
  };

  // Trigger joining when room ID changes
  useEffect(() => {
    if (activeVoiceRoomId) {
      joinVoiceRoom();
    }
  }, [activeVoiceRoomId, joinVoiceRoom]);

  // Disconnect from voice
  const handleDisconnect = () => {
    leaveVoiceRoom();
    setActiveVoiceRoomId(null);
    setActiveRoomName('');
  };

  // Toggle local deafen state
  const handleToggleDeafen = () => {
    setIsDeafened((prev) => !prev);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-900 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (inVoiceRoom) {
                handleDisconnect();
              }
              navigate('/');
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Voice Channels</h1>
            <p className="text-xs text-slate-500">Join real-time WebRTC group voice calls</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        {inVoiceRoom ? (
          /* Active Voice Call interface */
          <div className="w-full max-w-4xl flex flex-col h-full gap-6">
            <div className="flex-1 min-h-[400px]">
              <VoiceRoom
                roomName={activeRoomName}
                peers={peers}
                localStream={localStream}
                isMuted={isMuted}
                isDeafened={isDeafened}
              />
            </div>
            
            {voiceError && (
              <div className="text-xs text-center text-rose-400 bg-rose-500/10 border border-rose-500/20 py-2.5 px-4 rounded-xl">
                {voiceError}
              </div>
            )}

            <div className="flex justify-center mb-6">
              <VoiceControls
                isMuted={isMuted}
                onToggleMute={toggleMute}
                isDeafened={isDeafened}
                onToggleDeafen={handleToggleDeafen}
                onDisconnect={handleDisconnect}
              />
            </div>
          </div>
        ) : (
          /* Directory of voice rooms available */
          <div className="w-full max-w-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-md font-semibold tracking-wide uppercase text-slate-400">
                Available Conversations
              </h2>
            </div>

            {loadingRooms ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
                <p className="text-sm text-slate-500">Fetching channels...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/30 border border-slate-900 rounded-2xl">
                <Headphones className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No rooms available</p>
                <p className="text-xs text-slate-600 mt-1">Create a chat or group conversation to start a call</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {rooms.map((room) => {
                  const isGroup = room.type === 'group';
                  const roomName = isGroup
                    ? room.name
                    : room.members?.find((m) => m.user?.username)?.user?.username || 'Direct Call';
                  
                  return (
                    <div
                      key={room._id}
                      className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-900/80 rounded-2xl hover:border-slate-800 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={isGroup ? room.avatar?.url : null}
                          alt={roomName}
                          size="md"
                        />
                        <div>
                          <h3 className="text-sm font-semibold text-slate-200">{roomName}</h3>
                          <p className="text-xs text-slate-500 mt-0.5 capitalize">
                            {room.type} Room • {room.members?.length || 0} members
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleJoin(room._id, roomName)}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all duration-300 active:scale-95 shadow-lg shadow-indigo-600/5"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        Join Call
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
