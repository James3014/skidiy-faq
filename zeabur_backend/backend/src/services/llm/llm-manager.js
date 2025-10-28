/**
 * LLM Manager
 *
 * Manages multiple LLM providers (Claude, OpenAI, Gemini, Ollama)
 * Handles provider selection, fallback logic, and load balancing
 */

const ClaudeProvider = require('./claude-provider');
const OpenAIProvider = require('./openai-provider');
const GeminiProvider = require('./gemini-provider');
const OllamaProvider = require('./ollama-provider');

class LLMManager {
  constructor(config = {}) {
    this.config = config;
    this.providers = new Map();
    this.isInitialized = false;
    this.defaultProvider = config.defaultProvider || 'claude';
    this.fallbackEnabled = config.fallbackEnabled !== false; // Default: true
    this.providerOrder = config.providerOrder || ['claude', 'openai', 'gemini', 'ollama'];
  }

  /**
   * Initialize all available providers
   * @returns {Promise<void>}
   */
  async initialize() {
    console.log('[LLM Manager] Initializing providers...');

    const providerConfigs = {
      claude: {
        class: ClaudeProvider,
        config: this.config.claude || {}
      },
      openai: {
        class: OpenAIProvider,
        config: this.config.openai || {}
      },
      gemini: {
        class: GeminiProvider,
        config: this.config.gemini || {}
      },
      ollama: {
        class: OllamaProvider,
        config: this.config.ollama || {}
      }
    };

    // Initialize each provider
    const initResults = await Promise.allSettled(
      Object.entries(providerConfigs).map(async ([name, { class: ProviderClass, config }]) => {
        try {
          const provider = new ProviderClass(config);
          await provider.initialize();
          this.providers.set(name, provider);
          console.log(`[LLM Manager] ✓ ${name} provider initialized`);
          return { name, success: true };
        } catch (error) {
          console.warn(`[LLM Manager] ✗ ${name} provider failed:`, error.message);
          return { name, success: false, error: error.message };
        }
      })
    );

    // Check if at least one provider is available
    const availableProviders = Array.from(this.providers.keys());
    if (availableProviders.length === 0) {
      throw new Error('No LLM providers available. Check your API keys and configuration.');
    }

    // Adjust default provider if not available
    if (!this.providers.has(this.defaultProvider)) {
      this.defaultProvider = availableProviders[0];
      console.log(`[LLM Manager] Default provider switched to: ${this.defaultProvider}`);
    }

    this.isInitialized = true;
    console.log(`[LLM Manager] Initialized with ${availableProviders.length} provider(s): ${availableProviders.join(', ')}`);
  }

  /**
   * Get a specific provider
   * @param {string} providerName - Provider name
   * @returns {BaseLLMProvider|null} Provider instance or null
   */
  getProvider(providerName) {
    return this.providers.get(providerName) || null;
  }

