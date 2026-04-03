import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { useTranslation } from '../../../core/hooks/useTranslation';

interface StatsGridProps {
  stats: {
    matches: number;
    sent: number;
    views?: number;
  };
}

export const StatsGrid = ({ stats }: StatsGridProps) => {
  const { t } = useTranslation();

  // Mock views if not provided
  const viewCount = stats.views || Math.floor(stats.matches * 4.5) + (stats.sent * 2) + 42;

  const activityStats = [
    {
      id: 'views',
      label: 'TOTAL VIEWS',
      value: viewCount,
      icon: 'visibility',
      color: 'text-blue-500',
    },
    {
      id: 'messages',
      label: 'MESSAGES',
      value: stats.sent,
      icon: 'chat_bubble',
      color: 'text-purple-500',
    },
    {
      id: 'matched',
      label: 'MATCHED',
      value: stats.matches,
      icon: 'favorite',
      color: 'text-pink-500',
    },
  ];

  return (
    <div className="px-1 mb-10 w-full">
      <div className="skeuo-card rounded-[2.5rem] p-8 shadow-2xl bg-white/40 dark:bg-black/10 border-white/60 dark:border-white/5 relative overflow-hidden">
        {/* Subtle glass reflection overlay */}
        <div className="absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        
        <div className="flex items-center justify-between mb-8 relative z-10 px-1">
          <div className="flex items-center gap-3">
             <div className="size-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
             <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-900 dark:text-white">
               {t('quickStats')}
             </h2>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
             <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.15em] animate-pulse">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 relative z-10">
          {activityStats.map((stat) => (
            <div key={stat.id} className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform">
              <div className="skeuo-inset size-14 rounded-2xl flex items-center justify-center bg-gray-50/50 dark:bg-black/40 mb-4 border-white/20 dark:border-white/5 shadow-inner">
                <MaterialSymbol name={stat.icon as any} className={`${stat.color} drop-shadow-[0_2px_8px_rgba(0,0,0,0.1)]`} size={24} filled />
              </div>
              <span className="text-[22px] font-black text-slate-900 dark:text-white tracking-tighter leading-none group-hover:text-primary transition-colors drop-shadow-sm">
                {stat.value.toLocaleString()}
              </span>
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-2 px-1 text-center leading-tight">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
