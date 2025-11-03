#!/usr/bin/env node

/**
 * Generate SEO Files: sitemap.xml and robots.txt
 *
 * This script generates SEO infrastructure files needed for proper
 * search engine crawling and indexing of the SkiDIY FAQ site.
 *
 * Usage:
 *   node scripts/generate-seo-files.js
 *   npm run generate-seo
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'https://faq.diy.ski',
  faqDataPath: './frontend/faq_kb.json',
  outputDir: './frontend',
  languages: ['zh', 'en', 'th'],
  defaultLanguage: 'zh',
  maxFAQsPerPage: 50000, // XML sitemap limit is 50,000 URLs
};

/**
 * Generate sitemap.xml
 */
function generateSitemap() {
  console.log('📋 Generating sitemap.xml...');

  try {
    // Load FAQ data
    const faqDataRaw = fs.readFileSync(CONFIG.faqDataPath, 'utf-8');
    const faqData = JSON.parse(faqDataRaw);

    if (!faqData.items) {
      throw new Error('Invalid FAQ data: missing items array');
    }

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '         xmlns:xhtml="http://www.w3.org/1999/xhtml">\n\n';

    let urlCount = 0;

    // 1. Add main page (index)
    CONFIG.languages.forEach(lang => {
      const url = lang === CONFIG.defaultLanguage ?
        CONFIG.baseUrl :
        `${CONFIG.baseUrl}/?lang=${lang}`;

      xml += generateURLEntry(url, '2025-11-03', 'daily', 1.0);
      urlCount++;
    });

    xml += '\n';

    // 2. Add search/browse pages
    CONFIG.languages.forEach(lang => {
      const url = lang === CONFIG.defaultLanguage ?
        `${CONFIG.baseUrl}/` :
        `${CONFIG.baseUrl}/?lang=${lang}`;

      xml += generateURLEntry(url, '2025-11-03', 'weekly', 0.9);
      urlCount++;
    });

    xml += '\n';

    // 3. Add category pages
    const categories = [...new Set(faqData.items.map(item => item.section))];
    console.log(`   Found ${categories.length} categories`);

    categories.forEach(category => {
      CONFIG.languages.forEach(lang => {
        const slug = encodeURIComponent(category);
        const url = lang === CONFIG.defaultLanguage ?
          `${CONFIG.baseUrl}/category/${slug}` :
          `${CONFIG.baseUrl}/category/${slug}?lang=${lang}`;

        xml += generateURLEntry(url, '2025-11-03', 'weekly', 0.8);
        urlCount++;
      });
    });

    xml += '\n';

    // 4. Add FAQ detail pages
    console.log(`   Found ${faqData.items.length} FAQ items`);

    faqData.items.forEach(item => {
      CONFIG.languages.forEach(lang => {
        const url = lang === CONFIG.defaultLanguage ?
          `${CONFIG.baseUrl}/faq/${item.id}` :
          `${CONFIG.baseUrl}/faq/${item.id}?lang=${lang}`;

        const lastMod = item.metadata?.last_updated ||
                       item.translation_status?.[lang]?.last_updated ||
                       '2025-11-03';

        const priority = item.hot ? 0.9 : 0.7;

        xml += generateURLEntry(
          url,
          lastMod.split('T')[0],
          'monthly',
          priority
        );
        urlCount++;
      });
    });

    xml += '</urlset>';

    // Write to file
    const outputPath = path.join(CONFIG.outputDir, 'sitemap.xml');
    fs.writeFileSync(outputPath, xml);

    console.log(`✅ sitemap.xml generated successfully!`);
    console.log(`   Location: ${outputPath}`);
    console.log(`   URLs: ${urlCount}`);
    console.log(`   Size: ${(Buffer.byteLength(xml) / 1024).toFixed(2)} KB`);

    return urlCount;

  } catch (error) {
    console.error('❌ Error generating sitemap:', error.message);
    process.exit(1);
  }
}

/**
 * Generate a single URL entry for sitemap
 */
function generateURLEntry(url, lastMod, changefreq, priority) {
  let entry = `  <url>\n`;
  entry += `    <loc>${escapeXML(url)}</loc>\n`;
  entry += `    <lastmod>${lastMod}</lastmod>\n`;
  entry += `    <changefreq>${changefreq}</changefreq>\n`;
  entry += `    <priority>${priority}</priority>\n`;
  entry += `  </url>\n`;
  return entry;
}

