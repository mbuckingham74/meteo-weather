/**
 * Encryption Service
 * Provides AES-256-GCM encryption for secure storage of API keys
 */

const crypto = require('crypto');

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits

/**
 * Get or generate encryption key from environment
 * @returns {Buffer} Encryption key
 */
function getEncryptionKey() {
  const secret = process.env.API_KEY_ENCRYPTION_SECRET;

  if (!secret) {
    throw new Error('API_KEY_ENCRYPTION_SECRET environment variable is not set');
  }

  // Derive a proper key from the secret using PBKDF2
  return crypto.pbkdf2Sync(secret, 'meteo-api-keys-salt', 100000, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt API key using AES-256-GCM
 * @param {string} plaintext - The API key to encrypt
 * @returns {string} Encrypted key in format: iv:encrypted:authTag (all base64)
 */
function encryptApiKey(plaintext) {
  if (!plaintext || typeof plaintext !== 'string') {
    throw new Error('Invalid plaintext: must be a non-empty string');
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  // Return format: iv:encrypted:authTag (all base64 encoded)
  return `${iv.toString('base64')}:${encrypted}:${authTag.toString('base64')}`;
}

/**
 * Decrypt API key
 * @param {string} encryptedData - Encrypted key in format: iv:encrypted:authTag
 * @returns {string} Decrypted API key
 */
function decryptApiKey(encryptedData) {
  if (!encryptedData || typeof encryptedData !== 'string') {
    throw new Error('Invalid encrypted data: must be a non-empty string');
  }

  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format: expected iv:encrypted:authTag');
  }

  const [ivBase64, encrypted, authTagBase64] = parts;

  const key = getEncryptionKey();
  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Mask API key for display (show only last 4 characters)
 * @param {string} apiKey - The API key to mask
 * @returns {string} Masked key (e.g., "sk-...x7D9")
 */
function maskApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return '***';
  }

  if (apiKey.length <= 4) {
    return '***';
  }

  const last4 = apiKey.slice(-4);
  const prefix = apiKey.slice(0, 3); // Show prefix (e.g., "sk-")

  return `${prefix}...${last4}`;
}

/**
 * Validate API key format for different providers
 * @param {string} provider - AI provider (anthropic, openai, grok, etc.)
 * @param {string} apiKey - API key to validate
 * @returns {boolean} True if valid format
 */
function validateApiKeyFormat(provider, apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  switch (provider.toLowerCase()) {
    case 'anthropic':
      // Anthropic keys start with "sk-ant-"
      return apiKey.startsWith('sk-ant-') && apiKey.length > 20;

    case 'openai':
      // OpenAI keys start with "sk-" or "sk-proj-"
      return (apiKey.startsWith('sk-') || apiKey.startsWith('sk-proj-')) && apiKey.length > 20;

    case 'grok':
      // Grok/xAI keys (format may vary, being lenient)
      return apiKey.length > 20;

    case 'google':
      // Google AI keys (Gemini)
      return apiKey.length > 20;

    case 'mistral':
      // Mistral AI keys
      return apiKey.length > 20;

    case 'cohere':
      // Cohere keys
      return apiKey.length > 20;

    default:
      // Unknown provider, basic length check
      return apiKey.length > 20;
  }
}

/**
 * Generate a random encryption secret for setup
 * This should only be used for initial setup, not in production
 * @returns {string} Random 64-character hex string
 */
function generateEncryptionSecret() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  encryptApiKey,
  decryptApiKey,
  maskApiKey,
  validateApiKeyFormat,
  generateEncryptionSecret,
};
