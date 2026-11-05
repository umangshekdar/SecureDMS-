/**
 * Standardized API response helper functions.
 */

/**
 * Send a success response.
 * @param {import('express').Response} res 
 * @param {string} message 
 * @param {any} data 
 * @param {number} statusCode 
 * @param {object|null} pagination 
 */
export const successResponse = (res, message = 'Success', data = null, statusCode = 200, pagination = null) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send an error response.
 * @param {import('express').Response} res 
 * @param {string} message 
 * @param {number} statusCode 
 * @param {any} errors 
 */
export const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

export default {
  successResponse,
  errorResponse,
};
