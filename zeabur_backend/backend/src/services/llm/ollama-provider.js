/**
 * Ollama LLM Provider
 *
 * Implements BaseLLMProvider for Ollama (local models)
 * Supports: Llama 2, Mistral, Mixtral, CodeLlama, and other Ollama models
 */

const axios = require('axios');
const BaseLLMProvider = require('./base-provider');

class OllamaProvider extends BaseLLMProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'ollama';
    this.baseURL = config.baseURL || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = config.model || 'llama2';
    this.defaultMaxTokens = config.defaultMaxTokens || 2048;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 120000 // 2 minutes timeout for local inference
    });
  }

  /**
   * Initialize Ollama client
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      // Check if Ollama is running
      const response = await this.client.get('/api/tags');

      if (response.status !== 200) {
        throw new Error('Ollama server not responding correctly');
      }

      // Check if the model is available
      const models = response.data.models || [];
      const modelExists = models.some(m => m.name === this.model || m.name.startsWith(this.model + ':'));

      if (!modelExists) {
        console.warn(`[Ollama Provider] Model ${this.model} not found. Available models:`, models.map(m => m.name));
        console.warn(`[Ollama Provider] You may need to pull the model: ollama pull ${this.model}`);
      }

      this.isInitialized = true;
      console.log(`[Ollama Provider] Initialized successfully with model: ${this.model} at ${this.baseURL}`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw this.formatError(new Error('Ollama server not running. Start it with: ollama serve'));
      }
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
        temperature = 0.8,
        systemPrompt = null,
        stopSequences = []
      } = options;

      const requestBody = {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          num_predict: maxTokens,
          temperature: temperature
        }
      };

      // Add system prompt if provided
      if (systemPrompt) {
        requestBody.system = systemPrompt;
      }

      // Add stop sequences if provided
      if (stopSequences.length > 0) {
        requestBody.options.stop = stopSequences;
      }

      const response = await this.client.post('/api/generate', requestBody);

      const data = response.data;

      return {
        text: data.response,
        usage: {
          prompt_tokens: data.prompt_eval_count || this.countTokens(prompt),
          completion_tokens: data.eval_count || this.countTokens(data.response),
          total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
        },
        model: data.model,
        provider: this.name,
        stopReason: data.done_reason || (data.done ? 'stop' : 'length'),
        id: null, // Ollama doesn't provide request IDs
        timing: {
          total_duration_ms: data.total_duration ? data.total_duration / 1000000 : null,
          load_duration_ms: data.load_duration ? data.load_duration / 1000000 : null,
          eval_duration_ms: data.eval_duration ? data.eval_duration / 1000000 : null
        }
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
        temperature = 0.8,
        systemPrompt = null,
        stopSequences = []
      } = options;

      const requestBody = {
        model: this.model,
        prompt: prompt,
        stream: true,
        options: {
          num_predict: maxTokens,
          temperature: temperature
        }
      };

      if (systemPrompt) {
        requestBody.system = systemPrompt;
      }

      if (stopSequences.length > 0) {
        requestBody.options.stop = stopSequences;
      }

      const response = await this.client.post('/api/generate', requestBody, {
        responseType: 'stream'
      });

      let fullText = '';
      let modelName = this.model;
      let stopReason = null;
      let totalDuration = null;
      let evalCount = 0;
      let promptEvalCount = 0;

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk) => {
          try {
            const lines = chunk.toString().split('\n').filter(line => line.trim());

            for (const line of lines) {
              const data = JSON.parse(line);

              if (data.response) {
                fullText += data.response;
                onChunk(data.response);
              }

              if (data.model) {
                modelName = data.model;
              }

              if (data.done) {
                stopReason = data.done_reason || 'stop';
                totalDuration = data.total_duration;
                evalCount = data.eval_count || 0;
                promptEvalCount = data.prompt_eval_count || 0;
              }
            }
          } catch (error) {
            console.error('[Ollama Provider] Error parsing stream chunk:', error);
          }
        });

        response.data.on('end', () => {
          resolve({
            text: fullText,
            usage: {
              prompt_tokens: promptEvalCount || this.countTokens(prompt),
              completion_tokens: evalCount || this.countTokens(fullText),
              total_tokens: promptEvalCount + evalCount
            },
            model: modelName,
            provider: this.name,
            stopReason: stopReason,
            id: null,
            timing: {
              total_duration_ms: totalDuration ? totalDuration / 1000000 : null
            }
          });
        });

        response.data.on('error', (error) => {
          reject(this.formatError(error));
        });
      });
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
    // Ollama doesn't have a token counting API
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
      // Quick health check
      const response = await this.client.get('/api/tags');
      return response.status === 200;
    } catch (error) {
      console.error('[Ollama Provider] Availability check failed:', error.message);
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
        'llama2',
        'llama2:13b',
        'llama2:70b',
        'mistral',
        'mixtral',
        'codellama',
        'neural-chat',
        'starling-lm',
        'phi'
      ],
      capabilities: {
        streaming: true,
        functionCalling: false, // Most Ollama models don't support function calling
        vision: false, // Vision support depends on model (llava)
        maxTokens: 4096, // Varies by model
        maxOutputTokens: 2048
      },
      pricing: {
        note: 'Ollama runs locally - no API costs, only compute costs'
      },
      baseURL: this.baseURL
    };
  }

  /**
   * Validate configuration
   *
   * @returns {Object} Validation result { valid, errors }
   */
  validateConfig() {
    const errors = [];

    // Check base URL
    if (!this.baseURL) {
      errors.push('Base URL is required (set OLLAMA_BASE_URL environment variable or provide in config)');
    }

    // Check model
    if (!this.model) {
      errors.push('Model name is required');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * List available models on the Ollama server
   *
   * @returns {Promise<Array>} List of available models
   */
  async listAvailableModels() {
    try {
      const response = await this.client.get('/api/tags');
      return response.data.models || [];
    } catch (error) {
      throw this.formatError(new Error(`Failed to list models: ${error.message}`));
    }
  }

  /**
   * Pull a model from Ollama registry
   *
   * @param {string} modelName - Model name to pull
   * @param {Function} onProgress - Callback for progress updates
   * @returns {Promise<void>}
   */
  async pullModel(modelName, onProgress = null) {
    try {
      const response = await this.client.post('/api/pull', {
        name: modelName,
        stream: true
      }, {
        responseType: 'stream'
      });

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk) => {
          try {
            const lines = chunk.toString().split('\n').filter(line => line.trim());
            for (const line of lines) {
              const data = JSON.parse(line);
              if (onProgress) {
                onProgress(data);
              }
              if (data.status === 'success') {
                resolve();
              }
            }
          } catch (error) {
            console.error('[Ollama Provider] Error parsing pull progress:', error);
          }
        });

        response.data.on('error', (error) => {
          reject(this.formatError(error));
        });
      });
    } catch (error) {
      throw this.formatError(new Error(`Failed to pull model: ${error.message}`));
    }
  }
}

module.exports = OllamaProvider;
