/**
 * Nearby City Suggestions Utility
 * Provides nearby city suggestions when location search fails
 * Part of Error Recovery UX Enhancement
 */

/**
 * Common cities database (major cities by region)
 * Used when API location search fails
 */
const NEARBY_CITIES_DATABASE = {
  // North America
  'new york': ['Newark, NJ', 'Jersey City, NJ', 'Yonkers, NY', 'White Plains, NY'],
  'los angeles': ['Long Beach, CA', 'Pasadena, CA', 'Santa Monica, CA', 'Glendale, CA'],
  chicago: ['Evanston, IL', 'Oak Park, IL', 'Naperville, IL', 'Aurora, IL'],
  houston: ['Sugar Land, TX', 'The Woodlands, TX', 'Pearland, TX', 'League City, TX'],
  phoenix: ['Scottsdale, AZ', 'Tempe, AZ', 'Mesa, AZ', 'Glendale, AZ'],
  miami: ['Fort Lauderdale, FL', 'Hollywood, FL', 'Coral Gables, FL', 'Miami Beach, FL'],
  seattle: ['Bellevue, WA', 'Tacoma, WA', 'Everett, WA', 'Kent, WA'],
  boston: ['Cambridge, MA', 'Somerville, MA', 'Quincy, MA', 'Lynn, MA'],
  'san francisco': ['Oakland, CA', 'San Jose, CA', 'Berkeley, CA', 'Daly City, CA'],
  philadelphia: ['Camden, NJ', 'Wilmington, DE', 'Chester, PA', 'Norristown, PA'],

  // Europe
  london: ['Westminster, UK', 'Camden, UK', 'Croydon, UK', 'Barnet, UK'],
  paris: ['Boulogne-Billancourt, France', 'Montreuil, France', 'Versailles, France'],
  berlin: ['Potsdam, Germany', 'Spandau, Germany', 'Charlottenburg, Germany'],
  madrid: ['Barcelona, Spain', 'Valencia, Spain', 'Seville, Spain'],
  rome: ['Milan, Italy', 'Naples, Italy', 'Florence, Italy', 'Venice, Italy'],
  amsterdam: ['Rotterdam, Netherlands', 'The Hague, Netherlands', 'Utrecht, Netherlands'],

  // Asia
  tokyo: ['Yokohama, Japan', 'Kawasaki, Japan', 'Saitama, Japan', 'Chiba, Japan'],
  beijing: ['Shanghai, China', 'Guangzhou, China', 'Shenzhen, China'],
  delhi: ['Gurgaon, India', 'Noida, India', 'Faridabad, India', 'Ghaziabad, India'],
  singapore: ['Johor Bahru, Malaysia', 'Batam, Indonesia'],
  'hong kong': ['Shenzhen, China', 'Guangzhou, China', 'Macau'],

  // Australia
  sydney: ['Parramatta, Australia', 'Newcastle, Australia', 'Wollongong, Australia'],
  melbourne: ['Geelong, Australia', 'Ballarat, Australia', 'Bendigo, Australia'],
};

/**
 * Extract base city name from search query
 * @param {string} searchQuery - Original search query
 * @returns {string} - Normalized city name
 */
function normalizeSearchQuery(searchQuery) {
  if (!searchQuery) return '';

  return (
    searchQuery
      .toLowerCase()
      .trim()
      // Remove common suffixes
      .replace(/,\s*(usa?|uk|canada|australia|france|germany|spain|italy)$/i, '')
      // Remove state abbreviations
      .replace(/,\s*[a-z]{2}$/i, '')
      .trim()
  );
}

/**
 * Get nearby city suggestions based on failed search
 * @param {string} failedQuery - The location query that failed
 * @returns {Array<string>} - Array of nearby city suggestions
 */
export function getNearbyCitySuggestions(failedQuery) {
  const normalized = normalizeSearchQuery(failedQuery);

  // Return empty array if query is blank/whitespace after normalization
  if (!normalized || normalized.length === 0) {
    return [];
  }

  // Direct match
  if (NEARBY_CITIES_DATABASE[normalized]) {
    return NEARBY_CITIES_DATABASE[normalized].slice(0, 4);
  }

  // Partial match (e.g., "york" matches "new york")
  // Only match if normalized has at least 3 characters to avoid false positives
  if (normalized.length >= 3) {
    const partialMatches = Object.keys(NEARBY_CITIES_DATABASE).filter(
      (city) => city.includes(normalized) || normalized.includes(city)
    );

    if (partialMatches.length > 0) {
      return NEARBY_CITIES_DATABASE[partialMatches[0]].slice(0, 4);
    }
  }

  // Return generic suggestions based on region hints
  if (normalized.includes('beach') || normalized.includes('coast')) {
    return ['Miami, FL', 'San Diego, CA', 'Virginia Beach, VA', 'Myrtle Beach, SC'];
  }

  if (normalized.includes('mountain') || normalized.includes('springs')) {
    return ['Denver, CO', 'Salt Lake City, UT', 'Colorado Springs, CO', 'Boise, ID'];
  }

  // No specific suggestions
  return [];
}

/**
 * Format suggestion message for location not found errors
 * @param {string} failedQuery - The location query that failed
 * @returns {string} - Formatted suggestion message
 */
export function formatLocationNotFoundMessage(failedQuery) {
  const suggestions = getNearbyCitySuggestions(failedQuery);

  if (suggestions.length === 0) {
    return 'Location not found. Try adding the country or state (e.g., "Paris, France").';
  }

  const suggestionList = suggestions.join(', ');
  return `Location not found. Try nearby cities: ${suggestionList}`;
}

/**
 * Check if query looks like it needs more context
 * @param {string} query - Search query
 * @returns {boolean} - True if query is too generic
 */
export function isGenericQuery(query) {
  const normalized = query?.toLowerCase().trim() || '';

  // Return false for empty/null input
  if (!normalized || normalized.length === 0) {
    return false;
  }

  // Single word queries often need context
  if (!/\s/.test(normalized) && !/^\d+$/.test(normalized)) {
    // Exceptions: well-known single-name cities
    const exceptions = ['tokyo', 'beijing', 'delhi', 'singapore', 'london', 'paris', 'rome'];
    return !exceptions.includes(normalized);
  }

  return false;
}

export default {
  getNearbyCitySuggestions,
  formatLocationNotFoundMessage,
  isGenericQuery,
};
