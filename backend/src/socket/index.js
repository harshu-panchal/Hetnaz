/**
 * Socket.IO Setup and Event Handlers
 * @owner: Harsh (Chat Domain)
 * @purpose: Initialize Socket.IO and handle real-time chat events
 */

import logger from '../utils/logger.js';
import { authenticateSocket, setupChatHandlers } from './chatHandlers.js';
import { setupVideoCallHandlers, syncUserSocket } from './videoCallHandlers.js';

/**
 * Setup Socket.IO handlers
 * @param {Server} io - Socket.IO server instance
 */
export const setupSocketIO = (io) => {
  // Authentication middleware for Socket.IO
  io.use(authenticateSocket);

  // Setup chat handlers (existing)
  setupChatHandlers(io);

  // Setup video call handlers (new - additive)
  io.on('connection', (socket) => {
    const userId = socket.userId;
    if (userId) {
      // Sync user socket for video calls
      syncUserSocket(userId, socket.id);
      // Setup video call event handlers
      setupVideoCallHandlers(socket, io, userId);
    }
  });

  logger.info('✅ Socket.IO handlers initialized (Chat + Video Call)');
};

// Export helper functions for emitting events
export { emitBalanceUpdate, emitNewMessage } from './chatHandlers.js';
export { syncUserSocket, getUserSocketId } from './videoCallHandlers.js';

