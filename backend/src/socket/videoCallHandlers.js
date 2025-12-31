/**
 * Video Call Socket Handlers - WebRTC Signaling & Call Events
 * @owner: Video Call Feature
 * @purpose: Handle real-time video call signaling via Socket.IO
 * 
 * NOTE: This is a NEW handler that integrates with existing socket setup.
 * Does NOT modify existing chat handlers.
 * 
 * UPDATED: Uses Socket.IO rooms (user joins room with their userId) instead of
 * maintaining a separate socket mapping. This is more reliable.
 */

import videoCallService from '../services/videoCall/videoCallService.js';
import agoraService from '../services/agora/agoraService.js';
import logger from '../utils/logger.js';

// In-memory store for active calls and timers
const activeCallTimers = new Map(); // callId -> { timer, startTime }

/**
 * Helper to setup timer & token for call resumption (REJOIN)
 */
const setupCallResumption = async (videoCall, remainingSeconds, io) => {
    const callId = videoCall._id.toString();
    const callerId = videoCall.callerId.toString();
    const receiverId = videoCall.receiverId.toString();
    const channelName = videoCall._id.toString();
    const durationMs = remainingSeconds * 1000;

    // Clear any existing interruption timer just in case
    const interruptionData = activeCallTimers.get(`${callId}_interruption`);
    if (interruptionData) {
        clearTimeout(interruptionData.timer);
        activeCallTimers.delete(`${callId}_interruption`);
    }

    // New timer
    const timerId = setTimeout(async () => {
        try {
            logger.info(`⏰ Rejoined call timer expired: ${callId}`);
            await videoCallService.endCall(callId, 'timer_expired', null);

            io.to(callerId).emit('call:force-end', { callId, reason: 'timer_expired' });
            io.to(receiverId).emit('call:force-end', { callId, reason: 'timer_expired' });
            activeCallTimers.delete(callId);
        } catch (error) {
            logger.error(`Rejoin timer end error: ${error.message}`);
        }
    }, durationMs);

    activeCallTimers.set(callId, {
        timer: timerId,
        type: 'duration',
        startTime: Date.now() - (videoCall.callDurationSeconds - remainingSeconds) * 1000,
        callerId,
        receiverId,
    });

    // Generate tokens
    const callerIdHex = callerId.slice(-8);
    const receiverIdHex = receiverId.slice(-8);
    const callerUid = parseInt(callerIdHex, 16) % 2147483647;
    const receiverUid = parseInt(receiverIdHex, 16) % 2147483647;

    const callerToken = agoraService.generateRtcToken(channelName, callerUid.toString(), 'publisher');
    const receiverToken = agoraService.generateRtcToken(channelName, receiverUid.toString(), 'publisher');

    const rejoinData = {
        callId,
        remainingSeconds,
        startTime: Date.now() - (videoCall.callDurationSeconds - remainingSeconds) * 1000,
    };

    io.to(callerId).emit('call:rejoin-proceed', {
        ...rejoinData,
        agora: {
            channelName,
            token: callerToken,
            uid: callerUid,
            appId: agoraService.getAppId(),
        },
    });

    io.to(receiverId).emit('call:rejoin-proceed', {
        ...rejoinData,
        agora: {
            channelName,
            token: receiverToken,
            uid: receiverUid,
            appId: agoraService.getAppId(),
        },
    });

    logger.info(`✅ Call Resumed/Rejoined: ${callId} (Remaining: ${remainingSeconds}s)`);
};

/**
 * Helper to handle call interruption (pause timer, notify wait, start grace period)
 */
