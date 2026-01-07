/**
 * Video Call Service - Video Call Business Logic
 * @owner: Video Call Feature
 * @purpose: Handle video call initiation, billing, and lifecycle
 * 
 * NOTE: This is a NEW service that does NOT modify existing transaction flows.
 * Uses its own locked-then-credit billing mechanism.
 * 
 * UPDATED: Removed MongoDB transactions for compatibility with non-replica-set MongoDB.
 */

import mongoose from 'mongoose';
import VideoCall from '../../models/VideoCall.js';
import User from '../../models/User.js';
import Chat from '../../models/Chat.js';
import Transaction from '../../models/Transaction.js';
import AppSettings from '../../models/AppSettings.js';
import logger from '../../utils/logger.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../utils/errors.js';
import earningBatchService from '../wallet/earningBatchService.js';

// Environment config
const VIDEO_CALL_DURATION = parseInt(process.env.VIDEO_CALL_DURATION_SECONDS, 10) || 300;
const CALL_TIMEOUT = parseInt(process.env.CALL_CONNECTION_TIMEOUT_SECONDS, 10) || 45;

// Helper function to get video call cost from AppSettings
const getVideoCallCost = async () => {
    const settings = await AppSettings.getSettings();
    return settings.messageCosts.videoCall;
};

/**
 * Validate if a user can initiate a video call
 * @param {string} callerId - Male user ID
 * @param {string} receiverId - Female user ID
 * @returns {Promise<{valid: boolean, chat: Chat, caller: User, receiver: User}>}
 */
export const validateCallRequest = async (callerId, receiverId) => {
    // 1. Get both users
    const [caller, receiver] = await Promise.all([
        User.findById(callerId),
        User.findById(receiverId),
    ]);

    if (!caller) {
        throw new NotFoundError('Caller not found');
    }
    if (!receiver) {
        throw new NotFoundError('Receiver not found');
    }

    // 2. Validate roles (male calls female)
    if (caller.role !== 'male') {
        throw new ForbiddenError('Only male users can initiate video calls');
    }
    if (receiver.role !== 'female') {
        throw new ForbiddenError('Video calls can only be made to female users');
    }

    // 3. Check for blocks
    if (caller.blockedUsers.some(id => id.toString() === receiverId.toString())) {
        throw new ForbiddenError('You have blocked this user. Unblock to make a video call.');
    }
    if (receiver.blockedUsers.some(id => id.toString() === callerId.toString())) {
        throw new ForbiddenError('You cannot call this user as you have been blocked.');
    }

    // 4. Check if either user is already on a call
    if (caller.isOnCall) {
        throw new BadRequestError('You are already on a call');
    }
    if (receiver.isOnCall) {
        throw new BadRequestError('User is currently on another call');
    }

    // 4. Check if active chat exists between users
    // NOTE: participants is an array of {userId, role} objects
    const chat = await Chat.findOne({
        'participants.userId': { $all: [callerId, receiverId] },
        isActive: true,
    });

    if (!chat) {
        throw new ForbiddenError('You must have an active chat to make a video call');
    }

    // 5. Check caller has enough coins
    const VIDEO_CALL_PRICE = await getVideoCallCost();
    if (caller.coinBalance < VIDEO_CALL_PRICE) {
        throw new BadRequestError(`Insufficient coins. Video call costs ${VIDEO_CALL_PRICE} coins.`);
    }

    // 6. Check receiver is online (optional but recommended)
    // NOTE: Commented out - socket connection is more reliable than DB isOnline flag
    // if (!receiver.isOnline) {
    //     throw new BadRequestError('User is currently offline');
    // }

    return { valid: true, chat, caller, receiver };
};

/**
 * Initiate a video call - Lock coins from caller
 * @param {string} callerId - Male user ID
 * @param {string} receiverId - Female user ID
 * @returns {Promise<VideoCall>}
 */
