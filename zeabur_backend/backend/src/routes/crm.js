/**
 * CRM API Routes
 *
 * Endpoints:
 * - POST /api/v1/crm/log-inquiry - Log customer inquiry
 * - GET /api/v1/crm/inquiries - Get inquiry list
 * - GET /api/v1/crm/stats - Get inquiry statistics
 * - GET /api/v1/crm/popular-queries/:intent - Get popular queries by intent
 * - GET /api/v1/crm/user/:userId/history - Get user inquiry history
 * - GET /api/v1/crm/export - Export inquiries as CSV
 * - GET /api/v1/crm/log-stats - Get log file statistics
 */

const express = require('express');
const router = express.Router();
const CRMService = require('../services/crm-service');
const { AppError } = require('../middleware/error-handler');
const { sendSuccess } = require('../utils/response-formatter');

// Initialize CRM Service
let crmService = null;

try {
  crmService = new CRMService();
  console.log('[CRM API] CRM Service initialized');
} catch (error) {
  console.error('[CRM API] Failed to initialize:', error.message);
}

/**
 * POST /api/v1/crm/log-inquiry
 *
 * Log a customer inquiry to JSONL
 *
 * Request body:
 * {
 *   "query": "小朋友幾歲可以學滑雪？",
 *   "intent": "KIDS_SAFETY",
 *   "slots": { "resort": "野澤溫泉" },
 *   "llmResponse": "根據 FAQ...",
 *   "provider": "gemini",
 *   "model": "gemini-2.5-flash",
 *   "tokens": 191,
 *   "cost": 0.0000575,
 *   "responseTime": 850,
 *   "faqMatches": [...],
 *   "sessionId": "sess-123",
 *   "userId": "user-456",
 *   "metadata": {}
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "logged": true
 *   }
 * }
 */
router.post('/log-inquiry', async (req, res, next) => {
  try {
    if (!crmService) {
      throw new AppError('SERVICE_UNAVAILABLE', 'CRM 服務尚未初始化', 503);
    }

    const inquiry = req.body;

    // Validate required fields
    if (!inquiry.query) {
      throw new AppError('INVALID_REQUEST', '缺少必要欄位：query', 400);
    }

    // Log inquiry
    const success = crmService.logInquiry({
      ...inquiry,
      timestamp: new Date().toISOString()
    });

    if (!success) {
      throw new AppError('LOG_FAILED', '記錄查詢失敗', 500);
    }

    sendSuccess(res, {
      logged: true
    }, 201, {
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/crm/inquiries
 *
 * Get inquiry list with filtering
 *
 * Query params:
 * - limit: Number of results (default: 100)
 * - intent: Filter by intent
 * - start_date: Filter by start date (ISO string)
 * - end_date: Filter by end date (ISO string)
 * - user_id: Filter by user ID
 *
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "timestamp": "2025-10-13T...",
 *       "query_text": "...",
 *       "intent_detected": "INSTRUCTOR",
 *       ...
 *     }
 *   ]
 * }
 */
router.get('/inquiries', async (req, res, next) => {
  try {
    if (!crmService) {
      throw new AppError('SERVICE_UNAVAILABLE', 'CRM 服務尚未初始化', 503);
    }

    const {
      limit = 100,
      intent,
      start_date: startDate,
      end_date: endDate,
      user_id: userId
    } = req.query;

    const inquiries = crmService.readInquiries({
      limit: parseInt(limit, 10),
      intent,
      startDate,
      endDate,
      userId
    });

    sendSuccess(res, inquiries, 200, {
      timestamp: new Date().toISOString(),
      count: inquiries.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/crm/stats
 *
 * Get inquiry statistics
 *
 * Query params:
 * - intent: Filter by intent
 * - start_date: Filter by start date
 * - end_date: Filter by end date
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "totalInquiries": 150,
 *     "intentDistribution": {
 *       "INSTRUCTOR": 45,
 *       "BOOKING": 30,
 *       ...
 *     },
 *     "avgResponseTime": 850,
 *     "totalCost": "0.015000",
 *     "providerDistribution": {
 *       "gemini": 100,
 *       "claude": 50
 *     }
 *   }
 * }
 */
router.get('/stats', async (req, res, next) => {
  try {
    if (!crmService) {
      throw new AppError('SERVICE_UNAVAILABLE', 'CRM 服務尚未初始化', 503);
    }

    const {
      intent,
      start_date: startDate,
      end_date: endDate
    } = req.query;

    const stats = crmService.getInquiryStats({
      intent,
      startDate,
      endDate
    });

    if (!stats) {
      throw new AppError('STATS_FAILED', '取得統計資料失敗', 500);
    }

    sendSuccess(res, stats, 200, {
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/crm/popular-queries/:intent
 *
 * Get popular queries for a specific intent
 *
 * Path params:
 * - intent: Intent type (INSTRUCTOR, BOOKING, etc.)
 *
 * Query params:
 * - limit: Number of results (default: 10)
 *
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "text": "教練費用多少？",
 *       "count": 15,
 *       "avgResponseTime": 750,
 *       "avgCost": "0.000050"
 *     }
 *   ]
 * }
 */
router.get('/popular-queries/:intent', async (req, res, next) => {
  try {
    if (!crmService) {
      throw new AppError('SERVICE_UNAVAILABLE', 'CRM 服務尚未初始化', 503);
    }

    const { intent } = req.params;
    const { limit = 10 } = req.query;

    const queries = crmService.getPopularQueriesByIntent(
      intent,
      parseInt(limit, 10)
    );

    sendSuccess(res, queries, 200, {
      timestamp: new Date().toISOString(),
      intent
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/crm/user/:userId/history
 *
 * Get user's inquiry history
 *
 * Path params:
 * - userId: User ID
 *
 * Query params:
 * - limit: Number of results (default: 50)
 *
 * Response:
 * {
 *   "success": true,
 *   "data": [...]
 * }
 */
router.get('/user/:userId/history', async (req, res, next) => {
  try {
    if (!crmService) {
      throw new AppError('SERVICE_UNAVAILABLE', 'CRM 服務尚未初始化', 503);
    }

    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const history = crmService.getUserHistory(userId, parseInt(limit, 10));

    sendSuccess(res, history, 200, {
      timestamp: new Date().toISOString(),
      userId,
      count: history.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/crm/export
 *
 * Export inquiries as CSV
 *
 * Query params:
 * - intent: Filter by intent
 * - start_date: Filter by start date
 * - end_date: Filter by end date
 *
 * Response: CSV file download
 */
router.get('/export', async (req, res, next) => {
  try {
    if (!crmService) {
      throw new AppError('SERVICE_UNAVAILABLE', 'CRM 服務尚未初始化', 503);
    }

    const {
      intent,
      start_date: startDate,
      end_date: endDate
    } = req.query;

    const csv = crmService.exportAsCSV({
      intent,
      startDate,
      endDate
    });

    const filename = `crm-inquiries-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/crm/log-stats
 *
 * Get JSONL log file statistics
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "filePath": "/path/to/customer_inquiries.jsonl",
 *     "fileSizeBytes": 123456,
 *     "fileSizeMB": "0.12",
 *     "lineCount": 150,
 *     "lastModified": "2025-10-13T..."
 *   }
 * }
 */
router.get('/log-stats', async (req, res, next) => {
  try {
    if (!crmService) {
      throw new AppError('SERVICE_UNAVAILABLE', 'CRM 服務尚未初始化', 503);
    }

    const stats = crmService.getLogStats();

    if (!stats) {
      throw new AppError('STATS_FAILED', '取得日誌統計失敗', 500);
    }

    sendSuccess(res, stats, 200, {
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
