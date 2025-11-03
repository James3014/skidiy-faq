/**
 * hreflang Tag Management for Multi-Language SEO
 *
 * Automatically generates and manages hreflang alternate link tags
 * to help Google understand language versions of your content.
 *
 * Reference: https://support.google.com/webmasters/answer/189077
 *
 * @module lib/seo-hreflang.js
 * @version 1.0.0
 */

class HrefLangManager {
  // Supported languages and locale variants
  static SUPPORTED_LANGUAGES = {
    'zh': {
      locale: 'zh-TW',
      name: '繁體中文',
      nativeName: '中文'
    },
    'en': {
      locale: 'en-US',
      name: 'English',
      nativeName: 'English'
    },
    'th': {
      locale: 'th-TH',
      name: 'Thai',
      nativeName: 'ไทย'
    }
  };

  /**
   * Inject hreflang alternate link tags based on current URL
   * Call this on page load to establish multi-language relationships
   *
   * Current URL structure: https://faq.diy.ski/?lang=en
   * If no lang parameter, assumes Chinese (default)
   */
  static injectHrefLangTags() {
    const currentUrl = window.location.href;
    const baseUrl = window.location.origin + window.location.pathname;
    const languages = Object.keys(this.SUPPORTED_LANGUAGES);

    // Remove existing hreflang tags
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(tag => {
      tag.remove();
    });

    // Get current language from URL or default to zh
    const currentLang = this.getCurrentLanguage();

    // Add hreflang tags for each language
    languages.forEach(lang => {
      const hrefLangCode = this.SUPPORTED_LANGUAGES[lang].locale;
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = hrefLangCode;

      if (lang === 'zh') {
        // Chinese version doesn't include lang parameter (default)
        link.href = baseUrl;
      } else {
        // Other languages use lang query parameter
        const separator = baseUrl.includes('?') ? '&' : '?';
        link.href = `${baseUrl}${separator}lang=${lang}`;
      }

      document.head.appendChild(link);
    });

    // Add x-default variant (default/fallback version)
    const defaultLink = document.createElement('link');
    defaultLink.rel = 'alternate';
    defaultLink.hreflang = 'x-default';
    defaultLink.href = baseUrl; // Points to Chinese version
    document.head.appendChild(defaultLink);

    console.log(`[SEO] hreflang tags injected (${languages.length} languages + x-default)`);
  }

  /**
   * Get current language from URL parameter
   * @returns {string} Language code (zh|en|th)
   */
  static getCurrentLanguage() {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang');

    if (lang && Object.keys(this.SUPPORTED_LANGUAGES).includes(lang)) {
      return lang;
    }

    // Default to Chinese if not specified
    return 'zh';
  }

  /**
   * Generate hreflang link tag HTML string
   * Useful for server-side rendering or static HTML templates
   *
   * @param {string} baseUrl - Base URL without query parameters
   * @param {string} currentLang - Current language code
   * @returns {string} HTML string of hreflang tags
   */
  static generateHrefLangHTML(baseUrl, currentLang = 'zh') {
    const languages = Object.keys(this.SUPPORTED_LANGUAGES);
    let html = '';

    languages.forEach(lang => {
      const hrefLangCode = this.SUPPORTED_LANGUAGES[lang].locale;
      const href = lang === 'zh' ?
        baseUrl :
        `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}lang=${lang}`;

      html += `  <link rel="alternate" hreflang="${hrefLangCode}" href="${href}">\n`;
    });

    // Add x-default
    html += `  <link rel="alternate" hreflang="x-default" href="${baseUrl}">\n`;

    return html;
  }

  /**
   * Update hreflang tags when language changes (SPA navigation)
   * Call this when user switches language via dropdown
   *
   * @param {string} newLang - New language code
   */
  static updateLanguageVersion(newLang) {
    if (!Object.keys(this.SUPPORTED_LANGUAGES).includes(newLang)) {
      console.error(`[SEO] Unsupported language: ${newLang}`);
      return;
    }

    // Update URL with new language parameter
    const baseUrl = window.location.origin + window.location.pathname;
    let newUrl = baseUrl;

    if (newLang !== 'zh') {
      const separator = baseUrl.includes('?') ? '&' : '?';
      newUrl = `${baseUrl}${separator}lang=${newLang}`;
    }

    // Update URL without page reload (for SPA)
    window.history.replaceState(
      { lang: newLang },
      `${this.SUPPORTED_LANGUAGES[newLang].name}`,
      newUrl
    );

    // Re-inject hreflang tags
    this.injectHrefLangTags();

    console.log(`[SEO] Language updated to: ${newLang} (${this.SUPPORTED_LANGUAGES[newLang].name})`);
  }

