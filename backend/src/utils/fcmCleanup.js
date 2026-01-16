/**
 * FCM Token Auto-Cleanup Utility
 * Automatically removes invalid FCM tokens from user's database record
 * 
 * Updated for single-token-per-platform structure (fcmTokensWeb, fcmTokensApp)
 */

import User from '../models/User.js';

console.log('[FCM-CLEANUP] ✅ FCM Auto-Cleanup Utility loaded');

/**
 * Remove invalid FCM token for a specific platform
 * @param {string} userId - User ID
 * @param {string} platform - Platform: 'web' or 'app'
 * @returns {Promise<object>} Cleanup result
 */
export const removeInvalidToken = async (userId, platform) => {
    console.log('[FCM-CLEANUP] 🧹 === REMOVING INVALID TOKEN ===');
    console.log('[FCM-CLEANUP] 👤 User ID:', userId);
    console.log('[FCM-CLEANUP] 📱 Platform:', platform);

    try {
        const tokenField = platform === 'app' ? 'fcmTokensApp' : 'fcmTokensWeb';

        const result = await User.findByIdAndUpdate(
            userId,
            { [tokenField]: null },
            { new: true, select: 'fcmTokensWeb fcmTokensApp' }
        );

        if (!result) {
            console.error('[FCM-CLEANUP] ❌ User not found');
            return { success: false, error: 'User not found' };
        }

        console.log('[FCM-CLEANUP] ✅ Cleared invalid token for', platform);
        console.log('[FCM-CLEANUP] 📊 Remaining: Web:', result.fcmTokensWeb ? 'set' : 'null', '| App:', result.fcmTokensApp ? 'set' : 'null');

        return { success: true, platform };

    } catch (error) {
        console.error('[FCM-CLEANUP] ❌ Error removing token:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use removeInvalidToken instead
 */
export const removeInvalidTokens = async (userId, invalidTokens) => {
    console.log('[FCM-CLEANUP] ⚠️ Using legacy removeInvalidTokens - clearing both platforms');

    try {
        await User.findByIdAndUpdate(userId, {
            fcmTokensWeb: null,
            fcmTokensApp: null
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Clean up invalid tokens from notification send results
 * @param {string} userId - User ID
 * @param {array} sendResults - Array of send results with platform info
 * @returns {Promise<object>} Cleanup result
 */
export const autoCleanupFromResults = async (userId, sendResults) => {
    console.log('[FCM-CLEANUP] 🔍 Checking results for invalid tokens...');

    const invalidResults = sendResults
        .filter(result => !result.success && result.invalidToken && result.platform);

    if (invalidResults.length === 0) {
        console.log('[FCM-CLEANUP] ✅ No invalid tokens found');
        return { success: true, removedCount: 0 };
    }

    console.log('[FCM-CLEANUP] ⚠️ Found', invalidResults.length, 'invalid token(s)');

    for (const result of invalidResults) {
        await removeInvalidToken(userId, result.platform);
    }

    return { success: true, removedCount: invalidResults.length };
};

export default {
    removeInvalidToken,
    removeInvalidTokens,
    autoCleanupFromResults
};
