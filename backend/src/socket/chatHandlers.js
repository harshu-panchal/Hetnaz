/**
 * Socket.IO Chat Handlers - Real-time Messaging
 * @owner: Harsh (Chat Domain)
 * @purpose: Handle real-time chat events with Socket.IO
 * 
 * Online Status Management:
 * - Uses heartbeat mechanism (ping every 30s)
 * - Marks users offline if no heartbeat for 60s
 * - Supports multiple tabs/devices per user
 * - Runs cleanup every 60s to mark stale users offline
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import logger from '../utils/logger.js';
import { getEnvConfig } from '../config/env.js';

const { jwtSecret } = getEnvConfig();

// Store active users: { oderId: Set<socketId> } - supports multiple tabs
const activeUsers = new Map();

// Store last heartbeat: { oderId: timestamp }
const lastHeartbeat = new Map();

// Heartbeat timeout in ms (mark offline if no heartbeat within this time)
const HEARTBEAT_TIMEOUT = 60000; // 60 seconds

// Cleanup interval - check for stale connections
const CLEANUP_INTERVAL = 60000; // 60 seconds

/**
 * Authenticate Socket.IO connection
 */
export const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, jwtSecret);

        // Get user
        const user = await User.findById(decoded.id);
        if (!user || !user.isActive) {
            return next(new Error('Authentication error: Invalid user'));
        }

        // Attach user to socket
        socket.userId = user._id.toString();
        socket.userRole = user.role;

        next();
    } catch (error) {
        logger.error('Socket.IO authentication error:', error);
        next(new Error('Authentication error'));
    }
};

/**
 * Setup Socket.IO chat handlers
 */
export const setupChatHandlers = (io) => {
    // Start periodic cleanup of stale connections
    setInterval(() => {
        cleanupStaleConnections(io);
    }, CLEANUP_INTERVAL);

    io.on('connection', (socket) => {
        const userId = socket.userId;
        logger.info(`✅ User connected: ${userId} (${socket.id})`);

        // Add socket to user's active sockets (supports multiple tabs)
        if (!activeUsers.has(userId)) {
            activeUsers.set(userId, new Set());
        }
        activeUsers.get(userId).add(socket.id);

        // Record heartbeat
        lastHeartbeat.set(userId, Date.now());

        // Join user's personal room (for direct user-to-user events like video calls)
        socket.join(userId);
        logger.info(`📞 User ${userId} joined personal room`);

        // Update user online status
        User.findByIdAndUpdate(userId, {
            isOnline: true,
            socketId: socket.id,
            lastSeen: new Date(),
        }).catch(err => logger.error('Error updating online status:', err));

        // Broadcast to contacts that user is online
        socket.broadcast.emit('user:online', { userId });

        // ====================
        // HEARTBEAT - Client pings to confirm still connected
        // ====================
        socket.on('heartbeat', () => {
            lastHeartbeat.set(userId, Date.now());
            // Also update lastSeen in DB (but not too frequently - every 30s is fine)
            User.findByIdAndUpdate(userId, {
                lastSeen: new Date(),
            }).catch(() => { }); // Silent fail is ok for heartbeat
        });

        // ====================
        // JOIN CHAT ROOM
        // ====================
        socket.on('chat:join', async (data) => {
            try {
                const { chatId } = data;

                // Verify user is part of this chat
                const chat = await Chat.findOne({
                    _id: chatId,
                    'participants.userId': userId
                });

                if (!chat) {
                    return socket.emit('error', { message: 'Chat not found' });
                }

                // Join room
                socket.join(`chat:${chatId}`);
                logger.info(`User ${userId} joined chat ${chatId}`);

                socket.emit('chat:joined', { chatId });
            } catch (error) {
                logger.error('Error joining chat:', error);
                socket.emit('error', { message: 'Failed to join chat' });
            }
        });

        // ====================
        // LEAVE CHAT ROOM
        // ====================
        socket.on('chat:leave', (data) => {
            const { chatId } = data;
            socket.leave(`chat:${chatId}`);
            logger.info(`User ${userId} left chat ${chatId}`);
        });

        // ====================
        // TYPING INDICATOR
        // ====================
        socket.on('chat:typing', async (data) => {
            try {
                const { chatId, isTyping } = data;

                // Broadcast to other user in chat
                socket.to(`chat:${chatId}`).emit('chat:typing', {
                    chatId,
                    userId,
                    isTyping,
                });
            } catch (error) {
                logger.error('Error handling typing:', error);
            }
        });

        // ====================
        // REAL-TIME MESSAGE RECEIVED (from REST API)
        // ====================
        // This is called by the message controller after saving to DB
        socket.on('message:broadcast', async (data) => {
            try {
                const { chatId, messageId } = data;

                // Get message
                const message = await Message.findById(messageId)
                    .populate('senderId', 'profile')
                    .populate('receiverId', 'profile');

                if (!message) return;

                // Broadcast to chat room
                io.to(`chat:${chatId}`).emit('message:new', {
                    message,
                    chatId,
                });

                // Send to receiver if online but not in chat room
                const receiverSockets = activeUsers.get(message.receiverId._id.toString());
                if (receiverSockets) {
                    receiverSockets.forEach(socketId => {
                        io.to(socketId).emit('message:notification', {
                            chatId,
                            message,
                        });
                    });
                }
            } catch (error) {
                logger.error('Error broadcasting message:', error);
            }
        });

        // ====================
        // MARK MESSAGE AS READ
        // ====================
        socket.on('message:read', async (data) => {
            try {
                const { messageId, chatId } = data;

                // Update message
                await Message.findByIdAndUpdate(messageId, {
                    status: 'read',
                    readAt: new Date(),
                });

                // Notify sender
                socket.to(`chat:${chatId}`).emit('message:read', {
                    messageId,
                    chatId,
                    readBy: userId,
                });
            } catch (error) {
                logger.error('Error marking message as read:', error);
            }
        });

        // ====================
        // BALANCE UPDATE (for real-time coin display)
        // ====================
        socket.on('balance:request', async () => {
            try {
                const user = await User.findById(userId).select('coinBalance');
                socket.emit('balance:update', {
                    balance: user.coinBalance,
                });
            } catch (error) {
                logger.error('Error fetching balance:', error);
            }
        });

        // ====================
        // DISCONNECT
        // ====================
        socket.on('disconnect', async () => {
            try {
                logger.info(`User disconnected: ${userId} (${socket.id})`);

                // Remove this socket from user's active sockets
                const userSockets = activeUsers.get(userId);
                if (userSockets) {
                    userSockets.delete(socket.id);

                    // Only mark offline if NO sockets remain (all tabs closed)
                    if (userSockets.size === 0) {
                        activeUsers.delete(userId);
                        lastHeartbeat.delete(userId);

                        // Update user offline status
                        await User.findByIdAndUpdate(userId, {
                            isOnline: false,
                            socketId: null,
                            lastSeen: new Date(),
                        });

                        // Broadcast to contacts that user is offline
                        socket.broadcast.emit('user:offline', {
                            userId,
                            lastSeen: new Date(),
                        });

                        logger.info(`User ${userId} marked offline (all connections closed)`);
                    } else {
                        logger.info(`User ${userId} still has ${userSockets.size} active connection(s)`);
                    }
                }
            } catch (error) {
                logger.error('Error handling disconnect:', error);
            }
        });
    });
};

