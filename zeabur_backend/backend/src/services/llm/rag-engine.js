/**
 * RAG (Retrieval-Augmented Generation) Engine
 *
 * Combines FAQ search with LLM generation for accurate, context-aware responses
 * Process:
 * 1. Search FAQ database for relevant entries
 * 2. Extract top results as context
 * 3. Generate LLM response grounded in FAQ knowledge
 */

const Fuse = require('fuse.js');
const fs = require('fs');
const path = require('path');

class RAGEngine {
  constructor(llmManager, config = {}) {
    this.llmManager = llmManager;
    this.config = config;
    this.faqData = null;
    this.resortData = null;
    this.fuseInstance = null;
    this.resortFuseInstance = null;
    this.maxContextItems = config.maxContextItems || 5;
    this.confidenceThreshold = config.confidenceThreshold || 0.3;
    this.systemPrompt = this.buildSystemPrompt();
  }

  /**
   * Initialize RAG engine with FAQ data and Resort data
   * @returns {Promise<void>}
   */
  async initialize() {
    // Load FAQ data (phase0a is canonical; legacy exports are read-only backups)
    const faqPath = this.config.faqPath || path.join(__dirname, '../../../../data/faq_kb.phase0a.json');

    if (!fs.existsSync(faqPath)) {
      throw new Error(`FAQ data not found at: ${faqPath}`);
    }

    const rawData = fs.readFileSync(faqPath, 'utf8');
    this.faqData = JSON.parse(rawData);

    // Initialize Fuse for FAQ search
    this.fuseInstance = new Fuse(this.faqData.items, {
      keys: [
        { name: 'canonical_question', weight: 0.4 },
        { name: 'answer', weight: 0.3 },
        { name: 'utterance_patterns', weight: 0.2 },
        { name: 'keywords', weight: 0.1 }
      ],
      threshold: 0.6,
      ignoreLocation: true,
      includeScore: true
    });

    console.log(`[RAG Engine] Initialized with ${this.faqData.items.length} FAQ items`);

    // Load Resort data
    const resortPath = this.config.resortPath || path.join(__dirname, '../../../../data/resort_kb.json');

    if (fs.existsSync(resortPath)) {
      const resortRawData = fs.readFileSync(resortPath, 'utf8');
      this.resortData = JSON.parse(resortRawData);

      // Initialize Fuse for Resort search
      this.resortFuseInstance = new Fuse(this.resortData.resorts, {
        keys: [
          { name: 'names.zh', weight: 0.4 },
          { name: 'names.en', weight: 0.2 },
          { name: 'names.ja', weight: 0.2 },
          { name: 'region', weight: 0.1 },
          { name: '_metadata.region', weight: 0.05 },
          { name: '_metadata.area', weight: 0.05 }
        ],
        threshold: 0.4,  // 降低閾值讓搜尋更寬鬆
        ignoreLocation: true,
        includeScore: true,
        useExtendedSearch: false,
        findAllMatches: true
      });

      console.log(`[RAG Engine] Initialized with ${this.resortData.resorts.length} resort items`);
    } else {
      console.warn('[RAG Engine] Resort data not found, skipping resort search');
    }
  }

  /**
   * Build system prompt for FAQ Q&A
   * @returns {string} System prompt
   */
  buildSystemPrompt() {
    return `你是 DIY.Ski 滑雪教學服務的客服助理。

**你的任務**：
- 根據提供的 FAQ 知識庫和雪場資料庫回答使用者問題
- 提供準確、友善、專業的回答
- 如果 FAQ 或雪場資料中有明確答案，直接引用
- 如果知識庫中沒有相關資訊，誠實告知並建議聯絡客服

**知識庫範圍**：
1. **FAQ 知識庫**：關於課程、預約、費用、裝備等常見問題
2. **雪場資料庫**：42 個日本雪場的詳細資訊（雪道、纜車、設施、交通、價格等）

**回答原則**：
1. **準確性優先**：只回答知識庫中有明確資訊的問題
2. **簡潔明瞭**：用 2-3 段落回答，避免冗長
3. **友善專業**：使用親切但專業的語氣
4. **引導行動**：必要時提供後續步驟建議
5. **承認限制**：不確定時不要猜測，建議聯絡客服
6. **雪場推薦**：當被問及雪場選擇時，根據使用者需求（地區、夜滑、難度等）提供建議

**格式要求**：
- 使用繁體中文回答
- 使用 Markdown 格式
- 重要資訊使用 **粗體** 標記
- 列表使用 bullet points (•)
- 必要時加入 emoji 提升可讀性 (但不要過度使用)`;
  }

