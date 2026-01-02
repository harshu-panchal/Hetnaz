/**
 * Relationship Controller - Handle block/unblock and chat deletion
 */

import User from '../../models/User.js';
import Chat from '../../models/Chat.js';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';
import logger from '../../utils/logger.js';

/**
 * Block a user
 */
export const blockUser = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { targetUserId } = req.body;

        if (!targetUserId) {
            throw new BadRequestError('Target user ID is required');
        }

        if (userId === targetUserId) {
            throw new BadRequestError('You cannot block yourself');
        }

        const user = await User.findById(userId);
        const targetUser = await User.findById(targetUserId);

        if (!targetUser) {
            throw new NotFoundError('User to block not found');
        }

        // Add to blocked list if not already there
        if (!user.blockedUsers.includes(targetUserId)) {
            user.blockedUsers.push(targetUserId);
            await user.save();
        }

        // Notify the blocked user (standard requirement)
        const io = req.app.get('io');
        if (io) {
            io.to(targetUserId).emit('user:blocked_by', {
                blockedBy: userId,
                blockedByName: user.profile?.name || 'Someone'
            });
        }

        logger.info(`🚫 User ${userId} blocked ${targetUserId}`);

        res.status(200).json({
            status: 'success',
            message: 'User blocked successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Unblock a user
 */
export const unblockUser = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { targetUserId } = req.body;

        if (!targetUserId) {
            throw new BadRequestError('Target user ID is required');
        }

        const user = await User.findById(userId);

        // Remove from blocked list
        user.blockedUsers = user.blockedUsers.filter(
            id => id.toString() !== targetUserId.toString()
        );
        await user.save();

        logger.info(`🔓 User ${userId} unblocked ${targetUserId}`);

        res.status(200).json({
            status: 'success',
            message: 'User unblocked successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a chat conversation for current user
 */
export const deleteChat = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { chatId } = req.params;

        const chat = await Chat.findOne({
            _id: chatId,
            'participants.userId': userId
        });

        if (!chat) {
            throw new NotFoundError('Chat not found');
        }

        // Check if already deleted by this user
        const alreadyDeleted = chat.deletedBy.some(
            d => d.userId.toString() === userId.toString()
        );

        if (!alreadyDeleted) {
            chat.deletedBy.push({
                userId,
                deletedAt: new Date()
            });
            await chat.save();
        }

        logger.info(`🗑️ User ${userId} deleted chat ${chatId}`);

        res.status(200).json({
            status: 'success',
            message: 'Chat deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get block list for current user
 */
export const getBlockedUsers = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('blockedUsers', 'profile role');

        res.status(200).json({
            status: 'success',
            data: {
                blockedUsers: user.blockedUsers.map(u => ({
                    id: u._id,
                    name: u.profile?.name || 'User',
                    avatar: u.profile?.photos?.[0]?.url || null,
                    role: u.role
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};
