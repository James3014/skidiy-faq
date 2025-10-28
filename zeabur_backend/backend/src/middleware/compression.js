/**
 * Compression Middleware Configuration
 *
 * Enables gzip compression for HTTP responses
 * Reduces bandwidth and improves loading times
 */

const compression = require('compression');

/**
 * Configure compression middleware
 */
function configureCompression() {
  return compression({
    // Compression level (0-9, higher = better compression but slower)
    level: 6,

    // Only compress responses larger than this (bytes)
    threshold: 1024,

    // Filter function - only compress these content types
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        // Don't compress if client requests no compression
        return false;
      }

      // Use compression's default filter
      return compression.filter(req, res);
    },
  });
}

module.exports = configureCompression;
