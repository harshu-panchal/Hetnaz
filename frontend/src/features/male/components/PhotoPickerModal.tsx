import { useState, useRef } from 'react';
import { MaterialSymbol } from '../types/material-symbol';

interface PhotoPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoSelect: (file: File) => void;
}

export const PhotoPickerModal = ({ isOpen, onClose, onPhotoSelect }: PhotoPickerModalProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = () => {
    if (selectedFile) {
      onPhotoSelect(selectedFile);
      handleClose();
    }
  };

  const handleClose = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-[fadeIn_0.2s_ease-out]"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#2f151e] rounded-t-3xl shadow-2xl photo-picker-slide-up safe-area-inset-bottom max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#2f151e] border-b border-gray-200 dark:border-gray-700 z-10">
          <div className="flex items-center justify-between px-4 py-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Select Photo</h2>
            <button
              onClick={handleClose}
              className="flex items-center justify-center size-10 rounded-full bg-gray-100 dark:bg-[#342d18] text-slate-600 dark:text-white hover:bg-gray-200 dark:hover:bg-[#4b202e] transition-colors active:scale-95"
              aria-label="Close"
            >
              <MaterialSymbol name="close" size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Preview Area */}
          {preview ? (
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => {
                  setPreview(null);
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="absolute top-2 right-2 flex items-center justify-center size-8 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                aria-label="Remove photo"
              >
                <MaterialSymbol name="close" size={20} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center w-full aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:border-primary transition-colors"
            >
              <MaterialSymbol
                name="add_photo_alternate"
                size={48}
                className="text-gray-400 dark:text-gray-500 mb-2"
              />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tap to select photo
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                JPG, PNG up to 10MB
              </p>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 h-12 bg-gray-100 dark:bg-[#2f151e] text-slate-700 dark:text-white font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-[#342d18] transition-colors active:scale-95"
            >
              {preview ? 'Change Photo' : 'Select Photo'}
            </button>
            {preview && (
              <button
                onClick={handleSend}
                className="flex-1 h-12 bg-primary text-[#231d10] font-semibold rounded-xl hover:bg-primary/90 transition-colors active:scale-95"
              >
                Send Photo
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};


