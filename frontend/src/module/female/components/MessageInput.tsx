import { useState, useRef } from 'react';
import { MaterialSymbol } from '../types/material-symbol';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onSendPhoto?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const MessageInput = ({
  onSendMessage,
  onSendPhoto,
  placeholder = 'Type a message...',
  disabled = false,
}: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 py-3 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-white/5">
      <div className="flex items-end gap-2">
        {/* Photo Button */}
        {onSendPhoto && (
          <button
            onClick={onSendPhoto}
            disabled={disabled}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 dark:bg-[#342d18] text-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-[#4b202e] transition-colors active:scale-95 shrink-0 disabled:opacity-50"
            aria-label="Send photo"
          >
            <MaterialSymbol name="image" />
          </button>
        )}

        {/* Input Field */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full h-10 px-4 bg-white dark:bg-[#2f151e] rounded-full border border-gray-200 dark:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#cc8ea3]/70 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-white hover:bg-yellow-400 transition-colors active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <MaterialSymbol name="send" size={20} />
        </button>
      </div>
      <p className="text-xs text-gray-400 dark:text-[#cbbc90] mt-2 px-2 text-center">
        Messages are free for you
      </p>
    </div>
  );
};


