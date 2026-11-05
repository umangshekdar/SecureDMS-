import { errorResponse } from '../utils/responseHelper.js';
import env from '../config/env.js';

/**
 * Global centralized error handling middleware.
 */
export const errorHandler = (err, req, res, next) => {
  console.error('[Unhandled Error]', {
    message: err.message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.originalUrl,
    method: req.method,
  });

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    message = `Resource not found with id: ${err.value}`;
    statusCode = 404;
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    message = `Duplicate field value entered for: ${fields.join(', ')}. Value must be unique.`;
    statusCode = 400;
    errors = err.keyValue;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    message = 'Validation failed';
    statusCode = 400;
    errors = Object.values(err.errors).map((val) => val.message);
  }

  // Handle Multer upload limits
  if (err.code === 'LIMIT_FILE_SIZE') {
    message = 'Uploaded file exceeds the maximum permissible limit (50MB).';
    statusCode = 400;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid authentication token.';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Authentication token expired.';
    statusCode = 401;
  }

  return errorResponse(res, message, statusCode, errors);
};

export default errorHandler;
