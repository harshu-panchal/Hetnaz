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
    textClass: 'text-[#cbb790]',
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
    textClass: 'text-cyan-300',
    iconClass: 'text-cyan-400',
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
    <div className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#3a301e] to-[#2a2315] border border-primary/20 shadow-lg p-6 flex flex-col items-center justify-center gap-4">
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-3 p-1 rounded-full border-2 border-primary shadow-[0_0_15px_rgba(242,166,13,0.3)]">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-20 w-20"
            style={{ backgroundImage: `url("${userAvatar || defaultAvatar}")` }}
            aria-label="User Avatar"
          />
        </div>

        <div className="flex items-center gap-2 mb-1">
          <MaterialSymbol name="verified" filled size={20} className={style.iconClass} />
          <p className={`text-sm font-medium uppercase tracking-wide ${style.textClass}`}>
            {tierLabel}
          </p>
        </div>

        <h1 className="text-white text-4xl font-bold leading-tight tracking-tight mt-1 flex items-center gap-2">
          {formattedBalance}
          <MaterialSymbol name="monetization_on" filled size={32} className="text-primary" />
        </h1>

        <p className="text-white/60 text-xs mt-2">
          {t('yourCoinBalance')}
        </p>
      </div>
    </div>
  );
};
