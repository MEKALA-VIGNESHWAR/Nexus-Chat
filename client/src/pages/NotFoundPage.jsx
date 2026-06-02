import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, HelpCircle } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 overflow-hidden relative">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md p-8 bg-slate-900/60 border border-slate-800/80 rounded-3xl shadow-2xl backdrop-blur-md text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 mb-6 animate-bounce">
          <HelpCircle className="w-8 h-8" />
        </div>

        <h1 className="text-4xl font-extrabold text-white tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-slate-200 mt-2">Page Not Found</h2>
        
        <p className="text-sm text-slate-500 mt-3 max-w-xs">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <Button
          onClick={() => navigate('/')}
          variant="primary"
          className="mt-8 flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
