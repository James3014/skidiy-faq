/**
 * Analytics Database Manager
 *
 * Manages SQLite database for search analytics, query logs, and FAQ usage tracking
 * Based on data model defined in specs/001-faq-system-upgrade/data-model.md
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class AnalyticsDB {
  constructor(dbPath = null) {
    // Default to data/analytics.db in project root
    this.dbPath = dbPath || path.join(__dirname, '../../../data/analytics.db');

    // Ensure data directory exists
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Initialize database connection
    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL'); // Write-Ahead Logging for better concurrency

    // Initialize schema
    this.initSchema();
  }

  /**
   * Initialize database schema
   * Creates tables and indexes if they don't exist
   */
  initSchema() {
    // Create search_queries table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS search_queries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query_id TEXT UNIQUE NOT NULL,
        query_text TEXT NOT NULL,
        query_language TEXT,

        -- Intent detection results
        detected_intent TEXT,
        intent_confidence REAL,

        -- Slot extraction results (JSON string)
        extracted_slots TEXT,

        -- Search results
        results_count INTEGER NOT NULL,
        top_result_id TEXT,
        top_result_score REAL,

        -- Performance metrics
        response_time_ms INTEGER NOT NULL,

        -- LLM enhancement (if used)
        llm_used BOOLEAN DEFAULT 0,
        llm_cost REAL,

        -- Metadata
        session_id TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_agent TEXT
      );
    `);

    // Create faq_views table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS faq_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        faq_id TEXT NOT NULL,
        query_id INTEGER NOT NULL,
        position INTEGER NOT NULL,
        clicked BOOLEAN DEFAULT 0,
        time_to_click_ms INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (query_id) REFERENCES search_queries(id)
      );
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_query_timestamp ON search_queries(timestamp);
      CREATE INDEX IF NOT EXISTS idx_query_intent ON search_queries(detected_intent);
      CREATE INDEX IF NOT EXISTS idx_query_session ON search_queries(session_id);
      CREATE INDEX IF NOT EXISTS idx_faq_views_faq_id ON faq_views(faq_id);
      CREATE INDEX IF NOT EXISTS idx_faq_views_query_id ON faq_views(query_id);
    `);
  }

  /**
   * Log a search query
   * @param {Object} query - Query data
   * @returns {number} - Inserted row ID
   */
  logSearchQuery(query) {
    const stmt = this.db.prepare(`
      INSERT INTO search_queries (
        query_id, query_text, query_language,
        detected_intent, intent_confidence, extracted_slots,
        results_count, top_result_id, top_result_score,
        response_time_ms, llm_used, llm_cost,
        session_id, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      query.query_id,
      query.query_text,
      query.query_language || 'zh',
      query.detected_intent || null,
      query.intent_confidence || null,
      query.extracted_slots ? JSON.stringify(query.extracted_slots) : null,
      query.results_count || 0,
      query.top_result_id || null,
      query.top_result_score || null,
      query.response_time_ms || 0,
      query.llm_used ? 1 : 0,
      query.llm_cost || null,
      query.session_id || null,
      query.user_agent || null
    );

    return result.lastInsertRowid;
  }

  /**
   * Log FAQ view/click event
   * @param {Object} view - View data
   * @returns {number} - Inserted row ID
   */
  logFAQView(view) {
    const stmt = this.db.prepare(`
      INSERT INTO faq_views (
        faq_id, query_id, position, clicked, time_to_click_ms
      ) VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      view.faq_id,
      view.query_id,
      view.position,
      view.clicked ? 1 : 0,
      view.time_to_click_ms || null
    );

    return result.lastInsertRowid;
  }

  /**
   * Get search statistics
   * @param {Object} options - Query options { start_date, end_date, intent }
   * @returns {Object} - Statistics
   */
  getSearchStats(options = {}) {
    let query = `
      SELECT
        COUNT(*) as total_searches,
        AVG(response_time_ms) as avg_response_time,
        AVG(results_count) as avg_results_count,
        SUM(CASE WHEN llm_used = 1 THEN 1 ELSE 0 END) as llm_searches,
        SUM(llm_cost) as total_llm_cost
      FROM search_queries
      WHERE 1=1
    `;

    const params = [];

    if (options.start_date) {
      query += ' AND timestamp >= ?';
      params.push(options.start_date);
    }

    if (options.end_date) {
      query += ' AND timestamp <= ?';
      params.push(options.end_date);
    }

    if (options.intent) {
      query += ' AND detected_intent = ?';
      params.push(options.intent);
    }

    const stmt = this.db.prepare(query);
    return stmt.get(...params);
  }

  /**
   * Get top searched queries
   * @param {number} limit - Number of results
   * @returns {Array} - Top queries
   */
  getTopQueries(limit = 10) {
    const stmt = this.db.prepare(`
      SELECT query_text, COUNT(*) as count
      FROM search_queries
      GROUP BY query_text
      ORDER BY count DESC
      LIMIT ?
    `);

    return stmt.all(limit);
  }

  /**
   * Get FAQ click-through rates
   * @param {number} limit - Number of results
   * @returns {Array} - FAQ CTR data
   */
  getFAQClickThroughRates(limit = 20) {
    const stmt = this.db.prepare(`
      SELECT
        faq_id,
        COUNT(*) as views,
        SUM(CASE WHEN clicked = 1 THEN 1 ELSE 0 END) as clicks,
        ROUND(CAST(SUM(CASE WHEN clicked = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100, 2) as ctr
      FROM faq_views
      GROUP BY faq_id
      ORDER BY views DESC
      LIMIT ?
    `);

    return stmt.all(limit);
  }

  /**
   * Get intent distribution
   * @returns {Array} - Intent statistics
   */
  getIntentDistribution() {
    const stmt = this.db.prepare(`
      SELECT
        detected_intent,
        COUNT(*) as count,
        AVG(intent_confidence) as avg_confidence
      FROM search_queries
      WHERE detected_intent IS NOT NULL
      GROUP BY detected_intent
      ORDER BY count DESC
    `);

    return stmt.all();
  }

  /**
   * Close database connection
   */
  close() {
    this.db.close();
  }

  /**
   * Test database connection
   * @returns {boolean} - Connection status
   */
  testConnection() {
    try {
      const result = this.db.prepare('SELECT 1 as test').get();
      return result.test === 1;
    } catch (error) {
      return false;
    }
  }
}

module.exports = AnalyticsDB;
