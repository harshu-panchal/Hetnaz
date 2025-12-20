/**
 * Rate Limiting Middleware
 * @owner: Sujal (Shared - Both review)
 * @purpose: Prevent abuse and DDoS attacks
 * 
 * NOTE: Rate limiting is disabled during development for faster testing.
 * Uncomment the code below for production.
 */

// import rateLimit from 'express-rate-limit';
// import { getEnvConfig } from '../config/env.js';

// const { rateLimitWindowMs, rateLimitMaxRequests } = getEnvConfig();

/**
 * General API rate limiter - DISABLED FOR DEVELOPMENT
 */
// export const apiLimiter = rateLimit({
//   windowMs: rateLimitWindowMs, // 15 minutes
//   max: rateLimitMaxRequests, // 100 requests per window
//   message: 'Too many requests from this IP, please try again later.',
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// Pass-through middleware (no rate limiting)
export const apiLimiter = (req, res, next) => next();

/**
 * Strict rate limiter for auth endpoints - DISABLED FOR DEVELOPMENT
 */
// export const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // 5 requests per window
//   message: 'Too many login attempts, please try again after 15 minutes.',
//   skipSuccessfulRequests: true,
// });

// Pass-through middleware (no rate limiting)
export const authLimiter = (req, res, next) => next();

/**
 * Rate limiter for message sending (prevent spam) - DISABLED FOR DEVELOPMENT
 */
// export const messageLimiter = rateLimit({
//   windowMs: 60 * 1000, // 1 minute
//   max: 10, // 10 messages per minute
//   message: 'Too many messages sent, please slow down.',
//   keyGenerator: (req) => {
//     return req.userId?.toString() || req.ip;
//   },
// });

// Pass-through middleware (no rate limiting)
export const messageLimiter = (req, res, next) => next();
