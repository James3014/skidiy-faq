/**
 * FAQ Admin Routes
 *
 * Handles FAQ CRUD operations for admin panel
 * - GET    /api/v1/admin/faq           - List FAQs (with pagination, search, filters)
 * - GET    /api/v1/admin/faq/:id       - Get single FAQ
 * - POST   /api/v1/admin/faq           - Create new FAQ
 * - PUT    /api/v1/admin/faq/:id       - Update FAQ
 * - PATCH  /api/v1/admin/faq/:id/hot   - Toggle hot flag
 * - DELETE /api/v1/admin/faq/:id       - Delete FAQ
 * - POST   /api/v1/admin/faq/batch     - Batch operations
 */

const express = require('express');
const router = express.Router();
const FAQService = require('../services/faq-service');
const { sendSuccess, sendError } = require('../utils/response-formatter');
const { AppError } = require('../middleware/error-handler');

// Initialize FAQ service
const faqService = new FAQService();

/**
 * GET /api/v1/admin/faq
 * List FAQs with pagination, search, and filters
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      intent,
      section,
      hot,
      sort = 'created_at',
      order = 'desc'
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

    // Get FAQ list
    const result = await faqService.listFAQs({
      page: pageNum,
      limit: limitNum,
      search,
      intent: intent ? intent.split(',') : null,
      section,
      hot: hot === 'true' ? true : hot === 'false' ? false : null,
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
 * GET /api/v1/admin/faq/:id
 * Get single FAQ by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const faq = await faqService.getFAQById(id);

    if (!faq) {
      throw new AppError('FAQ_NOT_FOUND', '找不到指定的 FAQ', 404, { faq_id: id });
    }

    sendSuccess(res, faq, 200, {
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/admin/faq
 * Create new FAQ
 */
router.post('/', async (req, res, next) => {
  try {
    const faqData = req.body;

    // Validate FAQ data
    faqService.validateFAQData(faqData);

    // Check if ID already exists
    const existing = await faqService.getFAQById(faqData.id);
    if (existing) {
      throw new AppError('FAQ_ID_EXISTS', 'FAQ ID 已存在', 409, {
        faq_id: faqData.id,
        existing_question: existing.canonical_question
      });
    }

    // Create FAQ
    const result = await faqService.createFAQ(faqData);

    sendSuccess(res, result, 201, {
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/admin/faq/:id
 * Update FAQ
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const faqData = req.body;

    // Validate FAQ data
    faqService.validateFAQData(faqData);

    // Check if FAQ exists
    const existing = await faqService.getFAQById(id);
    if (!existing) {
      throw new AppError('FAQ_NOT_FOUND', '找不到指定的 FAQ', 404, { faq_id: id });
    }

    // Ensure ID in body matches URL param
    if (faqData.id && faqData.id !== id) {
      throw new AppError('ID_MISMATCH', 'FAQ ID 與 URL 參數不符', 400, {
        url_id: id,
        body_id: faqData.id
      });
    }

    // Update FAQ
    const result = await faqService.updateFAQ(id, faqData);

    sendSuccess(res, result, 200, {
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/admin/faq/:id/hot
 * Toggle hot flag
 */
router.patch('/:id/hot', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { hot } = req.body;

    if (typeof hot !== 'boolean') {
      throw new AppError('INVALID_HOT_VALUE', 'hot 參數必須是布林值', 400);
    }

    // Check if FAQ exists
    const existing = await faqService.getFAQById(id);
    if (!existing) {
      throw new AppError('FAQ_NOT_FOUND', '找不到指定的 FAQ', 404, { faq_id: id });
    }

    // Update hot flag
    const result = await faqService.updateHotFlag(id, hot);

    sendSuccess(res, result, 200, {
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/admin/faq/:id
 * Delete FAQ (requires confirmation)
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { confirm } = req.query;

    // Require confirmation
    if (confirm !== 'true') {
      throw new AppError('MISSING_CONFIRMATION', '刪除操作需要確認參數 confirm=true', 400);
    }

    // Check if FAQ exists
    const existing = await faqService.getFAQById(id);
    if (!existing) {
      throw new AppError('FAQ_NOT_FOUND', '找不到指定的 FAQ', 404, { faq_id: id });
    }

    // Delete FAQ
    const result = await faqService.deleteFAQ(id);

    sendSuccess(res, result, 200, {
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/admin/faq/batch
 * Batch operations (delete, mark_hot, unmark_hot)
 */
router.post('/batch', async (req, res, next) => {
  try {
    const { operation, ids, confirm } = req.body;

    // Validate operation
    const validOperations = ['delete', 'mark_hot', 'unmark_hot'];
    if (!validOperations.includes(operation)) {
      throw new AppError('INVALID_OPERATION', '無效的批次操作類型', 400, {
        operation,
        valid_operations: validOperations
      });
    }

    // Validate IDs
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError('INVALID_IDS', 'ids 必須是非空陣列', 400);
    }

    // Require confirmation for delete
    if (operation === 'delete' && confirm !== true) {
      throw new AppError('MISSING_CONFIRMATION', '刪除操作需要確認參數 confirm=true', 400);
    }

    // Execute batch operation
    const result = await faqService.batchOperation(operation, ids);

    sendSuccess(res, result, 200, {
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
