'use client';

import { useState } from 'react';
import { Camera, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { currentUser } from '@/lib/sample-data';

const statuses = [
  { value: 'online', label: 'Online', color: 'bg-online' },
  { value: 'away', label: 'Away', color: 'bg-away' },
  { value: 'busy', label: 'Busy', color: 'bg-busy' },
  { value: 'offline', label: 'Invisible', color: 'bg-offline' },
] as const;

export function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    displayName: currentUser.displayName,
    username: currentUser.username,
    bio: currentUser.bio,
    status: currentUser.status,
  });
  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">Manage your public profile and account settings</p>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Banner */}
        <div className="relative h-32 nexus-gradient">
          <button className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors">
            <Camera className="h-4 w-4" />
          </button>
        </div>

        {/* Avatar Section */}
        <div className="relative px-6 pb-6">
          <div className="absolute -top-12 left-6">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.displayName}
                className="h-24 w-24 rounded-full border-4 border-card object-cover"
                crossOrigin="anonymous"
              />
              <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
              {/* Status Indicator */}
              <div className={cn(
                'absolute bottom-0 left-0 h-5 w-5 rounded-full border-4 border-card',
                statuses.find(s => s.value === profile.status)?.color
              )} />
            </div>
          </div>

          {/* Edit Button */}
          <div className="flex justify-end pt-2">
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} className="nexus-gradient text-white">
                  <Check className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="mt-8 space-y-6">
            {/* Display Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Display Name
              </label>
              {isEditing ? (
                <Input
                  value={editedProfile.displayName}
                  onChange={(e) => setEditedProfile({ ...editedProfile, displayName: e.target.value })}
                  className="max-w-md"
                />
              ) : (
                <p className="text-lg font-semibold text-foreground">{profile.displayName}</p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Username
              </label>
              {isEditing ? (
                <div className="flex items-center max-w-md">
                  <span className="flex h-10 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                    @
                  </span>
                  <Input
                    value={editedProfile.username}
                    onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
                    className="rounded-l-none"
                  />
                </div>
              ) : (
                <p className="text-foreground">@{profile.username}</p>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                About Me
              </label>
              {isEditing ? (
                <textarea
                  value={editedProfile.bio}
                  onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                  rows={3}
                  className="w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-foreground">{profile.bio || 'No bio yet'}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => isEditing && setEditedProfile({ ...editedProfile, status: status.value })}
                    disabled={!isEditing}
                    className={cn(
                      'flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all',
                      (isEditing ? editedProfile.status : profile.status) === status.value
                        ? 'bg-secondary ring-2 ring-primary'
                        : 'bg-secondary/50 hover:bg-secondary',
                      !isEditing && 'cursor-default'
                    )}
                  >
                    <div className={cn('h-2.5 w-2.5 rounded-full', status.color)} />
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Info */}
            <div className="space-y-2 pt-4 border-t border-border">
              <label className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <p className="text-foreground">{currentUser.email}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Member Since
              </label>
              <p className="text-foreground">
                {new Date(currentUser.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
