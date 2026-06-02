import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Search, Users, MessageCircle, UserPlus } from 'lucide-react';

export default function CreateRoomModal({ isOpen, onClose }) {
  const { startDirectChat, createGroupChat } = useChat();
  const { user } = useAuth();
  
  const [mode, setMode] = useState('dm'); // 'dm' or 'group'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  
  // Group mode state
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Debounced user search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await api.get(`/users/search?q=${encodeURIComponent(searchQuery.trim())}`);
        // Filter out current user from results
        const filtered = (response.data.data || []).filter((u) => u._id !== user?._id);
        setSearchResults(filtered);
      } catch (err) {
        console.error('User search failed', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery, user]);

  const handleStartDM = async (targetUser) => {
    setCreating(true);
    setError('');
    const result = await startDirectChat(targetUser._id);
    setCreating(false);
    if (result.success) {
      resetAndClose();
    } else {
      setError(result.message);
    }
  };

  const toggleUserSelection = (targetUser) => {
    setSelectedUsers((prev) => {
      const exists = prev.some((u) => u._id === targetUser._id);
      if (exists) {
        return prev.filter((u) => u._id !== targetUser._id);
      }
      return [...prev, targetUser];
    });
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }
    if (selectedUsers.length < 1) {
      setError('Select at least one member');
      return;
    }

    setCreating(true);
    setError('');
    const memberIds = selectedUsers.map((u) => u._id);
    const result = await createGroupChat(groupName.trim(), memberIds);
    setCreating(false);
    if (result.success) {
      resetAndClose();
    } else {
      setError(result.message);
    }
  };

  const resetAndClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUsers([]);
    setGroupName('');
    setError('');
    setMode('dm');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="New Conversation"
      size="md"
    >
      {/* Mode toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setMode('dm'); setSelectedUsers([]); setError(''); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'dm'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-500 hover:text-slate-300 border border-slate-800'
          }`}
          id="mode-dm-btn"
        >
          <MessageCircle className="w-4 h-4" />
          Direct Message
        </button>
        <button
          onClick={() => { setMode('group'); setError(''); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'group'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-500 hover:text-slate-300 border border-slate-800'
          }`}
          id="mode-group-btn"
        >
          <Users className="w-4 h-4" />
          Group Chat
        </button>
      </div>

      {/* Group name input */}
      {mode === 'group' && (
        <div className="mb-4">
          <Input
            label="Group Name"
            name="groupName"
            placeholder="e.g. Project Team"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
        </div>
      )}

      {/* Selected members chips */}
      {mode === 'group' && selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedUsers.map((u) => (
            <span
              key={u._id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30"
            >
              {u.username}
              <button
                onClick={() => toggleUserSelection(u)}
                className="ml-0.5 text-indigo-400 hover:text-red-400"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search users by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          id="user-search-input"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Search results */}
      <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1">
        {searching && (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {!searching && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
          <p className="text-center text-sm text-slate-500 py-6">No users found</p>
        )}

        {searchResults.map((targetUser) => {
          const isSelected = selectedUsers.some((u) => u._id === targetUser._id);
          return (
            <div
              key={targetUser._id}
              className={`flex items-center justify-between gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600/10 border border-indigo-500/20'
                  : 'hover:bg-slate-800/50 border border-transparent'
              }`}
              onClick={() => {
                if (mode === 'dm') {
                  handleStartDM(targetUser);
                } else {
                  toggleUserSelection(targetUser);
                }
              }}
              id={`user-result-${targetUser._id}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  src={targetUser.avatar?.url}
                  alt={targetUser.username}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{targetUser.username}</p>
                  <p className="text-xs text-slate-500 truncate">{targetUser.email}</p>
                </div>
              </div>
              {mode === 'dm' ? (
                <MessageCircle className="w-4 h-4 text-slate-500 flex-shrink-0" />
              ) : (
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-600'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Group create button */}
      {mode === 'group' && (
        <div className="mt-4 pt-4 border-t border-slate-800/40">
          <Button
            variant="primary"
            size="md"
            loading={creating}
            onClick={handleCreateGroup}
            className="w-full"
            id="create-group-btn"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create Group ({selectedUsers.length} selected)
          </Button>
        </div>
      )}
    </Modal>
  );
}
