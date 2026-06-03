'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl nexus-gradient">
            <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>

        {!isSubmitted ? (
          <>
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-bold text-foreground">Forgot your password?</h2>
              <p className="text-muted-foreground">
                {"No worries, we'll send you reset instructions."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="h-12 w-full nexus-gradient text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    Reset password
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-online/20">
                <CheckCircle className="h-8 w-8 text-online" />
              </div>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">Check your email</h2>
            <p className="mb-6 text-muted-foreground">
              {"We've sent a password reset link to"}<br />
              <span className="font-medium text-foreground">{email}</span>
            </p>
            <Button 
              variant="outline"
              className="h-12 w-full"
              onClick={() => window.open('https://mail.google.com', '_blank')}
            >
              Open email app
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              {"Didn't receive the email? "}
              <button 
                onClick={() => setIsSubmitted(false)}
                className="text-primary hover:underline"
              >
                Click to resend
              </button>
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link 
            href="/auth/login" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
