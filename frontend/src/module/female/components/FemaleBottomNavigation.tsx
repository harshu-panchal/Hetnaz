import { MaterialSymbol } from '../types/material-symbol';

interface NavItem {
  id: string;
  icon: string;
  label: string;
  isActive?: boolean;
  hasBadge?: boolean;
}

interface FemaleBottomNavigationProps {
  items: NavItem[];
  onItemClick?: (itemId: string) => void;
}

export const FemaleBottomNavigation = ({ items, onItemClick }: FemaleBottomNavigationProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#221e10]/95 backdrop-blur-md border-t border-slate-200 dark:border-white/5 pb-5 pt-3 safe-area-inset-bottom">
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
              className={`transition-all duration-200 ${
                item.isActive
                  ? 'text-primary scale-110'
                  : 'text-slate-400 dark:text-[#cbbc90] group-hover:text-primary group-hover:scale-105'
              }`}
            />
            <span
              className={`text-[10px] transition-all duration-200 ${
                item.isActive
                  ? 'font-bold text-primary'
                  : 'font-medium text-slate-400 dark:text-[#cbbc90] group-hover:text-primary'
              }`}
            >
              {item.label}
            </span>
            {item.hasBadge && (
              <span className="absolute top-0 right-3 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};


