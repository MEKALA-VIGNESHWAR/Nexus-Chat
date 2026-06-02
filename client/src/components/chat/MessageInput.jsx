import React, { useState, useRef } from 'react';
import { Paperclip, Send, X, Image, Smile } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useTyping } from '../../hooks/useTyping';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import { MESSAGE_TYPES } from '../../utils/constants';

export default function MessageInput() {
  const { activeRoom, sendMessage } = useChat();
  const { handleTyping, forceStopTyping } = useTyping(activeRoom?._id);
  const { uploadFile, uploading, progress, error: uploadError, reset: resetUpload } = useMediaUpload();

  const [text, setText] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [attachedPreview, setAttachedPreview] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleTextChange = (e) => {
    setText(e.target.value);
    handleTyping();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be under 10MB');
      return;
    }

    setAttachedFile(file);

    // Image preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setAttachedPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setAttachedPreview(null);
    }
  };

  const clearAttachment = () => {
    setAttachedFile(null);
    setAttachedPreview(null);
    resetUpload();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (!activeRoom) return;
    const trimmed = text.trim();
    if (!trimmed && !attachedFile) return;

    forceStopTyping();

    if (attachedFile) {
      const result = await uploadFile(attachedFile, activeRoom._id);
      if (result.success) {
        const mediaType = attachedFile.type.startsWith('image/') ? MESSAGE_TYPES.IMAGE : MESSAGE_TYPES.FILE;
        sendMessage(trimmed || '', mediaType, result.data._id);
      }
      clearAttachment();
    } else {
      sendMessage(trimmed, MESSAGE_TYPES.TEXT);
    }

    setText('');
    textareaRef.current?.focus();
  };

  // Drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setAttachedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => setAttachedPreview(ev.target.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  if (!activeRoom) return null;

  return (
    <div
      className="border-t border-slate-800/40 bg-slate-950/30"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      id="message-input-container"
    >
      {/* Attachment preview */}
      {attachedFile && (
        <div className="px-4 pt-3 flex items-center gap-3">
          <div className="relative glass-card rounded-lg p-2 flex items-center gap-2 pr-8">
            {attachedPreview ? (
              <img src={attachedPreview} alt="preview" className="w-12 h-12 rounded-md object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-md bg-slate-700/50 flex items-center justify-center">
                <Image className="w-5 h-5 text-slate-400" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs text-slate-300 font-medium truncate max-w-[150px]">{attachedFile.name}</p>
              <p className="text-[10px] text-slate-500">{(attachedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={clearAttachment}
              className="absolute top-1 right-1 p-0.5 rounded-full text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          {uploading && (
            <div className="flex-1">
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">{progress}% uploaded</p>
            </div>
          )}
          {uploadError && (
            <p className="text-xs text-red-400">{uploadError}</p>
          )}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 px-4 py-3">
        {/* Attachment button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800/60 transition-all duration-200 flex-shrink-0"
          title="Attach file"
          id="attach-file-btn"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
          onChange={handleFileSelect}
        />

        {/* Text area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200 resize-none max-h-32 custom-scrollbar"
            style={{ minHeight: '42px' }}
            id="message-textarea"
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={(!text.trim() && !attachedFile) || uploading}
          className={`p-2.5 rounded-xl flex-shrink-0 transition-all duration-200 ${
            text.trim() || attachedFile
              ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 active:scale-95'
              : 'bg-slate-800/60 text-slate-600 cursor-not-allowed'
          }`}
          id="send-message-btn"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
