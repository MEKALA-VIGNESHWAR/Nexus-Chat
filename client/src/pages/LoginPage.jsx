import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { MessageCircle } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-chat-bg relative overflow-hidden" id="login-page">
      {/* Animated background gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-[40%] right-[20%] w-[250px] h-[250px] bg-indigo-500/10 rounded-full blur-2xl animate-bounce-slow pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-600/30 mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Welcome back
          </h1>
          <p className="text-slate-400 text-sm">
            Sign in to continue to <span className="text-shimmer font-semibold">NexusChat</span>
          </p>
        </div>

        {/* Glass card form */}
        <div className="glass-panel rounded-2xl p-8">
          <LoginForm onSwitchToRegister={() => navigate('/register')} />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Encrypted & Secure • Real-time Communication
        </p>
      </div>
    </div>
  );
}
