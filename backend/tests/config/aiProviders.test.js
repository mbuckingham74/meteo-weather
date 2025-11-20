/**
 * AI Provider Registry Tests
 * Tests the centralized provider configuration
 */

const {
  getProvider,
  getSupportedProviders,
  getProviderMetadata,
  PROVIDERS,
} = require('../../config/aiProviders');

describe('AI Provider Registry', () => {
  describe('getSupportedProviders', () => {
    it('should return array of all provider names', () => {
      const providers = getSupportedProviders();
      expect(providers).toEqual([
        'anthropic',
        'openai',
        'grok',
        'google',
        'mistral',
        'cohere',
        'ollama',
      ]);
    });
  });

  describe('getProvider', () => {
    it('should return provider configuration for valid provider', () => {
      const provider = getProvider('anthropic');
      expect(provider).toHaveProperty('name');
      expect(provider).toHaveProperty('model');
      expect(provider).toHaveProperty('maxTokens');
      expect(provider).toHaveProperty('call');
      expect(typeof provider.call).toBe('function');
    });

    it('should be case-insensitive', () => {
      const lower = getProvider('anthropic');
      const upper = getProvider('ANTHROPIC');
      const mixed = getProvider('Anthropic');

      expect(lower).toBe(upper);
      expect(upper).toBe(mixed);
    });

    it('should throw error for unknown provider', () => {
      expect(() => getProvider('unknown')).toThrow(/Unknown AI provider/);
      expect(() => getProvider('chatgpt')).toThrow(/Unknown AI provider/);
    });
  });

  describe('getProviderMetadata', () => {
    it('should return metadata without call function', () => {
      const metadata = getProviderMetadata('anthropic');
      expect(metadata).toHaveProperty('name');
      expect(metadata).toHaveProperty('model');
      expect(metadata).toHaveProperty('maxTokens');
      expect(metadata).toHaveProperty('validationMaxTokens');
      expect(metadata).not.toHaveProperty('call');
    });

    it('should return correct Anthropic metadata', () => {
      const metadata = getProviderMetadata('anthropic');
      expect(metadata.name).toBe('Anthropic');
      expect(metadata.model).toBe('claude-sonnet-4-5-20250929');
      expect(metadata.maxTokens).toBe(500);
      expect(metadata.validationMaxTokens).toBe(200);
    });
  });

  describe('Provider Configuration', () => {
    it('all providers should have required fields', () => {
      const providerNames = getSupportedProviders();

      providerNames.forEach((name) => {
        const provider = PROVIDERS[name];
        expect(provider.name).toBeDefined();
        expect(provider.model).toBeDefined();
        expect(provider.maxTokens).toBeDefined();
        expect(provider.validationMaxTokens).toBeDefined();
        expect(typeof provider.call).toBe('function');
      });
    });

    it('all providers should have consistent token limits', () => {
      const providerNames = getSupportedProviders();

      providerNames.forEach((name) => {
        const provider = PROVIDERS[name];
        expect(provider.maxTokens).toBeGreaterThan(0);
        expect(provider.validationMaxTokens).toBeGreaterThan(0);
        expect(provider.validationMaxTokens).toBeLessThanOrEqual(provider.maxTokens);
      });
    });
  });

  describe('Provider Models', () => {
    it('should use correct model names', () => {
      expect(PROVIDERS.anthropic.model).toBe('claude-sonnet-4-5-20250929');
      expect(PROVIDERS.openai.model).toBe('gpt-4-turbo-preview');
      expect(PROVIDERS.grok.model).toBe('grok-beta');
      expect(PROVIDERS.google.model).toBe('gemini-pro');
      expect(PROVIDERS.mistral.model).toBe('mistral-large-latest');
      expect(PROVIDERS.cohere.model).toBe('command');
    });

    it('Ollama model should be configurable via env', () => {
      // Default model
      expect(PROVIDERS.ollama.model).toBeDefined();
    });
  });
});
