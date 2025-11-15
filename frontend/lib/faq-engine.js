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
    this.idMap = null;  // Phase 4.11: Quick lookup map for analytics
  }

  /**
   * Initialize the FAQ engine by loading FAQ data from backend API
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      // Load FAQ data from backend API
      let API_BASE = window.API_BASE;
      if (!API_BASE) {
        // Auto-detect local development environment
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        API_BASE = isLocalhost ? 'http://localhost:3000/api/v1' : 'https://faq-api-v1.zeabur.app/api/v1';
      }
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

      // LINUS PRINCIPLE: Good Taste - Eliminate special cases
      // Phase 4.11: Guarantee all fields exist at root level, no fallback chains needed
      // Backend API already provides clean structure, but we normalize it here for absolute certainty
      this.faqData.items.forEach(item => {
        this.prepareLocalizedContent(item);

        // Guarantee fields exist at root level (backend should already provide these)
        // This is belt-and-suspenders: backend ensures structure, we reinforce it
        item.intent = item.metadata?.intent || item.intent || 'GENERAL';
        item.section = item.metadata?.section || item.section || '一般';
        item.crm_tags = Array.isArray(item.metadata?.crm_tags) ? item.metadata.crm_tags :
                        Array.isArray(item.crm_tags) ? item.crm_tags : [];
        item.keywords = Array.isArray(item.metadata?.keywords) ? item.metadata.keywords :
                        Array.isArray(item.keywords) ? item.keywords : [];
        item.hot = item.metadata?.hot === true || item.hot === true;

        // After lifting fields to root, we can safely delete metadata to avoid confusion
        // All downstream code uses root-level fields only
        // DELETE metadata to enforce single source of truth
        delete item.metadata;
      });

      // Validate data structure
      if (!this.faqData.items || !Array.isArray(this.faqData.items)) {
        throw new Error('Invalid FAQ data structure: missing items array');
      }

      // Initialize Fuse.js with optimal configuration for CJK
      this.fuseInstance = new Fuse(this.faqData.items, this.getFuseConfig());

      // Phase 4.11: Build quick lookup map for analytics
      // This map allows O(1) lookup of FAQ title/section by ID
      this.idMap = new Map();
      this.faqData.items.forEach(item => {
        this.idMap.set(item.id, {
          title: item.content?.question || item.id,
          section: item.section || '一般'
        });
      });

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
   * Phase 4.7: Direct content access - API returns pre-composed, localized content
   * No need for complex localization logic, just return content directly
   *
   * Note: This method is kept for backward compatibility with existing code
   * that may call prepareLocalizedContent. It's now a no-op since API already
   * provides localized content.
   */
  prepareLocalizedContent(faq) {
    if (!faq || !faq.content) {
      if (faq && !faq.content) {
        console.warn('[FAQ Engine] FAQ item missing content field:', faq.id);
      }
      return {};
    }

    // Phase 4.7: API already provides localized content
    // No need to replicate it across all languages
    // Just mark as prepared and return
    faq.localized = true;
    return faq.content;
  }

  /**
   * Phase 4.7: Ultra-simplified getLocalizedContent
   * API returns content already composed and localized per request language
   *
   * @param {Object} faq - FAQ item with content field
   * @param {string} language - Language code (currently unused, API handles it)
   * @returns {Object} Localized content {question, answer, postscript}
   */
  getLocalizedContent(faq, language = this.language || FAQ_DEFAULT_LANGUAGE) {
    if (!faq || !faq.content) {
      return { question: '', answer: '', postscript: '' };
    }

    // Phase 4.7: Direct access - API already provides the right content
    return {
      question: sanitizeText(faq.content.question),
      answer: sanitizeText(faq.content.answer),
      postscript: sanitizeText(faq.content.postscript)
    };
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
   * Phase 4.11: Quick lookup for FAQ title and section by ID
   * LINUS PRINCIPLE: O(1) lookup using Map instead of O(n) array search
   *
   * Use case: analytics.html needs to display FAQ titles from localStorage IDs
   * Without this: Must loop through all FAQs for each ID (slow)
   * With this: Direct Map.get() lookup (fast)
   *
   * @param {string} faqId - FAQ ID (e.g., "faq.booking.001")
   * @returns {Object} {title: string, section: string} - Never null, returns fallback if not found
   */
  getQuickInfo(faqId) {
    if (!this.isInitialized) {
      throw new Error('FAQ Engine not initialized');
    }

    // O(1) Map lookup
    const info = this.idMap.get(faqId);

    // LINUS PRINCIPLE: Never return null, always provide fallback
    // Frontend can safely use info.title without checking
    return info || { title: faqId, section: '-' };
  }

  /**
   * Phase 4.11: Get FAQs by intent - Zero fallback version
   * LINUS PRINCIPLE: After initialize(), all fields guaranteed at root level
   *
   * @param {string} intent - Intent type (e.g., "BOOKING", "GEAR")
   * @returns {Array} Array of FAQ items matching the intent
   */
  getFAQsByIntent(intent) {
    if (!this.isInitialized) {
      throw new Error('FAQ Engine not initialized');
    }

    // Normalize to uppercase for case-insensitive matching
    const normalizedIntent = (intent || '').toUpperCase().trim();

    // LINUS PRINCIPLE: Direct field access, no fallback needed
    // initialize() already guaranteed item.intent exists
    return this.faqData.items.filter(item =>
      item.intent.toUpperCase() === normalizedIntent
    );
  }

  /**
   * Phase 4.11: Get FAQs by section - Zero fallback version
   * LINUS PRINCIPLE: After initialize(), all fields guaranteed at root level
   *
   * @param {string} section - Section name
   * @returns {Array} Array of FAQ items in the section
   */
  getFAQsBySection(section) {
    if (!this.isInitialized) {
      throw new Error('FAQ Engine not initialized');
    }

    const normalizedSection = (section || '').trim();

    // LINUS PRINCIPLE: Direct field access, no fallback needed
    // initialize() already guaranteed item.section exists
    return this.faqData.items.filter(item => {
      const itemSection = item.section.trim();
      // Exact match first, then case-insensitive fallback
      return itemSection === normalizedSection ||
             itemSection.toLowerCase() === normalizedSection.toLowerCase();
    });
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
   * Phase 4.11: Get FAQ statistics - Zero fallback version
   * LINUS PRINCIPLE: Direct field access after initialize() guarantees
   *
   * @returns {Object} Statistics about the FAQ data
   */
  getStats() {
    if (!this.isInitialized) {
      throw new Error('FAQ Engine not initialized');
    }

    const intents = new Set();
    const sections = new Set();

    // LINUS PRINCIPLE: Direct field access, no fallback
    // initialize() already guaranteed item.intent and item.section exist
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
