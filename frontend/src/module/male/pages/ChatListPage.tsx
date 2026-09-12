import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MaterialSymbol } from "../../../shared/components/MaterialSymbol";
import { ChatListItem } from "../components/ChatListItem";
import socketService from "../../../core/services/socket.service";
import { useAuth } from "../../../core/context/AuthContext";
import {
  calculateDistance,
  formatDistance,
  areCoordinatesValid,
} from "../../../utils/distanceCalculator";
import { useTranslation } from "../../../core/hooks/useTranslation";
import { useOptimizedChatList } from "../../../core/hooks/useOptimizedChatList";

type FilterType = "all" | "online" | "unread";

export const ChatListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Swipe gesture handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const filters: { id: FilterType; label: string }[] = [
    { id: "all", label: t("filterAll") || "All" },
    { id: "online", label: t("online") || "Online" },
    { id: "unread", label: t("unread") || "Unread" },
  ];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = filters.findIndex((f) => f.id === activeFilter);
      let nextIndex = currentIndex;
      if (isLeftSwipe && currentIndex < filters.length - 1) {
        nextIndex = currentIndex + 1;
      } else if (isRightSwipe && currentIndex > 0) {
        nextIndex = currentIndex - 1;
      }
      if (nextIndex !== currentIndex) {
        setActiveFilter(filters[nextIndex].id);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { chats, isLoading, error, refreshChats } =
    useOptimizedChatList(debouncedSearch);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!debouncedSearch) {
      refreshChats();
    }

    const handleNewMessage = () => {
      refreshChats();
    };
    socketService.on("message:new", handleNewMessage);
    socketService.on("message:notification", handleNewMessage);

    return () => {
      socketService.off("message:new", handleNewMessage);
      socketService.off("message:notification", handleNewMessage);
    };
  }, [debouncedSearch, refreshChats]);

  const formatTimestamp = (date: string | Date): string => {
    if (
      !date ||
      date === "1970-01-01T00:00:00.000Z" ||
      new Date(date).getTime() === 0
    ) {
      return "";
    }
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return d.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffDays === 1) {
      return t("yesterday") || "Yesterday";
    } else if (diffDays < 7) {
      return d.toLocaleDateString([], { weekday: "short" });
    } else {
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const transformedChats = useMemo(() => {
    const list = chats.map((chat: any) => {
      const otherUser = (chat.otherUser || {}) as any;
      const lastMsg = (chat.lastMessage || {}) as any;
      const otherId = (otherUser._id || chat.userId || chat.oddsUserId || "").toString();

      const profileLat =
        otherUser.profile?.location?.coordinates?.[1] || otherUser.latitude;
      const profileLng =
        otherUser.profile?.location?.coordinates?.[0] || otherUser.longitude;

      let distanceStr = undefined;
      const userCoord = { lat: user?.latitude || 0, lng: user?.longitude || 0 };
      const profileCoord = { lat: profileLat || 0, lng: profileLng || 0 };

      if (areCoordinatesValid(userCoord) && areCoordinatesValid(profileCoord)) {
        const dist = calculateDistance(userCoord, profileCoord);
        distanceStr = formatDistance(dist);
      }

      return {
        id: chat._id || chat.id,
        oddsUserId: otherId,
        userName: otherUser.name || "User",
        userAvatar: otherUser.avatar || "",
        lastMessage:
          lastMsg.content ||
          (chat.isNewPotentialChat
            ? t("startNewConversation") || "Start chatting!"
            : t("startChatting") || "Tap to chat"),
        lastMessageAt: chat.lastMessageAt || chat.createdAt,
        timestamp: formatTimestamp(chat.lastMessageAt),
        isOnline: !!otherUser.isOnline,
        hasUnread: (chat.unreadCount || 0) > 0,
        unreadCount: chat.unreadCount || 0,
        messageType: lastMsg.messageType || "text",
        intimacy: chat.intimacy || {
          level: 1,
          points: 0,
          nextLevelPoints: 100,
        },
        distance: distanceStr,
        isNewPotentialChat: !!chat.isNewPotentialChat,
      };
    });

    // Deduplicate chats by other user ID
    const seenUsers = new Set<string>();
    const deduplicated: typeof list = [];

    list.sort((a: any, b: any) => {
      const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return timeB - timeA;
    });

    for (const item of list) {
      if (!item.oddsUserId) {
        deduplicated.push(item);
        continue;
      }
      if (!seenUsers.has(item.oddsUserId)) {
        seenUsers.add(item.oddsUserId);
        deduplicated.push(item);
      }
    }

    return deduplicated;
  }, [chats, t, user]);

  const filteredChats = useMemo(() => {
    let result = transformedChats;

    if (activeFilter === "online") {
      result = result.filter((chat: any) => chat.isOnline);
    } else if (activeFilter === "unread") {
      result = result.filter((chat: any) => chat.hasUnread);
    }

    if (!searchQuery.trim()) {
      return result;
    }

    const query = searchQuery.toLowerCase();
    return result.filter(
      (chat: any) =>
        chat.userName.toLowerCase().includes(query) ||
        chat.lastMessage.toLowerCase().includes(query),
    );
  }, [searchQuery, transformedChats, activeFilter]);

  const handleChatClick = (chatId: string) => {
    navigate(`/male/chat/${chatId}`);
  };

  const toggleSearch = () => {
    setIsSearchOpen((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => searchInputRef.current?.focus(), 150);
      } else {
        setSearchQuery("");
      }
      return next;
    });
  };

  // Recent/Online connections for stories carousel
  const storyUsers = useMemo(() => {
    return transformedChats.slice(0, 10);
  }, [transformedChats]);

  const onlineCount = transformedChats.filter((c: any) => c.isOnline).length;
  const unreadCount = transformedChats.filter((c: any) => c.hasUnread).length;

  return (
    <div className="font-display text-ink antialiased selection:bg-pink-600 selection:text-white min-h-screen relative lg:pl-60 overflow-hidden flex flex-col bg-[#f8f4f6] pb-20">
      <div className="relative z-10 flex flex-col h-full flex-1 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full">
        {/* ── Sticky Header ── */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-pink-100/50 shadow-xs px-4 pt-3 pb-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-indigo-600 bg-clip-text text-transparent">
              CHATS
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSearch}
                className={`size-10 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${
                  isSearchOpen
                    ? "bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-sm"
                    : "bg-pink-50 text-pink-600 hover:bg-pink-100"
                }`}
                aria-label="Search"
              >
                <MaterialSymbol name={isSearchOpen ? "close" : "search"} size={20} />
              </button>
              <button
                onClick={() => refreshChats()}
                className="size-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center transition-all active:scale-90 hover:bg-pink-100"
                aria-label="Refresh Chats"
              >
                <MaterialSymbol name="sync" size={20} className="active:animate-spin" />
              </button>
            </div>
          </div>

          {/* Expandable Search Input */}
          {isSearchOpen && (
            <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2 bg-pink-50/70 border border-pink-100 rounded-2xl px-3.5 py-2">
                <MaterialSymbol name="search" size={18} className="text-pink-500 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("searchMatches") || "Search chats & messages..."}
                  className="w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-muted-light"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-muted-light hover:text-pink-600">
                    <MaterialSymbol name="cancel" size={16} filled />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Segmented Capsule Tabs */}
          <div className="mt-3">
            <div className="relative flex items-center bg-pink-50/80 rounded-2xl p-1">
              <div
                className="absolute top-1 bottom-1 bg-white rounded-xl shadow-sm transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0"
                style={{
                  width: `calc((100% - 8px) / ${filters.length})`,
                  transform: `translateX(calc(${filters.findIndex((f) => f.id === activeFilter) * 100}%))`,
                }}
              />
              {filters.map((tab) => {
                const count =
                  tab.id === "all"
                    ? transformedChats.length
                    : tab.id === "online"
                      ? onlineCount
                      : unreadCount;

                const isActive = activeFilter === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`relative z-10 flex-1 py-2 text-[11px] font-black uppercase tracking-wider transition-colors duration-200 text-center flex items-center justify-center gap-1.5 active:scale-95 ${
                      isActive ? "text-pink-600" : "text-muted-light hover:text-slate-700"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {count > 0 && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-black leading-none ${
                          isActive
                            ? tab.id === "unread"
                              ? "bg-pink-600 text-white"
                              : "bg-pink-100 text-pink-600"
                            : "bg-white/80 text-muted"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* ── Main Content Area ── */}
        <main
          className="flex-1 overflow-y-auto px-4 pb-28 pt-3 space-y-4"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Active Connections Story Carousel (When chats exist) */}
          {storyUsers.length > 0 && activeFilter === "all" && !searchQuery && (
            <section className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted">
                  Recent Connections
                </span>
                <span className="text-[9px] font-black text-pink-600 uppercase tracking-widest">
                  {storyUsers.length} Active
                </span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
                {storyUsers.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => handleChatClick(item.id)}
                    className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-95 transition-transform"
                  >
                    <div className="relative">
                      <div className="size-14 rounded-2xl p-[2px] bg-gradient-to-tr from-pink-500 via-rose-500 to-indigo-600 shadow-xs group-hover:scale-105 transition-transform">
                        <img
                          src={item.userAvatar || "https://via.placeholder.com/56"}
                          alt={item.userName}
                          className="w-full h-full rounded-[14px] object-cover bg-white"
                        />
                      </div>
                      {item.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-ink max-w-[56px] truncate text-center">
                      {item.userName.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Subheader: Messages List Header */}
          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted">
                {t("messages") || "Messages"}
              </span>
              {filteredChats.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-600 text-[9px] font-black">
                  {filteredChats.length}
                </span>
              )}
            </div>
          </div>

          {/* Loading Skeletons */}
          {isLoading && chats.length === 0 && (
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl p-3.5 flex items-center gap-3.5 border border-pink-100/50 animate-pulse shadow-xs"
                >
                  <div className="size-14 rounded-2xl bg-pink-100/60 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-28 bg-pink-100/60 rounded-md" />
                      <div className="h-3 w-12 bg-pink-100/40 rounded-md" />
                    </div>
                    <div className="h-3.5 w-44 bg-pink-100/40 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && chats.length === 0 && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold text-center border border-red-100">
              {error}
            </div>
          )}

          {/* Chat List Items */}
          <div key={activeFilter} className="space-y-2">
            {!error &&
              filteredChats.length > 0 &&
              filteredChats.map((chat: any) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat as any}
                  onClick={handleChatClick}
                  showIntimacy={true}
                />
              ))}

            {/* Empty State */}
            {!isLoading && !error && filteredChats.length === 0 && (
              <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-pink-100/60 space-y-4 my-4">
                <div className="size-16 rounded-2xl bg-pink-50 flex items-center justify-center mx-auto text-pink-500 shadow-inner">
                  <MaterialSymbol name="chat_bubble_outline" size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase tracking-wider text-ink">
                    {searchQuery ? "No Matches Found" : "No Conversations Yet"}
                  </h3>
                  <p className="text-xs text-muted max-w-xs mx-auto">
                    {searchQuery
                      ? `No conversations match "${searchQuery}". Try another search term.`
                      : "Start a conversation with verified people near you to begin chatting!"}
                  </p>
                </div>
                <button
                  onClick={() => navigate("/male/discover")}
                  className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all"
                >
                  Discover Matches
                </button>
              </div>
            )}
          </div>

          {/* Discover More Connections CTA Banner */}
          {!isLoading && (
            <div className="bg-gradient-to-br from-pink-600 via-rose-500 to-indigo-600 rounded-[1.75rem] p-5 text-white shadow-lg relative overflow-hidden mt-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl" />
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full inline-block">
                    Explore More
                  </span>
                  <h3 className="text-base font-black tracking-tight leading-tight">
                    Find New Connections ✨
                  </h3>
                  <p className="text-[11px] text-white/80 font-medium">
                    Thousands of active profiles are online right now
                  </p>
                </div>
                <button
                  onClick={() => navigate("/male/discover")}
                  className="shrink-0 h-10 px-4 bg-white text-pink-600 rounded-2xl text-[11px] font-black uppercase tracking-wider shadow-md active:scale-95 transition-all hover:bg-pink-50"
                >
                  Discover
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
