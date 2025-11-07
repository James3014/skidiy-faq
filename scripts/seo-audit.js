#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 SEO 審計報告\n');
console.log('='.repeat(70));

// 讀取 FAQ 數據
const faqData = JSON.parse(fs.readFileSync('./zeabur_backend/data/faq_kb.phase0a.json', 'utf8'));
const faqIds = faqData.items.map(item => item.id);

// 審計變數
const issues = {
  missingMeta: [],
  missingSchema: [],
  missingOG: [],
  tooLongTitle: [],
  tooShortDescription: [],
  missingKeywords: [],
  brokenHreflang: [],
  missingLanguageSwitcher: []
};

const stats = {
  totalPages: 0,
  scanned: 0,
  issues: 0
};

// 掃描每個 FAQ 頁面
console.log('\n📄 掃描 FAQ 詳細頁面...\n');

const languages = ['zh', 'en', 'th'];

languages.forEach(lang => {
  faqIds.forEach(faqId => {
    const filePath = path.join('./frontend/faq', `${faqId}-${lang}.html`);
    stats.totalPages++;

    if (!fs.existsSync(filePath)) {
      return;
    }

    stats.scanned++;
    const content = fs.readFileSync(filePath, 'utf8');

    // 檢查基本 meta 標籤
    const hasCharset = content.includes('charset');
    const hasViewport = content.includes('viewport');
    const hasTitle = /<title>/.test(content);
    const hasDescription = /name="description"/.test(content);

    if (!hasCharset || !hasViewport || !hasTitle || !hasDescription) {
      issues.missingMeta.push({
        page: `${faqId}-${lang}`,
        missing: [
          !hasCharset && 'charset',
          !hasViewport && 'viewport',
          !hasTitle && 'title',
          !hasDescription && 'description'
        ].filter(Boolean)
      });
    }

    // 檢查 Open Graph meta
    const ogTags = (content.match(/property="og:[^"]+"/g) || []).length;
    if (ogTags < 4) {
      issues.missingOG.push({ page: `${faqId}-${lang}`, found: ogTags, expected: 4 });
    }

    // 檢查 Schema.org JSON-LD
    if (!content.includes('schema.org')) {
      issues.missingSchema.push(`${faqId}-${lang}`);
    }

    // 檢查標題長度 (30-60 字)
    const titleMatch = content.match(/<title>([^<]+)<\/title>/);
    if (titleMatch) {
      const titleLength = titleMatch[1].length;
      if (titleLength < 30 || titleLength > 60) {
        issues.tooLongTitle.push({ page: `${faqId}-${lang}`, length: titleLength });
      }
    }

    // 檢查 description 長度 (120-160 字)
    const descMatch = content.match(/name="description" content="([^"]+)"/);
    if (descMatch) {
      const descLength = descMatch[1].length;
      if (descLength < 120 || descLength > 160) {
        issues.tooShortDescription.push({ page: `${faqId}-${lang}`, length: descLength });
      }
    }

    // 檢查 canonical
    if (!content.includes('rel="canonical"')) {
      issues.missingKeywords.push(`${faqId}-${lang}`);
    }

    // 檢查 hreflang (只在非英文頁面)
    if (lang !== 'en') {
      const hreflangs = (content.match(/hreflang="[^"]+"/g) || []).length;
      if (hreflangs < 3) {
        issues.brokenHreflang.push({ page: `${faqId}-${lang}`, found: hreflangs });
      }
    }

    // 檢查語言切換器
    if (!content.includes('language-switcher')) {
      issues.missingLanguageSwitcher.push(`${faqId}-${lang}`);
    }
  });
});

// 輸出結果
console.log(`✅ 掃描完成: ${stats.scanned}/${stats.totalPages} 頁面\n`);

console.log('📋 SEO 審計詳細結果:\n');

let totalIssues = 0;

if (issues.missingMeta.length === 0) {
  console.log('✅ Meta 標籤: 所有頁面都有基本 meta 標籤');
} else {
  console.log(`❌ Meta 標籤缺失 (${issues.missingMeta.length} 個頁面):`);
  issues.missingMeta.slice(0, 3).forEach(item => {
    console.log(`   - ${item.page}: 缺少 ${item.missing.join(', ')}`);
  });
  totalIssues += issues.missingMeta.length;
}

if (issues.missingSchema.length === 0) {
  console.log('✅ Schema.org: 所有頁面都有 JSON-LD 結構化資料');
} else {
  console.log(`⚠️  Schema.org 缺失 (${issues.missingSchema.length} 個頁面):`);
  console.log(`   這些頁面沒有 FAQ Schema，建議補上`);
  totalIssues += issues.missingSchema.length;
}

if (issues.missingOG.length === 0) {
  console.log('✅ Open Graph: 所有頁面都有完整的 OG 標籤');
} else {
  console.log(`⚠️  Open Graph 不完整 (${issues.missingOG.length} 個頁面):`);
  console.log(`   建議補上 og:image, og:site_name 等標籤以改進社群分享`);
  totalIssues += issues.missingOG.length;
}

if (issues.tooLongTitle.length === 0) {
  console.log('✅ 標題長度: 所有頁面標題長度適中 (30-60 字)');
} else {
  console.log(`⚠️  標題長度不適 (${issues.tooLongTitle.length} 個頁面):`);
  console.log(`   建議標題長度 30-60 字以提高 SEO`);
  totalIssues += issues.tooLongTitle.length;
}

if (issues.tooShortDescription.length === 0) {
  console.log('✅ Description: 所有頁面描述長度適中 (120-160 字)');
} else {
  console.log(`⚠️  Description 長度不適 (${issues.tooShortDescription.length} 個頁面):`);
  console.log(`   建議描述長度 120-160 字以提高搜尋結果點擊率`);
  totalIssues += issues.tooShortDescription.length;
}

if (issues.brokenHreflang.length === 0) {
  console.log('✅ hreflang: 所有頁面都有多語言指示');
} else {
  console.log(`⚠️  hreflang 不完整 (${issues.brokenHreflang.length} 個頁面):`);
  console.log(`   建議確保每個頁面都有 zh-Hant, en, th 的 hreflang 指示`);
  totalIssues += issues.brokenHreflang.length;
}

if (issues.missingLanguageSwitcher.length === 0) {
  console.log('✅ 語言切換器: 所有頁面都有語言切換器');
} else {
  console.log(`❌ 語言切換器缺失 (${issues.missingLanguageSwitcher.length} 個頁面)`);
  totalIssues += issues.missingLanguageSwitcher.length;
}

// 掃描分類頁面
console.log('\n\n📂 掃描分類頁面...\n');

const sections = new Map();
faqData.items.forEach(faq => {
  if (!sections.has(faq.section)) {
    sections.set(faq.section, []);
  }
  sections.get(faq.section).push(faq);
});

let categoryPagesScanned = 0;
let categoryIssues = 0;

sections.forEach((faqs, section) => {
  languages.forEach(lang => {
    // 使用簡單的 hash
    const sectionHash = Buffer.from(section).toString('hex').substring(0, 8);
    const filePath = path.join('./frontend/category', `section-${sectionHash}-${lang}.html`);

    if (fs.existsSync(filePath)) {
      categoryPagesScanned++;
      const content = fs.readFileSync(filePath, 'utf8');

      // 基本檢查
      if (!content.includes('charset') || !content.includes('viewport')) {
        categoryIssues++;
      }
    }
  });
});

console.log(`✅ 分類頁面: ${categoryPagesScanned} 個頁面掃描完成`);
if (categoryIssues === 0) {
  console.log(`✅ 所有分類頁面都有基本 meta 標籤`);
} else {
  console.log(`⚠️  ${categoryIssues} 個分類頁面缺少基本標籤`);
}

// 總結
console.log('\n' + '='.repeat(70));
console.log('\n📊 SEO 優化建議總結:\n');

const severityLevels = {
  critical: ['missingMeta', 'missingLanguageSwitcher'],
  warning: ['missingSchema', 'missingOG', 'brokenHreflang'],
  suggestion: ['tooLongTitle', 'tooShortDescription']
};

console.log('🔴 關鍵問題 (應立即修復):');
Object.keys(issues).forEach(key => {
  if (severityLevels.critical.includes(key) && issues[key].length > 0) {
    console.log(`   • ${key}: ${issues[key].length} 個`);
  }
});

console.log('\n🟡 警告 (建議改進):');
Object.keys(issues).forEach(key => {
  if (severityLevels.warning.includes(key) && issues[key].length > 0) {
    console.log(`   • ${key}: ${issues[key].length} 個`);
  }
});

console.log('\n🟢 建議優化:');
Object.keys(issues).forEach(key => {
  if (severityLevels.suggestion.includes(key) && issues[key].length > 0) {
    console.log(`   • ${key}: ${issues[key].length} 個`);
  }
});

// 評分
const totalPages = stats.scanned;
const perfectPages = totalPages - totalIssues;
const score = Math.round((perfectPages / totalPages) * 100);

console.log(`\n📈 SEO 評分: ${score}/100`);
if (score >= 90) {
  console.log('✅ 優秀！SEO 表現很好');
} else if (score >= 70) {
  console.log('🟡 良好，有改進空間');
} else {
  console.log('❌ 需要改進');
}

console.log('\n');
