/**
 * Park FAQ Cards Routes
 *
 * Handles park FAQ card retrieval and analytics tracking
 * - GET /api/v1/park-faq/cards - Get FAQ cards for a specific park with language support
 * - POST /api/v1/park-faq/track-card-view - Track card view/click events
 *
 * Version: 1.0 (2025-11-15)
 */

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { formatSuccess, formatError, sendSuccess, sendError } = require('../utils/response-formatter');
const { AppError } = require('../middleware/error-handler');
const Database = require('better-sqlite3');

// LINUS PRINCIPLE: Single source of truth
// DATA_DIR is set globally in server.js during initialization
// This eliminates path calculation errors and works in both local and production environments
const DATA_DIR = () => global.DATA_DIR;

// Cache park FAQ cards in memory
let parkFaqCards = null;
let parkFaqCardsLoadTime = null;

// Initialize analytics database
let analyticsDb = null;

/**
 * Load park FAQ cards from JSON file
 * Caches data in memory with 30-minute TTL
 */
async function loadParkFaqCards() {
  const now = Date.now();
  const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  // Return cached data if still valid
  if (parkFaqCards && parkFaqCardsLoadTime && (now - parkFaqCardsLoadTime) < CACHE_TTL) {
    return parkFaqCards;
  }

  try {
    const cardsPath = path.join(DATA_DIR(), 'park_faq_cards.json');
    console.log('[Park FAQ] Reading cards file:', cardsPath);
    const data = await fs.readFile(cardsPath, 'utf8');
    parkFaqCards = JSON.parse(data);
    parkFaqCardsLoadTime = now;

    console.log(`[Park FAQ] Loaded ${parkFaqCards.cards?.length || 0} cards from cache`);
    return parkFaqCards;
  } catch (error) {
    console.error('[Park FAQ] Error loading park FAQ cards:', error);
    throw new AppError(`Failed to load park FAQ cards: ${error.message}`, 500);
  }
}

/**
 * Get analytics database connection
 */
function getAnalyticsDb() {
  if (!analyticsDb) {
    const dbPath = path.join(DATA_DIR(), 'analytics.db');
    analyticsDb = new Database(dbPath);
  }
  return analyticsDb;
}

/**
 * Extract language-specific content from a card
 * @param {Object} card - Card with multi-language content
 * @param {string} language - Target language (zh, en, th)
 * @returns {Object} Card with language-specific content
 */
function extractLanguageContent(card, language = 'zh') {
  return {
    id: card.id,
    park_slug: card.park_slug,
    park_cname: card.park_cname,
    question: card.question[language] || card.question.zh,
    answer: card.answer[language] || card.answer.zh,
    tags: card.tags.map(tag => ({
      name: tag[language] || tag.zh
    })),
    source_section: card.source_section,
    click_count: card.click_count,
    translation_status: card.translation_status
  };
}

/**
 * GET /api/v1/park-faq/cards
 *
 * Query parameters:
 * - park_slug: string (required) - Park identifier (e.g., 'appi')
 * - lang: string (optional, default: 'zh') - Language code (zh, en, th)
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "park_slug": "appi",
 *     "park_cname": "安比高原",
 *     "cards": [...],
 *     "available_tags": ["tag1", "tag2", ...],
 *     "total_cards": 10
 *   }
 * }
 */
