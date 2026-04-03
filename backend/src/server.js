/**
 * Server Entry Point
 * @owner: Sujal (Shared - Both review)
 * @purpose: Initialize server with Express, Socket.IO, and MongoDB
 */

import dns from 'dns';
// Force use of Google DNS as it often handles MongoDB Atlas SRV records more reliably
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn('⚠️ DNS server configuration failed:', e.message);
}

import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import database from './config/database.js';
import { getEnvConfig } from './config/env.js';
import { initializeRazorpay } from './config/razorpay.js';
import logger from './utils/logger.js';
import { setupSocketIO } from './socket/index.js';
import walletScheduler from './jobs/walletScheduler.js';
import notificationScheduler from './jobs/notificationScheduler.js';
import './models/index.js'; // Load all model hooks

const { port, nodeEnv } = getEnvConfig();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Setup Socket.IO handlers
setupSocketIO(io);

// Attach Socket.IO to app for use in routes
app.set('io', io);

/**
 * Start server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await database.connect();

    // PERFORMANCE: Reset all users online status on startup
    // This ensures no user is left "stuck" as online if the server crashed
    try {
      const User = (await import('./models/User.js')).default;
      await User.updateMany({}, { isOnline: false, socketId: null });
      logger.info('✅ Reset all users online status for consistency');

      // ONE-TIME: Synchronize blockedBy for existing data (if not already synced)
      // We only do this once to avoid heavy startup in the future
      const needsSync = await User.exists({
        blockedUsers: { $exists: true, $not: { $size: 0 } },
        blockedBySyncFlag: { $exists: false }
      });

      if (needsSync) {
        logger.info('🔄 Synchronizing blocking data for existing users...');
        const usersWithBlocks = await User.find({
          blockedUsers: { $exists: true, $not: { $size: 0 } }
        }).select('_id blockedUsers').lean();

        for (const user of usersWithBlocks) {
          await User.updateMany(
            { _id: { $in: user.blockedUsers } },
            { $addToSet: { blockedBy: user._id } }
          );
        }

        // Mark all as synced so we don't repeat this
        await User.updateMany({}, { $set: { blockedBySyncFlag: true } });
        logger.info('✅ Blocking data synchronization complete');
      }
    } catch (err) {
      logger.error('❌ Failed to sync/reset user data:', err);
    }

    // Initialize Razorpay
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      initializeRazorpay();
    } else {
      logger.warn('⚠️ Razorpay credentials not found. Payment features will be disabled.');
    }

    // Start HTTP server
    server.listen(port, '0.0.0.0', () => {
      logger.info(`🚀 Server running in ${nodeEnv} mode on port ${port}`);
      logger.info(`📡 Socket.IO server initialized`);
      logger.info(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);

      // Start wallet scheduler (for expired withdrawal processing)
      walletScheduler.startScheduler();

      // Start notification scheduler (for daily rewards, etc.)
      notificationScheduler.startNotificationScheduler();
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('❌ UNHANDLED REJECTION! Shutting down...');
      logger.error(err);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle SIGTERM
    process.on('SIGTERM', () => {
      logger.info('👋 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('✅ Process terminated');
      });
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default server;

