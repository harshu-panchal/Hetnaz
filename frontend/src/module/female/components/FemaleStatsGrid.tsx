import { MaterialSymbol } from '../types/material-symbol';
import { useTranslation } from '../../../core/hooks/useTranslation';

interface FemaleStatsGridProps {
  stats: {
    messagesReceived: number;
    activeConversations: number;
    profileViews?: number;
  };
}

const StatCard = ({ icon, value, label, iconColor }: {
  icon: string;
  value: number;
  label: string;
  iconColor: string;
}) => {
  return (
    <div className="group flex flex-col items-center justify-center gap-3 rounded-3xl bg-white/70 dark:bg-black/40 backdrop-blur-md p-5 transition-all duration-300">
      <div className={`flex size-14 items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
        <MaterialSymbol name={icon} className={`${iconColor}`} size={32} filled />
      </div>
      <div className="text-center space-y-0.5">
        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
          {value.toLocaleString()}
        </p>
        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">{label}</p>
      </div>
    </div>
  );
};

export const FemaleStatsGrid = ({ stats }: FemaleStatsGridProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex w-full flex-col px-4 mb-2">
      <div className="flex items-center gap-3 mb-2 px-1">
        <MaterialSymbol name="insights" size={22} className="text-pink-500" />
        <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-900 dark:text-white">{t('yourStats')}</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon="mail"
          value={stats.messagesReceived}
          label={t('messages')}
          iconColor="text-blue-500"
        />
        <StatCard
          icon="chat_bubble"
          value={stats.activeConversations}
          label={t('chats')}
          iconColor="text-purple-500"
        />
      </div>
    </div>
  );
};



