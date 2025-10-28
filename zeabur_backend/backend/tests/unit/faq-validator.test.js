/**
 * FAQ Validator Tests
 */

const path = require('path');
const FAQValidator = require('../../src/models/faq-validator');

describe('FAQ Validator', () => {
  let validator;

  beforeEach(() => {
    validator = new FAQValidator();
  });

  describe('Schema Validation', () => {
    test('should validate a correct FAQ structure', () => {
      const validFAQ = {
        meta: {
          version: '1.0.0',
          last_updated: '2025-01-15T10:00:00Z',
          total_items: 1,
          link_tokens: {
            LINK_SCHEDULE: 'https://diy.ski/schedule',
          },
          policy_notes: ['NO_QUOTE'],
        },
        items: [
          {
            id: 'faq.test.001',
            intent: 'ITINERARY',
            canonical_question: '這是一個測試問題嗎？',
            utterance_patterns: ['測試問題1', '測試問題2', '測試問題3'],
            answer_template: {
              text: '這是測試答案，至少需要10個字元。',
            },
            keywords: ['測試', '問題'],
            crm_tags: ['#測試'],
            metadata: {
              created_at: '2025-01-15T10:00:00Z',
              updated_at: '2025-01-15T10:00:00Z',
              version: 1,
              status: 'active',
            },
          },
        ],
      };

      const result = validator.validateFAQ(validFAQ);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject FAQ with missing required fields', () => {
      const invalidFAQ = {
        meta: {
          version: '1.0.0',
          last_updated: '2025-01-15T10:00:00Z',
          total_items: 1,
        },
        items: [
          {
            id: 'faq.test.001',
            intent: 'ITINERARY',
            // Missing canonical_question
            utterance_patterns: ['測試問題1', '測試問題2', '測試問題3'],
            answer_template: {
              text: '測試答案',
            },
            keywords: ['測試', '問題'],
            crm_tags: ['#測試'],
          },
        ],
      };

      const result = validator.validateFAQ(invalidFAQ);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should reject invalid FAQ ID format', () => {
      const invalidFAQ = {
        meta: {
          version: '1.0.0',
          last_updated: '2025-01-15T10:00:00Z',
          total_items: 1,
        },
        items: [
          {
            id: 'invalid_id', // Invalid format
            intent: 'ITINERARY',
            canonical_question: '測試問題',
            utterance_patterns: ['測試1', '測試2', '測試3'],
            answer_template: {
              text: '測試答案至少需要10個字元',
            },
            keywords: ['測試', '問題'],
            crm_tags: ['#測試'],
            metadata: {
              created_at: '2025-01-15T10:00:00Z',
              updated_at: '2025-01-15T10:00:00Z',
              version: 1,
              status: 'active',
            },
          },
        ],
      };

      const result = validator.validateFAQ(invalidFAQ);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'id')).toBe(true);
    });

    test('should reject invalid intent type', () => {
      const invalidFAQ = {
        meta: {
          version: '1.0.0',
          last_updated: '2025-01-15T10:00:00Z',
          total_items: 1,
        },
        items: [
          {
            id: 'faq.test.001',
            intent: 'INVALID_INTENT', // Invalid intent
            canonical_question: '測試問題',
            utterance_patterns: ['測試1', '測試2', '測試3'],
            answer_template: {
              text: '測試答案至少需要10個字元',
            },
            keywords: ['測試', '問題'],
            crm_tags: ['#測試'],
            metadata: {
              created_at: '2025-01-15T10:00:00Z',
              updated_at: '2025-01-15T10:00:00Z',
              version: 1,
              status: 'active',
            },
          },
        ],
      };

      const result = validator.validateFAQ(invalidFAQ);

      expect(result.valid).toBe(false);
    });
  });

  describe('Business Rules Validation', () => {
    test('should detect duplicate FAQ IDs', () => {
      const faqWithDuplicateIds = {
        meta: {
          version: '1.0.0',
          last_updated: '2025-01-15T10:00:00Z',
          total_items: 2,
        },
        items: [
          {
            id: 'faq.test.001',
            intent: 'ITINERARY',
            canonical_question: '第一個問題？',
            utterance_patterns: ['問題1', '問題2', '問題3'],
            answer_template: { text: '答案1至少需要10個字元' },
            keywords: ['測試', '問題'],
            crm_tags: ['#測試'],
            metadata: {
              created_at: '2025-01-15T10:00:00Z',
              updated_at: '2025-01-15T10:00:00Z',
              version: 1,
              status: 'active',
            },
          },
          {
            id: 'faq.test.001', // Duplicate ID
            intent: 'BOOKING',
            canonical_question: '第二個問題？',
            utterance_patterns: ['問題A', '問題B', '問題C'],
            answer_template: { text: '答案2至少需要10個字元' },
            keywords: ['測試', '問題'],
            crm_tags: ['#測試'],
            metadata: {
              created_at: '2025-01-15T10:00:00Z',
              updated_at: '2025-01-15T10:00:00Z',
              version: 1,
              status: 'active',
            },
          },
        ],
      };

      const result = validator.validateFAQ(faqWithDuplicateIds);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Duplicate FAQ ID'))).toBe(true);
    });

    test('should detect invalid related_faq_ids references', () => {
      const faqWithInvalidReference = {
        meta: {
          version: '1.0.0',
          last_updated: '2025-01-15T10:00:00Z',
          total_items: 1,
        },
        items: [
          {
            id: 'faq.test.001',
            intent: 'ITINERARY',
            canonical_question: '測試問題？',
            utterance_patterns: ['問題1', '問題2', '問題3'],
            answer_template: { text: '測試答案至少需要10個字元' },
            keywords: ['測試', '問題'],
            related_faq_ids: ['faq.nonexistent.999'], // Non-existent reference
            crm_tags: ['#測試'],
            metadata: {
              created_at: '2025-01-15T10:00:00Z',
              updated_at: '2025-01-15T10:00:00Z',
              version: 1,
              status: 'active',
            },
          },
        ],
      };

      const result = validator.validateFAQ(faqWithInvalidReference);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('does not exist'))).toBe(true);
    });

    test('should validate language consistency', () => {
      const faqWithInconsistentLanguage = {
        meta: {
          version: '1.0.0',
          last_updated: '2025-01-15T10:00:00Z',
          total_items: 1,
        },
        items: [
          {
            id: 'faq.test.001',
            intent: 'ITINERARY',
            canonical_question: '測試問題？',
            canonical_question_en: 'Test question?',
            // Missing text_en
            utterance_patterns: ['問題1', '問題2', '問題3'],
            answer_template: { text: '測試答案至少需要10個字元' },
            keywords: ['測試', '問題'],
            crm_tags: ['#測試'],
            metadata: {
              created_at: '2025-01-15T10:00:00Z',
              updated_at: '2025-01-15T10:00:00Z',
              version: 1,
              status: 'active',
            },
          },
        ],
      };

      const result = validator.validateFAQ(faqWithInconsistentLanguage);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.includes('English'))).toBe(true);
    });
  });

  describe('validateFile', () => {
    test('should handle file loading errors gracefully', () => {
      const result = validator.validateFile('/nonexistent/path/faq.json');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.data).toBeNull();
    });
  });
});
