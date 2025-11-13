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
  getLocalized,
  selectAnswerField,
  replaceLinks,
  slugify
} = require('./lib/faqRenderer');

const CATEGORY_OUTPUT_DIR = path.join(OUTPUT_BASE, 'category');

const LABELS = {
  zh: {
    titleSuffix: ' - FAQ 分類',
    intro: '以下為此分類的常見問題，可點擊查看詳細答案。',
    count: '共 {COUNT} 筆 FAQ',
    cardCta: '查看詳解'
  },
  en: {
    titleSuffix: ' - FAQ Category',
    intro: 'Browse the most common questions for this category.',
    count: '{COUNT} FAQ items',
    cardCta: 'Read answer'
  },
  th: {
    titleSuffix: ' - หมวด FAQ',
    intro: 'รายการคำถามที่พบบ่อยในหมวดนี้',
    count: '{COUNT} คำถาม',
    cardCta: 'อ่านคำตอบ'
  }
};

function main() {
  const dataset = loadFaqData();
  const sections = groupBySection(dataset.items);

  ensureDir(CATEGORY_OUTPUT_DIR);
  cleanDir(CATEGORY_OUTPUT_DIR);

  let generated = 0;

  for (const [sectionKey, faqItems] of sections.entries()) {
    for (const lang of LANGS) {
      const html = renderCategoryPage(sectionKey, faqItems, lang.code);
      const filename = `${slugify(sectionKey)}-${lang.code}.html`;
      fs.writeFileSync(path.join(CATEGORY_OUTPUT_DIR, filename), html);
      generated++;
    }
  }

  console.log(`✅ Generated ${generated} category pages into ${CATEGORY_OUTPUT_DIR}`);
}

function groupBySection(items) {
  const map = new Map();
  for (const item of items) {
    const key = item.section;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return map;
}

function renderCategoryPage(sectionNameZh, faqItems, lang) {
  const label = LABELS[lang];
  const localizedSection = getLocalized(sectionNameZh, faqItems[0]?.section_translations, lang);
  const intro = label.intro;
  const countText = label.count.replace('{COUNT}', faqItems.length);
  const canonical = buildCategoryCanonical(sectionNameZh, lang);

  const cards = faqItems.map(item => {
    const question = getLocalized(item.canonical_question, item.canonical_question_translations, lang);
    const summary = selectAnswerField(item, 'summary', lang) || selectAnswerField(item, 'text', lang);
    const fileName = `${item.id}-${lang}.html`;
    return `
      <article class="category-card">
        <h3><a href="../faq/${fileName}">${escapeHtml(question)}</a></h3>
        <div class="faq-content">${replaceLinks((summary || '').slice(0, 280), lang)}</div>
        <a href="../faq/${fileName}">${label.cardCta} →</a>
      </article>`;
  }).join('\n');

  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(localizedSection)}${label.titleSuffix}</title>
  <link rel="canonical" href="${canonical}" />
  <link rel="stylesheet" href="../assets/faq-page.css" />
</head>
<body>
  <main>
    <header class="page-header">
      <span class="badge">${escapeHtml(localizedSection)}</span>
      <h1>${escapeHtml(localizedSection)}</h1>
      <p class="meta">${escapeHtml(intro)}</p>
      <p class="meta">${escapeHtml(countText)}</p>
    </header>
    <section class="category-grid">
      ${cards}
    </section>
  </main>
</body>
</html>`;
}

function buildCategoryCanonical(sectionZh, lang) {
  const slug = slugify(sectionZh);
  if (lang === 'zh') return `${SITE_BASE}/category/${slug}`;
  return `${SITE_BASE}/category/${slug}?lang=${lang}`;
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
