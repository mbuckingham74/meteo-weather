// Mock the Anthropic SDK before requiring the service
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn()
    }
  }));
});

const Anthropic = require('@anthropic-ai/sdk');
const aiLocationFinderService = require('../services/aiLocationFinderService');

describe.skip('AI Location Finder Service', () => {
  let mockAnthropicInstance;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Get the mocked instance
    mockAnthropicInstance = new Anthropic();
  });

  describe('validateQuery', () => {
    it('validates a legitimate climate query', async () => {
      // Mock Anthropic API response for valid query
      mockAnthropicInstance.messages.create.mockResolvedValue({
        content: [{
          text: JSON.stringify({
            isValid: true,
            reason: 'Valid weather preference query'
          })
        }],
        usage: {
          input_tokens: 150,
          output_tokens: 50
        }
      });

      const result = await aiLocationFinderService.validateQuery('I want somewhere 15 degrees cooler');

      expect(result.isValid).toBe(true);
      expect(result.reason).toBe('Valid weather preference query');
      expect(result.tokensUsed).toBe(200); // 150 + 50
      expect(mockAnthropicInstance.messages.create).toHaveBeenCalledTimes(1);
    });

    it('rejects nonsensical queries', async () => {
      mockAnthropicInstance.messages.create.mockResolvedValue({
        content: [{
          text: JSON.stringify({
            isValid: false,
            reason: 'Query is nonsensical and unrelated to weather'
          })
        }],
        usage: {
          input_tokens: 120,
          output_tokens: 30
        }
      });

      const result = await aiLocationFinderService.validateQuery('asdfghjkl');

      expect(result.isValid).toBe(false);
      expect(result.tokensUsed).toBe(150);
    });

    it('handles markdown code blocks in response', async () => {
      mockAnthropicInstance.messages.create.mockResolvedValue({
        content: [{
          text: '```json\n{"isValid": true, "reason": "Valid query"}\n```'
        }],
        usage: {
          input_tokens: 100,
          output_tokens: 40
        }
      });

      const result = await aiLocationFinderService.validateQuery('less humid weather');

      expect(result.isValid).toBe(true);
      expect(result.reason).toBe('Valid query');
    });

    it('defaults to valid when API fails', async () => {
      mockAnthropicInstance.messages.create.mockRejectedValue(new Error('API Error'));

      const result = await aiLocationFinderService.validateQuery('some query');

      expect(result.isValid).toBe(true); // Fails open to avoid blocking users
      expect(result.reason).toContain('error');
    });
  });

  describe('parseQuery', () => {
    it('parses a complete climate preference query', async () => {
      mockAnthropicInstance.messages.create.mockResolvedValue({
        content: [{
          text: JSON.stringify({
            current_location: 'New Smyrna Beach, FL',
            time_period: { start: 'June', end: 'October' },
            temperature_delta: -15,
            temperature_range: { min: null, max: null },
            humidity: 'lower',
            precipitation: 'less',
            lifestyle_factors: ['good community feel'],
            deal_breakers: [],
            additional_notes: 'Looking for cooler summer climate'
          })
        }],
        usage: {
          input_tokens: 200,
          output_tokens: 150
        }
      });

      const result = await aiLocationFinderService.parseQuery('I live in New Smyrna Beach from June-Oct and want 15 degrees cooler');

      expect(result.current_location).toBe('New Smyrna Beach, FL');
      expect(result.temperature_delta).toBe(-15);
      expect(result.humidity).toBe('lower');
      expect(result.tokensUsed).toBe(350);
    });

    it('handles partial information gracefully', async () => {
      mockAnthropicInstance.messages.create.mockResolvedValue({
        content: [{
          text: JSON.stringify({
            current_location: null,
            time_period: { start: 'Summer', end: 'Summer' },
            temperature_delta: null,
            temperature_range: { min: null, max: 25 },
            humidity: null,
            precipitation: null,
            lifestyle_factors: [],
            deal_breakers: [],
            additional_notes: 'Wants cooler summers'
          })
        }],
        usage: {
          input_tokens: 150,
          output_tokens: 100
        }
      });

      const result = await aiLocationFinderService.parseQuery('somewhere with cooler summers');

      expect(result.temperature_range.max).toBe(25);
      expect(result.current_location).toBeNull();
    });

    it('tracks token usage accurately', async () => {
      mockAnthropicInstance.messages.create.mockResolvedValue({
        content: [{
          text: JSON.stringify({
            current_location: 'Seattle, WA',
            temperature_delta: null,
            additional_notes: 'Test query'
          })
        }],
        usage: {
          input_tokens: 500,
          output_tokens: 250
        }
      });

      const result = await aiLocationFinderService.parseQuery('test query');

      expect(result.tokensUsed).toBe(750);
    });

    it('handles API errors gracefully', async () => {
      mockAnthropicInstance.messages.create.mockRejectedValue(
        new Error('Rate limit exceeded')
      );

      await expect(aiLocationFinderService.parseQuery('test query'))
        .rejects
        .toThrow('Rate limit exceeded');
    });
  });
});
