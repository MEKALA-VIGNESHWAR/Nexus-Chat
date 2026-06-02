import React, { useRef, useEffect, useCallback } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import MessageInput from './MessageInput';
import Skeleton from '../common/Skeleton';
import { Loader2 } from 'lucide-react';
import { ROOM_TYPES } from '../../utils/constants';

export default function ChatWindow() {
  const {
    activeRoom,
    messages,
    loadingMessages,
    hasMoreMessages,
    page,
    fetchMessages,
    typingUsers,
  } = useChat();
  const { user } = useAuth();

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const isLoadingMore = useRef(false);

  // Auto-scroll to the bottom on new messages
  useEffect(() => {
    if (!isLoadingMore.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Reset scroll state when active room changes
  useEffect(() => {
    isLoadingMore.current = false;
  }, [activeRoom]);

  // Infinite scroll: load older messages on scroll to top
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || !hasMoreMessages || loadingMessages) return;

    if (container.scrollTop < 80) {
      isLoadingMore.current = true;
      const prevHeight = container.scrollHeight;
      fetchMessages(page + 1).then(() => {
        // Preserve scroll position after prepending older messages
        requestAnimationFrame(() => {
          const newHeight = container.scrollHeight;
          container.scrollTop = newHeight - prevHeight;
          isLoadingMore.current = false;
        });
      });
    }
  }, [hasMoreMessages, loadingMessages, page, fetchMessages]);

  // No active room state
  if (!activeRoom) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-chat-bg/50 p-8" id="no-chat-selected">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/10 flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-indigo-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-300 mb-2">Welcome to NexusChat</h3>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          Select a conversation from the sidebar or start a new chat to begin messaging.
        </p>
      </div>
    );
  }

  const isGroup = activeRoom.type === ROOM_TYPES.GROUP;
  const typingNames = Object.values(typingUsers);

  // Determine if we should show sender info (for group chats)
  const shouldShowSender = (msg, index) => {
    if (!isGroup) return false;
    if (msg.sender?._id === user?._id) return false;
    if (index === 0) return true;
    const prevMsg = messages[index - 1];
    return prevMsg?.sender?._id !== msg.sender?._id;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden" id="chat-window">
      {/* Messages feed */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4"
      >
        {/* Loading more indicator */}
        {loadingMessages && messages.length > 0 && (
          <div className="flex justify-center py-3">
            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
          </div>
        )}

        {/* Initial loading skeleton */}
        {loadingMessages && messages.length === 0 && (
          <div className="space-y-4 p-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`flex ${i % 3 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div className="space-y-1.5">
                  <Skeleton className={`h-10 rounded-2xl ${i % 3 === 0 ? 'w-48' : 'w-56'}`} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message list */}
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            showSender={shouldShowSender(msg, i)}
          />
        ))}

        {/* Typing indicator */}
        <TypingIndicator usernames={typingNames} />

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput />
    </div>
  );
}
