/**
 * Base LLM Provider Abstract Class
 *
 * Defines the interface that all LLM providers must implement.
 * Supports multiple providers: Anthropic Claude, OpenAI GPT, Google Gemini, Ollama
 */

class BaseLLMProvider {
  constructor(config = {}) {
    this.config = config;
    this.name = 'base';
    this.isInitialized = false;
  }

  /**
   * Initialize the provider (load API keys, setup clients, etc.)
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error('initialize() must be implemented by subclass');
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
    throw new Error('generateCompletion() must be implemented by subclass');
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
    throw new Error('generateStreamingCompletion() must be implemented by subclass');
  }

  /**
   * Count tokens in a text (approximate)
   *
   * @param {string} text - Text to count tokens
   * @returns {number} Approximate token count
   */
  countTokens(text) {
    // Simple approximation: 1 token ≈ 4 characters
    // Subclasses should override with provider-specific tokenizer
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if the provider is available (API key exists, network accessible, etc.)
   *
   * @returns {Promise<boolean>} True if provider is available
   */
  async isAvailable() {
    return this.isInitialized;
  }

  /**
   * Get provider metadata
   *
   * @returns {Object} Metadata { name, models, capabilities }
   */
  getMetadata() {
    return {
      name: this.name,
      models: [],
      capabilities: {
        streaming: false,
        functionCalling: false,
        vision: false
      }
    };
  }

  /**
   * Validate configuration
   *
   * @returns {Object} Validation result { valid, errors }
   */
  validateConfig() {
    return {
      valid: true,
      errors: []
    };
  }

  /**
   * Format error for consistent error handling
   *
   * @param {Error} error - Original error
   * @returns {Error} Formatted error
   */
  formatError(error) {
    const formattedError = new Error(`[${this.name}] ${error.message}`);
    formattedError.provider = this.name;
    formattedError.originalError = error;
    return formattedError;
  }
}

module.exports = BaseLLMProvider;
