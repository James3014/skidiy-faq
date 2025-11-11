/**
 * Admin API Routes
 *
 * Administrative endpoints for system management
 * Requires authentication via ADMIN_TOKEN environment variable
 */

const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const path = require('path');

// Admin authentication middleware
function requireAdminAuth(req, res, next) {
  const adminToken = process.env.ADMIN_TOKEN || 'admin-secret-token-change-me';
  const providedToken = req.headers['x-admin-token'] || req.query.token;

  if (!providedToken || providedToken !== adminToken) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing admin token'
      }
    });
  }

  next();
}

/**
 * POST /api/v1/admin/reset-analytics
 *
 * Reset analytics database
 *
 * Headers:
 *   X-Admin-Token: <admin_token>
 *
 * Body:
 *   {
 *     "mode": "all" | "keep-days",     // 清除模式（預設: all）
 *     "keepDays": 7,                   // 保留天數（mode=keep-days 時必填）
 *     "dryRun": true                   // 預覽模式（預設: false）
 *   }
 *
 * Response:
 *   {
 *     "success": true,
 *     "data": {
 *       "before": { "search_queries": 100, ... },
 *       "deleted": { "search_queries": 50, ... },
 *       "after": { "search_queries": 50, ... },
 *       "dryRun": false
 *     }
 *   }
 */
router.post('/reset-analytics', requireAdminAuth, async (req, res, next) => {
  try {
    const { mode = 'all', keepDays, dryRun = false } = req.body;

    // Validate parameters
    if (mode === 'keep-days' && (!keepDays || keepDays < 1)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'keepDays must be a positive integer when mode is "keep-days"'
        }
      });
    }

    // Database path (prefer environment variable)
    const dbPath = process.env.SQLITE_DB_PATH || path.join(__dirname, '../../../data/analytics.db');
    const db = new Database(dbPath);

    // Query current stats (all analytics tables)
    const beforeStats = {
      search_queries: db.prepare('SELECT COUNT(*) as count FROM search_queries').get().count,
      faq_views: db.prepare('SELECT COUNT(*) as count FROM faq_views').get().count,
      feedback: db.prepare('SELECT COUNT(*) as count FROM feedback').get().count,
      tag_clicks: db.prepare('SELECT COUNT(*) as count FROM tag_clicks').get().count,
      resort_clicks: db.prepare('SELECT COUNT(*) as count FROM resort_clicks').get().count,
      section_views: db.prepare('SELECT COUNT(*) as count FROM section_views').get().count,
      llm_usage: db.prepare('SELECT COUNT(*) as count FROM llm_usage').get().count
    };

    let deletedStats = { search_queries: 0, faq_views: 0, feedback: 0, tag_clicks: 0, resort_clicks: 0, section_views: 0, llm_usage: 0 };
    let cutoffDate = null;

    if (mode === 'keep-days') {
      // Keep recent N days
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - keepDays);
      cutoffDate = cutoff.toISOString();

      // Query how many will be deleted
      deletedStats = {
        search_queries: db.prepare('SELECT COUNT(*) as count FROM search_queries WHERE timestamp < ?').get(cutoffDate).count,
        faq_views: db.prepare('SELECT COUNT(*) as count FROM faq_views WHERE timestamp < ?').get(cutoffDate).count,
        feedback: db.prepare('SELECT COUNT(*) as count FROM feedback WHERE timestamp < ?').get(cutoffDate).count,
        tag_clicks: db.prepare('SELECT COUNT(*) as count FROM tag_clicks WHERE timestamp < ?').get(cutoffDate).count,
        resort_clicks: db.prepare('SELECT COUNT(*) as count FROM resort_clicks WHERE timestamp < ?').get(cutoffDate).count,
        section_views: db.prepare('SELECT COUNT(*) as count FROM section_views WHERE timestamp < ?').get(cutoffDate).count,
        llm_usage: db.prepare('SELECT COUNT(*) as count FROM llm_usage WHERE timestamp < ?').get(cutoffDate).count
      };

      if (!dryRun) {
        db.exec('BEGIN TRANSACTION');
        db.prepare('DELETE FROM search_queries WHERE timestamp < ?').run(cutoffDate);
        db.prepare('DELETE FROM faq_views WHERE timestamp < ?').run(cutoffDate);
        db.prepare('DELETE FROM feedback WHERE timestamp < ?').run(cutoffDate);
        db.prepare('DELETE FROM tag_clicks WHERE timestamp < ?').run(cutoffDate);
        db.prepare('DELETE FROM resort_clicks WHERE timestamp < ?').run(cutoffDate);
        db.prepare('DELETE FROM section_views WHERE timestamp < ?').run(cutoffDate);
        db.prepare('DELETE FROM llm_usage WHERE timestamp < ?').run(cutoffDate);
        db.exec('COMMIT');
        db.exec('VACUUM');
      }
    } else {
      // Delete all
      deletedStats = beforeStats;

      if (!dryRun) {
        db.exec('BEGIN TRANSACTION');
        db.exec('DELETE FROM search_queries');
        db.exec('DELETE FROM faq_views');
        db.exec('DELETE FROM feedback');
        db.exec('DELETE FROM tag_clicks');
        db.exec('DELETE FROM resort_clicks');
        db.exec('DELETE FROM section_views');
        db.exec('DELETE FROM llm_usage');
        db.exec('COMMIT');
        db.exec('VACUUM');
      }
    }

    // Query final stats
    const afterStats = dryRun ? beforeStats : {
      search_queries: db.prepare('SELECT COUNT(*) as count FROM search_queries').get().count,
      faq_views: db.prepare('SELECT COUNT(*) as count FROM faq_views').get().count,
      feedback: db.prepare('SELECT COUNT(*) as count FROM feedback').get().count,
      tag_clicks: db.prepare('SELECT COUNT(*) as count FROM tag_clicks').get().count,
      resort_clicks: db.prepare('SELECT COUNT(*) as count FROM resort_clicks').get().count,
      section_views: db.prepare('SELECT COUNT(*) as count FROM section_views').get().count,
      llm_usage: db.prepare('SELECT COUNT(*) as count FROM llm_usage').get().count
    };

    db.close();

    // Log the operation
    console.log('[Admin API] Analytics reset:', {
      mode,
      keepDays,
      dryRun,
      deletedStats,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        mode,
        keepDays: mode === 'keep-days' ? keepDays : null,
        cutoffDate: mode === 'keep-days' ? cutoffDate : null,
        dryRun,
        before: beforeStats,
        deleted: deletedStats,
        after: afterStats
      }
    });

  } catch (error) {
    console.error('[Admin API] Reset analytics error:', error);
    next(error);
  }
});

