import React from "react";
import { DiscoverProfile } from "../../../core/services/user.service";
import { useTranslation } from "../../../core/hooks/useTranslation";
import { MaterialSymbol } from "../../../shared/components/MaterialSymbol";

interface NearbyFemaleItemProps {
  profile: DiscoverProfile;
  onChatClick: (id: string, name: string) => void;
  onProfileClick: (id: string) => void;
  isSendingHi?: boolean;
}

export const NearbyFemaleItem: React.FC<NearbyFemaleItemProps> = ({
  profile,
  onChatClick,
  onProfileClick,
  isSendingHi,
}) => {
  const { t } = useTranslation();

  // Extract secondary photos for preview row (up to 3)
  const anyProfile = profile as any;
  const extraPhotos = (anyProfile.photos || anyProfile.profile?.photos || [])
    .map((p: any) => (typeof p === "string" ? p : p?.url))
    .filter((url: string) => Boolean(url) && url !== profile.avatar)
    .slice(0, 3);

  const vipTier =
    anyProfile.memberTier || (anyProfile.isVerified ? "VIP1" : null);

  return (
    <div
      onClick={() => onProfileClick(profile.id)}
      className="bg-white dark:bg-slate-900 rounded-[1.75rem] p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md border border-slate-100/90 dark:border-slate-800/80 transition-all duration-200 cursor-pointer active:scale-[0.99] mb-3">
      <div className="flex items-center gap-3.5">
        {/* 1. Left: Avatar with Online indicator */}
        <div className="relative shrink-0">
          <div className="w-[62px] h-[62px] rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-800">
            <img
              src={profile.avatar || "https://via.placeholder.com/84?text=?"}
              alt={profile.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          {profile.isOnline && (
            <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-sm" />
          )}
        </div>

        {/* 2. Center: Info Column */}
        <div className="flex-1 min-w-0">
          {/* Name + Verified Check */}
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="text-[17px] font-bold text-slate-900 dark:text-white truncate tracking-tight">
              {profile.name}
            </h3>
            {anyProfile.isVerified && (
              <span className="text-[#ff4081] shrink-0 text-sm">
                <MaterialSymbol name="verified" size={16} filled />
              </span>
            )}
          </div>

          {/* Pills row: Gender+Age & VIP */}
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            {profile.age && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#ff4081]/15 text-[#ff4081] text-[11px] font-black leading-none shrink-0">
                <span className="text-[11px] font-bold">♀</span>
                <span>{profile.age}</span>
              </span>
            )}

            {vipTier && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-950/40 dark:to-amber-900/40 text-amber-700 dark:text-amber-400 text-[10px] font-black leading-none shrink-0">
                <span>👑</span>
                <span>{vipTier.toUpperCase()}</span>
              </span>
            )}
          </div>

          {/* Distance or Bio line */}
          <p className="text-[13px] font-medium text-slate-400 dark:text-slate-500 truncate leading-snug">
            {profile.distance ||
              (profile as any).location ||
              profile.bio ||
              t("Nearby")}
          </p>
        </div>

        {/* 3. Right: Wave "👋 Hi" Orange Gradient Button */}
        <div className="shrink-0 pl-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChatClick(profile.id, profile.name);
            }}
            disabled={isSendingHi}
            className="h-10 px-5 rounded-full bg-gradient-to-r from-[#ff9f00] via-[#ff7800] to-[#ff5e00] hover:brightness-105 active:scale-95 shadow-[0_4px_14px_rgba(255,120,0,0.38)] text-white flex items-center justify-center gap-1.5 transition-all group">
            {isSendingHi ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-base group-hover:rotate-12 transition-transform">
                  👋
                </span>
                <span className="text-[14px] font-black tracking-wide leading-none">
                  {t("HI") || "Hi"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Extra Photo Thumbnails Row */}
      {extraPhotos.length > 0 && (
        <div className="mt-3 pl-[76px] flex items-center gap-2 overflow-hidden">
          {extraPhotos.map((photoUrl: string, idx: number) => (
            <div
              key={idx}
              className="w-16 h-16 rounded-xl overflow-hidden shadow-xs border border-slate-100 dark:border-slate-800 bg-slate-100 shrink-0">
              <img
                src={photoUrl}
                alt={`${profile.name} photo ${idx + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
