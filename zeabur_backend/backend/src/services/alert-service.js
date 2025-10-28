/**
 * Alert Service
 *
 * Monitors LLM usage and costs, sends alerts when thresholds are exceeded
 */

class AlertService {
  constructor(analyticsService, config = {}) {
    this.analyticsService = analyticsService;

    // Alert configuration
    this.config = {
      // Daily cost limit (USD)
      dailyCostLimit: config.dailyCostLimit || 10.0,

      // Monthly cost limit (USD)
      monthlyCostLimit: config.monthlyCostLimit || 300.0,

      // Request rate limit (requests per hour)
      hourlyRequestLimit: config.hourlyRequestLimit || 100,

      // Error rate threshold (percentage)
      errorRateThreshold: config.errorRateThreshold || 10,

      // Alert cooldown (minutes) - prevent alert spam
      alertCooldown: config.alertCooldown || 60,

      // Enable/disable alerts
      enabled: config.enabled !== false
    };

    // Track last alert times to implement cooldown
    this.lastAlerts = {
      dailyCost: null,
      monthlyCost: null,
      requestRate: null,
      errorRate: null
    };

    // Alert handlers (can be extended with email, SMS, etc.)
    this.handlers = [];

    console.log('[Alert Service] Initialized with config:', this.config);
  }

  /**
   * Register an alert handler
   * @param {Function} handler - Function(alert) => void
   */
  addHandler(handler) {
    if (typeof handler === 'function') {
      this.handlers.push(handler);
    }
  }

  /**
   * Check all alert conditions
   * @returns {Array} Array of triggered alerts
   */
  async checkAlerts() {
    if (!this.config.enabled) {
      return [];
    }

    const alerts = [];

    try {
      // Check daily cost
      const dailyCostAlert = await this.checkDailyCost();
      if (dailyCostAlert) alerts.push(dailyCostAlert);

      // Check monthly cost
      const monthlyCostAlert = await this.checkMonthlyCost();
      if (monthlyCostAlert) alerts.push(monthlyCostAlert);

      // Check request rate
      const requestRateAlert = await this.checkRequestRate();
      if (requestRateAlert) alerts.push(requestRateAlert);

      // Check error rate
      const errorRateAlert = await this.checkErrorRate();
      if (errorRateAlert) alerts.push(errorRateAlert);

      // Send alerts to handlers
      for (const alert of alerts) {
        this.sendAlert(alert);
      }

      return alerts;
    } catch (error) {
      console.error('[Alert Service] Error checking alerts:', error.message);
      return [];
    }
  }

  /**
   * Check daily cost limit
   */
  async checkDailyCost() {
    if (!this.shouldCheckAlert('dailyCost')) {
      return null;
    }

    const today = new Date().toISOString().split('T')[0];
    const stats = this.analyticsService.getLLMStats({
      startDate: today,
      endDate: today
    });

    const dailyCost = parseFloat(stats.overall.totalCost);

    if (dailyCost >= this.config.dailyCostLimit) {
      this.lastAlerts.dailyCost = Date.now();

      return {
        type: 'DAILY_COST_EXCEEDED',
        severity: 'warning',
        message: `每日成本已達 $${dailyCost.toFixed(4)}（限額：$${this.config.dailyCostLimit}）`,
        data: {
          current: dailyCost,
          limit: this.config.dailyCostLimit,
          percentage: (dailyCost / this.config.dailyCostLimit * 100).toFixed(1),
          date: today
        },
        timestamp: new Date().toISOString()
      };
    }

    return null;
  }

  /**
   * Check monthly cost limit
   */
  async checkMonthlyCost() {
    if (!this.shouldCheckAlert('monthlyCost')) {
      return null;
    }

    // Get current month data
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    const stats = this.analyticsService.getLLMStats({
      startDate: startOfMonth,
      endDate: now.toISOString().split('T')[0]
    });

    const monthlyCost = parseFloat(stats.overall.totalCost);

    if (monthlyCost >= this.config.monthlyCostLimit) {
      this.lastAlerts.monthlyCost = Date.now();

      return {
        type: 'MONTHLY_COST_EXCEEDED',
        severity: 'critical',
        message: `本月成本已達 $${monthlyCost.toFixed(4)}（限額：$${this.config.monthlyCostLimit}）`,
        data: {
          current: monthlyCost,
          limit: this.config.monthlyCostLimit,
          percentage: (monthlyCost / this.config.monthlyCostLimit * 100).toFixed(1),
          month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        },
        timestamp: new Date().toISOString()
      };
    }

    return null;
  }

