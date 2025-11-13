/**
 * Intent Detection API Routes
 *
 * Endpoints:
 * - POST /api/v1/intent/detect - Detect intent from query
 * - POST /api/v1/intent/extract-slots - Extract slots from query
 * - POST /api/v1/intent/analyze - Combined intent detection + slot extraction
 */

const express = require('express');
const router = express.Router();
const IntentDetector = require('../services/intent-detector');
const SlotExtractor = require('../services/slot-extractor');
const { AppError } = require('../middleware/error-handler');
const { sendSuccess } = require('../utils/response-formatter');
const Fuse = require('fuse.js');
const fs = require('fs');
const path = require('path');

// Initialize services
const intentDetector = new IntentDetector();
const slotExtractor = new SlotExtractor();
let faqData = null;
let fuseInstance = null;

// Load FAQ data for context-aware intent detection
function loadFAQData() {
  // Use phase0a version (includes translations); legacy exports are read-only backups
  const faqPath = path.join(__dirname, '../../../data/faq_kb.phase0a.json');
  if (fs.existsSync(faqPath)) {
    const rawData = fs.readFileSync(faqPath, 'utf8');
    faqData = JSON.parse(rawData);

    // Initialize Fuse for FAQ matching
    fuseInstance = new Fuse(faqData.items, {
      keys: [
        { name: 'canonical_question', weight: 0.4 },
        { name: 'utterance_patterns', weight: 0.3 },
        { name: 'intent', weight: 0.2 }
      ],
      threshold: 0.6,
      ignoreLocation: true,
      includeScore: true
    });

    console.log('[Intent API] FAQ data loaded for context-aware detection');
  }
}

// Initialize on module load
(async () => {
  try {
    await intentDetector.initialize();
    await slotExtractor.initialize();
    loadFAQData();
    console.log('[Intent API] Services initialized successfully');
  } catch (error) {
    console.error('[Intent API] Initialization failed:', error);
  }
})();

/**
 * POST /api/v1/intent/detect
 *
 * Detect intent from user query
 *
 * Request body:
 * {
 *   "query": "我想訂野澤溫泉的教練課",
 *   "threshold": 0.3,
 *   "contextual": true
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "intent": "INSTRUCTOR",
 *     "confidence": 0.85,
 *     "scores": { "INSTRUCTOR": 0.85, "BOOKING": 0.45, ... },
 *     "detectedIntents": [
 *       { "intent": "INSTRUCTOR", "confidence": 0.85 },
 *       { "intent": "BOOKING", "confidence": 0.45 }
 *     ],
 *     "query": "我想訂野澤溫泉的教練課"
 *   },
 *   "meta": {
 *     "timestamp": "2025-10-13T...",
 *     "response_time_ms": 15
 *   }
 * }
 */
