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
        onclick="ParkFAQ.trackTagClick('${DOMPurify.sanitize(tag.name)}', '${card.id}', '${card.park_slug}')"
        style="cursor: pointer; display: inline-block; background: #f0f0f0; padding: 0.25rem 0.75rem; border-radius: 12px; margin-right: 0.5rem; font-size: 0.85rem; border: 1px solid #ddd;">
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

  // Public API
  return {
    loadAndDisplay,
    loadCards,
    generateSectionHTML,
    trackTagClick,
    trackCardView
  };
})();
