import { useState, useEffect, useMemo } from 'react';

// Helper: Simulated Activity Counter (Cycles through fun facts)
export const ActivityCounter = () => {
  const [index, setIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);
  
  const facts = useMemo(() => [
    "🔥 12,403 people are having fun right now",
    "✨ 84 new matches in the last minute",
    "🎁 42 gifts sent in the last 10 minutes",
    "📹 156 people are video calling now",
    "💎 12 people upgraded to premium today"
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity(0);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % facts.length);
        setOpacity(1);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, [facts.length]);

  return (
    <div className="flex items-center gap-2 px-6 py-2.5 bg-white/30 backdrop-blur-xl rounded-full border border-white/40 shadow-lg transition-all duration-500" style={{ opacity }}>
      <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse"></span>
      <span className="text-sm font-bold text-gray-800 tracking-wide">
        {facts[index]}
      </span>
    </div>
  );
};

// Helper: Shared Mesh Background (Gradient + Blobs)
export const MeshBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-pink-50 via-white to-pink-100 dark:from-[#1a0f14] dark:via-[#2d1b24] dark:to-[#1a0f14] transition-colors duration-700">
      {/* Dynamic Animated Gradient Mesh / Blobs */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#fee2e2_0%,transparent_50%),radial-gradient(circle_at_80%_70%,#fef3c7_0%,transparent_50%),radial-gradient(circle_at_50%_50%,#fff1f2_0%,transparent_50%)] opacity-60 dark:opacity-20 md:opacity-80" />
      
      {/* Shifting Blobs - More vibrant colors */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-pink-400/20 dark:bg-pink-900/10 rounded-full blur-[120px] animate-blob-shift" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] bg-[#FFD93D]/10 dark:bg-amber-900/10 rounded-full blur-[140px] animate-blob-shift" style={{ animationDelay: '-4s' }} />
      <div className="absolute top-[30%] right-[10%] w-[40vw] h-[40vw] bg-rose-400/10 dark:bg-rose-900/10 rounded-full blur-[100px] animate-blob-shift" style={{ animationDelay: '-8s' }} />
    </div>
  );
};

// Helper: Floating Artistic Background with exactly 2 cycling icons
export const ArtisticBackground = () => {
  const assetList = useMemo(() => [
    '/assets/3d_heart.png?v=2',
    '/assets/3d_bell.png?v=2',
    '/assets/3d_coin.png?v=2',
    '/assets/3d_message.png?v=2',
    '/assets/3d_like.png?v=2',
    '/assets/3d_game.png?v=2'
  ], []);

  const [slot1Idx, setSlot1Idx] = useState(0);
  const [slot2Idx, setSlot2Idx] = useState(1);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <MeshBackground />
      
      {/* Exactly 2 Cycling 3D Icons Spaced Apart */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Slot 1 - Left Side */}
        <img
          src={assetList[slot1Idx]}
          alt=""
          onAnimationIteration={() => setSlot1Idx((prev) => (prev + 2) % assetList.length)}
          className="absolute animate-float-up select-none object-contain pointer-events-none drop-shadow-2xl mix-blend-multiply transition-opacity duration-1000"
          style={{
            left: '15%',
            top: '100%',
            width: 260,
            height: 260,
            '--float-duration': '32s',
            '--tw-rotate': '15deg',
            opacity: 0.7,
          } as any}
        />

        {/* Slot 2 - Right Side - Staggered */}
        <img
          src={assetList[slot2Idx]}
          alt=""
          onAnimationIteration={() => setSlot2Idx((prev) => (prev + 2) % assetList.length)}
          className="absolute animate-float-up select-none object-contain pointer-events-none drop-shadow-2xl mix-blend-multiply transition-opacity duration-1000"
          style={{
            left: '75%',
            top: '100%',
            width: 240,
            height: 240,
            '--float-duration': '35s',
            '--tw-rotate': '-12deg',
            animationDelay: '-17s', // Start midway through animation
            opacity: 0.7,
          } as any}
        />
      </div>
    </div>
  );
};
