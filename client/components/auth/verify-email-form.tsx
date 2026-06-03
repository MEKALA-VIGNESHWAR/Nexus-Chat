'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function VerifyEmailForm() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.slice(0, 6).split('');
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    window.location.href = '/chat';
  };

  const handleResend = async () => {
    setCanResend(false);
    setCountdown(60);
    // Simulate resend
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const isComplete = code.every(digit => digit !== '');

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

        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-foreground">Verify your email</h2>
          <p className="text-muted-foreground">
            {"We've sent a 6-digit code to"}<br />
            <span className="font-medium text-foreground">john@example.com</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Code Input */}
          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={cn(
                  'h-14 w-12 rounded-lg border bg-input text-center text-xl font-semibold text-foreground',
                  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
                  'transition-all'
                )}
              />
            ))}
          </div>

          <Button 
            type="submit" 
            className="h-12 w-full nexus-gradient text-white"
            disabled={isLoading || !isComplete}
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                Verify email
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {"Didn't receive the code? "}
            {canResend ? (
              <button
                onClick={handleResend}
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                <RefreshCw className="h-3 w-3" />
                Resend code
              </button>
            ) : (
              <span className="text-muted-foreground">
                Resend in {countdown}s
              </span>
            )}
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/auth/login" 
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
