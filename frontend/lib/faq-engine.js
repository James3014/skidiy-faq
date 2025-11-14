/**
 * FAQ Search Engine
 *
 * Implements FAQ search using Fuse.js with optimal configuration for CJK text
 * T025: Fuse.js initialization with threshold 0.4, ignoreLocation true
 */

const FAQ_LANGUAGES = ['zh', 'en', 'th'];
const FAQ_DEFAULT_LANGUAGE = 'zh';

function sanitizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

class FAQEngine {
  constructor() {
    this.faqData = null;
    this.fuseInstance = null;
    this.isInitialized = false;
    this.language = FAQ_DEFAULT_LANGUAGE;
  }

  /**
   * Initialize the FAQ engine by loading FAQ data from backend API
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      // Load FAQ data from backend API
      const API_BASE = window.API_BASE || 'https://faq-api-v1.zeabur.app/api/v1';
      const cacheBuster =
        typeof window !== 'undefined' && window.FAQ_KB_VERSION
          ? window.FAQ_KB_VERSION
          : Date.now();
      const response = await fetch(`${API_BASE}/faq/all?v=${cacheBuster}`, {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Failed to load FAQ data: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      this.faqData = result.data || result;

      this.faqData.items.forEach(item => {
        this.prepareLocalizedContent(item);
      });

      // Validate data structure
      if (!this.faqData.items || !Array.isArray(this.faqData.items)) {
        throw new Error('Invalid FAQ data structure: missing items array');
      }

      // Initialize Fuse.js with optimal configuration for CJK
      this.fuseInstance = new Fuse(this.faqData.items, this.getFuseConfig());

      this.isInitialized = true;

      console.log(`[FAQ Engine] Initialized with ${this.faqData.items.length} FAQ items`);
    } catch (error) {
      console.error('[FAQ Engine] Initialization failed:', error);
      throw error;
    }
  }

  setLanguage(language) {
    if (FAQ_LANGUAGES.includes(language)) {
      this.language = language;
    }
  }

  getLanguage() {
    return this.language;
  }

  /**
   * Phase 4.5: Simplified localization - API returns pre-composed content
   * No more backward compatibility for old format
   */
  prepareLocalizedContent(faq) {
    if (!faq) return {};

    const localized = {};

    // Phase 4.5: API 已經提供了簡化的本地化內容
    // content.question, content.answer, content.postscript 都已組合完成
    if (faq.content && typeof faq.content === 'object') {
      const content = faq.content;
      FAQ_LANGUAGES.forEach(lang => {
        localized[lang] = {
          question: sanitizeText(content.question),
          answer: sanitizeText(content.answer),
          postscript: sanitizeText(content.postscript)
        };
      });
    } else {
      // 如果沒有 content 欄位，返回空內容（應該不會發生）
      console.warn('[FAQ Engine] FAQ item missing content field:', faq.id);
      FAQ_LANGUAGES.forEach(lang => {
        localized[lang] = { question: '', answer: '', postscript: '' };
      });
    }

    faq.localized = localized;
    return localized;
  }

  /**
   * Phase 4.5: Simplified getLocalizedContent - no complex fallback logic
   * API returns content already localized per request language
   */
  getLocalizedContent(faq, language = this.language || FAQ_DEFAULT_LANGUAGE) {
    if (!faq) {
      return { question: '', answer: '', postscript: '' };
    }

    // Use cached localized content if available
    let localized = faq.localized;
    if (!localized) {
      localized = this.prepareLocalizedContent(faq);
    }

    // Simple fallback: requested language -> default language
    const preferred = [language, FAQ_DEFAULT_LANGUAGE];
    const question = preferred.map(lang => localized?.[lang]?.question).find(Boolean) || '';
    const answer = preferred.map(lang => localized?.[lang]?.answer).find(Boolean) || '';
    const postscript = preferred.map(lang => localized?.[lang]?.postscript).find(Boolean) || '';

    return { question, answer, postscript };
  }

