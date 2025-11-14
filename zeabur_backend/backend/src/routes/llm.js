/**
 * LLM API Routes
 *
 * Endpoints:
 * - POST /api/v1/llm/chat - Generate answer using RAG
 * - POST /api/v1/llm/chat/stream - Stream answer using RAG
 * - POST /api/v1/llm/suggestions - Get FAQ suggestions without LLM
 * - GET /api/v1/llm/providers - List available providers
 * - GET /api/v1/llm/test - Test all providers
 */

const express = require('express');
const router = express.Router();
const LLMManager = require('../services/llm/llm-manager');
const RAGEngine = require('../services/llm/rag-engine');
const AnalyticsService = require('../services/analytics-service');
const CRMService = require('../services/crm-service');
const IntentDetector = require('../services/intent-detector');
const SlotExtractor = require('../services/slot-extractor');
const { AppError } = require('../middleware/error-handler');
const { sendSuccess } = require('../utils/response-formatter');
const crypto = require('crypto');

// LINUS PRINCIPLE: Single source of truth for analyticsService
// Analytics Service is initialized in server.js and passed via initializeServices()
let llmManager = null;
let ragEngine = null;
let analyticsService = null;
let crmService = null;
let intentDetector = null;
let slotExtractor = null;

// Initialization function called from server.js
async function initializeServices(analyticsServiceInstance) {
  try {
    analyticsService = analyticsServiceInstance;
    console.log('[LLM API] Using Analytics Service from server.js');

    // Initialize LLM Manager
    llmManager = new LLMManager({
      defaultProvider: process.env.DEFAULT_LLM_PROVIDER || 'claude',
      fallbackEnabled: true,
      providerOrder: ['claude', 'openai', 'gemini', 'ollama'],
      claude: {
        model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022'
      },
      openai: {
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'
      },
      gemini: {
        model: process.env.GEMINI_MODEL || 'gemini-pro'
      },
      ollama: {
        model: process.env.OLLAMA_MODEL || 'llama2',
        baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
      }
    });

    await llmManager.initialize();

    // Initialize RAG Engine
    ragEngine = new RAGEngine(llmManager, {
      maxContextItems: 5,
      confidenceThreshold: 0.3
    });

    await ragEngine.initialize();

    // Initialize CRM Service
    crmService = new CRMService();
    console.log('[LLM API] CRM Service initialized');

    // Initialize Intent Detector
    intentDetector = new IntentDetector();
    await intentDetector.initialize();
    console.log('[LLM API] Intent Detector initialized');

    // Initialize Slot Extractor
    slotExtractor = new SlotExtractor();
    await slotExtractor.initialize();
    console.log('[LLM API] Slot Extractor initialized');

    console.log('[LLM API] Services initialized successfully');
  } catch (error) {
    console.error('[LLM API] Initialization failed:', error.message);
    console.error('[LLM API] LLM endpoints will not be available');
  }
}

/**
 * POST /api/v1/llm/chat
 *
 * Generate answer using RAG (Retrieval-Augmented Generation)
 *
 * Request body:
 * {
 *   "query": "小朋友幾歲可以開始學滑雪？",
 *   "provider": "claude",  // optional
 *   "maxTokens": 1024,     // optional
 *   "temperature": 0.7     // optional
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "answer": "根據 FAQ 資訊...",
 *     "faqMatches": [...],
 *     "metadata": {
 *       "provider": "claude",
 *       "model": "claude-3-5-sonnet-20241022",
 *       "usage": {...},
 *       "faqContextItems": 3
 *     }
 *   }
 * }
 */
