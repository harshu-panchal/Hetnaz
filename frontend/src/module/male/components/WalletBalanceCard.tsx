import { MaterialSymbol } from '../types/material-symbol';
import { useTranslation } from '../../../core/hooks/useTranslation';

interface WalletBalanceCardProps {
  balance: number;
  memberTier?: 'basic' | 'silver' | 'gold' | 'platinum';
  userAvatar?: string;
}

// Tier styling config
const tierStyles = {
  basic: {
    labelKey: 'freeMember',
    icon: null,
    textClass: 'text-primary/90',
    iconClass: 'text-primary',
  },
  silver: {
    labelKey: 'SILVER',
    icon: '⭐',
    textClass: 'text-gray-300',
    iconClass: 'text-gray-400',
  },
  gold: {
    labelKey: 'GOLD',
    icon: '👑',
    textClass: 'text-yellow-400',
    iconClass: 'text-yellow-500',
  },
  platinum: {
    labelKey: 'PLATINUM',
    icon: '💎',
    textClass: 'text-purple-600',
    iconClass: 'text-purple-500',
  },
};

export const WalletBalanceCard = ({
  balance,
  memberTier = 'basic',
  userAvatar,
}: WalletBalanceCardProps) => {
  const { t } = useTranslation();
  const formattedBalance = (balance || 0).toLocaleString();
  const defaultAvatar =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBoS_YLtV4hpNVbbyf0nrVmbQX6vzgn-xGLdye-t2gBz0LRib9HX4PeYJIj364IRM63hBRKmTLtWfuVOfikvNIryKKMjql6Ig1suPsbWoA45Vt8rO0N-wt7qwqIwMBV4Gaw6j7ooJER4L9QExcc20SNkyk1schLm-swXJOgx5ez3objGGhUPsbWoA45Vt8rO0N-wt7qwqIwMBV4Gaw6j7ooJER4L9QExcc20SNkyk1schLm-swXJOgx5ez3objGGhUPZpOMLYRY2W5WgHwClZhJ-JaWw470QybQVyCQD-hZYfamq_iJqx0EAJE0UNaa6Ee3_FbUUYSuUIIViQ_QxI6ytCepxc';

  const currentTier = memberTier || 'basic';
  const style = tierStyles[currentTier] || tierStyles.basic;
  const tierLabel = currentTier === 'basic'
    ? t('freeMember')
    : `${style.icon || ''} ${t(style.labelKey)} ${t('member')}`;

  return (
    <div className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 via-rose-100/50 to-orange-50 border border-pink-200/50 shadow-xl p-8 flex flex-col items-center justify-center gap-5">
      {/* Background decoration */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-orange-200/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-rose-200/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(244,192,37,0.1),transparent_70%)]" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-4 p-1 rounded-full border-2 border-primary shadow-[0_0_20px_rgba(244,192,37,0.2)] bg-white/50 transition-transform hover:scale-105 duration-300">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24"
            style={{ backgroundImage: `url("${userAvatar || defaultAvatar}")` }}
            aria-label="User Avatar"
          />
        </div>

        <div className="flex items-center gap-2 mb-2 bg-white/60 px-3 py-1 rounded-full border border-pink-200 backdrop-blur-sm shadow-sm">
          <MaterialSymbol name="verified" filled size={18} className={style.iconClass} />
          <p className={`text-[10px] font-black uppercase tracking-[0.1em] ${style.textClass}`}>
            {tierLabel}
          </p>
        </div>

        <h1 className="text-slate-900 text-5xl font-black leading-none tracking-tight mt-1 flex items-center gap-3">
          {formattedBalance}
          <MaterialSymbol name="monetization_on" filled size={36} className="text-primary" />
        </h1>

        <p className="text-slate-500 text-xs mt-2">
          {t('yourCoinBalance')}
        </p>
      </div>
    </div>
  );
};
