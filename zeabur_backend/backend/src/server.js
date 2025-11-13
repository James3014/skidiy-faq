/**
 * Express Server
 *
 * Main server file for FAQ System API
 * Initializes Express app with all middleware and routes
 */

require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const configureCORS = require('./middleware/cors');
const configureCompression = require('./middleware/compression');
const { errorHandler, notFoundHandler } = require('./middleware/error-handler');
const logger = require('./utils/logger');
const { formatSuccess } = require('./utils/response-formatter');
const routes = require('./routes');
const AnalyticsService = require('./services/analytics-service');

// Initialize Express app
const app = express();

// Configuration
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const SERVER_START_TIME = Date.now();

// Initialize analytics service
let analyticsService;
try {
  const enforcedPath = process.env.SQLITE_DB_PATH || path.join(__dirname, '../data/analytics.db');
  process.env.SQLITE_DB_PATH = enforcedPath;
  analyticsService = new AnalyticsService(enforcedPath);
  logger.info('Analytics service initialized', {
    path: enforcedPath,
  });
} catch (error) {
  logger.error('Failed to initialize analytics service', {
    error: error.message,
  });
}

// Middleware stack (order matters!)
// 1. Security headers
app.use(helmet());

// 2. CORS configuration
app.use(configureCORS());

// 3. Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Response compression
app.use(configureCompression());

// 5. Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.http(req, res, duration);
  });

  next();
});

// Health check endpoint (before routes)
app.get('/health', (req, res) => {
  const uptime = process.uptime();
  const uptimeFormatted = Math.floor(uptime / 60) + 'm ' + Math.floor(uptime % 60) + 's';

  // Test database connection
  let dbStatus = 'disconnected';
  if (analyticsService?.db) {
    try {
      analyticsService.db.prepare('SELECT 1').get();
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'error';
      logger.error('Database health check failed', { error: error.message });
    }
  }

  res.status(200).json(
    formatSuccess({
      status: 'healthy',
      version: '1.0.0',
      uptime: uptimeFormatted,
      uptimeSeconds: Math.floor(uptime),
      database: dbStatus,
      environment: NODE_ENV,
      timestamp: new Date().toISOString(),
    })
  );
});

// API routes (prefixed with /api/v1)
app.use('/api/v1', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json(
    formatSuccess({
      service: 'FAQ System API',
      version: '1.0.0',
      status: 'running',
      documentation: '/api/v1/placeholder',
      health: '/health',
    })
  );
});

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`FAQ System API server started`, {
    port: PORT,
    environment: NODE_ENV,
    version: '1.0.0',
    url: `http://localhost:${PORT}`,
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');

    // Close database connection
    if (analyticsService?.db) {
      analyticsService.db.close();
      logger.info('Analytics database connection closed');
    }

    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');

    // Close database connection
    if (analyticsService?.db) {
      analyticsService.db.close();
      logger.info('Analytics database connection closed');
    }

    process.exit(0);
  });
});

// Export for testing
module.exports = { app, server };
