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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white dark:bg-[#342d18] rounded-2xl shadow-xl max-w-md w-full p-6 pointer-events-auto animate-[slideUp_0.3s_ease-out]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Select Photo</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <MaterialSymbol name="close" />
            </button>
          </div>

          {preview ? (
            <div className="space-y-4">
              <img src={preview} alt="Preview" className="w-full rounded-lg" />
              <div className="flex gap-2">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-[#4a212f] text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#5e2a3c] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a2515] transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <MaterialSymbol name="add_photo_alternate" size={48} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-500 dark:text-[#cbbc90]">Tap to select photo</span>
              </label>
              <button
                onClick={handleClose}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-[#4a212f] text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#5e2a3c] transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};


