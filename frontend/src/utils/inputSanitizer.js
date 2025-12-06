/**
 * Input Sanitizer for AI Location Finder
 * Free client-side validation to prevent obvious junk queries
 * Saves API costs by filtering before AI validation
 */

// Climate/weather/location-related keywords
const VALID_KEYWORDS = [
  // Weather terms
  'weather',
  'climate',
  'temperature',
  'temp',
  'hot',
  'cold',
  'warm',
  'cool',
  'humid',
  'dry',
  'wet',
  'rain',
  'rainy',
  'snow',
  'sunny',
  'cloudy',
  'wind',
  'storm',
  'fog',
  'freeze',
  'frost',
  'heat',
  'chill',

  // Temperature descriptors
  'warmer',
  'cooler',
  'hotter',
  'colder',
  'milder',
  'moderate',
  'extreme',
  'celsius',
  'fahrenheit',
  'degree',
  'degrees',

  // Seasons
  'summer',
  'winter',
  'spring',
  'fall',
  'autumn',
  'seasonal',

  // Precipitation
  'precipitation',
  'rainfall',
  'drizzle',
  'shower',
  'downpour',
  'monsoon',

  // Location terms
  'city',
  'cities',
  'location',
  'place',
  'where',
  'area',
  'region',
  'country',
  'state',
  'town',
  'live',
  'move',
  'relocate',
  'visit',
  'travel',

  // Months
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
  'jan',
  'feb',
  'mar',
  'apr',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',

  // Lifestyle/preference terms
  'community',
  'beach',
  'mountain',
  'ocean',
  'lake',
  'desert',
  'tropical',
  'subtropical',
  'temperate',
  'continental',
  'coastal',
  'inland',

  // Comparative terms
  'less',
  'more',
  'better',
  'worse',
  'like',
  'similar',
  'different',
  'than',
  'compared',
  'versus',
  'vs',

  // General climate terms
  'sun',
  'sunshine',
  'shade',
  'breeze',
  'gust',
  'calm',
  'clear',
  'overcast',
  'muggy',
  'sticky',
  'crisp',
  'fresh',
  'stale',
  'comfortable',
];

// Spam patterns to block
const SPAM_PATTERNS = [
  /^(.)\1{10,}$/i, // Repeated characters (e.g., "aaaaaaaaaa")
  /^[^a-z0-9\s]{10,}$/i, // Only special characters
  /^test+$/i, // Just "test" or "testttt"
  /^lol+$/i, // "lol" or "lolololol"
  /^a+$/i, // Just "aaa..."
];

/**
 * Validate if input is potentially climate-related
 * @param {string} input - User's query
 * @returns {{isValid: boolean, reason: string}}
 */
export function validateClimatInput(input) {
  // Trim and normalize
  const trimmed = input.trim();
  const normalized = trimmed.toLowerCase();

  // Check minimum length
  if (trimmed.length < 10) {
    return {
      isValid: false,
      reason:
        'Query too short. Please describe your climate preferences in more detail (minimum 10 characters).',
    };
  }

  // Check maximum length
  if (trimmed.length > 1000) {
    return {
      isValid: false,
      reason: 'Query too long. Please keep your description under 1000 characters.',
    };
  }

  // Check for spam patterns
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        isValid: false,
        reason: 'Invalid input detected. Please enter a meaningful climate or location query.',
      };
    }
  }

  // Check for at least one valid keyword
  const hasValidKeyword = VALID_KEYWORDS.some((keyword) => normalized.includes(keyword));

  // Check for location intent patterns
  const hasLocationPattern =
    /\b(i want|i need|looking for|find|search|somewhere|anywhere|where can|where should|recommend|suggest)\b/i.test(
      normalized
    );

  // Valid query must have either:
  // 1. At least one climate/weather keyword, OR
  // 2. A location pattern (which implies location search intent)
  if (!hasValidKeyword && !hasLocationPattern) {
    return {
      isValid: false,
      reason:
        'Please include climate, weather, or location-related terms in your query. Examples: temperature, humidity, rain, sunny, city, warmer, cooler, etc.',
    };
  }

  return {
    isValid: true,
    reason: 'Query appears valid.',
  };
}

/**
 * Sanitize input by removing dangerous characters
 * @param {string} input - Raw user input
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
  return (
    input
      .trim()
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .substring(0, 1000)
  ); // Enforce max length
}
