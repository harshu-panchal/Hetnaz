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
    <>
      {/* Mobile & tablet: floating bottom pill */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[346px] md:max-w-xl z-50 bg-white rounded-[2rem] px-3 py-3 shadow-nav">
        <div className="flex justify-around items-center max-w-2xl mx-auto">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              className="flex flex-col items-center gap-1 w-14 relative group active:scale-95 transition-transform duration-150"
            >
              <MaterialSymbol
                name={item.icon}
                filled={item.isActive}
                size={22}
                className={`transition-all duration-200 ${item.isActive
                  ? 'text-pink-600 scale-110'
                  : 'text-muted-light group-hover:text-pink-500 group-hover:scale-105'
                  }`}
              />
              <span
                className={`text-[10px] transition-all duration-200 ${item.isActive
                  ? 'font-extrabold text-pink-600'
                  : 'font-semibold text-muted-light group-hover:text-pink-500'
                  }`}
              >
                {item.label}
              </span>
              {item.hasBadge && (
                <span className="absolute top-0 right-3 h-2 w-2 rounded-full bg-pink-500 border border-white animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Laptop & desktop: persistent left sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 h-screen w-60 z-50 bg-white shadow-nav flex-col px-4 py-8">
        <div className="flex items-center gap-2 px-2 mb-10">
          <div className="h-9 w-9 rounded-xl bg-cta-gradient flex items-center justify-center shrink-0">
            <MaterialSymbol name="favorite" size={18} className="text-white" filled />
          </div>
          <span className="text-lg font-black text-ink tracking-tight">Dil Mate</span>
        </div>
        <nav className="flex flex-col gap-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl relative transition-all duration-200 ${item.isActive
                ? 'bg-pink-50 text-pink-600'
                : 'text-muted hover:bg-[#f6ece7] hover:text-ink'
                }`}
            >
              <MaterialSymbol
                name={item.icon}
                filled={item.isActive}
                size={22}
                className={item.isActive ? 'text-pink-600' : 'text-muted-light'}
              />
              <span className={`text-[14px] ${item.isActive ? 'font-extrabold' : 'font-semibold'}`}>
                {item.label}
              </span>
              {item.hasBadge && (
                <span className="absolute top-2.5 left-8 h-2 w-2 rounded-full bg-pink-500 border border-white animate-pulse" />
              )}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};
