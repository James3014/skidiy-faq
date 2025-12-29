// Analytics module: centralizes tracking calls and session handling
(function (global) {
  const Analytics = {
    apiBase: (global.ApiClient && global.ApiClient.baseUrl) || global.API_BASE || '/api/v1',

    getSessionId() {
      const key = 'faq_session_id';
      try {
        const storage = global.sessionStorage || global.localStorage;
        let id = storage.getItem(key);
        if (!id) {
          id = (global.crypto?.randomUUID?.() || `sess_${Date.now()}_${Math.random().toString(16).slice(2)}`);
          storage.setItem(key, id);
        }
        return id;
      } catch (error) {
        console.warn('[Analytics] Failed to access storage for session id:', error);
        return `sess_${Date.now()}`;
      }
    },

    async trackFAQInteraction({ faqId, language = 'zh', source = 'search_results', position = null, clicked = true, query = null, userId = null, lastSearchQuery = null }) {
      if (!faqId) return;
      const payload = {
        faq_id: faqId,
        clicked,
        language,
        source,
        position: typeof position === 'number' ? position : (Number.isFinite(position) ? position : null),
        query_text: query || lastSearchQuery || null,
        session_id: this.getSessionId(),
        user_id: userId || null,
        timestamp: new Date().toISOString()
      };
      try {
        const response = await fetch(`${this.apiBase}/analytics/track-faq-view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[Analytics] API returned ${response.status}:`, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
        }
        try {
          const localClicks = JSON.parse(localStorage.getItem('faq_clicks') || '[]');
          localClicks.push({ ...payload, _debug_only: true });
          if (localClicks.length > 500) localClicks.splice(0, localClicks.length - 500);
          localStorage.setItem('faq_clicks', JSON.stringify(localClicks));
        } catch (storageError) {
          console.warn('[Analytics] Failed to save to localStorage:', storageError);
        }
      } catch (error) {
        console.warn('[Analytics] Failed to track FAQ interaction:', error);
      }
    },

    async trackSectionClick(section, language = 'zh') {
      try {
        const sectionClick = {
          timestamp: new Date().toISOString(),
          section,
          language
        };
        const clicks = JSON.parse(localStorage.getItem('sectionClicks') || '[]');
        clicks.push(sectionClick);
        if (clicks.length > 100) clicks.shift();
        localStorage.setItem('sectionClicks', JSON.stringify(clicks));
        await fetch(`${this.apiBase}/analytics/track-section-click`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sectionClick)
        });
      } catch (error) {
        console.error('[Analytics] Section Click Error:', error);
      }
    },

    async trackRegionClick(region, language = 'zh') {
      try {
        const regionClick = {
          timestamp: new Date().toISOString(),
          click_type: 'region',
          region,
          language
        };
        const clicks = JSON.parse(localStorage.getItem('resortClicks') || '[]');
        clicks.push(regionClick);
        if (clicks.length > 100) clicks.shift();
        localStorage.setItem('resortClicks', JSON.stringify(clicks));
        await fetch(`${this.apiBase}/analytics/track-resort-click`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(regionClick)
        });
      } catch (error) {
        console.error('[Analytics] Region Click Error:', error);
      }
    },

    async trackResortClick(resortId, language = 'zh') {
      try {
        const resortClick = {
          timestamp: new Date().toISOString(),
          click_type: 'resort_card',
          resort_id: resortId,
          language
        };
        const clicks = JSON.parse(localStorage.getItem('resortClicks') || '[]');
        clicks.push(resortClick);
        if (clicks.length > 100) clicks.shift();
        localStorage.setItem('resortClicks', JSON.stringify(clicks));
        await fetch(`${this.apiBase}/analytics/track-resort-click`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resortClick)
        });
      } catch (error) {
        console.error('[Analytics] Resort Click Error:', error);
      }
    },

    async trackResortEngagement({ engagementType, resortId, resortName, language = 'zh' }) {
      try {
        const engagement = {
          timestamp: new Date().toISOString(),
          click_type: 'resort_engagement',
          engagement_type: engagementType,
          resort_id: resortId,
          resort_name: resortName,
          language
        };
        try {
          let engagements = JSON.parse(localStorage.getItem('resortEngagements') || '[]');
          if (!Array.isArray(engagements)) engagements = [];
          engagements.push(engagement);
          if (engagements.length > 100) engagements.shift();
          localStorage.setItem('resortEngagements', JSON.stringify(engagements));
        } catch (e) {
          console.warn('[Analytics] Failed to parse data, resetting:', e);
          localStorage.setItem('resortEngagements', JSON.stringify([engagement]));
        }
        await fetch(`${this.apiBase}/analytics/track-resort-engagement`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(engagement)
        });
      } catch (error) {
        console.error('[Analytics] Resort Engagement Error:', error);
      }
    }
  };

  global.Analytics = Analytics;
  // Legacy globals for inline handlers
  global.getFaqSessionId = Analytics.getSessionId.bind(Analytics);
  global.trackFAQInteraction = (payload) => Analytics.trackFAQInteraction(payload);
  global.trackSectionClick = (section) => Analytics.trackSectionClick(section, global.currentLanguage || 'zh');
  global.trackRegionClick = (region) => Analytics.trackRegionClick(region, global.currentLanguage || 'zh');
  global.trackResortClick = (resortId) => Analytics.trackResortClick(resortId, global.currentLanguage || 'zh');
  global.trackResortEngagement = (event, engagementType, resortId, resortName) =>
    Analytics.trackResortEngagement({ engagementType, resortId, resortName, language: global.currentLanguage || 'zh' });
})(window);
