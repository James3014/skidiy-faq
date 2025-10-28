/**
 * Error Handler Middleware
 *
 * Unified error handling for Express application
 * Returns standardized error responses
 */

const logger = require('../utils/logger');
const { formatError } = require('../utils/response-formatter');

/**
 * Error codes mapping
 */
const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_QUERY: 'INVALID_QUERY',
  FAQ_NOT_FOUND: 'FAQ_NOT_FOUND',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
};

/**
 * Custom application error class
 */
class AppError extends Error {
  constructor(code, message, statusCode = 500, details = null) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware
 * Should be placed after all routes
 */
function errorHandler(err, req, res, next) {
  // Log error
  logger.error('Error occurred:', {
    error: err.message,
    code: err.code,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Default error values
  let statusCode = err.statusCode || 500;
  let errorCode = err.code || ErrorCodes.INTERNAL_ERROR;
  let errorMessage = err.message || 'Internal server error';
  let errorDetails = err.details || null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = ErrorCodes.VALIDATION_ERROR;
    errorMessage = 'Validation failed';
    errorDetails = err.errors || err.details;
  } else if (err.name === 'SyntaxError' && err.status === 400 && 'body' in err) {
    // JSON parsing error
    statusCode = 400;
    errorCode = ErrorCodes.VALIDATION_ERROR;
    errorMessage = 'Invalid JSON in request body';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = ErrorCodes.INVALID_QUERY;
    errorMessage = 'Invalid parameter format';
  }

  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    errorMessage = 'Internal server error';
    errorDetails = undefined;
  } else if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    // Include stack trace in development (but not in test)
    errorDetails = {
      ...errorDetails,
      stack: err.stack,
    };
  }

  // Send error response
  res.status(statusCode).json(
    formatError(errorCode, errorMessage, errorDetails)
  );
}

/**
 * 404 Not Found handler
 * Should be placed before error handler
 */
function notFoundHandler(req, res, next) {
  const error = new AppError(
    'NOT_FOUND',
    `Route ${req.method} ${req.path} not found`,
    404
  );
  next(error);
}

/**
 * Async route handler wrapper
 * Catches async errors and passes them to error handler
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  ErrorCodes,
};
