/**
 * Location Database and Suggestion Logic
 * Centralized data for location comparisons and AI suggestions
 */

// Location database with climate characteristics
export const locationDatabase = [
  // Cool/Temperate climates
  {
    name: 'Seattle,WA',
    avgTemp: 52,
    humidity: 'moderate',
    precipitation: 'high',
    season: 'year-round',
  },
  {
    name: 'Portland,OR',
    avgTemp: 54,
    humidity: 'moderate',
    precipitation: 'high',
    season: 'year-round',
  },
  {
    name: 'San Francisco,CA',
    avgTemp: 57,
    humidity: 'moderate',
    precipitation: 'low',
    season: 'year-round',
  },
  { name: 'Denver,CO', avgTemp: 51, humidity: 'low', precipitation: 'low', season: 'year-round' },
  {
    name: 'Boise,ID',
    avgTemp: 52,
    humidity: 'low',
    precipitation: 'moderate',
    season: 'year-round',
  },
  {
    name: 'Minneapolis,MN',
    avgTemp: 46,
    humidity: 'moderate',
    precipitation: 'moderate',
    season: 'summer',
  },
  {
    name: 'Chicago,IL',
    avgTemp: 50,
    humidity: 'moderate',
    precipitation: 'moderate',
    season: 'year-round',
  },
  {
    name: 'Boston,MA',
    avgTemp: 51,
    humidity: 'moderate',
    precipitation: 'moderate',
    season: 'year-round',
  },

  // Warm/Hot climates
  { name: 'Miami,FL', avgTemp: 77, humidity: 'high', precipitation: 'high', season: 'year-round' },
  { name: 'Phoenix,AZ', avgTemp: 75, humidity: 'low', precipitation: 'low', season: 'winter' },
  { name: 'Las Vegas,NV', avgTemp: 70, humidity: 'low', precipitation: 'low', season: 'winter' },
  {
    name: 'Austin,TX',
    avgTemp: 69,
    humidity: 'moderate',
    precipitation: 'moderate',
    season: 'year-round',
  },
  {
    name: 'San Diego,CA',
    avgTemp: 64,
    humidity: 'moderate',
    precipitation: 'low',
    season: 'year-round',
  },
  {
    name: 'Los Angeles,CA',
    avgTemp: 65,
    humidity: 'moderate',
    precipitation: 'low',
    season: 'year-round',
  },
  { name: 'Tampa,FL', avgTemp: 73, humidity: 'high', precipitation: 'high', season: 'year-round' },
  {
    name: 'Orlando,FL',
    avgTemp: 73,
    humidity: 'high',
    precipitation: 'high',
    season: 'year-round',
  },

  // Moderate climates
  {
    name: 'Atlanta,GA',
    avgTemp: 62,
    humidity: 'moderate',
    precipitation: 'moderate',
    season: 'year-round',
  },
  {
    name: 'Charlotte,NC',
    avgTemp: 61,
    humidity: 'moderate',
    precipitation: 'moderate',
    season: 'year-round',
  },
  {
    name: 'Nashville,TN',
    avgTemp: 59,
    humidity: 'moderate',
    precipitation: 'moderate',
    season: 'year-round',
  },
  {
    name: 'Raleigh,NC',
    avgTemp: 59,
    humidity: 'moderate',
    precipitation: 'moderate',
    season: 'year-round',
  },
  {
    name: 'Sacramento,CA',
    avgTemp: 61,
    humidity: 'low',
    precipitation: 'low',
    season: 'year-round',
  },
  {
    name: 'Salt Lake City,UT',
    avgTemp: 52,
    humidity: 'low',
    precipitation: 'low',
    season: 'year-round',
  },

  // Coastal areas
  {
    name: 'Charleston,SC',
    avgTemp: 66,
    humidity: 'high',
    precipitation: 'moderate',
    season: 'year-round',
  },
  {
    name: 'Savannah,GA',
    avgTemp: 66,
    humidity: 'high',
    precipitation: 'moderate',
    season: 'year-round',
  },
  {
    name: 'New Smyrna Beach,FL',
    avgTemp: 72,
    humidity: 'high',
    precipitation: 'high',
    season: 'year-round',
  },
];

/**
 * Generate location suggestions based on AI criteria
 * @param {Object} criteria - Parsed AI criteria
 * @param {Array} database - Location database (defaults to locationDatabase)
 * @returns {Array<string>} - Array of suggested location names
 */
export function generateLocationSuggestions(criteria, database = locationDatabase) {
  if (!criteria) return [];

  const currentLoc = criteria.current_location;
  const tempDelta = criteria.temperature_delta || 0;
  const humidityPref = criteria.humidity?.toLowerCase();
  const precipPref = criteria.precipitation?.toLowerCase();

  // Find current location in database to get baseline
  const currentData = database.find(
    (loc) => currentLoc && loc.name.toLowerCase().includes(currentLoc.toLowerCase())
  );

  const targetTemp = currentData ? currentData.avgTemp + tempDelta : null;

  // Score each location
  const scored = database.map((location) => {
    let score = 0;

    // Temperature matching (most important)
    if (targetTemp !== null) {
      const tempDiff = Math.abs(location.avgTemp - targetTemp);
      if (tempDiff <= 5) score += 50;
      else if (tempDiff <= 10) score += 30;
      else if (tempDiff <= 15) score += 10;
    } else if (tempDelta !== 0) {
      // If no baseline, just match direction
      if (tempDelta < 0 && location.avgTemp < 60) score += 30;
      if (tempDelta > 0 && location.avgTemp > 70) score += 30;
    }

    // Humidity matching
    if (humidityPref) {
      if (
        humidityPref.includes('lower') ||
        humidityPref.includes('less') ||
        humidityPref.includes('dry')
      ) {
        if (location.humidity === 'low') score += 20;
        if (location.humidity === 'moderate') score += 10;
      } else if (
        humidityPref.includes('higher') ||
        humidityPref.includes('more') ||
        humidityPref.includes('humid')
      ) {
        if (location.humidity === 'high') score += 20;
        if (location.humidity === 'moderate') score += 10;
      }
    }

    // Precipitation matching
    if (precipPref) {
      if (
        precipPref.includes('less') ||
        precipPref.includes('dry') ||
        precipPref.includes('not rainy')
      ) {
        if (location.precipitation === 'low') score += 20;
        if (location.precipitation === 'moderate') score += 10;
      } else if (precipPref.includes('more') || precipPref.includes('rainy')) {
        if (location.precipitation === 'high') score += 20;
        if (location.precipitation === 'moderate') score += 10;
      }
    }

    return { ...location, score };
  });

  // Sort by score and return top matches
  const suggestions = scored
    .filter((loc) => loc.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((loc) => loc.name);

  // If we have the current location in results, make sure it's included for comparison
  if (currentData && !suggestions.includes(currentData.name)) {
    suggestions.unshift(currentData.name);
  }

  return suggestions;
}
