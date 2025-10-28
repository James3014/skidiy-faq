/**
 * FAQ Schema Validator
 *
 * Validates faq_kb.json against the JSON Schema defined in contracts/faq-schema.json
 * Uses AJV (Another JSON Schema Validator) for validation
 */

const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');

class FAQValidator {
  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: true,
    });

    // Add format validators (date-time, uri, etc.)
    addFormats(this.ajv);

    // Load and compile schema
    const schemaPath = path.join(__dirname, '../../../specs/001-faq-system-upgrade/contracts/faq-schema.json');
    this.schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
    this.validate = this.ajv.compile(this.schema);
  }

  /**
   * Validate FAQ data against schema
   * @param {Object} data - FAQ knowledge base data
   * @returns {Object} - { valid: boolean, errors: array }
   */
  validateFAQ(data) {
    const valid = this.validate(data);

    if (!valid) {
      return {
        valid: false,
        errors: this.formatErrors(this.validate.errors),
      };
    }

    // Additional business logic validation
    const additionalErrors = this.validateBusinessRules(data);

    if (additionalErrors.length > 0) {
      return {
        valid: false,
        errors: additionalErrors,
      };
    }

    return { valid: true, errors: [] };
  }

  /**
   * Format AJV errors for better readability
   * @param {Array} errors - AJV error objects
   * @returns {Array} - Formatted error objects
   */
  formatErrors(errors) {
    return errors.map(err => ({
      path: err.instancePath,
      field: err.params?.missingProperty || err.instancePath.split('/').pop(),
      message: err.message,
      value: err.data,
      schema: err.schemaPath,
    }));
  }

  /**
   * Validate business rules not covered by JSON Schema
   * @param {Object} data - FAQ data
   * @returns {Array} - Array of validation errors
   */
  validateBusinessRules(data) {
    const errors = [];

    // Check for duplicate FAQ IDs
    const idSet = new Set();
    data.items.forEach((item, index) => {
      if (idSet.has(item.id)) {
        errors.push({
          path: `/items/${index}/id`,
          field: 'id',
          message: `Duplicate FAQ ID: ${item.id}`,
          value: item.id,
        });
      }
      idSet.add(item.id);
    });

    // Check for duplicate canonical questions
    const questionSet = new Set();
    data.items.forEach((item, index) => {
      const question = item.canonical_question.trim().toLowerCase();
      if (questionSet.has(question)) {
        errors.push({
          path: `/items/${index}/canonical_question`,
          field: 'canonical_question',
          message: `Duplicate canonical question: "${item.canonical_question}"`,
          value: item.canonical_question,
        });
      }
      questionSet.add(question);
    });

    // Validate related_faq_ids references
    data.items.forEach((item, index) => {
      if (item.related_faq_ids) {
        item.related_faq_ids.forEach(relatedId => {
          const exists = data.items.some(faq => faq.id === relatedId);
          if (!exists) {
            errors.push({
              path: `/items/${index}/related_faq_ids`,
              field: 'related_faq_ids',
              message: `Referenced FAQ ID does not exist: ${relatedId}`,
              value: relatedId,
            });
          }
        });
      }
    });

    // Validate link tokens in answer templates
    if (data.meta.link_tokens) {
      const validTokens = Object.keys(data.meta.link_tokens);

      data.items.forEach((item, index) => {
        if (item.answer_template.links_inline) {
          item.answer_template.links_inline.forEach(token => {
            if (!validTokens.includes(token)) {
              errors.push({
                path: `/items/${index}/answer_template/links_inline`,
                field: 'links_inline',
                message: `Undefined link token: ${token}`,
                value: token,
              });
            }
          });
        }
      });
    }

    // Validate language consistency
    data.items.forEach((item, index) => {
      if (item.canonical_question_en && !item.answer_template.text_en) {
        errors.push({
          path: `/items/${index}/answer_template/text_en`,
          field: 'text_en',
          message: 'English question provided but English answer is missing',
          value: undefined,
        });
      }

      if (item.canonical_question_th && !item.answer_template.text_th) {
        errors.push({
          path: `/items/${index}/answer_template/text_th`,
          field: 'text_th',
          message: 'Thai question provided but Thai answer is missing',
          value: undefined,
        });
      }
    });

    return errors;
  }

  /**
   * Load and validate FAQ file
   * @param {string} filePath - Path to faq_kb.json
   * @returns {Object} - { valid: boolean, errors: array, data: object }
   */
  validateFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      const result = this.validateFAQ(data);

      return {
        ...result,
        data: result.valid ? data : null,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [{
          path: '',
          field: 'file',
          message: `Failed to load or parse FAQ file: ${error.message}`,
          value: filePath,
        }],
        data: null,
      };
    }
  }
}

module.exports = FAQValidator;
