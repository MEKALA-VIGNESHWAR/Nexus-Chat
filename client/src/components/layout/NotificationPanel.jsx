import React, { useRef, useEffect } from 'react';
import { Bell, CheckCheck, X, MessageSquare } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import Avatar from '../common/Avatar';
import { formatMessageTime } from '../../utils/formatDate';

export default function NotificationPanel({ isOpen, onClose }) {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    rooms,
    selectRoom,
  } = useChat();

  const panelRef = useRef(null);

  // Close when clicking outside the panel
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        // Only close if we didn't click the bell button itself
        if (!event.target.closest('#notification-bell-btn')) {
          onClose();
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNotificationClick = async (n) => {
    // Mark as read
    if (!n.read) {
      await markNotificationAsRead(n._id || n.id);
    }

    // Navigate to room
    if (n.data?.room) {
      const room = rooms.find((r) => r._id === n.data.room);
      if (room) {
        selectRoom(room);
      }
    }
    onClose();
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-14 w-80 sm:w-96 max-h-[480px] flex flex-col glass-panel border border-slate-800 rounded-xl shadow-glass z-50 overflow-hidden transform scale-100 transition-all animate-fade-in"
      id="notification-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/40 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-bold text-slate-200">Notifications</span>
          {unreadNotificationsCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-600 text-white">
              {unreadNotificationsCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadNotificationsCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
              title="Mark all as read"
              id="mark-all-read-btn"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            id="close-notifications-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-800/30">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <Bell className="w-8 h-8 text-slate-700 mb-2" />
            <p className="text-sm text-slate-400 font-medium">All caught up!</p>
            <p className="text-xs text-slate-600 mt-0.5">No new notifications</p>
          </div>
        ) : (
          notifications.map((n) => {
            const sender = n.data?.sender;
            return (
              <div
                key={n._id || n.id}
                onClick={() => handleNotificationClick(n)}
                className={`flex gap-3 p-3.5 hover:bg-slate-800/40 cursor-pointer transition-colors ${
                  !n.read ? 'bg-indigo-600/[0.04]' : ''
                }`}
              >
                {/* Icon or Avatar */}
                <div className="flex-shrink-0 relative">
                  {sender ? (
                    <Avatar
                      src={sender.avatar?.url}
                      alt={sender.username}
                      size="sm"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                  {!n.read && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-2 ring-slate-900" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs ${!n.read ? 'font-semibold text-slate-200' : 'text-slate-300'}`}>
                    {n.title}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {n.body}
                  </p>
                  <span className="text-[9px] text-slate-500 mt-1 block">
                    {formatMessageTime(n.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
