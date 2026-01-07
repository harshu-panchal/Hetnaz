/**
 * Server Entry Point
 * @owner: Sujal (Shared - Both review)
 * @purpose: Initialize server with Express, Socket.IO, and MongoDB
 */

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

    // Initialize Razorpay
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      initializeRazorpay();
    } else {
      logger.warn('⚠️ Razorpay credentials not found. Payment features will be disabled.');
    }

    // Start HTTP server
    server.listen(port, () => {
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

