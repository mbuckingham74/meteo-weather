/**
 * URL Helper Functions
 * Utilities for generating and parsing location-based URLs
 */

/**
 * Convert a location address to a URL-friendly slug
 * @param {string} address - Location address (e.g., "Seattle, WA, USA")
 * @returns {string} URL slug (e.g., "seattle-wa-usa")
 */
export const createLocationSlug = (address) => {
  if (!address) return '';

  return address
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
};

/**
 * Parse a URL slug back to search query
 * @param {string} slug - URL slug (e.g., "seattle-wa-usa")
 * @returns {string} Search query (e.g., "seattle wa usa")
 */
export const parseLocationSlug = (slug) => {
  if (!slug) return '';

  return slug
    .replace(/-/g, ' ') // Replace hyphens with spaces
    .trim();
};
