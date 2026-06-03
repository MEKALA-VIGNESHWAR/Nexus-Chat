'use client';

import { useState } from 'react';
import { 
  Moon, Sun, Bell, BellOff, Lock, Eye, EyeOff, 
  Smartphone, Monitor, Shield, LogOut, Trash2,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

type Tab = 'appearance' | 'notifications' | 'privacy' | 'security' | 'devices';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('appearance');

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'devices', label: 'Devices', icon: Smartphone },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-sidebar p-4">
        <h1 className="mb-6 px-3 text-xl font-bold text-foreground">Settings</h1>
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                activeTab === tab.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-8 border-t border-border pt-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="h-5 w-5" />
            Log Out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        <div className="mx-auto max-w-2xl">
          {activeTab === 'appearance' && <AppearanceSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'privacy' && <PrivacySettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'devices' && <DevicesSettings />}
        </div>
      </div>
    </div>
  );
}

function AppearanceSettings() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Appearance</h2>
        <p className="text-muted-foreground">Customize how NexusChat looks on your device</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Theme</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'system', label: 'System', icon: Monitor },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTheme(option.value as typeof theme)}
              className={cn(
                'flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all',
                theme === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/50'
              )}
            >
              <div className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full',
                theme === option.value ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              )}>
                <option.icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Message Display</h3>
        <SettingToggle
          label="Compact Mode"
          description="Reduce spacing between messages"
          defaultChecked={false}
        />
        <SettingToggle
          label="Show Avatars"
          description="Display user avatars in conversations"
          defaultChecked={true}
        />
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
        <p className="text-muted-foreground">Configure how you receive notifications</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Push Notifications</h3>
        <SettingToggle
          label="All Messages"
          description="Get notified for all new messages"
          defaultChecked={true}
        />
        <SettingToggle
          label="Mentions Only"
          description="Only notify when someone mentions you"
          defaultChecked={false}
        />
        <SettingToggle
          label="Direct Messages"
          description="Notify for direct messages"
          defaultChecked={true}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Sounds</h3>
        <SettingToggle
          label="Message Sounds"
          description="Play a sound for new messages"
          defaultChecked={true}
        />
        <SettingToggle
          label="Call Ringtone"
          description="Play ringtone for incoming calls"
          defaultChecked={true}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Email Notifications</h3>
        <SettingToggle
          label="Weekly Digest"
          description="Receive a weekly summary of activity"
          defaultChecked={false}
        />
        <SettingToggle
          label="Friend Requests"
          description="Email when you receive a friend request"
          defaultChecked={true}
        />
      </div>
    </div>
  );
}

function PrivacySettings() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Privacy</h2>
        <p className="text-muted-foreground">Control your privacy and data settings</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Activity Status</h3>
        <SettingToggle
          label="Show Online Status"
          description="Let others see when you are online"
          defaultChecked={true}
        />
        <SettingToggle
          label="Show Last Seen"
          description="Display when you were last active"
          defaultChecked={false}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Messages</h3>
        <SettingToggle
          label="Read Receipts"
          description="Let others know when you have read their messages"
          defaultChecked={true}
        />
        <SettingToggle
          label="Typing Indicator"
          description="Show when you are typing a message"
          defaultChecked={true}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Direct Messages</h3>
        <SettingToggle
          label="Allow from Everyone"
          description="Receive DMs from anyone"
          defaultChecked={false}
        />
        <SettingToggle
          label="Allow from Friends"
          description="Only receive DMs from friends"
          defaultChecked={true}
        />
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Security</h2>
        <p className="text-muted-foreground">Manage your account security settings</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Two-Factor Authentication</h3>
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">2FA is disabled</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
            </div>
            <Button className="nexus-gradient text-white">Enable</Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Password</h3>
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Change Password</p>
              <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
            </div>
            <Button variant="outline">Change</Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Danger Zone</h3>
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-foreground">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently delete your account and data</p>
              </div>
            </div>
            <Button variant="destructive">Delete</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DevicesSettings() {
  const devices = [
    { name: 'MacBook Pro', type: 'Desktop', location: 'San Francisco, US', current: true, lastActive: 'Now' },
    { name: 'iPhone 15 Pro', type: 'Mobile', location: 'San Francisco, US', current: false, lastActive: '2 hours ago' },
    { name: 'iPad Air', type: 'Tablet', location: 'New York, US', current: false, lastActive: '3 days ago' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Connected Devices</h2>
        <p className="text-muted-foreground">Manage devices that have access to your account</p>
      </div>

      <div className="space-y-3">
        {devices.map((device, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center justify-between rounded-lg border p-4 transition-colors',
              device.current ? 'border-primary bg-primary/5' : 'border-border'
            )}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                {device.type === 'Desktop' ? (
                  <Monitor className="h-6 w-6" />
                ) : (
                  <Smartphone className="h-6 w-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{device.name}</p>
                  {device.current && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {device.location} · {device.lastActive}
                </p>
              </div>
            </div>
            {!device.current && (
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full">
        Log out of all other devices
      </Button>
    </div>
  );
}

interface SettingToggleProps {
  label: string;
  description: string;
  defaultChecked?: boolean;
}

function SettingToggle({ label, description, defaultChecked = false }: SettingToggleProps) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-4">
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={setChecked} />
    </div>
  );
}