  /**
   * Search FAQ database
   * @param {string} query - User query
   * @param {number} limit - Maximum results
   * @returns {Array} FAQ matches
   */
  searchFAQ(query, limit = this.maxContextItems) {
    if (!this.fuseInstance) {
      throw new Error('RAG Engine not initialized');
    }

    const results = this.fuseInstance.search(query, { limit });

    return results
      .filter(result => result.score < this.confidenceThreshold)
      .map(result => ({
        id: result.item.id,
        question: result.item.canonical_question,
        answer: result.item.answer,
        intent: result.item.intent,
        confidence: Math.round((1 - result.score) * 100) / 100,
        metadata: {
          category: result.item.category,
          tags: result.item.tags
        }
      }));
  }

  /**
   * Search Resort database
   * @param {string} query - User query
   * @param {number} limit - Maximum results
   * @returns {Array} Resort matches
   */
  searchResorts(query, limit = this.maxContextItems) {
    if (!this.resortFuseInstance) {
      return [];
    }

    const results = this.resortFuseInstance.search(query, { limit });

    return results
      .filter(result => result.score < this.confidenceThreshold)
      .map(result => ({
        resort_id: result.item.resort_id,
        name: result.item.names.zh || result.item.names.en,
        names: result.item.names,
        region: result.item.region,
        confidence: Math.round((1 - result.score) * 100) / 100,
        snow_stats: result.item.snow_stats,
        season: result.item.season,
        coordinates: result.item.coordinates,
        official_site: result.item.official_site,
        description: result.item.description
      }));
  }

  /**
   * Format FAQ and Resort context for LLM prompt
   * @param {Array} faqMatches - FAQ search results
   * @param {Array} resortMatches - Resort search results
   * @returns {string} Formatted context
   */
  formatContext(faqMatches, resortMatches = []) {
    let context = '';

    // FAQ context
    if (faqMatches.length > 0) {
      context += '**相關 FAQ 資訊**：\n\n';

      faqMatches.forEach((match, index) => {
        context += `### FAQ ${index + 1} (信心度: ${Math.round(match.confidence * 100)}%)\n`;
        context += `**問題**：${match.question}\n\n`;
        context += `**答案**：${match.answer}\n\n`;
        if (match.metadata.tags && match.metadata.tags.length > 0) {
          context += `**標籤**：${match.metadata.tags.join(', ')}\n`;
        }
        context += '\n---\n\n';
      });
    }

    // Resort context
    if (resortMatches.length > 0) {
      context += '**相關雪場資訊**：\n\n';

      resortMatches.forEach((match, index) => {
        context += `### 雪場 ${index + 1}: ${match.name} (信心度: ${Math.round(match.confidence * 100)}%)\n`;
        context += `**雪場 ID**：${match.resort_id}\n`;
        if (match.names.en) context += `**英文名稱**：${match.names.en}\n`;
        if (match.names.ja) context += `**日文名稱**：${match.names.ja}\n`;
        context += `**地區**：${match.region}\n`;

        if (match.snow_stats) {
          context += `**雪場統計**：\n`;
          context += `  - 纜車數：${match.snow_stats.lifts || 0}\n`;
          context += `  - 雪道數：${match.snow_stats.courses_total || 0}\n`;
          if (match.snow_stats.night_ski) context += `  - 夜間滑雪：有\n`;
          if (match.snow_stats.vertical_drop) context += `  - 垂直落差：${match.snow_stats.vertical_drop}m\n`;
          if (match.snow_stats.longest_run) context += `  - 最長雪道：${match.snow_stats.longest_run}km\n`;
        }

        if (match.season) {
          context += `**雪季**：${match.season.estimated_open || '?'} 至 ${match.season.estimated_close || '?'}\n`;
        }

        if (match.description?.tagline) {
          context += `**簡介**：${match.description.tagline}\n`;
        }

        if (match.official_site) {
          context += `**官網**：${match.official_site}\n`;
        }

        context += '\n---\n\n';
      });
    }

    if (faqMatches.length === 0 && resortMatches.length === 0) {
      return '沒有找到相關的 FAQ 或雪場資料。';
    }

    return context;
  }

