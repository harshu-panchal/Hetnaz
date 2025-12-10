import { MaterialSymbol } from '../types/material-symbol';

interface FemaleStatsGridProps {
  stats: {
    messagesReceived: number;
    activeConversations: number;
    profileViews: number;
  };
}

const StatCard = ({ icon, value, label, color }: {
  icon: string;
  value: number;
  label: string;
  color: string;
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-4 shadow-sm dark:bg-[#342d18] hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer">
      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${color} transition-transform group-hover:scale-110`}>
        <MaterialSymbol name={icon} filled />
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
          {value}
        </p>
        <p className="text-xs font-medium text-slate-500 dark:text-[#cbbc90]">{label}</p>
      </div>
    </div>
  );
};

export const FemaleStatsGrid = ({ stats }: FemaleStatsGridProps) => {
  return (
    <div className="flex w-full flex-col px-4">
      <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">Your Stats</h2>
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon="mail"
          value={stats.messagesReceived}
          label="Messages"
          color="bg-blue-100 dark:bg-blue-900/30 text-blue-500"
        />
        <StatCard
          icon="chat_bubble"
          value={stats.activeConversations}
          label="Chats"
          color="bg-purple-100 dark:bg-purple-900/30 text-purple-500"
        />
        <StatCard
          icon="visibility"
          value={stats.profileViews}
          label="Views"
          color="bg-amber-100 dark:bg-amber-900/30 text-amber-500"
        />
      </div>
    </div>
  );
};


