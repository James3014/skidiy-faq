/**
 * FAQ Search Engine
 *
 * Implements FAQ search using Fuse.js with optimal configuration for CJK text
 * T025: Fuse.js initialization with threshold 0.4, ignoreLocation true
 */

class FAQEngine {
  constructor() {
    this.faqData = null;
    this.fuseInstance = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the FAQ engine by loading faq_kb.json
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      // Load FAQ data from local file
      const response = await fetch('faq_kb.json');

      if (!response.ok) {
        throw new Error(`Failed to load FAQ data: ${response.status} ${response.statusText}`);
      }

      this.faqData = await response.json();

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

  /**
   * Get Fuse.js configuration optimized for CJK text search
   * T025: threshold 0.4, ignoreLocation true
   *
   * @returns {Object} Fuse.js configuration
   */
  getFuseConfig() {
    return {
      // Keys to search (weighted)
      keys: [
        {
          name: 'canonical_question',
          weight: 0.4  // Highest priority: canonical question
        },
        {
          name: 'utterance_patterns',
          weight: 0.3  // High priority: user query patterns
        },
        {
          name: 'answer_template.text',
          weight: 0.15  // Medium priority: answer content
        },
        {
          name: 'keywords',
          weight: 0.1  // Lower priority: keywords
        },
        {
          name: 'section',
          weight: 0.05  // Lowest priority: section name
        }
      ],

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
