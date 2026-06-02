import React from 'react';
import { MessageCircle, Mic, User } from 'lucide-react';

export default function MobileNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'chat', label: 'Chats', icon: MessageCircle },
    { id: 'voice', label: 'Voice', icon: Mic },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 py-2 glass-panel border-t border-slate-800/40 lg:hidden" id="mobile-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-all duration-200 ${
            activeTab === tab.id
              ? 'text-indigo-400'
              : 'text-slate-500 hover:text-slate-300'
          }`}
          id={`mobile-tab-${tab.id}`}
        >
          <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]' : ''}`} />
          <span className="text-[10px] font-semibold">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