  /**
   * Get all available providers
   * @returns {Array<string>} List of provider names
   */
  getAvailableProviders() {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if a provider is available
   * @param {string} providerName - Provider name
   * @returns {Promise<boolean>} True if available
   */
  async isProviderAvailable(providerName) {
    const provider = this.providers.get(providerName);
    if (!provider) return false;

    try {
      return await provider.isAvailable();
    } catch (error) {
      console.error(`[LLM Manager] Availability check failed for ${providerName}:`, error);
      return false;
    }
  }

  /**
   * Generate a completion with automatic provider selection and fallback
   *
   * @param {string} prompt - The input prompt
   * @param {Object} options - Generation options
   * @param {string} options.provider - Specific provider to use (optional)
   * @param {boolean} options.fallback - Enable fallback (default: true)
   * @param {number} options.maxTokens - Maximum tokens to generate
   * @param {number} options.temperature - Sampling temperature
   * @param {string} options.systemPrompt - System message
   * @param {Array} options.stopSequences - Stop sequences
   * @returns {Promise<Object>} Response object
   */
  async generateCompletion(prompt, options = {}) {
    if (!this.isInitialized) {
      throw new Error('LLM Manager not initialized. Call initialize() first.');
    }

    const {
      provider: requestedProvider = this.defaultProvider,
      fallback = this.fallbackEnabled,
      ...generationOptions
    } = options;

    // Determine provider order
    let providerOrder = [requestedProvider];
    if (fallback) {
      // Add other providers as fallbacks
      providerOrder = [
        requestedProvider,
        ...this.providerOrder.filter(p => p !== requestedProvider && this.providers.has(p))
      ];
    }

    let lastError = null;

    // Try each provider in order
    for (const providerName of providerOrder) {
      const provider = this.providers.get(providerName);

      if (!provider) {
        continue;
      }

      try {
        console.log(`[LLM Manager] Generating completion with ${providerName}...`);
        const result = await provider.generateCompletion(prompt, generationOptions);
        console.log(`[LLM Manager] ✓ Completion generated successfully with ${providerName}`);
        return result;
      } catch (error) {
        lastError = error;
        console.error(`[LLM Manager] ✗ ${providerName} failed:`, error.message);

        if (!fallback) {
          throw error;
        }

        // Continue to next provider
        console.log(`[LLM Manager] Trying fallback provider...`);
      }
    }

    // All providers failed
    throw new Error(`All LLM providers failed. Last error: ${lastError?.message}`);
  }

  /**
   * Generate a streaming completion with automatic provider selection
   *
   * @param {string} prompt - The input prompt
   * @param {Object} options - Generation options
   * @param {Function} onChunk - Callback for each chunk
   * @returns {Promise<Object>} Final response object
   */
  async generateStreamingCompletion(prompt, options = {}, onChunk) {
    if (!this.isInitialized) {
      throw new Error('LLM Manager not initialized. Call initialize() first.');
    }

    const {
      provider: requestedProvider = this.defaultProvider,
      fallback = this.fallbackEnabled,
      ...generationOptions
    } = options;

    // Determine provider order
    let providerOrder = [requestedProvider];
    if (fallback) {
      providerOrder = [
        requestedProvider,
        ...this.providerOrder.filter(p => p !== requestedProvider && this.providers.has(p))
      ];
    }

    let lastError = null;

    // Try each provider in order
    for (const providerName of providerOrder) {
      const provider = this.providers.get(providerName);

      if (!provider) {
        continue;
      }

      try {
        console.log(`[LLM Manager] Generating streaming completion with ${providerName}...`);
        const result = await provider.generateStreamingCompletion(prompt, generationOptions, onChunk);
        console.log(`[LLM Manager] ✓ Streaming completion generated successfully with ${providerName}`);
        return result;
      } catch (error) {
        lastError = error;
        console.error(`[LLM Manager] ✗ ${providerName} streaming failed:`, error.message);

        if (!fallback) {
          throw error;
        }

        // Continue to next provider
        console.log(`[LLM Manager] Trying fallback provider...`);
      }
    }

    // All providers failed
    throw new Error(`All LLM providers failed for streaming. Last error: ${lastError?.message}`);
  }

  /**
   * Get metadata for all providers
   * @returns {Object} Provider metadata
   */
  getAllMetadata() {
    const metadata = {};

    for (const [name, provider] of this.providers) {
      metadata[name] = provider.getMetadata();
    }

    return {
      defaultProvider: this.defaultProvider,
      availableProviders: this.getAvailableProviders(),
      providerOrder: this.providerOrder,
      fallbackEnabled: this.fallbackEnabled,
      providers: metadata
    };
  }

  /**
   * Count tokens across all providers (uses default provider)
   * @param {string} text - Text to count
   * @returns {number} Token count
   */
  countTokens(text) {
    const provider = this.providers.get(this.defaultProvider);
    if (provider) {
      return provider.countTokens(text);
    }

    // Fallback approximation
    return Math.ceil(text.length / 4);
  }

  /**
   * Switch default provider
   * @param {string} providerName - New default provider
   * @throws {Error} If provider is not available
   */
  setDefaultProvider(providerName) {
    if (!this.providers.has(providerName)) {
      throw new Error(`Provider ${providerName} is not available. Available providers: ${this.getAvailableProviders().join(', ')}`);
    }

    this.defaultProvider = providerName;
    console.log(`[LLM Manager] Default provider set to: ${providerName}`);
  }

  /**
   * Get current configuration
   * @returns {Object} Configuration
   */
  getConfig() {
    return {
      defaultProvider: this.defaultProvider,
      fallbackEnabled: this.fallbackEnabled,
      providerOrder: this.providerOrder,
      availableProviders: this.getAvailableProviders()
    };
  }

  /**
   * Test all providers with a simple prompt
   * @returns {Promise<Object>} Test results
   */
  async testAllProviders() {
    const results = {};

    for (const [name, provider] of this.providers) {
      try {
        const startTime = Date.now();
        const response = await provider.generateCompletion('Hello', { maxTokens: 10 });
        const duration = Date.now() - startTime;

        results[name] = {
          success: true,
          duration,
          model: response.model,
          text: response.text.substring(0, 50)
        };
      } catch (error) {
        results[name] = {
          success: false,
          error: error.message
        };
      }
    }

    return results;
  }
}

module.exports = LLMManager;
