import { MaterialSymbol } from '../types/material-symbol';

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  iconColor?: string;
  iconBgColor?: string;
}

interface QuickActionsGridProps {
  actions: QuickAction[];
  onActionClick?: (actionId: string) => void;
}

export const QuickActionsGrid = ({ actions, onActionClick }: QuickActionsGridProps) => {
  return (
    <div className={`grid gap-3 w-full ${actions.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onActionClick?.(action.id)}
          className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-gradient-to-br from-white via-pink-50/50 to-rose-50/30 dark:from-[#2d1a24] dark:via-[#3d2530] dark:to-[#2d1a24] border border-pink-200/50 dark:border-pink-900/30 shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 overflow-hidden relative group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-200/20 dark:bg-pink-900/10 rounded-full -mr-12 -mt-12 blur-xl group-hover:bg-pink-300/30 transition-colors"></div>
          <div
            className={`p-3 rounded-xl shadow-md transition-all duration-200 group-hover:scale-110 relative z-10 ${
              action.iconBgColor || 'bg-gradient-to-br from-pink-500/10 to-rose-500/10'
            } ${action.iconColor || 'text-pink-600 dark:text-pink-400'}`}
          >
            <MaterialSymbol name={action.icon} size={28} />
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors relative z-10">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
};

