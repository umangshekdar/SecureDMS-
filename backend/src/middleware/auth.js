import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import env from '../config/env.js';
import { errorResponse } from '../utils/responseHelper.js';

/**
 * Middleware to authenticate requests using JWT Bearer token.
 */
export const authenticate = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return errorResponse(res, 'Authentication required. No token provided.', 401);
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return errorResponse(res, 'User belonging to this token no longer exists.', 401);
    }

    if (user.status !== 'active') {
      return errorResponse(res, `User account is currently ${user.status}. Access denied.`, 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token has expired. Please log in again.', 401);
    }
    return errorResponse(res, 'Invalid or corrupted token.', 401);
  }
};

/**
 * Helper to generate JWT token.
 * @param {string} userId 
 * @param {string} role 
 * @returns {string}
 */
export const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || '24h',
  });
};

export default {
  authenticate,
  generateToken,
};