router.post('/chat', async (req, res, next) => {
  const startTime = Date.now();
  const requestId = `llm-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  try {
    if (!ragEngine) {
      throw new AppError('SERVICE_UNAVAILABLE', 'LLM 服務尚未初始化', 503);
    }

    const { query, provider, maxTokens, temperature } = req.body;

    // Validation
    if (!query || query.trim().length === 0) {
      throw new AppError('INVALID_QUERY', '查詢文字不得為空', 400);
    }

    if (query.length > 1000) {
      throw new AppError('QUERY_TOO_LONG', '查詢文字過長（最多 1000 字元）', 400);
    }

    // Detect intent and extract slots
    let detectedIntent = null;
    let intentConfidence = 0;
    let extractedSlots = {};

    if (intentDetector && slotExtractor) {
      try {
        // Extract slots first
        extractedSlots = await slotExtractor.extract(query);

        // Detect intent (with FAQ matches for better accuracy)
        const faqMatches = ragEngine.searchFAQ(query, 3);
        const intentResult = await intentDetector.detectIntent(query, {
          faqMatches,
          slots: extractedSlots
        });

        detectedIntent = intentResult.intent;
        intentConfidence = intentResult.confidence;

        console.log(`[Intent Detection] Query: "${query.substring(0, 50)}..." → Intent: ${detectedIntent} (${(intentConfidence * 100).toFixed(1)}%)`);
      } catch (intentError) {
        console.error('[Intent Detection] Failed:', intentError.message);
      }
    }

    // Generate answer
    const result = await ragEngine.generateAnswer(query, {
      provider,
      maxTokens,
      temperature
    });

    const responseTimeMs = Date.now() - startTime;

    // Calculate cost (accessible to both analytics and CRM)
    let costUsd = 0;
    if (analyticsService) {
      costUsd = analyticsService.calculateCost(
        result.metadata.provider,
        result.metadata.usage.prompt_tokens,
        result.metadata.usage.completion_tokens
      );
    }

    // Record analytics
    if (analyticsService) {
      try {
        analyticsService.recordLLMUsage({
          requestId,
          queryText: query,
          provider: result.metadata.provider,
          model: result.metadata.model,
          promptTokens: result.metadata.usage.prompt_tokens,
          completionTokens: result.metadata.usage.completion_tokens,
          totalTokens: result.metadata.usage.total_tokens,
          responseTimeMs,
          faqContextItems: result.faqMatches ? result.faqMatches.length : 0,
          success: true,
          errorMessage: null,
          costUsd
        });

        console.log(`[LLM Analytics] Request ${requestId}: ${result.metadata.provider} - ${result.metadata.usage.total_tokens} tokens - $${costUsd.toFixed(6)}`);
      } catch (analyticsError) {
        console.error('[LLM Analytics] Failed to record usage:', analyticsError.message);
      }
    }

    // Log to CRM
    if (crmService) {
      try {
        crmService.logInquiry({
          query,
          intent: detectedIntent,
          slots: extractedSlots,
          llmResponse: result.answer,
          provider: result.metadata.provider,
          model: result.metadata.model,
          tokens: result.metadata.usage.total_tokens,
          cost: costUsd,
          responseTime: responseTimeMs,
          faqMatches: result.faqMatches,
          timestamp: new Date().toISOString(),
          sessionId: requestId,
          userId: req.body.userId || req.headers['x-user-id'] || null,
          metadata: {
            requestId,
            faqContextItems: result.faqMatches ? result.faqMatches.length : 0,
            intentConfidence: intentConfidence
          }
        });
      } catch (crmError) {
        console.error('[CRM] Failed to log inquiry:', crmError.message);
      }
    }

    sendSuccess(res, result, 200, {
      timestamp: new Date().toISOString(),
      response_time_ms: responseTimeMs,
      request_id: requestId
    });
  } catch (error) {
    // Record failed request
    if (analyticsService) {
      try {
        analyticsService.recordLLMUsage({
          requestId,
          queryText: req.body.query || '',
          provider: req.body.provider || 'unknown',
          model: 'unknown',
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          responseTimeMs: Date.now() - startTime,
          faqContextItems: 0,
          success: false,
          errorMessage: error.message,
          costUsd: 0
        });
      } catch (analyticsError) {
        console.error('[LLM Analytics] Failed to record error:', analyticsError.message);
      }
    }

    next(error);
  }
});

/**
 * POST /api/v1/llm/chat/stream
 *
 * Stream answer using RAG
 *
 * Request body:
 * {
 *   "query": "教練課程包含什麼？",
 *   "provider": "claude"
 * }
 *
 * Response: Server-Sent Events (SSE) stream
 * data: {"type":"chunk","text":"根據"}
 * data: {"type":"chunk","text":" FAQ"}
 * data: {"type":"done","metadata":{...}}
 */
router.post('/chat/stream', async (req, res, next) => {
  const startTime = Date.now();
  const requestId = `llm-stream-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  try {
    if (!ragEngine) {
      throw new AppError('SERVICE_UNAVAILABLE', 'LLM 服務尚未初始化', 503);
    }

    const { query, provider, maxTokens, temperature } = req.body;

    // Validation
    if (!query || query.trim().length === 0) {
      throw new AppError('INVALID_QUERY', '查詢文字不得為空', 400);
    }

    // Detect intent and extract slots
    let detectedIntent = null;
    let intentConfidence = 0;
    let extractedSlots = {};

    if (intentDetector && slotExtractor) {
      try {
        extractedSlots = await slotExtractor.extract(query);
        const faqMatches = ragEngine.searchFAQ(query, 3);
        const intentResult = await intentDetector.detectIntent(query, {
          faqMatches,
          slots: extractedSlots
        });
        detectedIntent = intentResult.intent;
        intentConfidence = intentResult.confidence;
        console.log(`[Intent Detection] Stream: "${query.substring(0, 50)}..." → Intent: ${detectedIntent} (${(intentConfidence * 100).toFixed(1)}%)`);
      } catch (intentError) {
        console.error('[Intent Detection] Failed:', intentError.message);
      }
    }

    // Setup SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Stream chunks to client
    const result = await ragEngine.generateStreamingAnswer(
      query,
      (chunk) => {
        res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
      },
      {
        provider,
        maxTokens,
        temperature
      }
    );

    const responseTimeMs = Date.now() - startTime;

    // Calculate cost (accessible to both analytics and CRM)
    let costUsd = 0;
    if (analyticsService) {
      costUsd = analyticsService.calculateCost(
        result.metadata.provider,
        result.metadata.usage.prompt_tokens,
        result.metadata.usage.completion_tokens
      );
    }

    // Record analytics
    if (analyticsService) {
      try {
        analyticsService.recordLLMUsage({
          requestId,
          queryText: query,
          provider: result.metadata.provider,
          model: result.metadata.model,
          promptTokens: result.metadata.usage.prompt_tokens,
          completionTokens: result.metadata.usage.completion_tokens,
          totalTokens: result.metadata.usage.total_tokens,
          responseTimeMs,
          faqContextItems: result.faqMatches ? result.faqMatches.length : 0,
          success: true,
          errorMessage: null,
          costUsd
        });

        console.log(`[LLM Analytics] Stream ${requestId}: ${result.metadata.provider} - ${result.metadata.usage.total_tokens} tokens - $${costUsd.toFixed(6)}`);
      } catch (analyticsError) {
        console.error('[LLM Analytics] Failed to record streaming usage:', analyticsError.message);
      }
    }

    // Log to CRM
    if (crmService) {
      try {
        crmService.logInquiry({
          query,
          intent: detectedIntent,
          slots: extractedSlots,
          llmResponse: result.answer,
          provider: result.metadata.provider,
          model: result.metadata.model,
          tokens: result.metadata.usage.total_tokens,
          cost: costUsd,
          responseTime: responseTimeMs,
          faqMatches: result.faqMatches,
          timestamp: new Date().toISOString(),
          sessionId: requestId,
          userId: req.body.userId || req.headers['x-user-id'] || null,
          metadata: {
            requestId,
            faqContextItems: result.faqMatches ? result.faqMatches.length : 0,
            intentConfidence: intentConfidence,
            streaming: true
          }
        });
      } catch (crmError) {
        console.error('[CRM] Failed to log streaming inquiry:', crmError.message);
      }
    }

    // Send final metadata
    res.write(`data: ${JSON.stringify({
      type: 'done',
      faqMatches: result.faqMatches,
      metadata: result.metadata,
      request_id: requestId
    })}\n\n`);

    res.end();
  } catch (error) {
    // Record failed request
    if (analyticsService) {
      try {
        analyticsService.recordLLMUsage({
          requestId,
          queryText: req.body.query || '',
          provider: req.body.provider || 'unknown',
          model: 'unknown',
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          responseTimeMs: Date.now() - startTime,
          faqContextItems: 0,
          success: false,
          errorMessage: error.message,
          costUsd: 0
        });
      } catch (analyticsError) {
        console.error('[LLM Analytics] Failed to record streaming error:', analyticsError.message);
      }
    }

    next(error);
  }
});

