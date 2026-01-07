import { MaterialSymbol } from '../types/material-symbol';
import { useTranslation } from '../../../core/hooks/useTranslation';

interface ProfileHeaderProps {
  user: {
    name: string;
    avatar: string;
    isPremium: boolean;
    isOnline: boolean;
    memberTier?: 'basic' | 'silver' | 'gold' | 'platinum';
  };
  onEditClick?: () => void;
}

// Tier configuration for display
const tierConfig = {
  basic: {
    label: 'BASIC',
    labelKey: 'BASIC',
    icon: null,
    textClass: 'text-gray-600 dark:text-gray-400',
    bgClass: '',
  },
  silver: {
    label: 'SILVER',
    labelKey: 'SILVER',
    icon: '⭐',
    textClass: 'text-gray-500 dark:text-gray-300',
    bgClass: 'bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600',
  },
  gold: {
    label: 'GOLD',
    labelKey: 'GOLD',
    icon: '👑',
    textClass: 'text-yellow-600 dark:text-yellow-400',
    bgClass: 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30',
  },
  platinum: {
    label: 'PLATINUM',
    labelKey: 'PLATINUM',
    icon: '💎',
    textClass: 'text-purple-600 dark:text-cyan-400',
    bgClass: 'bg-gradient-to-r from-purple-100 to-cyan-100 dark:from-purple-900/30 dark:to-cyan-900/30',
  },
};

export const ProfileHeader = ({ user, onEditClick }: ProfileHeaderProps) => {
  const { t } = useTranslation();

  const currentTier = user.memberTier || 'basic';
  const config = tierConfig[currentTier] || tierConfig.basic;
  const tierLabel = t(config.labelKey) || config.label;

  // Render membership badge
  const renderMembershipBadge = () => {
    if (currentTier === 'basic') {
      return (
        <span className={`text-sm font-semibold ${config.textClass}`}>
          {t('freeMember')}
        </span>
      );
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-bold ${config.bgClass} ${config.textClass}`}>
        {config.icon && <span>{config.icon}</span>}
        {tierLabel} {t('member')}
      </span>
    );
  };

  return (
    <div className="flex items-center justify-between p-4 pt-8">
      <div className="flex items-center gap-4">
        <div
          className="relative cursor-pointer active:scale-95 transition-transform"
          onClick={onEditClick}
        >
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-16 w-16 border-4 border-pink-300 dark:border-pink-600 shadow-lg ring-2 ring-pink-200/50 dark:ring-pink-900/30"
            style={{ backgroundImage: `url("${user.avatar}")` }}
            aria-label={`${user.name}'s profile avatar`}
          />
          {user.isOnline && (
            <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-4 border-white dark:border-[#1a0f14] shadow-md ring-1 ring-pink-200/50 dark:ring-pink-900/30" />
          )}
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
            {t('welcome')}, {user.name} <span className="text-pink-500">💕</span>
          </p>
          <div className="mt-0.5">
            {renderMembershipBadge()}
          </div>
        </div>
      </div>
      <button
        onClick={onEditClick}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 text-pink-700 dark:text-pink-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all border border-pink-200/50 dark:border-pink-800/50"
        aria-label="Edit Profile"
      >
        <MaterialSymbol name="edit" size={20} />
      </button>
    </div>
  );
};
