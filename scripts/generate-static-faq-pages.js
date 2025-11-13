#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  OUTPUT_BASE,
  SITE_BASE,
  LANGS,
  loadFaqData,
  ensureDir,
  cleanDir,
  replaceLinks,
  getLocalized,
  pickKeywords,
  pickUtterances,
  selectAnswerField,
  tokenToLink,
  slugify
} = require('./lib/faqRenderer');

const FAQ_OUTPUT_DIR = path.join(OUTPUT_BASE, 'faq');

const LABELS = {
  zh: {
    primary: '主要回答',
    details: '補充資訊',
    tip: '小提醒',
    postscript: '附註',
    metadata: 'FAQ 資訊',
    keywords: '關鍵字',
    tags: 'CRM 標籤',
    intents: '使用者提問語句',
    links: '相關連結',
    lastUpdated: '最後更新',
    section: '分類'
  },
  en: {
    primary: 'Answer',
    details: 'More detail',
    tip: 'Tips',
    postscript: 'Postscript',
    metadata: 'FAQ Metadata',
    keywords: 'Keywords',
    tags: 'CRM Tags',
    intents: 'User search phrases',
    links: 'Helpful links',
    lastUpdated: 'Last updated',
    section: 'Section'
  },
  th: {
    primary: 'คำตอบหลัก',
    details: 'ข้อมูลเพิ่มเติม',
    tip: 'คำแนะนำ',
    postscript: 'หมายเหตุ',
    metadata: 'ข้อมูล FAQ',
    keywords: 'คีย์เวิร์ด',
    tags: 'แท็ก CRM',
    intents: 'คำค้นของผู้ใช้',
    links: 'ลิงก์ที่เกี่ยวข้อง',
    lastUpdated: 'อัปเดตล่าสุด',
    section: 'หมวดหมู่'
  }
};

function main() {
  const dataset = loadFaqData();
  ensureDir(FAQ_OUTPUT_DIR);
  cleanDir(FAQ_OUTPUT_DIR);

  let generated = 0;

  for (const item of dataset.items) {
    for (const lang of LANGS) {
      const html = renderFaqPage(item, lang.code);
      const filename = `${item.id}-${lang.code}.html`;
      const filePath = path.join(FAQ_OUTPUT_DIR, filename);
      fs.writeFileSync(filePath, html);
      generated++;
    }
  }

  console.log(`✅ Generated ${generated} FAQ pages into ${FAQ_OUTPUT_DIR}`);
}

function renderFaqPage(item, lang) {
  const label = LABELS[lang];
  const question = getLocalized(item.canonical_question, item.canonical_question_translations, lang);
  const sectionName = getLocalized(item.section, item.section_translations, lang);
  const keywords = pickKeywords(item, lang);
  const utterances = pickUtterances(item, lang);
  const summary = selectAnswerField(item, 'summary', lang) || selectAnswerField(item, 'text', lang);
  const details = selectAnswerField(item, 'details', lang);
  const tip = selectAnswerField(item, 'tip', lang);
  const postscript = selectAnswerField(item, 'postscript', lang);
  const links = (item.links || [])
    .map(token => tokenToLink(token, lang))
    .filter(Boolean);
  const canonical = buildCanonicalUrl(item.id, lang);
  const alternates = buildAlternateLinks(item.id);
  const ldJson = buildStructuredData(question, summary || details || '', canonical, lang);

  const renderBlock = (title, content) => {
    if (!content) return '';
    return `
      <section class="card">
        <h2>${title}</h2>
        <div class="faq-content">${replaceLinks(content, lang)}</div>
      </section>`;
  };

  const linkList = links.length
    ? `<ul>${links.map(l => `<li><a href="${l.href}" target="_blank" rel="noopener">${l.label} 🔗</a></li>`).join('')}</ul>`
    : '';

  const crmTags = (item.crm_tags || []).map(tag => `<span class="tag">${tag}</span>`).join(' ');
  const keywordBadges = keywords.map(kw => `<span class="keyword">${kw}</span>`).join(' ');
  const utteranceList = utterances.length
    ? `<ul>${utterances.map(text => `<li>${replaceLinks(text, lang)}</li>`).join('')}</ul>`
    : '';

  const lastUpdated = item.metadata?.last_updated || '';

  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(question)} | SkiDIY FAQ</title>
  <link rel="canonical" href="${canonical}" />
  ${alternates.map(a => `<link rel="alternate" hreflang="${a.lang}" href="${a.url}" />`).join('\n  ')}
  <meta name="description" content="${escapeHtml(summary?.replace(/\n+/g, ' ').slice(0, 160) || question)}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(question)}" />
  <meta property="og:description" content="${escapeHtml(summary?.replace(/\n+/g, ' ') || question)}" />
  <meta property="og:url" content="${canonical}" />
  <link rel="stylesheet" href="../assets/faq-page.css" />
  <script type="application/ld+json">${JSON.stringify(ldJson)}</script>
</head>
<body>
  <main>
    <header class="page-header">
      <p class="badge">${escapeHtml(sectionName)}</p>
      <h1>${escapeHtml(question)}</h1>
      <p class="meta">ID: ${item.id}</p>
    </header>

    ${renderBlock(label.primary, summary)}
    ${renderBlock(label.details, details)}
    ${renderBlock(label.tip, tip)}
    ${renderBlock(label.postscript, postscript)}

    <section class="card">
      <h2>${label.metadata}</h2>
      <div class="meta-grid">
        <div><strong>${label.section}</strong><br/>${escapeHtml(sectionName)}</div>
        <div><strong>${label.lastUpdated}</strong><br/>${escapeHtml(lastUpdated.split('T')[0] || '')}</div>
        <div><strong>${label.tags}</strong><br/>${crmTags || '—'}</div>
        <div><strong>${label.keywords}</strong><br/>${keywordBadges || '—'}</div>
      </div>
    </section>

    ${utteranceList ? `<section class="card"><h2>${label.intents}</h2>${utteranceList}</section>` : ''}
    ${links.length ? `<section class="card"><h2>${label.links}</h2>${linkList}</section>` : ''}

    <div class="language-switcher">
      ${LANGS.map(meta => {
        const filename = `${item.id}-${meta.code}.html`;
        const isActive = meta.code === lang ? 'active' : '';
        return `<a class="${isActive}" href="${filename}">${meta.label}</a>`;
      }).join('')}
    </div>

    <footer class="page-footer">
      SkiDIY FAQ • ${new Date().getFullYear()}
    </footer>
  </main>
</body>
</html>`;
}

function buildCanonicalUrl(id, lang) {
  if (lang === 'zh') {
    return `${SITE_BASE}/faq/${id}`;
  }
  return `${SITE_BASE}/faq/${id}?lang=${lang}`;
}

function buildAlternateLinks(id) {
  return LANGS.map(meta => ({
    lang: meta.code === 'zh' ? 'zh-Hant' : meta.code,
    url: buildCanonicalUrl(id, meta.code)
  }));
}

function buildStructuredData(question, answer, url, lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: lang,
    mainEntity: [
      {
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer?.replace(/\n+/g, ' ')
        }
      }
    ]
  };
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

main();
