/**
 * VideoCall Model - Video Call Session Tracking
 * @owner: Video Call Feature
 * @purpose: Track active and historical video call sessions with billing
 */

import mongoose from 'mongoose';

const videoCallSchema = new mongoose.Schema(
    {
        // Participants
        callerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
            required: true,
        },

        // Call Status
        status: {
            type: String,
            enum: [
                'pending',      // Call requested, waiting for receiver
                'ringing',      // Receiver notified
                'accepted',     // Receiver accepted, WebRTC connecting
                'connected',    // WebRTC connected, call in progress
                'ended',        // Call ended normally
                'rejected',     // Receiver rejected
                'missed',       // Receiver didn't answer (timeout)
                'failed',       // WebRTC connection failed
                'cancelled',    // Caller cancelled before receiver answered
            ],
            default: 'pending',
            index: true,
        },

        // Billing
        coinAmount: {
            type: Number,
            required: true,
            default: 500,
        },
        billingStatus: {
            type: String,
            enum: ['locked', 'charged', 'refunded'],
            default: 'locked',
        },

        // Timing
        callDurationSeconds: {
            type: Number,
            default: 300, // 5 minutes
        },
        requestedAt: {
            type: Date,
            default: Date.now,
        },
        acceptedAt: Date,
        connectedAt: Date,
        endedAt: Date,

        // End reason
        endReason: {
            type: String,
            enum: [
                'timer_expired',     // 5 minute limit reached
                'caller_ended',      // Caller hung up
                'receiver_ended',    // Receiver hung up
                'connection_failed', // WebRTC failed
                'caller_disconnected',
                'receiver_disconnected',
                'timeout',           // No answer timeout
                'rejected',          // Receiver rejected
                'cancelled',         // Caller cancelled
            ],
        },

        // WebRTC metadata (for debugging)
        webrtcMetadata: {
            iceConnectionState: String,
            connectionType: String, // 'relay' | 'direct'
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient queries
videoCallSchema.index({ callerId: 1, status: 1 });
videoCallSchema.index({ receiverId: 1, status: 1 });
videoCallSchema.index({ status: 1, createdAt: -1 });

// Static method: Get active call for user
videoCallSchema.statics.getActiveCallForUser = async function (userId) {
    return this.findOne({
        $or: [{ callerId: userId }, { receiverId: userId }],
        status: { $in: ['pending', 'ringing', 'accepted', 'connected'] },
    });
};

// Instance method: Check if call is still active
videoCallSchema.methods.isActive = function () {
    return ['pending', 'ringing', 'accepted', 'connected'].includes(this.status);
};

const VideoCall = mongoose.model('VideoCall', videoCallSchema);

export default VideoCall;
