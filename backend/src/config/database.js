/**
 * MongoDB Database Connection Configuration
 * @owner: Sujal (Shared - Both review)
 * @purpose: Establish and manage MongoDB connection
 */

import mongoose from 'mongoose';
import logger from '../utils/logger.js';

class Database {
  constructor() {
    this.connection = null;
  }

  /**
   * Connect to MongoDB Atlas
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      const mongoURI = process.env.MONGODB_URI;

      if (!mongoURI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }

      const options = {
        maxPoolSize: 50, // Increase connection pool
        minPoolSize: 5,  // Keep minimum connections ready
        serverSelectionTimeoutMS: 10000, // Increased timeout for initial connection
        socketTimeoutMS: 30000,
        connectTimeoutMS: 10000,
        heartbeatFrequencyMS: 10000, // More frequent heartbeats
        retryWrites: true,
        retryReads: true,
      };

      this.connection = await mongoose.connect(mongoURI, options);

      logger.info('✅ MongoDB connected successfully');
      logger.info(`📊 Database: ${this.connection.connection.name}`);
      logger.info(`🌐 Host: ${this.connection.connection.host}`);

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        logger.error('❌ MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('⚠️ MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('✅ MongoDB reconnected');
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

      return this.connection;
    } catch (error) {
      logger.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        logger.info('✅ MongoDB disconnected gracefully');
      }
    } catch (error) {
      logger.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   * @returns {string}
   */
  getStatus() {
    return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  }
}

export default new Database();

