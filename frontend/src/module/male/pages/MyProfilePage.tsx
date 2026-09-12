import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/context/AuthContext";
import { useSocket } from "../../../core/context/SocketContext";
import { MaterialSymbol } from "../../../shared/components/MaterialSymbol";
import { useGlobalState } from "../../../core/context/GlobalStateContext";
import { useTranslation } from "../../../core/hooks/useTranslation";
import { BadgeDisplay } from "../../../shared/components/BadgeDisplay";
import userService from "../../../core/services/user.service";
import { PageSkeletonLoader } from "../components/PageSkeletonLoader";
import { ImageModal } from "../../../shared/components/ImageModal";

const mockProfile = {
  id: "me",
  name: "John Doe",
  age: 28,
  avatar:
    "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
  bio: "",
  occupation: "",
  city: "",
  interests: [] as string[],
  photos: [] as string[],
};

const tierConfig = {
  basic: {
    label: "BASIC MEMBER",
    icon: null,
    textClass: "text-white/80",
    bgClass: "bg-white/10 backdrop-blur-sm",
  },
  silver: {
    label: "SILVER MEMBER",
    icon: "stars",
    textClass: "text-white",
    bgClass:
      "bg-gradient-to-r from-slate-400/40 to-slate-300/40 backdrop-blur-sm",
  },
  gold: {
    label: "GOLD MEMBER",
    icon: "workspace_premium",
    textClass: "text-amber-200",
    bgClass:
      "bg-gradient-to-r from-amber-500/40 to-yellow-400/40 backdrop-blur-sm",
  },
  platinum: {
    label: "PLATINUM MEMBER",
    icon: "diamond",
    textClass: "text-cyan-200",
    bgClass:
      "bg-gradient-to-r from-cyan-500/40 to-blue-400/40 backdrop-blur-sm",
  },
};

