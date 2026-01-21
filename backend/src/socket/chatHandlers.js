/**
 * Socket.IO Chat Handlers - Real-time Messaging (PERFORMANCE OPTIMIZED)
 * 
 * KEY FIXES:
 * 1. Single socket per user - disconnects old sockets on new connection
 * 2. No DB calls during connection (deferred to background)
 * 3. Minimal logging 
 * 4. Optimized cleanup
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import logger from '../utils/logger.js';
import { getEnvConfig } from '../config/env.js';
import { memoryCache } from '../utils/cache.js';

const { jwtSecret } = getEnvConfig();

// Single socket per user (NOT multi-tab friendly, but prevents storms)
const activeUsers = new Map(); // userId -> socketId
const lastHeartbeat = new Map();
const HEARTBEAT_TIMEOUT = 60000;
const CLEANUP_INTERVAL = 60000;

/**
 * Authenticate Socket.IO connection (FAST - no DB call)
 */
export const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('No token'));

        const decoded = jwt.verify(token, jwtSecret);
        socket.userId = decoded.id;
        socket.userRole = decoded.role || 'unknown';
        next();
    } catch (error) {
        next(new Error('Auth error'));
    }
};

/**
 * Setup Socket.IO chat handlers (SINGLETON-ENFORCED)
 */
export const setupChatHandlers = (io) => {
    // Cleanup interval (runs once globally)
    setInterval(() => cleanupStaleConnections(io), CLEANUP_INTERVAL);

    io.on('connection', (socket) => {
        const userId = socket.userId;

        // DEDUPE: Disconnect any existing socket for this user
        const existingSocketId = activeUsers.get(userId);
        if (existingSocketId && existingSocketId !== socket.id) {
            const existingSocket = io.sockets.sockets.get(existingSocketId);
            if (existingSocket) {
                existingSocket.disconnect(true);
            }
        }

        // Register this socket
        activeUsers.set(userId, socket.id);
        lastHeartbeat.set(userId, Date.now());
        socket.join(userId);

        // Update DB immediately (don't defer) - critical for online status accuracy
        User.findByIdAndUpdate(userId, {
            isOnline: true,
            socketId: socket.id,
            lastSeen: new Date()
        }).catch((err) => {
            logger.error(`Failed to update online status for ${userId}:`, err.message);
        });

        // Invalidate discover cache for online filter (so new online users appear immediately)
        memoryCache.keys().forEach(key => {
            if (key.includes('discover:females:') && key.includes(':online:')) {
                memoryCache.del(key);
            }
        });

        // Broadcast online (lightweight) - ensure userId is string
        socket.broadcast.emit('user:online', { userId: userId.toString() });

        // HEARTBEAT
        socket.on('heartbeat', () => {
            lastHeartbeat.set(userId, Date.now());
        });

        // JOIN CHAT
        socket.on('chat:join', async (data) => {
            try {
                const { chatId } = data;
                const chat = await Chat.findOne({ _id: chatId, 'participants.userId': userId }).lean();
                if (!chat) return socket.emit('error', { message: 'Chat not found' });
                socket.join(`chat:${chatId}`);
                socket.emit('chat:joined', { chatId });
            } catch (e) {
                socket.emit('error', { message: 'Failed to join chat' });
            }
        });

        // LEAVE CHAT
        socket.on('chat:leave', (data) => {
            socket.leave(`chat:${data.chatId}`);
        });

        // TYPING
        socket.on('chat:typing', (data) => {
            socket.to(`chat:${data.chatId}`).emit('chat:typing', { chatId: data.chatId, userId, isTyping: data.isTyping });
        });

        // MESSAGE BROADCAST
        socket.on('message:broadcast', async (data) => {
            try {
                const { chatId, messageId } = data;
                const message = await Message.findById(messageId).populate('senderId', 'profile').populate('receiverId', 'profile').lean();
                if (!message) return;

                io.to(`chat:${chatId}`).emit('message:new', { message, chatId });

                const receiverSocketId = activeUsers.get(message.receiverId?._id?.toString());
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('message:notification', { chatId, message });
                }
            } catch (e) {
                logger.error('Broadcast error:', e);
            }
        });

        // READ
        socket.on('message:read', async (data) => {
            try {
                await Message.findByIdAndUpdate(data.messageId, { status: 'read', readAt: new Date() });
                socket.to(`chat:${data.chatId}`).emit('message:read', { messageId: data.messageId, chatId: data.chatId, readBy: userId });
            } catch (e) {
                logger.error('Error in message:read:', e);
            }
        });

        // BALANCE REQUEST
        socket.on('balance:request', async () => {
            try {
                const user = await User.findById(userId).select('coinBalance').lean();
                socket.emit('balance:update', { balance: user?.coinBalance || 0 });
            } catch (e) {
                logger.error('Error in balance:request:', e);
            }
        });

        // USER STATUS REQUEST - Get real-time online status of a user
        socket.on('user:status:request', async (data) => {
            try {
                const { targetUserId } = data;
                if (!targetUserId) return;

                // Check if user is currently connected (real-time)
                const isOnline = activeUsers.has(targetUserId);
                const lastBeat = lastHeartbeat.get(targetUserId);
                const isActive = lastBeat && (Date.now() - lastBeat) < HEARTBEAT_TIMEOUT;

                // If not in active connections, check database
                if (!isOnline || !isActive) {
                    const user = await User.findById(targetUserId).select('isOnline lastSeen').lean();
                    socket.emit('user:status:response', {
                        userId: targetUserId,
                        isOnline: user?.isOnline || false,
                        lastSeen: user?.lastSeen || new Date()
                    });
                } else {
                    socket.emit('user:status:response', {
                        userId: targetUserId,
                        isOnline: true,
                        lastSeen: new Date()
                    });
                }
            } catch (e) {
                console.error('Status request error:', e);
            }
        });

        // DISCONNECT
        socket.on('disconnect', () => {
            // Only mark offline if this is the current active socket
            if (activeUsers.get(userId) === socket.id) {
                activeUsers.delete(userId);
                lastHeartbeat.delete(userId);

                // Update DB immediately - critical for online status accuracy
                User.findByIdAndUpdate(userId, {
                    isOnline: false,
                    socketId: null,
                    lastSeen: new Date()
                }).catch((err) => {
                    logger.error(`Failed to update offline status for ${userId}:`, err.message);
                });

                // Invalidate discover cache for online filter (so offline users disappear immediately)
                memoryCache.keys().forEach(key => {
                    if (key.includes('discover:females:') && key.includes(':online:')) {
                        memoryCache.del(key);
                    }
                });

                // Ensure userId is string for frontend comparison
                socket.broadcast.emit('user:offline', { userId: userId.toString(), lastSeen: new Date() });
            }
        });
    });

    logger.info('✅ Socket.IO handlers initialized (Optimized)');
};

