/**
 * FAQ Service
 *
 * Business logic for FAQ CRUD operations
 * Handles data loading, validation, backup, and persistence
 */

const fs = require('fs').promises;
const path = require('path');
const { AppError } = require('../middleware/error-handler');

const SOURCE_LANGUAGE = 'zh';
const TRANSLATION_LANGUAGES = ['en', 'th'];

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function cloneTranslations(translations = {}) {
  return TRANSLATION_LANGUAGES.reduce((acc, lang) => {
    acc[lang] = normalizeString(translations[lang] || '');
    return acc;
  }, {});
}

function determineTranslationStatus({
  language,
  hasContent,
  baseChanged,
  contentVersion,
  now,
  translationChanged,
  previousStatus
}) {
  if (!hasContent) {
    return {
      status: baseChanged ? 'pending' : 'missing',
      last_synced_version: 0,
      last_updated: null
    };
  }

  if (baseChanged && !translationChanged) {
    return {
      status: 'outdated',
      last_synced_version: previousStatus?.last_synced_version || 0,
      last_updated: previousStatus?.last_updated || null
    };
  }

  if (translationChanged) {
    return {
      status: 'complete',
      last_synced_version: contentVersion,
      last_updated: now
    };
  }

  if (previousStatus?.status) {
    const status = baseChanged ? 'outdated' : previousStatus.status;
    return {
      status,
      last_synced_version: baseChanged
        ? previousStatus.last_synced_version || 0
        : previousStatus.last_synced_version || contentVersion,
      last_updated: previousStatus.last_updated || null
    };
  }

  return {
    status: 'complete',
    last_synced_version: contentVersion,
    last_updated: now
  };
}

function normalizeFAQStructure(faqData, previous = null) {
  const now = new Date().toISOString();
  const normalized = JSON.parse(JSON.stringify(faqData));

  normalized.canonical_question = normalizeString(normalized.canonical_question);
  normalized.canonical_question_translations = {
    ...(previous?.canonical_question_translations || {}),
    ...(normalized.canonical_question_translations || {})
  };
  normalized.canonical_question_translations = cloneTranslations(normalized.canonical_question_translations);

  normalized.answer_template = {
    ...(previous?.answer_template || {}),
    ...(normalized.answer_template || {})
  };
  normalized.answer_template.text = normalizeString(normalized.answer_template.text);
  if ('postscript' in normalized.answer_template) {
    normalized.answer_template.postscript = normalizeString(normalized.answer_template.postscript);
  }

  normalized.answer_template.text_translations = cloneTranslations({
    ...(previous?.answer_template?.text_translations || {}),
    ...(normalized.answer_template.text_translations || {})
  });
  normalized.answer_template.postscript_translations = cloneTranslations({
    ...(previous?.answer_template?.postscript_translations || {}),
    ...(normalized.answer_template.postscript_translations || {})
  });

  normalized.metadata = {
    ...(previous?.metadata || {}),
    source_language: SOURCE_LANGUAGE,
  };

  const previousVersion = previous?.metadata?.content_version ?? 1;
  const baseChanged = !previous ||
    normalized.canonical_question !== normalizeString(previous?.canonical_question) ||
    normalized.answer_template.text !== normalizeString(previous?.answer_template?.text) ||
    normalizeString(normalized.answer_template.postscript) !== normalizeString(previous?.answer_template?.postscript);

  let contentVersion = previous ? previousVersion : 1;
  if (previous && baseChanged) {
    contentVersion = previousVersion + 1;
  }

  normalized.metadata.content_version = contentVersion;
  normalized.metadata.last_updated = baseChanged
    ? now
    : (previous?.metadata?.last_updated || now);

  normalized.translation_status = normalized.translation_status || previous?.translation_status || {};
  normalized.translation_status[SOURCE_LANGUAGE] = {
    status: 'source',
    last_synced_version: contentVersion,
    last_updated: normalized.metadata.last_updated
  };

  TRANSLATION_LANGUAGES.forEach(lang => {
    const text = normalizeString(normalized.answer_template.text_translations[lang]);
    normalized.answer_template.text_translations[lang] = text;
    const question = normalizeString(normalized.canonical_question_translations[lang]);
    normalized.canonical_question_translations[lang] = question;
    const postscript = normalizeString(normalized.answer_template.postscript_translations[lang]);
    normalized.answer_template.postscript_translations[lang] = postscript;

    const hasContent = Boolean(text || question || postscript);
    const previousStatus = previous?.translation_status?.[lang];
    const translationChanged = !previous
      ? hasContent
      : (
          text !== normalizeString(previous?.answer_template?.text_translations?.[lang]) ||
          question !== normalizeString(previous?.canonical_question_translations?.[lang]) ||
          postscript !== normalizeString(previous?.answer_template?.postscript_translations?.[lang])
        );

    normalized.translation_status[lang] = determineTranslationStatus({
      language: lang,
      hasContent,
      baseChanged,
      contentVersion,
      now,
      translationChanged,
      previousStatus
    });
  });

  return {
    normalized,
    baseChanged,
    timestamp: now
  };
}

