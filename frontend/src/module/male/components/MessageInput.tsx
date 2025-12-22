import { useState, useRef, useEffect, useCallback } from 'react';
import { MaterialSymbol } from '../types/material-symbol';
import { AttachmentMenu } from './AttachmentMenu';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onSendPhoto?: () => void;
  onSendGift?: () => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  placeholder?: string;
  coinCost?: number;
  disabled?: boolean;
  isSending?: boolean;
}

export const MessageInput = ({
  onSendMessage,
  onSendPhoto,
  onSendGift,
  onTypingStart,
  onTypingStop,
  placeholder = 'Type a message...',
  coinCost,
  disabled = false,
  isSending = false,
}: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSend = () => {
    if (message.trim() && !disabled && !isSending) {
      onSendMessage(message.trim());
      setMessage('');
      inputRef.current?.focus();
      if (onTypingStop) {
        onTypingStop();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle typing indicator
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Start typing indicator
    if (value && onTypingStart) {
      onTypingStart();
    }

    // Stop typing after 2 seconds of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (onTypingStop) {
        onTypingStop();
      }
    }, 2000);
  }, [onTypingStart, onTypingStop]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsAttachmentMenuOpen(false);
      }
    };

    if (isAttachmentMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAttachmentMenuOpen]);

  // Build attachment menu items
  const attachmentItems = [];
  if (onSendGift) {
    attachmentItems.push({
      id: 'gift',
      icon: 'redeem',
      label: 'Send Gift',
      onClick: onSendGift,
      color: 'bg-pink-500',
    });
  }
  if (onSendPhoto) {
    attachmentItems.push({
      id: 'photo',
      icon: 'image',
      label: 'Send Photo',
      onClick: onSendPhoto,
      color: 'bg-blue-500',
    });
  }

  return (
    <div className="px-4 py-3 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-white/5 relative">
      <div className="flex items-end gap-2">
        {/* Attachment Menu Button (+ Button) */}
        {(onSendGift || onSendPhoto) && (
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
              disabled={disabled || isSending}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 dark:bg-[#342d18] text-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-[#4b202e] transition-colors active:scale-95 disabled:opacity-50"
              aria-label="Attachments"
            >
              <MaterialSymbol name="add" />
            </button>
            <AttachmentMenu
              isOpen={isAttachmentMenuOpen}
              onClose={() => setIsAttachmentMenuOpen(false)}
              items={attachmentItems}
            />
          </div>
        )}

        {/* Input Field */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? 'Insufficient coins...' : placeholder}
            disabled={disabled || isSending}
            className="w-full h-10 px-4 pr-16 bg-white dark:bg-[#2f151e] rounded-full border border-gray-200 dark:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#cc8ea3]/70 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
          />

        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isSending}
          className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-white hover:bg-yellow-400 transition-colors active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <MaterialSymbol name="send" size={20} />
          )}
        </button>
      </div>

      {/* Low balance warning */}
      {disabled && (
        <p className="text-xs text-red-500 text-center mt-2">
          Not enough coins. <span className="underline cursor-pointer">Buy more coins</span>
        </p>
      )}
    </div>
  );
};