/**
 * Cleanup stale connections
 */
const cleanupStaleConnections = async (io) => {
    const now = Date.now();
    const staleUsers = [];

    for (const [userId, lastBeat] of lastHeartbeat.entries()) {
        if (now - lastBeat > HEARTBEAT_TIMEOUT) staleUsers.push(userId);
    }

    for (const userId of staleUsers) {
        const socketId = activeUsers.get(userId);
        if (socketId) {
            const socket = io.sockets.sockets.get(socketId);
            if (socket) socket.disconnect(true);
        }
        activeUsers.delete(userId);
        lastHeartbeat.delete(userId);

        // Update DB immediately - critical for online status accuracy
        User.findByIdAndUpdate(userId, {
            isOnline: false,
            socketId: null,
            lastSeen: new Date()
        }).catch((err) => {
            logger.error(`Failed to update offline status during cleanup for ${userId}:`, err.message);
        });

        // Invalidate discover cache for online filter
        memoryCache.keys().forEach(key => {
            if (key.includes('discover:females:') && key.includes(':online:')) {
                memoryCache.del(key);
            }
        });

        // Ensure userId is string for frontend comparison
        io.emit('user:offline', { userId: userId.toString(), lastSeen: new Date() });
    }
};

// Export helpers
export const emitBalanceUpdate = (io, userId, newBalance) => {
    const socketId = activeUsers.get(userId);
    if (socketId) io.to(socketId).emit('balance:update', { balance: newBalance });
};

export const emitNewMessage = (io, chatId, message) => {
    io.to(`chat:${chatId}`).emit('message:new', { chatId, message });
    const receiverId = (message.receiverId?._id || message.receiverId || '').toString();
    const socketId = activeUsers.get(receiverId);
    if (socketId) io.to(socketId).emit('message:notification', { chatId, message });
};

export const isUserOnline = (userId) => {
    const lastBeat = lastHeartbeat.get(userId);
    return lastBeat && (Date.now() - lastBeat) < HEARTBEAT_TIMEOUT;
};

export const emitNotification = (io, userId, notification) => {
    const socketId = activeUsers.get(userId.toString());
    if (socketId) io.to(socketId).emit('notification:new', { notification });
};
