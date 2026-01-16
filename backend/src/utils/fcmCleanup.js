/**
 * FCM Token Auto-Cleanup Utility
 * Automatically removes invalid FCM tokens from user's database record
 */

import User from '../models/User.js';

console.log('[FCM-CLEANUP] ✅ FCM Auto-Cleanup Utility loaded');

/**
 * Remove invalid FCM token(s) from a user
 * @param {string} userId - User ID
 * @param {string|string[]} invalidTokens - Invalid token(s) to remove
 * @returns {Promise<object>} Cleanup result
 */
export const removeInvalidTokens = async (userId, invalidTokens) => {
    console.log('[FCM-CLEANUP] 🧹 === REMOVING INVALID TOKENS ===');
    console.log('[FCM-CLEANUP] 👤 User ID:', userId);

    const tokensToRemove = Array.isArray(invalidTokens) ? invalidTokens : [invalidTokens];
    console.log('[FCM-CLEANUP] 🗑️ Tokens to remove:', tokensToRemove.length);

    try {
        // Use atomic operation to avoid write conflicts
        // Remove from both web (fcmTokens) and app (fcmTokensApp) arrays
        console.log('[FCM-CLEANUP] 📊 Removing tokens atomically from both platforms...');

        const result = await User.findByIdAndUpdate(
            userId,
            {
                $pullAll: {
                    fcmTokens: tokensToRemove,      // Web tokens
                    fcmTokensApp: tokensToRemove    // App tokens
                }
            },
            {
                new: true,
                select: 'fcmTokens fcmTokensApp'
            }
        );

        if (!result) {
            console.error('[FCM-CLEANUP] ❌ User not found');
            return { success: false, error: 'User not found' };
        }

        const webCount = result.fcmTokens?.length || 0;
        const appCount = result.fcmTokensApp?.length || 0;
        const removedCount = tokensToRemove.length; // Approximate

        console.log('[FCM-CLEANUP] ✅ Removed invalid token(s) from both platforms');
        console.log('[FCM-CLEANUP] 📊 Remaining: Web:', webCount, '| App:', appCount);

        return {
            success: true,
            removedCount,
            remainingWebCount: webCount,
            remainingAppCount: appCount
        };

    } catch (error) {
        console.error('[FCM-CLEANUP] ❌ Error removing tokens:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Clean up invalid tokens from notification send results
 * @param {string} userId - User ID
 * @param {array} sendResults - Array of send results from fcmService
 * @returns {Promise<object>} Cleanup result
 */
export const autoCleanupFromResults = async (userId, sendResults) => {
    console.log('[FCM-CLEANUP] 🔍 Checking results for invalid tokens...');

    const invalidTokens = sendResults
        .filter(result => !result.success && result.invalidToken && result.token)
        .map(result => result.token);

    if (invalidTokens.length === 0) {
        console.log('[FCM-CLEANUP] ✅ No invalid tokens found');
        return { success: true, removedCount: 0 };
    }

    console.log('[FCM-CLEANUP] ⚠️ Found', invalidTokens.length, 'invalid token(s)');
    return await removeInvalidTokens(userId, invalidTokens);
};

export default {
    removeInvalidTokens,
    autoCleanupFromResults
};