router.get('/cards', async (req, res, next) => {
  try {
    const { park_slug, lang = 'zh' } = req.query;

    // Validate inputs
    if (!park_slug) {
      return sendError(res, 'INVALID_PARAMS', 'park_slug parameter is required', 400);
    }

    if (!['zh', 'en', 'th'].includes(lang)) {
      return sendError(res, 'INVALID_LANGUAGE', 'Language must be zh, en, or th', 400);
    }

    // Load park FAQ cards
    const faqData = await loadParkFaqCards();

    const normalizedSlug = park_slug.toLowerCase();

    // Filter cards by park (supports fuzzy match with resort_id)
    const parkCards = faqData.cards.filter(card => {
      const slug = (card.park_slug || '').toLowerCase();
      if (!slug) return false;
      return slug === normalizedSlug ||
        normalizedSlug.includes(slug) ||
        slug.includes(normalizedSlug);
    });

    if (parkCards.length === 0) {
      return sendError(res, 'PARK_NOT_FOUND', `No FAQ cards found for park: ${park_slug}`, 404);
    }

    // Extract language-specific content
    const cardsWithLanguage = parkCards.map(card => extractLanguageContent(card, lang));

    // Extract unique tags from this language
    const tagsSet = new Set();
    cardsWithLanguage.forEach(card => {
      card.tags.forEach(tag => {
        tagsSet.add(tag.name);
      });
    });

    // Sort cards by click_count (most clicked first)
    cardsWithLanguage.sort((a, b) => (b.click_count || 0) - (a.click_count || 0));

    // Get park display name
    const parkCard = parkCards[0];
    const parkName = parkCard.park_cname || parkCard.park_slug;

    const response = {
      park_slug,
      park_cname: parkName,
      cards: cardsWithLanguage,
      available_tags: Array.from(tagsSet).sort(),
      total_cards: cardsWithLanguage.length
    };

    sendSuccess(res, response, 200);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/park-faq/track-card-view
 *
 * Track individual card view/click events
 * Body: {
 *   "card_id": "park.appi.001",
 *   "park_slug": "appi",
 *   "language": "zh",
 *   "session_id": "abc123def456",
 *   "source": "park_page" (optional)
 * }
 *
 * This endpoint writes to the analytics.db faq_views table with source='park_faq_card'
 */
router.post('/track-card-view', async (req, res, next) => {
  try {
    const { card_id, park_slug, language = 'zh', session_id, source = 'park_faq_card' } = req.body;

    // Validate inputs
    if (!card_id || !park_slug || !session_id) {
      return sendError(res, 'INVALID_PARAMS',
        'card_id, park_slug, and session_id are required', 400);
    }

    if (!['zh', 'en', 'th'].includes(language)) {
      return sendError(res, 'INVALID_LANGUAGE', 'Language must be zh, en, or th', 400);
    }

    // Write to analytics database
    try {
      const db = getAnalyticsDb();

      // Insert into faq_views table
      // Reuse existing faq_views table with source='park_faq_card'
      const stmt = db.prepare(`
        INSERT INTO faq_views (
          faq_id,
          source,
          language,
          session_id,
          timestamp,
          clicked
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        card_id,
        source,
        language,
        session_id,
        new Date().toISOString(),
        1  // Mark as clicked
      );

      console.log(`[Park FAQ] Tracked card view: ${card_id} (${language})`);

      sendSuccess(res, {
        card_id,
        tracked: true
      }, 200);
    } catch (dbError) {
      console.error('[Park FAQ] Database error:', dbError);
      throw new AppError('Failed to track card view', 500);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/park-faq/track-tag-click
 *
 * Track tag click events (reuses analytics tag_clicks table)
 * Body: {
 *   "tag_name": "初學者",
 *   "card_id": "park.appi.001",
 *   "park_slug": "appi",
 *   "language": "zh",
 *   "session_id": "abc123def456"
 * }
 *
 * This endpoint writes to the analytics.db tag_clicks table with tag_type='park_faq_card'
 */
router.post('/track-tag-click', async (req, res, next) => {
  try {
    const { tag_name, card_id, park_slug, language = 'zh', session_id } = req.body;

    // Validate inputs
    if (!tag_name || !card_id || !park_slug) {
      return sendError(res, 'INVALID_PARAMS',
        'tag_name, card_id, and park_slug are required', 400);
    }

    if (!['zh', 'en', 'th'].includes(language)) {
      return sendError(res, 'INVALID_LANGUAGE', 'Language must be zh, en, or th', 400);
    }

    // Write to analytics database
    try {
      const db = getAnalyticsDb();

      // Insert into tag_clicks table
      const stmt = db.prepare(`
        INSERT INTO tag_clicks (
          tag_type,
          tag_name,
          item_id,
          language,
          timestamp
        ) VALUES (?, ?, ?, ?, ?)
      `);

      stmt.run(
        'park_faq_card',  // tag_type
        tag_name,
        card_id,
        language,
        new Date().toISOString()
      );

      console.log(`[Park FAQ] Tracked tag click: ${tag_name} on ${card_id} (${language})`);

      sendSuccess(res, {
        tag_name,
        card_id,
        tracked: true
      }, 200);
    } catch (dbError) {
      console.error('[Park FAQ] Database error:', dbError);
      throw new AppError('Failed to track tag click', 500);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/park-faq/stats
 *
 * Get analytics statistics for a park
 * Query parameters:
 * - park_slug: string (required)
 * - language: string (optional, default: 'zh')
 * - start_date: string (optional) - ISO date format
 * - end_date: string (optional) - ISO date format
 */
router.get('/stats', async (req, res, next) => {
  try {
    const { park_slug, language = 'zh', start_date, end_date } = req.query;

    if (!park_slug) {
      return sendError(res, 'INVALID_PARAMS', 'park_slug parameter is required', 400);
    }

    try {
      const db = getAnalyticsDb();

      // Get card view counts
      let cardViewsStmt = `
        SELECT
          faq_id as card_id,
          COUNT(*) as view_count,
          SUM(CASE WHEN clicked = 1 THEN 1 ELSE 0 END) as click_count
        FROM faq_views
        WHERE source = 'park_faq_card'
          AND faq_id LIKE ?
      `;

      const params = [`${park_slug}%`];

      if (language && language !== 'all') {
        cardViewsStmt += ` AND language = ?`;
        params.push(language);
      }

      if (start_date) {
        cardViewsStmt += ` AND timestamp >= ?`;
        params.push(start_date);
      }

      if (end_date) {
        cardViewsStmt += ` AND timestamp <= ?`;
        params.push(end_date);
      }

      cardViewsStmt += ` GROUP BY faq_id ORDER BY view_count DESC`;

      const cardViews = db.prepare(cardViewsStmt).all(...params);

      // Get tag click statistics
      let tagClicksStmt = `
        SELECT
          tag_name,
          COUNT(*) as click_count
        FROM tag_clicks
        WHERE tag_type = 'park_faq_card'
          AND item_id LIKE ?
      `;

      const tagParams = [`${park_slug}%`];

      if (language && language !== 'all') {
        tagClicksStmt += ` AND language = ?`;
        tagParams.push(language);
      }

      if (start_date) {
        tagClicksStmt += ` AND timestamp >= ?`;
        tagParams.push(start_date);
      }

      if (end_date) {
        tagClicksStmt += ` AND timestamp <= ?`;
        tagParams.push(end_date);
      }

      tagClicksStmt += ` GROUP BY tag_name ORDER BY click_count DESC`;

      const tagClicks = db.prepare(tagClicksStmt).all(...tagParams);

      sendSuccess(res, {
        park_slug,
        card_views: cardViews,
        tag_clicks: tagClicks,
        period: {
          start_date: start_date || 'all',
          end_date: end_date || 'all'
        }
      }, 200);
    } catch (dbError) {
      console.error('[Park FAQ] Database error:', dbError);
      throw new AppError('Failed to retrieve statistics', 500);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * Graceful shutdown: Close analytics database connection
 */
process.on('exit', () => {
  if (analyticsDb) {
    try {
      analyticsDb.close();
      console.log('[Park FAQ] Analytics database connection closed');
    } catch (error) {
      console.error('[Park FAQ] Error closing database:', error);
    }
  }
});

module.exports = router;
