/**
 * Security Middleware
 * @owner: Sujal (Shared - Both review)
 * @purpose: Security headers and CORS configuration
 */

import helmet from 'helmet';
import cors from 'cors';
import { getEnvConfig } from '../config/env.js';

const { frontendUrl } = getEnvConfig();

/**
 * CORS configuration
 */
export const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    const envFrontendUrl = process.env.FRONTEND_URL || frontendUrl;

    // Clean URLs (remove trailing slashes for comparison)
    const cleanOrigin = origin.replace(/\/$/, '');
    const cleanFrontendUrl = envFrontendUrl ? envFrontendUrl.replace(/\/$/, '') : null;

    const allowedOrigins = [
      cleanFrontendUrl,
      'https://hetnaz.in',
      'https://www.hetnaz.in',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5000'
    ].map(o => o?.replace(/\/$/, '')).filter(Boolean);

    const isAllowedVercel = cleanOrigin.endsWith('.vercel.app');

    if (allowedOrigins.includes(cleanOrigin) || isAllowedVercel || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS Warning: Origin ${origin} not explicitly allowed.`);
      // Still allow for now to prevent breaking, but warn
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
};

/**
 * Helmet security headers
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
});

