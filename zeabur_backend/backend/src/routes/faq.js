/**
 * FAQ Routes
 *
 * Handles FAQ search and retrieval endpoints
 * - POST /api/v1/faq/search - Search FAQs with query string
 * - GET /api/v1/faq/:faq_id - Get specific FAQ by ID
 *
 * Version: 2.0 (Force Zeabur rebuild - 2025-11-13)
 */

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { formatSuccess, formatError, sendSuccess, sendError } = require('../utils/response-formatter');
const { AppError } = require('../middleware/error-handler');

// Cache FAQ data in memory (T031: FAQ data loading)
let faqData = null;
let faqDataLoadTime = null;

/**
 * LINUS PRINCIPLE: Transform FAQ data to simplified API format
 * Phase 4.5: Simplified transformation - assumes data is already in correct format
 *
 * @param {Object} faq - Raw FAQ item from faq_kb.phase0a.json
 * @param {string} language - Target language (zh, en, th)
 * @returns {Object} Simplified FAQ item for API response
 */
function transformToSimplifiedFormat(faq, language = 'zh') {
  const template = faq.answer_template || {};

  // Get localized question
  const questionField = language !== 'zh' ? `canonical_question_${language}` : 'canonical_question';
  const question = faq[questionField] || faq.canonical_question || '';

  // Get localized answer (text field is already composed in data source)
  // Fallback to summary if text is empty (backward compatibility)
  const answer = template.text_translations?.[language] || template.text || template.summary || '';

  // Get tip (optional, for extra context)
  const tip = template.tip_translations?.[language] || template.tip || '';

  // Get postscript
  const postscript = template.postscript_translations?.[language] || template.postscript || '';

  // Return simplified structure
  return {
    id: faq.id,
    content: {
      question: question || '',
      answer: answer,
      tip: tip,
      postscript: postscript
    },
    metadata: {
      intent: faq.intent || '',
      section: faq.section || '',
      section_en: faq.section_translations?.en || '',
      section_th: faq.section_translations?.th || '',
      crm_tags: faq.crm_tags || [],
      keywords: faq.keywords || [],
      hot: faq.hot || false
    }
  };
}

/**
 * Load FAQ data from faq_kb.phase0a.json
 * T031: Implement faq_kb.phase0a.json loading logic
 *
 * @returns {Promise<Object>} FAQ knowledge base data
 */
async function loadFAQData() {
  // Use cache if available and less than 5 minutes old
  if (faqData && faqDataLoadTime && (Date.now() - faqDataLoadTime) < 5 * 60 * 1000) {
    return faqData;
  }

  // LINUS PRINCIPLE: Try the most reliable source first
  // Priority 1: Load from JSON file (deployed separately, most likely to have full data)
  try {
    const dataPath = path.join(__dirname, '../../../data/faq_kb.phase0a.json');
    const content = await fs.readFile(dataPath, 'utf-8');
    faqData = JSON.parse(content);
    faqDataLoadTime = Date.now();

    // Validate structure and content
    if (!faqData.items || !Array.isArray(faqData.items)) {
      throw new Error('Invalid FAQ data structure: missing items array');
    }

    const itemsWithContent = faqData.items.filter(item =>
      item.answer_template?.text || item.answer_template?.summary || item.answer_template?.details
    ).length;

    console.log(`[FAQ Routes] Loaded ${faqData.items.length} FAQ items from JSON file (${itemsWithContent} with content)`);

    // Only use this if it has substantial content
    if (itemsWithContent > 50) {
      return faqData;
    } else {
      console.warn(`[FAQ Routes] JSON file has too few FAQ items with content (${itemsWithContent}/71), trying JS module...`);
      throw new Error('Insufficient content in JSON file');
    }
  } catch (jsonError) {
    // Priority 2: Fallback to bundled JS module
    console.warn(`[FAQ Routes] Failed to load from JSON file, trying JS module:`, jsonError.message);
    try {
      const fallbackPath = path.join(__dirname, '../data/faq_kb.js');
      delete require.cache[require.resolve(fallbackPath)]; // Clear cache
      faqData = require(fallbackPath);
      faqDataLoadTime = Date.now();

      if (!faqData.items || !Array.isArray(faqData.items)) {
        throw new Error('Invalid FAQ data structure: missing items array');
      }

      console.log(`[FAQ Routes] Loaded ${faqData.items.length} FAQ items from bundled JS module`);
      return faqData;
    } catch (jsError) {
      console.error('[FAQ Routes] Both load attempts failed:', jsonError, jsError);
      throw new AppError('FAQ_LOAD_ERROR', 'Failed to load FAQ data', 500);
    }
  }
}

/**
 * POST /api/v1/faq/search
 * T030: Create FAQ search endpoint
 * T033: Add response time measurement
 *
 * Search FAQs using simple text matching
 * (Frontend uses Fuse.js for fuzzy matching, backend provides data endpoint)
 *
 * Request body:
 * {
 *   "query": "教練",
 *   "language": "zh",
 *   "limit": 5,
 *   "threshold": 0.6
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "results": [...],
 *     "total": 5
 *   },
 *   "meta": {
 *     "timestamp": "...",
 *     "query_id": "...",
 *     "response_time_ms": 45
 *   }
 * }
 */
