/**
 * SEO Meta Tags and Structured Data Management
 *
 * Handles dynamic meta tags, Open Graph tags, and JSON-LD schema injection
 * for improved search engine visibility and social media sharing.
 *
 * @module lib/seo-meta.js
 * @version 1.0.0
 */

class SEOMeta {
  /**
   * Update page meta tags dynamically
   * @param {Object} options - Configuration object
   * @param {string} options.title - Page title (max 60 chars)
   * @param {string} options.description - Meta description (max 160 chars)
   * @param {string} options.keywords - Meta keywords (comma-separated)
   * @param {string} options.url - Canonical URL
   * @param {string} options.image - OG image URL
   * @param {string} options.faqId - FAQ item ID (for schema generation)
   * @param {string} options.language - Language code (zh|en|th)
   */
  static updatePageMeta(options) {
    const {
      title = 'SkiDIY FAQ',
      description = 'SkiDIY 滑雪常見問題解答平台',
      keywords = '滑雪教練,課程,預約',
      url = window.location.href,
      image = 'https://faq.diy.ski/og-image.png',
      faqId = null,
      language = 'zh'
    } = options;

    // Update title
    if (title) {
      document.title = title;
    }

    // Update or create meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    if (description) {
      metaDesc.content = description;
    }

    // Update or create meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    if (keywords) {
      metaKeywords.content = keywords;
    }

    // Update Open Graph Tags
    this.updateOGTag('og:title', title);
    this.updateOGTag('og:description', description);
    this.updateOGTag('og:image', image);
    this.updateOGTag('og:url', url);
    this.updateOGTag('og:type', 'website');

    // Update Twitter Card Tags
    this.updateMetaTag('twitter:card', 'summary_large_image');
    this.updateMetaTag('twitter:title', title);
    this.updateMetaTag('twitter:description', description);
    this.updateMetaTag('twitter:image', image);

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // Update language meta
    this.updateMetaTag('language', this.getLanguageName(language));

    // Generate and inject FAQ schema if ID provided
    if (faqId) {
      this.updateFAQSchema(faqId);
    }
  }

  /**
   * Update a single OG meta tag
   * @private
   */
  static updateOGTag(property, content) {
    let tag = document.querySelector(`meta[property="${property}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('property', property);
      document.head.appendChild(tag);
    }
    tag.content = content;
  }

  /**
   * Update a single meta tag by name attribute
   * @private
   */
  static updateMetaTag(name, content) {
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.name = name;
      document.head.appendChild(tag);
    }
    tag.content = content;
  }

  /**
   * Map language code to full language name
   * @private
   */
  static getLanguageName(langCode) {
    const langMap = {
      'zh': 'zh-TW',
      'en': 'en-US',
      'th': 'th-TH'
    };
    return langMap[langCode] || 'zh-TW';
  }

  /**
   * Update FAQ Schema for individual FAQ items
   * @private
   */
  static updateFAQSchema(faqItem) {
    // Remove old schema
    const oldSchema = document.querySelector('script[type="application/ld+json"][data-schema-type="faq"]');
    if (oldSchema) oldSchema.remove();

    // Generate and inject new schema
    if (faqItem && faqItem.canonical_question) {
      const schema = this.generateFAQSchema(faqItem);
      this.injectSchema(schema, 'faq');
    }
  }

  /**
   * Generate FAQ item schema
   * @param {Object} faqItem - FAQ item object
   * @returns {Object} JSON-LD schema
   */
  static generateFAQSchema(faqItem) {
    if (!faqItem) return null;

    // Get language from current selection or default
    const lang = window.faqEngine?.language || 'zh';
    const question = faqItem.canonical_question || faqItem[`canonical_question_${lang}`] || '';

    // Get answer text
    const answerText = faqItem.answer_template?.text ||
                      faqItem.answer_template?.[`text_translations`]?.[lang] ||
                      '';

    // Get last modified date
    const lastMod = faqItem.metadata?.last_updated ||
                   faqItem.translation_status?.[lang]?.last_updated ||
                   new Date().toISOString();

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': answerText.replace(/<[^>]*>/g, ''), // Remove HTML tags
            'dateModified': lastMod.split('T')[0] // Date only
          }
        }
      ]
    };
  }

  /**
   * Generate FAQPage schema for multiple FAQ items
   * @param {Array} faqItems - Array of FAQ items
   * @param {string} language - Language code
   * @returns {Object} JSON-LD schema
   */
  static generateFAQPageSchema(faqItems, language = 'zh') {
    if (!faqItems || !Array.isArray(faqItems)) return null;

    const faqs = faqItems.slice(0, 15).map(item => {
      const question = item.canonical_question || item[`canonical_question_${language}`] || '';
      const answerText = (item.answer_template?.text ||
                         item.answer_template?.[`text_translations`]?.[language] ||
                         '').replace(/<[^>]*>/g, '').substring(0, 500);

      return {
        '@type': 'Question',
        'name': question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': answerText
        }
      };
    });

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqs
    };
  }

  /**
   * Generate Organization schema
   * @returns {Object} JSON-LD schema
   */
  static generateOrganizationSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'SkiDIY',
      'url': 'https://diy.ski',
      'logo': 'https://diy.ski/logo.png',
      'description': 'DIY Ski - 日本滑雪教練預約和課程管理平台',
      'contact': {
        '@type': 'ContactPoint',
        'contactType': 'Customer Service',
        'url': 'https://diy.ski'
      },
      'sameAs': [
        'https://www.facebook.com/diyski',
        'https://www.instagram.com/diyski'
      ]
    };
  }

  /**
   * Inject JSON-LD schema into document head
   * @param {Object} schema - JSON-LD schema object
   * @param {string} schemaType - Type identifier (for deduplication)
   */
  static injectSchema(schema, schemaType = 'default') {
    if (!schema) return;

    // Remove existing schema of same type
    const existing = document.querySelector(`script[type="application/ld+json"][data-schema-type="${schemaType}"]`);
    if (existing) existing.remove();

    // Create and inject new schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema-type', schemaType);
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    console.log(`[SEO] ${schemaType} schema injected`);
  }

  /**
   * Initialize SEO for main page
   * @param {string} language - Language code
   * @param {Array} faqItems - FAQ items (optional)
   */
  static initMainPageSEO(language = 'zh', faqItems = null) {
    const titles = {
      'zh': '滑雪教練預約、課程費用、安全須知 | DIY Ski FAQ',
      'en': 'Ski Instructor Booking, Lesson Costs, Safety Guide | DIY Ski FAQ',
      'th': 'การจองโค้ชสกี, ค่าเรียน, คำแนะนำด้านความปลอดภัย | DIY Ski FAQ'
    };

    const descriptions = {
      'zh': 'SkiDIY FAQ 系統提供滑雪課程、教練預約、保險、裝備等常見問題解答。支援中文、英文、泰文，幫助滑雪愛好者快速找到答案。',
      'en': 'SkiDIY FAQ system provides answers to common questions about ski lessons, instructor booking, insurance, and equipment. Supports Chinese, English, and Thai to help ski enthusiasts find quick answers.',
      'th': 'ระบบ FAQ ของ SkiDIY ให้คำตอบสำหรับคำถามทั่วไปเกี่ยวกับบทเรียนสกี การจองโค้ช ประกันภัย และอุปกรณ์ รองรับภาษาจีน อังกฤษ และไทย'
    };

    const keywords = {
      'zh': '滑雪教練,滑雪課程,滑雪預約,日本滑雪,滑雪保險,滑雪費用,滑雪安全',
      'en': 'ski instructor,ski lessons,ski booking,Japan skiing,ski insurance,ski costs,ski safety',
      'th': 'โค้ชสกี,บทเรียนสกี,การจองสกี,สกีญี่ปุ่น,ประกันสกี,ค่าสกี,ความปลอดภัยสกี'
    };

    this.updatePageMeta({
      title: titles[language] || titles.zh,
      description: descriptions[language] || descriptions.zh,
      keywords: keywords[language] || keywords.zh,
      url: window.location.origin + window.location.pathname,
      language: language
    });

    // Inject Organization schema once per page load
    if (!document.querySelector('script[data-schema-type="organization"]')) {
      const orgSchema = this.generateOrganizationSchema();
      this.injectSchema(orgSchema, 'organization');
    }

    // Inject FAQPage schema if FAQ items provided
    if (faqItems && Array.isArray(faqItems)) {
      const faqPageSchema = this.generateFAQPageSchema(faqItems, language);
      this.injectSchema(faqPageSchema, 'faqpage');
    }
  }

  /**
   * Initialize SEO for category/search result pages
   * @param {string} categoryName - Category name
   * @param {string} language - Language code
   * @param {number} faqCount - Number of FAQs in category
   */
  static initCategoryPageSEO(categoryName, language = 'zh', faqCount = 0) {
    const langTitles = {
      'zh': `${categoryName}常見問題 | DIY Ski FAQ`,
      'en': `${categoryName} FAQ | DIY Ski`,
      'th': `${categoryName} คำถามที่พบบ่อย | DIY Ski`
    };

    const langDescriptions = {
      'zh': `瀏覽 ${categoryName} 相關的所有常見問題。${faqCount} 個詳細答案幫助您快速理解。`,
      'en': `Browse all frequently asked questions about ${categoryName}. ${faqCount} detailed answers to help you quickly understand.`,
      'th': `ดูคำถามที่พบบ่อยเกี่ยวกับ ${categoryName} ทั้งหมด ${faqCount} คำตอบโดยละเอียดเพื่อช่วยให้คุณเข้าใจอย่างรวดเร็ว`
    };

    this.updatePageMeta({
      title: langTitles[language] || langTitles.zh,
      description: langDescriptions[language] || langDescriptions.zh,
      url: window.location.href,
      language: language
    });
  }

  /**
   * Breadcrumb schema for navigation
   * @param {Array} breadcrumbs - Array of {name, url} objects
   */
  static generateBreadcrumbSchema(breadcrumbs) {
    if (!breadcrumbs || !Array.isArray(breadcrumbs)) return null;

    const items = breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': crumb.name,
      'item': crumb.url
    }));

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': items
    };
  }

  /**
   * Debug function to inspect current meta tags
   */
  static debugMetaTags() {
    console.group('📋 Current Meta Tags');

    // Title
    console.log('Title:', document.title);

    // Meta description
    const desc = document.querySelector('meta[name="description"]');
    console.log('Description:', desc?.content);

    // Meta keywords
    const keywords = document.querySelector('meta[name="keywords"]');
    console.log('Keywords:', keywords?.content);

    // Canonical
    const canonical = document.querySelector('link[rel="canonical"]');
    console.log('Canonical:', canonical?.href);

    // All schemas
    const schemas = document.querySelectorAll('script[type="application/ld+json"]');
    console.log(`Schemas (${schemas.length}):`);
    schemas.forEach((s, i) => {
      try {
        console.log(`  [${i}]:`, JSON.parse(s.textContent)['@type']);
      } catch (e) {
        console.log(`  [${i}]: Invalid JSON`);
      }
    });

    console.groupEnd();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SEOMeta;
}
