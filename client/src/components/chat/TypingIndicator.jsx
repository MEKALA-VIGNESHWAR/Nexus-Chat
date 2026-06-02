import React from 'react';

export default function TypingIndicator({ usernames = [] }) {
  if (usernames.length === 0) return null;

  const text =
    usernames.length === 1
      ? `${usernames[0]} is typing`
      : usernames.length === 2
        ? `${usernames[0]} and ${usernames[1]} are typing`
        : `${usernames[0]} and ${usernames.length - 1} others are typing`;

  return (
    <div className="flex items-center gap-2 px-4 py-2 ml-10" id="typing-indicator">
      {/* Animated bouncing dots */}
      <div className="flex items-center gap-0.5">
        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-xs text-slate-500 italic">{text}</span>
    </div>
  );
}
