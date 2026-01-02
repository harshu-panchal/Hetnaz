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
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
        <div
          className="bg-white dark:bg-[#342d18] rounded-t-2xl shadow-xl w-full max-w-md p-6 pointer-events-auto animate-[slideUp_0.3s_ease-out]"
          onClick={(e) => e.stopPropagation()}
        >
          {showConfirmDelete ? (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Chat?</h3>
              <p className="text-sm text-gray-500 dark:text-[#cbbc90]">
                This will permanently delete this conversation. This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-[#4a212f] text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#5e2a3c] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : showConfirmBlock ? (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Block User?</h3>
              <p className="text-sm text-gray-500 dark:text-[#cbbc90]">
                You will no longer receive messages from {userName || 'this user'}. You can unblock them later.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-[#4a212f] text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#5e2a3c] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlock}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Block
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Options</h3>
              {onViewProfile && (
                <button
                  onClick={() => {
                    onViewProfile();
                    handleClose();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2515] transition-colors text-left"
                >
                  <MaterialSymbol name="person" />
                  <span className="text-gray-900 dark:text-white">View Profile</span>
                </button>
              )}
              {onBlock && (
                <button
                  onClick={handleBlock}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2515] transition-colors text-left"
                >
                  <MaterialSymbol name={isBlocked ? 'check_circle' : 'block'} />
                  <span className="text-gray-900 dark:text-white">{isBlocked ? 'Unblock User' : 'Block User'}</span>
                </button>
              )}
              {onReport && (
                <button
                  onClick={() => {
                    onReport();
                    handleClose();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2515] transition-colors text-left"
                >
                  <MaterialSymbol name="flag" />
                  <span className="text-gray-900 dark:text-white">Report User</span>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2515] transition-colors text-left text-red-500"
                >
                  <MaterialSymbol name="delete" />
                  <span>Delete Chat</span>
                </button>
              )}
              <button
                onClick={handleClose}
                className="w-full mt-4 px-4 py-2 bg-gray-200 dark:bg-[#4a212f] text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#5e2a3c] transition-colors"
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


