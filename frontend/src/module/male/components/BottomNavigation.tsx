import { MaterialSymbol } from '../types/material-symbol';

interface NavItem {
  id: string;
  icon: string;
  label: string;
  isActive?: boolean;
  hasBadge?: boolean;
}

interface BottomNavigationProps {
  items: NavItem[];
  onItemClick?: (itemId: string) => void;
}

export const BottomNavigation = ({ items, onItemClick }: BottomNavigationProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-pink-50/95 via-rose-50/95 to-pink-50/95 dark:from-[#1a0f14]/95 dark:via-[#2d1a24]/95 dark:to-[#1a0f14]/95 backdrop-blur-lg border-t border-pink-200/50 dark:border-pink-900/30 shadow-lg pt-3 safe-area-inset-bottom">
      <div className="flex justify-around items-center">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick?.(item.id)}
            className="flex flex-col items-center gap-1 w-16 relative group active:scale-95 transition-transform duration-150"
          >
            {item.isActive && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-b-full shadow-md"></div>
            )}
            <div className={`p-2 rounded-xl transition-all duration-200 ${item.isActive
                ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg scale-110'
                : 'bg-pink-100/50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 group-hover:bg-gradient-to-br group-hover:from-pink-400 group-hover:to-rose-400 group-hover:text-white group-hover:scale-105'
              }`}>
              <MaterialSymbol
                name={item.icon}
                filled={item.isActive}
                size={24}
              />
            </div>
            <span
              className={`text-[10px] transition-all duration-200 ${item.isActive
                  ? 'font-bold text-pink-700 dark:text-pink-300'
                  : 'font-medium text-pink-600/70 dark:text-pink-400/70 group-hover:text-pink-700 dark:group-hover:text-pink-300'
                }`}
            >
              {item.label}
            </span>
            {item.hasBadge && (
              <span className="absolute top-0 right-3 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 animate-pulse shadow-md ring-1 ring-white/50" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

