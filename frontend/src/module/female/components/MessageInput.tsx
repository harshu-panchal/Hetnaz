import { useState, useRef, useEffect } from 'react';
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (value && onTypingStart) onTypingStart();

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (onTypingStop) onTypingStop();
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <div className="relative px-4 pt-3 pb-6 bg-white/80 backdrop-blur-3xl border-t border-slate-100 z-20">
      {onSendPhoto && (
        <>
          <ImagePicker
            ref={imagePickerRef}
            onImageSelect={onSendPhoto}
            disabled={disabled || isSending}
            hidden
          />
        </>
      )}

      {/* Main Input Row - Light Theme */}
      <div className="flex items-center gap-2">
        {onSendPhoto && (
          <div className="flex items-center gap-1 shrink-0">
             <button
                onClick={() => imagePickerRef.current?.pickImage()}
                disabled={disabled || isSending}
                className="size-11 rounded-2xl flex items-center justify-center bg-slate-100 text-slate-400 hover:text-pink-500 hover:bg-pink-50 transition-all active:scale-90 disabled:opacity-50"
                aria-label="Send Photo"
              >
                <MaterialSymbol name="image" size={24} />
              </button>

              <button
                onClick={onCameraRequest}
                disabled={disabled || isSending}
                className="size-11 rounded-2xl flex items-center justify-center bg-slate-100 text-slate-400 hover:text-pink-500 hover:bg-pink-50 transition-all active:scale-90 disabled:opacity-50"
                aria-label="Take Photo"
              >
                <MaterialSymbol name="photo_camera" size={24} />
              </button>
          </div>
        )}

        {/* Light Glass Input */}
        <div className="flex-1 relative group">
           <div className="bg-slate-100 rounded-full p-1 px-4 border border-transparent focus-within:border-pink-200 focus-within:bg-white transition-all flex items-center h-12">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={disabled || isSending}
                className="w-full bg-transparent text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400"
              />
           </div>
        </div>

        {/* Clean Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isSending}
          className="size-12 rounded-full flex items-center justify-center bg-pink-500 text-white shadow-lg active:scale-90 transition-all shrink-0 disabled:opacity-20 disabled:grayscale disabled:scale-95 disabled:shadow-none"
          aria-label={t('sendMessage')}
        >
          {isSending ? (
            <div className="size-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <MaterialSymbol name="send" size={22} className="relative z-10 translate-x-0.5" filled />
          )}
        </button>
      </div>

      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 text-center">
        {t('messagesAreFreeForYou')}
      </p>
    </div>
  );
};
