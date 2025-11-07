#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 生成 SEO 檔案 (sitemap.xml 和 robots.txt)\n');

// 讀取 FAQ 資料
const faqDataPath = './zeabur_backend/data/faq_kb.phase0a.json';
if (!fs.existsSync(faqDataPath)) {
  console.error('❌ 找不到 FAQ 資料檔案:', faqDataPath);
  process.exit(1);
}

const faqData = JSON.parse(fs.readFileSync(faqDataPath, 'utf8'));

// 基礎 URL
const baseUrl = 'https://faq.diy.ski';
const today = new Date().toISOString().split('T')[0];

// ============================================================
// 1. 生成 sitemap.xml
// ============================================================

let sitemapContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
sitemapContent += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

// 首頁
sitemapContent += `  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>\n`;

// FAQ 詳細頁面
const languages = ['zh', 'en', 'th'];
const langMap = { zh: 'zh-Hant', en: 'en', th: 'th' };

faqData.items.forEach((faq) => {
  const canonicalUrl = `${baseUrl}/faq/${faq.id}`;

  sitemapContent += `  <url>
    <loc>${canonicalUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>\n`;

  // 添加 hreflang - 非常重要！
  languages.forEach(lang => {
    const hrefLangCode = langMap[lang];
    sitemapContent += `    <xhtml:link rel="alternate" hreflang="${hrefLangCode}" href="${canonicalUrl}?lang=${lang}" />\n`;
  });

  sitemapContent += `  </url>\n`;
});

// 分類頁面
const sections = new Map();
faqData.items.forEach(faq => {
  if (!sections.has(faq.section)) {
    sections.set(faq.section, []);
  }
  sections.get(faq.section).push(faq);
});

sections.forEach((faqs, section) => {
  const sectionHash = Buffer.from(section).toString('hex').substring(0, 8);
  const categoryUrl = `${baseUrl}/category/section-${sectionHash}`;

  sitemapContent += `  <url>
    <loc>${categoryUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>\n`;

  // 添加 hreflang
  languages.forEach(lang => {
    const hrefLangCode = langMap[lang];
    sitemapContent += `    <xhtml:link rel="alternate" hreflang="${hrefLangCode}" href="${categoryUrl}?lang=${lang}" />\n`;
  });

  sitemapContent += `  </url>\n`;
});

sitemapContent += '</urlset>';

// 寫入 sitemap.xml
const sitemapPath = path.join('./frontend', 'sitemap.xml');
fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
console.log(`✅ 生成 sitemap.xml (${faqData.items.length + sections.size + 1} 個 URL)`);
console.log(`   位置: ${sitemapPath}`);
console.log(`   - FAQ 詳細頁: ${faqData.items.length}`);
console.log(`   - 分類頁面: ${sections.size}`);
console.log(`   - 首頁: 1\n`);

// ============================================================
// 2. 生成 robots.txt
// ============================================================

let robotsContent = '# SkiDIY FAQ 搜尋引擎爬蟲指令\n';
robotsContent += '# Generated automatically on ' + new Date().toISOString() + '\n\n';

robotsContent += '# 允許所有搜尋引擎爬蟲\n';
robotsContent += 'User-agent: *\n';
robotsContent += 'Allow: /\n';
robotsContent += 'Allow: /faq/\n';
robotsContent += 'Allow: /category/\n';
robotsContent += 'Allow: /assets/\n';
robotsContent += 'Allow: /index.html\n\n';

robotsContent += '# 禁止爬蟲的路徑\n';
robotsContent += 'Disallow: /admin/\n';
robotsContent += 'Disallow: /api/\n';
robotsContent += 'Disallow: /*.json\n';
robotsContent += 'Disallow: /*.js\n';
robotsContent += 'Disallow: /node_modules/\n';
robotsContent += 'Disallow: /.git/\n\n';

robotsContent += '# 搜尋引擎爬蟲延遲設定\n';
robotsContent += 'Crawl-delay: 1\n';
robotsContent += 'Request-rate: 1/1s\n\n';

robotsContent += '# Google 特定設定\n';
robotsContent += 'User-agent: Googlebot\n';
robotsContent += 'Allow: /\n';
robotsContent += 'Crawl-delay: 0.5\n\n';

robotsContent += '# Sitemap 位置\n';
robotsContent += `Sitemap: ${baseUrl}/sitemap.xml\n`;

// 寫入 robots.txt
const robotsPath = path.join('./frontend', 'robots.txt');
fs.writeFileSync(robotsPath, robotsContent, 'utf8');
console.log(`✅ 生成 robots.txt`);
console.log(`   位置: ${robotsPath}\n`);

// ============================================================
// 3. 驗證輸出
// ============================================================

console.log('=' .repeat(70));
console.log('\n✨ 驗證生成的檔案:\n');

const sitemapStats = {
  size: fs.statSync(sitemapPath).size,
  lines: fs.readFileSync(sitemapPath, 'utf8').split('\n').length
};

const robotsStats = {
  size: fs.statSync(robotsPath).size,
  lines: fs.readFileSync(robotsPath, 'utf8').split('\n').length
};

console.log(`📊 Sitemap 統計:`);
console.log(`   - 檔案大小: ${(sitemapStats.size / 1024).toFixed(2)} KB`);
console.log(`   - 行數: ${sitemapStats.lines}`);
console.log(`   - URLs 總數: ${faqData.items.length + sections.size + 1}`);

console.log(`\n📊 Robots.txt 統計:`);
console.log(`   - 檔案大小: ${(robotsStats.size / 1024).toFixed(2)} KB`);
console.log(`   - 行數: ${robotsStats.lines}`);

// ============================================================
// 4. 生成部署檢查清單
// ============================================================

console.log('\n' + '='.repeat(70));
console.log('\n📋 部署前檢查清單:\n');

console.log('✅ SEO 檔案準備完成，接下來請:\n');

console.log('1️⃣  驗證本地檔案:');
console.log(`   - 檢查 sitemap.xml 格式: head -20 ${sitemapPath}`);
console.log(`   - 檢查 robots.txt 內容: cat ${robotsPath}\n`);

console.log('2️⃣  部署到伺服器:');
console.log(`   - ${sitemapPath} → https://faq.diy.ski/sitemap.xml`);
console.log(`   - ${robotsPath} → https://faq.diy.ski/robots.txt\n`);

console.log('3️⃣  提交給搜尋引擎:');
console.log(`   - Google Search Console: https://search.google.com/search-console`);
console.log(`   - Bing Webmaster Tools: https://www.bing.com/webmaster`);
console.log(`   - 提交 URL: ${baseUrl}/sitemap.xml\n`);

console.log('4️⃣  驗證 sitemap:');
console.log(`   - 訪問 ${baseUrl}/sitemap.xml 檢查格式`);
console.log(`   - 驗證所有 hreflang 標籤\n`);

console.log('5️⃣  驗證 robots.txt:');
console.log(`   - 訪問 ${baseUrl}/robots.txt`);
console.log(`   - Google Search Console: 檢查 robots.txt 無誤\n`);

console.log('6️⃣  監控爬蟲活動:');
console.log(`   - Google Search Console: 覆蓋範圍`);
console.log(`   - Google Analytics: 流量來源\n`);

console.log('=' .repeat(70));
console.log('\n✅ SEO 檔案生成完成！\n');