  /**
   * Check request rate (last hour)
   */
  async checkRequestRate() {
    if (!this.shouldCheckAlert('requestRate')) {
      return null;
    }

    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const stats = this.analyticsService.getLLMStats({
      startDate: oneHourAgo
    });

    const hourlyRequests = stats.overall.totalRequests;

    if (hourlyRequests >= this.config.hourlyRequestLimit) {
      this.lastAlerts.requestRate = Date.now();

      return {
        type: 'REQUEST_RATE_HIGH',
        severity: 'warning',
        message: `過去一小時請求數達 ${hourlyRequests}（限額：${this.config.hourlyRequestLimit}）`,
        data: {
          current: hourlyRequests,
          limit: this.config.hourlyRequestLimit,
          percentage: (hourlyRequests / this.config.hourlyRequestLimit * 100).toFixed(1)
        },
        timestamp: new Date().toISOString()
      };
    }

    return null;
  }

  /**
   * Check error rate
   */
  async checkErrorRate() {
    if (!this.shouldCheckAlert('errorRate')) {
      return null;
    }

    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const stats = this.analyticsService.getLLMStats({
      startDate: oneHourAgo
    });

    const totalRequests = stats.overall.totalRequests;
    const failedRequests = stats.overall.failedRequests;

    if (totalRequests === 0) {
      return null;
    }

    const errorRate = (failedRequests / totalRequests) * 100;

    if (errorRate >= this.config.errorRateThreshold) {
      this.lastAlerts.errorRate = Date.now();

      return {
        type: 'ERROR_RATE_HIGH',
        severity: 'critical',
        message: `錯誤率達 ${errorRate.toFixed(1)}%（閾值：${this.config.errorRateThreshold}%）`,
        data: {
          errorRate: errorRate.toFixed(1),
          threshold: this.config.errorRateThreshold,
          failedRequests,
          totalRequests
        },
        timestamp: new Date().toISOString()
      };
    }

    return null;
  }

  /**
   * Check if we should send an alert (cooldown logic)
   */
  shouldCheckAlert(alertType) {
    const lastAlertTime = this.lastAlerts[alertType];

    if (!lastAlertTime) {
      return true;
    }

    const cooldownMs = this.config.alertCooldown * 60 * 1000;
    const timeSinceLastAlert = Date.now() - lastAlertTime;

    return timeSinceLastAlert >= cooldownMs;
  }

  /**
   * Send alert to all handlers
   */
  sendAlert(alert) {
    console.log(`[Alert Service] 🚨 ${alert.severity.toUpperCase()}: ${alert.message}`);

    for (const handler of this.handlers) {
      try {
        handler(alert);
      } catch (error) {
        console.error('[Alert Service] Handler error:', error.message);
      }
    }
  }

  /**
   * Get current alert status
   */
  getAlertStatus() {
    return {
      enabled: this.config.enabled,
      config: this.config,
      lastAlerts: {
        dailyCost: this.lastAlerts.dailyCost ? new Date(this.lastAlerts.dailyCost).toISOString() : null,
        monthlyCost: this.lastAlerts.monthlyCost ? new Date(this.lastAlerts.monthlyCost).toISOString() : null,
        requestRate: this.lastAlerts.requestRate ? new Date(this.lastAlerts.requestRate).toISOString() : null,
        errorRate: this.lastAlerts.errorRate ? new Date(this.lastAlerts.errorRate).toISOString() : null
      }
    };
  }

  /**
   * Update alert configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('[Alert Service] Configuration updated:', this.config);
  }

  /**
   * Reset alert cooldowns (for testing)
   */
  resetCooldowns() {
    this.lastAlerts = {
      dailyCost: null,
      monthlyCost: null,
      requestRate: null,
      errorRate: null
    };
  }
}

module.exports = AlertService;
