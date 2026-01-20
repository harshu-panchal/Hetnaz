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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#1a0f14]/95 backdrop-blur-md border-t border-pink-100 dark:border-pink-900/30 pt-3 safe-area-inset-bottom">
      <div className="flex justify-around items-center">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick?.(item.id)}
            className="flex flex-col items-center gap-1 w-16 relative group active:scale-95 transition-transform duration-150"
          >
            <MaterialSymbol
              name={item.icon}
              filled={item.isActive}
              size={24}
              className={`transition-all duration-200 ${item.isActive
                ? 'text-pink-600 scale-110'
                : 'text-gray-400 dark:text-gray-500 group-hover:text-pink-500 group-hover:scale-105'
                }`}
            />
            <span
              className={`text-[10px] transition-all duration-200 ${item.isActive
                ? 'font-bold text-pink-600'
                : 'font-medium text-gray-400 dark:text-gray-500 group-hover:text-pink-500'
                }`}
            >
              {item.label}
            </span>
            {item.hasBadge && (
              <span className="absolute top-0 right-3 h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

