import { useState } from 'react';
import { MaterialSymbol } from '../types/material-symbol';

interface ChatMoreOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBlock?: () => void;
  onReport?: () => void;
  onDelete?: () => void;
  onViewProfile?: () => void;
  userName?: string;
  isBlocked?: boolean;
}

export const ChatMoreOptionsModal = ({
  isOpen,
  onClose,
  onBlock,
  onReport,
  onDelete,
  onViewProfile,
  userName,
  isBlocked = false,
}: ChatMoreOptionsModalProps) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmBlock, setShowConfirmBlock] = useState(false);

  if (!isOpen) return null;

  const handleDelete = () => {
    if (showConfirmDelete) {
      onDelete?.();
      handleClose();
    } else {
      setShowConfirmDelete(true);
    }
  };

  const handleBlock = () => {
    if (showConfirmBlock) {
      onBlock?.();
      handleClose();
    } else {
      setShowConfirmBlock(true);
    }
  };

  const handleClose = () => {
    setShowConfirmDelete(false);
    setShowConfirmBlock(false);
    onClose();
  };

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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {showConfirmDelete
                ? 'Delete Chat'
                : showConfirmBlock
                  ? (isBlocked ? 'Unblock User' : 'Block User')
                  : 'More Options'}
            </h2>
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
        <div className="p-4">
          {showConfirmDelete ? (
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to delete this chat? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 h-12 bg-gray-100 dark:bg-[#2f151e] text-slate-700 dark:text-white font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-[#342d18] transition-colors active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 h-12 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors active:scale-95"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : showConfirmBlock ? (
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {isBlocked
                  ? `Are you sure you want to unblock ${userName || 'this user'}?`
                  : `Are you sure you want to block ${userName || 'this user'}? You won't be able to message each other.`}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 h-12 bg-gray-100 dark:bg-[#2f151e] text-slate-700 dark:text-white font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-[#342d18] transition-colors active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlock}
                  className="flex-1 h-12 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors active:scale-95"
                >
                  {isBlocked ? 'Unblock' : 'Block'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={onViewProfile}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-[#342d18] hover:bg-gray-100 dark:hover:bg-[#3d2a1a] transition-colors active:scale-95"
              >
                <div className="flex items-center justify-center size-10 rounded-full bg-primary/10">
                  <MaterialSymbol name="person" size={24} className="text-primary" />
                </div>
                <span className="flex-1 text-left font-medium text-slate-900 dark:text-white">
                  View Profile
                </span>
                <MaterialSymbol name="chevron_right" size={20} className="text-gray-400" />
              </button>

              <button
                onClick={onReport}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-[#342d18] hover:bg-gray-100 dark:hover:bg-[#3d2a1a] transition-colors active:scale-95"
              >
                <div className="flex items-center justify-center size-10 rounded-full bg-orange-500/10">
                  <MaterialSymbol name="report" size={24} className="text-orange-500" />
                </div>
                <span className="flex-1 text-left font-medium text-slate-900 dark:text-white">
                  Report User
                </span>
                <MaterialSymbol name="chevron_right" size={20} className="text-gray-400" />
              </button>

              <button
                onClick={handleBlock}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-[#342d18] hover:bg-gray-100 dark:hover:bg-[#3d2a1a] transition-colors active:scale-95"
              >
                <div className={`flex items-center justify-center size-10 rounded-full ${isBlocked ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  <MaterialSymbol name={isBlocked ? 'check_circle' : 'block'} size={24} className={isBlocked ? 'text-green-500' : 'text-red-500'} />
                </div>
                <span className="flex-1 text-left font-medium text-slate-900 dark:text-white">
                  {isBlocked ? 'Unblock User' : 'Block User'}
                </span>
                <MaterialSymbol name="chevron_right" size={20} className="text-gray-400" />
              </button>

              <div className="h-2" />

              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors active:scale-95"
              >
                <div className="flex items-center justify-center size-10 rounded-full bg-red-500/20">
                  <MaterialSymbol name="delete" size={24} className="text-red-500" />
                </div>
                <span className="flex-1 text-left font-medium text-red-600 dark:text-red-400">
                  Delete Chat
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};



