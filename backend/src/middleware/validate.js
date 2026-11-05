import { errorResponse } from '../utils/responseHelper.js';

/**
 * Middleware factory to validate required request body fields.
 * @param {string[]} requiredFields 
 */
export const validateBody = (requiredFields = []) => {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
      return errorResponse(res, 'Request body is missing or invalid', 400);
    }

    const missing = requiredFields.filter((field) => {
      const val = req.body[field];
      return val === undefined || val === null || val === '';
    });

    if (missing.length > 0) {
      return errorResponse(
        res,
        `Missing required fields: ${missing.join(', ')}`,
        400,
        { missingFields: missing }
      );
    }

    next();
  };
};

/**
 * Validates ObjectId format.
 * @param {string} paramName 
 */
export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (id && !/^[0-9a-fA-F]{24}$/.test(id)) {
      return errorResponse(res, `Invalid ID format for parameter: ${paramName}`, 400);
    }
    next();
  };
};

export default {
  validateBody,
  validateObjectId,
};
