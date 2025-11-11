const TIMEOUTS = require('../config/timeouts');

/**
 * Generic retry helper with exponential backoff.
 * @param {Function} fn - async function to execute. Receives attempt number (1-indexed).
 * @param {Object} options - configuration overrides.
 * @param {number} options.maxAttempts - maximum attempts (default TIMEOUTS.RETRY.MAX_ATTEMPTS).
 * @param {number} options.initialDelay - initial delay in ms (default TIMEOUTS.RETRY.INITIAL_DELAY).
 * @param {number} options.maxDelay - max delay cap (default TIMEOUTS.RETRY.MAX_DELAY).
 * @param {number} options.multiplier - backoff multiplier (default TIMEOUTS.RETRY.EXPONENTIAL_BASE).
 * @param {Function} options.shouldRetry - predicate receiving error, attempt. Return false to stop retrying.
 * @param {Function} options.onRetry - callback for retry scheduling.
 * @returns {Promise<*>} result of fn()
 */
async function retryWithBackoff(
  fn,
  {
    maxAttempts = TIMEOUTS.RETRY.MAX_ATTEMPTS,
    initialDelay = TIMEOUTS.RETRY.INITIAL_DELAY,
    maxDelay = TIMEOUTS.RETRY.MAX_DELAY,
    multiplier = TIMEOUTS.RETRY.EXPONENTIAL_BASE,
    shouldRetry = () => true,
    onRetry,
  } = {}
) {
  let attempt = 0;
  let delay = initialDelay;
  let lastError;

  while (attempt < maxAttempts) {
    try {
      return await fn(attempt + 1);
    } catch (error) {
      lastError = error;
      attempt += 1;

      if (attempt >= maxAttempts || !shouldRetry(error, attempt)) {
        throw lastError;
      }

      if (typeof onRetry === 'function') {
        onRetry({ attempt, maxAttempts, delay });
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * multiplier, maxDelay);
    }
  }

  throw lastError;
}

module.exports = {
  retryWithBackoff,
};
