import React, { useState, useEffect } from 'react';
import { X, LogOut, Save, User as UserIcon, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AvatarUpload from './AvatarUpload';
import Input from '../common/Input';
import Button from '../common/Button';

export default function ProfilePanel({ isOpen, onClose }) {
  const { user, updateProfile, logout } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync inputs with user details on load
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      setErrorMsg('All fields are required');
      return;
    }

    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    const res = await updateProfile({ username, email });
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-10 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-850">
          <div>
            <h2 className="text-lg font-bold text-slate-100">My Profile</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage your account settings</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar">
          {/* Avatar Section */}
          <div className="flex flex-col items-center p-4 bg-slate-950/20 border border-slate-800/40 rounded-2xl">
            <AvatarUpload />
          </div>

          {/* Details Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  label="Username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="relative">
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 py-2.5 px-3 rounded-lg">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-2.5 px-3 rounded-lg">
                {successMsg}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full flex items-center justify-center gap-2 mt-2"
              loading={loading}
            >
              <Save className="w-4 h-4" />
              Save Profile Changes
            </Button>
          </form>
        </div>

        {/* Footer Logout */}
        <div className="px-6 py-5 border-t border-slate-850 bg-slate-950/20">
          <Button
            onClick={() => {
              logout();
              onClose();
            }}
            variant="danger"
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout from Account
          </Button>
        </div>
      </div>
    </div>
  );
}
