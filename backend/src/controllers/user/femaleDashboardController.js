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
 * Get aggregated dashboard data for female users
 */
export const getDashboardData = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const currentUserId = new mongoose.Types.ObjectId(userId);

        // 1. Fetch User for Available Balance
        const user = await User.findById(userId).select('coinBalance profile role isOnline');

        // 2. Aggregate Total Earnings (Total ever earned)
        const totalEarningsData = await Transaction.aggregate([
            {
                $match: {
                    userId: currentUserId,
                    direction: 'credit',
                    type: { $in: ['message_earned', 'video_call_earned', 'gift_received', 'bonus', 'adjustment'] },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amountCoins' }
                }
            }
        ]);
        const totalEarnings = totalEarningsData.length > 0 ? totalEarningsData[0].total : 0;

        // 3. Aggregate Total Withdrawals (Completed withdrawals)
        const totalWithdrawalsData = await Withdrawal.aggregate([
            {
                $match: {
                    userId: currentUserId,
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$coinsRequested' }
                }
            }
        ]);
        const totalWithdrawals = totalWithdrawalsData.length > 0 ? totalWithdrawalsData[0].total : 0;

        // 4. Aggregate Pending Withdrawals
        const pendingWithdrawalData = await Withdrawal.aggregate([
            {
                $match: {
                    userId: currentUserId,
                    status: 'pending'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$coinsRequested' }
                }
            }
        ]);
        const pendingWithdrawals = pendingWithdrawalData.length > 0 ? pendingWithdrawalData[0].total : 0;

        // Calculate Available Balance = Total Earnings - Total Withdrawals
        const availableBalance = totalEarnings - totalWithdrawals;

        // 5. Stats: Messages Received
        const messagesReceived = await Message.countDocuments({
            receiverId: currentUserId
        });

        // 6. Stats: Active Conversations
        const activeConversations = await Chat.countDocuments({
            'participants.userId': currentUserId,
            isActive: true
        });

        // 7. Stats: Profile Views (Mocked)
        const profileViews = 0;

        // 8. Active Chats (Top 5)
        const chats = await Chat.find({
            'participants.userId': currentUserId,
            isActive: true,
            deletedBy: { $not: { $elemMatch: { userId: currentUserId } } }
        })
            .populate('participants.userId', 'profile phoneNumber isOnline lastSeen')
            .populate('lastMessage')
            .sort({ lastMessageAt: -1 })
            .limit(5);

        const transformedChats = chats.map(chat => {
            const otherParticipant = chat.participants.find(
                p => p.userId._id.toString() !== userId
            );
            const myParticipant = chat.participants.find(
                p => p.userId._id.toString() === userId
            );

            if (!otherParticipant) return null;

            return {
                id: chat._id,
                userId: otherParticipant.userId._id,
                userName: otherParticipant.userId.profile?.name || `User ${otherParticipant.userId.phoneNumber}`,
                userAvatar: otherParticipant.userId.profile?.photos?.[0]?.url || null,
                lastMessage: chat.lastMessage?.content || 'No messages yet',
                timestamp: chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                isOnline: otherParticipant.userId.isOnline,
                hasUnread: (myParticipant?.unreadCount || 0) > 0,
            };
        }).filter(Boolean);

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    name: user.profile?.name || 'Anonymous',
                    avatar: user.profile?.photos?.[0]?.url || null,
                    isPremium: false,
                    isOnline: user.isOnline,
                },
                earnings: {
                    totalEarnings,
                    availableBalance,
                    pendingWithdrawals,
                },
                stats: {
                    messagesReceived,
                    activeConversations,
                    profileViews,
                },
                activeChats: transformedChats
            }
        });
    } catch (error) {
        next(error);
    }
};
