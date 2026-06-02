import React, { useState } from 'react';
import { Menu, Phone, Search, Sun, Moon, Users, Bell } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../common/Avatar';
import NotificationPanel from './NotificationPanel';
import { ROOM_TYPES } from '../../utils/constants';

export default function Header({ onToggleSidebar, onToggleProfile }) {
  const { activeRoom, typingUsers, onlineUsers, unreadNotificationsCount } = useChat();
  const { isDark, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  if (!activeRoom) {
    return (
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800/40 glass-panel" id="chat-header">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors lg:hidden"
          id="toggle-sidebar-btn"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-slate-500">Select a conversation to start chatting</p>
        </div>
        <div className="flex items-center gap-1 relative">
          {/* Notification Bell */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors relative ${
              showNotifications ? 'bg-slate-800 text-slate-200' : ''
            }`}
            title="Notifications"
            id="notification-bell-btn"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            )}
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            id="theme-toggle-btn"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
        </div>
      </header>
    );
  }

  // Determine display name based on room type
  const isGroup = activeRoom.type === ROOM_TYPES.GROUP;
  const roomName = isGroup
    ? activeRoom.name
    : activeRoom.members?.find((m) => m.user?.username)?.user?.username || 'Chat';

  // Build typing indicator text
  const typingNames = Object.values(typingUsers);
  let typingText = '';
  if (typingNames.length === 1) {
    typingText = `${typingNames[0]} is typing...`;
  } else if (typingNames.length > 1) {
    typingText = `${typingNames.length} people are typing...`;
  }

  // Count online members in this room
  const onlineMemberCount = activeRoom.members?.filter(
    (m) => onlineUsers.has(m.user?._id)
  ).length || 0;

  return (
    <header className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-slate-800/40 glass-panel" id="chat-header">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors lg:hidden"
          id="toggle-sidebar-btn"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Room avatar */}
        <Avatar
          src={isGroup ? activeRoom.avatar?.url : null}
          alt={roomName}
          size="md"
          status={!isGroup && onlineMemberCount > 0 ? 'online' : null}
        />

        {/* Room info */}
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-100 truncate">{roomName}</h2>
          {typingText ? (
            <p className="text-xs text-indigo-400 truncate animate-pulse">{typingText}</p>
          ) : (
            <p className="text-xs text-slate-500 truncate">
              {isGroup
                ? `${activeRoom.members?.length || 0} members • ${onlineMemberCount} online`
                : onlineMemberCount > 0
                  ? 'Online'
                  : 'Offline'}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 relative">
        <button
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          title="Search messages"
          id="search-messages-btn"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          title="Voice call"
          id="voice-call-btn"
        >
          <Phone className="w-4 h-4" />
        </button>
        {isGroup && (
          <button
            onClick={onToggleProfile}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
            title="Members"
            id="members-btn"
          >
            <Users className="w-4 h-4" />
          </button>
        )}

        {/* Notification Bell */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={`p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors relative ${
            showNotifications ? 'bg-slate-800 text-slate-200' : ''
          }`}
          title="Notifications"
          id="notification-bell-btn"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          )}
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          id="theme-toggle-btn"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
      </div>
    </header>
  );
}
