/**
 * AI History Storage Utilities
 * Manages localStorage cache of recent AI weather queries
 */

const HISTORY_KEY = 'meteo_ai_history';
const MAX_HISTORY_ITEMS = 10;

/**
 * Get all history items from localStorage
 * @returns {Array} Array of history items (most recent first)
 */
export const getAIHistory = () => {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    if (!historyJson) return [];

    const history = JSON.parse(historyJson);
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error('Error reading AI history from localStorage:', error);
    return [];
  }
};

/**
 * Add a new item to history
 * @param {Object} item - History item with question, answer, location, etc.
 */
export const addToAIHistory = (item) => {
  try {
    const history = getAIHistory();

    // Create history entry
    const historyEntry = {
      id: Date.now().toString(), // Unique ID based on timestamp
      question: item.question,
      answer: item.answer,
      location: item.location,
      confidence: item.confidence,
      tokensUsed: item.tokensUsed,
      timestamp: new Date().toISOString(),
      // Store lightweight summary of visualizations (just types, not full data)
      visualizations:
        item.visualizations?.map((v) => ({
          type: v.type,
          reason: v.reason,
        })) || [],
      followUpQuestions: item.followUpQuestions || [],
    };

    // Remove duplicates (same question + location within last hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const filteredHistory = history.filter((h) => {
      const isDuplicate =
        h.question === item.question &&
        h.location === item.location &&
        new Date(h.timestamp).getTime() > oneHourAgo;
      return !isDuplicate;
    });

    // Add new entry at beginning
    filteredHistory.unshift(historyEntry);

    // Keep only last MAX_HISTORY_ITEMS
    const trimmedHistory = filteredHistory.slice(0, MAX_HISTORY_ITEMS);

    // Save to localStorage
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error saving to AI history:', error);
  }
};

/**
 * Get a specific history item by ID
 * @param {string} id - History item ID
 * @returns {Object|null} History item or null if not found
 */
export const getHistoryItem = (id) => {
  const history = getAIHistory();
  return history.find((item) => item.id === id) || null;
};

/**
 * Delete a specific history item
 * @param {string} id - History item ID to delete
 */
export const deleteHistoryItem = (id) => {
  try {
    const history = getAIHistory();
    const filteredHistory = history.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filteredHistory));
  } catch (error) {
    console.error('Error deleting history item:', error);
  }
};

/**
 * Clear all history
 */
export const clearAIHistory = () => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing AI history:', error);
  }
};

/**
 * Format timestamp for display
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Formatted time string (e.g., "2 hours ago", "Yesterday")
 */
export const formatHistoryTimestamp = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  // For older items, show date
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
