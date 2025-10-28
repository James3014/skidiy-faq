/**
 * Google Gemini LLM Provider
 *
 * Implements BaseLLMProvider for Google's Gemini models
 * Supports: Gemini Pro, Gemini Pro Vision
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const BaseLLMProvider = require('./base-provider');

class GeminiProvider extends BaseLLMProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'gemini';
    this.client = null;
    this.model = config.model || 'gemini-2.5-flash';
    this.modelInstance = null;
    this.defaultMaxTokens = config.defaultMaxTokens || 8192;
  }

  /**
   * Initialize Gemini client with API key
   * @returns {Promise<void>}
   */
  async initialize() {
    const apiKey = this.config.apiKey || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error('Google API key not found. Set GOOGLE_API_KEY environment variable.');
    }

    try {
      this.client = new GoogleGenerativeAI(apiKey);
      this.modelInstance = this.client.getGenerativeModel({ model: this.model });

      // Test the connection with a minimal request
      const result = await this.modelInstance.generateContent('test');
      await result.response;

      this.isInitialized = true;
      console.log(`[Gemini Provider] Initialized successfully with model: ${this.model}`);
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
   * @param {string} options.systemPrompt - System message (prepended to prompt)
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
        temperature = 0.9,
        systemPrompt = null,
        stopSequences = []
      } = options;

      // Combine system prompt with user prompt if provided
      let fullPrompt = prompt;
      if (systemPrompt) {
        fullPrompt = `${systemPrompt}\n\n${prompt}`;
      }

      const generationConfig = {
        maxOutputTokens: maxTokens,
        temperature: temperature
      };

      if (stopSequences.length > 0) {
        generationConfig.stopSequences = stopSequences;
      }

      const result = await this.modelInstance.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: generationConfig
      });

      const response = await result.response;
      const text = response.text();

      // Gemini doesn't provide token usage in the response by default
      // Approximate token counts
      const usage = {
        prompt_tokens: this.countTokens(fullPrompt),
        completion_tokens: this.countTokens(text),
        total_tokens: 0
      };
      usage.total_tokens = usage.prompt_tokens + usage.completion_tokens;

      return {
        text: text,
        usage: usage,
        model: this.model,
        provider: this.name,
        stopReason: response.candidates?.[0]?.finishReason || 'stop',
        id: null // Gemini doesn't provide response IDs
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
        temperature = 0.9,
        systemPrompt = null,
        stopSequences = []
      } = options;

      // Combine system prompt with user prompt if provided
      let fullPrompt = prompt;
      if (systemPrompt) {
        fullPrompt = `${systemPrompt}\n\n${prompt}`;
      }

      const generationConfig = {
        maxOutputTokens: maxTokens,
        temperature: temperature
      };

      if (stopSequences.length > 0) {
        generationConfig.stopSequences = stopSequences;
      }

      const result = await this.modelInstance.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: generationConfig
      });

      let fullText = '';
      let stopReason = null;

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        onChunk(chunkText);

        if (chunk.candidates?.[0]?.finishReason) {
          stopReason = chunk.candidates[0].finishReason;
        }
      }

      // Approximate token counts
      const usage = {
        prompt_tokens: this.countTokens(fullPrompt),
        completion_tokens: this.countTokens(fullText),
        total_tokens: 0
      };
      usage.total_tokens = usage.prompt_tokens + usage.completion_tokens;

      return {
        text: fullText,
        usage: usage,
        model: this.model,
        provider: this.name,
        stopReason: stopReason || 'stop',
        id: null
      };
    } catch (error) {
      throw this.formatError(error);
    }
  }

  /**
   * Count tokens in a text (approximate)
   *
   * @param {string} text - Text to count tokens
   * @returns {number} Token count
   */
  countTokens(text) {
    // Gemini doesn't have a public token counting API
    // Use approximation: ~4 characters per token
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
      const result = await this.modelInstance.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'hi' }] }],
        generationConfig: { maxOutputTokens: 5 }
      });
      await result.response;
      return true;
    } catch (error) {
      console.error('[Gemini Provider] Availability check failed:', error.message);
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
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro',
        'gemini-pro-vision'
      ],
      capabilities: {
        streaming: true,
        functionCalling: true,
        vision: this.model === 'gemini-pro-vision',
        maxTokens: 30720, // Gemini Pro context window
        maxOutputTokens: 2048
      },
      pricing: {
        'gemini-pro': {
          input: 0.00025, // $ per 1K tokens (free tier available)
          output: 0.0005
        },
        'gemini-pro-vision': {
          input: 0.00025,
          output: 0.0005
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
    const apiKey = this.config.apiKey || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      errors.push('API key is required (set GOOGLE_API_KEY environment variable)');
    }

    // Check model
    const validModels = this.getMetadata().models;
    if (this.model && !validModels.includes(this.model)) {
      errors.push(`Invalid model: ${this.model}. Valid models: ${validModels.join(', ')}`);
    }

    // Check max tokens
    if (this.defaultMaxTokens && this.defaultMaxTokens > 2048) {
      errors.push('defaultMaxTokens cannot exceed 2048');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
}

module.exports = GeminiProvider;
