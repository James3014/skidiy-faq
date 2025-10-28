/**
 * CRM Service
 *
 * Manages customer inquiry logging and tracking
 * Integrates with existing CRM JSONL logs
 */

const fs = require('fs');
const path = require('path');

class CRMService {
  constructor(config = {}) {
    // JSONL log file path
    this.logPath = config.logPath ||
      process.env.JSONL_LOG_PATH ||
      path.join(__dirname, '../../../data/customer_inquiries.jsonl');

    // Ensure data directory exists
    const dataDir = path.dirname(this.logPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Ensure log file exists
    if (!fs.existsSync(this.logPath)) {
      fs.writeFileSync(this.logPath, '');
    }

    console.log(`[CRM Service] Initialized with log path: ${this.logPath}`);
  }

  /**
   * Log customer inquiry to JSONL
   * @param {Object} inquiry - Inquiry data
   * @returns {boolean} Success status
   */
  logInquiry(inquiry) {
    try {
      const {
        query,
        intent,
        slots,
        llmResponse,
        provider,
        model,
        tokens,
        cost,
        responseTime,
        faqMatches,
        timestamp,
        sessionId,
        userId,
        metadata
      } = inquiry;

      // Build CRM log entry
      const logEntry = {
        timestamp: timestamp || new Date().toISOString(),
        query_text: query,
        intent_detected: intent || null,
        slots_extracted: slots || {},
        llm_provider: provider || null,
        llm_model: model || null,
        llm_response: llmResponse || null,
        token_usage: tokens || null,
        cost_usd: cost || null,
        response_time_ms: responseTime || null,
        faq_matches: faqMatches || [],
        session_id: sessionId || null,
        user_id: userId || null,
        metadata: metadata || {}
      };

      // Append to JSONL file
      const jsonLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(this.logPath, jsonLine, 'utf8');

      return true;
    } catch (error) {
      console.error('[CRM Service] Failed to log inquiry:', error.message);
      return false;
    }
  }

  /**
   * Read all inquiries from JSONL log
   * @param {Object} options - Query options
   * @returns {Array} Array of inquiries
   */
  readInquiries(options = {}) {
    try {
      const {
        limit = 100,
        intent = null,
        startDate = null,
        endDate = null,
        userId = null
      } = options;

      // Read JSONL file
      const content = fs.readFileSync(this.logPath, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.length > 0);

      // Parse JSON lines
      let inquiries = lines.map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          console.error('[CRM Service] Failed to parse line:', line);
          return null;
        }
      }).filter(entry => entry !== null);

      // Apply filters
      if (intent) {
        inquiries = inquiries.filter(i => i.intent_detected === intent);
      }

      if (startDate) {
        inquiries = inquiries.filter(i => i.timestamp >= startDate);
      }

      if (endDate) {
        inquiries = inquiries.filter(i => i.timestamp <= endDate);
      }

      if (userId) {
        inquiries = inquiries.filter(i => i.user_id === userId);
      }

