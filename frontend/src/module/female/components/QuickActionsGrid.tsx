import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { useTranslation } from '../../../core/hooks/useTranslation';

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
      className="group flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/70 dark:bg-black/40 backdrop-blur-md p-5 transition-all duration-300 border border-white/60 dark:border-white/5 shadow-sm"
    >
      <div className="flex size-14 items-center justify-center text-pink-500 group-hover:scale-110 transition-transform duration-500">
        <MaterialSymbol name={action.icon} size={36} className="drop-shadow-sm" filled />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-900 dark:text-white text-center leading-tight">
        {action.label}
      </span>
    </button>
  );
};

export const QuickActionsGrid = ({ actions }: QuickActionsGridProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex w-full flex-col px-4 mb-2">
      <div className="flex items-center gap-3 mb-2 px-1">
        <MaterialSymbol name="bolt" size={22} className="text-pink-500" />
        <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-900 dark:text-white">{t('quickActions')}</h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {actions.map((action) => (
          <QuickActionCard key={action.id} action={action} />
        ))}
      </div>
    </div>
  );
};



