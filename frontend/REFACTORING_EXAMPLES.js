/**
 * FAQ Card Generation - Refactoring Examples
 * 
 * This file demonstrates how to refactor the duplicate code
 * identified in the analysis report.
 */

// 1. Helper: Calculate Confidence Badge
function calculateConfidenceBadge(score) {
  const confidence = score ? Math.round((1 - score) * 100) : 100;
  const confidenceClass = confidence >= 80 ? 'confidence-high' :
                         confidence >= 60 ? 'confidence-medium' : 'confidence-low';
  return { confidence, confidenceClass };
}

// 2. Helper: Feedback Buttons HTML
function getFeedbackButtonsHTML(language = 'zh') {
  const labels = {
    en: { question: 'Was this helpful?', helpful: 'Helpful', notHelpful: 'Not helpful' },
    th: { question: 'มีประโยชน์หรือไม่', helpful: 'มีประโยชน์', notHelpful: 'ไม่มีประโยชน์' },
    zh: { question: '這個資訊有幫助嗎？', helpful: '有幫助', notHelpful: '沒幫助' }
  };
  const label = labels[language] || labels.zh;
  return `<div class="feedback-section">
    <span class="feedback-label">${label.question}</span>
    <div class="feedback-buttons">
      <button class="btn-helpful" onclick="openFeedbackModal(this)">${label.helpful}</button>
      <button class="btn-not-helpful" onclick="openFeedbackModal(this)">${label.notHelpful}</button>
    </div>
  </div>`;
}

// 3. Helper: Generate FAQ Tags HTML
function generateFAQTagsHTML(faq, language = 'zh') {
  if (!faq.crm_tags || faq.crm_tags.length === 0) return '';
  const tagsHTML = faq.crm_tags.map(tag => {
    const displayTag = DOMPurify.sanitize(getFaqTagLabel(tag, language));
    const sanitizedTag = DOMPurify.sanitize(tag);
    return `<span class="faq-tag" onclick="trackTagClick(event, 'faq', '${sanitizedTag}', '${faq.id}')">${displayTag}</span>`;
  }).join('');
  return `<div class="faq-tags">${tagsHTML}</div>`;
}

// 4. Helper: Create FAQ Data Attributes
function createFAQDataAttributes(faq, options = {}) {
  const { source = 'search_results', position = null, query = null } = options;
  return {
    'data-faq-id': faq.id,
    'data-source': DOMPurify.sanitize(source),
    'data-position': position ? String(position) : '',
    'data-query': query ? DOMPurify.sanitize(query) : ''
  };
}

function dataAttributesToString(attrs) {
  return Object.entries(attrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
}

// 5. MAIN: Generate Complete FAQ Card HTML
function generateFAQCard(faq, options = {}) {
  const {
    currentLanguage = 'zh', showConfidence = true, showTags = true,
    showFeedback = true, showPostscript = true, source = 'search_results',
    position = null, query = null, index = null
  } = options;

  const finalPosition = position !== null ? position : (index !== null ? index + 1 : null);
  const localized = faqEngine.getLocalizedContent(faq, currentLanguage);
  const question = DOMPurify.sanitize(localized.question || faq.canonical_question || '');
  
  // Process answer with link parsing
  const answer = parseLinksInText(localized.answer || 'No answer');
  const postscript = localized.postscript
    ? `<div class="faq-postscript">${parseLinksInText(localized.postscript)}</div>`
    : '';
  
  const { confidence, confidenceClass } = calculateConfidenceBadge(faq.score);
  const tagsHTML = showTags ? generateFAQTagsHTML(faq, currentLanguage) : '';
  const feedbackHTML = showFeedback ? getFeedbackButtonsHTML(currentLanguage) : '';
  
  const dataAttrs = createFAQDataAttributes(faq, { 
    source, position: finalPosition, query 
  });
  const dataAttrString = dataAttributesToString(dataAttrs);
  const confidenceHTML = showConfidence 
    ? `<span class="confidence-badge ${confidenceClass}">信心度 ${confidence}%</span>` 
    : '';
  const postscriptHTML = showPostscript ? postscript : '';

  return `<div class="faq-item" ${dataAttrString}>
    <div class="faq-header">
      <div class="faq-question">
        ${question}
        ${confidenceHTML}
      </div>
      <span class="faq-toggle-icon">▼</span>
    </div>
    ${tagsHTML}
    <div class="faq-answer">
      ${answer}
      ${postscriptHTML}
    </div>
    ${feedbackHTML}
  </div>`;
}

// 6. Event Binding Helper
function bindFAQItemEvents(selector = '.faq-item') {
  document.querySelectorAll(selector).forEach(item => {
    item.addEventListener('click', (e) => {
      toggleFAQItem(item);
    });
  });
}

// USAGE EXAMPLES:
// 
// In displayFAQs():
//   const resultsHTML = faqs.map((faq, index) =>
//     generateFAQCard(faq, {
//       currentLanguage,
//       source: 'search_results',
//       index,
//       query: lastSearchQuery
//     })
//   ).join('');
//
// In displayFAQsInModal():
//   const faqsHtml = faqs.map((faq, index) =>
//     generateFAQCard(faq, {
//       currentLanguage,
//       source: 'section_modal',
//       index,
//       showPostscript: false
//     })
//   ).join('');
//
// In showFAQDetail():
//   const singleResultHTML = generateFAQCard(faq, {
//     currentLanguage,
//     source: 'hot_list',
//     position: 1,
//     showConfidence: false
//   });
