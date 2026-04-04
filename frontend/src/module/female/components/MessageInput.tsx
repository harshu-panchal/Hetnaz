import { useState, useRef, useEffect, useCallback } from 'react';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { ImagePicker, ImagePickerRef } from '../../../shared/components/ImagePicker';
import { useTranslation } from '../../../core/hooks/useTranslation';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onSendPhoto?: (base64: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  placeholder?: string;
  disabled?: boolean;
  isSending?: boolean;
  onCameraRequest?: () => void;
}

export const MessageInput = ({
  onSendMessage,
  onSendPhoto,
  onTypingStart,
  onTypingStop,
  placeholder = 'Type a message...',
  disabled = false,
  isSending = false,
  onCameraRequest,
}: MessageInputProps) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imagePickerRef = useRef<ImagePickerRef>(null);

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

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (value && onTypingStart) onTypingStart();

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (onTypingStop) onTypingStop();
    }, 2000);
  }, [onTypingStart, onTypingStop]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <div className="relative px-3 pt-3 pb-6 bg-white/70 backdrop-blur-3xl border-t border-slate-100 z-20 transition-all duration-300">
      {onSendPhoto && (
        <ImagePicker
          ref={imagePickerRef}
          onImageSelect={onSendPhoto}
          disabled={disabled || isSending}
          hidden
        />
      )}

      <div className="flex items-end gap-2.5">
        {/* Animated Icons Container */}
        <div 
          className="flex items-center gap-2 overflow-hidden transition-all duration-500 ease-in-out h-11 shrink-0"
          style={{ width: message.trim() ? '0px' : '92px', opacity: message.trim() ? 0 : 1 }}
        >
          {onSendPhoto && (
            <div className="flex items-center gap-2">
               <button
                  onClick={() => imagePickerRef.current?.pickImage()}
                  disabled={disabled || isSending}
                  className="size-11 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-400 hover:text-pink-500 hover:bg-pink-50 border border-slate-100 transition-all active:scale-90 disabled:opacity-50"
                  aria-label="Send Photo"
                >
                  <MaterialSymbol name="image" size={22} />
                </button>

                <button
                  onClick={onCameraRequest}
                  disabled={disabled || isSending}
                  className="size-11 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-400 hover:text-pink-500 hover:bg-pink-50 border border-slate-100 transition-all active:scale-90 disabled:opacity-50"
                  aria-label="Take Photo"
                >
                  <MaterialSymbol name="photo_camera" size={22} />
                </button>
            </div>
          )}
        </div>

        {/* Premium Glass Input */}
        <div className="flex-1 min-h-[44px] relative flex items-end bg-slate-50 backdrop-blur-md rounded-[22px] px-4 py-1.5 border border-slate-100 transition-all focus-within:border-pink-200 focus-within:bg-white shadow-sm">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className="w-full bg-transparent text-[15px] pb-1.5 pt-1.5 font-medium text-slate-800 outline-none placeholder:text-slate-400"
          />
          
          {/* Animated Send Arrow */}
          <div className={`absolute right-1 transition-all duration-500 transform ${message.trim() ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 rotate-45 pointer-events-none'}`}>
            <button
              onClick={handleSend}
              disabled={isSending || !message.trim()}
              className="flex items-center justify-center size-9 rounded-full bg-pink-500 text-white shadow-lg shadow-pink-500/20 active:scale-90 transition-all group"
            >
              <MaterialSymbol 
                name="arrow_upward" 
                size={22} 
                filled={message.trim().length > 0}
                className="group-hover:-translate-y-0.5 transition-transform" 
              />
            </button>
          </div>
        </div>
      </div>

      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 text-center">
        {t('messagesAreFreeForYou') || 'MESSAGES ARE FREE FOR YOU'}
      </p>
    </div>
  );
};
