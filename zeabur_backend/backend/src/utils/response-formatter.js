/**
 * Response Formatter Utility
 *
 * Standardizes API response format across all endpoints
 * Ensures consistent structure for success and error responses
 */

/**
 * Format success response
 * @param {*} data - Response data
 * @param {Object} meta - Optional metadata
 * @returns {Object} - Formatted success response
 */
function formatSuccess(data, meta = {}) {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

/**
 * Format error response
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {Object} details - Optional error details
 * @returns {Object} - Formatted error response
 */
function formatError(code, message, details = null) {
  const response = {
    success: false,
    error: {
      code,
      message,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  if (details) {
    response.error.details = details;
  }

  return response;
}

/**
 * Format paginated response
 * @param {Array} items - Data items
 * @param {Object} pagination - Pagination info { page, limit, total }
 * @param {Object} meta - Optional metadata
 * @returns {Object} - Formatted paginated response
 */
function formatPaginated(items, pagination, meta = {}) {
  return formatSuccess(items, {
    ...meta,
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      total: pagination.total || items.length,
      totalPages: Math.ceil((pagination.total || items.length) / (pagination.limit || 10)),
    },
  });
}

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {number} statusCode - HTTP status code
 * @param {Object} meta - Optional metadata
 */
function sendSuccess(res, data, statusCode = 200, meta = {}) {
  res.status(statusCode).json(formatSuccess(data, meta));
}

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} details - Optional error details
 */
function sendError(res, code, message, statusCode = 500, details = null) {
  res.status(statusCode).json(formatError(code, message, details));
}

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} items - Data items
 * @param {Object} pagination - Pagination info
 * @param {Object} meta - Optional metadata
 */
function sendPaginated(res, items, pagination, meta = {}) {
  res.status(200).json(formatPaginated(items, pagination, meta));
}

module.exports = {
  formatSuccess,
  formatError,
  formatPaginated,
  sendSuccess,
  sendError,
  sendPaginated,
};
