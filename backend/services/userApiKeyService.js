/**
 * User API Key Service
 * Handles fetching and managing user-provided API keys for AI providers
 */

const db = require('../config/database');
const { decryptApiKey } = require('./encryptionService');

/**
 * Get user's API key for a specific provider
 * Returns user's default key if available, otherwise null (fall back to system key)
 * @param {number} userId - User ID
 * @param {string} provider - AI provider (anthropic, openai, grok, google, mistral, cohere)
 * @returns {Object|null} {apiKey: string, keyId: number, keyName: string, usageLimit: number, tokensUsed: number} or null
 */
async function getUserApiKey(userId, provider) {
  try {
    if (!userId || !provider) {
      return null;
    }

    const [keys] = await db.query(
      `SELECT
        id, key_name, encrypted_key, usage_limit, tokens_used
      FROM user_api_keys
      WHERE user_id = ? AND provider = ? AND is_active = TRUE
      ORDER BY is_default DESC, created_at DESC
      LIMIT 1`,
      [userId, provider.toLowerCase()]
    );

    if (keys.length === 0) {
      return null;
    }

    const key = keys[0];

    // Check if usage limit is exceeded
    if (key.usage_limit && key.tokens_used >= key.usage_limit) {
      console.warn(
        `User ${userId} API key "${key.key_name}" has exceeded usage limit (${key.tokens_used}/${key.usage_limit})`
      );
      return null; // Fall back to system key
    }

    // Decrypt the API key
    const apiKey = decryptApiKey(key.encrypted_key);

    return {
      apiKey,
      keyId: key.id,
      keyName: key.key_name,
      usageLimit: key.usage_limit,
      tokensUsed: key.tokens_used,
    };
  } catch (error) {
    console.error('Error fetching user API key:', error);
    return null; // Fall back to system key on error
  }
}

/**
 * Update token usage for a user's API key
 * @param {number} keyId - API key ID
 * @param {number} tokensUsed - Number of tokens used in this request
 * @returns {Promise<void>}
 */
async function updateApiKeyUsage(keyId, tokensUsed) {
  try {
    if (!keyId || !tokensUsed) {
      return;
    }

    await db.query(
      `UPDATE user_api_keys
      SET tokens_used = tokens_used + ?,
          last_used_at = NOW()
      WHERE id = ?`,
      [tokensUsed, keyId]
    );
  } catch (error) {
    console.error('Error updating API key usage:', error);
    // Non-fatal error, don't throw
  }
}

/**
 * Reset monthly token usage for all keys (should be run via cron)
 * @returns {Promise<number>} Number of keys reset
 */
async function resetMonthlyUsage() {
  try {
    const [result] = await db.query(
      `UPDATE user_api_keys
      SET tokens_used = 0,
          tokens_reset_at = NOW()
      WHERE tokens_reset_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
      OR tokens_reset_at IS NULL`
    );

    return result.affectedRows;
  } catch (error) {
    console.error('Error resetting monthly usage:', error);
    throw error;
  }
}

/**
 * Get API key for AI service (user key or system fallback)
 * This is the main function AI services should call
 * @param {number|null} userId - User ID (can be null for unauthenticated requests)
 * @param {string} provider - AI provider name
 * @returns {Promise<{apiKey: string, isUserKey: boolean, keyId: number|null}>}
 */
async function getApiKeyForProvider(userId, provider) {
  // Try to get user's API key first
  if (userId) {
    const userKey = await getUserApiKey(userId, provider);
    if (userKey) {
      return {
        apiKey: userKey.apiKey,
        isUserKey: true,
        keyId: userKey.keyId,
        keyName: userKey.keyName,
      };
    }
  }

  // Fall back to system key from environment
  const systemKey = getSystemApiKey(provider);
  if (!systemKey) {
    throw new Error(`No API key available for provider: ${provider}`);
  }

  return {
    apiKey: systemKey,
    isUserKey: false,
    keyId: null,
    keyName: 'System Default',
  };
}

/**
 * Get system API key from environment variables
 * @param {string} provider - AI provider name
 * @returns {string|null} API key or null
 */
function getSystemApiKey(provider) {
  switch (provider.toLowerCase()) {
    case 'anthropic':
      return process.env.METEO_ANTHROPIC_API_KEY || null;
    case 'openai':
      return process.env.OPENAI_API_KEY || null;
    case 'grok':
      return process.env.GROK_API_KEY || null;
    case 'google':
      return process.env.GOOGLE_AI_API_KEY || null;
    case 'mistral':
      return process.env.MISTRAL_API_KEY || null;
    case 'cohere':
      return process.env.COHERE_API_KEY || null;
    default:
      return null;
  }
}

module.exports = {
  getUserApiKey,
  updateApiKeyUsage,
  resetMonthlyUsage,
  getApiKeyForProvider,
  getSystemApiKey,
};
