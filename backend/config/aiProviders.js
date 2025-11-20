/**
 * AI Provider Registry - Strategy Pattern Implementation
 * Centralized configuration for all AI providers with consistent interface
 *
 * Adding a new provider:
 * 1. Add provider to PROVIDERS object
 * 2. Implement the `call()` method
 * 3. That's it! No need to modify the service layer
 */

const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../utils/logger');

/**
 * Provider Registry
 * Each provider implements a common interface:
 * - name: Display name
 * - model: Model identifier
 * - maxTokens: Default max tokens for completion
 * - validationMaxTokens: Tokens for validation queries
 * - call({ apiKey, systemPrompt, userMessage, maxTokens }): Async function that returns response
 */
const PROVIDERS = {
  anthropic: {
    name: 'Anthropic',
    model: 'claude-sonnet-4-5-20250929',
    maxTokens: 500,
    validationMaxTokens: 200,

    async call({ apiKey, systemPrompt, userMessage, maxTokens }) {
      const client = new Anthropic({ apiKey });
      const message = await client.messages.create({
        model: this.model,
        max_tokens: maxTokens || this.maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      });

      return {
        text: message.content[0].text.trim(),
        tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
        model: this.model,
      };
    },
  },

  openai: {
    name: 'OpenAI',
    model: 'gpt-4-turbo-preview',
    maxTokens: 500,
    validationMaxTokens: 200,

    async call({ apiKey, systemPrompt, userMessage, maxTokens }) {
      const OpenAI = require('openai');
      const client = new OpenAI({ apiKey });

      const completion = await client.chat.completions.create({
        model: this.model,
        max_tokens: maxTokens || this.maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      });

      return {
        text: completion.choices[0].message.content.trim(),
        tokensUsed: completion.usage.prompt_tokens + completion.usage.completion_tokens,
        model: this.model,
      };
    },
  },

  grok: {
    name: 'Grok (xAI)',
    model: 'grok-beta',
    maxTokens: 500,
    validationMaxTokens: 200,

    async call({ apiKey, systemPrompt, userMessage, maxTokens }) {
      const OpenAI = require('openai');
      const client = new OpenAI({
        apiKey,
        baseURL: 'https://api.x.ai/v1', // Grok uses OpenAI-compatible API
      });

      const completion = await client.chat.completions.create({
        model: this.model,
        max_tokens: maxTokens || this.maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      });

      return {
        text: completion.choices[0].message.content.trim(),
        tokensUsed: completion.usage.prompt_tokens + completion.usage.completion_tokens,
        model: this.model,
      };
    },
  },

  google: {
    name: 'Google AI (Gemini)',
    model: 'gemini-pro',
    maxTokens: 500,
    validationMaxTokens: 200,

    async call({ apiKey, systemPrompt, userMessage, maxTokens }) {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: this.model });

      const prompt = `${systemPrompt}\n\nUser: ${userMessage}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        text: text.trim(),
        tokensUsed: response.usageMetadata
          ? response.usageMetadata.promptTokenCount + response.usageMetadata.candidatesTokenCount
          : 0,
        model: this.model,
      };
    },
  },

  mistral: {
    name: 'Mistral AI',
    model: 'mistral-large-latest',
    maxTokens: 500,
    validationMaxTokens: 200,

    async call({ apiKey, systemPrompt, userMessage, maxTokens }) {
      const MistralClient = require('@mistralai/mistralai').default;
      const client = new MistralClient(apiKey);

      const response = await client.chat({
        model: this.model,
        maxTokens: maxTokens || this.maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      });

      return {
        text: response.choices[0].message.content.trim(),
        tokensUsed: response.usage.prompt_tokens + response.usage.completion_tokens,
        model: this.model,
      };
    },
  },

  cohere: {
    name: 'Cohere',
    model: 'command',
    maxTokens: 500,
    validationMaxTokens: 200,

    async call({ apiKey, systemPrompt, userMessage, maxTokens }) {
      const { CohereClient } = require('cohere-ai');
      const cohere = new CohereClient({ token: apiKey });

      const response = await cohere.chat({
        model: this.model,
        message: userMessage,
        preamble: systemPrompt,
        maxTokens: maxTokens || this.maxTokens,
      });

      return {
        text: response.text.trim(),
        tokensUsed: response.meta?.tokens
          ? response.meta.tokens.inputTokens + response.meta.tokens.outputTokens
          : 0,
        model: this.model,
      };
    },
  },

  ollama: {
    name: 'Ollama (Self-hosted)',
    model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
    maxTokens: 500,
    validationMaxTokens: 200,

    async call({ apiKey, systemPrompt, userMessage, maxTokens }) {
      const OpenAI = require('openai');
      const client = new OpenAI({
        apiKey: apiKey || 'ollama', // Ollama doesn't require real API key
        baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
      });

      const completion = await client.chat.completions.create({
        model: this.model,
        max_tokens: maxTokens || this.maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      });

      return {
        text: completion.choices[0].message.content.trim(),
        tokensUsed: completion.usage.prompt_tokens + completion.usage.completion_tokens,
        model: this.model,
      };
    },
  },
};

/**
 * Get provider configuration by name
 * @param {string} providerName - Provider identifier (e.g., 'anthropic', 'openai')
 * @returns {Object} Provider configuration object
 * @throws {Error} If provider is unknown
 */
function getProvider(providerName) {
  const provider = PROVIDERS[providerName.toLowerCase()];
  if (!provider) {
    const availableProviders = Object.keys(PROVIDERS).join(', ');
    throw new Error(
      `Unknown AI provider: ${providerName}. Available providers: ${availableProviders}`
    );
  }
  return provider;
}

/**
 * Call an AI provider with consistent error handling
 * @param {string} providerName - Provider identifier
 * @param {string} apiKey - API key for the provider
 * @param {string} systemPrompt - System instructions
 * @param {string} userMessage - User's message
 * @param {Object} options - Additional options
 * @param {number} options.maxTokens - Override default max tokens
 * @returns {Promise<{text: string, tokensUsed: number, model: string}>}
 */
async function callProvider(providerName, apiKey, systemPrompt, userMessage, options = {}) {
  const provider = getProvider(providerName);
  const maxTokens = options.maxTokens || provider.maxTokens;

  try {
    logger.info(`Calling ${provider.name} API (model: ${provider.model})`);
    const result = await provider.call({ apiKey, systemPrompt, userMessage, maxTokens });
    logger.info(`${provider.name} API call successful (${result.tokensUsed} tokens)`);
    return result;
  } catch (error) {
    logger.error(`${provider.name} API error:`, error);
    throw new Error(`${provider.name} API error: ${error.message}`);
  }
}

/**
 * Get list of all supported provider names
 * @returns {Array<string>} Array of provider identifiers
 */
function getSupportedProviders() {
  return Object.keys(PROVIDERS);
}

/**
 * Get provider metadata (name, model, limits)
 * @param {string} providerName - Provider identifier
 * @returns {Object} Provider metadata (excludes call function)
 */
function getProviderMetadata(providerName) {
  const provider = getProvider(providerName);
  return {
    name: provider.name,
    model: provider.model,
    maxTokens: provider.maxTokens,
    validationMaxTokens: provider.validationMaxTokens,
  };
}

module.exports = {
  callProvider,
  getProvider,
  getSupportedProviders,
  getProviderMetadata,
  PROVIDERS, // Export for testing
};
