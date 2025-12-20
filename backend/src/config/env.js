/**
 * Environment Configuration Validator
 * @owner: Sujal (Shared - Both review)
 * @purpose: Validate and load environment variables
 */

import dotenv from 'dotenv';
// import logger from '../utils/logger.js'; // Removed to avoid circular dependency

// Load environment variables
dotenv.config();

/**
 * Required environment variables
 */
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'FRONTEND_URL',
];

/**
 * Validate environment variables
 */
export const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    throw new Error('Missing required environment variables');
  }


};

/**
 * Get environment configuration
 */
export const getEnvConfig = () => {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 5000,
    serverUrl: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
    socketCorsOrigin: process.env.SOCKET_CORS_ORIGIN || process.env.FRONTEND_URL,
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880, // 5MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    logLevel: process.env.LOG_LEVEL || 'info',
    // Video Call Config (new)
    videoCallPrice: parseInt(process.env.VIDEO_CALL_PRICE, 10) || 500,
    videoCallDuration: parseInt(process.env.VIDEO_CALL_DURATION_SECONDS, 10) || 300,
    callConnectionTimeout: parseInt(process.env.CALL_CONNECTION_TIMEOUT_SECONDS, 10) || 20,
    maxConcurrentCalls: parseInt(process.env.MAX_CONCURRENT_CALLS_PER_USER, 10) || 1,
    // WebRTC Config (new)
    stunUrl: process.env.STUN_URL || 'stun:stun.l.google.com:19302',
    turnUris: process.env.TURN_URIS || '',
    turnUser: process.env.TURN_USER || '',
    turnPass: process.env.TURN_PASS || '',
  };
};

// Validate on import
if (process.env.NODE_ENV !== 'test') {
  validateEnv();
}

export default getEnvConfig();

