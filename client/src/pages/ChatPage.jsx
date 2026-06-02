import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import ChatWindow from '../components/chat/ChatWindow';
import ProfilePanel from '../components/profile/ProfilePanel';
import { useChat } from '../context/ChatContext';

export default function ChatPage() {
  const navigate = useNavigate();
  const { activeRoom } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  const handleTabChange = (tabId) => {
    if (tabId === 'voice') {
      navigate('/voice');
    } else {
      setActiveTab(tabId);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleOpenProfile = () => {
    setProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setProfileOpen(false);
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans relative">
      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenProfile={handleOpenProfile}
        className={`fixed inset-y-0 left-0 z-45 w-72 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-chat-bg relative">
        {/* Header */}
        <Header 
          onToggleSidebar={toggleSidebar}
          onToggleProfile={handleOpenProfile}
        />

        {/* Chat Conversation Feed */}
        <div className="flex-1 min-h-0 relative">
          <ChatWindow />
        </div>
      </main>

      {/* Sliding settings drawer ProfilePanel */}
      <ProfilePanel 
        isOpen={profileOpen}
        onClose={handleCloseProfile}
      />
    </div>
  );
}
