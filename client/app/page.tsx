'use client';

import Link from 'next/link';
import { ArrowRight, MessageSquare, Users, Video, Shield, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg nexus-gradient">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground">NexusChat</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="nexus-gradient text-white">
                Get Started
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              Now in public beta
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Communication that{' '}
              <span className="nexus-gradient-text">brings teams together</span>
            </h1>
            <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
              NexusChat is the modern team communication platform that combines messaging, 
              voice, and video calls into one seamless experience. Built for the way teams actually work.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/chat">
                <Button size="lg" className="nexus-gradient text-white h-12 px-8 text-base">
                  Open NexusChat
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                  Learn more
                </Button>
              </Link>
            </div>
          </div>

          {/* Preview Image */}
          <div className="mt-16 sm:mt-24">
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
              <div className="flex h-8 items-center gap-2 border-b border-border bg-muted/50 px-4">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-away/60" />
                <div className="h-3 w-3 rounded-full bg-online/60" />
              </div>
              <div className="aspect-video bg-gradient-to-br from-sidebar via-background to-card p-4">
                <div className="flex h-full gap-4">
                  <div className="w-16 rounded-lg bg-sidebar/80" />
                  <div className="w-56 rounded-lg bg-sidebar/60" />
                  <div className="flex-1 rounded-lg bg-secondary/30" />
                  <div className="w-56 rounded-lg bg-sidebar/40 hidden lg:block" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Everything your team needs
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features designed for modern teams to communicate effectively
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl nexus-gradient p-8 sm:p-16">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJWMjRoMnYxMHptMC0xNmgtMnYyaDJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
                Ready to get started?
              </h2>
              <p className="mb-8 text-lg text-white/80">
                Join thousands of teams already using NexusChat to collaborate better
              </p>
              <Link href="/auth/register">
                <Button size="lg" variant="secondary" className="h-12 px-8 text-base">
                  Create free account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg nexus-gradient">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-semibold text-foreground">NexusChat</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date().getFullYear()} NexusChat. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: 'Real-time Messaging',
    description: 'Send messages instantly with typing indicators, read receipts, and message reactions.',
    icon: MessageSquare,
  },
  {
    title: 'Team Collaboration',
    description: 'Create channels, groups, and workspaces to organize your team conversations.',
    icon: Users,
  },
  {
    title: 'HD Video & Voice',
    description: 'Crystal clear video and voice calls with screen sharing and virtual backgrounds.',
    icon: Video,
  },
  {
    title: 'Enterprise Security',
    description: 'End-to-end encryption, SSO, and advanced admin controls to keep your data safe.',
    icon: Shield,
  },
  {
    title: 'Lightning Fast',
    description: 'Optimized for performance with instant message delivery and smooth animations.',
    icon: Zap,
  },
  {
    title: 'Global Scale',
    description: 'Built on modern infrastructure to handle millions of messages per second.',
    icon: Globe,
  },
];
