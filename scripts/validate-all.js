#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 FAQ 系統完整性驗證\n');
console.log('='.repeat(60));

// 1. 多語言驗證
console.log('\n1️⃣ 多語言驗證 - 檢查三語頁面完整性\n');

const faqData = JSON.parse(fs.readFileSync('./zeabur_backend/data/faq_kb.phase0a.json', 'utf8'));
const faqIds = faqData.items.map(item => item.id);

const languages = ['zh', 'en', 'th'];
const langNames = { zh: '中文', en: '英文', th: '泰文' };
const results = {
  zh: { total: 0, found: 0, missing: [] },
  en: { total: 0, found: 0, missing: [] },
  th: { total: 0, found: 0, missing: [] }
};

languages.forEach(lang => {
  results[lang].total = faqIds.length;
  faqIds.forEach(faqId => {
    const filePath = path.join('./frontend/faq', `${faqId}-${lang}.html`);
    if (fs.existsSync(filePath)) {
      results[lang].found++;
    } else {
      results[lang].missing.push(faqId);
    }
  });
});

languages.forEach(lang => {
  const status = results[lang].found === results[lang].total ? '✅' : '❌';
  const percentage = Math.round((results[lang].found / results[lang].total) * 100);
  console.log(`${status} ${langNames[lang]} (${lang}): ${results[lang].found}/${results[lang].total} (${percentage}%)`);
  if (results[lang].missing.length > 0 && results[lang].missing.length <= 5) {
    console.log(`   缺失: ${results[lang].missing.join(', ')}`);
  } else if (results[lang].missing.length > 5) {
    console.log(`   缺失: ${results[lang].missing.slice(0, 5).join(', ')} ... 等 ${results[lang].missing.length} 個`);
  }
});

const totalPages = Object.values(results).reduce((sum, r) => sum + r.found, 0);
const expectedPages = faqIds.length * 3;
console.log(`\n📊 總計: ${totalPages}/${expectedPages} 頁面 (${Math.round(totalPages/expectedPages*100)}%)`);

// 2. 連結完整性檢查
console.log('\n\n2️⃣ 連結完整性檢查 - 驗證所有 LINK tokens\n');

const linkRegistry = JSON.parse(fs.readFileSync('./zeabur_backend/data/link_registry.json', 'utf8'));
const usedTokens = new Set();
const missingTokens = [];

faqData.items.forEach(faq => {
  if (faq.links && Array.isArray(faq.links)) {
    faq.links.forEach(link => {
      const tokenMatch = link.match(/{{(LINK_[A-Z_]+)}}/);
      if (tokenMatch) {
        usedTokens.add(tokenMatch[1]);
      }
    });
  }
});

usedTokens.forEach(token => {
  if (!linkRegistry.faq || !linkRegistry.faq[token]) {
    missingTokens.push(token);
  }
});

const registeredTokens = linkRegistry.faq ? Object.keys(linkRegistry.faq) : [];
console.log(`✅ 已註冊的 LINK tokens: ${registeredTokens.length}`);
registeredTokens.forEach(token => {
  console.log(`   - ${token}`);
});

if (missingTokens.length === 0) {
  console.log(`\n✅ 所有使用的 tokens 都已在 registry 中定義`);
} else {
  console.log(`\n❌ 發現未定義的 tokens:`);
  missingTokens.forEach(token => {
    console.log(`   - ${token}`);
  });
}

// 3. FAQ JSON 格式驗證
console.log('\n\n3️⃣ FAQ JSON 格式驗證\n');

let formatErrors = [];
let missingTranslations = [];
let patternMismatches = [];

faqData.items.forEach((faq, index) => {
  // 檢查必要欄位
  const requiredFields = ['id', 'intent', 'section', 'canonical_question', 'answer_template'];
  requiredFields.forEach(field => {
    if (!faq[field]) {
      formatErrors.push(`${faq.id}: 缺少必要欄位 "${field}"`);
    }
  });

  // 檢查翻譯完整性
  if (faq.canonical_question_translations) {
    if (!faq.canonical_question_translations.en) missingTranslations.push(`${faq.id}: 缺少英文主問題翻譯`);
    if (!faq.canonical_question_translations.th) missingTranslations.push(`${faq.id}: 缺少泰文主問題翻譯`);
  }

  // 檢查變體問法翻譯數量是否相符
  if (faq.utterance_patterns && faq.utterance_patterns_translations) {
    const zhCount = faq.utterance_patterns.length;
    const enCount = faq.utterance_patterns_translations.en ? faq.utterance_patterns_translations.en.length : 0;
    const thCount = faq.utterance_patterns_translations.th ? faq.utterance_patterns_translations.th.length : 0;

    if (enCount !== zhCount) {
      patternMismatches.push(`${faq.id}: 英文變體數 (${enCount}) ≠ 中文變體數 (${zhCount})`);
    }
    if (thCount !== zhCount) {
      patternMismatches.push(`${faq.id}: 泰文變體數 (${thCount}) ≠ 中文變體數 (${zhCount})`);
    }
  }

  // 檢查關鍵字翻譯數量是否相符
  if (faq.keywords && faq.keywords_translations) {
    const zhCount = faq.keywords.length;
    const enCount = faq.keywords_translations.en ? faq.keywords_translations.en.length : 0;
    const thCount = faq.keywords_translations.th ? faq.keywords_translations.th.length : 0;

    if (enCount !== zhCount) {
      patternMismatches.push(`${faq.id}: 英文關鍵字數 (${enCount}) ≠ 中文關鍵字數 (${zhCount})`);
    }
    if (thCount !== zhCount) {
      patternMismatches.push(`${faq.id}: 泰文關鍵字數 (${thCount}) ≠ 中文關鍵字數 (${zhCount})`);
    }
  }
});

