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
const APP_VERSION = '1.0.2'; // Force Zeabur rebuild - pragmatic Linus approach

// Initialize analytics service
// LINUS PRINCIPLE: Single source of truth for database path
// Priority order:
// 1. SQLITE_DB_PATH environment variable (explicitly set)
// 2. Zeabur Volume path: /data/analytics.db (auto-detect)
// 3. Local development: ../data/analytics.db
let analyticsService;
try {
  const fs = require('fs');
  const path = require('path');

  // CRITICAL: Check if env var is set to wrong path (../data instead of /data)
  if (process.env.SQLITE_DB_PATH && process.env.SQLITE_DB_PATH.startsWith('..')) {
    logger.warn('⚠️  SQLITE_DB_PATH uses relative path, ignoring it on production', {
      envValue: process.env.SQLITE_DB_PATH,
      willUse: fs.existsSync('/data') ? '/data/analytics.db' : 'fallback'
    });
    // Clear the bad env var so auto-detection works
    delete process.env.SQLITE_DB_PATH;
  }

  const dbPath = process.env.SQLITE_DB_PATH
    || (fs.existsSync('/data') ? '/data/analytics.db' : path.join(__dirname, '../../data/analytics.db'));

  logger.info('Attempting to initialize analytics service', {
    path: dbPath,
    envVarSet: !!process.env.SQLITE_DB_PATH,
    zeaburVolumeDetected: fs.existsSync('/data'),
    dataWritable: (() => {
      try {
        const testDir = path.dirname(dbPath);
        fs.accessSync(testDir, fs.constants.W_OK);
        return true;
      } catch {
        return false;
      }
    })()
  });

  analyticsService = new AnalyticsService(dbPath);
  logger.info('✅ Analytics service initialized successfully', {
    path: dbPath,
    dbConnected: analyticsService.db ? true : false
  });

  // LINUS PRINCIPLE: Single source of truth for DATA_DIR
  // Store the data directory path globally so all routes can access it
  const dataDir = path.dirname(dbPath); // Get the directory containing analytics.db
  global.DATA_DIR = dataDir;
  logger.info('✅ Global DATA_DIR initialized', { path: dataDir });
} catch (error) {
  logger.error('❌ Failed to initialize analytics service', {
    error: error.message,
    stack: error.stack,
    attemptedPath: process.env.SQLITE_DB_PATH || '/data/analytics.db',
  });
  // Set to null explicitly
  analyticsService = null;
  // Still set DATA_DIR to a sensible default
  global.DATA_DIR = process.env.SQLITE_DB_PATH
    ? path.dirname(process.env.SQLITE_DB_PATH)
    : path.join(__dirname, '../../data');
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

  // Test database connection with detailed diagnostics
  let dbStatus = 'disconnected';
  let dbDetails = {};

  if (!analyticsService) {
    dbStatus = 'service_not_initialized';
    dbDetails = {
      reason: 'analyticsService is null',
      envCheck: {
        SQLITE_DB_PATH: process.env.SQLITE_DB_PATH || 'not set',
        dataVolumeExists: require('fs').existsSync('/data')
      }
    };
  } else if (!analyticsService.db) {
    dbStatus = 'db_object_missing';
    dbDetails = { reason: 'analyticsService.db is null' };
  } else {
    try {
      analyticsService.db.prepare('SELECT 1').get();
      dbStatus = 'connected';
      // Get database file info
      const dbPath = analyticsService.db.name;
      dbDetails = {
        path: dbPath,
        exists: require('fs').existsSync(dbPath),
        size: (() => {
          try {
            const stats = require('fs').statSync(dbPath);
            return `${Math.round(stats.size / 1024)}KB`;
          } catch {
            return 'unknown';
          }
        })()
      };
    } catch (error) {
      dbStatus = 'error';
      dbDetails = { error: error.message };
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
      databaseDetails: dbDetails,
      environment: NODE_ENV,
      timestamp: new Date().toISOString(),
    })
  );
});

// API routes (prefixed with /api/v1)
app.use('/api/v1', routes);

// LINUS PRINCIPLE: Initialize routes with shared service instances
// This ensures single source of truth for database path
const analyticsRoutes = require('./routes/analytics');
if (analyticsService && typeof analyticsRoutes.initializeServices === 'function') {
  analyticsRoutes.initializeServices(analyticsService);
  logger.info('Analytics routes initialized with shared service instance');
}

const llmRoutes = require('./routes/llm');
if (analyticsService && typeof llmRoutes.initializeServices === 'function') {
  llmRoutes.initializeServices(analyticsService).catch(error => {
    logger.error('Failed to initialize LLM routes:', error);
  });
  logger.info('LLM routes initialized with shared service instance');
}

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

// Debug endpoint for diagnosing initialization issues
app.get('/debug/init', (req, res) => {
  const fs = require('fs');
  const path = require('path');

  const diagnostics = {
    analyticsService: {
      initialized: !!analyticsService,
      hasDb: analyticsService?.db ? true : false,
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      SQLITE_DB_PATH: process.env.SQLITE_DB_PATH || 'not set',
    },
    filesystem: {
      dataVolumeExists: fs.existsSync('/data'),
      dataVolumeWritable: (() => {
        try {
          fs.accessSync('/data', fs.constants.W_OK);
          return true;
        } catch {
          return false;
        }
      })(),
      dbFileExists: fs.existsSync('/data/analytics.db'),
      dbFileSize: (() => {
        try {
          const stats = fs.statSync('/data/analytics.db');
          return `${Math.round(stats.size / 1024)}KB`;
        } catch {
          return 'file not found';
        }
      })(),
    },
    paths: {
      cwd: process.cwd(),
      __dirname: __dirname,
      expectedDbPath: process.env.SQLITE_DB_PATH
        || (fs.existsSync('/data') ? '/data/analytics.db' : path.join(__dirname, '../../data/analytics.db')),
    },
  };

  res.json(formatSuccess(diagnostics));
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