/**
 * POST /api/v1/llm/suggestions
 *
 * Get FAQ suggestions without LLM generation
 * Faster than /chat, useful for quick lookups
 *
 * Request body:
 * {
 *   "query": "裝備",
 *   "limit": 5
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "suggestions": [
 *       {
 *         "id": "faq.gear.001",
 *         "question": "需要準備什麼裝備？",
 *         "answer": "...",
 *         "confidence": 0.95
 *       }
 *     ],
 *     "evaluation": {
 *       "canAnswerFromFAQ": true,
 *       "recommendation": "faq_direct"
 *     }
 *   }
 * }
 */
router.post('/suggestions', async (req, res, next) => {
  const startTime = Date.now();

  try {
    if (!ragEngine) {
      throw new AppError('SERVICE_UNAVAILABLE', 'LLM 服務尚未初始化', 503);
    }

    const { query, limit = 5 } = req.body;

    // Validation
    if (!query || query.trim().length === 0) {
      throw new AppError('INVALID_QUERY', '查詢文字不得為空', 400);
    }

    // Get suggestions
    const suggestions = ragEngine.getFAQSuggestions(query, limit);

    // Evaluate query
    const evaluation = ragEngine.evaluateQuery(query);

    const responseTimeMs = Date.now() - startTime;

    sendSuccess(res, {
      suggestions,
      evaluation
    }, 200, {
      timestamp: new Date().toISOString(),
      response_time_ms: responseTimeMs
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/llm/providers
 *
 * List available LLM providers
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "defaultProvider": "claude",
 *     "availableProviders": ["claude", "openai", "gemini"],
 *     "providers": {
 *       "claude": {
 *         "name": "claude",
 *         "models": [...],
 *         "capabilities": {...}
 *       }
 *     }
 *   }
 * }
 */
router.get('/providers', async (req, res, next) => {
  try {
    if (!llmManager) {
      throw new AppError('SERVICE_UNAVAILABLE', 'LLM 服務尚未初始化', 503);
    }

    const metadata = llmManager.getAllMetadata();

    sendSuccess(res, metadata, 200, {
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/llm/test
 *
 * Test all LLM providers with a simple prompt
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "claude": {
 *       "success": true,
 *       "duration": 1234,
 *       "model": "claude-3-5-sonnet-20241022",
 *       "text": "Hello! How can I help..."
 *     },
 *     "openai": {...}
 *   }
 * }
 */
router.get('/test', async (req, res, next) => {
  try {
    if (!llmManager) {
      throw new AppError('SERVICE_UNAVAILABLE', 'LLM 服務尚未初始化', 503);
    }

    const results = await llmManager.testAllProviders();

    sendSuccess(res, results, 200, {
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/llm/stats
 *
 * Get RAG engine statistics
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "totalFAQItems": 71,
 *     "maxContextItems": 5,
 *     "confidenceThreshold": 0.3,
 *     "llmProviders": ["claude", "openai"],
 *     "defaultProvider": "claude"
 *   }
 * }
 */
router.get('/stats', async (req, res, next) => {
  try {
    if (!ragEngine) {
      throw new AppError('SERVICE_UNAVAILABLE', 'LLM 服務尚未初始化', 503);
    }

    const stats = ragEngine.getStats();

    sendSuccess(res, stats, 200, {
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Export router and initialization function
router.initializeServices = initializeServices;

module.exports = router;
