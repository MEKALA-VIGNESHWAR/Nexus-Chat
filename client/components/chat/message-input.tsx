'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Smile, 
  Paperclip, 
  Send, 
  Mic, 
  Video,
  Gift,
  Image as ImageIcon,
  AtSign,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageInputProps {
  channelName: string;
  onSend: (message: string, attachments?: File[]) => void;
  onTyping?: () => void;
  replyTo?: { id: string; content: string; author: string } | null;
  onCancelReply?: () => void;
  disabled?: boolean;
}

export function MessageInput({ 
  channelName, 
  onSend, 
  onTyping,
  replyTo,
  onCancelReply,
  disabled = false 
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
    if (onTyping) {
      onTyping();
    }
  };

  return (
    <div className="px-4 pb-6">
      {/* Reply Preview */}
      {replyTo && (
        <div className="mb-2 flex items-center gap-2 rounded-t-lg bg-secondary px-3 py-2 text-sm">
          <span className="text-muted-foreground">Replying to</span>
          <span className="font-medium text-foreground">{replyTo.author}</span>
          <span className="flex-1 truncate text-muted-foreground">{replyTo.content}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={onCancelReply}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Input Container */}
      <div className={cn(
        'flex items-end gap-2 rounded-lg bg-input p-2 transition-all',
        replyTo && 'rounded-t-none'
      )}>
        {/* Attachment Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            // Handle file upload
          }}
        />

        {/* Text Input */}
        <div className="flex flex-1 items-end">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${channelName}`}
            disabled={disabled}
            rows={1}
            className="max-h-[200px] min-h-[40px] flex-1 resize-none bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-muted-foreground hover:text-foreground"
          >
            <Gift className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-muted-foreground hover:text-foreground"
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-muted-foreground hover:text-foreground"
          >
            <Smile className="h-5 w-5" />
          </Button>

          {/* Send Button (visible when typing) */}
          {isTyping ? (
            <Button
              size="icon"
              className="h-10 w-10 nexus-gradient"
              onClick={handleSubmit}
              disabled={disabled || !message.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-muted-foreground hover:text-foreground"
              >
                <Mic className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
