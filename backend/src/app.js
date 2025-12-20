/**
 * Express Application Setup
 * @owner: Sujal (Shared - Both review)
 * @purpose: Configure Express app with middleware and routes
 */

import express from 'express';
import compression from 'compression';
import morgan from 'morgan';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './utils/errors.js';
import { securityHeaders, corsOptions } from './middleware/security.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import logger from './utils/logger.js';
import { getEnvConfig } from './config/env.js';

const { nodeEnv } = getEnvConfig();

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
import { authRoutes, adminRoutes, userRoutes, walletRoutes, paymentRoutes, chatRoutes } from './routes/index.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/chat', chatRoutes);
// app.use('/api/male', maleRoutes);
// app.use('/api/female', femaleRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;

