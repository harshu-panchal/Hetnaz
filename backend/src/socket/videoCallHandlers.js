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
import logger from '../utils/logger.js';

// In-memory store for active calls and timers
const activeCallTimers = new Map(); // callId -> { timer, startTime }

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

            // Notify caller that call was accepted (using room named by callerId)
            io.to(videoCall.callerId.toString()).emit('call:accepted', {
                callId,
                receiverId: videoCall.receiverId.toString(),
            });

            // Notify receiver (self) to proceed with WebRTC
            socket.emit('call:proceed', {
                callId,
                callerId: videoCall.callerId.toString(),
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

            // Clear any active timers
            const timerData = activeCallTimers.get(callId);
            if (timerData) {
                clearTimeout(timerData.timer);
                activeCallTimers.delete(callId);
            }

            // Get call to determine who ended it
            const call = await videoCallService.getCall(callId);
            if (!call) {
                socket.emit('call:ended', { callId, reason: 'not_found' });
                return;
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
    // CONNECTION FAILED
    // ====================
    socket.on('call:connection-failed', async (data) => {
        try {
            const { callId } = data;
            logger.warn(`📞 WebRTC connection failed: ${callId}`);

            // Clear timers
            const timerData = activeCallTimers.get(callId);
            if (timerData) {
                clearTimeout(timerData.timer);
                activeCallTimers.delete(callId);
            }

            // End call with failure (refunds if not connected yet)
            const videoCall = await videoCallService.endCall(callId, 'connection_failed', null);

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
                logger.info(`📞 Cleaning up call due to disconnect: ${activeCall._id}`);

                // Clear timers
                const timerData = activeCallTimers.get(activeCall._id.toString());
                if (timerData) {
                    clearTimeout(timerData.timer);
                    activeCallTimers.delete(activeCall._id.toString());
                }

                // Determine disconnect reason
                const endReason = activeCall.callerId.toString() === userId
                    ? 'caller_disconnected'
                    : 'receiver_disconnected';

                // End call
                const videoCall = await videoCallService.endCall(
                    activeCall._id.toString(),
                    endReason,
                    userId
                );

                // Notify other user
                const otherUserId = activeCall.callerId.toString() === userId
                    ? activeCall.receiverId.toString()
                    : activeCall.callerId.toString();

                io.to(otherUserId).emit('call:ended', {
                    callId: activeCall._id.toString(),
                    reason: endReason,
                    refunded: videoCall.billingStatus === 'refunded',
                });
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