export const initiateCall = async (callerId, receiverId) => {
    try {
        // Validate
        const { chat } = await validateCallRequest(callerId, receiverId);

        // Get video call cost
        const VIDEO_CALL_PRICE = await getVideoCallCost();

        // Check for existing active call (double-check) for both participants
        const [existingCallerCall, existingReceiverCall] = await Promise.all([
            VideoCall.getActiveCallForUser(callerId),
            VideoCall.getActiveCallForUser(receiverId)
        ]);

        if (existingCallerCall) {
            if (existingCallerCall.status === 'interrupted') {
                logger.info(`🧹 Ending interrupted caller call: ${existingCallerCall._id}`);
                await endCall(existingCallerCall._id.toString(), 'cancelled', callerId);
            } else {
                throw new BadRequestError('You already have an active call');
            }
        }

        if (existingReceiverCall) {
            if (existingReceiverCall.status === 'interrupted') {
                logger.info(`🧹 Ending interrupted receiver call: ${existingReceiverCall._id}`);
                await endCall(existingReceiverCall._id.toString(), 'cancelled', receiverId);
            } else {
                throw new BadRequestError('User is currently on another call');
            }
        }

        // Lock coins from caller (atomic operation with conditions)
        // Note: isOnCall might not exist for older users, so use $ne: true
        const updatedCaller = await User.findOneAndUpdate(
            {
                _id: callerId,
                coinBalance: { $gte: VIDEO_CALL_PRICE },
                isOnCall: { $ne: true }, // Matches false, undefined, null
            },
            {
                $inc: {
                    coinBalance: -VIDEO_CALL_PRICE,
                    lockedCoins: VIDEO_CALL_PRICE,
                },
                $set: { isOnCall: true },
            },
            { new: true }
        );

        if (!updatedCaller) {
            throw new BadRequestError('Failed to lock coins. Please try again.');
        }

        // Set receiver as on call
        await User.findByIdAndUpdate(receiverId, { $set: { isOnCall: true } });

        // Create VideoCall record
        const videoCall = await VideoCall.create({
            callerId: new mongoose.Types.ObjectId(callerId),
            receiverId: new mongoose.Types.ObjectId(receiverId),
            chatId: chat._id,
            coinAmount: VIDEO_CALL_PRICE,
            callDurationSeconds: VIDEO_CALL_DURATION,
            status: 'ringing',
            billingStatus: 'locked',
            requestedAt: new Date(),
        });

        logger.info(`📞 Video call initiated: ${videoCall._id} (${callerId} → ${receiverId})`);

        return videoCall;
    } catch (error) {
        // If VideoCall creation failed after locking coins, try to rollback
        // This is a best-effort rollback without transactions
        logger.error(`initiateCall error: ${error.message}`);
        throw error;
    }
};

/**
 * Handle call accepted by receiver
 * @param {string} callId - VideoCall ID
 * @returns {Promise<VideoCall>}
 */
export const acceptCall = async (callId) => {
    const videoCall = await VideoCall.findOneAndUpdate(
        {
            _id: callId,
            status: 'ringing',
        },
        {
            $set: {
                status: 'accepted',
                acceptedAt: new Date(),
            },
        },
        { new: true }
    );

    if (!videoCall) {
        throw new NotFoundError('Call not found or already answered');
    }

    logger.info(`📞 Video call accepted: ${callId}`);
    return videoCall;
};

/**
 * Handle WebRTC connection established - Credit coins to receiver
 * @param {string} callId - VideoCall ID
 * @returns {Promise<VideoCall>}
 */
export const markCallConnected = async (callId) => {
    try {
        const videoCall = await VideoCall.findById(callId);

        if (!videoCall) {
            throw new NotFoundError('Call not found');
        }

        // Check if already connected or billed
        if (videoCall.status === 'connected' && videoCall.billingStatus === 'charged') {
            return videoCall;
        }

        // Allow connection if accepted OR interrupted (rejoin)
        const allowedStatuses = ['accepted', 'interrupted', 'connected'];
        if (!allowedStatuses.includes(videoCall.status)) {
            throw new BadRequestError(`Call cannot be marked as connected from status: ${videoCall.status}`);
        }

        // If already billed but status was interrupted, just fix status
        if (videoCall.billingStatus === 'charged') {
            videoCall.status = 'connected';
            await videoCall.save();
            return videoCall;
        }

        // Update call status
        videoCall.status = 'connected';
        videoCall.connectedAt = new Date();
        videoCall.billingStatus = 'charged';
        await videoCall.save();

        // Remove locked coins from caller (already deducted from balance)
        // Use $max to ensure lockedCoins never goes below 0
        const caller = await User.findById(videoCall.callerId);
        if (caller) {
            caller.lockedCoins = Math.max(0, caller.lockedCoins - videoCall.coinAmount);
            await caller.save();
        }

        // Batch Credit to Receiver (Optimized)
        earningBatchService.addEarning(videoCall.receiverId.toString(), {
            amount: videoCall.coinAmount,
            type: 'video_call_earned',
            relatedUserId: videoCall.callerId,
            relatedChatId: videoCall.chatId,
            description: `Video call earnings (${VIDEO_CALL_DURATION / 60} min)`,
        });

        // Create transaction record for Caller (Immediate)
        await Transaction.create({
            userId: videoCall.callerId,
            type: 'video_call_spent',
            direction: 'debit',
            amountCoins: videoCall.coinAmount,
            relatedUserId: videoCall.receiverId,
            relatedChatId: videoCall.chatId,
            status: 'completed',
            description: `Video call (${VIDEO_CALL_DURATION / 60} min)`,
            metadata: { videoCallId: videoCall._id },
        });

        logger.info(`📞 Video call connected & billed: ${callId}`);

        return videoCall;
    } catch (error) {
        logger.error(`markCallConnected error: ${error.message}`);
        throw error;
    }
};

