import { useEffect, useState } from 'react';
import { MaterialSymbol } from './MaterialSymbol';
import { useTranslation } from '../../core/hooks/useTranslation';

interface DailyRewardModalProps {
    isOpen: boolean;
    onClose: () => void;
    coinsAwarded: number;
    newBalance: number;
}

export const DailyRewardModal = ({
    isOpen,
    onClose,
    coinsAwarded,
    newBalance
}: DailyRewardModalProps) => {
    const { t } = useTranslation();
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowConfetti(true);
            // Auto-close after 4 seconds
            const timer = setTimeout(() => {
                onClose();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
            {/* Confetti Effect */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: '-10%',
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 2}s`
                            }}
                        >
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                    backgroundColor: ['#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#10b981'][i % 5]
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Content */}
            <div className="relative bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-[#2d1a24] dark:via-[#1a1a1a] dark:to-[#2d1a24] rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border-2 border-pink-200 dark:border-pink-900/30 animate-in zoom-in slide-in-from-bottom-4 duration-500">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <MaterialSymbol name="close" size={24} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-6 animate-in zoom-in duration-700 delay-100">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full blur-xl opacity-50 animate-pulse" />
                        <div className="relative bg-gradient-to-br from-pink-500 to-rose-500 rounded-full p-6 shadow-lg">
                            <MaterialSymbol name="celebration" className="text-white" size={64} />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-black text-center mb-2 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent animate-in slide-in-from-bottom-2 duration-500 delay-200">
                    {t('dailyRewardTitle')}
                </h2>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6 animate-in fade-in duration-500 delay-300">
                    {t('dailyRewardSubtitle')}
                </p>

                {/* Coins Awarded */}
                <div className="bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-2xl p-6 mb-6 border-2 border-yellow-300 dark:border-yellow-700/50 animate-in zoom-in duration-500 delay-400">
                    <div className="flex items-center justify-center gap-3">
                        <MaterialSymbol name="diamond" className="text-yellow-600 dark:text-yellow-400 animate-bounce" size={40} />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{t('youEarned')}</p>
                            <p className="text-4xl font-black text-yellow-600 dark:text-yellow-400">
                                +{coinsAwarded} <span className="text-2xl">{t('coins')}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* New Balance */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-6 animate-in slide-in-from-bottom-2 duration-500 delay-500">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{t('newBalanceLabel')}</span>
                        <div className="flex items-center gap-2">
                            <MaterialSymbol name="account_balance_wallet" className="text-pink-600 dark:text-pink-400" size={20} />
                            <span className="text-xl font-bold text-gray-900 dark:text-white">{newBalance} {t('coins')}</span>
                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                <button
                    onClick={onClose}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 animate-in fade-in duration-500 delay-600"
                >
                    {t('awesomeThanks')}
                </button>

                {/* Fun Message */}
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 animate-in fade-in duration-500 delay-700">
                    {t('comeBackTomorrow')}
                </p>
            </div>

            <style>{`
                @keyframes confetti {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg);
                        opacity: 0;
                    }
                }
                .animate-confetti {
                    animation: confetti linear forwards;
                }
            `}</style>
        </div>
    );
};
