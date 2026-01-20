import { useNavigate } from 'react-router-dom';
import { useGlobalState } from '../../core/context/GlobalStateContext';
import { MaterialSymbol } from './MaterialSymbol';
import { useEffect, useState } from 'react';
import { useTranslation } from '../../core/hooks/useTranslation';

export const InAppNotificationToast = () => {
    const { notifications, clearNotification, user } = useGlobalState();
    const navigate = useNavigate();

    if (notifications.length === 0) return null;

    const handleNotificationClick = (notification: any) => {
        clearNotification(notification.id);

        if (notification.type === 'message' && notification.chatId) {
            const role = user?.role === 'female' ? 'female' : 'male';
            navigate(`/${role}/chat/${notification.chatId}`);
        }
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] flex flex-col items-center gap-3 p-4 pointer-events-none">
            {notifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleNotificationClick(notification)}
                    onClose={() => clearNotification(notification.id)}
                />
            ))}
        </div>
    );
};

interface NotificationItemProps {
    notification: any;
    onClick: () => void;
    onClose: () => void;
}

const NotificationItem = ({ notification, onClick, onClose }: NotificationItemProps) => {
    const { t } = useTranslation();
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const duration = 5000;
        const interval = 50;
        const step = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress((prev) => Math.max(0, prev - step));
        }, interval);

        return () => clearInterval(timer);
    }, []);

    // Helper to format type (e.g., video_call -> typeVideoCall)
    const formatTypeKey = (type: string) => {
        const camelType = type.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
        return `type${camelType}`;
    };

    return (
        <div
            onClick={onClick}
            className="group pointer-events-auto relative w-full max-w-md bg-white/90 dark:bg-[#1a0f14]/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-pink-200/50 dark:border-pink-900/30 flex items-center gap-4 p-4 animate-slide-down cursor-pointer active:scale-[0.98] transition-all hover:bg-white dark:hover:bg-[#1a0f14]"
        >
            {/* Sender Avatar or Icon */}
            <div className="relative shrink-0">
                {notification.avatar ? (
                    <img
                        src={notification.avatar}
                        alt={t(notification.title)}
                        className="size-12 rounded-xl object-cover ring-2 ring-pink-100 dark:ring-pink-900/30"
                    />
                ) : (
                    <div className="size-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
                        <MaterialSymbol
                            name={notification.type === 'message' ? 'chat' : notification.type === 'gift' ? 'redeem' : 'notifications'}
                            className="text-white"
                            size={24}
                            filled
                        />
                    </div>
                )}
                {notification.type === 'message' && (
                    <div className="absolute -bottom-1 -right-1 size-5 bg-green-500 border-2 border-white dark:border-[#1a0f14] rounded-full shadow-sm" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate pr-2">
                        {t(notification.title)}
                    </h4>
                    <span className="text-[10px] font-medium text-pink-600 dark:text-pink-400 uppercase tracking-wider">
                        {t(formatTypeKey(notification.type))}
                    </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {t(notification.message)}
                </p>
            </div>

            {/* Close Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="shrink-0 p-2 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-full transition-colors group-hover:scale-110 active:scale-90"
            >
                <MaterialSymbol name="close" size={20} className="text-gray-400 group-hover:text-pink-500" />
            </button>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100/50 dark:bg-gray-800/30 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-75 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <style>{`
                @keyframes slideDown {
                    from {
                        transform: translateY(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-slide-down {
                    animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};
