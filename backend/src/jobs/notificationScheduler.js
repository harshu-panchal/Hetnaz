/**
 * Scheduled Jobs for Push Notifications
 * @owner: Sujal (Notification Domain)
 * @purpose: Handle automated notification tasks like daily reward reminders
 */

import User from '../models/User.js';
import chatNotificationService from '../services/notification/chatNotification.service.js';
import logger from '../utils/logger.js';

/**
 * Send daily reward reminders to users who haven't claimed in 24+ hours
 * Only targets users with FCM tokens who are eligible for rewards
 */
export const sendDailyRewardReminders = async () => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Find male users who:
        // 1. Have FCM tokens (can receive notifications)
        // 2. Haven't claimed daily reward in 24+ hours OR never claimed
        // 3. Are active (not banned)
        const eligibleUsers = await User.find({
            role: 'male',
            status: 'active',
            fcmTokens: { $exists: true, $ne: [] },
            $or: [
                { lastDailyRewardClaim: { $lt: twentyFourHoursAgo } },
                { lastDailyRewardClaim: { $exists: false } },
                { lastDailyRewardClaim: null }
            ]
        }).select('_id profile.name').limit(500); // Process max 500 per run

        if (eligibleUsers.length === 0) {
            logger.debug('🎁 No users eligible for daily reward reminders');
            return { sent: 0, total: 0 };
        }

        logger.info(`🎁 Found ${eligibleUsers.length} users eligible for daily reward reminders`);

        let sent = 0;
        let errors = 0;
        const DAILY_REWARD_AMOUNT = 10; // Default daily reward

        // Process in batches to avoid overwhelming FCM
        const batchSize = 20;
        for (let i = 0; i < eligibleUsers.length; i += batchSize) {
            const batch = eligibleUsers.slice(i, i + batchSize);

            await Promise.all(batch.map(async (user) => {
                try {
                    const result = await chatNotificationService.notifyDailyReward(
                        user._id,
                        DAILY_REWARD_AMOUNT
                    );
                    if (result.success) sent++;
                } catch (err) {
                    errors++;
                    logger.error(`[DAILY-REWARD] Failed for user ${user._id}: ${err.message}`);
                }
            }));

            // Small delay between batches
            if (i + batchSize < eligibleUsers.length) {
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        logger.info(`🎁 Daily reward reminders complete: ${sent} sent, ${errors} errors`);
        return { sent, errors, total: eligibleUsers.length };

    } catch (error) {
        logger.error(`❌ Error in sendDailyRewardReminders: ${error.message}`);
        throw error;
    }
};

/**
 * Notify male users about a newly approved female user nearby
 * Called when a female profile gets approved by admin
 * @param {object} femaleUser - The newly approved female user
 * @param {number} radiusKm - Search radius in kilometers (default: 50km)
 */
export const notifyNearbyUsersAboutNewFemale = async (femaleUser, radiusKm = 50) => {
    try {
        // Check if female has location
        const femaleLocation = femaleUser.profile?.location?.coordinates;
        if (!femaleLocation || femaleLocation.length !== 2) {
            logger.debug('👯 Female user has no location, skipping nearby alerts');
            return { notified: 0 };
        }

        // Find male users nearby with FCM tokens
        const nearbyMales = await User.find({
            role: 'male',
            status: 'active',
            fcmTokens: { $exists: true, $ne: [] },
            'profile.location': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: femaleLocation
                    },
                    $maxDistance: radiusKm * 1000 // Convert to meters
                }
            }
        }).select('_id').limit(100); // Limit to prevent spam

        if (nearbyMales.length === 0) {
            logger.debug('👯 No nearby male users found for new female alert');
            return { notified: 0 };
        }

        logger.info(`👯 Found ${nearbyMales.length} nearby male users to notify`);

        let notified = 0;

        // Send notifications in parallel batches
        const batchSize = 10;
        for (let i = 0; i < nearbyMales.length; i += batchSize) {
            const batch = nearbyMales.slice(i, i + batchSize);

            await Promise.all(batch.map(async (maleUser) => {
                try {
                    const result = await chatNotificationService.notifyNewNearbyUser(
                        maleUser._id,
                        femaleUser
                    );
                    if (result.success) notified++;
                } catch (err) {
                    logger.error(`[NEARBY] Failed for user ${maleUser._id}: ${err.message}`);
                }
            }));
        }

        logger.info(`👯 New nearby female alerts complete: ${notified} notified`);
        return { notified, total: nearbyMales.length };

    } catch (error) {
        // Gracefully handle geo query errors (e.g., no 2dsphere index)
        if (error.code === 16755 || error.message.includes('2dsphere')) {
            logger.warn('👯 Geospatial query not available, skipping nearby alerts');
            return { notified: 0, reason: 'geo_not_available' };
        }
        logger.error(`❌ Error in notifyNearbyUsersAboutNewFemale: ${error.message}`);
        return { notified: 0, error: error.message };
    }
};

/**
 * Start the notification scheduler
 * - Daily reward reminders: Every 6 hours (checking at different times catches different user timezones)
 */
export const startNotificationScheduler = () => {
    // Daily reward reminders - every 6 hours
    const dailyRewardInterval = 6 * 60 * 60 * 1000; // 6 hours

    // Run first check after 1 minute (let server stabilize)
    setTimeout(() => {
        sendDailyRewardReminders().catch(err => {
            logger.error(`Daily reward scheduler error: ${err.message}`);
        });
    }, 60 * 1000);

    // Then run every 6 hours
    setInterval(() => {
        sendDailyRewardReminders().catch(err => {
            logger.error(`Daily reward scheduler error: ${err.message}`);
        });
    }, dailyRewardInterval);

    logger.info('🔔 Notification scheduler started - Daily rewards every 6 hours');
};

export default {
    sendDailyRewardReminders,
    notifyNearbyUsersAboutNewFemale,
    startNotificationScheduler,
};
