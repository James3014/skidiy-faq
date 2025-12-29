// Resort module: rendering, filtering, pagination, engagement tracking
// Expects Analytics module for tracking.
(function (global) {
  const RESORTS_PER_PAGE = 15;

  function renderRegions({ data, onRegionSelect, getRegionDisplayName }) {
    const container = document.getElementById('resortRegions');
    if (!container) return;
    const byRegion = {};
    data.resorts.forEach(resort => {
      const region = resort.region || 'Others';
      byRegion[region] = byRegion[region] || [];
      byRegion[region].push(resort);
    });
    const regionsHTML = Object.entries(byRegion)
      .sort((a, b) => b[1].length - a[1].length)
      .map(([region, resorts]) => `
        <div class="resort-region" data-region="${region}">
          <span>${getRegionDisplayName(region)}</span>
          <span class="resort-count">(${resorts.length})</span>
        </div>
      `).join('');
    container.innerHTML = regionsHTML;
    container.querySelectorAll('.resort-region').forEach(el => {
      el.addEventListener('click', () => onRegionSelect(regionByElement(el, byRegion)));
    });
    return byRegion;
  }

  function regionByElement(el, byRegion) {
    return { region: el.dataset.region, resorts: byRegion[el.dataset.region] || [] };
  }

  function paginate(resorts, page) {
    const startIdx = (page - 1) * RESORTS_PER_PAGE;
    return resorts.slice(startIdx, startIdx + RESORTS_PER_PAGE);
  }

  function renderResortPage({ regionName, resorts, page, totalPages, createCard, title, onPageChange }) {
    const resortsHTML = paginate(resorts, page).map(createCard).join('');
    const paginationHTML = totalPages > 1 ? `
      <div class="resort-pagination">
        <button data-page="${page - 1}" ${page === 1 ? 'disabled' : ''} class="resort-page-btn prev">${title.prev}</button>
        <span class="resort-page-status">${title.pageStatus(page, totalPages)}</span>
        <button data-page="${page + 1}" ${page === totalPages ? 'disabled' : ''} class="resort-page-btn next">${title.next}</button>
      </div>
    ` : '';
    const modal = document.getElementById('resultsModal');
    const list = document.getElementById('modalResultsList');
    const modalTitle = document.getElementById('modalTitle');
    if (modal && list && modalTitle) {
      list.innerHTML = resortsHTML + paginationHTML;
      modalTitle.textContent = title.header;
      modal.classList.add('show');
      list.querySelectorAll('.resort-page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const newPage = Number(btn.dataset.page);
          onPageChange(newPage);
        });
      });
    }
  }

  function renderResortCard({ resort, locale, getResortDisplayNames, getRegionDisplayName, resolveLink, trackEngagement, currentLanguage }) {
    const { primary, secondary } = getResortDisplayNames(resort, currentLanguage);
    const regionDisplay = getRegionDisplayName(resort.region || '', currentLanguage);
    const lifts = resort.snow_stats?.lifts ?? resort.lifts ?? '—';
    const courses = resort.snow_stats?.courses_total ?? resort.courses ?? '—';
    const nightSki = Boolean(resort.snow_stats?.night_ski ?? resort.night_ski);
    const pricing = resort.pricing || {};
    const amenities = resort.amenities || [];
    const resortLinks = {
      official_site: resolveLink('official_site', resort),
      booking_page: resolveLink('booking_page', resort),
      google_maps: resolveLink('google_maps', resort),
      snow_report: resort.snow_report_url ? resolveLink('snow_report', resort) : null
    };
    const linksDataAttr = JSON.stringify(resortLinks).replace(/"/g, '&quot;');
    const priceParts = [];
    let adultPrice = pricing.one_day_adult ?? null;
    let childPrice = pricing.one_day_child ?? null;
    let pricingTypeLabel = '';
    if (Array.isArray(pricing.ticket_types)) {
      const dayTicket = pricing.ticket_types.find(ticket => /1-day/i.test(ticket.type)) || pricing.ticket_types[0];
      if (dayTicket) {
        pricingTypeLabel = dayTicket.type || '';
        if (adultPrice === null || adultPrice === undefined) {
          adultPrice = dayTicket.adult ?? dayTicket.general ?? dayTicket.price ?? null;
        }
        if (childPrice === null || childPrice === undefined) {
          childPrice = dayTicket.child ?? dayTicket.kid ?? dayTicket.junior ?? dayTicket.youth ?? null;
        }
      }
    }
    if (adultPrice !== null && adultPrice !== undefined) {
      priceParts.push(`${locale.pricing.adult} ¥${Number(adultPrice).toLocaleString()}`);
    }
    if (childPrice !== null && childPrice !== undefined) {
      priceParts.push(`${locale.pricing.child} ¥${Number(childPrice).toLocaleString()}`);
    }
    const pricingValue = priceParts.length > 0 ? priceParts.join(' / ') : locale.pricing.unavailable;

    return `
      <div class="resort-card collapsible" data-resort-id="${resort.resort_id}" data-expanded="false" data-resort-links='${linksDataAttr}'>
        <div class="resort-header clickable" data-action="toggle-resort">
          <div>
            <div class="resort-name">
              <span class="expand-icon">▶</span>
              ${DOMPurify.sanitize(primary)}
            </div>
            ${secondary ? `<div class="resort-name-en">${DOMPurify.sanitize(secondary)}</div>` : ''}
          </div>
          <div class="resort-region-tag">${DOMPurify.sanitize(regionDisplay)}</div>
        </div>
        <div class="resort-details" style="display: none;">
          <div class="resort-stats">
            <div class="resort-stat">
              <div class="resort-stat-value">${lifts}</div>
              <div class="resort-stat-label">${locale.stats.lifts}</div>
            </div>
            <div class="resort-stat">
              <div class="resort-stat-value">${courses}</div>
              <div class="resort-stat-label">${locale.stats.courses}</div>
            </div>
            <div class="resort-stat">
              <div class="resort-stat-value">${locale.nightSkiValue(nightSki)}</div>
              <div class="resort-stat-label">${locale.stats.nightSki}</div>
            </div>
          </div>
          ${(priceParts.length > 0 || pricingTypeLabel) ? `
            <div class="resort-info">
              <div class="resort-info-row">
                <span class="resort-info-label">${locale.pricing.title}${pricingTypeLabel ? ` (${DOMPurify.sanitize(pricingTypeLabel)})` : ''}:</span>
                <span class="resort-info-value">${DOMPurify.sanitize(pricingValue)}</span>
              </div>
            </div>
          ` : ''}
          <div class="resort-links-row" data-resort-id="${resort.resort_id}"></div>
          <div class="resort-amenities" id="amenities-${resort.resort_id}">${amenities.slice(0, 15).map(a =>
            `<span class="resort-amenity clickable" data-tag="${DOMPurify.sanitize(a)}">#${DOMPurify.sanitize(a)}</span>`
          ).join('')}
          ${amenities.length > 15 ? `<button class="amenities-toggle" data-resort-id="${resort.resort_id}" data-amenities='${JSON.stringify(amenities).replace(/"/g, '&quot;')}'>${locale.toggles.more(amenities.length - 15)}</button>` : ''}</div>
          <div class="feedback-section">
            <span class="feedback-label">${currentLanguage === 'en' ? 'Was this helpful?' : currentLanguage === 'th' ? 'มีประโยชน์หรือไม่' : '這個資訊有幫助嗎？'}</span>
            <div class="feedback-buttons">
              <button class="btn-helpful" data-feedback="helpful">👍</button>
              <button class="btn-not-helpful" data-feedback="not_helpful">👎</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  global.ResortModule = {
    RESORTS_PER_PAGE,
    renderRegions,
    renderResortPage,
    renderResortCard,
    paginate
  };
})(window);
