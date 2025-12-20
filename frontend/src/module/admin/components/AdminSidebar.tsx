import { useEffect } from 'react';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';

interface NavItem {
  id: string;
  icon: string;
  label: string;
  isActive?: boolean;
  hasBadge?: boolean;
  badgeCount?: number;
}

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavItem[];
  onItemClick?: (itemId: string) => void;
}

export const AdminSidebar = ({ isOpen, onClose, items, onItemClick }: AdminSidebarProps) => {
  useEffect(() => {
    // Only lock body scroll on mobile when sidebar is open
    const handleResize = () => {
      if (isOpen && window.innerWidth < 1024) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && window.innerWidth < 1024) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose]);

  const handleItemClick = (itemId: string) => {
    onItemClick?.(itemId);
    // Only close sidebar on mobile
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop - Only on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998] animate-[fadeIn_0.2s_ease-out] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 h-full w-64 bg-white dark:bg-[#1a1a1a] z-[9999] transition-transform duration-300 ease-out
          lg:left-0 lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200 lg:dark:border-gray-700
          ${isOpen ? 'right-0 translate-x-0 shadow-2xl' : 'right-0 translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 h-[57px]">
          <div className="flex items-center gap-2">
            <MaterialSymbol name="admin_panel_settings" className="text-blue-600 dark:text-blue-400" size={20} filled />
            <span className="text-base font-bold text-gray-900 dark:text-white">Admin Panel</span>
          </div>
          {/* Close button - Only on mobile */}
          <button
            onClick={onClose}
            className="flex items-center justify-center size-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-95 lg:hidden"
            aria-label="Close menu"
          >
            <MaterialSymbol name="close" size={20} className="text-gray-900 dark:text-white" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col px-3 py-4 overflow-y-auto max-h-[calc(100vh-110px)] custom-scrollbar">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative active:scale-95 mb-0.5 ${item.isActive
                  ? 'bg-blue-50 dark:bg-blue-900/10'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-900/50'
                }`}
            >
              <div
                className={`flex items-center justify-center size-8 rounded-lg transition-all duration-200 ${item.isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-blue-600 group-hover:text-white'
                  }`}
              >
                <MaterialSymbol
                  name={item.icon}
                  filled={item.isActive}
                  size={18}
                />
              </div>
              <div className="flex-1 text-left min-w-0">
                <span
                  className={`text-sm font-medium transition-colors duration-200 truncate block ${item.isActive
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                    }`}
                >
                  {item.label}
                </span>
              </div>
              {item.hasBadge && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold shadow-sm">
                  {item.badgeCount || ''}
                </span>
              )}
              {item.isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-blue-600 rounded-r-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a]">
          <div className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
            MatchMint Admin © {new Date().getFullYear()}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
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

