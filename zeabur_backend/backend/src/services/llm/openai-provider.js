/**
 * OpenAI LLM Provider
 *
 * Implements BaseLLMProvider for OpenAI's GPT models
 * Supports: GPT-4 Turbo, GPT-4, GPT-3.5 Turbo
 */

const OpenAI = require('openai');
const BaseLLMProvider = require('./base-provider');

class OpenAIProvider extends BaseLLMProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'openai';
    this.client = null;
    this.model = config.model || 'gpt-4-turbo-preview';
    this.defaultMaxTokens = config.defaultMaxTokens || 4096;
  }

  /**
   * Initialize OpenAI client with API key
   * @returns {Promise<void>}
   */
  async initialize() {
    const apiKey = this.config.apiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI API key not found. Set OPENAI_API_KEY environment variable.');
    }

    try {
      this.client = new OpenAI({
        apiKey: apiKey
      });

      // Test the connection with a minimal request
      await this.client.chat.completions.create({
        model: this.model,
        max_tokens: 5,
        messages: [{ role: 'user', content: 'test' }]
      });

      this.isInitialized = true;
      console.log(`[OpenAI Provider] Initialized successfully with model: ${this.model}`);
    } catch (error) {
      throw this.formatError(new Error(`Failed to initialize: ${error.message}`));
    }
  }

  /**
   * Generate a completion from a prompt
   *
   * @param {string} prompt - The input prompt
   * @param {Object} options - Generation options
   * @param {number} options.maxTokens - Maximum tokens to generate
   * @param {number} options.temperature - Sampling temperature (0-2)
   * @param {string} options.systemPrompt - System message
   * @param {Array} options.stopSequences - Stop sequences
   * @returns {Promise<Object>} Response object { text, usage, model, provider }
   */
  async generateCompletion(prompt, options = {}) {
    if (!this.isInitialized) {
      throw this.formatError(new Error('Provider not initialized. Call initialize() first.'));
    }

    try {
      const {
        maxTokens = this.defaultMaxTokens,
        temperature = 1.0,
        systemPrompt = null,
        stopSequences = []
      } = options;

      const messages = [];

      // Add system prompt if provided
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }

      messages.push({ role: 'user', content: prompt });

      const requestParams = {
        model: this.model,
        max_tokens: maxTokens,
        temperature: temperature,
        messages: messages
      };

      // Add stop sequences if provided
      if (stopSequences.length > 0) {
        requestParams.stop = stopSequences;
      }

      const response = await this.client.chat.completions.create(requestParams);

      const choice = response.choices[0];

      return {
        text: choice.message.content,
        usage: {
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
          total_tokens: response.usage.total_tokens
        },
        model: response.model,
        provider: this.name,
        stopReason: choice.finish_reason,
        id: response.id
      };
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Generate a streaming completion
   *
   * @param {string} prompt - The input prompt
   * @param {Object} options - Generation options
   * @param {Function} onChunk - Callback for each chunk (chunk) => void
   * @returns {Promise<Object>} Final response object
   */
  async generateStreamingCompletion(prompt, options = {}, onChunk) {
    if (!this.isInitialized) {
      throw this.formatError(new Error('Provider not initialized. Call initialize() first.'));
    }

    if (typeof onChunk !== 'function') {
      throw this.formatError(new Error('onChunk callback is required for streaming'));
    }

    try {
      const {
        maxTokens = this.defaultMaxTokens,
        temperature = 1.0,
        systemPrompt = null,
        stopSequences = []
      } = options;

      const messages = [];

      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }

      messages.push({ role: 'user', content: prompt });

      const requestParams = {
        model: this.model,
        max_tokens: maxTokens,
        temperature: temperature,
        messages: messages,
        stream: true
      };

      if (stopSequences.length > 0) {
        requestParams.stop = stopSequences;
      }

      const stream = await this.client.chat.completions.create(requestParams);

      let fullText = '';
      let model = this.model;
      let stopReason = null;
      let messageId = null;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;

        if (chunk.id) {
          messageId = chunk.id;
        }

        if (chunk.model) {
          model = chunk.model;
        }

        if (delta?.content) {
          const text = delta.content;
          fullText += text;
          onChunk(text);
        }

        if (chunk.choices[0]?.finish_reason) {
          stopReason = chunk.choices[0].finish_reason;
        }
      }

      // OpenAI doesn't provide token usage in streaming mode by default
      // Approximate token count
      const usage = {
        prompt_tokens: this.countTokens(prompt + (systemPrompt || '')),
        completion_tokens: this.countTokens(fullText),
        total_tokens: 0
      };
      usage.total_tokens = usage.prompt_tokens + usage.completion_tokens;

      return {
        text: fullText,
        usage: usage,
        model: model,
        provider: this.name,
        stopReason: stopReason,
        id: messageId
      };
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Count tokens in a text using tiktoken (OpenAI's tokenizer)
   *
   * @param {string} text - Text to count tokens
   * @returns {number} Token count
   */
  countTokens(text) {
    // For now, use approximation
    // TODO: Integrate tiktoken library for accurate counting
    // const encoding = tiktoken.encoding_for_model(this.model);
    // return encoding.encode(text).length;

    // Approximation: GPT models average ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if the provider is available
   *
   * @returns {Promise<boolean>} True if provider is available
   */
  async isAvailable() {
    if (!this.isInitialized) {
      return false;
    }

    try {
      // Quick health check with minimal token usage
      await this.client.chat.completions.create({
        model: this.model,
        max_tokens: 5,
        messages: [{ role: 'user', content: 'hi' }]
      });
      return true;
    } catch (error) {
      console.error('[OpenAI Provider] Availability check failed:', error.message);
      return false;
    }
  }

  /**
   * Get provider metadata
   *
   * @returns {Object} Metadata { name, models, capabilities }
   */
  getMetadata() {
    return {
      name: this.name,
      models: [
        'gpt-4-turbo-preview',
        'gpt-4-0125-preview',
        'gpt-4-1106-preview',
        'gpt-4',
        'gpt-4-0613',
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-0125',
        'gpt-3.5-turbo-1106'
      ],
      capabilities: {
        streaming: true,
        functionCalling: true,
        vision: false, // GPT-4V has vision, but not standard models
        maxTokens: 128000, // GPT-4 Turbo context window
        maxOutputTokens: 4096
      },
      pricing: {
        'gpt-4-turbo-preview': {
          input: 0.01, // $ per 1K tokens
          output: 0.03
        },
        'gpt-4': {
          input: 0.03,
          output: 0.06
        },
        'gpt-3.5-turbo': {
          input: 0.0005,
          output: 0.0015
        }
      }
    };
  }

  /**
   * Validate configuration
   *
   * @returns {Object} Validation result { valid, errors }
   */
  validateConfig() {
    const errors = [];

    // Check API key
    const apiKey = this.config.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      errors.push('API key is required (set OPENAI_API_KEY environment variable)');
    }

    // Check model
    const validModels = this.getMetadata().models;
    if (this.model && !validModels.includes(this.model)) {
      errors.push(`Invalid model: ${this.model}. Valid models: ${validModels.join(', ')}`);
    }

    // Check max tokens
    if (this.defaultMaxTokens && this.defaultMaxTokens > 4096) {
      errors.push('defaultMaxTokens cannot exceed 4096 for most models');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
}

module.exports = OpenAIProvider;