/**
 * Escape XML special characters
 */
function escapeXML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate robots.txt
 */
function generateRobotsTxt() {
  console.log('\n🤖 Generating robots.txt...');

  const robotsTxt = `# robots.txt for SkiDIY FAQ System
# https://faq.diy.ski/

# Allow all crawlers by default
User-agent: *
Allow: /

# Disallow admin pages
Disallow: /admin
Disallow: /analytics
Disallow: /menu.html
Disallow: /docs.html

# Disallow data files and libraries
Disallow: *.json
Disallow: /lib/
Disallow: /assets/
Disallow: /scripts/

# Allow CSS and JavaScript
Allow: /*.js
Allow: /*.css

# Crawl delay for respectful crawling
Crawl-delay: 1

# Google-specific rules
User-agent: Googlebot
Allow: /
Crawl-delay: 0

# Bing-specific rules
User-agent: Bingbot
Allow: /
Crawl-delay: 1

# Prevent bad bots
User-agent: MJ12bot
User-agent: AhrefsBot
User-agent: DotBot
Disallow: /

# Sitemap location
Sitemap: ${CONFIG.baseUrl}/sitemap.xml
`;

  try {
    const outputPath = path.join(CONFIG.outputDir, 'robots.txt');
    fs.writeFileSync(outputPath, robotsTxt);

    console.log(`✅ robots.txt generated successfully!`);
    console.log(`   Location: ${outputPath}`);
    console.log(`   Size: ${Buffer.byteLength(robotsTxt)} bytes`);

  } catch (error) {
    console.error('❌ Error generating robots.txt:', error.message);
    process.exit(1);
  }
}

/**
 * Generate .htaccess file for Apache servers (optional)
 */
function generateHtaccess() {
  console.log('\n⚙️  Generating .htaccess...');

  const htaccess = `# .htaccess - SEO and Performance Optimizations for SkiDIY FAQ

# Enable GZIP compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE text/javascript
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
  AddOutputFilterByType DEFLATE application/json
</IfModule>

# Caching rules
<IfModule mod_expires.c>
  ExpiresActive On

  # Cache static assets
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"

  # Don't cache HTML (so updates are seen immediately)
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# Enable mod_rewrite
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Remove .html extension (optional)
  # RewriteCond %{REQUEST_FILENAME} !-f
  # RewriteCond %{REQUEST_FILENAME} !-d
  # RewriteRule ^(.*)$ index.html [QSA,L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
  # Prevent clickjacking
  Header set X-Frame-Options "SAMEORIGIN"

  # XSS Protection
  Header set X-XSS-Protection "1; mode=block"

  # Content Type
  Header set X-Content-Type-Options "nosniff"
</IfModule>
`;

  // Note: .htaccess is Apache-specific. Zeabur may use Nginx.
  // This is commented out by default
  console.log('⚠️  Note: .htaccess is Apache-specific.');
  console.log('   Zeabur uses Nginx. Configure caching in Zeabur dashboard instead.');
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 SkiDIY FAQ - SEO Files Generator');
  console.log('=' .repeat(50));
  console.log(`Base URL: ${CONFIG.baseUrl}`);
  console.log(`Languages: ${CONFIG.languages.join(', ')}`);
  console.log(`FAQ Data: ${CONFIG.faqDataPath}`);
  console.log('=' .repeat(50));

  // Generate files
  const urlCount = generateSitemap();
  generateRobotsTxt();
  generateHtaccess();

  console.log('\n' + '=' .repeat(50));
  console.log('✨ All SEO files generated successfully!');
  console.log('=' .repeat(50));
  console.log('\n📝 Next steps:');
  console.log('1. Submit sitemap.xml to Google Search Console:');
  console.log(`   https://search.google.com/search-console/?resource_id=https://faq.diy.ski`);
  console.log('2. Verify hreflang setup in Search Console > International Targeting');
  console.log('3. Monitor indexation status in Search Console');
  console.log('4. Check robots.txt compliance at: https://search.google.com/test/robots-txt?resource_id=https://faq.diy.ski');
}

// Run
main();