async function initiateCallInterruption(callId, disconnectedUserId, io) {
    logger.info(`🔄 Initiating interruption for call ${callId} due to ${disconnectedUserId}`);

    // 1. Get call details
    const activeCall = await videoCallService.getCall(callId);
    if (!activeCall) return 0;

    const otherUserId = activeCall.callerId.toString() === disconnectedUserId
        ? activeCall.receiverId.toString()
        : activeCall.callerId.toString();

    // 2. Clear MAIN duration timer (PAUSE THE CALL)
    const timerData = activeCallTimers.get(callId);
    let remainingTime = 0;

    if (timerData && timerData.type === 'duration') {
        clearTimeout(timerData.timer);
        // Calculate remaining time for resumption
        const elapsedMs = Date.now() - timerData.startTime;
        const originalDurationMs = activeCall.callDurationSeconds * 1000;
        const remainingMs = Math.max(0, originalDurationMs - elapsedMs);
        remainingTime = Math.ceil(remainingMs / 1000);

        activeCallTimers.delete(callId);
        logger.info(`⏸️ Call paused. Remaining: ${remainingTime}s`);
    }

    // 3. Notify other user to WAIT
    io.to(otherUserId).emit('call:waiting', {
        callId,
        disconnectedUserId: disconnectedUserId,
    });

    // 4. Start INTERRUPTION TIMEOUT (60s grace period)
    const interruptionTimerId = setTimeout(async () => {
        try {
            logger.info(`❌ Interruption timeout expired for call: ${callId}`);

            const endReason = activeCall.callerId.toString() === disconnectedUserId
                ? 'caller_disconnected'
                : 'receiver_disconnected';

            const videoCall = await videoCallService.endCall(callId, endReason, disconnectedUserId);

            // Notify other user that waiting is over -> Call Ended
            io.to(otherUserId).emit('call:ended', {
                callId,
                reason: endReason,
                refunded: videoCall.billingStatus === 'refunded',
            });

            activeCallTimers.delete(`${callId}_interruption`);

        } catch (err) {
            logger.error(`Interruption timeout error: ${err.message}`);
        }
    }, 60000); // 60 seconds grace

    // Store interruption state
    activeCallTimers.set(`${callId}_interruption`, {
        timer: interruptionTimerId,
        type: 'interruption',
        disconnectedUserId: disconnectedUserId,
        remainingTimeWhenPaused: remainingTime || activeCall.callDurationSeconds,
    });

    return remainingTime;
}

/**
 * Setup video call handlers for a socket connection
 * @param {Socket} socket - Socket.IO socket instance
 * @param {Server} io - Socket.IO server instance
 * @param {string} userId - Authenticated user ID
 */
