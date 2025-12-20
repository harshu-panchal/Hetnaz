import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';

interface AdminTopNavbarProps {
  onMenuClick: () => void;
}

export const AdminTopNavbar = ({ onMenuClick }: AdminTopNavbarProps) => {
  return (
    <div className="sticky top-0 z-40 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm lg:ml-64">
      <div className="flex items-center justify-between px-5 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-md">
            <MaterialSymbol name="admin_panel_settings" className="text-white" size={24} filled />
          </div>
          <div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</span>
            <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">MatchMint Administration</p>
          </div>
        </div>

        {/* Hamburger Menu - Only on mobile */}
        <button
          onClick={onMenuClick}
          className="flex items-center justify-center size-11 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95 shadow-sm lg:hidden"
          aria-label="Open menu"
        >
          <MaterialSymbol name="menu" size={24} className="text-gray-900 dark:text-white" />
        </button>
      </div>
    </div>
  );
};

