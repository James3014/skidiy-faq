/**
 * Anthropic Claude LLM Provider
 *
 * Implements BaseLLMProvider for Anthropic's Claude models
 * Supports: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
 */

const Anthropic = require('@anthropic-ai/sdk');
const BaseLLMProvider = require('./base-provider');

class ClaudeProvider extends BaseLLMProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'claude';
    this.client = null;
    this.model = config.model || 'claude-3-5-sonnet-20241022';
    this.defaultMaxTokens = config.defaultMaxTokens || 4096;
  }

  /**
   * Initialize Claude client with API key
   * @returns {Promise<void>}
   */
  async initialize() {
    const apiKey = this.config.apiKey || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('Anthropic API key not found. Set ANTHROPIC_API_KEY environment variable.');
    }

    try {
      this.client = new Anthropic({
        apiKey: apiKey
      });

      // Test the connection with a minimal request
      await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      });

      this.isInitialized = true;
      console.log(`[Claude Provider] Initialized successfully with model: ${this.model}`);
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
   * @param {number} options.temperature - Sampling temperature (0-1)
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

      const requestParams = {
        model: this.model,
        max_tokens: maxTokens,
        temperature: temperature,
        messages: [
          { role: 'user', content: prompt }
        ]
      };

      // Add system prompt if provided
      if (systemPrompt) {
        requestParams.system = systemPrompt;
      }

      // Add stop sequences if provided
      if (stopSequences.length > 0) {
        requestParams.stop_sequences = stopSequences;
      }

      const response = await this.client.messages.create(requestParams);

      // Extract text from response
      const text = response.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('');

      return {
        text: text,
        usage: {
          prompt_tokens: response.usage.input_tokens,
          completion_tokens: response.usage.output_tokens,
          total_tokens: response.usage.input_tokens + response.usage.output_tokens
        },
        model: response.model,
        provider: this.name,
        stopReason: response.stop_reason,
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

      const requestParams = {
        model: this.model,
        max_tokens: maxTokens,
        temperature: temperature,
        messages: [
          { role: 'user', content: prompt }
        ],
        stream: true
      };

      if (systemPrompt) {
        requestParams.system = systemPrompt;
      }

      if (stopSequences.length > 0) {
        requestParams.stop_sequences = stopSequences;
      }

      const stream = await this.client.messages.create(requestParams);

      let fullText = '';
      let usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
      let model = this.model;
      let stopReason = null;
      let messageId = null;

      for await (const event of stream) {
        if (event.type === 'message_start') {
          // Message started
          usage.prompt_tokens = event.message.usage.input_tokens;
          messageId = event.message.id;
          model = event.message.model;
        } else if (event.type === 'content_block_delta') {
          // Content chunk received
          if (event.delta.type === 'text_delta') {
            const chunk = event.delta.text;
            fullText += chunk;
            onChunk(chunk);
          }
        } else if (event.type === 'message_delta') {
          // Message metadata update
          stopReason = event.delta.stop_reason;
          usage.completion_tokens = event.usage.output_tokens;
        } else if (event.type === 'message_stop') {
          // Stream ended
          break;
        }
      }

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
   * Count tokens in a text using Claude's tokenizer
   *
   * @param {string} text - Text to count tokens
   * @returns {Promise<number>} Token count
   */
  async countTokens(text) {
    if (!this.isInitialized) {
      // Fallback to approximation if not initialized
      return super.countTokens(text);
    }

    try {
      // Claude API doesn't have a direct token counting endpoint
      // Use Anthropic's counting API if available, otherwise approximate
      const response = await this.client.messages.countTokens({
        model: this.model,
        messages: [{ role: 'user', content: text }]
      });

      return response.input_tokens;
    } catch (error) {
      // Fallback to approximation if counting fails
      console.warn('[Claude Provider] Token counting failed, using approximation:', error.message);
      return super.countTokens(text);
    }
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
      await this.client.messages.create({
        model: this.model,
        max_tokens: 5,
        messages: [{ role: 'user', content: 'hi' }]
      });
      return true;
    } catch (error) {
      console.error('[Claude Provider] Availability check failed:', error.message);
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
        'claude-3-5-sonnet-20241022',
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307'
      ],
      capabilities: {
        streaming: true,
        functionCalling: true,
        vision: true, // Claude 3 models support vision
        maxTokens: 200000, // Claude 3.5 Sonnet context window
        maxOutputTokens: 8192
      },
      pricing: {
        'claude-3-5-sonnet-20241022': {
          input: 0.003, // $ per 1K tokens
          output: 0.015
        },
        'claude-3-opus-20240229': {
          input: 0.015,
          output: 0.075
        },
        'claude-3-sonnet-20240229': {
          input: 0.003,
          output: 0.015
        },
        'claude-3-haiku-20240307': {
          input: 0.00025,
          output: 0.00125
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
    const apiKey = this.config.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      errors.push('API key is required (set ANTHROPIC_API_KEY environment variable)');
    }

    // Check model
    const validModels = this.getMetadata().models;
    if (this.model && !validModels.includes(this.model)) {
      errors.push(`Invalid model: ${this.model}. Valid models: ${validModels.join(', ')}`);
    }

    // Check max tokens
    if (this.defaultMaxTokens && this.defaultMaxTokens > 8192) {
      errors.push('defaultMaxTokens cannot exceed 8192');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
}

module.exports = ClaudeProvider;
