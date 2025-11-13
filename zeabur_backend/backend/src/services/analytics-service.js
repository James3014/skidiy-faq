/**
 * Analytics Service
 *
 * Records and analyzes LLM usage, search queries, and user interactions
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class AnalyticsService {
  constructor(dbPath) {
    // LINUS PRINCIPLE: Use explicit path if provided
    // If not, use emergency fallback for Zeabur Volume compatibility
    const finalPath = dbPath || process.env.SQLITE_DB_PATH || '/app/data/analytics.db';

    const dataDir = path.dirname(finalPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    console.log('[Analytics Service] Using database path:', finalPath);
    this.db = new Database(finalPath);
    this.initializeTables();
  }

  /**
   * Initialize database tables
   */
  initializeTables() {
    // Check if this is an old database that needs migration
    this.migrateIfNeeded();

    // LLM Usage table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS llm_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id TEXT UNIQUE NOT NULL,
        query_text TEXT NOT NULL,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        prompt_tokens INTEGER NOT NULL,
        completion_tokens INTEGER NOT NULL,
        total_tokens INTEGER NOT NULL,
        response_time_ms INTEGER NOT NULL,
        faq_context_items INTEGER DEFAULT 0,
        success BOOLEAN DEFAULT 1,
        error_message TEXT,
        cost_usd REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_llm_usage_timestamp ON llm_usage(timestamp);
      CREATE INDEX IF NOT EXISTS idx_llm_usage_provider ON llm_usage(provider);
      CREATE INDEX IF NOT EXISTS idx_llm_usage_success ON llm_usage(success);

      CREATE TABLE IF NOT EXISTS provider_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        provider TEXT NOT NULL,
        date DATE NOT NULL,
        total_requests INTEGER DEFAULT 0,
        successful_requests INTEGER DEFAULT 0,
        failed_requests INTEGER DEFAULT 0,
        total_tokens INTEGER DEFAULT 0,
        total_cost_usd REAL DEFAULT 0,
        avg_response_time_ms REAL DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(provider, date)
      );

      CREATE INDEX IF NOT EXISTS idx_provider_stats_date ON provider_stats(date);
      CREATE INDEX IF NOT EXISTS idx_provider_stats_provider ON provider_stats(provider);

      CREATE TABLE IF NOT EXISTS faq_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        view_id TEXT UNIQUE,
        faq_id TEXT NOT NULL,
        query_id TEXT,
        query_text TEXT,
        position INTEGER DEFAULT 0,
        source TEXT,
        clicked BOOLEAN DEFAULT 0,
        time_to_click_ms INTEGER,
        language TEXT DEFAULT 'zh',
        session_id TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_faq_views_faq_id ON faq_views(faq_id);
      CREATE INDEX IF NOT EXISTS idx_faq_views_timestamp ON faq_views(timestamp);
      CREATE INDEX IF NOT EXISTS idx_faq_views_clicked ON faq_views(clicked);
      CREATE INDEX IF NOT EXISTS idx_faq_views_language ON faq_views(language);
      CREATE INDEX IF NOT EXISTS idx_faq_views_source ON faq_views(source);
      CREATE INDEX IF NOT EXISTS idx_faq_views_session ON faq_views(session_id);

      CREATE TABLE IF NOT EXISTS section_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section TEXT NOT NULL,
        language TEXT DEFAULT 'zh',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_section_views_section ON section_views(section);
      CREATE INDEX IF NOT EXISTS idx_section_views_timestamp ON section_views(timestamp);
      CREATE INDEX IF NOT EXISTS idx_section_views_language ON section_views(language);

      CREATE TABLE IF NOT EXISTS tag_clicks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tag_type TEXT NOT NULL,
        tag_name TEXT NOT NULL,
        item_id TEXT NOT NULL,
        language TEXT DEFAULT 'zh',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_tag_clicks_tag_name ON tag_clicks(tag_name);
      CREATE INDEX IF NOT EXISTS idx_tag_clicks_tag_type ON tag_clicks(tag_type);
      CREATE INDEX IF NOT EXISTS idx_tag_clicks_timestamp ON tag_clicks(timestamp);
      CREATE INDEX IF NOT EXISTS idx_tag_clicks_language ON tag_clicks(language);

      CREATE TABLE IF NOT EXISTS resort_clicks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        click_type TEXT NOT NULL,
        resort_id TEXT,
        region TEXT,
        language TEXT DEFAULT 'zh',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_resort_clicks_click_type ON resort_clicks(click_type);
      CREATE INDEX IF NOT EXISTS idx_resort_clicks_resort_id ON resort_clicks(resort_id);
      CREATE INDEX IF NOT EXISTS idx_resort_clicks_region ON resort_clicks(region);
      CREATE INDEX IF NOT EXISTS idx_resort_clicks_timestamp ON resort_clicks(timestamp);
      CREATE INDEX IF NOT EXISTS idx_resort_clicks_language ON resort_clicks(language);
    `);

    // Ensure new columns exist for backward compatibility with older databases
    const ensureColumn = (table, column, alterSql, defaultValue = null) => {
      const infoStmt = this.db.prepare(`PRAGMA table_info(${table})`);
      const columns = infoStmt.all();
      const hasColumn = columns.some(col => col.name === column);
      if (!hasColumn) {
        console.log(`[Analytics Service] Adding missing column ${column} to ${table}`);
        this.db.exec(alterSql);
        if (defaultValue !== null) {
          this.db.exec(`UPDATE ${table} SET ${column} = '${defaultValue}' WHERE ${column} IS NULL`);
        }
      }
    };

    ensureColumn('faq_views', 'view_id', "ALTER TABLE faq_views ADD COLUMN view_id TEXT", null);
    ensureColumn('faq_views', 'query_text', "ALTER TABLE faq_views ADD COLUMN query_text TEXT", null);
    ensureColumn('faq_views', 'source', "ALTER TABLE faq_views ADD COLUMN source TEXT", null);
    ensureColumn('faq_views', 'session_id', "ALTER TABLE faq_views ADD COLUMN session_id TEXT", null);
    ensureColumn('faq_views', 'language', "ALTER TABLE faq_views ADD COLUMN language TEXT DEFAULT 'zh'", 'zh');
    ensureColumn('tag_clicks', 'language', "ALTER TABLE tag_clicks ADD COLUMN language TEXT DEFAULT 'zh'", 'zh');
    ensureColumn('section_views', 'language', "ALTER TABLE section_views ADD COLUMN language TEXT DEFAULT 'zh'", 'zh');
    ensureColumn('resort_clicks', 'language', "ALTER TABLE resort_clicks ADD COLUMN language TEXT DEFAULT 'zh'", 'zh');

    console.log('[Analytics Service] Tables initialized');
  }

  /**
   * Record LLM usage
   * @param {Object} data - Usage data
   * @returns {number} Inserted row ID
   */
  recordLLMUsage(data) {
    const {
      requestId,
      queryText,
      provider,
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      responseTimeMs,
      faqContextItems = 0,
      success = true,
      errorMessage = null,
      costUsd = null
    } = data;

    const stmt = this.db.prepare(`
      INSERT INTO llm_usage (
        request_id, query_text, provider, model,
        prompt_tokens, completion_tokens, total_tokens,
        response_time_ms, faq_context_items, success,
        error_message, cost_usd
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      requestId,
      queryText,
      provider,
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      responseTimeMs,
      faqContextItems,
      success ? 1 : 0,
      errorMessage,
      costUsd
    );

    // Update provider stats
    this.updateProviderStats(provider, totalTokens, costUsd, responseTimeMs, success);

    return result.lastInsertRowid;
  }

  /**
   * Update provider statistics
   * @private
   */
  updateProviderStats(provider, tokens, cost, responseTime, success) {
    const today = new Date().toISOString().split('T')[0];

    const stmt = this.db.prepare(`
      INSERT INTO provider_stats (
        provider, date, total_requests, successful_requests, failed_requests,
        total_tokens, total_cost_usd, avg_response_time_ms
      ) VALUES (?, ?, 1, ?, ?, ?, ?, ?)
      ON CONFLICT(provider, date) DO UPDATE SET
        total_requests = total_requests + 1,
        successful_requests = successful_requests + ?,
        failed_requests = failed_requests + ?,
        total_tokens = total_tokens + ?,
        total_cost_usd = total_cost_usd + ?,
        avg_response_time_ms = (
          (avg_response_time_ms * (total_requests - 1) + ?) / total_requests
        ),
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      provider,
      today,
      success ? 1 : 0,
      success ? 0 : 1,
      tokens,
      cost || 0,
      responseTime,
      success ? 1 : 0,
      success ? 0 : 1,
      tokens,
      cost || 0,
      responseTime
    );
  }

  /**
   * Get LLM usage statistics
   * @param {Object} options - Query options
   * @returns {Object} Statistics
   */
  getLLMStats(options = {}) {
    const {
      startDate = null,
      endDate = null,
      provider = null,
      limit = 100
    } = options;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (startDate) {
      whereClause += ' AND timestamp >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND timestamp <= ?';
      params.push(endDate);
    }

    if (provider) {
      whereClause += ' AND provider = ?';
      params.push(provider);
    }

    // Overall stats
    const overallStmt = this.db.prepare(`
      SELECT
        COUNT(*) as total_requests,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_requests,
        SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_requests,
        SUM(total_tokens) as total_tokens,
        SUM(cost_usd) as total_cost,
        AVG(response_time_ms) as avg_response_time,
        AVG(faq_context_items) as avg_faq_items
      FROM llm_usage
      ${whereClause}
    `);

    const overall = overallStmt.get(...params);

    // By provider
    const byProviderStmt = this.db.prepare(`
      SELECT
        provider,
        COUNT(*) as requests,
        SUM(total_tokens) as tokens,
        SUM(cost_usd) as cost,
        AVG(response_time_ms) as avg_response_time
      FROM llm_usage
      ${whereClause}
      GROUP BY provider
      ORDER BY requests DESC
    `);

    const byProvider = byProviderStmt.all(...params);

    // Recent queries
    const recentStmt = this.db.prepare(`
      SELECT
        query_text,
        provider,
        model,
        total_tokens,
        cost_usd,
        response_time_ms,
        success,
        timestamp
      FROM llm_usage
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT ?
    `);

    const recent = recentStmt.all(...params, limit);

    // Daily stats
    const dailyStmt = this.db.prepare(`
      SELECT
        DATE(timestamp) as date,
        COUNT(*) as requests,
        SUM(total_tokens) as tokens,
        SUM(cost_usd) as cost,
        AVG(response_time_ms) as avg_response_time
      FROM llm_usage
      ${whereClause}
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
      LIMIT 30
    `);

    const daily = dailyStmt.all(...params);

    return {
      overall: {
        totalRequests: overall.total_requests,
        successfulRequests: overall.successful_requests,
        failedRequests: overall.failed_requests,
        successRate: overall.total_requests > 0
          ? (overall.successful_requests / overall.total_requests * 100).toFixed(2)
          : 0,
        totalTokens: overall.total_tokens || 0,
        totalCost: (overall.total_cost || 0).toFixed(4),
        avgResponseTime: Math.round(overall.avg_response_time || 0),
        avgFaqItems: (overall.avg_faq_items || 0).toFixed(1)
      },
      byProvider,
      recent,
      daily
    };
  }

  /**
   * Get provider performance comparison
   * @returns {Array} Provider comparison data
   */
  getProviderComparison() {
    const stmt = this.db.prepare(`
      SELECT
        provider,
        SUM(total_requests) as total_requests,
        SUM(successful_requests) as successful_requests,
        SUM(failed_requests) as failed_requests,
        SUM(total_tokens) as total_tokens,
        SUM(total_cost_usd) as total_cost,
        AVG(avg_response_time_ms) as avg_response_time
      FROM provider_stats
      WHERE date >= date('now', '-30 days')
      GROUP BY provider
      ORDER BY total_requests DESC
    `);

    const providers = stmt.all();

    return providers.map(p => ({
      provider: p.provider,
      totalRequests: p.total_requests,
      successRate: p.total_requests > 0
        ? ((p.successful_requests / p.total_requests) * 100).toFixed(2)
        : 0,
      totalTokens: p.total_tokens,
      totalCost: (p.total_cost || 0).toFixed(4),
      avgResponseTime: Math.round(p.avg_response_time || 0),
      costPerRequest: p.total_requests > 0
        ? ((p.total_cost || 0) / p.total_requests).toFixed(6)
        : 0
    }));
  }

  /**
   * Get popular queries
   * @param {number} limit - Number of results
   * @returns {Array} Popular queries
   */
  getPopularQueries(limit = 10) {
    const stmt = this.db.prepare(`
      SELECT
        query_text,
        COUNT(*) as count,
        AVG(total_tokens) as avg_tokens,
        AVG(response_time_ms) as avg_response_time
      FROM llm_usage
      WHERE success = 1
        AND timestamp >= datetime('now', '-7 days')
      GROUP BY LOWER(query_text)
      ORDER BY count DESC
      LIMIT ?
    `);

    return stmt.all(limit);
  }

  /**
   * Calculate estimated cost for given usage
   * @param {string} provider - Provider name
   * @param {number} promptTokens - Input tokens
   * @param {number} completionTokens - Output tokens
   * @returns {number} Estimated cost in USD
   */
  calculateCost(provider, promptTokens, completionTokens) {
    // Pricing per 1M tokens (as of 2025-10-13)
    const pricing = {
      claude: {
        'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
        'claude-3-opus-20240229': { input: 15, output: 75 },
        'claude-3-haiku-20240307': { input: 0.25, output: 1.25 }
      },
      openai: {
        'gpt-4-turbo-preview': { input: 10, output: 30 },
        'gpt-4': { input: 30, output: 60 },
        'gpt-3.5-turbo': { input: 0.5, output: 1.5 }
      },
      gemini: {
        'gemini-2.5-flash': { input: 0.25, output: 0.5 },
        'gemini-2.5-pro-preview-03-25': { input: 1.25, output: 5 },
        'gemini-pro': { input: 0.25, output: 0.5 }
      },
      ollama: {
        default: { input: 0, output: 0 } // Local, free
      }
    };

    const providerPricing = pricing[provider] || { default: { input: 0, output: 0 } };
    const modelPricing = providerPricing.default || providerPricing[Object.keys(providerPricing)[0]];

    const inputCost = (promptTokens / 1000000) * modelPricing.input;
    const outputCost = (completionTokens / 1000000) * modelPricing.output;

    return inputCost + outputCost;
  }

  /**
   * Log user feedback on FAQ or resort
   * @param {Object} feedback - Feedback data { feedback_type, item_id, helpful, reason, comment, language, user_session_id }
   * @returns {number} - Inserted row ID
   */
  logFeedback(feedback) {
    const stmt = this.db.prepare(`
      INSERT INTO feedback (
        feedback_type, item_id, helpful, reason, comment,
        language, user_session_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      feedback.feedback_type, // 'faq' or 'resort'
      feedback.item_id,
      feedback.helpful ? 1 : 0,
      feedback.reason || null,
      feedback.comment || null,
      feedback.language || 'zh',
      feedback.user_session_id || null
    );

    return result.lastInsertRowid;
  }

  /**
   * Get feedback statistics
   * @param {Object} options - Query options { feedback_type, item_id, days }
   * @returns {Object} - Feedback statistics
   */
  getFeedbackStats(options = {}) {
    let query = `
      SELECT
        COUNT(*) as total_feedback,
        SUM(CASE WHEN helpful = 1 THEN 1 ELSE 0 END) as helpful_count,
        SUM(CASE WHEN helpful = 0 THEN 1 ELSE 0 END) as not_helpful_count
      FROM feedback
      WHERE 1=1
    `;

    const params = [];

    if (options.feedback_type) {
      query += ' AND feedback_type = ?';
      params.push(options.feedback_type);
    }

    if (options.item_id) {
      query += ' AND item_id = ?';
      params.push(options.item_id);
    }

    if (options.language && options.language !== 'all') {
      query += ' AND language = ?';
      params.push(options.language);
    }

    if (options.days) {
      query += ' AND timestamp >= datetime("now", "-" || ? || " days")';
      params.push(options.days);
    }

    const stmt = this.db.prepare(query);
    const stats = stmt.get(...params);

    // Calculate helpful rate
    if (stats && stats.total_feedback > 0) {
      stats.helpful_rate = ((stats.helpful_count / stats.total_feedback) * 100).toFixed(2);
    } else {
      stats.helpful_rate = 0;
    }

    return stats;
  }

  /**
   * Get top items with lowest helpful rate
   * @param {Object} options - Query options { feedback_type, days, limit }
   * @returns {Array} - Items sorted by helpful rate (ascending)
   */
  getLowestRatedItems(options = {}) {
    let query = `
      SELECT
        item_id,
        feedback_type,
        COUNT(*) as total_feedback,
        SUM(CASE WHEN helpful = 1 THEN 1 ELSE 0 END) as helpful_count,
        ROUND(CAST(SUM(CASE WHEN helpful = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100, 2) as helpful_rate
      FROM feedback
      WHERE 1=1
    `;

    const params = [];

    if (options.feedback_type) {
      query += ' AND feedback_type = ?';
      params.push(options.feedback_type);
    }

    if (options.language && options.language !== 'all') {
      query += ' AND language = ?';
      params.push(options.language);
    }

    if (options.days) {
      query += ' AND timestamp >= datetime("now", "-" || ? || " days")';
      params.push(options.days);
    }

    query += ' GROUP BY item_id HAVING total_feedback >= 3'; // Only items with 3+ feedback
    query += ' ORDER BY helpful_rate ASC, total_feedback DESC';

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  /**
   * Get top rated items (highest helpful rate)
   * @param {Object} options - Query options { feedback_type, days, limit }
   * @returns {Array} - Top rated items
   */
  getTopRatedItems(options = {}) {
    let query = `
      SELECT
        item_id,
        feedback_type,
        COUNT(*) as total_feedback,
        SUM(CASE WHEN helpful = 1 THEN 1 ELSE 0 END) as helpful_count,
        ROUND(CAST(SUM(CASE WHEN helpful = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100, 2) as helpful_rate
      FROM feedback
      WHERE 1=1
    `;

    const params = [];

    if (options.feedback_type) {
      query += ' AND feedback_type = ?';
      params.push(options.feedback_type);
    }

    if (options.language && options.language !== 'all') {
      query += ' AND language = ?';
      params.push(options.language);
    }

    if (options.days) {
      query += ' AND timestamp >= datetime("now", "-" || ? || " days")';
      params.push(options.days);
    }

    query += ' GROUP BY item_id HAVING total_feedback >= 3'; // Only items with 3+ feedback
    query += ' ORDER BY helpful_rate DESC, total_feedback DESC';

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  /**
   * Get feedback reasons distribution (negative feedback only)
   * @param {Object} options - Query options { feedback_type, days }
   * @returns {Array} - Reason counts
   */
  getFeedbackReasons(options = {}) {
    let query = `
      SELECT
        reason,
        COUNT(*) as count
      FROM feedback
      WHERE helpful = 0 AND reason IS NOT NULL
    `;

    const params = [];

    if (options.feedback_type) {
      query += ' AND feedback_type = ?';
      params.push(options.feedback_type);
    }

    if (options.language && options.language !== 'all') {
      query += ' AND language = ?';
      params.push(options.language);
    }

    if (options.days) {
      query += ' AND timestamp >= datetime("now", "-" || ? || " days")';
      params.push(options.days);
    }

    query += ' GROUP BY reason ORDER BY count DESC';

    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  /**
   * Get feedback details/comments for an item
   * @param {Object} options - Query options { item_id, helpful, limit }
   * @returns {Array} - Feedback records with comments
   */
  getFeedbackComments(options = {}) {
    let query = `
      SELECT
        id, feedback_type, item_id, helpful, reason, comment,
        language, timestamp
      FROM feedback
      WHERE comment IS NOT NULL
    `;

    const params = [];

    if (options.item_id) {
      query += ' AND item_id = ?';
      params.push(options.item_id);
    }

    if (options.helpful !== undefined) {
      query += ' AND helpful = ?';
      params.push(options.helpful ? 1 : 0);
    }

    query += ' ORDER BY timestamp DESC';

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  /**
   * Get feedback daily trend
   * @param {Object} options - Query options { feedback_type, days }
   * @returns {Array} - Daily feedback counts
   */
  getFeedbackTrend(options = {}) {
    let query = `
      SELECT
        DATE(timestamp) as date,
        feedback_type,
        COUNT(*) as count,
        SUM(CASE WHEN helpful = 1 THEN 1 ELSE 0 END) as helpful_count,
        ROUND(CAST(SUM(CASE WHEN helpful = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100, 2) as helpful_rate
      FROM feedback
      WHERE 1=1
    `;

    const params = [];

    if (options.feedback_type) {
      query += ' AND feedback_type = ?';
      params.push(options.feedback_type);
    }

    if (options.language && options.language !== 'all') {
      query += ' AND language = ?';
      params.push(options.language);
    }

    if (options.days) {
      query += ' AND timestamp >= datetime("now", "-" || ? || " days")';
      params.push(options.days);
    }

    query += ' GROUP BY DATE(timestamp), feedback_type ORDER BY date DESC';

    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  /**
   * Get recent feedback records
   * @param {Object} options - Query options { feedback_type, helpful, limit }
   * @returns {Array} - Recent feedback records
   */
  getRecentFeedback(options = {}) {
    let query = `
      SELECT
        id, feedback_type, item_id, helpful, reason, comment,
        language, timestamp
      FROM feedback
      WHERE 1=1
    `;

    const params = [];

    if (options.feedback_type) {
      query += ' AND feedback_type = ?';
      params.push(options.feedback_type);
    }

    if (options.helpful !== undefined) {
      query += ' AND helpful = ?';
      params.push(options.helpful ? 1 : 0);
    }

    if (options.language && options.language !== 'all') {
      query += ' AND language = ?';
      params.push(options.language);
    }

    query += ' ORDER BY timestamp DESC';

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  /**
   * Track resort engagement event (expand, official site click, feedback)
   */
  trackResortEngagement(data) {
    const stmt = this.db.prepare(`
      INSERT INTO resort_clicks (timestamp, click_type, region, resort_id, language, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const metadata = JSON.stringify({
      engagement_type: data.engagement_type,
      resort_name: data.resort_name
    });

    stmt.run(
      data.timestamp,
      data.click_type || 'resort_engagement',
      null, // region is null for engagement tracking
      data.resort_id,
      data.language || 'zh',
      metadata
    );
  }

  /**
   * Get resort engagement statistics
   */
  getResortEngagementStats(options = {}) {
    // Build engagement type filter
    let engagementFilter = '';
    const params = [];

    if (options.days) {
      engagementFilter += ` AND timestamp >= datetime('now', '-${parseInt(options.days, 10)} days')`;
    }

    if (options.language && options.language !== 'all') {
      engagementFilter += ' AND language = ?';
      params.push(options.language);
    }

    // Get top resorts by engagement count
    const topResortsQuery = `
      SELECT
        resort_id,
        json_extract(metadata, '$.resort_name') as resort_name,
        json_extract(metadata, '$.engagement_type') as engagement_type,
        COUNT(*) as engagement_count,
        COUNT(DISTINCT DATE(timestamp)) as active_days
      FROM resort_clicks
      WHERE click_type = 'resort_engagement'
        ${engagementFilter}
      GROUP BY resort_id, engagement_type
      ORDER BY engagement_count DESC
      LIMIT ${options.limit || 20}
    `;

    const topResorts = this.db.prepare(topResortsQuery).all(...params);

    // Get engagement breakdown by type
    const engagementByTypeQuery = `
      SELECT
        json_extract(metadata, '$.engagement_type') as engagement_type,
        COUNT(*) as count
      FROM resort_clicks
      WHERE click_type = 'resort_engagement'
        ${engagementFilter}
      GROUP BY engagement_type
      ORDER BY count DESC
    `;

    const engagementByType = this.db.prepare(engagementByTypeQuery).all(...params);

    // Get daily engagement trend
    const dailyTrendQuery = `
      SELECT
        DATE(timestamp) as date,
        COUNT(*) as engagements
      FROM resort_clicks
      WHERE click_type = 'resort_engagement'
        ${engagementFilter}
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
      LIMIT 30
    `;

    const dailyTrend = this.db.prepare(dailyTrendQuery).all(...params);

    // Get language distribution
    const languageDistQuery = `
      SELECT
        language,
        COUNT(*) as count
      FROM resort_clicks
      WHERE click_type = 'resort_engagement'
        ${engagementFilter.replace(' AND language = ?', '')} // Remove language filter for distribution
      GROUP BY language
      ORDER BY count DESC
    `;

    const languageParams = options.days ? [] : params.slice(0, -1); // Remove language param if present
    const languageDistribution = this.db.prepare(languageDistQuery).all(...languageParams);

    // Aggregate resorts with all their engagement types
    const resortEngagementMap = {};
    topResorts.forEach(row => {
      if (!resortEngagementMap[row.resort_id]) {
        resortEngagementMap[row.resort_id] = {
          resort_id: row.resort_id,
          resort_name: row.resort_name,
          total_engagements: 0,
          engagement_types: {},
          active_days: row.active_days
        };
      }
      resortEngagementMap[row.resort_id].total_engagements += row.engagement_count;
      resortEngagementMap[row.resort_id].engagement_types[row.engagement_type] = row.engagement_count;
    });

    const aggregatedResorts = Object.values(resortEngagementMap)
      .sort((a, b) => b.total_engagements - a.total_engagements)
      .slice(0, options.limit || 20);

    return {
      top_resorts: aggregatedResorts,
      engagement_by_type: engagementByType,
      daily_trend: dailyTrend,
      language_distribution: languageDistribution,
      total_engagements: aggregatedResorts.reduce((sum, r) => sum + r.total_engagements, 0)
    };
  }

  /**
   * Check and migrate old database schema if needed
   * This handles backward compatibility with old database structures
   */
  migrateIfNeeded() {
    try {
      // Check if faq_views table exists
      const faqViewsTable = this.db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='faq_views'"
      ).get();

      if (faqViewsTable) {
        // Check if source column exists in faq_views
        const columns = this.db.prepare("PRAGMA table_info(faq_views)").all();
        const hasSourceColumn = columns.some(col => col.name === 'source');

        if (!hasSourceColumn) {
          console.log('[Analytics Service] Detected old schema - adding missing columns');
          // Add missing columns to faq_views
          try {
            this.db.exec(`
              ALTER TABLE faq_views ADD COLUMN source TEXT;
              ALTER TABLE faq_views ADD COLUMN clicked BOOLEAN DEFAULT 0;
              ALTER TABLE faq_views ADD COLUMN time_to_click_ms INTEGER;
              ALTER TABLE faq_views ADD COLUMN session_id TEXT;
            `);
            console.log('[Analytics Service] Schema migration completed successfully');
          } catch (altError) {
            // Columns might already exist, ignore
            if (!altError.message.includes('duplicate column')) {
              console.warn('[Analytics Service] Migration error (may be safe):', altError.message);
            }
          }
        }
      }
    } catch (error) {
      console.warn('[Analytics Service] Migration check failed:', error.message);
      // Continue anyway - CREATE TABLE IF NOT EXISTS will handle it
    }
  }

  /**
   * Close database connection
   */
  close() {
    this.db.close();
  }
}

module.exports = AnalyticsService;
