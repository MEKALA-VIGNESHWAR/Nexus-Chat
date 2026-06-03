'use client';

import { useState } from 'react';
import { 
  Plus, 
  Users, 
  Settings, 
  Camera,
  Crown,
  Shield,
  UserPlus,
  LogOut,
  Trash2,
  Search,
  Hash,
  Volume2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AvatarWithStatus } from '@/components/chat/avatar-with-status';
import { cn } from '@/lib/utils';
import { sampleUsers, sampleServers } from '@/lib/sample-data';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function GroupsPage() {
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const server = sampleServers.find(s => s.id === selectedServer);
  const members = server ? sampleUsers.filter(u => server.members.includes(u.id)) : [];

  return (
    <div className="flex h-screen bg-background">
      {/* Groups List */}
      <div className="w-80 border-r border-border bg-sidebar">
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <h1 className="font-semibold text-foreground">Groups & Communities</h1>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <CreateGroupModal onClose={() => setShowCreateModal(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="p-3">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search groups..." className="pl-9" />
          </div>

          <div className="space-y-1">
            {sampleServers.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedServer(s.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg p-3 transition-colors',
                  selectedServer === s.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary font-semibold">
                  {s.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.members.length} members
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Group Details */}
      {server ? (
        <div className="flex-1 overflow-y-auto">
          {/* Server Banner */}
          <div className="relative h-48 nexus-gradient">
            <div className="absolute inset-0 bg-black/30" />
            <button className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg bg-black/50 px-3 py-1.5 text-sm text-white hover:bg-black/70 transition-colors">
              <Camera className="h-4 w-4" />
              Change Banner
            </button>
          </div>

          {/* Server Info */}
          <div className="relative px-6 pb-6">
            <div className="absolute -top-12 left-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-background bg-primary text-3xl font-bold text-primary-foreground">
                {server.icon}
              </div>
            </div>

            <div className="pt-16">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{server.name}</h1>
                  <p className="text-muted-foreground">{server.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite
                  </Button>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 flex gap-6">
                <div>
                  <p className="text-2xl font-bold text-foreground">{server.members.length}</p>
                  <p className="text-sm text-muted-foreground">Members</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{server.channels.length}</p>
                  <p className="text-sm text-muted-foreground">Channels</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {members.filter(m => m.status === 'online').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Online</p>
                </div>
              </div>

              {/* Channels Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Channels</h2>
                  <Button variant="ghost" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Channel
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {server.channels.map((channel) => (
                    <div
                      key={channel.id}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                    >
                      {channel.type === 'voice' ? (
                        <Volume2 className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Hash className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{channel.name}</p>
                        <p className="text-xs text-muted-foreground">{channel.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Members Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Members</h2>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {members.slice(0, 6).map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                    >
                      <AvatarWithStatus user={member} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate font-medium text-foreground">
                            {member.displayName}
                          </p>
                          {member.id === server.ownerId && (
                            <Crown className="h-3.5 w-3.5 text-yellow-500" />
                          )}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          @{member.username}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="mt-8 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                <h3 className="font-medium text-foreground">Danger Zone</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Irreversible and destructive actions
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="text-destructive hover:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Leave Group
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary mx-auto">
              <Users className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Select a group</h2>
            <p className="text-muted-foreground">Choose a group to view its details</p>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateGroupModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState<'community' | 'friends'>('friends');

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create a Group</DialogTitle>
        <DialogDescription>
          {step === 1 
            ? 'Choose the type of group you want to create'
            : 'Give your group a name and icon'}
        </DialogDescription>
      </DialogHeader>

      {step === 1 ? (
        <div className="space-y-3 py-4">
          <button
            onClick={() => { setGroupType('friends'); setStep(2); }}
            className="flex w-full items-center gap-4 rounded-lg border border-border p-4 hover:bg-secondary/50 transition-colors text-left"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Create My Own</p>
              <p className="text-sm text-muted-foreground">
                Start a private group with friends
              </p>
            </div>
          </button>
          <button
            onClick={() => { setGroupType('community'); setStep(2); }}
            className="flex w-full items-center gap-4 rounded-lg border border-border p-4 hover:bg-secondary/50 transition-colors text-left"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Shield className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="font-medium text-foreground">Create a Community</p>
              <p className="text-sm text-muted-foreground">
                Build a public community for everyone
              </p>
            </div>
          </button>
        </div>
      ) : (
        <div className="space-y-4 py-4">
          <div className="flex justify-center">
            <button className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                <Camera className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Plus className="h-4 w-4" />
              </div>
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Group Name
            </label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button 
              className="flex-1 nexus-gradient text-white"
              disabled={!groupName.trim()}
              onClick={onClose}
            >
              Create Group
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