/**
 * GET /api/v1/admin/analytics-stats
 *
 * Get analytics database statistics
 *
 * Headers:
 *   X-Admin-Token: <admin_token>
 *
 * Response:
 *   {
 *     "success": true,
 *     "data": {
 *       "dbPath": "/data/analytics.db",
 *       "dbSize": 102400,
 *       "tables": {
 *         "search_queries": { "count": 100, "oldestDate": "2025-01-01", ... },
 *         ...
 *       }
 *     }
 *   }
 */
router.get('/analytics-stats', requireAdminAuth, async (req, res, next) => {
  try {
    const dbPath = process.env.SQLITE_DB_PATH || path.join(__dirname, '../../../data/analytics.db');
    const fs = require('fs');
    const db = new Database(dbPath);

    // Get database file size
    const dbSize = fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0;

    // Get table stats (all analytics tables)
    const tables = {
      search_queries: {
        count: db.prepare('SELECT COUNT(*) as count FROM search_queries').get().count,
        oldest: db.prepare('SELECT MIN(timestamp) as date FROM search_queries').get().date,
        newest: db.prepare('SELECT MAX(timestamp) as date FROM search_queries').get().date
      },
      faq_views: {
        count: db.prepare('SELECT COUNT(*) as count FROM faq_views').get().count,
        oldest: db.prepare('SELECT MIN(timestamp) as date FROM faq_views').get().date,
        newest: db.prepare('SELECT MAX(timestamp) as date FROM faq_views').get().date
      },
      feedback: {
        count: db.prepare('SELECT COUNT(*) as count FROM feedback').get().count,
        oldest: db.prepare('SELECT MIN(timestamp) as date FROM feedback').get().date,
        newest: db.prepare('SELECT MAX(timestamp) as date FROM feedback').get().date
      },
      tag_clicks: {
        count: db.prepare('SELECT COUNT(*) as count FROM tag_clicks').get().count,
        oldest: db.prepare('SELECT MIN(timestamp) as date FROM tag_clicks').get().date,
        newest: db.prepare('SELECT MAX(timestamp) as date FROM tag_clicks').get().date
      },
      resort_clicks: {
        count: db.prepare('SELECT COUNT(*) as count FROM resort_clicks').get().count,
        oldest: db.prepare('SELECT MIN(timestamp) as date FROM resort_clicks').get().date,
        newest: db.prepare('SELECT MAX(timestamp) as date FROM resort_clicks').get().date
      },
      section_views: {
        count: db.prepare('SELECT COUNT(*) as count FROM section_views').get().count,
        oldest: db.prepare('SELECT MIN(timestamp) as date FROM section_views').get().date,
        newest: db.prepare('SELECT MAX(timestamp) as date FROM section_views').get().date
      },
      llm_usage: {
        count: db.prepare('SELECT COUNT(*) as count FROM llm_usage').get().count,
        oldest: db.prepare('SELECT MIN(timestamp) as date FROM llm_usage').get().date,
        newest: db.prepare('SELECT MAX(timestamp) as date FROM llm_usage').get().date
      }
    };

    db.close();

    res.json({
      success: true,
      data: {
        dbPath,
        dbSize,
        dbSizeHuman: `${(dbSize / 1024).toFixed(2)} KB`,
        tables
      }
    });

  } catch (error) {
    console.error('[Admin API] Get analytics stats error:', error);
    next(error);
  }
});

/**
 * GET /api/v1/admin/health
 *
 * Admin health check (requires auth)
 */
router.get('/health', requireAdminAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

module.exports = router;
