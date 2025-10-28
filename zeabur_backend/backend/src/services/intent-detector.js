/**
 * Intent Detection Service
 *
 * Implements rule-based intent detection using hybrid scoring:
 * - Keyword matching (weighted by priority)
 * - FAQ fuzzy matching (using existing FAQ engine)
 * - Slot extraction bonus
 *
 * Intent Categories:
 * - ITINERARY: 行程規劃
 * - SERVICE: 服務範圍
 * - COURSE: 課程內容
 * - GROUPING: 同堂安排
 * - KIDS_SAFETY: 兒童安全
 * - INSTRUCTOR: 教練資訊
 * - BOOKING: 預約變更
 * - PAYMENT: 付款方式
 * - INSURANCE: 保險提問
 * - GEAR: 裝備租借
 * - REFUND_POLICY: 退費規則
 * - RESORT_INFO: 雪場資訊
 * - GENERAL: 一般查詢
 */

const fs = require('fs');
const path = require('path');

class IntentDetector {
  constructor() {
    this.intents = {};
    this.keywordPatterns = [];
    this.isInitialized = false;
  }

  /**
   * Initialize intent detector with keyword rules
   */
  async initialize() {
    try {
      // Load intent keywords configuration
      this.intents = {
        ITINERARY: {
          keywords: ['行程', '規劃', '安排', '幾天', '日程', '日期', '時間表', '行程表'],
          weight: 1.0,
          priority: 1
        },
        SERVICE: {
          keywords: ['服務', '範圍', '地區', '提供', '可以', '有沒有', '支援'],
          weight: 0.9,
          priority: 2
        },
        COURSE: {
          keywords: ['課程', '內容', '教什麼', '學什麼', '上課', '教學', '級數', '程度'],
          weight: 1.1,
          priority: 1
        },
        GROUPING: {
          keywords: ['同堂', '一起', '同班', '併班', '分開', '分組'],
          weight: 1.0,
          priority: 2
        },
        KIDS_SAFETY: {
          keywords: ['小孩', '小朋友', '兒童', '孩子', '寶寶', '安全', '年齡', '歲', '托兒', '親子'],
          weight: 1.2,
          priority: 1
        },
        INSTRUCTOR: {
          keywords: ['教練', '老師', '師資', '指導員', '教學人員', '指定', '推薦'],
          weight: 1.1,
          priority: 1
        },
        BOOKING: {
          keywords: ['預約', '訂', '報名', '預訂', '改期', '變更', '取消', '修改'],
          weight: 1.0,
          priority: 1
        },
        PAYMENT: {
          keywords: ['付款', '繳費', '費用', '價格', '多少錢', '收費', '匯款', '轉帳'],
          weight: 1.0,
          priority: 2
        },
        INSURANCE: {
          keywords: ['保險', '保障', '意外', '理賠', '投保'],
          weight: 1.0,
          priority: 2
        },
        GEAR: {
          keywords: ['裝備', '器材', '租借', '租用', '雪板', '雪杖', '護具', '頭盔', '雪鏡'],
          weight: 1.0,
          priority: 2
        },
        REFUND_POLICY: {
          keywords: ['退款', '退費', '退訂', '取消', '可以退', '能退'],
          weight: 1.0,
          priority: 2
        },
        RESORT_INFO: {
          keywords: ['雪場', '滑雪場', '雪道', '纜車', '雪票', '夜滑', '夜間', '雪季', '開放時間', '交通', '怎麼去', '白馬', '野澤', '新潟', '長野', '北海道', '二世谷', '留壽都', '粉雪'],
          weight: 1.1,
          priority: 1
        },
        GENERAL: {
          keywords: ['請問', '想知道', '了解', '查詢', '諮詢', '問一下'],
          weight: 0.5,
          priority: 3
        }
      };

      // Load CRM tag rules for additional patterns
      const tagRulesPath = path.join(__dirname, '../../../05_行銷與AI工具/crm_tag_rules.json');
      if (fs.existsSync(tagRulesPath)) {
        const tagRules = JSON.parse(fs.readFileSync(tagRulesPath, 'utf8'));
        this.keywordPatterns = tagRules.keyword_to_tags || [];
      }

      this.isInitialized = true;
      console.log(`[Intent Detector] Initialized with ${Object.keys(this.intents).length} intent categories`);
    } catch (error) {
      console.error('[Intent Detector] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Detect intent from user query
   *
   * @param {string} query - User query text
   * @param {Object} options - Detection options
   * @param {Array} options.faqMatches - Optional FAQ search results for context
   * @param {Object} options.slots - Optional extracted slots
   * @param {number} options.threshold - Confidence threshold (default: 0.3)
   * @returns {Object} Detection result with intent, confidence, and scores
   */
  async detectIntent(query, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Intent Detector not initialized');
    }

    if (!query || query.trim().length === 0) {
      return {
        intent: 'GENERAL',
        confidence: 0.0,
        scores: {},
        detectedIntents: []
      };
    }

    const {
      faqMatches = [],
      slots = {},
      threshold = 0.3
    } = options;

    const queryLower = query.toLowerCase();
    const scores = {};

    // Calculate scores for each intent
    for (const [intent, config] of Object.entries(this.intents)) {
      let score = 0;

      // 1. Keyword matching (primary signal)
      const matchedKeywords = config.keywords.filter(keyword =>
        queryLower.includes(keyword)
      );

      if (matchedKeywords.length > 0) {
        // Score based on number of keyword matches and their weight
        score += (matchedKeywords.length * 0.3) * config.weight;
      }

      // 2. FAQ matching bonus (if FAQ results provided)
      if (faqMatches.length > 0) {
        const faqIntentMatches = faqMatches.filter(faq =>
          faq.item && faq.item.intent === intent
        ).length;

        if (faqIntentMatches > 0) {
          // Boost score based on FAQ matches
          score += faqIntentMatches * 0.2;
        }
      }

      // 3. Slot extraction bonus
      const slotBonuses = {
        ITINERARY: ['date', 'resort'],
        KIDS_SAFETY: ['children_ages'],
        BOOKING: ['date', 'people_total'],
        INSTRUCTOR: ['board_type'],
        GEAR: ['board_type', 'resort']
      };

      if (slotBonuses[intent]) {
        const matchedSlots = slotBonuses[intent].filter(slot => slots[slot]);
        if (matchedSlots.length > 0) {
          score += matchedSlots.length * 0.15;
        }
      }

      // 4. Priority weighting (lower priority = slight penalty)
      score = score / config.priority;

      scores[intent] = Math.min(score, 1.0); // Cap at 1.0
    }

    // Find all intents above threshold
    const detectedIntents = Object.entries(scores)
      .filter(([_, score]) => score >= threshold)
      .sort((a, b) => b[1] - a[1])
      .map(([intent, score]) => ({
        intent,
        confidence: score
      }));

    // Primary intent is the highest scoring
    const primaryIntent = detectedIntents.length > 0
      ? detectedIntents[0].intent
      : 'GENERAL';

    const confidence = detectedIntents.length > 0
      ? detectedIntents[0].confidence
      : 0.0;

    return {
      intent: primaryIntent,
      confidence,
      scores,
      detectedIntents,
      query,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Detect multiple intents from query
   * Returns all intents above threshold
   *
   * @param {string} query - User query
   * @param {Object} options - Detection options
   * @returns {Array} Array of {intent, confidence} objects
   */
  async detectMultipleIntents(query, options = {}) {
    const result = await this.detectIntent(query, options);
    return result.detectedIntents;
  }

  /**
   * Get intent metadata
   *
   * @param {string} intent - Intent name
   * @returns {Object} Intent configuration
   */
  getIntentMetadata(intent) {
    return this.intents[intent] || null;
  }

  /**
   * Get all available intents
   *
   * @returns {Array} List of intent names
   */
  getAllIntents() {
    return Object.keys(this.intents);
  }

  /**
   * Calculate intent confidence with context
   * Used for re-scoring with additional context
   *
   * @param {string} query - Original query
   * @param {string} intent - Intent to score
   * @param {Object} context - Additional context
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidenceWithContext(query, intent, context = {}) {
    const config = this.intents[intent];
    if (!config) return 0;

    let score = 0;
    const queryLower = query.toLowerCase();

    // Keyword matching
    const matchedKeywords = config.keywords.filter(keyword =>
      queryLower.includes(keyword)
    );
    score += (matchedKeywords.length * 0.3) * config.weight;

    // Context bonus
    if (context.previousIntent === intent) {
      score += 0.2; // Conversation continuity bonus
    }

    if (context.userHistory && context.userHistory.includes(intent)) {
      score += 0.1; // User preference bonus
    }

    return Math.min(score / config.priority, 1.0);
  }
}

// Export singleton instance
module.exports = IntentDetector;