router.post('/detect', async (req, res, next) => {
  const startTime = Date.now();

  try {
    const { query, threshold = 0.3, contextual = true } = req.body;

    // Validation
    if (!query || query.trim().length === 0) {
      throw new AppError('INVALID_QUERY', '查詢文字不得為空', 400);
    }

    if (query.length > 500) {
      throw new AppError('QUERY_TOO_LONG', '查詢文字過長（最多 500 字元）', 400);
    }

    // Get FAQ matches if contextual detection is enabled
    let faqMatches = [];
    if (contextual && fuseInstance) {
      faqMatches = fuseInstance.search(query, { limit: 5 });
    }

    // Detect intent
    const result = await intentDetector.detectIntent(query, {
      faqMatches,
      threshold
    });

    const responseTimeMs = Date.now() - startTime;

    sendSuccess(res, result, 200, {
      timestamp: new Date().toISOString(),
      response_time_ms: responseTimeMs
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/intent/extract-slots
 *
 * Extract slots from user query
 *
 * Request body:
 * {
 *   "query": "2月15日去野澤，2大1小，想學滑雪"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "slots": {
 *       "date": "2025-02-15",
 *       "resort": "野澤溫泉",
 *       "people_total": 3,
 *       "board_type": "SKI"
 *     },
 *     "validation": {
 *       "valid": true,
 *       "errors": []
 *     },
 *     "query": "2月15日去野澤，2大1小，想學滑雪"
 *   }
 * }
 */
router.post('/extract-slots', async (req, res, next) => {
  const startTime = Date.now();

  try {
    const { query } = req.body;

    // Validation
    if (!query || query.trim().length === 0) {
      throw new AppError('INVALID_QUERY', '查詢文字不得為空', 400);
    }

    // Extract slots
    const slots = await slotExtractor.extract(query);

    // Validate extracted slots
    const validation = slotExtractor.validateSlots(slots);

    const responseTimeMs = Date.now() - startTime;

    sendSuccess(res, {
      slots,
      validation,
      query
    }, 200, {
      timestamp: new Date().toISOString(),
      response_time_ms: responseTimeMs
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/intent/analyze
 *
 * Combined intent detection + slot extraction
 * This is the recommended endpoint for complete query analysis
 *
 * Request body:
 * {
 *   "query": "2月15日去野澤，2大1小，想訂教練課",
 *   "threshold": 0.3,
 *   "contextual": true
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "query": "2月15日去野澤，2大1小，想訂教練課",
 *     "intent": {
 *       "primary": "INSTRUCTOR",
 *       "confidence": 0.9,
 *       "all": [
 *         { "intent": "INSTRUCTOR", "confidence": 0.9 },
 *         { "intent": "BOOKING", "confidence": 0.6 }
 *       ]
 *     },
 *     "slots": {
 *       "date": "2025-02-15",
 *       "resort": "野澤溫泉",
 *       "people_total": 3
 *     },
 *     "recommendations": [
 *       {
 *         "faq_id": "faq.instructor.001",
 *         "question": "如何預約教練課程？",
 *         "confidence": 0.95
 *       }
 *     ]
 *   }
 * }
 */
router.post('/analyze', async (req, res, next) => {
  const startTime = Date.now();

  try {
    const { query, threshold = 0.3, contextual = true } = req.body;

    // Validation
    if (!query || query.trim().length === 0) {
      throw new AppError('INVALID_QUERY', '查詢文字不得為空', 400);
    }

    // Step 1: Extract slots
    const slots = await slotExtractor.extract(query);

    // Step 2: Get FAQ matches
    let faqMatches = [];
    if (contextual && fuseInstance) {
      faqMatches = fuseInstance.search(query, { limit: 5 });
    }

    // Step 3: Detect intent (with slot context)
    const intentResult = await intentDetector.detectIntent(query, {
      faqMatches,
      slots,
      threshold
    });

    // Step 4: Generate recommendations
    const recommendations = faqMatches
      .filter(match => match.score < 0.3) // Lower score = better match in Fuse
      .slice(0, 3)
      .map(match => ({
        faq_id: match.item.id,
        question: match.item.canonical_question,
        confidence: Math.round((1 - match.score) * 100) / 100,
        intent: match.item.intent
      }));

    const responseTimeMs = Date.now() - startTime;

    sendSuccess(res, {
      query,
      intent: {
        primary: intentResult.intent,
        confidence: intentResult.confidence,
        all: intentResult.detectedIntents
      },
      slots,
      recommendations
    }, 200, {
      timestamp: new Date().toISOString(),
      response_time_ms: responseTimeMs
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/intent/metadata
 *
 * Get available intents and their metadata
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "intents": ["ITINERARY", "SERVICE", "COURSE", ...],
 *     "intent_details": {
 *       "ITINERARY": {
 *         "keywords": ["行程", "規劃", ...],
 *         "weight": 1.0,
 *         "priority": 1
 *       },
 *       ...
 *     },
 *     "supported_slots": ["resort", "date", "people_total", "board_type", "children_ages"],
 *     "supported_resorts": ["野澤溫泉", "白馬", ...]
 *   }
 * }
 */
router.get('/metadata', async (req, res, next) => {
  try {
    const intents = intentDetector.getAllIntents();
    const intentDetails = {};

    for (const intent of intents) {
      intentDetails[intent] = intentDetector.getIntentMetadata(intent);
    }

    const supportedResorts = slotExtractor.getAllResorts();

    sendSuccess(res, {
      intents,
      intent_details: intentDetails,
      supported_slots: ['resort', 'date', 'people_total', 'board_type', 'children_ages'],
      supported_resorts: supportedResorts
    }, 200, {
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