export const setupVideoCallHandlers = (socket, io, userId) => {
    // ====================
    // CALL REQUEST (Male → Female)
    // ====================
    socket.on('call:request', async (data) => {
        try {
            const { receiverId, chatId } = data;
            logger.info(`📞 Call request from ${userId} to ${receiverId}`);

            // Initiate call (validates and locks coins)
            const videoCall = await videoCallService.initiateCall(userId, receiverId);

            // Notify caller of success
            socket.emit('call:outgoing', {
                callId: videoCall._id.toString(),
                receiverId,
                status: 'ringing',
                coinAmount: videoCall.coinAmount,
                duration: videoCall.callDurationSeconds,
            });

            // Notify receiver of incoming call (using room named by receiverId)
            io.to(receiverId).emit('call:incoming', {
                callId: videoCall._id.toString(),
                callerId: userId,
                callerName: data.callerName || 'User',
                callerAvatar: data.callerAvatar || '',
                coinAmount: videoCall.coinAmount,
                duration: videoCall.callDurationSeconds,
            });

            logger.info(`📞 Sent call:incoming to room ${receiverId}`);

            // Start ringing timeout
            const timeoutId = setTimeout(async () => {
                try {
                    await videoCallService.handleMissedCall(videoCall._id.toString());

                    // Notify both users
                    socket.emit('call:missed', { callId: videoCall._id.toString() });
                    io.to(receiverId).emit('call:ended', {
                        callId: videoCall._id.toString(),
                        reason: 'missed',
                    });
                } catch (error) {
                    logger.error(`Missed call handling error: ${error.message}`);
                }
            }, (videoCallService.VIDEO_CALL_CONFIG.TIMEOUT || 20) * 1000);

            activeCallTimers.set(videoCall._id.toString(), {
                timer: timeoutId,
                type: 'ringing',
                receiverId: receiverId,
            });
        } catch (error) {
            logger.error(`Call request error: ${error.message}`);
            socket.emit('call:error', {
                message: error.message,
                refunded: error.message.includes('Insufficient') ? false : true,
            });
        }
    });

    // ====================
    // CALL ACCEPTED (Female)
    // ====================
    socket.on('call:accept', async (data) => {
        try {
            const { callId } = data;
            logger.info(`📞 Call accepted: ${callId}`);

            // Clear ringing timeout
            const timerData = activeCallTimers.get(callId);
            if (timerData) {
                clearTimeout(timerData.timer);
                activeCallTimers.delete(callId);
            }

            // Update call status
            const videoCall = await videoCallService.acceptCall(callId);

            // Generate Agora tokens for both users
            // Channel name = callId for uniqueness
            const channelName = callId;

            // Generate numeric UIDs from MongoDB ObjectId (use last 8 hex chars as number)
            // MongoDB ObjectId is 24 hex chars, we take last 8 and convert to decimal
            const callerIdHex = videoCall.callerId.toString().slice(-8);
            const receiverIdHex = videoCall.receiverId.toString().slice(-8);

            // Convert hex to decimal for Agora UID (must be positive 32-bit integer)
            const callerUid = parseInt(callerIdHex, 16) % 2147483647; // Max 32-bit signed int
            const receiverUid = parseInt(receiverIdHex, 16) % 2147483647;

            logger.info(`🎥 Generating tokens - Caller UID: ${callerUid}, Receiver UID: ${receiverUid}`);

            const callerToken = agoraService.generateRtcToken(channelName, callerUid.toString(), 'publisher');
            const receiverToken = agoraService.generateRtcToken(channelName, receiverUid.toString(), 'publisher');

            logger.info(`🎥 Agora tokens generated for channel: ${channelName}`);

            // Notify caller that call was accepted with Agora credentials
            io.to(videoCall.callerId.toString()).emit('call:accepted', {
                callId,
                receiverId: videoCall.receiverId.toString(),
                agora: {
                    channelName,
                    token: callerToken,
                    uid: callerUid,
                    appId: agoraService.getAppId(),
                },
            });

            // Notify receiver (self) to proceed with Agora credentials
            socket.emit('call:proceed', {
                callId,
                callerId: videoCall.callerId.toString(),
                agora: {
                    channelName,
                    token: receiverToken,
                    uid: receiverUid,
                    appId: agoraService.getAppId(),
                },
            });
        } catch (error) {
            logger.error(`Call accept error: ${error.message}`);
            socket.emit('call:error', { message: error.message });
        }
    });

    // ====================
    // CALL REJECTED (Female)
    // ====================
    socket.on('call:reject', async (data) => {
        try {
            const { callId } = data;
            logger.info(`📞 Call rejected: ${callId}`);

            // Clear ringing timeout
            const timerData = activeCallTimers.get(callId);
            if (timerData) {
                clearTimeout(timerData.timer);
                activeCallTimers.delete(callId);
            }

            // End call with rejection (refunds coins)
            const videoCall = await videoCallService.rejectCall(callId);

            // Notify caller (using room named by callerId)
            io.to(videoCall.callerId.toString()).emit('call:rejected', {
                callId,
                refunded: true,
            });

            // Confirm to receiver
            socket.emit('call:ended', {
                callId,
                reason: 'rejected',
            });
        } catch (error) {
            logger.error(`Call reject error: ${error.message}`);
            socket.emit('call:error', { message: error.message });
        }
    });

    // ====================
    // WEBRTC CONNECTED
    // ====================
    socket.on('call:connected', async (data) => {
        try {
            const { callId } = data;
            logger.info(`📞 WebRTC connected: ${callId}`);

            // Mark call as connected (credits coins to receiver)
            const videoCall = await videoCallService.markCallConnected(callId);

            const callerId = videoCall.callerId.toString();
            const receiverId = videoCall.receiverId.toString();

            // Start 5-minute call timer (AUTHORITATIVE)
            const duration = videoCall.callDurationSeconds * 1000;
            const timerId = setTimeout(async () => {
                try {
                    logger.info(`⏰ Call timer expired: ${callId}`);
                    await videoCallService.endCall(callId, 'timer_expired', null);

                    // Notify both users using rooms
                    io.to(callerId).emit('call:force-end', {
                        callId,
                        reason: 'timer_expired',
                    });
                    io.to(receiverId).emit('call:force-end', {
                        callId,
                        reason: 'timer_expired',
                    });

                    activeCallTimers.delete(callId);
                } catch (error) {
                    logger.error(`Call timer end error: ${error.message}`);
                }
            }, duration);

            activeCallTimers.set(callId, {
                timer: timerId,
                type: 'duration',
                startTime: Date.now(),
                callerId,
                receiverId,
            });

            // Notify both users that call is now active
            const callStartData = {
                callId,
                duration: videoCall.callDurationSeconds,
                startTime: Date.now(),
            };

            io.to(callerId).emit('call:started', callStartData);
            io.to(receiverId).emit('call:started', callStartData);
        } catch (error) {
            logger.error(`Call connected error: ${error.message}`);
            socket.emit('call:error', { message: error.message });
        }
    });

    // ====================
    // CALL END (Either user)
    // ====================
    socket.on('call:end', async (data) => {
        try {
            const { callId } = data;
            logger.info(`📞 Call end requested: ${callId} by ${userId}`);

            // Get call to determine who ended it
            const call = await videoCallService.getCall(callId);
            if (!call) {
                socket.emit('call:ended', { callId, reason: 'not_found' });
                return;
            }

            // CHECK FOR REJOIN POSSIBILITY (One-time rejoin, if time remains)
            const timerData = activeCallTimers.get(callId);
            let remainingSeconds = 0;
            if (timerData && timerData.type === 'duration') {
                const elapsedMs = Date.now() - timerData.startTime;
                const originalDurationMs = (call.callDurationSeconds || 0) * 1000;
                remainingSeconds = Math.ceil(Math.max(0, originalDurationMs - elapsedMs) / 1000);
            }

            const canRejoin = remainingSeconds > 10 && (call.rejoinCount || 0) < 1;

            if (canRejoin) {
                logger.info(`🔄 SOFT END for call ${callId}. Entering interruption state.`);

                const timeRemaining = await initiateCallInterruption(callId, userId, io);

                // Notify User A (who ended) that they can rejoin
                socket.emit('call:ended', {
                    callId,
                    reason: 'interrupted',
                    duration: (call.callDurationSeconds || 0) - timeRemaining,
                    canRejoin: true
                });

                return;
            }

            // Clear any active timers (since we are ending permanently)
            if (timerData) {
                clearTimeout(timerData.timer);
                activeCallTimers.delete(callId);
            }

            const endReason = call.callerId.toString() === userId ? 'caller_ended' : 'receiver_ended';
            const videoCall = await videoCallService.endCall(callId, endReason, userId);

            const endData = {
                callId,
                reason: endReason,
                duration: videoCall.connectedAt
                    ? Math.floor((Date.now() - new Date(videoCall.connectedAt).getTime()) / 1000)
                    : 0,
            };

            // Notify both users using rooms
            io.to(videoCall.callerId.toString()).emit('call:ended', endData);
            io.to(videoCall.receiverId.toString()).emit('call:ended', endData);
        } catch (error) {
            logger.error(`Call end error: ${error.message}`);
            socket.emit('call:error', { message: error.message });
        }
    });

    // ====================
    // CALL REJOIN (Either user)
    // ====================
    socket.on('call:rejoin', async (data) => {
        try {
            const { callId } = data;
            logger.info(`🔄 Call rejoin requested: ${callId} by ${userId}`);

            // A. Check for INTERRUPTION STATE (Peer was waiting)
            const interruptionData = activeCallTimers.get(`${callId}_interruption`);
            let remainingSeconds = 0;

            if (interruptionData) {
                // We are recovering from an interruption
                logger.info(`🔄 Resuming from interruption state for call ${callId}`);
                clearTimeout(interruptionData.timer);
                activeCallTimers.delete(`${callId}_interruption`);

                // Use the time that was saved when pause happened
                remainingSeconds = interruptionData.remainingTimeWhenPaused;

                // Fetch call just to get IDs (no need to run full rejoin logic if just resuming)
                const videoCall = await videoCallService.getCall(callId);
                const otherUserId = videoCall.callerId.toString() === userId
                    ? videoCall.receiverId.toString()
                    : videoCall.callerId.toString();

                // Notify other user: "Partner is back!"
                io.to(otherUserId).emit('call:peer-rejoined', { callId });

                // Helper to setup timer & token
                await setupCallResumption(videoCall, remainingSeconds, io);
                return;
            }

            // B. Normal Rejoin (e.g. browser crash where disconnect event might not have handled everything perfectly, or manual rejoin)
            const result = await videoCallService.rejoinCall(callId, userId);
            const videoCall = result.videoCall;
            remainingSeconds = result.remainingTime;

            await setupCallResumption(videoCall, remainingSeconds, io);

        } catch (error) {
            logger.error(`Call rejoin error: ${error.message}`);
            socket.emit('call:error', { message: error.message });
        }
    });

    // ====================
    // WEBRTC SIGNALING: OFFER
    // ====================
    socket.on('webrtc:offer', async (data) => {
        const { callId, targetUserId, offer } = data;
        logger.debug(`🔗 WebRTC offer from ${userId} to ${targetUserId}`);

        // Emit to target user's room
        io.to(targetUserId).emit('webrtc:offer', {
            callId,
            fromUserId: userId,
            offer,
        });
    });

    // ====================
    // WEBRTC SIGNALING: ANSWER
    // ====================
    socket.on('webrtc:answer', async (data) => {
        const { callId, targetUserId, answer } = data;
        logger.debug(`🔗 WebRTC answer from ${userId} to ${targetUserId}`);

        // Emit to target user's room
        io.to(targetUserId).emit('webrtc:answer', {
            callId,
            fromUserId: userId,
            answer,
        });
    });

    // ====================
    // WEBRTC SIGNALING: ICE CANDIDATE
    // ====================
    socket.on('webrtc:ice-candidate', async (data) => {
        const { callId, targetUserId, candidate } = data;
        logger.debug(`🔗 ICE candidate from ${userId} to ${targetUserId}`);

        // Emit to target user's room
        io.to(targetUserId).emit('webrtc:ice-candidate', {
            callId,
            fromUserId: userId,
            candidate,
        });
    });

    // ====================
    // HANDLE CONNECTION FAILURE (Signal from frontend)
    // ====================
    socket.on('call:connection-failed', async (data) => {
        try {
            const { callId } = data;
            logger.warn(`⚠️ Call connection failed reported: ${callId}`);

            const call = await videoCallService.getCall(callId);
            if (!call) return;

            const videoCall = await videoCallService.endCall(callId, 'connection_failed', userId);

            const failData = {
                callId,
                reason: 'connection_failed',
                refunded: videoCall.billingStatus === 'refunded',
            };

            // Notify both users using rooms
            io.to(videoCall.callerId.toString()).emit('call:ended', failData);
            io.to(videoCall.receiverId.toString()).emit('call:ended', failData);
        } catch (error) {
            logger.error(`Connection failed handling error: ${error.message}`);
        }
    });

    // ====================
    // HANDLE DISCONNECT
    // ====================
    socket.on('disconnect', async () => {
        logger.info(`📞 User disconnected: ${userId}`);

        try {
            // Check if user had an active call
            const activeCall = await videoCallService.getActiveCallForUser(userId);
            if (activeCall) {
                logger.info(`📞 User disconnected during active call: ${activeCall._id}`);
                await initiateCallInterruption(activeCall._id.toString(), userId, io);
            }
        } catch (error) {
            logger.error(`Disconnect cleanup error: ${error.message}`);
        }
    });
};

/**
 * Sync user socket mapping (kept for backward compatibility, but not used anymore)
 * @param {string} userId - User ID
 * @param {string} socketId - Socket ID  
 */
export const syncUserSocket = (userId, socketId) => {
    // Not needed anymore since we use rooms
    // Kept for backward compatibility
};

/**
 * Get connected socket ID for user (deprecated - use rooms instead)
 * @param {string} userId - User ID
 * @returns {string|undefined}
 */
export const getUserSocketId = (userId) => {
    // Not used anymore
    return undefined;
};

export default {
    setupVideoCallHandlers,
    syncUserSocket,
    getUserSocketId,
};
