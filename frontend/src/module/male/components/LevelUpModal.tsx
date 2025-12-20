import { useEffect, useState } from 'react';

interface IntimacyInfo {
    level: number;
    badge: string;
    totalMessages: number;
    messagesForCurrentLevel: number;
    messagesForNextLevel: number | null;
    messagesToNextLevel: number;
    progress: number;
}

interface LevelUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    levelInfo: IntimacyInfo | null;
    userName: string;
}

export const LevelUpModal = ({ isOpen, onClose, levelInfo, userName }: LevelUpModalProps) => {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            // Auto close after 4 seconds
            const timer = setTimeout(() => {
                onClose();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen || !levelInfo) return null;

    const getBadgeEmoji = () => {
        return levelInfo.badge.split(' ')[0];
    };

    const getBadgeName = () => {
        return levelInfo.badge.split(' ').slice(1).join(' ');
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className={`bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 rounded-3xl p-1 transform transition-all duration-500 ${isAnimating ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 rounded-3xl p-6 text-center min-w-[280px]">
                    {/* Sparkles Animation */}
                    <div className="relative">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            {[...Array(8)].map((_, i) => (
                                <span
                                    key={i}
                                    className="absolute text-yellow-300 animate-ping"
                                    style={{
                                        left: `${Math.cos(i * 45 * Math.PI / 180) * 50}px`,
                                        top: `${Math.sin(i * 45 * Math.PI / 180) * 50}px`,
                                        animationDelay: `${i * 100}ms`,
                                        animationDuration: '1.5s',
                                    }}
                                >
                                    ✨
                                </span>
                            ))}
                        </div>

                        {/* Level Badge */}
                        <div className="text-7xl mb-4 animate-bounce">
                            {getBadgeEmoji()}
                        </div>
                    </div>

                    {/* Congratulations Text */}
                    <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">
                        🎉 Level Up! 🎉
                    </h2>

                    <p className="text-pink-200 mb-4">
                        You and <span className="font-bold text-white">{userName}</span> are now
                    </p>

                    {/* Badge Name */}
                    <div className="bg-white/20 rounded-2xl px-6 py-3 mb-4">
                        <p className="text-3xl font-bold text-white">
                            Level {levelInfo.level}
                        </p>
                        <p className="text-lg text-pink-200">
                            {getBadgeName()}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center gap-4 text-sm text-pink-200 mb-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">{levelInfo.totalMessages}</p>
                            <p>Messages</p>
                        </div>
                        {levelInfo.messagesToNextLevel > 0 && (
                            <div className="text-center">
                                <p className="text-2xl font-bold text-white">{levelInfo.messagesToNextLevel}</p>
                                <p>To Next Level</p>
                            </div>
                        )}
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="px-8 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full font-medium transition-colors"
                    >
                        Continue Chatting
                    </button>
                </div>
            </div>
        </div>
    );
};
