/**
 * Share Service
 * Handles creating and retrieving shareable AI weather analysis results
 */

const db = require('../config/database');
const { retryWithBackoff } = require('../utils/retryHelper');

/**
 * Generate a random URL-safe share ID
 * @returns {string} 10-character alphanumeric ID
 */
function generateShareId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 10; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

/**
 * Create a shareable link for an AI answer
 * @param {Object} answerData - Complete AI answer data
 * @returns {Promise<Object>} { shareId, shareUrl, expiresAt }
 */
async function createShare(answerData) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  const query = `
    INSERT INTO shared_ai_answers
    (share_id, question, answer, location, weather_data, visualizations, follow_up_questions,
     confidence, tokens_used, model, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  let shareId;

  await retryWithBackoff(
    async () => {
      shareId = generateShareId();
      const values = [
        shareId,
        answerData.question,
        answerData.answer,
        answerData.location,
        JSON.stringify(answerData.weatherData),
        JSON.stringify(answerData.visualizations || []),
        JSON.stringify(answerData.followUpQuestions || []),
        answerData.confidence,
        answerData.tokensUsed,
        answerData.model,
        expiresAt,
      ];

      await db.execute(query, values);
    },
    {
      maxAttempts: 3,
      shouldRetry: (error) => error?.code === 'ER_DUP_ENTRY',
    }
  );

  return {
    shareId,
    shareUrl: `/ai-weather/shared/${shareId}`,
    expiresAt: expiresAt.toISOString(),
  };
}

/**
 * Retrieve a shared answer by ID
 * @param {string} shareId - The share ID to retrieve
 * @returns {Promise<Object|null>} Shared answer data or null if not found/expired
 */
async function getSharedAnswer(shareId) {
  const query = `
    SELECT
      share_id, question, answer, location, weather_data, visualizations,
      follow_up_questions, confidence, tokens_used, model, created_at,
      expires_at, views
    FROM shared_ai_answers
    WHERE share_id = ? AND expires_at > NOW()
  `;

  try {
    const [rows] = await db.execute(query, [shareId]);

    if (rows.length === 0) {
      return null;
    }

    const share = rows[0];

    // Increment view count
    await db.execute(
      'UPDATE shared_ai_answers SET views = views + 1 WHERE share_id = ?',
      [shareId]
    );

    return {
      shareId: share.share_id,
      question: share.question,
      answer: share.answer,
      location: share.location,
      weatherData: JSON.parse(share.weather_data),
      visualizations: JSON.parse(share.visualizations),
      followUpQuestions: JSON.parse(share.follow_up_questions),
      confidence: share.confidence,
      tokensUsed: share.tokens_used,
      model: share.model,
      createdAt: share.created_at,
      expiresAt: share.expires_at,
      views: share.views + 1 // Include the incremented view count
    };
  } catch (error) {
    console.error('Error retrieving shared answer:', error);
    throw error;
  }
}

/**
 * Clean up expired shares (run periodically)
 * @returns {Promise<number>} Number of expired shares deleted
 */
async function cleanupExpiredShares() {
  const query = 'DELETE FROM shared_ai_answers WHERE expires_at < NOW()';

  try {
    const [result] = await db.execute(query);
    return result.affectedRows;
  } catch (error) {
    console.error('Error cleaning up expired shares:', error);
    throw error;
  }
}

module.exports = {
  createShare,
  getSharedAnswer,
  cleanupExpiredShares
};