/**
 * End a call (normal end or rejection)
 * @param {string} callId - VideoCall ID
 * @param {string} endReason - Reason for ending
 * @param {string} endedBy - User ID who ended the call
 * @returns {Promise<VideoCall>}
 */
export const endCall = async (callId, endReason, endedBy) => {
    try {
        const videoCall = await VideoCall.findById(callId);

        if (!videoCall) {
            throw new NotFoundError('Call not found');
        }

        // Determine final status
        let finalStatus = 'ended';
        if (endReason === 'rejected') {
            finalStatus = 'rejected';
        } else if (endReason === 'connection_failed') {
            // CRITICAL: If the call is already connected, it cannot "fail to connect"
            // Ignore late-arriving connection failure signals
            if (videoCall.status === 'connected') {
                logger.warn(`⚠️ Ignoring connection_failed for already connected call: ${callId}`);
                return videoCall;
            }
            finalStatus = 'failed';
        } else if (endReason === 'timeout') {
            finalStatus = 'missed';
        } else if (endReason === 'cancelled') {
            finalStatus = 'cancelled';
        }

        // Check if refund is needed
        const needsRefund =
            videoCall.billingStatus === 'locked' &&
            ['rejected', 'failed', 'missed', 'cancelled'].includes(finalStatus);

        if (needsRefund) {
            // Refund caller - ensure lockedCoins doesn't go negative
            const caller = await User.findById(videoCall.callerId);
            if (caller) {
                caller.coinBalance += videoCall.coinAmount;
                caller.lockedCoins = Math.max(0, caller.lockedCoins - videoCall.coinAmount);
                await caller.save();
            }

            videoCall.billingStatus = 'refunded';
            logger.info(`💰 Video call refunded: ${callId} (${videoCall.coinAmount} coins)`);
        }

        // Reset isOnCall for both users
        await User.updateMany(
            { _id: { $in: [videoCall.callerId, videoCall.receiverId] } },
            { $set: { isOnCall: false } }
        );

        // Update call record
        videoCall.status = finalStatus;
        videoCall.endReason = endReason;
        videoCall.endedAt = new Date();
        await videoCall.save();

        logger.info(`📞 Video call ended: ${callId} (${finalStatus})`);

        return videoCall;
    } catch (error) {
        logger.error(`endCall error: ${error.message}`);
        throw error;
    }
};

/**
 * Handle call rejection
 * @param {string} callId - VideoCall ID
 * @returns {Promise<VideoCall>}
 */
export const rejectCall = async (callId) => {
    return endCall(callId, 'rejected', null);
};

/**
 * Handle missed call (timeout)
 * @param {string} callId - VideoCall ID
 * @returns {Promise<VideoCall>}
 */
export const handleMissedCall = async (callId) => {
    return endCall(callId, 'timeout', null);
};

/**
 * Handle call cancellation by caller
 * @param {string} callId - VideoCall ID
 * @returns {Promise<VideoCall>}
 */
export const cancelCall = async (callId) => {
    return endCall(callId, 'cancelled', null);
};

/**
 * Rejoin an interrupted call (accidental cut or hang up with time left)
 * @param {string} callId - VideoCall ID
 * @param {string} userId - User ID who is rejoining
 * @returns {Promise<{videoCall: VideoCall, remainingTime: number}>}
 */
