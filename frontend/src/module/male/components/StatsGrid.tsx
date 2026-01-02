import { MaterialSymbol } from '../types/material-symbol';
import { useTranslation } from '../../../core/hooks/useTranslation';

interface StatsGridProps {
  stats: {
    matches: number;
    sent: number;
  };
}

const StatCard = ({ icon, value, label, color, bgGradient }: {
  icon: string;
  value: number;
  label: string;
  color: string;
  bgGradient: string;
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden relative ${bgGradient}`}>
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 dark:bg-white/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} shadow-md transition-transform group-hover:scale-110 relative z-10`}>
        <MaterialSymbol name={icon} filled />
      </div>
      <div className="text-center relative z-10">
        <p className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
          {value}
        </p>
        <p className="text-xs font-semibold text-pink-600/80 dark:text-pink-400/80 mt-0.5">{label}</p>
      </div>
    </div>
  );
};

export const StatsGrid = ({ stats }: StatsGridProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col px-4 mb-4">
      <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span className="text-pink-500">💖</span> {t('quickStats')}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon="favorite"
          value={stats.matches}
          label={t('matches')}
          color="bg-gradient-to-br from-pink-500 to-rose-500 text-white"
          bgGradient="bg-gradient-to-br from-white via-pink-50/50 to-rose-50/30 dark:from-[#2d1a24] dark:via-[#3d2530] dark:to-[#2d1a24] border border-pink-200/50 dark:border-pink-900/30"
        />
        <StatCard
          icon="send"
          value={stats.sent}
          label={t('sent')}
          color="bg-gradient-to-br from-pink-400 to-rose-400 text-white"
          bgGradient="bg-gradient-to-br from-white via-pink-50/50 to-rose-50/30 dark:from-[#2d1a24] dark:via-[#3d2530] dark:to-[#2d1a24] border border-pink-200/50 dark:border-pink-900/30"
        />
      </div>
    </div>
  );
};

