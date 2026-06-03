'use client';

import { useState } from 'react';
import { 
  UserPlus, 
  UserCheck, 
  UserX, 
  Search, 
  MessageSquare,
  MoreHorizontal,
  Ban,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AvatarWithStatus } from '@/components/chat/avatar-with-status';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { sampleUsers, sampleFriends, sampleFriendRequests, sampleBlockedUsers } from '@/lib/sample-data';

type Tab = 'all' | 'online' | 'pending' | 'blocked' | 'add';

export function FriendsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const friends = sampleUsers.filter(u => sampleFriends.includes(u.id));
  const onlineFriends = friends.filter(f => f.status === 'online' || f.status === 'busy' || f.status === 'away');
  const pendingRequests = sampleFriendRequests.filter(r => r.status === 'pending');
  const blockedUsers = sampleUsers.filter(u => sampleBlockedUsers.includes(u.id));

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'all', label: 'All', count: friends.length },
    { id: 'online', label: 'Online', count: onlineFriends.length },
    { id: 'pending', label: 'Pending', count: pendingRequests.length },
    { id: 'blocked', label: 'Blocked', count: blockedUsers.length },
    { id: 'add', label: 'Add Friend' },
  ];

  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex h-14 items-center gap-4 border-b border-border px-6">
          <div className="flex items-center gap-2 text-foreground">
            <UserCheck className="h-5 w-5" />
            <span className="font-semibold">Friends</span>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors',
                  activeTab === tab.id
                    ? tab.id === 'add'
                      ? 'bg-online text-white'
                      : 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                )}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={cn(
                    'rounded-full px-1.5 text-xs',
                    activeTab === tab.id ? 'bg-white/20' : 'bg-muted'
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'add' ? (
            <AddFriendSection />
          ) : (
            <>
              {/* Search */}
              <div className="mb-6 relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Friends List */}
              {activeTab === 'all' && (
                <FriendsList 
                  friends={friends.filter(f => 
                    f.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    f.username.toLowerCase().includes(searchQuery.toLowerCase())
                  )} 
                />
              )}
              {activeTab === 'online' && (
                <FriendsList 
                  friends={onlineFriends.filter(f => 
                    f.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    f.username.toLowerCase().includes(searchQuery.toLowerCase())
                  )} 
                />
              )}
              {activeTab === 'pending' && (
                <PendingRequestsList requests={pendingRequests} />
              )}
              {activeTab === 'blocked' && (
                <BlockedUsersList users={blockedUsers} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FriendsList({ friends }: { friends: typeof sampleUsers }) {
  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <UserCheck className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">No friends found</h3>
        <p className="text-muted-foreground">Try searching for something else</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="mb-4 text-sm font-medium text-muted-foreground">
        {friends.length} Friend{friends.length !== 1 ? 's' : ''}
      </p>
      {friends.map((friend) => (
        <div
          key={friend.id}
          className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/30"
        >
          <div className="flex items-center gap-4">
            <AvatarWithStatus user={friend} size="lg" />
            <div>
              <p className="font-medium text-foreground">{friend.displayName}</p>
              <p className="text-sm text-muted-foreground">@{friend.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="icon">
              <MessageSquare className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>Start Voice Call</DropdownMenuItem>
                <DropdownMenuItem>Start Video Call</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  Remove Friend
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  Block
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}

function PendingRequestsList({ requests }: { requests: typeof sampleFriendRequests }) {
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">No pending requests</h3>
        <p className="text-muted-foreground">Friend requests will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="mb-4 text-sm font-medium text-muted-foreground">
        {requests.length} Pending Request{requests.length !== 1 ? 's' : ''}
      </p>
      {requests.map((request) => {
        const user = sampleUsers.find(u => u.id === request.fromUserId);
        if (!user) return null;

        return (
          <div
            key={request.id}
            className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-center gap-4">
              <AvatarWithStatus user={user} size="lg" />
              <div>
                <p className="font-medium text-foreground">{user.displayName}</p>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="nexus-gradient text-white">
                <UserCheck className="mr-2 h-4 w-4" />
                Accept
              </Button>
              <Button variant="outline" size="sm">
                <UserX className="mr-2 h-4 w-4" />
                Decline
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BlockedUsersList({ users }: { users: typeof sampleUsers }) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <Ban className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">No blocked users</h3>
        <p className="text-muted-foreground">Users you block will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="mb-4 text-sm font-medium text-muted-foreground">
        {users.length} Blocked User{users.length !== 1 ? 's' : ''}
      </p>
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
        >
          <div className="flex items-center gap-4">
            <AvatarWithStatus user={user} size="lg" showStatus={false} />
            <div>
              <p className="font-medium text-foreground">{user.displayName}</p>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Unblock
          </Button>
        </div>
      ))}
    </div>
  );
}

function AddFriendSection() {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSend = () => {
    if (username.trim()) {
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Add Friend</h2>
        <p className="text-muted-foreground">
          You can add friends with their NexusChat username
        </p>
      </div>

      <div className="space-y-4">
        <div className={cn(
          'flex gap-2 rounded-lg border p-1.5 transition-colors',
          status === 'success' 
            ? 'border-online bg-online/10' 
            : status === 'error'
            ? 'border-destructive bg-destructive/10'
            : 'border-border bg-input'
        )}>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter a username"
            className="border-0 bg-transparent focus-visible:ring-0"
          />
          <Button 
            onClick={handleSend}
            disabled={!username.trim()}
            className="nexus-gradient text-white"
          >
            Send Friend Request
          </Button>
        </div>

        {status === 'success' && (
          <p className="text-sm text-online">
            Friend request sent to {username}!
          </p>
        )}
      </div>

      {/* Suggested Friends */}
      <div className="mt-8">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          Suggested Friends
        </h3>
        <div className="space-y-2">
          {sampleUsers.slice(4, 6).map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center gap-4">
                <AvatarWithStatus user={user} size="md" />
                <div>
                  <p className="font-medium text-foreground">{user.displayName}</p>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
