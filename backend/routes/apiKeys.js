/**
 * API Keys Management Routes
 * Endpoints for user-managed AI API keys (admin only)
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { requireAdmin } = require('../middleware/adminMiddleware');
const {
  encryptApiKey,
  decryptApiKey,
  maskApiKey,
  validateApiKeyFormat,
} = require('../services/encryptionService');

// Supported AI providers
const SUPPORTED_PROVIDERS = ['anthropic', 'openai', 'grok', 'google', 'mistral', 'cohere'];

// Apply admin middleware to all routes
router.use(requireAdmin);

/**
 * GET /api/api-keys
 * Get all API keys for the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const [keys] = await db.query(
      `SELECT
        id,
        provider,
        key_name,
        is_active,
        is_default,
        usage_limit,
        tokens_used,
        tokens_reset_at,
        last_used_at,
        created_at
      FROM user_api_keys
      WHERE user_id = ?
      ORDER BY provider, is_default DESC, created_at DESC`,
      [userId]
    );

    // Group keys by provider
    const groupedKeys = keys.reduce((acc, key) => {
      if (!acc[key.provider]) {
        acc[key.provider] = [];
      }
      acc[key.provider].push(key);
      return acc;
    }, {});

    res.json({
      success: true,
      keys: groupedKeys,
      providers: SUPPORTED_PROVIDERS,
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

/**
 * POST /api/api-keys
 * Add a new API key
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { provider, keyName, apiKey, isDefault, usageLimit } = req.body;

    // Validation
    if (!provider || !keyName || !apiKey) {
      return res.status(400).json({ error: 'Provider, key name, and API key are required' });
    }

    if (!SUPPORTED_PROVIDERS.includes(provider.toLowerCase())) {
      return res.status(400).json({
        error: `Unsupported provider. Supported: ${SUPPORTED_PROVIDERS.join(', ')}`,
      });
    }

    if (!validateApiKeyFormat(provider, apiKey)) {
      return res.status(400).json({
        error: `Invalid API key format for provider: ${provider}`,
      });
    }

    // Check for duplicate key name
    const [existing] = await db.query(
      'SELECT id FROM user_api_keys WHERE user_id = ? AND key_name = ?',
      [userId, keyName]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'A key with this name already exists' });
    }

    // Encrypt the API key
    const encryptedKey = encryptApiKey(apiKey);

    // If this is set as default, unset other defaults for this provider
    if (isDefault) {
      await db.query(
        'UPDATE user_api_keys SET is_default = FALSE WHERE user_id = ? AND provider = ?',
        [userId, provider.toLowerCase()]
      );
    }

    // Insert new key
    const [result] = await db.query(
      `INSERT INTO user_api_keys
        (user_id, provider, key_name, encrypted_key, is_default, usage_limit, tokens_reset_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [userId, provider.toLowerCase(), keyName, encryptedKey, isDefault || false, usageLimit || null]
    );

    // Fetch the created key
    const [newKey] = await db.query(
      `SELECT
        id, provider, key_name, is_active, is_default, usage_limit,
        tokens_used, tokens_reset_at, last_used_at, created_at
      FROM user_api_keys
      WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'API key added successfully',
      key: newKey[0],
      maskedKey: maskApiKey(apiKey),
    });
  } catch (error) {
    console.error('Error adding API key:', error);
    res.status(500).json({ error: 'Failed to add API key' });
  }
});

/**
 * PUT /api/api-keys/:id
 * Update an existing API key
 */
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const keyId = req.params.id;
    const { keyName, isActive, isDefault, usageLimit } = req.body;

    // Check ownership
    const [key] = await db.query('SELECT * FROM user_api_keys WHERE id = ? AND user_id = ?', [
      keyId,
      userId,
    ]);

    if (key.length === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }

    const updates = [];
    const values = [];

    if (keyName !== undefined) {
      // Check for duplicate name
      const [existing] = await db.query(
        'SELECT id FROM user_api_keys WHERE user_id = ? AND key_name = ? AND id != ?',
        [userId, keyName, keyId]
      );

      if (existing.length > 0) {
        return res.status(400).json({ error: 'A key with this name already exists' });
      }

      updates.push('key_name = ?');
      values.push(keyName);
    }

    if (isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(isActive);
    }

    if (isDefault !== undefined) {
      // If setting as default, unset other defaults for this provider
      if (isDefault) {
        await db.query(
          'UPDATE user_api_keys SET is_default = FALSE WHERE user_id = ? AND provider = ? AND id != ?',
          [userId, key[0].provider, keyId]
        );
      }

      updates.push('is_default = ?');
      values.push(isDefault);
    }

    if (usageLimit !== undefined) {
      updates.push('usage_limit = ?');
      values.push(usageLimit);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(keyId, userId);

    await db.query(
      `UPDATE user_api_keys SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );

    // Fetch updated key
    const [updated] = await db.query(
      `SELECT
        id, provider, key_name, is_active, is_default, usage_limit,
        tokens_used, tokens_reset_at, last_used_at, created_at
      FROM user_api_keys
      WHERE id = ?`,
      [keyId]
    );

    res.json({
      success: true,
      message: 'API key updated successfully',
      key: updated[0],
    });
  } catch (error) {
    console.error('Error updating API key:', error);
    res.status(500).json({ error: 'Failed to update API key' });
  }
});

/**
 * DELETE /api/api-keys/:id
 * Delete an API key
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const keyId = req.params.id;

    // Check ownership
    const [key] = await db.query('SELECT id FROM user_api_keys WHERE id = ? AND user_id = ?', [
      keyId,
      userId,
    ]);

    if (key.length === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }

    await db.query('DELETE FROM user_api_keys WHERE id = ? AND user_id = ?', [keyId, userId]);

    res.json({
      success: true,
      message: 'API key deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

/**
 * POST /api/api-keys/:id/test
 * Test an API key connection
 */
router.post('/:id/test', async (req, res) => {
  try {
    const userId = req.user.id;
    const keyId = req.params.id;

    // Fetch the key
    const [key] = await db.query(
      'SELECT provider, encrypted_key FROM user_api_keys WHERE id = ? AND user_id = ?',
      [keyId, userId]
    );

    if (key.length === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }

    const { provider, encrypted_key } = key[0];
    const apiKey = decryptApiKey(encrypted_key);

    // Test the key based on provider
    let testResult;
    try {
      testResult = await testApiKeyConnection(provider, apiKey);
    } catch (testError) {
      return res.status(400).json({
        success: false,
        error: testError.message,
        provider,
      });
    }

    res.json({
      success: true,
      message: 'API key is valid and working',
      provider,
      details: testResult,
    });
  } catch (error) {
    console.error('Error testing API key:', error);
    res.status(500).json({ error: 'Failed to test API key' });
  }
});

/**
 * POST /api/api-keys/reset-usage/:id
 * Reset token usage counter for a key (admin only)
 */
router.post('/reset-usage/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const keyId = req.params.id;

    // Check ownership
    const [key] = await db.query('SELECT id FROM user_api_keys WHERE id = ? AND user_id = ?', [
      keyId,
      userId,
    ]);

    if (key.length === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }

    await db.query(
      'UPDATE user_api_keys SET tokens_used = 0, tokens_reset_at = NOW() WHERE id = ?',
      [keyId]
    );

    res.json({
      success: true,
      message: 'Token usage reset successfully',
    });
  } catch (error) {
    console.error('Error resetting usage:', error);
    res.status(500).json({ error: 'Failed to reset usage' });
  }
});

/**
 * Helper function to test API key connection
 */
async function testApiKeyConnection(provider, apiKey) {
  switch (provider.toLowerCase()) {
    case 'anthropic': {
      const Anthropic = require('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey });
      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      });
      return { model: response.model, tokensUsed: response.usage.input_tokens + response.usage.output_tokens };
    }

    case 'openai': {
      const OpenAI = require('openai');
      const client = new OpenAI({ apiKey });
      const response = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 10,
      });
      return { model: response.model, tokensUsed: response.usage.prompt_tokens + response.usage.completion_tokens };
    }

    case 'grok': {
      const OpenAI = require('openai');
      const client = new OpenAI({
        apiKey,
        baseURL: 'https://api.x.ai/v1',
      });
      const response = await client.chat.completions.create({
        model: 'grok-beta',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 10,
      });
      return { model: response.model, tokensUsed: response.usage.prompt_tokens + response.usage.completion_tokens };
    }

    case 'google': {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent('Hi');
      const response = await result.response;
      const tokensUsed = response.usageMetadata
        ? response.usageMetadata.promptTokenCount + response.usageMetadata.candidatesTokenCount
        : 0;
      return { model: 'gemini-pro', tokensUsed };
    }

    case 'mistral': {
      const MistralClient = require('@mistralai/mistralai').default;
      const client = new MistralClient(apiKey);
      const response = await client.chat({
        model: 'mistral-large-latest',
        maxTokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      });
      return { model: response.model, tokensUsed: response.usage.prompt_tokens + response.usage.completion_tokens };
    }

    case 'cohere': {
      const { CohereClient } = require('cohere-ai');
      const cohere = new CohereClient({ token: apiKey });
      const response = await cohere.chat({
        model: 'command',
        message: 'Hi',
        maxTokens: 10,
      });
      const tokensUsed = response.meta?.tokens
        ? response.meta.tokens.inputTokens + response.meta.tokens.outputTokens
        : 0;
      return { model: 'command', tokensUsed };
    }

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

module.exports = router;