  /**
   * Phase 4.6: Optimized Fuse.js configuration for simplified format
   * Only searches new format fields (content.*, metadata.*)
   * T025: threshold 0.4, ignoreLocation true
   *
   * @returns {Object} Fuse.js configuration
   */
  getFuseConfig() {
    // Phase 4.6: Simplified keys - only new format fields
    const keys = [
      // Primary search fields from content
      {
        name: 'content.question',
        weight: 0.45  // Increased weight (was 0.35) since it's the main field
      },
      {
        name: 'content.answer',
        weight: 0.25  // Increased weight (was 0.15) for better answer matching
      },
      {
        name: 'content.postscript',
        weight: 0.1   // Added postscript for completeness
      },
      // Metadata fields for filtering
      {
        name: 'metadata.keywords',
        weight: 0.15  // Increased weight (was 0.1) for keyword importance
      },
      {
        name: 'metadata.section',
        weight: 0.05  // Section for categorization
      }
    ];

    return {
      keys,

      // Fuzzy matching threshold (0.0 = perfect match, 1.0 = match anything)
      // T025: threshold 0.4 for balanced precision/recall
      threshold: 0.4,

      // CRITICAL for CJK: Ignore location in text
      // Without this, CJK characters may not match properly
      ignoreLocation: true,

      // Include score in results for confidence calculation
      includeScore: true,

      // Minimum character length to trigger search
      minMatchCharLength: 1,

      // Use extended search for operators like =, ', !, ^, $, etc.
      useExtendedSearch: false,

      // Whether to ignore accents (not relevant for CJK)
      ignoreFieldNorm: false,

      // Field length normalization (helps balance long vs short fields)
      fieldNormWeight: 1
    };
  }

  /**
   * Search FAQs with query string
   *
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @param {number} options.limit - Maximum number of results (default: 5)
   * @param {number} options.threshold - Override default threshold
   * @returns {Promise<Array>} Search results with scores
   */
  async search(query, options = {}) {
    if (!this.isInitialized) {
      throw new Error('FAQ Engine not initialized. Call initialize() first.');
    }

    if (!query || query.trim().length === 0) {
      return [];
    }

    const {
      limit = 5,
      threshold = null
    } = options;

    // Override threshold if specified
    if (threshold !== null && threshold !== this.fuseInstance.options.threshold) {
      this.fuseInstance.setCollection(this.faqData.items, this.getFuseConfig());
      this.fuseInstance.options.threshold = threshold;
    }

    // Perform search
    const startTime = performance.now();
    const results = this.fuseInstance.search(query, { limit });
    const endTime = performance.now();

    console.log(`[FAQ Engine] Search completed in ${Math.round(endTime - startTime)}ms`);
    console.log(`[FAQ Engine] Query: "${query}" | Results: ${results.length}`);

    return results;
  }

  /**
   * Get FAQ by ID
   *
   * @param {string} faqId - FAQ ID (e.g., "faq.booking.001")
   * @returns {Object|null} FAQ item or null if not found
   */
  getFAQById(faqId) {
    if (!this.isInitialized) {
      throw new Error('FAQ Engine not initialized');
    }

    const faq = this.faqData.items.find(item => item.id === faqId);
    return faq || null;
  }

  /**
   * Get FAQs by intent
   *
   * @param {string} intent - Intent type (e.g., "BOOKING", "GEAR")
   * @returns {Array} Array of FAQ items matching the intent
   */
  getFAQsByIntent(intent) {
    if (!this.isInitialized) {
      throw new Error('FAQ Engine not initialized');
    }

    return this.faqData.items.filter(item => item.intent === intent);
  }

  /**
   * Get FAQs by section
   *
   * @param {string} section - Section name
   * @returns {Array} Array of FAQ items in the section
   */
  getFAQsBySection(section) {
    if (!this.isInitialized) {
      throw new Error('FAQ Engine not initialized');
    }

    return this.faqData.items.filter(item => item.section === section);
  }

  /**
   * Get all FAQ items
   *
   * @returns {Array} All FAQ items
   */
  getAllFAQs() {
    if (!this.isInitialized) {
      throw new Error('FAQ Engine not initialized');
    }

    return this.faqData.items;
  }

  /**
   * Get FAQ statistics
   *
   * @returns {Object} Statistics about the FAQ data
   */
  getStats() {
    if (!this.isInitialized) {
      throw new Error('FAQ Engine not initialized');
    }

    const intents = new Set();
    const sections = new Set();

    this.faqData.items.forEach(item => {
      if (item.intent) intents.add(item.intent);
      if (item.section) sections.add(item.section);
    });

    return {
      totalItems: this.faqData.items.length,
      uniqueIntents: intents.size,
      uniqueSections: sections.size,
      intents: Array.from(intents),
      sections: Array.from(sections),
      version: this.faqData.metadata?.version || this.faqData.meta?.version || 'unknown',
      lastUpdated: this.faqData.metadata?.last_updated || this.faqData.meta?.last_updated || 'unknown'
    };
  }

  /**
   * Calculate confidence score from Fuse.js score
   *
   * Fuse.js returns score where 0 = perfect match, 1 = no match
   * We convert to confidence: (1 - score) * 100
   *
   * @param {number} fuseScore - Score from Fuse.js (0-1)
   * @returns {number} Confidence percentage (0-100)
   */
  calculateConfidence(fuseScore) {
    return Math.round((1 - fuseScore) * 100);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FAQEngine;
}
