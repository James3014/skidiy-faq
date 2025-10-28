/**
 * Resort Admin Routes
 *
 * Handles Resort CRUD operations for admin panel
 * - GET    /api/v1/admin/resort           - List resorts (with pagination, search, filters)
 * - GET    /api/v1/admin/resort/:id       - Get single resort
 * - PUT    /api/v1/admin/resort/:id       - Update resort
 * - GET    /api/v1/admin/resort/stats     - Get statistics
 * - GET    /api/v1/admin/resort/regions   - Get unique regions
 * - GET    /api/v1/admin/resort/prefectures - Get unique prefectures
 */

const express = require('express');
const router = express.Router();
const ResortService = require('../services/resort-service');
const { sendSuccess, sendError } = require('../utils/response-formatter');
const { AppError } = require('../middleware/error-handler');

// Initialize Resort service
const resortService = new ResortService();

/**
 * GET /api/v1/admin/resort
 * List resorts with pagination, search, and filters
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      region,
      prefecture,
      night_ski,
      sort = 'resort_id',
      order = 'asc'
    } = req.query;

    // Validate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (pageNum < 1) {
      throw new AppError('INVALID_PAGE', '頁碼必須大於 0', 400);
    }

    if (limitNum < 1 || limitNum > 100) {
      throw new AppError('INVALID_LIMIT', '結果數量必須在 1-100 之間', 400);
    }

    // Parse region array if present
    let regionArray = null;
    if (region) {
      regionArray = Array.isArray(region) ? region : region.split(',');
    }

    // Parse night_ski boolean
    let nightSkiBool = null;
    if (night_ski === 'true') nightSkiBool = true;
    if (night_ski === 'false') nightSkiBool = false;

    // Get resort list
    const result = await resortService.listResorts({
      page: pageNum,
      limit: limitNum,
      search,
      region: regionArray,
      prefecture,
      night_ski: nightSkiBool,
      sort,
      order
    });

    sendSuccess(res, result, 200, {
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/admin/resort/stats
 * Get resort statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await resortService.getStatistics();

    sendSuccess(res, { statistics: stats }, 200, {
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/admin/resort/regions
 * Get unique regions for filtering
 */
router.get('/regions', async (req, res, next) => {
  try {
    const regions = await resortService.getRegions();

    sendSuccess(res, { regions }, 200, {
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/admin/resort/prefectures
 * Get unique prefectures for filtering
 */
router.get('/prefectures', async (req, res, next) => {
  try {
    const prefectures = await resortService.getPrefectures();

    sendSuccess(res, { prefectures }, 200, {
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/admin/resort/:id
 * Get single resort by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const resort = await resortService.getResortById(id);

    if (!resort) {
      throw new AppError('RESORT_NOT_FOUND', '找不到指定的雪場', 404, { resort_id: id });
    }

    sendSuccess(res, resort, 200, {
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/admin/resort/:id
 * Update resort
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const resortData = req.body;

    // Validate resort data
    resortService.validateResortData(resortData);

    // Check if resort exists
    const existing = await resortService.getResortById(id);
    if (!existing) {
      throw new AppError('RESORT_NOT_FOUND', '找不到指定的雪場', 404, { resort_id: id });
    }

    // Ensure ID in body matches URL param
    if (resortData.resort_id && resortData.resort_id !== id) {
      throw new AppError('ID_MISMATCH', 'Resort ID 與 URL 參數不符', 400, {
        url_id: id,
        body_id: resortData.resort_id
      });
    }

    // Update resort
    const result = await resortService.updateResort(id, resortData);

    sendSuccess(res, result, 200, {
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
