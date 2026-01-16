/**
 * FCM Controller - Handle FCM token registration (FIRE-AND-FORGET)
 * POST /api/fcm/register responds IMMEDIATELY
 * All heavy logic runs in background via setImmediate
 */

import User from '../../models/User.js';

/**
 * Register/Update FCM token for a user (NON-BLOCKING)
 * POST /api/fcm/register
 * Body: { fcmToken: string, platform: 'web' | 'app' }
 */
export const registerFCMToken = async (req, res, next) => {
    const { fcmToken, platform = 'web' } = req.body; // Default to 'web' for backward compatibility
    const userId = req.user?.id;

    if (!fcmToken || !userId) {
        return res.status(400).json({ status: 'error', message: 'FCM token is required' });
    }

    // Validate platform
    const validPlatforms = ['web', 'app'];
    const normalizedPlatform = validPlatforms.includes(platform?.toLowerCase())
        ? platform.toLowerCase()
        : 'web';

    // RESPOND IMMEDIATELY - Fire and forget pattern
    res.status(200).json({
        status: 'success',
        message: 'FCM token registration accepted',
        data: { platform: normalizedPlatform }
    });

    // Background processing - does NOT block the response
    setImmediate(async () => {
        try {
            // Determine which field to update based on platform
            const tokenField = normalizedPlatform === 'app' ? 'fcmTokensApp' : 'fcmTokens';

            await User.findByIdAndUpdate(userId, { $addToSet: { [tokenField]: fcmToken } });

            // Cleanup: Keep only last 5 tokens per platform (non-critical, can fail silently)
            const user = await User.findById(userId).select('fcmTokens fcmTokensApp').lean();

            if (normalizedPlatform === 'app' && user?.fcmTokensApp?.length > 5) {
                await User.findByIdAndUpdate(userId, { fcmTokensApp: user.fcmTokensApp.slice(-5) });
            } else if (normalizedPlatform === 'web' && user?.fcmTokens?.length > 5) {
                await User.findByIdAndUpdate(userId, { fcmTokens: user.fcmTokens.slice(-5) });
            }

            console.log(`[FCM] ✅ Token registered for ${normalizedPlatform} platform, user: ${userId}`);
        } catch (e) {
            console.error('[FCM-BG] Token registration error:', e.message);
        }
    });
};

/**
 * Send test notification to user
 * POST /api/fcm/test
 */
export const sendTestNotification = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('fcmTokens profile phoneNumber').lean();

        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        if (!user.fcmTokens || user.fcmTokens.length === 0) {
            return res.status(400).json({ status: 'error', message: 'No FCM tokens registered.' });
        }

        // Import service only when needed
        const fcmService = (await import('../../services/fcm.service.js')).default;

        const notification = {
            title: '🎉 Test Notification',
            body: 'This is a test push notification from Toki App!',
            icon: '/logo-192x192.png'
        };

        const data = { type: 'test', timestamp: new Date().toISOString() };

        // Send in parallel
        const results = await Promise.all(
            user.fcmTokens.map(token => fcmService.sendNotification(token, notification, data))
        );

        const successCount = results.filter(r => r.success).length;

        // Cleanup invalid tokens in background
        const invalidTokens = results.filter(r => !r.success && r.invalidToken).map((_, i) => user.fcmTokens[i]);
        if (invalidTokens.length > 0) {
            setImmediate(async () => {
                await User.findByIdAndUpdate(userId, { $pull: { fcmTokens: { $in: invalidTokens } } });
            });
        }

        res.status(200).json({
            status: 'success',
            message: `Test notification sent to ${successCount}/${results.length} device(s)`,
            data: { successCount, totalCount: results.length }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Remove FCM token for a user
 * DELETE /api/fcm/token
 * Body: { fcmToken: string, platform: 'web' | 'app' }
 */
export const removeFCMToken = async (req, res, next) => {
    const { fcmToken, platform = 'web' } = req.body;
    const userId = req.user?.id;

    if (!fcmToken) {
        return res.status(400).json({ status: 'error', message: 'FCM token is required' });
    }

    // Validate platform
    const validPlatforms = ['web', 'app'];
    const normalizedPlatform = validPlatforms.includes(platform?.toLowerCase())
        ? platform.toLowerCase()
        : 'web';

    // Respond immediately
    res.status(200).json({
        status: 'success',
        message: 'FCM token removal accepted',
        data: { platform: normalizedPlatform }
    });

    // Background removal
    setImmediate(async () => {
        try {
            // Determine which field to update based on platform
            const tokenField = normalizedPlatform === 'app' ? 'fcmTokensApp' : 'fcmTokens';

            await User.findByIdAndUpdate(userId, { $pull: { [tokenField]: fcmToken } });
            console.log(`[FCM] ✅ Token removed from ${normalizedPlatform} platform, user: ${userId}`);
        } catch (e) {
            console.error('[FCM-BG] Token removal error:', e.message);
        }
    });
};

export default { registerFCMToken, sendTestNotification, removeFCMToken };
