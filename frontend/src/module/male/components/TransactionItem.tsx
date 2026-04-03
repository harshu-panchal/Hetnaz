import { MaterialSymbol } from '../types/material-symbol';

export type TransactionType = 'purchase' | 'spent' | 'bonus' | 'gift' | 'other';

interface TransactionItemProps {
  id: string;
  type: TransactionType;
  title: string;
  timestamp: string;
  amount: number;
  isPositive: boolean;
}

export const TransactionItem = ({
  type,
  title,
  timestamp,
  amount,
  isPositive,
}: TransactionItemProps) => {
  const getIconData = () => {
    switch (type) {
      case 'purchase':
        return { name: 'add', color: 'text-[#FFD93D]', bgColor: 'bg-[#FFD93D]/10' };
      case 'spent':
        return { name: 'favorite', color: 'text-rose-500', bgColor: 'bg-rose-500/10' };
      case 'bonus':
        return { name: 'event_available', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' };
      case 'gift':
        return { name: 'redeem', color: 'text-purple-500', bgColor: 'bg-purple-500/10' };
      default:
        return { name: 'monetization_on', color: 'text-blue-500', bgColor: 'bg-blue-500/10' };
    }
  };

  const icon = getIconData();

  return (
    <div className={`group glass-card rounded-2xl p-4 flex items-center justify-between transition-all hover:translate-x-1 duration-300 border-white/60 dark:border-white/10 ${isPositive ? 'shadow-[inset_0_1px_10px_rgba(255,217,61,0.05)]' : ''}`}>
      <div className="flex items-center gap-4">
        {/* Skeuomorphic Icon Container */}
        <div className={`flex items-center justify-center size-12 rounded-2xl skeuo-inset shrink-0 ${icon.bgColor}`}>
          <MaterialSymbol name={icon.name as any} size={24} className={icon.color} filled />
        </div>
        
        <div className="flex flex-col space-y-0.5">
          <p className="text-slate-900 dark:text-white text-[13px] font-black tracking-tight leading-none truncate max-w-[180px]">
            {title}
          </p>
          <div className="flex items-center gap-1.5 opacity-60">
             <MaterialSymbol name="schedule" size={10} className="text-slate-400" />
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                {timestamp}
             </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end">
        <p className={`text-sm font-black tracking-tighter ${isPositive ? 'text-[#FFD93D] text-glow-gold' : 'text-slate-400 dark:text-slate-500'}`}>
          {isPositive ? '+' : '-'}
          {Math.abs(amount).toLocaleString()}
        </p>
        {isPositive && (
           <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#FFD93D] opacity-60 mt-0.5">COINS</span>
        )}
      </div>
    </div>
  );
};
