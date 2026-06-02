import React, { useState } from 'react';
import { MessageCircle, Users, Mic, Plus, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import Avatar from '../common/Avatar';
import ChatList from '../chat/ChatList';
import CreateRoomModal from '../rooms/CreateRoomModal';

export default function Sidebar({ activeTab, onTabChange, onOpenProfile, className = '' }) {
  const { user, logout } = useAuth();
  const { rooms } = useChat();
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  const tabs = [
    { id: 'chat', label: 'Chats', icon: MessageCircle, count: rooms.length },
    { id: 'voice', label: 'Voice', icon: Mic },
    { id: 'users', label: 'Users', icon: Users },
  ];

  return (
    <>
      <aside className={`flex flex-col h-full bg-chat-sidebar border-r border-slate-800/60 ${className}`} id="sidebar">
        {/* Brand header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-shimmer">NexusChat</h1>
          </div>
          <button
            onClick={() => setShowCreateRoom(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800/60 transition-all duration-200"
            title="New conversation"
            id="new-conversation-btn"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation tabs */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-800/30">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-indigo-600/20 text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
              }`}
              id={`tab-${tab.id}`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-slate-700/60 text-slate-400">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Chat list (conversations) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'chat' && <ChatList />}
          {activeTab === 'voice' && (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <Mic className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-sm text-slate-500">Voice rooms coming soon</p>
              <p className="text-xs text-slate-600 mt-1">Join or create a voice channel</p>
            </div>
          )}
          {activeTab === 'users' && (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <Users className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-sm text-slate-500">Discover users</p>
              <p className="text-xs text-slate-600 mt-1">Use the + button to find people</p>
            </div>
          )}
        </div>

        {/* User profile footer */}
        <div className="flex items-center gap-3 px-4 py-3 border-t border-slate-800/40 bg-slate-950/30">
          <Avatar
            src={user?.avatar?.url}
            alt={user?.username || 'User'}
            size="sm"
            status="online"
            onClick={onOpenProfile}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.username}</p>
            <p className="text-xs text-slate-500 truncate">Online</p>
          </div>
          <button
            onClick={onOpenProfile}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors"
            title="Settings"
            id="settings-btn"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800/60 transition-colors"
            title="Logout"
            id="logout-btn"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      <CreateRoomModal
        isOpen={showCreateRoom}
        onClose={() => setShowCreateRoom(false)}
      />
    </>
  );
}