      // Sort by timestamp (newest first)
      inquiries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Apply limit
      return inquiries.slice(0, limit);
    } catch (error) {
      console.error('[CRM Service] Failed to read inquiries:', error.message);
      return [];
    }
  }

  /**
   * Get inquiry statistics
   * @param {Object} options - Query options
   * @returns {Object} Statistics
   */
  getInquiryStats(options = {}) {
    try {
      const inquiries = this.readInquiries({ ...options, limit: 10000 });

      if (inquiries.length === 0) {
        return {
          totalInquiries: 0,
          intentDistribution: {},
          avgResponseTime: 0,
          totalCost: 0,
          providerDistribution: {}
        };
      }

      // Intent distribution
      const intentDist = {};
      inquiries.forEach(i => {
        const intent = i.intent_detected || 'UNKNOWN';
        intentDist[intent] = (intentDist[intent] || 0) + 1;
      });

      // Provider distribution
      const providerDist = {};
      inquiries.forEach(i => {
        if (i.llm_provider) {
          providerDist[i.llm_provider] = (providerDist[i.llm_provider] || 0) + 1;
        }
      });

      // Calculate totals
      const totalResponseTime = inquiries.reduce((sum, i) => sum + (i.response_time_ms || 0), 0);
      const totalCost = inquiries.reduce((sum, i) => sum + (i.cost_usd || 0), 0);

      return {
        totalInquiries: inquiries.length,
        intentDistribution: intentDist,
        avgResponseTime: Math.round(totalResponseTime / inquiries.length),
        totalCost: totalCost.toFixed(6),
        providerDistribution: providerDist,
        dateRange: {
          earliest: inquiries[inquiries.length - 1]?.timestamp,
          latest: inquiries[0]?.timestamp
        }
      };
    } catch (error) {
      console.error('[CRM Service] Failed to get stats:', error.message);
      return null;
    }
  }

  /**
   * Get popular queries by intent
   * @param {string} intent - Intent type
   * @param {number} limit - Number of results
   * @returns {Array} Popular queries
   */
  getPopularQueriesByIntent(intent, limit = 10) {
    try {
      const inquiries = this.readInquiries({ intent, limit: 1000 });

      // Count query occurrences
      const queryCounts = {};
      inquiries.forEach(i => {
        const query = i.query_text.trim().toLowerCase();
        if (!queryCounts[query]) {
          queryCounts[query] = {
            text: i.query_text,
            count: 0,
            avgResponseTime: [],
            avgCost: []
          };
        }
        queryCounts[query].count++;
        if (i.response_time_ms) queryCounts[query].avgResponseTime.push(i.response_time_ms);
        if (i.cost_usd) queryCounts[query].avgCost.push(i.cost_usd);
      });

      // Convert to array and calculate averages
      const queries = Object.values(queryCounts).map(q => ({
        text: q.text,
        count: q.count,
        avgResponseTime: q.avgResponseTime.length > 0
          ? Math.round(q.avgResponseTime.reduce((a, b) => a + b) / q.avgResponseTime.length)
          : 0,
        avgCost: q.avgCost.length > 0
          ? (q.avgCost.reduce((a, b) => a + b) / q.avgCost.length).toFixed(6)
          : 0
      }));

      // Sort by count and limit
      queries.sort((a, b) => b.count - a.count);
      return queries.slice(0, limit);
    } catch (error) {
      console.error('[CRM Service] Failed to get popular queries:', error.message);
      return [];
    }
  }

  /**
   * Get user inquiry history
   * @param {string} userId - User ID
   * @param {number} limit - Number of results
   * @returns {Array} User's inquiry history
   */
  getUserHistory(userId, limit = 50) {
    try {
      return this.readInquiries({ userId, limit });
    } catch (error) {
      console.error('[CRM Service] Failed to get user history:', error.message);
      return [];
    }
  }

  /**
   * Export inquiries as CSV
   * @param {Object} options - Query options
   * @returns {string} CSV content
   */
  exportAsCSV(options = {}) {
    try {
      const inquiries = this.readInquiries({ ...options, limit: 10000 });

      // CSV header
      let csv = 'Timestamp,Query,Intent,Provider,Model,Tokens,Cost,Response Time (ms),User ID,Session ID\n';

      // CSV rows
      for (const inquiry of inquiries) {
        const row = [
          inquiry.timestamp,
          `"${(inquiry.query_text || '').replace(/"/g, '""')}"`,
          inquiry.intent_detected || '',
          inquiry.llm_provider || '',
          inquiry.llm_model || '',
          inquiry.token_usage || '',
          inquiry.cost_usd || '',
          inquiry.response_time_ms || '',
          inquiry.user_id || '',
          inquiry.session_id || ''
        ].join(',');
        csv += row + '\n';
      }

      return csv;
    } catch (error) {
      console.error('[CRM Service] Failed to export CSV:', error.message);
      return '';
    }
  }

  /**
   * Get log file size and line count
   * @returns {Object} File statistics
   */
  getLogStats() {
    try {
      const stats = fs.statSync(this.logPath);
      const content = fs.readFileSync(this.logPath, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.length > 0);

      return {
        filePath: this.logPath,
        fileSizeBytes: stats.size,
        fileSizeMB: (stats.size / 1024 / 1024).toFixed(2),
        lineCount: lines.length,
        lastModified: stats.mtime.toISOString()
      };
    } catch (error) {
      console.error('[CRM Service] Failed to get log stats:', error.message);
      return null;
    }
  }
}

module.exports = CRMService;
