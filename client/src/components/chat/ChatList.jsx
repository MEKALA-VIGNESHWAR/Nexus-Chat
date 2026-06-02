import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Skeleton from '../common/Skeleton';
import { formatMessageTime } from '../../utils/formatDate';
import { ROOM_TYPES } from '../../utils/constants';

export default function ChatList() {
  const { rooms, activeRoom, selectRoom, loadingRooms, onlineUsers, typingUsers: allTypingUsers } = useChat();
  const { user } = useAuth();

  if (loadingRooms) {
    return (
      <div className="p-3 space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-36" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-400">No conversations yet</p>
        <p className="text-xs text-slate-600 mt-1">Start a new chat using the + button</p>
      </div>
    );
  }

  return (
    <div className="py-2" id="chat-list">
      {rooms.map((room) => {
        const isActive = activeRoom?._id === room._id;
        const isGroup = room.type === ROOM_TYPES.GROUP;

        // For DM rooms, show the other user's info
        const otherMember = !isGroup
          ? room.members?.find((m) => m.user?._id !== user?._id)?.user
          : null;

        const displayName = isGroup ? room.name : otherMember?.username || 'Unknown';
        const avatarUrl = isGroup ? room.avatar?.url : otherMember?.avatar?.url;
        const isOnline = otherMember ? onlineUsers.has(otherMember._id) : false;

        // Last message preview
        const lastMsg = room.lastMessage;
        let preview = '';
        if (lastMsg) {
          const senderName = lastMsg.sender?._id === user?._id ? 'You' : (lastMsg.sender?.username || '');
          const content = lastMsg.content?.text || (lastMsg.type === 'image' ? '📷 Image' : '📎 File');
          preview = isGroup ? `${senderName}: ${content}` : content;
        }

        // Check if someone is typing in this room
        const roomTypingUsers = allTypingUsers?.[room._id];

        return (
          <button
            key={room._id}
            onClick={() => selectRoom(room)}
            className={`w-full flex items-center gap-3 px-3 py-3 mx-1 rounded-xl transition-all duration-200 text-left ${
              isActive
                ? 'bg-indigo-600/15 border border-indigo-500/20'
                : 'hover:bg-slate-800/40 border border-transparent'
            }`}
            id={`room-${room._id}`}
          >
            <Avatar
              src={avatarUrl}
              alt={displayName}
              size="md"
              status={!isGroup && isOnline ? 'online' : !isGroup ? 'offline' : null}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold truncate ${isActive ? 'text-indigo-300' : 'text-slate-200'}`}>
                  {displayName}
                </span>
                {lastMsg && (
                  <span className="text-[10px] text-slate-500 flex-shrink-0 ml-2">
                    {formatMessageTime(lastMsg.createdAt)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-0.5">
                {roomTypingUsers && Object.keys(roomTypingUsers).length > 0 ? (
                  <p className="text-xs text-indigo-400 truncate animate-pulse">typing...</p>
                ) : (
                  <p className="text-xs text-slate-500 truncate">{preview || 'No messages yet'}</p>
                )}
                {isGroup && (
                  <Badge variant="neutral" size="xs" className="ml-2 flex-shrink-0">
                    {room.members?.length || 0}
                  </Badge>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
