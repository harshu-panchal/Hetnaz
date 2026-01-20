/**
 * Block Check Middleware
 * @purpose: Prevent communication between blocked users
 * @usage: Apply to chat, message, and video call routes
 */

import User from '../models/User.js';
import { ForbiddenError } from '../utils/errors.js';

/**
 * Middleware to check if users are blocked from communicating
 * Checks:
 * 1. If current user is blocked by admin (isBlocked = true)
 * 2. If current user has blocked target user
 * 3. If target user has blocked current user
 */
export const checkBlockedStatus = async (req, res, next) => {
    try {
        const currentUserId = req.user.id;

        // Extract target user ID from various sources
        const targetUserId = req.body.receiverId ||
            req.body.recipientId ||
            req.body.userId ||
            req.params.userId ||
            req.body.targetUserId;

        if (!targetUserId) {
            // No target user specified, allow request (e.g., fetching own data)
            return next();
        }

        // Fetch both users with blocking relationships
        const [currentUser, targetUser] = await Promise.all([
            User.findById(currentUserId).select('isBlocked blockedUsers blockedBy'),
            User.findById(targetUserId).select('isBlocked blockedUsers blockedBy')
        ]);

        if (!currentUser) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        if (!targetUser) {
            return res.status(404).json({
                status: 'fail',
                message: 'Target user not found'
            });
        }

        // 1. Check if current user is blocked by admin
        if (currentUser.isBlocked) {
            return res.status(403).json({
                status: 'fail',
                blocked: true,
                blockType: 'admin',
                message: 'Your account has been temporarily blocked. Please contact support for assistance.'
            });
        }

        // 2. Check if current user has blocked target user
        const hasBlockedTarget = currentUser.blockedUsers?.some(
            id => id.toString() === targetUserId.toString()
        );

        if (hasBlockedTarget) {
            return res.status(403).json({
                status: 'fail',
                blocked: true,
                blockType: 'user_blocked',
                message: 'You have blocked this user. Unblock them to communicate.'
            });
        }

        // 3. Check if current user is blocked by target user
        const isBlockedByTarget = currentUser.blockedBy?.some(
            id => id.toString() === targetUserId.toString()
        );

        if (isBlockedByTarget) {
            return res.status(403).json({
                status: 'fail',
                blocked: true,
                blockType: 'blocked_by_user',
                message: 'You cannot communicate with this user.'
            });
        }

        // No blocks found, allow communication
        next();
    } catch (error) {
        console.error('[BLOCK-CHECK] Error:', error);
        next(error);
    }
};

/**
 * Lightweight check - only verify admin block status
 * Use for non-communication actions like viewing profiles
 */
export const checkAdminBlock = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('isBlocked blockReason');

        if (user?.isBlocked) {
            return res.status(403).json({
                status: 'fail',
                blocked: true,
                blockType: 'admin',
                message: user.blockReason || 'Your account has been temporarily blocked by administrator.',
                reason: user.blockReason
            });
        }

        next();
    } catch (error) {
        console.error('[ADMIN-BLOCK-CHECK] Error:', error);
        next(error);
    }
};

export default { checkBlockedStatus, checkAdminBlock };