  /**
   * Generate answer using RAG
   *
   * @param {string} query - User query
   * @param {Object} options - Generation options
   * @param {string} options.provider - Specific LLM provider
   * @param {boolean} options.stream - Enable streaming
   * @param {number} options.maxTokens - Maximum tokens to generate
   * @param {number} options.temperature - Sampling temperature
   * @returns {Promise<Object>} Response object
   */
  async generateAnswer(query, options = {}) {
    if (!this.fuseInstance) {
      throw new Error('RAG Engine not initialized');
    }

    const {
      provider = null,
      stream = false,
      maxTokens = 1024,
      temperature = 0.7,
      ...extraOptions
    } = options;

    // Step 1: Search FAQ and Resorts
    const faqMatches = this.searchFAQ(query);
    const resortMatches = this.searchResorts(query);
    console.log(`[RAG Engine] Found ${faqMatches.length} relevant FAQ items and ${resortMatches.length} relevant resorts`);

    // Step 2: Format context
    const context = this.formatContext(faqMatches, resortMatches);

    // Step 3: Build prompt
    const prompt = `${context}

**使用者問題**：${query}

請根據上述 FAQ 和雪場資訊回答使用者的問題。如果知識庫中沒有相關資訊，請誠實告知。`;

    // Step 4: Generate response
    const generationOptions = {
      provider,
      maxTokens,
      temperature,
      systemPrompt: this.systemPrompt,
      ...extraOptions
    };

    let response;
    if (stream) {
      // Streaming response
      response = await this.llmManager.generateStreamingCompletion(
        prompt,
        generationOptions,
        options.onChunk || (() => {})
      );
    } else {
      // Regular response
      response = await this.llmManager.generateCompletion(prompt, generationOptions);
    }

    // Step 5: Return enriched response
    return {
      answer: response.text,
      faqMatches: faqMatches,
      metadata: {
        provider: response.provider,
        model: response.model,
        usage: response.usage,
        faqContextItems: faqMatches.length,
        stopReason: response.stopReason
      }
    };
  }

  /**
   * Generate streaming answer using RAG
   *
   * @param {string} query - User query
   * @param {Function} onChunk - Callback for each chunk
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Final response object
   */
  async generateStreamingAnswer(query, onChunk, options = {}) {
    return this.generateAnswer(query, {
      ...options,
      stream: true,
      onChunk
    });
  }

  /**
   * Get FAQ suggestions without LLM generation
   * Useful for quick FAQ lookups
   *
   * @param {string} query - User query
   * @param {number} limit - Maximum results
   * @returns {Array} FAQ matches
   */
  getFAQSuggestions(query, limit = 5) {
    return this.searchFAQ(query, limit);
  }

  /**
   * Evaluate if a query can be answered from FAQ
   *
   * @param {string} query - User query
   * @returns {Object} Evaluation result
   */
  evaluateQuery(query) {
    const faqMatches = this.searchFAQ(query, 3);

    const hasStrongMatch = faqMatches.some(match => match.confidence > 0.8);
    const hasModerateMatch = faqMatches.some(match => match.confidence > 0.6);

    let recommendation = 'unknown';
    if (hasStrongMatch) {
      recommendation = 'faq_direct'; // Can answer directly from FAQ
    } else if (hasModerateMatch) {
      recommendation = 'rag'; // Use RAG for better answer
    } else {
      recommendation = 'escalate'; // May need human support
    }

    return {
      canAnswerFromFAQ: faqMatches.length > 0,
      confidence: faqMatches[0]?.confidence || 0,
      recommendation: recommendation,
      faqMatches: faqMatches
    };
  }

  /**
   * Get RAG engine statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      totalFAQItems: this.faqData?.items?.length || 0,
      maxContextItems: this.maxContextItems,
      confidenceThreshold: this.confidenceThreshold,
      llmProviders: this.llmManager.getAvailableProviders(),
      defaultProvider: this.llmManager.defaultProvider
    };
  }
}

module.exports = RAGEngine;
