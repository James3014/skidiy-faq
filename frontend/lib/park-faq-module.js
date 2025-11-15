/**
 * Park FAQ Module
 *
 * Handles Park FAQ card display and interactions
 * Integrates with index.html without bloating it
 *
 * Usage:
 *   ParkFAQ.loadAndDisplay(parkSlug, parkName, language)
 */

const ParkFAQ = (() => {
  const API_BASE = window.API_BASE || window.ENV_API_BASE || 'http://localhost:3000/api/v1';

  /**
   * Load Park FAQ cards from API
   */
  async function loadCards(parkSlug, language = 'zh') {
    try {
      const response = await fetch(
        `${API_BASE}/park-faq/cards?park_slug=${encodeURIComponent(parkSlug)}&lang=${language}`
      );

      if (!response.ok) {
        console.warn(`[Park FAQ] Failed to load cards for ${parkSlug}`);
        return null;
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('[Park FAQ] Error loading cards:', error);
      return null;
    }
  }

  /**
   * Generate HTML for a single Park FAQ card
   */
  function generateCardHTML(card, language = 'zh') {
    const question = card.question;
    const answer = card.answer;
    const tags = card.tags || [];

    const tagsHTML = tags.map(tag => `
      <span
        class="park-faq-tag"
        onclick="ParkFAQ.handleTagClick('${DOMPurify.sanitize(tag.name)}', '${card.id}', '${card.park_slug}', window.currentLanguage || 'zh')"
        style="cursor: pointer; display: inline-block; background: #e3f2fd; padding: 0.25rem 0.75rem; border-radius: 12px; margin-right: 0.5rem; font-size: 0.85rem; border: 1px solid #2196f3; color: #1976d2; font-weight: 500;">
        ${DOMPurify.sanitize(tag.name)}
      </span>
    `).join('');

    return `
      <div class="park-faq-card" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; background: #fafafa;">
        <div style="margin-bottom: 0.75rem;">
          <button
            style="background: none; border: none; text-align: left; width: 100%; cursor: pointer; padding: 0; font-size: 1rem; font-weight: 600; color: #2D395C;"
            onclick="this.parentElement.parentElement.querySelector('.park-faq-content').style.display = this.parentElement.parentElement.querySelector('.park-faq-content').style.display === 'none' ? 'block' : 'none';">
            ▶ ${DOMPurify.sanitize(question)}
          </button>
        </div>

        <div class="park-faq-content" style="display: none; margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #e5e7eb;">
          <p style="color: #47596C; line-height: 1.6; margin-bottom: 0.75rem;">
            ${DOMPurify.sanitize(answer)}
          </p>
          <div class="park-faq-tags" style="margin-top: 0.75rem;">
            ${tagsHTML}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate Park FAQ section HTML
   */
  function generateSectionHTML(data, language = 'zh', options = {}) {
    const cards = data.cards || [];
    const cardsHTML = cards.map(card => generateCardHTML(card, language)).join('');
    const title = options.title
      ? DOMPurify.sanitize(options.title)
      : `${DOMPurify.sanitize(data.park_cname)} - FAQ 卡片`;

    return `
      <div class="park-faq-section" style="margin-bottom: 2rem; padding: 1.5rem; background: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb;">
        <h3 style="margin-bottom: 1rem; font-size: 1.25rem; color: #2D395C;">
          ${title}
        </h3>
        <div class="park-faq-list">
          ${cardsHTML}
        </div>
      </div>
    `;
  }

  /**
   * Display Park FAQ cards in the modal
   */
  function displayInModal(data, parkName, language = 'zh') {
    const modalResultsList = document.getElementById('modalResultsList');
    if (!modalResultsList) {
      console.warn('[Park FAQ] Modal results list not found');
      return;
    }

    // 儲存資料以供標籤過濾使用
    setParkFaqData(data, data.cards || []);

    // 在現有 FAQ 前面插入 Park FAQ 卡片
    const parkFaqHTML = generateSectionHTML(data, language);
    const separator = '<hr style="margin: 2rem 0; border: none; border-top: 2px solid #e5e7eb;">';

    // 保存原有內容（如果有的話）
    const existingContent = modalResultsList.innerHTML;

    // 如果已有 FAQ，則在前面添加 Park FAQ
    if (existingContent && existingContent.trim()) {
      modalResultsList.innerHTML = parkFaqHTML + separator + existingContent;
    } else {
      modalResultsList.innerHTML = parkFaqHTML;
    }
  }

  /**
   * Load and display Park FAQ cards
   * Main entry point from index.html
   */
  async function loadAndDisplay(parkSlug, parkName, language = 'zh') {
    console.log(`[Park FAQ] Loading cards for: ${parkName} (${parkSlug})`);

    const data = await loadCards(parkSlug, language);
    if (!data || !data.cards || data.cards.length === 0) {
      console.log(`[Park FAQ] No cards found for ${parkSlug}`);
      return false;
    }

    displayInModal(data, parkName, language);
    return true;
  }

  /**
   * Track tag click event
   */
  async function trackTagClick(tagName, cardId, parkSlug) {
    try {
      const sessionId = window.getFaqSessionId?.() || localStorage.getItem('faq_session_id') || 'anonymous';

      const response = await fetch(
        `${API_BASE}/park-faq/track-tag-click`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tag_name: tagName,
            card_id: cardId,
            park_slug: parkSlug,
            language: window.currentLanguage || 'zh',
            session_id: sessionId
          })
        }
      );

      if (response.ok) {
        console.log(`[Park FAQ] Tracked tag click: ${tagName}`);
      }
    } catch (error) {
      console.warn('[Park FAQ] Failed to track tag click:', error);
    }
  }

  /**
   * Track card view event
   */
  async function trackCardView(cardId, parkSlug) {
    try {
      const sessionId = window.getFaqSessionId?.() || localStorage.getItem('faq_session_id') || 'anonymous';

      const response = await fetch(
        `${API_BASE}/park-faq/track-card-view`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            card_id: cardId,
            park_slug: parkSlug,
            language: window.currentLanguage || 'zh',
            session_id: sessionId
          })
        }
      );

      if (response.ok) {
        console.log(`[Park FAQ] Tracked card view: ${cardId}`);
      }
    } catch (error) {
      console.warn('[Park FAQ] Failed to track card view:', error);
    }
  }

  /**
   * Filter and display Park FAQ cards by tag
   */
  function filterCardsByTag(cards, tagName) {
    if (!tagName) return cards;

    return cards.filter(card => {
      if (!card.tags || !Array.isArray(card.tags)) return false;
      return card.tags.some(tag => tag.name === tagName);
    });
  }

  /**
   * Display filtered Park FAQ cards
   */
  function displayFilteredCards(data, filteredCards, tagName, language = 'zh') {
    const modalResultsList = document.getElementById('modalResultsList');
    if (!modalResultsList) {
      console.warn('[Park FAQ] Modal results list not found for filtered display');
      return;
    }

    // 生成過濾後的卡片 HTML
    const filteredCardsHTML = filteredCards.map(card => generateCardHTML(card, language)).join('');

    // 構建過濾結果標題
    const title = `${DOMPurify.sanitize(data.park_cname)} - ${DOMPurify.sanitize(tagName)} (${filteredCards.length} 筆)`;

    const filteredHTML = `
      <div class="park-faq-section" style="margin-bottom: 2rem; padding: 1.5rem; background: #fff3cd; border-radius: 8px; border: 2px solid #ffc107;">
        <h3 style="margin-bottom: 1rem; font-size: 1.25rem; color: #856404;">
          🏷️ 篩選結果: ${title}
          <button
            onclick="document.querySelector('.park-faq-section').remove();"
            style="float: right; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #856404;">
            ✕
          </button>
        </h3>
        <div class="park-faq-list">
          ${filteredCardsHTML}
        </div>
      </div>
    `;

    // 在現有內容前插入過濾結果
    const existingContent = modalResultsList.innerHTML;
    modalResultsList.innerHTML = filteredHTML + existingContent;

    console.log(`[Park FAQ] Displayed ${filteredCards.length} filtered cards for tag: ${tagName}`);
  }

  /**
   * Handle tag click with filtering
   */
  async function handleTagClick(tagName, cardId, parkSlug, language = 'zh') {
    try {
      // Track the click
      await trackTagClick(tagName, cardId, parkSlug);

      // Get current displayed cards
      const cards = loadParkFaqCardsData();
      if (!cards || cards.length === 0) {
        console.warn('[Park FAQ] No cards data available for filtering');
        return;
      }

      // Filter cards by tag
      const filtered = filterCardsByTag(cards, tagName);
      if (filtered.length === 0) {
        console.warn(`[Park FAQ] No cards found with tag: ${tagName}`);
        return;
      }

      // Get park data for display
      const parkData = getParkFaqData();
      if (!parkData) {
        console.warn('[Park FAQ] No park data available');
        return;
      }

      // Display filtered results
      displayFilteredCards(parkData, filtered, tagName, language);
    } catch (error) {
      console.error('[Park FAQ] Error handling tag click:', error);
    }
  }

  // Store current cards and park data globally for filtering
  let currentParkCards = null;
  let currentParkData = null;

  function loadParkFaqCardsData() {
    return currentParkCards;
  }

  function getParkFaqData() {
    return currentParkData;
  }

  function setParkFaqData(data, cards) {
    currentParkData = data;
    currentParkCards = cards;
  }

  // Public API
  return {
    loadAndDisplay,
    loadCards,
    generateSectionHTML,
    trackTagClick,
    trackCardView,
    filterCardsByTag,
    displayFilteredCards,
    handleTagClick,
    setParkFaqData
  };
})();
