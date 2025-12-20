/**
 * Intimacy Level Calculator
 * @purpose: Calculate intimacy levels based on message count
 */

// Fibonacci-based level thresholds
const LEVEL_THRESHOLDS = [
    { level: 1, messagesRequired: 0, totalMessages: 0, badge: '🌱 Strangers' },
    { level: 2, messagesRequired: 2, totalMessages: 2, badge: '💬 Acquaintances' },
    { level: 3, messagesRequired: 3, totalMessages: 5, badge: '😊 Friends' },
    { level: 4, messagesRequired: 5, totalMessages: 10, badge: '💕 Close Friends' },
    { level: 5, messagesRequired: 8, totalMessages: 18, badge: '💖 Best Friends' },
    { level: 6, messagesRequired: 13, totalMessages: 31, badge: '💝 Intimate' },
    { level: 7, messagesRequired: 21, totalMessages: 52, badge: '💞 Soulmates' },
    { level: 8, messagesRequired: 34, totalMessages: 86, badge: '⭐ Legendary' },
    { level: 9, messagesRequired: 55, totalMessages: 141, badge: '🔥 Eternal' },
    { level: 10, messagesRequired: 89, totalMessages: 230, badge: '👑 Divine' },
];

/**
 * Get level info based on total message count
 */
export const getLevelInfo = (totalMessages) => {
    let currentLevel = 1;
    let nextLevelThreshold = LEVEL_THRESHOLDS[1];

    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (totalMessages >= LEVEL_THRESHOLDS[i].totalMessages) {
            currentLevel = LEVEL_THRESHOLDS[i].level;
            nextLevelThreshold = LEVEL_THRESHOLDS[i + 1] || null;
            break;
        }
    }

    const currentThreshold = LEVEL_THRESHOLDS.find(t => t.level === currentLevel);
    const progress = nextLevelThreshold
        ? ((totalMessages - currentThreshold.totalMessages) / (nextLevelThreshold.totalMessages - currentThreshold.totalMessages)) * 100
        : 100;

    return {
        level: currentLevel,
        badge: currentThreshold.badge,
        totalMessages,
        messagesForCurrentLevel: currentThreshold.totalMessages,
        messagesForNextLevel: nextLevelThreshold?.totalMessages || null,
        messagesToNextLevel: nextLevelThreshold ? nextLevelThreshold.totalMessages - totalMessages : 0,
        progress: Math.min(Math.round(progress), 100),
    };
};

/**
 * Check if level up occurred
 */
export const checkLevelUp = (previousMessages, newMessages) => {
    const previousLevel = getLevelInfo(previousMessages).level;
    const newLevel = getLevelInfo(newMessages).level;

    return {
        leveledUp: newLevel > previousLevel,
        previousLevel,
        newLevel,
        newLevelInfo: getLevelInfo(newMessages),
    };
};

/**
 * Get all level thresholds (for reference)
 */
export const getAllLevels = () => {
    return LEVEL_THRESHOLDS;
};

export default {
    getLevelInfo,
    checkLevelUp,
    getAllLevels,
};
