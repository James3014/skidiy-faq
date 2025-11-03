/**
 * CORS Middleware Configuration
 *
 * Cross-Origin Resource Sharing setup for API
 * Allows frontend to access backend API from different origins
 */

const cors = require('cors');

/**
 * Configure CORS options
 */
function configureCORS() {
  const corsOptions = {
    // Allow requests from these origins
    origin: function (origin, callback) {
      // Default allowed origins for production
      const defaultOrigins = [
        'http://localhost:8080',
        'http://localhost:3000',
        'https://faq.diy.ski',
        'https://skidiy-faq.zeabur.app',
        'https://faq-api-v1.zeabur.app'
      ];

      const allowedOrigins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
        : defaultOrigins;

      // Allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes('*')) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },

    // Allow these methods
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

    // Allow these headers
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Session-Id',
    ],

    // Expose these headers to client
    exposedHeaders: ['X-Query-Id', 'X-Response-Time'],

    // Allow credentials (cookies, authorization headers)
    credentials: true,

    // Cache preflight request for 24 hours
    maxAge: 86400,
  };

  return cors(corsOptions);
}

module.exports = configureCORS;
