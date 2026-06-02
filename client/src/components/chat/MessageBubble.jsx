import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import { formatMessageTime } from '../../utils/formatDate';
import { Check, CheckCheck, AlertCircle, FileText, Image as ImageIcon } from 'lucide-react';

export default function MessageBubble({ message, showSender = false }) {
  const { user } = useAuth();
  const isSelf = message.sender?._id === user?._id;
  const isOptimistic = message.optimistic;
  const isFailed = message.failed;
  const isDeleted = message.deleted;
  const isSystem = message.type === 'system';

  // System messages
  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="px-3 py-1 text-xs text-slate-500 bg-slate-800/30 rounded-full">
          {message.content?.text || 'System message'}
        </span>
      </div>
    );
  }

  // Deleted message
  if (isDeleted) {
    return (
      <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'} mb-1`}>
        <div className="px-4 py-2 rounded-2xl bg-slate-800/20 border border-slate-800/30">
          <p className="text-xs text-slate-600 italic">This message was deleted</p>
        </div>
      </div>
    );
  }

  // Determine read/delivered status for own messages
  let statusIcon = null;
  if (isSelf && !isOptimistic && !isFailed) {
    const readByOthers = message.readBy?.some((r) => r.user !== user?._id);
    if (readByOthers) {
      statusIcon = <CheckCheck className="w-3 h-3 text-indigo-400" />;
    } else {
      statusIcon = <Check className="w-3 h-3 text-slate-500" />;
    }
  }

  // Check if message has media/attachment
  const hasImage = message.type === 'image' && message.media?.url;
  const hasFile = message.type === 'file' && message.media;

  return (
    <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'} mb-1.5 group`} id={`msg-${message._id}`}>
      {/* Peer avatar */}
      {!isSelf && showSender && (
        <Avatar
          src={message.sender?.avatar?.url}
          alt={message.sender?.username || '?'}
          size="sm"
          className="mr-2 mt-auto mb-1 flex-shrink-0"
        />
      )}

      <div className={`max-w-[75%] ${!isSelf && showSender ? '' : !isSelf ? 'ml-10' : ''}`}>
        {/* Sender name for group chats */}
        {!isSelf && showSender && (
          <p className="text-[10px] text-slate-500 font-semibold mb-0.5 ml-1">
            {message.sender?.username}
          </p>
        )}

        <div
          className={`relative px-4 py-2.5 rounded-2xl transition-all duration-100 ${
            isSelf
              ? 'bg-indigo-600 text-white rounded-br-md shadow-lg shadow-indigo-600/10'
              : 'bg-slate-800/70 text-slate-200 rounded-bl-md border border-slate-700/30'
          } ${isOptimistic ? 'opacity-70' : ''} ${isFailed ? 'ring-1 ring-red-500/50' : ''}`}
        >
          {/* Image attachment */}
          {hasImage && (
            <div className="mb-2 -mx-1 -mt-0.5 overflow-hidden rounded-xl">
              <img
                src={message.media.url}
                alt="attachment"
                className="max-w-full max-h-64 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                loading="lazy"
              />
            </div>
          )}

          {/* File attachment */}
          {hasFile && !hasImage && (
            <a
              href={message.media.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 p-2 mb-2 rounded-lg transition-colors ${
                isSelf ? 'bg-indigo-700/40 hover:bg-indigo-700/60' : 'bg-slate-700/40 hover:bg-slate-700/60'
              }`}
            >
              <FileText className="w-5 h-5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{message.media.originalName || 'File'}</p>
                <p className="text-[10px] opacity-70">
                  {message.media.size ? `${(message.media.size / 1024).toFixed(1)} KB` : 'Download'}
                </p>
              </div>
            </a>
          )}

          {/* Message text */}
          {message.content?.text && (
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
              {message.content.text}
            </p>
          )}

          {/* Timestamp + status row */}
          <div className={`flex items-center gap-1 mt-1 ${isSelf ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-[10px] ${isSelf ? 'text-indigo-200/70' : 'text-slate-500'}`}>
              {formatMessageTime(message.createdAt)}
            </span>
            {statusIcon}
            {isFailed && (
              <AlertCircle className="w-3 h-3 text-red-400 ml-0.5" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
