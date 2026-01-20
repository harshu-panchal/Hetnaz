// @ts-nocheck
import { useEffect } from 'react';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import type { AdminUser } from '../types/admin.types';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
  onBlockToggle?: (userId: string, isBlocked: boolean) => void;
  onDelete?: (userId: string) => void;
}

export const UserDetailModal = ({
  isOpen,
  onClose,
  user,
  onBlockToggle,
  onDelete,
}: UserDetailModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[9998] animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden pointer-events-auto animate-[slideUp_0.3s_ease-out]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                  {user.isVerified && (
                    <MaterialSymbol
                      name="verified"
                      className="text-blue-600 dark:text-blue-400"
                      size={24}
                    />
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center size-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close"
            >
              <MaterialSymbol name="close" size={24} className="text-gray-900 dark:text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="space-y-6">
              {/* Status Badges */}
              <div className="flex flex-wrap gap-3">
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${user.role === 'male'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                    : 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300'
                    }`}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)} User
                </span>
                {user.isBlocked ? (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                    <MaterialSymbol name="block" size={16} className="mr-1" />
                    Blocked
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                    <MaterialSymbol name="check_circle" size={16} className="mr-1" />
                    Active
                  </span>
                )}
                {user.isVerified ? (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    <MaterialSymbol name="verified" size={16} className="mr-1" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                    <MaterialSymbol name="cancel" size={16} className="mr-1" />
                    Unverified
                  </span>
                )}
              </div>

              {/* Profile Information */}
              {user.profile && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Profile Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">{user.profile.age}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">City</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">{user.profile.city}</p>
                    </div>
                    {user.profile.bio && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Bio</p>
                        <p className="text-base text-gray-900 dark:text-white">{user.profile.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Account Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">User ID</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">{user.id}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
                    <p className="text-sm text-gray-900 dark:text-white">{user.email}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Registered</p>
                    <p className="text-sm text-gray-900 dark:text-white">{formatDate(user.createdAt)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Login</p>
                    <p className="text-sm text-gray-900 dark:text-white">{formatDate(user.lastLoginAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onBlockToggle?.(user.id, !user.isBlocked);
                  onClose();
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${user.isBlocked
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
              >
                {user.isBlocked ? (
                  <>
                    <MaterialSymbol name="lock_open" size={20} className="inline mr-1" />
                    Unblock User
                  </>
                ) : (
                  <>
                    <MaterialSymbol name="block" size={20} className="inline mr-1" />
                    Block User
                  </>
                )}
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
                    onDelete?.(user.id);
                    onClose();
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                <MaterialSymbol name="delete" size={20} className="inline mr-1" />
                Delete User
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