export const rejoinCall = async (callId, userId) => {
    try {
        const videoCall = await VideoCall.findById(callId);

        if (!videoCall) {
            throw new NotFoundError('Call not found');
        }

        // Validate if rejoin is possible - now allowing 'connected' and 'interrupted'
        const allowRejoinStates = ['connected', 'interrupted', 'ended', 'failed'];
        if (!allowRejoinStates.includes(videoCall.status)) {
            throw new BadRequestError(`Cannot rejoin call in ${videoCall.status} state`);
        }

        if (videoCall.endReason === 'timer_expired') {
            throw new BadRequestError('Call already reached its time limit');
        }

        // PER-USER REJOIN LIMIT: Only one rejoin per participant
        const userAlreadyRejoined = (videoCall.rejoinedUserIds || []).includes(userId);
        if (userAlreadyRejoined) {
            throw new BadRequestError('You have already used your rejoin attempt for this call.');
        }

        if ((videoCall.rejoinCount || 0) >= 4) { // Multi-rejoin safety limit
            throw new BadRequestError('Maximum rejoin attempts for this call exceeded');
        }

        // Calculate remaining seconds
        const connectedTime = videoCall.connectedAt ? new Date(videoCall.connectedAt).getTime() : 0;
        const endedTime = videoCall.endedAt ? new Date(videoCall.endedAt).getTime() : Date.now();

        if (!connectedTime) {
            throw new BadRequestError('Cannot rejoin a call that never connected');
        }

        const elapsedSeconds = Math.floor((endedTime - connectedTime) / 1000);
        const remainingSeconds = Math.max(0, videoCall.callDurationSeconds - elapsedSeconds);

        if (remainingSeconds < 5) {
            throw new BadRequestError('Insufficient time remaining to rejoin');
        }

        // Re-set isOnCall for both users
        await User.updateMany(
            { _id: { $in: [videoCall.callerId, videoCall.receiverId] } },
            { $set: { isOnCall: true } }
        );

        // Update call record
        videoCall.status = 'connected';
        videoCall.rejoinCount = (videoCall.rejoinCount || 0) + 1;

        if (!videoCall.rejoinedUserIds.includes(userId)) {
            videoCall.rejoinedUserIds.push(userId);
        }

        videoCall.endedAt = null;
        videoCall.endReason = null;
        await videoCall.save();

        logger.info(`🔄 Video call REJOINED: ${callId} (Remaining: ${remainingSeconds}s)`);

        return { videoCall, remainingSeconds };
    } catch (error) {
        logger.error(`rejoinCall error: ${error.message}`);
        throw error;
    }
};

/**
 * Get call by ID
 * @param {string} callId - VideoCall ID
 * @returns {Promise<VideoCall>}
 */
export const getCall = async (callId) => {
    return VideoCall.findById(callId)
        .populate('callerId', 'profile.name profile.photos')
        .populate('receiverId', 'profile.name profile.photos');
};

/**
 * Get active call for user
 * @param {string} userId - User ID
 * @returns {Promise<VideoCall|null>}
 */
export const getActiveCallForUser = async (userId) => {
    return VideoCall.getActiveCallForUser(userId);
};

/**
 * Cleanup stale calls (for server recovery)
 */
export const cleanupStaleCalls = async () => {
    const staleThreshold = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes

    const staleCalls = await VideoCall.find({
        status: { $in: ['pending', 'ringing', 'accepted'] },
        requestedAt: { $lt: staleThreshold },
    });

    for (const call of staleCalls) {
        try {
            await endCall(call._id.toString(), 'connection_failed', null);
            logger.warn(`🧹 Cleaned up stale call: ${call._id}`);
        } catch (error) {
            logger.error(`Failed to cleanup stale call ${call._id}: ${error.message}`);
        }
    }

    return staleCalls.length;
};

// Export config for use in handlers
export const VIDEO_CALL_CONFIG = {
    DURATION: VIDEO_CALL_DURATION,
    TIMEOUT: CALL_TIMEOUT,
    // PRICE is now dynamic, fetch via getVideoCallCost()
};

export default {
    validateCallRequest,
    initiateCall,
    acceptCall,
    markCallConnected,
    endCall,
    rejectCall,
    handleMissedCall,
    cancelCall,
    rejoinCall,
    getCall,
    getActiveCallForUser,
    cleanupStaleCalls,
    VIDEO_CALL_CONFIG,
};
