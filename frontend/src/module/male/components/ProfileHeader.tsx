import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { useTranslation } from '../../../core/hooks/useTranslation';
import { ImageModal } from '../../../shared/components/ImageModal';
import { useGlobalState } from '../../../core/context/GlobalStateContext';

interface ProfileHeaderProps {
  user: {
    name: string;
    avatar: string;
    isPremium: boolean;
    isOnline: boolean;
    memberTier?: 'basic' | 'silver' | 'gold' | 'platinum';
    levelInfo?: {
      level: number;
      badgeName: string;
    } | null;
  };
  onEditClick?: () => void;
  showNotifications?: boolean;
  showEdit?: boolean;
}

// Tier configuration for display
const tierConfig = {
  basic: {
    label: 'BASIC',
    labelKey: 'BASIC',
    icon: null,
    textClass: 'text-muted',
    bgClass: 'bg-transparent',
  },
  silver: {
    label: 'SILVER',
    labelKey: 'SILVER',
    icon: 'stars',
    textClass: 'text-slate-600',
    bgClass: 'bg-gradient-to-r from-slate-200 to-slate-300',
  },
  gold: {
    label: 'GOLD',
    labelKey: 'GOLD',
    icon: 'workspace_premium',
    textClass: 'text-[#7a4400]',
    bgClass: 'bg-coin-gradient',
  },
  platinum: {
    label: 'PLATINUM',
    labelKey: 'PLATINUM',
    icon: 'diamond',
    textClass: 'text-cyan-600',
    bgClass: 'bg-gradient-to-r from-cyan-100 to-blue-100',
  },
};

export const ProfileHeader = ({ user, onEditClick, showNotifications = true, showEdit = true }: ProfileHeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { unreadCount } = useGlobalState();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const currentTier = user.memberTier || 'basic';
  const config = tierConfig[currentTier] || tierConfig.basic;
  const tierLabel = t(config.labelKey) || config.label;

  // Render membership badge
  const renderMembershipBadge = () => {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl ${config.bgClass}`}>
        {config.icon && <MaterialSymbol name={config.icon as any} size={14} className={config.textClass} filled />}
        <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${config.textClass}`}>
          {tierLabel} {t('member')}
        </span>
      </div>
    );
  };

  // Render level badge if present
  const renderLevelBadge = () => {
    if (!user.levelInfo) return null;
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-violet-50 text-violet-600">
        <MaterialSymbol name="military_tech" size={14} className="text-violet-600" filled />
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-violet-600">
          Lvl {user.levelInfo.level} • {user.levelInfo.badgeName}
        </span>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-between px-2 pb-6 pt-4 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center gap-5">
        {/* Vault Avatar */}
        <div
          className="relative cursor-pointer active:scale-95 transition-transform group"
          onClick={() => setIsImageModalOpen(true)}
        >
          <div className="p-1 rounded-full relative z-10">
             <div
               className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 shadow-card"
               style={{ backgroundImage: `url("${user.avatar}")` }}
               aria-label={`${user.name}'s profile avatar`}
             />
          </div>

          {user.isOnline && (
            <div className="absolute bottom-1 right-1 h-6 w-6 rounded-full bg-green-500 border-[3px] border-white z-20" />
          )}
        </div>

        {/* User Info */}
        <div className="flex flex-col justify-center gap-2">
          <h1 className="text-ink text-[28px] font-black leading-none tracking-tighter">
            {user.name}
          </h1>
          <div className="flex flex-wrap gap-2">
            {renderMembershipBadge()}
            {renderLevelBadge()}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications Button */}
        {showNotifications && (
          <button
            onClick={() => navigate('/male/notifications')}
            className="relative size-14 shrink-0 flex items-center justify-center rounded-2xl bg-white shadow-card text-muted active:scale-90 transition-all group"
            aria-label="Notifications"
          >
            <MaterialSymbol name="notifications" size={28} className="transition-transform group-hover:rotate-12" />
            {unreadCount > 0 && (
              <div className="absolute top-1 right-1 size-5 rounded-full bg-cta-gradient border-2 border-white flex items-center justify-center shadow-cta">
                <span className="text-[10px] font-black text-white leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </div>
            )}
          </button>
        )}

        {/* Tactile Edit Button */}
        {showEdit && (
          <button
            onClick={onEditClick}
            className="size-14 shrink-0 flex items-center justify-center rounded-2xl bg-white shadow-card active:scale-90 transition-all group"
            aria-label="Edit Profile"
          >
            <div className="size-10 rounded-xl bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 transition-all">
              <MaterialSymbol
                name="edit_note"
                size={24}
                className="text-pink-600 transition-transform group-hover:-rotate-6"
              />
            </div>
          </button>
        )}
      </div>

      {/* Full Screen Image Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        imageUrl={user.avatar}
        onClose={() => setIsImageModalOpen(false)}
      />
    </div>
  );
};
