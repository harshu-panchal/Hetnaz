/**
 * Authentication Middleware (PERFORMANCE OPTIMIZED)
 * - Uses in-memory user cache to avoid DB hit on every request
 * - Cache invalidates after 30 seconds or on user update
 * - Returns FULL user object (not lean) for compatibility
 */

import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import User from '../models/User.js';
import { getEnvConfig } from '../config/env.js';

const { jwtSecret } = getEnvConfig();

// In-memory user cache: { userId: { user, timestamp } }
const userCache = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds (shorter for fresher data)

/**
 * Get user from cache or DB (with caching)
 */
const getCachedUser = async (userId) => {
  const now = Date.now();
  const idStr = userId.toString(); // Force string for Map key consistency
  const cached = userCache.get(idStr);

  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    // Return a shallow clone to prevent cross-request mutation leakage
    return { ...cached.user };
  }

  // Cache miss - fetch FULL user from DB (no .lean() for compatibility)
  const user = await User.findById(idStr);
  if (user) {
    // Cache the user's plain object representation
    const userObj = user.toObject();
    userObj.id = idStr; // Ensure id field exists
    userCache.set(idStr, { user: userObj, timestamp: now });
    return { ...userObj };
  }
  return null;
};

/**
 * Invalidate user cache (call this on user update)
 */
export const invalidateUserCache = (userId) => {
  if (userId) userCache.delete(userId.toString());
};

/**
 * Protect routes - require authentication
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new UnauthorizedError('You are not logged in. Please log in to get access.'));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (error) {
      return next(new UnauthorizedError('Invalid token. Please log in again.'));
    }

    // Use cached user lookup (KEY OPTIMIZATION)
    const user = await getCachedUser(decoded.id);

    if (!user) {
      return next(new UnauthorizedError('The user belonging to this token no longer exists.'));
    }

    if (!user.isActive) {
      return next(new UnauthorizedError('Your account has been deactivated.'));
    }

    if (user.isBlocked) {
      return next(new ForbiddenError('Your account is currently blocked. Please reach out to Support for further assistance.'));
    }

    // Grant access - attach full user object
    req.user = user;
    req.userId = user._id || user.id;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Restrict to specific roles
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action.'));
    }
    next();
  };
};

/**
 * Check if user is verified (for female users)
 */
export const requireVerification = (req, res, next) => {
  if (req.user.role === 'female' && !req.user.isVerified) {
    return next(new ForbiddenError('Your account is pending verification.'));
  }
  next();
};

/**
 * Check if female user is approved
 */
export const requireApproval = (req, res, next) => {
  if (req.user.role === 'female' && req.user.approvalStatus !== 'approved') {
    return next(new ForbiddenError('Your account is pending admin approval.'));
  }
  next();
};
