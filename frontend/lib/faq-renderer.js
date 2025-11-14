/**
 * FAQ Renderer - 公共 FAQ 渲染函數庫
 *
 * 目的：消除 displayFAQs, showFAQDetail, displayFAQsInModal 之間的代碼重複
 * 提取率：5 個函數，消除 ~80 行重複代碼
 *
 * 使用方式：
 *   const html = FAQRenderer.generateFAQCard(faq, currentLanguage, options);
 *   const feedbackHTML = FAQRenderer.getFeedbackButtonsHTML(currentLanguage);
 *   etc.
 */

const FAQRenderer = {
  /**
   * 生成單個 FAQ 卡片 HTML
   * @param {Object} faq - FAQ 項目
   * @param {string} currentLanguage - 當前語言
   * @param {Object} options - 選項 (包含 includeFeedback, includeIcon 等)
   * @returns {string} FAQ 卡片 HTML
   */
  generateFAQCard(faq, currentLanguage, options = {}) {
    const {
      includeFeedback = true,
      includeIcon = true,
      includePostscript = true
    } = options;

    // 獲取本地化內容
    const localized = this.getLocalizedContent(faq, currentLanguage);
    const question = DOMPurify.sanitize(localized.question || faq.canonical_question || '');
    const answer = this.parseLinksInText(localized.answer || '無答案內容');

    // 後記
    const postscript = localized.postscript && includePostscript
      ? `<div class="faq-postscript">${this.parseLinksInText(localized.postscript)}</div>`
      : '';

    // 信心度徽章
    const confidenceBadge = this.calculateConfidenceBadge(faq.score);

    // 標籤 HTML
    const tagsHTML = this.generateFAQTagsHTML(faq, currentLanguage);

    // 反饋按鈕
    const feedbackHTML = includeFeedback ? this.getFeedbackButtonsHTML(currentLanguage) : '';

    // 切換圖標
    const toggleIcon = includeIcon ? '<span class="faq-toggle-icon">▼</span>' : '';

    // 組合完整 HTML
    return `
      <div class="faq-item" data-faq-id="${faq.id}" data-faq-index="${faq.index || 0}">
        <div class="faq-header">
          <div class="faq-question">
            ${question}
            ${confidenceBadge}
          </div>
          ${toggleIcon}
        </div>
        ${tagsHTML}
        <div class="faq-answer">
          ${answer}
          ${postscript}
        </div>
        ${feedbackHTML}
      </div>
    `;
  },

  /**
   * 計算信心度徽章 HTML
   * @param {number} score - Fuse.js 匹配分數 (0-1)
   * @returns {string} 信心度徽章 HTML
   */
  calculateConfidenceBadge(score) {
    const confidence = score ? Math.round((1 - score) * 100) : 100;
    const confidenceClass = confidence >= 80 ? 'confidence-high' :
                           confidence >= 60 ? 'confidence-medium' : 'confidence-low';

    return `<span class="confidence-badge ${confidenceClass}">${confidence}%</span>`;
  },

  /**
   * Phase 4.5: Simplified getLocalizedContent - no backward compatibility
   * API always returns content in simplified format (content + metadata)
   * @param {Object} faq - FAQ 項目（來自 Phase 4.1+ API）
   * @param {string} language - 語言代碼（目前未使用，API 已處理語言）
   * @returns {Object} 本地化內容
   */
  getLocalizedContent(faq, language) {
    // Phase 4.5: API 已經提供了簡化格式，直接使用 content
    if (faq.content) {
      return {
        question: faq.content.question || '',
        answer: faq.content.answer || '',
        postscript: faq.content.postscript || ''
      };
    }

    // 如果沒有 content 欄位，返回空內容（應該不會發生）
    console.warn('[FAQ Renderer] FAQ item missing content field:', faq.id);
    return {
      question: '',
      answer: '',
      postscript: ''
    };
  },

  /**
   * 生成反饋按鈕 HTML
   * @param {string} language - 當前語言
   * @returns {string} 反饋按鈕 HTML
   */
  getFeedbackButtonsHTML(language) {
    const labels = {
      'en': 'Was this helpful?',
      'th': 'มีประโยชน์หรือไม่?',
      'zh': '這個回答有幫助嗎？'
    };
    const yesLabels = {
      'en': 'Yes',
      'th': 'ใช่',
      'zh': '有幫助'
    };
    const noLabels = {
      'en': 'No',
      'th': 'ไม่',
      'zh': '沒有幫助'
    };

    const label = labels[language] || labels['zh'];
    const yesLabel = yesLabels[language] || yesLabels['zh'];
    const noLabel = noLabels[language] || noLabels['zh'];

    return `
      <div class="feedback-section">
        <span class="feedback-label">${label}</span>
        <div class="feedback-buttons">
          <button class="btn-helpful" onclick="openFeedbackModal(this)" title="${yesLabel}">
            👍 ${yesLabel}
          </button>
          <button class="btn-not-helpful" onclick="openFeedbackModal(this)" title="${noLabel}">
            👎 ${noLabel}
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Phase 4.5: Simplified generateFAQTagsHTML - uses metadata.crm_tags
   * @param {Object} faq - FAQ 項目（來自 Phase 4.1+ API）
   * @param {string} language - 當前語言
   * @returns {string} 標籤 HTML
   */
  generateFAQTagsHTML(faq, language) {
    // Phase 4.5: 新格式有 metadata.crm_tags
    const crm_tags = faq.metadata?.crm_tags;

    if (!crm_tags || !Array.isArray(crm_tags) || crm_tags.length === 0) {
      return '';
    }

    const tagLabels = {
      'INTENT_BOOKING': { zh: '預約', en: 'Booking', th: 'การจอง' },
      'INTENT_INSTRUCTOR': { zh: '教練', en: 'Instructor', th: 'วิทยากร' },
      'INTENT_EQUIPMENT': { zh: '裝備', en: 'Equipment', th: 'อุปกรณ์' },
      'INTENT_SAFETY': { zh: '安全', en: 'Safety', th: 'ความปลอดภัย' },
      'INTENT_COURSE': { zh: '課程', en: 'Course', th: 'คอร์ส' }
    };

    const tagElements = crm_tags
      .map(tag => {
        const label = tagLabels[tag]?.[language] || tag;
        return `<span class="faq-tag" data-tag="${tag}">${label}</span>`;
      })
      .join('');

    return `<div class="faq-tags">${tagElements}</div>`;
  },

  /**
   * 綁定 FAQ 項目點擊事件（委托事件）
   * @param {string} containerSelector - 容器選擇器
   * @param {Function} callback - 點擊時的回調函數
   */
  bindFAQItemEvents(containerSelector, callback = null) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.querySelectorAll('.faq-item').forEach(item => {
      item.addEventListener('click', (e) => {
        // 不要在點擊反饋按鈕時觸發切換
        if (e.target.closest('.feedback-buttons')) return;

        // 調用回調或默認行為
        if (callback) {
          callback(item);
        } else {
          this.toggleFAQItem(item);
        }
      });
    });
  },

  /**
   * 切換 FAQ 項目的展開/收縮
   * @param {HTMLElement} item - FAQ 項目 DOM 元素
   */
  toggleFAQItem(item) {
    if (!item) return;

    item.classList.toggle('expanded');

    // 更新圖標
    const icon = item.querySelector('.faq-toggle-icon');
    if (icon) {
      icon.textContent = item.classList.contains('expanded') ? '▲' : '▼';
    }
  },

  /**
   * 解析文本中的鏈接（使用 meta.link_tokens）
   * @param {string} text - 要解析的文本
   * @returns {string} 包含鏈接的 HTML
   */
  parseLinksInText(text) {
    if (!text) return '';

    // 使用 DOMPurify 清理輸入
    let cleaned = DOMPurify.sanitize(text);

    // 如果有 meta 對象和 link_tokens，進行替換
    if (typeof meta !== 'undefined' && meta.link_tokens) {
      Object.entries(meta.link_tokens).forEach(([key, url]) => {
        // 匹配 [link_key] 格式的標記
        const regex = new RegExp(`\\[${key}\\]`, 'g');
        const linkHtml = `<a href="${DOMPurify.sanitize(url)}" target="_blank" rel="noopener noreferrer">[${key}] 🔗</a>`;
        cleaned = cleaned.replace(regex, linkHtml);
      });
    }

    return cleaned;
  }
};

// 導出模塊（支持 Node.js 和瀏覽器）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FAQRenderer;
}