class FAQService {
  constructor() {
    // Support both local development and production deployment
    // Production (Zeabur): /src/src/services -> ../data = /src/src/data
    // Development: __dirname/../../ -> ../../../data
    const dataDir = process.env.FAQ_DATA_DIR || path.join(__dirname, '../data');
    // Use phase0a version (includes translations), keep faq_kb.json as backup
    this.dataPath = path.join(dataDir, 'faq_kb.phase0a.json');
    this.backupPath = path.join(dataDir, 'faq_kb.backup.json');
    this.backupDir = path.join(dataDir, 'backups');

    // In-memory cache
    this.cache = null;
    this.cacheTime = null;
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes

    // Ensure backup directory exists
    this.ensureBackupDir();
  }

  /**
   * Ensure backup directory exists
   */
  async ensureBackupDir() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      console.error('[FAQ Service] Failed to create backup directory:', error);
    }
  }

  /**
   * Load FAQ data from file
   * Uses in-memory cache for performance
   */
  async loadFAQData() {
    // Use cache if available and fresh
    if (this.cache && this.cacheTime && (Date.now() - this.cacheTime) < this.cacheDuration) {
      return this.cache;
    }

    try {
      const content = await fs.readFile(this.dataPath, 'utf-8');
      this.cache = JSON.parse(content);
      this.cacheTime = Date.now();

      // Validate structure
      if (!this.cache.items || !Array.isArray(this.cache.items)) {
        throw new Error('Invalid FAQ data structure: missing items array');
      }

      console.log(`[FAQ Service] Loaded ${this.cache.items.length} FAQ items from JSON file`);
      return this.cache;
    } catch (error) {
      // Fallback: try to load from bundled JS module
      console.warn(`[FAQ Service] Failed to load from ${this.dataPath}, trying fallback module...`);
      try {
        const fallbackPath = path.join(__dirname, '../data/faq_kb.js');
        delete require.cache[require.resolve(fallbackPath)]; // Clear cache
        this.cache = require(fallbackPath);
        this.cacheTime = Date.now();

        if (!this.cache.items || !Array.isArray(this.cache.items)) {
          throw new Error('Invalid fallback FAQ data structure');
        }

        console.log(`[FAQ Service] Loaded ${this.cache.items.length} FAQ items from fallback module`);
        return this.cache;
      } catch (fallbackError) {
        console.error('[FAQ Service] Both load attempts failed:', error, fallbackError);
        throw new AppError('FAQ_LOAD_ERROR', '無法載入 FAQ 資料', 500);
      }
    }
  }

  /**
   * Save FAQ data to file
   * Invalidates cache
   */
  async saveFAQData(data) {
    try {
      // Pretty print JSON with 2-space indentation
      const content = JSON.stringify(data, null, 2);
      await fs.writeFile(this.dataPath, content, 'utf-8');

      // Update cache
      this.cache = data;
      this.cacheTime = Date.now();

      console.log(`[FAQ Service] Saved ${data.items.length} FAQ items`);
      return true;
    } catch (error) {
      console.error('[FAQ Service] Failed to save FAQ data:', error);
      throw new AppError('FAQ_SAVE_ERROR', '無法儲存 FAQ 資料', 500);
    }
  }

  /**
   * Create backup of specific FAQ item
   * Used before update/delete operations
   */
  async createBackup(faqId, faqData) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupId = `backup_${timestamp}_${faqId}`;
      const backupFile = path.join(this.backupDir, `${backupId}.json`);

      const backupData = {
        backup_id: backupId,
        faq_id: faqId,
        created_at: new Date().toISOString(),
        operation: 'backup',
        data: faqData
      };

      await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2), 'utf-8');
      console.log(`[FAQ Service] Created backup: ${backupId}`);

      return backupId;
    } catch (error) {
      console.error('[FAQ Service] Failed to create backup:', error);
      // Don't throw error - backup failure shouldn't block operations
      return null;
    }
  }

  /**
   * Create full database backup
   * Saves entire faq_kb.json as backup
   */
  async createFullBackup() {
    try {
      const data = await this.loadFAQData();
      const content = JSON.stringify(data, null, 2);
      await fs.writeFile(this.backupPath, content, 'utf-8');
      console.log('[FAQ Service] Created full backup');
      return true;
    } catch (error) {
      console.error('[FAQ Service] Failed to create full backup:', error);
      return false;
    }
  }

  /**
   * List FAQs with pagination, search, and filters
   */
  async listFAQs(options = {}) {
    const {
      page = 1,
      limit = 20,
      search = null,
      intent = null,
      section = null,
      hot = null,
      sort = 'created_at',
      order = 'desc'
    } = options;

    const data = await this.loadFAQData();
    let items = [...data.items];

    // Apply search filter
    if (search && search.trim().length > 0) {
      const searchLower = search.toLowerCase().trim();
      items = items.filter(item => {
        const questionVariants = [normalizeString(item.canonical_question)];
        TRANSLATION_LANGUAGES.forEach(lang => {
          questionVariants.push(normalizeString(item.canonical_question_translations?.[lang]));
        });

        const answerVariants = [normalizeString(item.answer_template?.text)];
        TRANSLATION_LANGUAGES.forEach(lang => {
          answerVariants.push(normalizeString(item.answer_template?.text_translations?.[lang]));
          answerVariants.push(normalizeString(item.answer_template?.postscript_translations?.[lang]));
        });

        const idMatch = item.id?.toLowerCase().includes(searchLower);

        return (
          questionVariants.some(text => text && text.toLowerCase().includes(searchLower)) ||
          answerVariants.some(text => text && text.toLowerCase().includes(searchLower)) ||
          idMatch
        );
      });
    }

    // Apply intent filter (supports multiple)
    if (intent && Array.isArray(intent) && intent.length > 0) {
      items = items.filter(item => intent.includes(item.intent));
    }

    // Apply section filter
    if (section) {
      items = items.filter(item => item.section === section);
    }

    // Apply hot filter
    if (hot !== null) {
      items = items.filter(item => item.hot === hot);
    }

    // Sort items
    items.sort((a, b) => {
      let aVal = a[sort];
      let bVal = b[sort];

      // Handle missing values
      if (!aVal) aVal = '';
      if (!bVal) bVal = '';

      // Compare
      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Calculate pagination
    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // Get page items
    const pageItems = items.slice(offset, offset + limit).map(item => ({
      id: item.id,
      canonical_question: item.canonical_question,
      canonical_question_translations: item.canonical_question_translations || {},
      intent: item.intent,
      section: item.section,
      hot: item.hot || false,
      answer_preview: item.answer_template?.text?.substring(0, 150) +
                     (item.answer_template?.text?.length > 150 ? '...' : ''),
      translation_status: item.translation_status || {},
      created_at: item.created_at || null,
      updated_at: item.updated_at || null
    }));

    return {
      items: pageItems,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
      },
      filters: {
        search,
        intent,
        section,
        hot
      }
    };
  }

  /**
   * Get single FAQ by ID
   */
  async getFAQById(faqId) {
    const data = await this.loadFAQData();
    const faq = data.items.find(item => item.id === faqId);
    return faq || null;
  }

  /**
   * Validate FAQ data structure
   * Throws AppError if validation fails
   */
  validateFAQData(faqData) {
    const errors = [];

    // Required fields
    if (!faqData.id) {
      errors.push({ field: 'id', message: 'FAQ ID 為必填欄位' });
    } else {
      // Validate ID format: faq.{category}.{number}
      const idPattern = /^faq\.[a-z]{3,20}\.\d{3}$/;
      if (!idPattern.test(faqData.id)) {
        errors.push({
          field: 'id',
          message: 'FAQ ID 格式錯誤（應為 faq.{category}.{number}）',
          example: 'faq.booking.001'
        });
      }
    }

    if (!faqData.intent) {
      errors.push({ field: 'intent', message: 'Intent 為必填欄位' });
    } else {
      // Validate intent value
      const validIntents = [
        'BOOKING', 'INSTRUCTOR', 'COURSE', 'KIDS_SAFETY',
        'PAYMENT', 'GEAR', 'SERVICE', 'ITINERARY', 'RESORT', 'GENERAL'
      ];
      if (!validIntents.includes(faqData.intent)) {
        errors.push({
          field: 'intent',
          message: '無效的 Intent 值',
          valid_values: validIntents
        });
      }
    }

    if (!faqData.section) {
      errors.push({ field: 'section', message: 'Section 為必填欄位' });
    } else if (faqData.section.length < 1 || faqData.section.length > 50) {
      errors.push({ field: 'section', message: 'Section 長度必須在 1-50 字元之間' });
    }

    if (!faqData.canonical_question) {
      errors.push({ field: 'canonical_question', message: 'Canonical question 為必填欄位' });
    } else if (faqData.canonical_question.length < 5 || faqData.canonical_question.length > 500) {
      errors.push({ field: 'canonical_question', message: 'Canonical question 長度必須在 5-500 字元之間' });
    }

    if (!faqData.answer_template || !faqData.answer_template.text) {
      errors.push({ field: 'answer_template.text', message: 'Answer text 為必填欄位' });
    } else if (faqData.answer_template.text.length < 10 || faqData.answer_template.text.length > 5000) {
      errors.push({ field: 'answer_template.text', message: 'Answer text 長度必須在 10-5000 字元之間' });
    }

    if (faqData.canonical_question_translations && typeof faqData.canonical_question_translations !== 'object') {
      errors.push({ field: 'canonical_question_translations', message: 'Translations 必須為物件' });
    } else if (faqData.canonical_question_translations) {
      TRANSLATION_LANGUAGES.forEach(lang => {
        const value = faqData.canonical_question_translations[lang];
        if (value !== undefined && typeof value !== 'string') {
          errors.push({ field: `canonical_question_translations.${lang}`, message: 'Translation 必須為字串' });
        }
      });
    }

    if (faqData.answer_template?.text_translations && typeof faqData.answer_template.text_translations !== 'object') {
      errors.push({ field: 'answer_template.text_translations', message: 'Translation map 必須為物件' });
    } else if (faqData.answer_template?.text_translations) {
      TRANSLATION_LANGUAGES.forEach(lang => {
        const value = faqData.answer_template.text_translations[lang];
        if (value !== undefined && typeof value !== 'string') {
          errors.push({ field: `answer_template.text_translations.${lang}`, message: 'Translation 必須為字串' });
        }
      });
    }

    if (faqData.answer_template?.postscript_translations && typeof faqData.answer_template.postscript_translations !== 'object') {
      errors.push({ field: 'answer_template.postscript_translations', message: 'Translation map 必須為物件' });
    } else if (faqData.answer_template?.postscript_translations) {
      TRANSLATION_LANGUAGES.forEach(lang => {
        const value = faqData.answer_template.postscript_translations[lang];
        if (value !== undefined && typeof value !== 'string') {
          errors.push({ field: `answer_template.postscript_translations.${lang}`, message: 'Translation 必須為字串' });
        }
      });
    }

    // Optional field validations
    if (faqData.utterance_patterns && Array.isArray(faqData.utterance_patterns)) {
      if (faqData.utterance_patterns.length > 50) {
        errors.push({ field: 'utterance_patterns', message: 'Utterance patterns 陣列最多 50 個元素' });
      }
      faqData.utterance_patterns.forEach((pattern, index) => {
        if (pattern.length < 5 || pattern.length > 200) {
          errors.push({
            field: `utterance_patterns[${index}]`,
            message: 'Utterance pattern 長度必須在 5-200 字元之間'
          });
        }
      });
    }

    // Throw error if validation fails
    if (errors.length > 0) {
      throw new AppError('VALIDATION_ERROR', '資料驗證失敗', 400, { errors });
    }

    return true;
  }

  /**
   * Create new FAQ
   */
  async createFAQ(faqData) {
    const data = await this.loadFAQData();

    // Add timestamps
    const now = new Date().toISOString();
    const { normalized } = normalizeFAQStructure(faqData);
    const newFAQ = {
      ...normalized,
      created_at: now,
      updated_at: now
    };

    newFAQ.metadata.last_updated = now;
    if (newFAQ.translation_status?.[SOURCE_LANGUAGE]) {
      newFAQ.translation_status[SOURCE_LANGUAGE].last_updated = now;
      newFAQ.translation_status[SOURCE_LANGUAGE].last_synced_version = newFAQ.metadata.content_version;
    }

    // Add to items array
    data.items.push(newFAQ);

    // Save data
    await this.saveFAQData(data);

    // Create full backup
    await this.createFullBackup();

    return {
      id: newFAQ.id,
      message: 'FAQ 新增成功',
      created_at: now
    };
  }

  /**
   * Update existing FAQ
   */
  async updateFAQ(faqId, faqData) {
    const data = await this.loadFAQData();

    // Find FAQ index
    const index = data.items.findIndex(item => item.id === faqId);
    if (index === -1) {
      throw new AppError('FAQ_NOT_FOUND', '找不到指定的 FAQ', 404);
    }

    const existing = data.items[index];

    // Backup old version
    const backupId = await this.createBackup(faqId, existing);

    const { normalized, timestamp } = normalizeFAQStructure({ ...existing, ...faqData }, existing);
    const updatedFAQ = {
      ...normalized,
      id: faqId, // Ensure ID doesn't change
      created_at: existing.created_at,
      updated_at: timestamp
    };

    if (updatedFAQ.translation_status?.[SOURCE_LANGUAGE]) {
      updatedFAQ.translation_status[SOURCE_LANGUAGE].last_updated = timestamp;
      updatedFAQ.translation_status[SOURCE_LANGUAGE].last_synced_version = updatedFAQ.metadata.content_version;
    }

    data.items[index] = updatedFAQ;

    // Save data
    await this.saveFAQData(data);

    // Create full backup
    await this.createFullBackup();

    return {
      id: faqId,
      message: 'FAQ 更新成功',
      backup_id: backupId,
      updated_at: updatedFAQ.updated_at
    };
  }

  /**
   * Update hot flag only
   */
  async updateHotFlag(faqId, hot) {
    const data = await this.loadFAQData();

    // Find FAQ
    const faq = data.items.find(item => item.id === faqId);
    if (!faq) {
      throw new AppError('FAQ_NOT_FOUND', '找不到指定的 FAQ', 404);
    }

    // Update hot flag
    faq.hot = hot;
    faq.updated_at = new Date().toISOString();

    // Save data
    await this.saveFAQData(data);

    return {
      id: faqId,
      hot,
      message: '熱門問題標記已更新'
    };
  }

  /**
   * Delete FAQ
   */
  async deleteFAQ(faqId) {
    const data = await this.loadFAQData();

    // Find FAQ index
    const index = data.items.findIndex(item => item.id === faqId);
    if (index === -1) {
      throw new AppError('FAQ_NOT_FOUND', '找不到指定的 FAQ', 404);
    }

    // Backup before deletion
    const backupId = await this.createBackup(faqId, data.items[index]);

    // Remove from array
    data.items.splice(index, 1);

    // Save data
    await this.saveFAQData(data);

    // Create full backup
    await this.createFullBackup();

    return {
      id: faqId,
      message: 'FAQ 已刪除',
      backup_id: backupId,
      deleted_at: new Date().toISOString()
    };
  }

  /**
   * Batch operations
   */
  async batchOperation(operation, ids) {
    const results = [];
    let succeeded = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        let result;

        switch (operation) {
          case 'delete':
            result = await this.deleteFAQ(id);
            results.push({ id, status: 'success', backup_id: result.backup_id });
            succeeded++;
            break;

          case 'mark_hot':
            result = await this.updateHotFlag(id, true);
            results.push({ id, status: 'success' });
            succeeded++;
            break;

          case 'unmark_hot':
            result = await this.updateHotFlag(id, false);
            results.push({ id, status: 'success' });
            succeeded++;
            break;

          default:
            results.push({ id, status: 'failed', error: 'INVALID_OPERATION' });
            failed++;
        }
      } catch (error) {
        results.push({
          id,
          status: 'failed',
          error: error.code || 'UNKNOWN_ERROR',
          message: error.message
        });
        failed++;
      }
    }

    return {
      operation,
      total: ids.length,
      succeeded,
      failed,
      results
    };
  }
}

module.exports = FAQService;