router.post('/search', async (req, res, next) => {
  // T033: Start timing
  const startTime = Date.now();

  try {
    const { query, language = 'zh', limit = 5, threshold = 0.6 } = req.body;

    // Validation
    if (!query || query.trim().length === 0) {
      throw new AppError('INVALID_QUERY', '查詢文字不得為空', 400);
    }

    if (query.length > 200) {
      throw new AppError('QUERY_TOO_LONG', '查詢文字過長（最多 200 字元）', 400);
    }

    if (limit < 1 || limit > 50) {
      throw new AppError('INVALID_LIMIT', '結果數量必須在 1-50 之間', 400);
    }

    // Load FAQ data
    const data = await loadFAQData();

    // Simple text matching for backend endpoint
    // Frontend will use Fuse.js for better fuzzy matching
    const queryLower = query.toLowerCase().trim();

    const results = data.items
      .map(item => {
        const simplified = transformToSimplifiedFormat(item, language);
        const question = simplified.content.question;
        const answer = simplified.content.answer;

        // Calculate simple match score
        let score = 0;

        // Exact match in question
        if (question && question.toLowerCase().includes(queryLower)) {
          score += 0.5;
        }

        // Match in utterance patterns
        if (item.utterance_patterns && Array.isArray(item.utterance_patterns)) {
          const hasMatch = item.utterance_patterns.some(pattern =>
            pattern && pattern.toLowerCase().includes(queryLower)
          );
          if (hasMatch) score += 0.3;
        }

        // Match in answer
        if (answer && answer.toLowerCase().includes(queryLower)) {
          score += 0.1;
        }

        // Match in keywords (if available)
        if (item.keywords && Array.isArray(item.keywords)) {
          const hasMatch = item.keywords.some(keyword =>
            keyword.toLowerCase().includes(queryLower)
          );
          if (hasMatch) score += 0.1;
        }

        return {
          item: simplified,
          score,
          question,
          answer
        };
      })
      .filter(result => result.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(result => ({
        ...result.item,
        score: result.score,
        confidence: Math.round((result.score) * 100),
        answer_preview: result.answer.substring(0, 150) + (result.answer.length > 150 ? '...' : '')
      }));

    // T033: Calculate response time
    const responseTimeMs = Date.now() - startTime;

    // Generate query ID
    const queryId = `q_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    sendSuccess(res, {
      results,
      total: results.length,
      query: query,
      language: language
    }, 200, {
      timestamp: new Date().toISOString(),
      query_id: queryId,
      response_time_ms: responseTimeMs
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/faq/all
 * Get all FAQ data for frontend initialization
 *
 * Returns the complete FAQ knowledge base with unified answer_template.text field
 * LINUS PRINCIPLE: Transform data at API layer for frontend compatibility
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "items": [...],
 *     "metadata": {...}
 *   }
 * }
 */
router.get('/all', async (req, res, next) => {
  try {
    const data = await loadFAQData();
    const language = req.query.lang || 'zh';

    // Phase 4.1: Transform to simplified format
    // API layer now handles all composition and localization
    const simplifiedItems = (data.items || []).map(item =>
      transformToSimplifiedFormat(item, language)
    );

    sendSuccess(res, {
      items: simplifiedItems,
      metadata: data.metadata || data.meta || {},
      total: simplifiedItems.length
    }, 200, {
      timestamp: new Date().toISOString(),
      'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/faq/:faq_id
 * T032: Get specific FAQ by ID
 *
 * Retrieve full FAQ details by ID with simplified format
 * Phase 4.1: Use simplified format (content + metadata)
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "faq.booking.001",
 *     "content": {
 *       "question": "...",
 *       "answer": "...",
 *       "tip": "...",
 *       "postscript": "..."
 *     },
 *     "metadata": {...}
 *   },
 *   "meta": {
 *     "timestamp": "..."
 *   }
 * }
 */
router.get('/:faq_id', async (req, res, next) => {
  try {
    const { faq_id } = req.params;
    const { language = 'zh' } = req.query;

    // Load FAQ data
    const data = await loadFAQData();

    // Find FAQ by ID
    const faqItem = data.items.find(item => item.id === faq_id);

    if (!faqItem) {
      throw new AppError('FAQ_NOT_FOUND', '找不到指定的 FAQ', 404);
    }

    // Phase 4.1: Use simplified format
    const simplifiedItem = transformToSimplifiedFormat(faqItem, language);

    sendSuccess(res, simplifiedItem, 200, {
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/faq
 * Get all FAQs (for debugging/testing)
 *
 * Query params:
 * - intent: Filter by intent
 * - section: Filter by section
 * - limit: Maximum results
 */
router.get('/', async (req, res, next) => {
  try {
    const { intent, section, limit = 100 } = req.query;

    // Load FAQ data
    const data = await loadFAQData();

    let results = data.items;

    // Apply filters
    if (intent) {
      results = results.filter(item => item.intent === intent);
    }

    if (section) {
      results = results.filter(item => item.section === section);
    }

    // Apply limit
    results = results.slice(0, parseInt(limit));

    sendSuccess(res, {
      items: results,
      total: results.length,
      metadata: data.metadata || data.meta || {}
    }, 200, {
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

// DEBUG: Check which file is actually being loaded
router.get('/debug/file-info', async (req, res, next) => {
  try {
    const dataPath = path.join(__dirname, '../../../data/faq_kb.phase0a.json');
    const fs = require('fs').promises;

    const stats = await fs.stat(dataPath);
    const content = await fs.readFile(dataPath, 'utf-8');
    const data = JSON.parse(content);

    res.json({
      success: true,
      data: {
        filePath: dataPath,
        fileSize: stats.size,
        fileModified: stats.mtime,
        faqCount: data.items?.length || 0,
        firstFAQ: {
          id: data.items?.[0]?.id,
          question: data.items?.[0]?.canonical_question?.substring(0, 50),
          tags: data.items?.[0]?.crm_tags
        }
      }
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
