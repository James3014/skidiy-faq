/**
 * i18n Utility Module
 * T042: i18n utility functions (loadLanguage, translateUI)
 * T043: Language fallback logic: current_lang → zh → "暫無翻譯"
 * T046: Store selected language in localStorage
 */

class I18n {
  constructor() {
    this.currentLanguage = 'zh';
    this.translations = {};
    this.supportedLanguages = ['zh', 'en', 'th'];
    this.defaultLanguage = 'zh';
  }

  /**
   * Initialize i18n system
   * Loads saved language from localStorage and translation files
   */
  async initialize() {
    // T046: Load saved language preference from localStorage
    const savedLanguage = localStorage.getItem('faq_language');
    if (savedLanguage && this.supportedLanguages.includes(savedLanguage)) {
      this.currentLanguage = savedLanguage;
    }

    // Load all translation files
    await Promise.all(
      this.supportedLanguages.map(lang => this.loadLanguage(lang))
    );

    console.log(`[i18n] Initialized with language: ${this.currentLanguage}`);
  }

  /**
   * Load translation file for a specific language
   * T042: loadLanguage function
   *
   * @param {string} language - Language code (zh/en/th)
   * @returns {Promise<Object>} Translation object
   */
  async loadLanguage(language) {
    if (!this.supportedLanguages.includes(language)) {
      console.warn(`[i18n] Unsupported language: ${language}`);
      return null;
    }

    try {
      const response = await fetch(`assets/i18n/${language}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${language}.json: ${response.status}`);
      }

      this.translations[language] = await response.json();
      console.log(`[i18n] Loaded ${language} translations`);
      return this.translations[language];
    } catch (error) {
      console.error(`[i18n] Error loading ${language} translations:`, error);
      return null;
    }
  }

  /**
   * Get translation for a key
   * T043: Implements fallback logic: current_lang → zh → "暫無翻譯"
   *
   * @param {string} key - Translation key (supports dot notation: "intents.BOOKING")
   * @param {Object} params - Parameters for string interpolation {count: 5} -> "{count}"
   * @returns {string} Translated string or fallback
   */
  t(key, params = {}) {
    // Try current language
    let value = this.getNestedValue(this.translations[this.currentLanguage], key);

    // T043: Fallback to default language (zh)
    if (value === undefined && this.currentLanguage !== this.defaultLanguage) {
      value = this.getNestedValue(this.translations[this.defaultLanguage], key);
    }

    // Final fallback
    if (value === undefined) {
      console.warn(`[i18n] Missing translation for key: ${key}`);
      return `[${key}]`;
    }

    // String interpolation for parameters like {count}, {query}, {time}
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }

    return value;
  }

  /**
   * Get nested object value by dot notation path
   * Example: "intents.BOOKING" -> translations.intents.BOOKING
   *
   * @param {Object} obj - Object to traverse
   * @param {string} path - Dot notation path
   * @returns {*} Value or undefined
   */
  getNestedValue(obj, path) {
    if (!obj) return undefined;

    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current[key] === undefined) {
        return undefined;
      }
      current = current[key];
    }

    return current;
  }

  /**
   * Set current language and persist to localStorage
   * T046: Store selected language in localStorage
   *
   * @param {string} language - Language code
   * @returns {boolean} Success status
   */
  setLanguage(language) {
    if (!this.supportedLanguages.includes(language)) {
      console.error(`[i18n] Invalid language: ${language}`);
      return false;
    }

    if (!this.translations[language]) {
      console.error(`[i18n] Translations not loaded for: ${language}`);
      return false;
    }

    this.currentLanguage = language;

    // T046: Save to localStorage
    localStorage.setItem('faq_language', language);

    console.log(`[i18n] Language changed to: ${language}`);
    return true;
  }

  /**
   * Get current language
   * @returns {string} Current language code
   */
  getLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get all supported languages
   * @returns {Array<string>} Array of language codes
   */
  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  /**
   * Translate all elements with data-i18n attribute
   * T042: translateUI function
   *
   * Usage in HTML:
   * <h1 data-i18n="app_title"></h1>
   * <p data-i18n="results_count" data-i18n-params='{"count": 5}'></p>
   */
  translateUI() {
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const paramsAttr = element.getAttribute('data-i18n-params');

      let params = {};
      if (paramsAttr) {
        try {
          params = JSON.parse(paramsAttr);
        } catch (error) {
          console.warn(`[i18n] Invalid JSON in data-i18n-params: ${paramsAttr}`);
        }
      }

      const translation = this.t(key, params);

      // Handle different element types
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    });

    console.log(`[i18n] Translated ${elements.length} UI elements`);
  }

  /**
   * Check if a translation key exists
   * @param {string} key - Translation key
   * @param {string} language - Language code (optional, defaults to current)
   * @returns {boolean} True if key exists
   */
  hasTranslation(key, language = null) {
    const lang = language || this.currentLanguage;
    const value = this.getNestedValue(this.translations[lang], key);
    return value !== undefined;
  }

  /**
   * Get language name in native script
   * @param {string} language - Language code
   * @returns {string} Language name
   */
  getLanguageName(language) {
    const names = {
      zh: '中文',
      en: 'English',
      th: 'ไทย'
    };
    return names[language] || language;
  }

  /**
   * Format number according to current language locale
   * @param {number} number - Number to format
   * @returns {string} Formatted number
   */
  formatNumber(number) {
    const locales = {
      zh: 'zh-CN',
      en: 'en-US',
      th: 'th-TH'
    };

    const locale = locales[this.currentLanguage] || 'en-US';
    return new Intl.NumberFormat(locale).format(number);
  }

  /**
   * Format date according to current language locale
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted date
   */
  formatDate(date) {
    const locales = {
      zh: 'zh-CN',
      en: 'en-US',
      th: 'th-TH'
    };

    const locale = locales[this.currentLanguage] || 'en-US';
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(dateObj);
  }
}

// Note: Global instance removed to avoid conflicts with page-level declarations
// Each page should create its own i18n instance: const i18n = new I18n();

// Export the class for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18n;
}