if (formatErrors.length === 0) {
  console.log('✅ 所有 FAQ 的必要欄位完整');
} else {
  console.log(`❌ 發現格式錯誤 (${formatErrors.length} 個):`);
  formatErrors.slice(0, 5).forEach(err => console.log(`   - ${err}`));
  if (formatErrors.length > 5) console.log(`   ... 等 ${formatErrors.length - 5} 個`);
}

if (missingTranslations.length === 0) {
  console.log('✅ 所有 FAQ 的翻譯完整');
} else {
  console.log(`❌ 發現缺失翻譯 (${missingTranslations.length} 個):`);
  missingTranslations.slice(0, 5).forEach(err => console.log(`   - ${err}`));
  if (missingTranslations.length > 5) console.log(`   ... 等 ${missingTranslations.length - 5} 個`);
}

if (patternMismatches.length === 0) {
  console.log('✅ 所有翻譯數量相符');
} else {
  console.log(`❌ 發現翻譯數量不符 (${patternMismatches.length} 個):`);
  patternMismatches.slice(0, 5).forEach(err => console.log(`   - ${err}`));
  if (patternMismatches.length > 5) console.log(`   ... 等 ${patternMismatches.length - 5} 個`);
}

// 4. 分類頁面驗證
console.log('\n\n4️⃣ 分類頁面驗證\n');

const sections = new Map();
faqData.items.forEach(faq => {
  if (!sections.has(faq.section)) {
    sections.set(faq.section, []);
  }
  sections.get(faq.section).push(faq);
});

console.log(`✅ 識別的分類: ${sections.size} 個\n`);
Array.from(sections.entries()).forEach(([section, faqs]) => {
  console.log(`   • ${section}: ${faqs.length} 個 FAQ`);
});

// 檢查分類頁面
const missingCategoryPages = [];
sections.forEach((faqs, section) => {
  const sectionHash = Buffer.from(section).toString('hex').substring(0, 8);
  languages.forEach(lang => {
    const filePath = path.join('./frontend/category', `section-${sectionHash}-${lang}.html`);
    if (!fs.existsSync(filePath)) {
      missingCategoryPages.push(`${section} (${lang})`);
    }
  });
});

if (missingCategoryPages.length === 0) {
  console.log(`\n✅ 所有分類頁面都已生成 (${sections.size * 3} 個)`);
} else {
  console.log(`\n❌ 缺失分類頁面 (${missingCategoryPages.length} 個):`);
  missingCategoryPages.slice(0, 5).forEach(page => console.log(`   - ${page}`));
  if (missingCategoryPages.length > 5) console.log(`   ... 等 ${missingCategoryPages.length - 5} 個`);
}

// 總結
console.log('\n' + '='.repeat(60));
console.log('\n📈 驗證總結:\n');

const issues = formatErrors.length + missingTranslations.length + patternMismatches.length + missingTokens.length + missingCategoryPages.length;

if (issues === 0) {
  console.log('✅ 所有驗證通過！系統完整性良好');
} else {
  console.log(`❌ 發現 ${issues} 個問題，需要修正:`);
  if (formatErrors.length > 0) console.log(`   • 格式錯誤: ${formatErrors.length} 個`);
  if (missingTranslations.length > 0) console.log(`   • 缺失翻譯: ${missingTranslations.length} 個`);
  if (patternMismatches.length > 0) console.log(`   • 翻譯數量不符: ${patternMismatches.length} 個`);
  if (missingTokens.length > 0) console.log(`   • 未定義的 tokens: ${missingTokens.length} 個`);
  if (missingCategoryPages.length > 0) console.log(`   • 缺失分類頁面: ${missingCategoryPages.length} 個`);
}

console.log('\n');