/**
 * Cleanup stale connections - runs periodically
 * Marks users as offline if no heartbeat received within timeout
 */
const cleanupStaleConnections = async (io) => {
    const now = Date.now();
    const staleUsers = [];

    for (const [userId, lastBeat] of lastHeartbeat.entries()) {
        if (now - lastBeat > HEARTBEAT_TIMEOUT) {
            staleUsers.push(userId);
        }
    }

    for (const userId of staleUsers) {
        try {
            logger.info(`🧹 Cleaning up stale connection for user ${userId}`);

            // Get and disconnect all sockets for this user
            const userSockets = activeUsers.get(userId);
            if (userSockets) {
                userSockets.forEach(socketId => {
                    const socket = io.sockets.sockets.get(socketId);
                    if (socket) {
                        socket.disconnect(true);
                    }
                });
            }

            // Clean up tracking
            activeUsers.delete(userId);
            lastHeartbeat.delete(userId);

            // Mark user as offline in DB
            await User.findByIdAndUpdate(userId, {
                isOnline: false,
                socketId: null,
                lastSeen: new Date(),
            });

            // Broadcast offline status
            io.emit('user:offline', { userId, lastSeen: new Date() });
        } catch (error) {
            logger.error(`Error cleaning up stale connection for ${userId}:`, error);
        }
    }

    if (staleUsers.length > 0) {
        logger.info(`🧹 Cleaned up ${staleUsers.length} stale connection(s)`);
    }
};

/**
 * Emit balance update to user (called from transaction controller)
 */
export const emitBalanceUpdate = (io, userId, newBalance) => {
    const userSockets = activeUsers.get(userId);
    if (userSockets) {
        userSockets.forEach(socketId => {
            io.to(socketId).emit('balance:update', {
                balance: newBalance,
            });
        });
    }
};

/**
 * Emit new message to chat (called from message controller)
 */
export const emitNewMessage = (io, chatId, message) => {
    io.to(`chat:${chatId}`).emit('message:new', {
        chatId,
        message,
    });

    // Also notify receiver if they're online but not in chat
    const receiverSockets = activeUsers.get(message.receiverId.toString());
    if (receiverSockets) {
        receiverSockets.forEach(socketId => {
            io.to(socketId).emit('message:notification', {
                chatId,
                message,
            });
        });
    }
};

/**
 * Check if user is truly online (has active sockets with recent heartbeat)
 */
export const isUserOnline = (userId) => {
    const userSockets = activeUsers.get(userId);
    if (!userSockets || userSockets.size === 0) return false;

    const lastBeat = lastHeartbeat.get(userId);
    if (!lastBeat) return false;

    return (Date.now() - lastBeat) < HEARTBEAT_TIMEOUT;
};
