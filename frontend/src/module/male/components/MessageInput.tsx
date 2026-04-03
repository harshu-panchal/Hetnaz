import { useState, useRef, useEffect, useCallback } from 'react';
import { MaterialSymbol } from '../types/material-symbol';
import { ImagePicker, ImagePickerRef } from '../../../shared/components/ImagePicker';
import { CameraCapture } from '../../../shared/components/CameraCapture';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onSendPhoto?: (base64: string) => void;
  onSendGift?: () => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  placeholder?: string;
  coinCost?: number;
  disabled?: boolean;
  isSending?: boolean;
  onLowCoins?: () => void; // Callback when user tries to send without enough coins
  showQuickReplies?: boolean;
}

export const MessageInput = ({
  onSendMessage,
  onSendPhoto,
  onSendGift,
  onTypingStart,
  onTypingStop,
  placeholder = 'Message...',
  disabled = false,
  isSending = false,
  onLowCoins,
  showQuickReplies = false,
}: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const quickReplies = [
    'Hi! 👋',
    'You look stunning ✨',
    'Want to chat?',
    'Sending a gift! 🎁',
    'How is your day?',
    'Let\'s connect! 💖'
  ];
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imagePickerRef = useRef<ImagePickerRef>(null);

  const handleQuickReplyClick = (reply: string) => {
    onSendMessage(reply);
  };

  const handleSend = () => {
    if (message.trim() && !isSending) {
      // If disabled (low coins), trigger the callback instead of sending
      if (disabled && onLowCoins) {
        onLowCoins();
        return;
      }

      if (!disabled) {
        onSendMessage(message.trim());
        setMessage('');
        inputRef.current?.focus();
        if (onTypingStop) {
          onTypingStop();
        }
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

  return (
    <div className="flex flex-col bg-transparent pb-5 pt-2">
      {/* Quick Replies Sidebar/Bar (Instagram-like suggestions) */}
      {showQuickReplies && (
        <div className="flex items-center gap-2 overflow-x-auto px-4 mb-3 no-scrollbar scroll-smooth">
          {quickReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickReplyClick(reply)}
              disabled={disabled || isSending}
              className="whitespace-nowrap px-4 py-1.5 bg-white/60 dark:bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-gray-800 dark:text-gray-200 active:scale-95 transition-all shadow-sm border border-white/40 dark:border-white/5"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      <div className="px-3 flex items-end gap-2.5">
        {/* Left: Camera Icon */}
        {onSendPhoto && (
          <div className="pb-1.5 shrink-0">
            <button
              onClick={() => setIsCameraOpen(true)}
              disabled={disabled || isSending}
              className="flex items-center justify-center p-2 bg-primary rounded-full text-white active:scale-90 transition-all shadow-sm"
              aria-label="Camera"
            >
              <MaterialSymbol name="photo_camera" size={20} filled />
            </button>
            <CameraCapture
              isOpen={isCameraOpen}
              onClose={() => setIsCameraOpen(false)}
              onCapture={onSendPhoto}
            />
            <ImagePicker
              ref={imagePickerRef}
              onImageSelect={onSendPhoto}
              disabled={disabled || isSending}
              hidden
            />
          </div>
        )}

        {/* Center: Input Pill */}
        <div className="flex-1 relative flex items-end bg-white/80 dark:bg-white/10 backdrop-blur-md rounded-[24px] px-3.5 py-1.5 border border-white/50 dark:border-white/5 shadow-sm min-h-[44px]">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? 'Insufficient coins...' : placeholder}
            disabled={disabled || isSending}
            className="flex-1 bg-transparent text-[15px] pb-[7px] pt-[7px] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-[#cc8ea3]/70 focus:outline-none"
          />
          
          {/* Action Icons inside input */}
          <div className="flex items-center gap-2 ml-1 pb-[3px] shrink-0">
            {!message.trim() && (
              <>
                {onSendGift && (
                  <button 
                    className="relative group flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-rose-400 text-white shadow-sm shadow-pink-500/30 hover:-translate-y-0.5 hover:shadow-md active:scale-90 transition-all duration-300"
                    onClick={onSendGift}
                    title="Send Gift"
                  >
                    <MaterialSymbol name="featured_seasonal_and_gifts" size={22} filled />
                    <div className="absolute inset-0 rounded-full w-full h-full animate-ping opacity-0 group-hover:opacity-20 bg-white ease-out duration-1000"></div>
                  </button>
                )}
                {onSendPhoto && (
                  <button 
                    className="relative group flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-400 text-white shadow-sm shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-md active:scale-90 transition-all duration-300"
                    onClick={() => imagePickerRef.current?.pickImage()}
                    title="Send Photo"
                  >
                    <MaterialSymbol name="image" size={22} filled />
                    <div className="absolute inset-0 rounded-full w-full h-full animate-ping opacity-0 group-hover:opacity-20 bg-white ease-out duration-1000"></div>
                  </button>
                )}
              </>
            )}
            
            {message.trim() && (
              <button
                onClick={handleSend}
                className="text-primary font-bold text-sm px-2 py-0.5 active:opacity-50 transition-opacity"
              >
                Send
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