  /**
   * Validate hreflang configuration
   * Run this to check if hreflang setup is correct
   *
   * @returns {Object} Validation report
   */
  static validateHrefLangSetup() {
    const report = {
      isValid: true,
      warnings: [],
      errors: [],
      tags: []
    };

    const hrefLangTags = document.querySelectorAll('link[rel="alternate"][hreflang]');

    if (hrefLangTags.length === 0) {
      report.errors.push('No hreflang tags found');
      report.isValid = false;
      return report;
    }

    // Check each tag
    hrefLangTags.forEach(tag => {
      const hreflang = tag.getAttribute('hreflang');
      const href = tag.getAttribute('href');

      report.tags.push({ hreflang, href });

      // Validate hreflang value
      const validFormats = [
        'x-default',
        /^[a-z]{2}$/,  // e.g., 'en'
        /^[a-z]{2}-[A-Z]{2}$/ // e.g., 'en-US'
      ];

      const isValidFormat = validFormats.some(format =>
        typeof format === 'string' ? hreflang === format : format.test(hreflang)
      );

      if (!isValidFormat) {
        report.warnings.push(`Unusual hreflang format: ${hreflang}`);
      }

      // Validate URL
      try {
        new URL(href);
      } catch (e) {
        report.errors.push(`Invalid URL in hreflang: ${href}`);
        report.isValid = false;
      }
    });

    // Check for duplicates
    const hreflangs = Array.from(hrefLangTags).map(t => t.getAttribute('hreflang'));
    const duplicates = hreflangs.filter((item, index) => hreflangs.indexOf(item) !== index);
    if (duplicates.length > 0) {
      report.warnings.push(`Duplicate hreflang values: ${duplicates.join(', ')}`);
    }

    return report;
  }

  /**
   * Get language selector label from current URL
   * @returns {string} Language display name
   */
  static getLanguageLabel() {
    const lang = this.getCurrentLanguage();
    return this.SUPPORTED_LANGUAGES[lang].nativeName;
  }

  /**
   * Get all available language options
   * Useful for populating language selector dropdowns
   *
   * @returns {Array} Array of {code, name, nativeName} objects
   */
  static getLanguageOptions() {
    return Object.entries(this.SUPPORTED_LANGUAGES).map(([code, info]) => ({
      code,
      name: info.name,
      nativeName: info.nativeName,
      locale: info.locale
    }));
  }

  /**
   * Generate language switching links
   * Useful for displaying language switcher in footer or header
   *
   * @returns {Array} Array of {lang, url, label} objects
   */
  static getLanguageSwitcherLinks() {
    const baseUrl = window.location.origin + window.location.pathname;
    const currentLang = this.getCurrentLanguage();

    return this.getLanguageOptions().map(option => ({
      lang: option.code,
      label: option.nativeName,
      url: option.code === 'zh' ?
        baseUrl :
        `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}lang=${option.code}`,
      isActive: option.code === currentLang
    }));
  }

  /**
   * Debug function to inspect current hreflang setup
   */
  static debugHrefLang() {
    console.group('🌐 hreflang Configuration');

    console.log('Current Language:', this.getCurrentLanguage());
    console.log('Current URL:', window.location.href);

    const validation = this.validateHrefLangSetup();
    console.log('Valid:', validation.isValid);

    if (validation.errors.length > 0) {
      console.error('❌ Errors:', validation.errors);
    }

    if (validation.warnings.length > 0) {
      console.warn('⚠️ Warnings:', validation.warnings);
    }

    console.log('Tags:', validation.tags);

    console.log('Language Options:', this.getLanguageOptions());
    console.log('Switcher Links:', this.getLanguageSwitcherLinks());

    console.groupEnd();
  }

  /**
   * Utility: Create language selector HTML
   * Can be used in template or dynamically generated
   *
   * @returns {string} HTML string for language selector
   */
  static generateLanguageSelectorHTML() {
    const links = this.getLanguageSwitcherLinks();

    let html = '<div class="language-selector">\n';

    links.forEach(link => {
      const activeClass = link.isActive ? 'active' : '';
      html += `  <a href="${link.url}" class="lang-link ${activeClass}" data-lang="${link.lang}">${link.label}</a>\n`;
    });

    html += '</div>';

    return html;
  }

  /**
   * Initialize hreflang system on page load
   * Call this in your main initialization code
   */
  static init() {
    // Inject hreflang tags
    this.injectHrefLangTags();

    // Validate setup in development
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      const validation = this.validateHrefLangSetup();
      if (!validation.isValid) {
        console.warn('[SEO] hreflang validation issues:', validation.errors);
      }
    }

    console.log('[SEO] HrefLangManager initialized');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HrefLangManager;
}

// Auto-initialize if not in module environment
if (typeof document !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    HrefLangManager.init();
  });
} else if (typeof document !== 'undefined') {
  // Already loaded
  HrefLangManager.init();
}
