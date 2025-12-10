import { MaterialSymbol } from '../types/material-symbol';

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  onClick?: () => void;
}

interface QuickActionsGridProps {
  actions: QuickAction[];
}

const QuickActionCard = ({ action }: { action: QuickAction }) => {
  return (
    <button
      onClick={action.onClick}
      className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white dark:bg-[#342d18] p-4 shadow-sm hover:scale-105 active:scale-95 transition-transform duration-200"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MaterialSymbol name={action.icon} filled />
      </div>
      <span className="text-xs font-medium text-slate-700 dark:text-[#cbbc90] text-center">
        {action.label}
      </span>
    </button>
  );
};

export const QuickActionsGrid = ({ actions }: QuickActionsGridProps) => {
  return (
    <div className="flex w-full flex-col px-4">
      <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">Quick Actions</h2>
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action) => (
          <QuickActionCard key={action.id} action={action} />
        ))}
      </div>
    </div>
  );
};


