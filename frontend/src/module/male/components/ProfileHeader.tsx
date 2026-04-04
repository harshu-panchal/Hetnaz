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
    textClass: 'text-slate-500 dark:text-slate-400',
    bgClass: 'bg-transparent',
  },
  silver: {
    label: 'SILVER',
    labelKey: 'SILVER',
    icon: 'stars',
    textClass: 'text-slate-600 dark:text-slate-300',
    bgClass: 'bg-gradient-to-r from-slate-200 to-slate-300 dark:from-white/10 dark:to-white/5',
  },
  gold: {
    label: 'GOLD',
    labelKey: 'GOLD',
    icon: 'workspace_premium',
    textClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/20',
  },
  platinum: {
    label: 'PLATINUM',
    labelKey: 'PLATINUM',
    icon: 'diamond',
    textClass: 'text-cyan-600 dark:text-cyan-400',
    bgClass: 'bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/40 dark:to-blue-900/20',
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
               className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 border-2 border-white/60 dark:border-white/10"
               style={{ backgroundImage: `url("${user.avatar}")` }}
               aria-label={`${user.name}'s profile avatar`}
             />
          </div>
          
          {user.isOnline && (
            <div className="absolute bottom-1 right-1 h-6 w-6 rounded-full bg-green-500 border-[3px] border-white dark:border-black shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse z-20" />
          )}

          {/* Decorative Glow */}
          <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* User Info */}
        <div className="flex flex-col justify-center gap-2">
          <h1 className="text-slate-900 dark:text-white text-[28px] font-black leading-none tracking-tighter">
            {user.name}
          </h1>
          {renderMembershipBadge()}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications Button */}
        {showNotifications && (
          <button
            onClick={() => navigate('/male/notifications')}
            className="skeuo-inset relative size-14 shrink-0 flex items-center justify-center rounded-2xl text-slate-600 dark:text-slate-300 active:scale-90 transition-all group"
            aria-label="Notifications"
          >
            <MaterialSymbol name="notifications" size={28} className="transition-transform group-hover:rotate-12" />
            {unreadCount > 0 && (
              <div className="absolute top-1 right-1 size-5 rounded-full bg-primary border-2 border-white dark:border-black flex items-center justify-center shadow-lg shadow-primary/20">
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
            className="skeuo-inset size-14 shrink-0 flex items-center justify-center rounded-2xl bg-white text-primary active:scale-90 transition-all group shadow-sm"
            aria-label="Edit Profile"
          >
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
              <MaterialSymbol 
                name="edit_note" 
                size={24} 
                className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-transform group-hover:-rotate-6" 
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
