import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/context/AuthContext";
import { MaterialSymbol } from "../../../shared/components/MaterialSymbol";
import { FemaleBottomNavigation } from "../components/FemaleBottomNavigation";
import { useFemaleNavigation } from "../hooks/useFemaleNavigation";
import { useTranslation } from "../../../core/hooks/useTranslation";
import userService from "../../../core/services/user.service";
import { ProfileSkeletonLoader } from "../../../shared/components/ProfileSkeletonLoader";

export const MyProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { navigationItems, handleNavigationClick } = useFemaleNavigation();

  const [name, setName] = useState(user?.name || t("anonymous"));
  const [age, setAge] = useState(24);
  const [location, setLocation] = useState(t("unknownLocation"));

  const [stats, setStats] = useState({
    messagesReceived: 0,
    activeConversations: 0,
    totalEarnings: 0,
    availableBalance: 0,
  });
  const [_isStatsLoading, setIsStatsLoading] = useState(true);

  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProfileStats();
  }, []);

  const fetchProfileStats = async () => {
    try {
      setIsStatsLoading(true);
      const data = await userService.getFemaleDashboardData();
      setStats({
        messagesReceived: data.stats?.messagesReceived || 0,
        activeConversations: data.stats?.activeConversations || 0,
        totalEarnings: data.earnings?.totalEarnings || 0,
        availableBalance: data.earnings?.availableBalance || 0,
      });
    } catch (error) {
      console.error("Failed to fetch profile stats:", error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name || t("anonymous"));
      setAge(user.age || 24);
      setLocation(user.location || user.city || t("unknownLocation"));
      if (user.photos && user.photos.length > 0) {
        setPhotos(user.photos);
      } else if (user.avatarUrl) {
        setPhotos([user.avatarUrl]);
      } else {
        setPhotos([]);
      }
    }
  }, [user, t]);

  if (isAuthLoading) return <ProfileSkeletonLoader />;

  const heroImage = photos[0] || user?.avatarUrl;
  const avatarUrl = user?.avatarUrl || "";

  return (
    <div className="font-display text-ink antialiased min-h-screen relative lg:pl-60 overflow-x-hidden bg-[#f8f4f6]">
      {/* ── Sticky Gradient Header ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 pt-safe-top pt-3 pb-3 bg-white/80 backdrop-blur-xl border-b border-pink-100/50">
        <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-indigo-600 bg-clip-text text-transparent">
          PROFILE
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/female/edit-profile")}
            className="size-10 flex items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg active:scale-90 transition-all"
          >
            <MaterialSymbol name="edit" size={20} filled />
          </button>
        </div>
      </header>

      <div className="relative z-10 flex flex-col min-h-screen pb-32 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full">

        {/* ── Hero Section ── */}
        <section className="relative">
          {/* Cover Photo */}
          <div className="w-full h-[52vw] max-h-[320px] min-h-[220px] bg-gradient-to-br from-pink-200 to-indigo-200 overflow-hidden">
            {heroImage ? (
              <img src={heroImage} alt={name} className="w-full h-full object-cover object-top" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MaterialSymbol name="person" size={64} className="text-pink-200" />
              </div>
            )}
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          </div>

          {/* Identity Overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 flex items-end justify-between">
            <div className="flex flex-col gap-2">
              {/* Online indicator */}
              <div className="flex items-center gap-1.5 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full px-2 py-0.5 self-start">
                <div className="size-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[9px] font-black text-green-300 uppercase tracking-wider">Online</span>
              </div>

              {/* Name + verified */}
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-black text-white leading-tight tracking-tight drop-shadow-lg">
                  {name}
                </h2>
                <MaterialSymbol name="verified" size={22} className="text-blue-400" filled />
              </div>

              {/* Age + Location chips */}
              <div className="flex items-center gap-1.5">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/80">{age} yrs</span>
                </div>
                {location && location !== t("unknownLocation") && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                    <MaterialSymbol name="location_on" size={10} className="text-pink-300" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/80">{location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Avatar thumb */}
            <button
              onClick={() => navigate("/female/edit-profile")}
              className="relative"
            >
              <div className="size-16 rounded-2xl overflow-hidden border-2 border-white/40 shadow-2xl">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                    <MaterialSymbol name="person" size={28} className="text-pink-400" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-md border border-white">
                <MaterialSymbol name="edit" size={10} className="text-white" filled />
              </div>
            </button>
          </div>
        </section>

        {/* ── Frosted Glass Stats Strip ── */}
        <section className="mx-4 -mt-1 z-10 relative">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/60 shadow-xl p-4 grid grid-cols-3 gap-3">
            {[
              { icon: "payments", value: stats.availableBalance.toLocaleString(), label: "Coins", color: "text-pink-600", bg: "bg-pink-50" },
              { icon: "mail", value: stats.messagesReceived.toLocaleString(), label: "Messages", color: "text-indigo-500", bg: "bg-indigo-50" },
              { icon: "chat_bubble", value: stats.activeConversations.toLocaleString(), label: "Active Chats", color: "text-violet-500", bg: "bg-violet-50" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1.5">
                <div className={`size-8 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <MaterialSymbol name={s.icon as any} size={16} className={s.color} filled />
                </div>
                <span className="text-sm font-black text-ink leading-none">{s.value}</span>
                <span className="text-[8px] font-bold text-muted-light uppercase tracking-wide leading-none text-center">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bento Stats Grid ── */}
        <section className="px-4 mt-4 space-y-3">
          {/* Verification Banner */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
              <MaterialSymbol name="verified" size={22} className="text-emerald-500" filled />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-700">{t("profileVerified")}</p>
              <p className="text-[9px] font-medium text-emerald-600/70 leading-tight">{t("profileVerifiedDesc")}</p>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Earnings Hero Tile */}
            <button
              onClick={() => navigate("/female/earnings")}
              className="row-span-2 rounded-[1.5rem] p-5 bg-gradient-to-br from-pink-600 via-rose-500 to-indigo-600 shadow-lg flex flex-col justify-between text-left active:scale-[0.97] transition-transform relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8" />
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center relative z-10">
                <MaterialSymbol name="payments" size={22} className="text-white" filled />
              </div>
              <div className="relative z-10">
                <div className="text-[28px] font-black text-white leading-none tracking-tight">
                  {stats.availableBalance.toLocaleString()}
                </div>
                <div className="text-[9px] font-extrabold uppercase tracking-widest text-white/70 mt-1 flex items-center gap-1">
                  COINS
                  <span className="bg-white/20 rounded-full px-2 py-0.5 text-white/90">VIEW DETAILS</span>
                </div>
              </div>
            </button>

            {/* Messages Tile */}
            <div className="rounded-[1.25rem] p-4 bg-white shadow-card flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                <MaterialSymbol name="mail" size={20} className="text-blue-500" filled />
              </div>
              <div>
                <div className="text-xl font-black text-ink leading-tight">{stats.messagesReceived.toLocaleString()}</div>
                <div className="text-[9px] font-extrabold uppercase tracking-wider text-muted-light">{t("messages")}</div>
              </div>
            </div>

            {/* Active Chats Tile */}
            <div className="rounded-[1.25rem] p-4 bg-white shadow-card flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
                <MaterialSymbol name="chat_bubble" size={20} className="text-purple-500" filled />
              </div>
              <div>
                <div className="text-xl font-black text-ink leading-tight">{stats.activeConversations.toLocaleString()}</div>
                <div className="text-[9px] font-extrabold uppercase tracking-wider text-muted-light">{t("activeChats")}</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── About & Interests ── */}
        {(user?.bio || (user?.interests && user.interests.length > 0)) && (
          <section className="px-4 mt-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="size-7 rounded-xl bg-pink-50 flex items-center justify-center">
                <MaterialSymbol name="person_outline" size={16} className="text-pink-600" />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-muted">{t("about")}</h3>
            </div>
            <div className="bg-white rounded-[1.5rem] p-5 shadow-card space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-pink-50 to-rose-50 rounded-full -mr-14 -mt-14 blur-2xl" />
              {user?.bio && (
                <div className="space-y-2 relative z-10">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-light">{t("bio")}</p>
                  <p className="text-sm font-semibold text-slate-600 leading-relaxed italic border-l-2 border-pink-300 pl-4 py-0.5">
                    "{user.bio}"
                  </p>
                </div>
              )}
              {user?.interests && user.interests.length > 0 && (
                <div className="space-y-2.5 relative z-10">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-light">{t("interests")}</p>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 text-[10px] font-bold uppercase tracking-wide text-pink-600"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Photo Gallery ── */}
        <section className="px-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded-xl bg-indigo-50 flex items-center justify-center">
                <MaterialSymbol name="photo_library" size={16} className="text-indigo-500" />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-muted">{t("photos")}</h3>
            </div>
            <button
              onClick={() => navigate("/female/edit-profile")}
              className="text-[9px] font-black uppercase tracking-widest text-pink-600 active:scale-95 transition-transform"
            >
              {t("manage")}
            </button>
          </div>

          {photos.length > 0 ? (
            <div className="grid grid-cols-6 gap-2.5">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedPhotoIndex(index)}
                  className={`group relative rounded-[1.25rem] overflow-hidden cursor-pointer active:scale-95 transition-all duration-300 bg-pink-50 ${
                    index === 0 ? "col-span-6 aspect-[16/9]" : "col-span-2 aspect-[4/5]"
                  }`}
                >
                  {index === 0 && (
                    <div className="absolute top-3 left-3 z-20">
                      <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-3 py-1 rounded-full shadow-md">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-1">
                          <MaterialSymbol name="star" size={10} filled />
                          {t("featured")}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                  <img
                    src={photo}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-3 right-3 size-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-20 shadow-sm">
                    <MaterialSymbol name="open_in_full" size={14} className="text-pink-600" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-pink-50/60 rounded-[1.5rem] p-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="size-16 bg-white shadow-card rounded-full flex items-center justify-center">
                <MaterialSymbol name="add_a_photo" size={30} className="text-pink-300" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-muted-light">{t("noPhotos")}</p>
                <p className="text-[10px] font-medium text-muted-light">{t("uploadToShine")}</p>
              </div>
              <button
                onClick={() => navigate("/female/edit-profile")}
                className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-6 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all"
              >
                {t("uploadNow")}
              </button>
            </div>
          )}
        </section>

        {/* ── Settings Section ── */}
        <section className="px-4 mt-4 mb-6">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="size-7 rounded-xl bg-pink-50 flex items-center justify-center">
              <MaterialSymbol name="tune" size={16} className="text-pink-600" />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-muted">SETTINGS</h3>
          </div>
          <div className="bg-white rounded-[1.5rem] shadow-card overflow-hidden divide-y divide-gray-50">
            <button
              onClick={() => navigate("/female/faqs")}
              className="w-full flex items-center justify-between px-5 py-4 group active:bg-pink-50/50 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="size-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <MaterialSymbol name="help" size={20} className="text-indigo-500" filled />
                </div>
                <span className="text-[13px] font-bold text-ink">{t("faqs")}</span>
              </div>
              <MaterialSymbol name="chevron_right" size={20} className="text-muted-light group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => navigate("/female/settings")}
              className="w-full flex items-center justify-between px-5 py-4 group active:bg-pink-50/50 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="size-10 rounded-2xl bg-pink-50 flex items-center justify-center">
                  <MaterialSymbol name="settings" size={20} className="text-pink-600" filled />
                </div>
                <span className="text-[13px] font-bold text-ink">{t("settings")}</span>
              </div>
              <MaterialSymbol name="chevron_right" size={20} className="text-muted-light group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </section>
      </div>

      <FemaleBottomNavigation items={navigationItems} onItemClick={handleNavigationClick} />

      {/* ── Photo Lightbox ── */}
      {selectedPhotoIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center animate-in fade-in duration-500"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          <div className="relative w-full h-[70vh] flex items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[selectedPhotoIndex]}
              alt={`Portfolio ${selectedPhotoIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-[2rem] shadow-2xl border border-white/10"
            />
            <div className="absolute inset-x-4 flex items-center justify-between pointer-events-none">
              <button
                disabled={selectedPhotoIndex === 0}
                onClick={() => setSelectedPhotoIndex(selectedPhotoIndex - 1)}
                className={`pointer-events-auto size-12 rounded-2xl flex items-center justify-center bg-white/10 text-white backdrop-blur-xl border border-white/10 active:scale-90 transition-all ${selectedPhotoIndex === 0 ? "opacity-0" : "opacity-100"}`}
              >
                <MaterialSymbol name="chevron_left" size={28} />
              </button>
              <button
                disabled={selectedPhotoIndex === photos.length - 1}
                onClick={() => setSelectedPhotoIndex(selectedPhotoIndex + 1)}
                className={`pointer-events-auto size-12 rounded-2xl flex items-center justify-center bg-white/10 text-white backdrop-blur-xl border border-white/10 active:scale-90 transition-all ${selectedPhotoIndex === photos.length - 1 ? "opacity-0" : "opacity-100"}`}
              >
                <MaterialSymbol name="chevron_right" size={28} />
              </button>
            </div>
          </div>
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20">
            <button
              onClick={() => setSelectedPhotoIndex(null)}
              className="size-12 rounded-full flex items-center justify-center bg-white/10 text-white backdrop-blur-xl border border-white/20 active:scale-90 transition-all"
            >
              <MaterialSymbol name="close" size={24} />
            </button>
            <div className="flex gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10">
              {photos.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 transition-all duration-500 rounded-full ${i === selectedPhotoIndex ? "w-8 bg-pink-500" : "w-1.5 bg-white/20"}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