export const MyProfilePage = () => {
  const { t, changeLanguage, currentLanguage } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { coinBalance } = useGlobalState();
  const { isConnected } = useSocket();
  const [stats, setStats] = useState({ matches: 0, sent: 0, coinsSpent: 0 });
  const [profile, setProfile] = useState(mockProfile);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null,
  );
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await userService.getMeStats();
        if (data) setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (user) {
      setProfile({
        ...mockProfile,
        id: user.id || mockProfile.id,
        name: user.name || "Anonymous",
        age: user.age || 0,
        occupation: user.occupation || "",
        city:
          user.city || (user.location ? user.location.split(",")[0] : "") || "",
        bio: user.bio || "",
        interests: user.interests || [],
        avatar:
          user.avatarUrl ||
          "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
        photos:
          user.photos && user.photos.length > 0
            ? user.photos
            : user.avatarUrl
              ? [user.avatarUrl]
              : [],
      });
    }
  }, [user]);

  if (isAuthLoading) return <PageSkeletonLoader />;

  const currentTier = (user?.memberTier || "basic") as keyof typeof tierConfig;
  const tierCfg = tierConfig[currentTier] || tierConfig.basic;
  const heroImage = profile.photos[0] || profile.avatar;
  const views =
    (stats as any).views ||
    Math.floor(stats.matches * 4.5) + stats.sent * 2 + 42;

  return (
    <div className="text-ink font-display antialiased min-h-screen relative lg:pl-60 overflow-x-hidden bg-[#f8f4f6]">
      {/* ── Sticky Gradient Header ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 pt-safe-top pt-3 pb-3 bg-white/80 backdrop-blur-xl border-b border-pink-100/50">
        <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-indigo-600 bg-clip-text text-transparent">
          PROFILE
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/male/notifications")}
            className="relative size-10 flex items-center justify-center rounded-2xl bg-pink-50 text-pink-600 active:scale-90 transition-all">
            <MaterialSymbol name="notifications" size={22} />
          </button>
          <button
            onClick={() => navigate("/male/edit-profile")}
            className="size-10 flex items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg active:scale-90 transition-all">
            <MaterialSymbol name="edit" size={20} filled />
          </button>
        </div>
      </header>

      <div className="relative z-10 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full flex flex-col pb-32">
        {/* ── Hero Section ── */}
        <section className="relative">
          {/* Cover Photo */}
          <div
            className="w-full h-[52vw] max-h-[320px] min-h-[220px] bg-gradient-to-br from-pink-200 to-indigo-200 overflow-hidden cursor-pointer"
            onClick={() => setIsAvatarModalOpen(true)}>
            {heroImage && (
              <img
                src={heroImage}
                alt={profile.name}
                className="w-full h-full object-cover object-top"
              />
            )}
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          </div>

          {/* Identity Overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 flex items-end justify-between">
            <div className="flex flex-col gap-2">
              {/* Online status + name */}
              <div className="flex items-center gap-2.5">
                {isConnected && (
                  <div className="flex items-center gap-1.5 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full px-2 py-0.5">
                    <div className="size-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[9px] font-black text-green-300 uppercase tracking-wider">
                      Online
                    </span>
                  </div>
                )}
              </div>
              <h2 className="text-3xl font-black text-white leading-tight tracking-tight drop-shadow-lg">
                {profile.name}
              </h2>
              {/* Tier + Level chips */}
              <div className="flex flex-wrap gap-1.5">
                <div
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 ${tierCfg.bgClass}`}>
                  {tierCfg.icon && (
                    <MaterialSymbol
                      name={tierCfg.icon as any}
                      size={11}
                      className={tierCfg.textClass}
                      filled
                    />
                  )}
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest ${tierCfg.textClass}`}>
                    {tierCfg.label}
                  </span>
                </div>
                {user?.levelInfo && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-500/30 backdrop-blur-sm border border-violet-400/20">
                    <MaterialSymbol
                      name="military_tech"
                      size={11}
                      className="text-violet-200"
                      filled
                    />
                    <span className="text-[9px] font-black uppercase tracking-widest text-violet-200">
                      LVL {user.levelInfo.level} • {user.levelInfo.badgeName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Avatar ring */}
            <div
              className="relative cursor-pointer"
              onClick={() => setIsAvatarModalOpen(true)}>
              <div className="size-16 rounded-2xl overflow-hidden border-2 border-white/40 shadow-2xl">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {isConnected && (
                <div className="absolute -bottom-1 -right-1 size-4 rounded-full bg-green-400 border-2 border-white shadow-lg" />
              )}
            </div>
          </div>
        </section>

        {/* ── Frosted Glass Stats Strip ── */}
        <section className="mx-4 -mt-1 z-10 relative">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/60 shadow-xl p-4 grid grid-cols-4 gap-2">
            {[
              {
                icon: "monetization_on",
                value:
                  coinBalance >= 1000
                    ? `${Math.floor(coinBalance / 1000)}K`
                    : coinBalance.toString(),
                label: "Coins",
                color: "text-pink-600",
                bg: "bg-pink-50",
              },
              {
                icon: "favorite",
                value: stats.matches.toString(),
                label: "Matches",
                color: "text-rose-500",
                bg: "bg-rose-50",
              },
              {
                icon: "visibility",
                value:
                  views >= 1000
                    ? `${Math.floor(views / 1000)}K`
                    : views.toString(),
                label: "Views",
                color: "text-indigo-500",
                bg: "bg-indigo-50",
              },
              {
                icon: "chat_bubble",
                value: stats.sent.toString(),
                label: "Chats",
                color: "text-violet-500",
                bg: "bg-violet-50",
              },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1.5">
                <div
                  className={`size-8 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <MaterialSymbol
                    name={s.icon as any}
                    size={16}
                    className={s.color}
                    filled
                  />
                </div>
                <span className="text-sm font-black text-ink leading-none">
                  {s.value}
                </span>
                <span className="text-[8px] font-bold text-muted-light uppercase tracking-wide leading-none">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bento Stats Grid ── */}
        <section className="px-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Big Coin Tile */}
            <button
              onClick={() => navigate("/male/buy-coins")}
              className="row-span-2 rounded-[1.5rem] p-5 bg-gradient-to-br from-pink-600 via-rose-500 to-indigo-600 shadow-lg flex flex-col justify-between text-left active:scale-[0.97] transition-transform relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8" />
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center relative z-10">
                <MaterialSymbol
                  name="monetization_on"
                  size={22}
                  className="text-white"
                  filled
                />
              </div>
              <div className="relative z-10">
                <div className="text-[28px] font-black text-white leading-none tracking-tight">
                  {coinBalance.toLocaleString()}
                </div>
                <div className="text-[9px] font-extrabold uppercase tracking-widest text-white/70 mt-1 flex items-center gap-1">
                  COINS
                  <span className="bg-white/20 rounded-full px-2 py-0.5 text-white/90">
                    TAP TO TOP UP
                  </span>
                </div>
              </div>
            </button>

            {/* Level Tile */}
            {user?.levelInfo ? (
              <button
                onClick={() => navigate("/male/leaderboard")}
                className="rounded-[1.25rem] p-4 bg-white shadow-card flex items-center gap-3 text-left active:scale-[0.97] transition-transform">
                <div className="size-10 rounded-2xl bg-violet-50 flex items-center justify-center shrink-0">
                  <MaterialSymbol
                    name="military_tech"
                    size={20}
                    className="text-violet-600"
                    filled
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-black text-ink leading-tight">
                    Lv.{user.levelInfo.level}
                  </div>
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-muted-light truncate">
                    {user.levelInfo.badgeName}
                  </div>
                </div>
              </button>
            ) : (
              <div className="rounded-[1.25rem] p-4 bg-white shadow-card flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-violet-50 flex items-center justify-center shrink-0">
                  <MaterialSymbol
                    name="military_tech"
                    size={20}
                    className="text-violet-400"
                    filled
                  />
                </div>
                <div>
                  <div className="text-xl font-black text-ink">Lv.1</div>
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-muted-light">
                    Novice
                  </div>
                </div>
              </div>
            )}

            {/* Matches Tile */}
            <div className="rounded-[1.25rem] p-4 bg-white shadow-card flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-pink-50 flex items-center justify-center shrink-0">
                <MaterialSymbol
                  name="favorite"
                  size={20}
                  className="text-pink-600"
                  filled
                />
              </div>
              <div>
                <div className="text-xl font-black text-ink leading-tight">
                  {stats.matches}
                </div>
                <div className="text-[9px] font-extrabold uppercase tracking-wider text-muted-light">
                  {t("matched") || "Matched"}
                </div>
              </div>
            </div>

            {/* Views + Messages */}
            <div className="col-span-2 grid grid-cols-2 gap-3">
              <div className="rounded-[1.25rem] p-4 bg-white shadow-card flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                  <MaterialSymbol
                    name="visibility"
                    size={20}
                    className="text-blue-500"
                    filled
                  />
                </div>
                <div>
                  <div className="text-xl font-black text-ink">{views}</div>
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-muted-light">
                    {t("views") || "Views"}
                  </div>
                </div>
              </div>
              <div className="rounded-[1.25rem] p-4 bg-white shadow-card flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
                  <MaterialSymbol
                    name="chat_bubble"
                    size={20}
                    className="text-purple-500"
                    filled
                  />
                </div>
                <div>
                  <div className="text-xl font-black text-ink">
                    {stats.sent}
                  </div>
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-muted-light">
                    {t("messages") || "Messages"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Level Progress Bar */}
          {user?.levelInfo && user.levelInfo.nextLevelThreshold !== null && (
            <div className="mt-4 bg-white rounded-2xl p-4 shadow-card space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-light">
                  Progress to Level {user.levelInfo.nextLevel}
                </span>
                <span className="text-[10px] font-black text-pink-600">
                  {user.levelInfo.progressPercent}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-pink-50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-500 transition-all duration-1000"
                  style={{ width: `${user.levelInfo.progressPercent}%` }}
                />
              </div>
              <div className="text-[9px] text-muted-light font-semibold">
                {user.levelInfo.totalCoinsSpent.toLocaleString()} /{" "}
                {user.levelInfo.nextLevelThreshold.toLocaleString()} coins spent
              </div>
            </div>
          )}
        </section>

        {/* ── About & Interests ── */}
        {(profile.bio ||
          (profile.interests && profile.interests.length > 0)) && (
          <section className="px-4 mt-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="size-7 rounded-xl bg-pink-50 flex items-center justify-center">
                <MaterialSymbol
                  name="person_outline"
                  size={16}
                  className="text-pink-600"
                />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-muted">
                {t("about")}
              </h3>
            </div>
            <div className="bg-white rounded-[1.5rem] p-5 shadow-card space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-pink-50 to-rose-50 rounded-full -mr-14 -mt-14 blur-2xl" />
              {profile.bio && (
                <div className="space-y-2 relative z-10">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-light">
                    {t("bio")}
                  </p>
                  <p className="text-sm font-semibold text-slate-600 leading-relaxed italic border-l-2 border-pink-300 pl-4 py-0.5">
                    "{profile.bio}"
                  </p>
                </div>
              )}
              {profile.interests && profile.interests.length > 0 && (
                <div className="space-y-2.5 relative z-10">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-light">
                    {t("interests")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 text-[10px] font-bold uppercase tracking-wide text-pink-600">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Achievement Vault ── */}
        {user?.badges && user.badges.length > 0 && (
          <section className="px-4 mt-4">
            <div className="bg-white rounded-[1.5rem] shadow-card overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-4 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                    <MaterialSymbol
                      name="workspace_premium"
                      size={18}
                      className="text-white"
                      filled
                    />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-ink">
                      {t("achievementVault")}
                    </h3>
                    <span className="text-[8px] font-bold text-muted-light uppercase tracking-wider">
                      {user.badges.filter((b) => b.isUnlocked).length} /{" "}
                      {user.badges.length} {t("collected")}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/male/badges")}
                  className="text-[9px] font-black uppercase tracking-widest text-pink-600">
                  {t("exploreAll")}
                </button>
              </div>
              <div className="px-4 pb-4">
                <div className="bg-pink-50/50 rounded-xl p-3">
                  <BadgeDisplay
                    badges={user.badges}
                    maxDisplay={6}
                    showUnlockedOnly={true}
                    compact={true}
                    onBadgeClick={() => navigate("/male/badges")}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Gallery Portfolio ── */}
        {profile.photos && profile.photos.length > 0 && (
          <section className="px-4 mt-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <MaterialSymbol
                    name="photo_library"
                    size={16}
                    className="text-indigo-500"
                  />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-muted">
                  {t("galleryPortfolio")}
                </h3>
              </div>
              <span className="text-[9px] font-black text-muted-light uppercase tracking-widest">
                {profile.photos.length} SLOTS
              </span>
            </div>
            <div className="grid grid-cols-6 gap-2.5">
              {profile.photos.map((photo, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedPhotoIndex(index)}
                  className={`group relative rounded-[1.25rem] overflow-hidden cursor-pointer active:scale-95 transition-all duration-300 bg-pink-50 ${
                    index === 0
                      ? "col-span-6 aspect-[16/9]"
                      : "col-span-2 aspect-[4/5]"
                  }`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                  <img
                    src={photo}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {index === 0 && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm h-7 px-3 rounded-full flex items-center gap-1.5 z-20 shadow-sm">
                      <MaterialSymbol
                        name="star"
                        size={12}
                        className="text-amber-500"
                        filled
                      />
                      <span className="text-[8px] font-black uppercase tracking-widest text-ink">
                        FEATURED
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 size-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-20">
                    <MaterialSymbol
                      name="zoom_in"
                      size={16}
                      className="text-pink-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Settings Section ── */}
        <section className="px-4 mt-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="size-7 rounded-xl bg-pink-50 flex items-center justify-center">
              <MaterialSymbol name="tune" size={16} className="text-pink-600" />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-muted">
              {t("vaultSettings")}
            </h3>
          </div>
          <div className="bg-white rounded-[1.5rem] shadow-card overflow-hidden divide-y divide-gray-50">
            {/* Refer & Earn */}
            <button
              onClick={() => navigate("/male/referral")}
              className="w-full flex items-center justify-between px-5 py-4 group active:bg-pink-50/50 transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="size-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <MaterialSymbol
                    name="diversity_3"
                    size={20}
                    className="text-emerald-500"
                    filled
                  />
                </div>
                <span className="text-[13px] font-bold text-ink">
                  {t("referAndEarn")}
                </span>
              </div>
              <MaterialSymbol
                name="chevron_right"
                size={20}
                className="text-muted-light group-hover:translate-x-0.5 transition-transform"
              />
            </button>

            {/* Language */}
            <div className="px-5 py-4">
              <div className="flex items-center gap-3.5 mb-3">
                <div className="size-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <MaterialSymbol
                    name="translate"
                    size={20}
                    className="text-blue-500"
                    filled
                  />
                </div>
                <span className="text-[13px] font-bold text-ink">
                  {t("language")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 ml-[52px]">
                <button
                  onClick={() => changeLanguage("en")}
                  className={`h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    currentLanguage === "en"
                      ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md"
                      : "bg-pink-50 text-muted-light"
                  }`}>
                  English
                </button>
                <button
                  onClick={() => changeLanguage("hi")}
                  className={`h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    currentLanguage === "hi"
                      ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md"
                      : "bg-pink-50 text-muted-light"
                  }`}>
                  हिंदी
                </button>
              </div>
            </div>

            {/* FAQs */}
            <button
              onClick={() => navigate("/male/faqs")}
              className="w-full flex items-center justify-between px-5 py-4 group active:bg-pink-50/50 transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="size-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <MaterialSymbol
                    name="help"
                    size={20}
                    className="text-indigo-500"
                    filled
                  />
                </div>
                <span className="text-[13px] font-bold text-ink">
                  {t("faqs")}
                </span>
              </div>
              <MaterialSymbol
                name="chevron_right"
                size={20}
                className="text-muted-light group-hover:translate-x-0.5 transition-transform"
              />
            </button>

            {/* Settings */}
            <button
              onClick={() => navigate("/male/settings")}
              className="w-full flex items-center justify-between px-5 py-4 group active:bg-pink-50/50 transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="size-10 rounded-2xl bg-pink-50 flex items-center justify-center">
                  <MaterialSymbol
                    name="settings"
                    size={20}
                    className="text-pink-600"
                    filled
                  />
                </div>
                <span className="text-[13px] font-bold text-ink">
                  {t("settings")}
                </span>
              </div>
              <MaterialSymbol
                name="chevron_right"
                size={20}
                className="text-muted-light group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </div>
        </section>
      </div>

      {/* ── Photo Lightbox ── */}
      {selectedPhotoIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in duration-500"
          onClick={() => setSelectedPhotoIndex(null)}>
          <div
            className="flex flex-col items-center gap-8 w-full"
            onClick={(e) => e.stopPropagation()}>
            <div
              className="relative w-full h-[70vh] flex items-center justify-center px-4"
              onClick={(e) => e.stopPropagation()}>
              <img
                src={profile.photos![selectedPhotoIndex]}
                alt={`Photo ${selectedPhotoIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-[2rem] shadow-2xl border border-white/10"
              />
              <div className="absolute inset-x-4 flex items-center justify-between pointer-events-none">
                <button
                  disabled={selectedPhotoIndex === 0}
                  onClick={() => setSelectedPhotoIndex(selectedPhotoIndex - 1)}
                  className={`pointer-events-auto size-12 rounded-2xl flex items-center justify-center bg-white/10 text-white backdrop-blur-xl border border-white/10 active:scale-90 transition-all ${selectedPhotoIndex === 0 ? "opacity-0" : "opacity-100"}`}>
                  <MaterialSymbol name="chevron_left" size={28} />
                </button>
                <button
                  disabled={selectedPhotoIndex === profile.photos!.length - 1}
                  onClick={() => setSelectedPhotoIndex(selectedPhotoIndex + 1)}
                  className={`pointer-events-auto size-12 rounded-2xl flex items-center justify-center bg-white/10 text-white backdrop-blur-xl border border-white/10 active:scale-90 transition-all ${selectedPhotoIndex === profile.photos!.length - 1 ? "opacity-0" : "opacity-100"}`}>
                  <MaterialSymbol name="chevron_right" size={28} />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10">
                {profile.photos!.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 transition-all duration-500 rounded-full ${i === selectedPhotoIndex ? "w-8 bg-gradient-to-r from-pink-500 to-rose-500" : "w-1.5 bg-white/20"}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setSelectedPhotoIndex(null)}
                className="size-12 rounded-full flex items-center justify-center bg-white/10 text-white backdrop-blur-xl border border-white/20 active:scale-90 transition-all">
                <MaterialSymbol name="close" size={24} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Modal */}
      <ImageModal
        isOpen={isAvatarModalOpen}
        imageUrl={profile.avatar}
        onClose={() => setIsAvatarModalOpen(false)}
      />
    </div>
  );
};
