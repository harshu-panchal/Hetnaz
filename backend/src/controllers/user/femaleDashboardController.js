/**
 * Female Dashboard Controller - Aggregate data for female users
 */

import mongoose from 'mongoose';
import User from '../../models/User.js';
import Transaction from '../../models/Transaction.js';
import Withdrawal from '../../models/Withdrawal.js';
import Message from '../../models/Message.js';
import Chat from '../../models/Chat.js';

/**
 * [LEGACY/COMPAT] Get aggregated dashboard data for female users
 * Will eventually be deprecated by fragmented calls
 */
export const getDashboardData = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const currentUserId = new mongoose.Types.ObjectId(userId);

        // Run all queries in PARALLEL for performance
        const [
            totalEarningsData,
            totalWithdrawalsData,
            pendingWithdrawalData,
            messagesReceived,
            activeConversations,
            chats
        ] = await Promise.all([
            Transaction.aggregate([{ $match: { userId: currentUserId, direction: 'credit', status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amountCoins' } } }]),
            Withdrawal.aggregate([{ $match: { userId: currentUserId, status: 'completed' } }, { $group: { _id: null, total: { $sum: '$coinsRequested' } } }]),
            Withdrawal.aggregate([{ $match: { userId: currentUserId, status: 'pending' } }, { $group: { _id: null, total: { $sum: '$coinsRequested' } } }]),
            Message.countDocuments({ receiverId: currentUserId }),
            Chat.countDocuments({
                'participants.userId': currentUserId,
                isActive: true,
                'deletedBy.userId': { $nin: [currentUserId] }
            }),
            Chat.find({
                'participants.userId': currentUserId,
                isActive: true,
                'deletedBy.userId': { $nin: [currentUserId] }
            })
                .populate('participants.userId', 'profile.name profile.photos profile.name_hi profile.name_en profile.location phoneNumber isOnline lastSeen isVerified role')
                .populate('lastMessage')
                .sort({ lastMessageAt: -1 }).limit(5).lean()
        ]);

        const totalEarnings = totalEarningsData.length > 0 ? totalEarningsData[0].total : 0;
        const totalWithdrawals = totalWithdrawalsData.length > 0 ? totalWithdrawalsData[0].total : 0;
        const pendingWithdrawals = pendingWithdrawalData.length > 0 ? pendingWithdrawalData[0].total : 0;
        const availableBalance = Math.max(0, totalEarnings - (totalWithdrawals + pendingWithdrawals));

        const transformedChats = chats.map(chat => transformChat(chat, userId)).filter(Boolean);

        res.status(200).json({
            status: 'success',
            data: {
                user: formatUser(req.user),
                earnings: { totalEarnings, availableBalance, pendingWithdrawals },
                stats: { messagesReceived, activeConversations, profileViews: 0 },
                activeChats: transformedChats
            }
        });
    } catch (error) { next(error); }
};

/**
 * FRAGMENTED ENDPOINT: Get earnings only
 */
export const getEarnings = async (req, res, next) => {
    try {
        const currentUserId = new mongoose.Types.ObjectId(req.user.id);
        const [earnings, withdrawals, pending] = await Promise.all([
            Transaction.aggregate([{ $match: { userId: currentUserId, direction: 'credit', status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amountCoins' } } }]),
            Withdrawal.aggregate([{ $match: { userId: currentUserId, status: 'completed' } }, { $group: { _id: null, total: { $sum: '$coinsRequested' } } }]),
            Withdrawal.aggregate([{ $match: { userId: currentUserId, status: 'pending' } }, { $group: { _id: null, total: { $sum: '$coinsRequested' } } }])
        ]);

        const total = earnings[0]?.total || 0;
        const completed = withdrawals[0]?.total || 0;
        const pendingValue = pending[0]?.total || 0;

        res.status(200).json({
            status: 'success',
            data: {
                totalEarnings: total,
                availableBalance: Math.max(0, total - (completed + pendingValue)),
                pendingWithdrawals: pendingValue
            }
        });
    } catch (error) { next(error); }
};

/**
 * FRAGMENTED ENDPOINT: Get activity stats only
 */
export const getStats = async (req, res, next) => {
    try {
        const currentUserId = new mongoose.Types.ObjectId(req.user.id);
        const [msgs, chats] = await Promise.all([
            Message.countDocuments({ receiverId: currentUserId }),
            Chat.countDocuments({
                'participants.userId': currentUserId,
                isActive: true,
                'deletedBy.userId': { $nin: [currentUserId] }
            })
        ]);

        res.status(200).json({
            status: 'success',
            data: { messagesReceived: msgs, activeConversations: chats, profileViews: 0 }
        });
    } catch (error) { next(error); }
};

/**
 * FRAGMENTED ENDPOINT: Get active chats list only
 */
export const getActiveChats = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const chats = await Chat.find({
            'participants.userId': new mongoose.Types.ObjectId(userId),
            isActive: true,
            'deletedBy.userId': { $nin: [new mongoose.Types.ObjectId(userId)] }
        })
            .populate('participants.userId', 'profile.name profile.photos profile.name_hi profile.name_en profile.location phoneNumber isOnline lastSeen isVerified role')
            .populate('lastMessage')
            .sort({ lastMessageAt: -1 })
            .limit(5)
            .lean();

        res.status(200).json({
            status: 'success',
            data: chats.map(chat => transformChat(chat, userId)).filter(Boolean)
        });
    } catch (error) { next(error); }
};

// HELPERS: Performance optimized & defensive
const transformChat = (chat, userId) => {
    const stringUserId = userId.toString();

    // Defensive: Handle case where participants might not be fully populated
    const participants = chat.participants || [];

    // Get "me" and "other"
    const me = participants.find(p => {
        const pId = (p.userId?._id || p.userId || '').toString();
        return pId === stringUserId;
    });

    const other = participants.find(p => {
        const pId = (p.userId?._id || p.userId || '').toString();
        return pId !== stringUserId;
    });

    if (!other || !me) return null;

    // Correctly handle populated / unpopulated user data
    const otherUser = other.userId || {};
    const otherUserId = (otherUser._id || otherUser).toString();
    const otherProfile = otherUser.profile || {};

    // Check if current user deleted this chat
    const userDeleteRecord = chat.deletedBy?.find(d => d.userId.toString() === stringUserId);
    const deletedAt = userDeleteRecord?.deletedAt;

    // If user deleted chat and last message is before deletion, show placeholder
    let lastMessageContent = chat.lastMessage?.content || 'No messages yet';
    if (deletedAt && chat.lastMessageAt && new Date(chat.lastMessageAt) <= new Date(deletedAt)) {
        lastMessageContent = 'Start a new conversation';
    }

    return {
        id: chat._id,
        userId: otherUserId,
        userName: otherProfile.name || (language === 'hi' ? otherProfile.name_hi : otherProfile.name_en) || `User ${otherUserId.slice(-4)}`,
        userAvatar: otherProfile.photos?.[0]?.url || null,
        lastMessage: lastMessageContent,
        timestamp: chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        isOnline: !!otherUser.isOnline,
        hasUnread: (me.unreadCount || 0) > 0,
    };
};

const formatUser = (user) => ({
    id: user._id || user.id,
    name: user.profile?.name || 'Anonymous',
    avatar: user.profile?.photos?.[0]?.url || null,
    isPremium: false,
    isOnline: !!user.isOnline,
});
