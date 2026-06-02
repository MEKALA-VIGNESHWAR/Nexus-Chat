import React, { useState, useRef } from 'react';
import { Camera, Loader2, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

export default function AvatarUpload() {
  const { user, updateAvatar } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP)');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('avatar', file);

    const res = await updateAvatar(formData);
    setLoading(false);

    if (!res.success) {
      setError(res.message);
    }
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div
        className={`relative group rounded-full p-1 border-2 border-dashed transition-all duration-300 ${
          dragActive
            ? 'border-indigo-500 bg-indigo-500/10 scale-105'
            : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/20'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <Avatar
          src={user?.avatar?.url}
          alt={user?.username}
          size="xl"
          className="transition-transform duration-300 group-hover:scale-95"
        />

        {/* Hover overlay */}
        <div className="absolute inset-1 bg-black/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
          ) : (
            <>
              <Camera className="h-5 w-5 mb-0.5 text-indigo-300" />
              <span className="text-[10px] font-medium tracking-wide">UPLOAD</span>
            </>
          )}
        </div>

        {/* Spinner during upload when not hovered */}
        {loading && (
          <div className="absolute inset-1 bg-slate-900/80 rounded-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleChange}
        disabled={loading}
      />

      <div className="text-center">
        <button
          type="button"
          onClick={onButtonClick}
          disabled={loading}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1.5"
        >
          <Upload className="h-3.5 w-3.5" />
          Change Avatar
        </button>
        <p className="text-[10px] text-slate-500 mt-1">Supports PNG, JPG, WEBP. Max 5MB.</p>
      </div>

      {error && (
        <div className="w-full text-center text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 py-2 px-3 rounded-lg animate-pulse">
          {error}
        </div>
      )}
    </div>
  );
}
