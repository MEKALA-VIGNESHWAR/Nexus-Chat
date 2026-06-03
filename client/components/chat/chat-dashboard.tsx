'use client';

import { useState } from 'react';
import { ServerList } from '@/components/chat/server-list';
import { ServerSidebar } from '@/components/chat/server-sidebar';
import { DMList } from '@/components/chat/dm-list';
import { ChatArea } from '@/components/chat/chat-area';
import { MemberList } from '@/components/chat/member-list';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';

export function ChatDashboard() {
  const { user } = useAuth();
  const { rooms, activeRoom, messages, selectRoom, sendMessage } = useChat();

  const directRooms = rooms.filter((r: any) => r.type === 'direct');
  const groupRooms = rooms.filter((r: any) => r.type === 'group' || r.type === 'voice');

  const groupChannels = groupRooms.map((g: any) => ({
    id: g._id,
    name: g.name || 'Group Chat',
    type: g.type as 'group' | 'voice',
    description: g.description || '',
    members: g.members ? g.members.map((m: any) => typeof m === 'object' ? m._id : m) : [],
    createdAt: new Date(g.createdAt),
    unreadCount: g.unreadCount || 0,
    pinnedMessages: [],
  }));

  const virtualServers = [
    {
      id: 'nexus-server',
      name: 'NexusChat',
      icon: 'N',
      ownerId: '',
      members: [],
      channels: groupChannels,
      createdAt: new Date(),
    }
  ];

  const isHome = activeRoom ? activeRoom.type === 'direct' : true;
  const activeServer = isHome ? null : 'nexus-server';
  const activeChannel = !isHome && activeRoom ? activeRoom._id : '';
  const activeDM = isHome && activeRoom ? activeRoom._id : null;

  const currentServer = virtualServers.find(s => s.id === activeServer);
  const currentChannel = currentServer?.channels.find(c => c.id === activeChannel);
  
  const serverMembers = activeRoom && activeRoom.members && Array.isArray(activeRoom.members)
    ? activeRoom.members.map((m: any) => {
        if (typeof m === 'object') {
          return {
            id: m._id,
            username: m.username,
            displayName: m.displayName || m.username,
            avatar: m.avatar || '',
            status: m.status || 'offline',
            bio: m.bio || '',
            createdAt: new Date(m.createdAt || Date.now()),
          };
        }
        return {
          id: m,
          username: 'user',
          displayName: 'User',
          avatar: '',
          status: 'offline',
          bio: '',
          createdAt: new Date(),
        };
      })
    : [];

  const handleServerSelect = (serverId: string) => {
    if (groupRooms.length > 0) {
      selectRoom(groupRooms[0]);
    }
  };

  const handleChannelSelect = (channelId: string) => {
    const targetRoom = rooms.find(r => r._id === channelId);
    if (targetRoom) {
      selectRoom(targetRoom);
    }
  };

  const handleHomeClick = () => {
    if (directRooms.length > 0) {
      selectRoom(directRooms[0]);
    } else {
      selectRoom(null);
    }
  };

  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };

  const dmListConversations = directRooms.map((dm: any) => {
    return {
      id: dm._id,
      name: dm.name || 'Direct Chat',
      type: 'dm' as const,
      members: dm.members ? dm.members.map((m: any) => typeof m === 'object' ? m._id : m) : [],
      createdAt: new Date(dm.createdAt),
      lastMessage: dm.lastMessage ? {
        id: dm.lastMessage._id,
        content: dm.lastMessage.content?.text || dm.lastMessage.content || '',
        senderId: typeof dm.lastMessage.sender === 'object' ? dm.lastMessage.sender?._id : dm.lastMessage.sender,
        channelId: dm._id,
        timestamp: new Date(dm.lastMessage.createdAt),
        reactions: [],
        attachments: [],
        readBy: [],
      } : undefined,
      unreadCount: dm.unreadCount || 0,
      pinnedMessages: [],
    };
  });

  const currentDMChannel = dmListConversations.find(dm => dm.id === activeDM);

  const allUsersMap: Record<string, any> = {};
  rooms.forEach((r: any) => {
    if (r.members && Array.isArray(r.members)) {
      r.members.forEach((m: any) => {
        if (typeof m === 'object') {
          allUsersMap[m._id] = {
            id: m._id,
            username: m.username,
            displayName: m.displayName || m.username,
            avatar: m.avatar || '',
            status: m.status || 'offline',
            bio: m.bio || '',
            createdAt: new Date(m.createdAt || Date.now()),
          };
        }
      });
    }
  });
  if (user) {
    allUsersMap[user._id] = {
      id: user._id,
      username: user.username,
      displayName: user.displayName || user.username,
      avatar: user.avatar || '',
      status: 'online',
      bio: user.bio || '',
      createdAt: new Date(user.createdAt || Date.now()),
    };
  }
  const allUsersList = Object.values(allUsersMap);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Server List */}
      <ServerList
        servers={virtualServers}
        activeServer={activeServer}
        onServerSelect={handleServerSelect}
        onHomeClick={handleHomeClick}
        isHome={isHome}
      />

      {/* Secondary Sidebar (Server Channels or DM List) */}
      {isHome ? (
        <DMList
          conversations={dmListConversations}
          users={allUsersList}
          activeConversation={activeDM}
          onConversationSelect={handleDMSelect}
        />
      ) : currentServer ? (
        <ServerSidebar
          server={currentServer}
          activeChannel={activeChannel}
          onChannelSelect={handleChannelSelect}
        />
      ) : null}

      {/* Main Chat Area */}
      {currentChannel && !isHome ? (
        <ChatArea
          channel={currentChannel}
          messages={messages}
          users={allUsersList}
          currentUserId={user?._id || 'user-1'}
          onSendMessage={handleSendMessage}
        />
      ) : currentDMChannel ? (
        <ChatArea
          channel={currentDMChannel}
          messages={messages}
          users={allUsersList}
          currentUserId={user?._id || 'user-1'}
          onSendMessage={handleSendMessage}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center bg-background">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-muted-foreground">
              Select a channel to start chatting
            </h2>
          </div>
        </div>
      )}

      {/* Member List (only for server channels) */}
      {currentServer && !isHome && (
        <div className="hidden lg:block">
          <MemberList 
            members={serverMembers} 
            ownerId={activeRoom?.owner || ''}
          />
        </div>
      )}
    </div>
  );

  function handleDMSelect(dmId: string) {
    const targetRoom = rooms.find(r => r._id === dmId);
    if (targetRoom) {
      selectRoom(targetRoom);
    }
  }
}
