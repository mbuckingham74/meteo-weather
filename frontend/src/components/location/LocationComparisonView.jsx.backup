import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useForecast, useHistoricalWeather } from '../../hooks/useWeatherData';
import { useForecastComparison, useThisDayInHistory } from '../../hooks/useClimateData';
import { formatTemperature, aggregateWeatherData } from '../../utils/weatherHelpers';
import { useTemperatureUnit } from '../../contexts/TemperatureUnitContext';
import LocationSearchBar from './LocationSearchBar';
import LocationConfirmationModal from './LocationConfirmationModal';
import TemperatureUnitToggle from '../units/TemperatureUnitToggle';
import TemperatureBandChart from '../charts/TemperatureBandChart';
import PrecipitationChart from '../charts/PrecipitationChart';
import WindChart from '../charts/WindChart';
import HistoricalComparisonChart from '../charts/HistoricalComparisonChart';
import { validateQuery, parseLocationQuery } from '../../services/locationFinderService';
import { getCurrentLocation } from '../../services/geolocationService';
import { validateClimatInput, sanitizeInput } from '../../utils/inputSanitizer';
import './LocationComparisonView.css';

/**
 * LocationComparisonView Component
 * Compare weather between multiple locations side-by-side
 */
function LocationComparisonView() {
  // Start with an interesting comparison pre-loaded
  const [locations, setLocations] = useState([
    'Seattle,WA',
    'New Smyrna Beach,FL'
  ]);

  const [timeRange, setTimeRange] = useState('3months'); // Default to 3 months to show summer comparison

  // AI Location Finder state
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [showAiSection, setShowAiSection] = useState(false); // Start collapsed
  const [currentLocationData, setCurrentLocationData] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [pendingLocation, setPendingLocation] = useState(null); // Location pending confirmation
  const [showLocationConfirmation, setShowLocationConfirmation] = useState(false);

  const { unit } = useTemperatureUnit();

  // Ref for AI finder section
  const aiFinderRef = useRef(null);

  // Auto-detect user's location on mount
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const location = await getCurrentLocation();

        // Check if location requires confirmation (IP-based or poor accuracy)
        if (location.requiresConfirmation) {
          console.log('🔍 Location requires confirmation:', location);
          setPendingLocation(location);
          setShowLocationConfirmation(true);
          // Don't set currentLocationData yet - wait for confirmation
        } else {
          // High-accuracy location - use immediately
          setCurrentLocationData({
            lat: location.latitude,
            lng: location.longitude,
            city: location.address
          });
        }
      } catch (error) {
        console.log('Location detection skipped:', error.message);
        // Don't show error - it's optional
      }
    };

    detectLocation();
  }, []);

  // Handle location confirmation
  const handleConfirmLocation = () => {
    if (pendingLocation) {
      console.log('✅ User confirmed location:', pendingLocation);
      setCurrentLocationData({
        lat: pendingLocation.latitude,
        lng: pendingLocation.longitude,
        city: pendingLocation.address
      });
      setShowLocationConfirmation(false);
      setPendingLocation(null);
    }
  };

  // Handle location rejection
  const handleRejectLocation = () => {
    console.log('❌ User rejected location');
    setShowLocationConfirmation(false);
    setPendingLocation(null);
    setCurrentLocationData(null); // Clear any detected location
  };

  // Handle modal close
  const handleCloseConfirmation = () => {
    console.log('🚫 User closed confirmation modal');
    setShowLocationConfirmation(false);
    // Don't set currentLocationData if user didn't confirm
  };

  // Calculate date range based on selected time range
  const getDateRange = () => {
    const now = new Date();
    const endDate = new Date(now);
    let startDate = new Date(now);
    let lookbackYears = 10; // Default years for historical comparison

    switch (timeRange) {
      case '7days':
        // Current week forecast
        return { type: 'forecast', days: 7 };
      case '1month':
        startDate.setMonth(now.getMonth() - 1);
        lookbackYears = 5;
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        lookbackYears = 5;
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        lookbackYears = 5;
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        lookbackYears = 10;
        break;
      case '3years':
        startDate.setFullYear(now.getFullYear() - 3);
        lookbackYears = 10;
        break;
      case '5years':
        startDate.setFullYear(now.getFullYear() - 5);
        lookbackYears = 10;
        break;
      default:
        return { type: 'forecast', days: 7 };
    }

    return {
      type: 'historical',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      lookbackYears
    };
  };

  const dateRange = getDateRange();

  // Fetch forecast data (always call hooks - pass null if not needed)
  const location1Forecast = useForecast(
    dateRange.type === 'forecast' ? (locations[0] || null) : null,
    dateRange.days || 7
  );
  const location2Forecast = useForecast(
    dateRange.type === 'forecast' ? (locations[1] || null) : null,
    dateRange.days || 7
  );
  const location3Forecast = useForecast(
    dateRange.type === 'forecast' ? (locations[2] || null) : null,
    dateRange.days || 7
  );
  const location4Forecast = useForecast(
    dateRange.type === 'forecast' ? (locations[3] || null) : null,
    dateRange.days || 7
  );

  // Fetch historical data (always call hooks - pass null if not needed)
  const location1Historical = useHistoricalWeather(
    dateRange.type === 'historical' ? (locations[0] || null) : null,
    dateRange.startDate,
    dateRange.endDate
  );
  const location2Historical = useHistoricalWeather(
    dateRange.type === 'historical' ? (locations[1] || null) : null,
    dateRange.startDate,
    dateRange.endDate
  );
  const location3Historical = useHistoricalWeather(
    dateRange.type === 'historical' ? (locations[2] || null) : null,
    dateRange.startDate,
    dateRange.endDate
  );
  const location4Historical = useHistoricalWeather(
    dateRange.type === 'historical' ? (locations[3] || null) : null,
    dateRange.startDate,
    dateRange.endDate
  );

  // Combine data based on current mode
  const location1Data = dateRange.type === 'forecast' ? location1Forecast : location1Historical;
  const location2Data = dateRange.type === 'forecast' ? location2Forecast : location2Historical;
  const location3Data = dateRange.type === 'forecast' ? location3Forecast : location3Historical;
  const location4Data = dateRange.type === 'forecast' ? location4Forecast : location4Historical;

  // Fetch historical comparison data for each location (only for forecast mode)
  const location1Comparison = useForecastComparison(
    dateRange.type === 'forecast' ? (locations[0] || null) : null,
    location1Data?.data?.forecast || [],
    10
  );
  const location2Comparison = useForecastComparison(
    dateRange.type === 'forecast' ? (locations[1] || null) : null,
    location2Data?.data?.forecast || [],
    10
  );
  const location3Comparison = useForecastComparison(
    dateRange.type === 'forecast' ? (locations[2] || null) : null,
    location3Data?.data?.forecast || [],
    10
  );
  const location4Comparison = useForecastComparison(
    dateRange.type === 'forecast' ? (locations[3] || null) : null,
    location4Data?.data?.forecast || [],
    10
  );

  // Fetch "This Day in History" for each location (only for forecast mode)
  const location1History = useThisDayInHistory(
    dateRange.type === 'forecast' ? (locations[0] || null) : null,
    null,
    10
  );
  const location2History = useThisDayInHistory(
    dateRange.type === 'forecast' ? (locations[1] || null) : null,
    null,
    10
  );
  const location3History = useThisDayInHistory(
    dateRange.type === 'forecast' ? (locations[2] || null) : null,
    null,
    10
  );
  const location4History = useThisDayInHistory(
    dateRange.type === 'forecast' ? (locations[3] || null) : null,
    null,
    10
  );

  // Pre-aggregate all location data (must be at top level, not in map)
  // Maintain index alignment with locations array
  const aggregatedDataSets = useMemo(() => {
    const dataArray = [
      locations[0] ? location1Data : null,
      locations[1] ? location2Data : null,
      locations[2] ? location3Data : null,
      locations[3] ? location4Data : null
    ];

    return dataArray.map(data => {
      if (!data) return { aggregatedData: [], aggregationLabel: null };
      const rawWeatherData = data?.data?.forecast || data?.data?.historical || [];
      return aggregateWeatherData(rawWeatherData, timeRange);
    });
  }, [locations, location1Data, location2Data, location3Data, location4Data, timeRange]);

  const allData = [
    locations[0] ? location1Data : null,
    locations[1] ? location2Data : null,
    locations[2] ? location3Data : null,
    locations[3] ? location4Data : null
  ].filter(Boolean);

  const allComparisonData = [
    locations[0] ? location1Comparison : null,
    locations[1] ? location2Comparison : null,
    locations[2] ? location3Comparison : null,
    locations[3] ? location4Comparison : null
  ];

  const allHistoryData = [
    locations[0] ? location1History : null,
    locations[1] ? location2History : null,
    locations[2] ? location3History : null,
    locations[3] ? location4History : null
  ];

  const handleAddLocation = () => {
    if (locations.length < 4) {
      setLocations([...locations, '']);
    }
  };

  const handleRemoveLocation = (index) => {
    if (locations.length > 2) {
      const newLocations = locations.filter((_, i) => i !== index);
      setLocations(newLocations);
    }
  };

  const handleLocationSelect = (index, location) => {
    const newLocations = [...locations];
    newLocations[index] = location.address;
    setLocations(newLocations);
  };

  // Calculate comparison metrics
  const getComparisonMetrics = () => {
    const metrics = [];

    allData.forEach((locationData, index) => {
      if (!locationData.data) return;

      // Handle both forecast and historical data formats
      const weatherData = locationData.data.forecast || locationData.data.historical || [];
      if (weatherData.length === 0) return;

      const avgTemp = weatherData.reduce((sum, day) => sum + (day.tempAvg || day.temp), 0) / weatherData.length;
      const totalPrecip = weatherData.reduce((sum, day) => sum + (day.precipitation || 0), 0);
      const avgHumidity = weatherData.reduce((sum, day) => sum + (day.humidity || 0), 0) / weatherData.length;

      metrics.push({
        index,
        location: locationData.data.location?.address || locations[index],
        avgTemp,
        totalPrecip,
        avgHumidity,
        highTemp: Math.max(...weatherData.map(d => d.tempMax || d.temp)),
        lowTemp: Math.min(...weatherData.map(d => d.tempMin || d.temp)),
        dataPoints: weatherData.length
      });
    });

    return metrics;
  };

  const metrics = getComparisonMetrics();

  // Find extremes
  const warmestLocation = metrics.length > 0 ? metrics.reduce((max, m) => m.avgTemp > max.avgTemp ? m : max) : null;
  const coldestLocation = metrics.length > 0 ? metrics.reduce((min, m) => m.avgTemp < min.avgTemp ? m : min) : null;
  const wettestLocation = metrics.length > 0 ? metrics.reduce((max, m) => m.totalPrecip > max.totalPrecip ? m : max) : null;

  // Location database with climate characteristics
  const locationDatabase = [
    // Cool/Temperate climates
    { name: 'Seattle,WA', avgTemp: 52, humidity: 'moderate', precipitation: 'high', season: 'year-round' },
    { name: 'Portland,OR', avgTemp: 54, humidity: 'moderate', precipitation: 'high', season: 'year-round' },
    { name: 'San Francisco,CA', avgTemp: 57, humidity: 'moderate', precipitation: 'low', season: 'year-round' },
    { name: 'Denver,CO', avgTemp: 51, humidity: 'low', precipitation: 'low', season: 'year-round' },
    { name: 'Boise,ID', avgTemp: 52, humidity: 'low', precipitation: 'moderate', season: 'year-round' },
    { name: 'Minneapolis,MN', avgTemp: 46, humidity: 'moderate', precipitation: 'moderate', season: 'summer' },
    { name: 'Chicago,IL', avgTemp: 50, humidity: 'moderate', precipitation: 'moderate', season: 'year-round' },
    { name: 'Boston,MA', avgTemp: 51, humidity: 'moderate', precipitation: 'moderate', season: 'year-round' },

    // Warm/Hot climates
    { name: 'Miami,FL', avgTemp: 77, humidity: 'high', precipitation: 'high', season: 'year-round' },
    { name: 'Phoenix,AZ', avgTemp: 75, humidity: 'low', precipitation: 'low', season: 'winter' },
    { name: 'Las Vegas,NV', avgTemp: 70, humidity: 'low', precipitation: 'low', season: 'winter' },
    { name: 'Austin,TX', avgTemp: 69, humidity: 'moderate', precipitation: 'moderate', season: 'year-round' },
    { name: 'San Diego,CA', avgTemp: 64, humidity: 'moderate', precipitation: 'low', season: 'year-round' },
    { name: 'Los Angeles,CA', avgTemp: 65, humidity: 'moderate', precipitation: 'low', season: 'year-round' },
    { name: 'Tampa,FL', avgTemp: 73, humidity: 'high', precipitation: 'high', season: 'year-round' },
    { name: 'Orlando,FL', avgTemp: 73, humidity: 'high', precipitation: 'high', season: 'year-round' },

    // Moderate climates
    { name: 'Atlanta,GA', avgTemp: 62, humidity: 'moderate', precipitation: 'moderate', season: 'year-round' },
    { name: 'Charlotte,NC', avgTemp: 61, humidity: 'moderate', precipitation: 'moderate', season: 'year-round' },
    { name: 'Nashville,TN', avgTemp: 59, humidity: 'moderate', precipitation: 'moderate', season: 'year-round' },
    { name: 'Raleigh,NC', avgTemp: 59, humidity: 'moderate', precipitation: 'moderate', season: 'year-round' },
    { name: 'Sacramento,CA', avgTemp: 61, humidity: 'low', precipitation: 'low', season: 'year-round' },
    { name: 'Salt Lake City,UT', avgTemp: 52, humidity: 'low', precipitation: 'low', season: 'year-round' },

    // Coastal areas
    { name: 'Charleston,SC', avgTemp: 66, humidity: 'high', precipitation: 'moderate', season: 'year-round' },
    { name: 'Savannah,GA', avgTemp: 66, humidity: 'high', precipitation: 'moderate', season: 'year-round' },
    { name: 'New Smyrna Beach,FL', avgTemp: 72, humidity: 'high', precipitation: 'high', season: 'year-round' },
  ];

  // Generate location suggestions based on AI criteria
  const generateLocationSuggestions = (criteria) => {
    if (!criteria) return [];

    const currentLoc = criteria.current_location;
    const tempDelta = criteria.temperature_delta || 0;
    const humidityPref = criteria.humidity?.toLowerCase();
    const precipPref = criteria.precipitation?.toLowerCase();

    // Find current location in database to get baseline
    const currentData = locationDatabase.find(loc =>
      currentLoc && loc.name.toLowerCase().includes(currentLoc.toLowerCase())
    );

    const targetTemp = currentData ? currentData.avgTemp + tempDelta : null;

    // Score each location
    const scored = locationDatabase.map(location => {
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
        if (humidityPref.includes('lower') || humidityPref.includes('less') || humidityPref.includes('dry')) {
          if (location.humidity === 'low') score += 20;
          if (location.humidity === 'moderate') score += 10;
        } else if (humidityPref.includes('higher') || humidityPref.includes('more') || humidityPref.includes('humid')) {
          if (location.humidity === 'high') score += 20;
          if (location.humidity === 'moderate') score += 10;
        }
      }

      // Precipitation matching
      if (precipPref) {
        if (precipPref.includes('less') || precipPref.includes('dry') || precipPref.includes('not rainy')) {
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
      .filter(loc => loc.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(loc => loc.name);

    // If we have the current location in results, make sure it's included for comparison
    if (currentData && !suggestions.includes(currentData.name)) {
      suggestions.unshift(currentData.name);
    }

    return suggestions;
  };

  // AI Location Finder handlers
  const handleGetMyLocation = async () => {
    setGettingLocation(true);
    setAiError(null);

    try {
      const location = await getCurrentLocation();
      setCurrentLocationData({
        lat: location.latitude,
        lng: location.longitude,
        city: location.address
      });
      setAiError(null);
    } catch (error) {
      console.error('Failed to get location:', error);
      setAiError('Failed to get your location. Please try again or enter it manually in your query.');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleAiSearch = async (e) => {
    e.preventDefault();

    if (!aiQuery.trim()) {
      setAiError('Please enter your climate preferences');
      return;
    }

    // Step 0: Client-side pre-validation (FREE - no API cost)
    const sanitized = sanitizeInput(aiQuery);
    const clientValidation = validateClimatInput(sanitized);

    if (!clientValidation.isValid) {
      setAiError(clientValidation.reason);
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      // Step 1: Server-side AI validation (~$0.001)
      console.log('Validating query with AI...');
      const validationResult = await validateQuery(sanitized);

      if (!validationResult.isValid) {
        setAiError(`Invalid query: ${validationResult.reason}`);
        setAiLoading(false);
        return;
      }

      // Step 2: Full AI parsing (~$0.005)
      console.log('Parsing query with AI...');
      const parseResult = await parseLocationQuery(sanitized, currentLocationData);

      setAiResult(parseResult);
      console.log('AI Result:', parseResult);

      // Step 3: Auto-populate comparison cards with suggested locations
      const suggestions = generateLocationSuggestions(parseResult.criteria);
      if (suggestions.length > 0) {
        setLocations(suggestions.slice(0, 4)); // Take up to 4 suggestions
      }

    } catch (error) {
      console.error('AI search error:', error);
      setAiError(error.message || 'Failed to process your query. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleOpenAiFinder = () => {
    setShowAiSection(true);
    // Scroll to AI finder section after a brief delay to allow rendering
    setTimeout(() => {
      aiFinderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="location-comparison-view">
      {/* Location Confirmation Modal */}
      {showLocationConfirmation && pendingLocation && (
        <LocationConfirmationModal
          location={pendingLocation}
          onConfirm={handleConfirmLocation}
          onReject={handleRejectLocation}
          onClose={handleCloseConfirmation}
        />
      )}

      <div className="comparison-header">
        <h2>📊 Location Comparison</h2>
        <div className="comparison-controls">
          <div className="time-range-selector">
            <label htmlFor="time-range">Time Range:</label>
            <select
              id="time-range"
              className="time-range-select"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7days">7 Days (Forecast)</option>
              <option value="1month">1 Month</option>
              <option value="3months">3 Months</option>
              <option value="6months">6 Months</option>
              <option value="1year">1 Year</option>
              <option value="3years">3 Years</option>
              <option value="5years">5 Years</option>
            </select>
          </div>
          <TemperatureUnitToggle />
          {locations.length < 4 && (
            <button className="add-location-button" onClick={handleAddLocation}>
              + Add Location
            </button>
          )}
        </div>
      </div>

      {/* Quick AI Prompt Card */}
      <div className="ai-quick-prompt-card">
        <div className="quick-prompt-location">
          <span className="location-icon">📍</span>
          <div className="location-info">
            <span className="location-label">Your Location</span>
            <span className="location-value">
              {currentLocationData ? currentLocationData.city : 'Detecting...'}
            </span>
          </div>
        </div>
        <button className="ai-prompt-button" onClick={handleOpenAiFinder}>
          Can I just tell you what I want to compare and you show me some data and pretty charts and graphs?
        </button>
      </div>

      {/* AI-Powered Location Finder */}
      {showAiSection && (
        <div className="ai-location-finder" ref={aiFinderRef}>
          <div className="ai-header">
            <h3>🤖 AI-Powered Location Finder</h3>
            <button className="ai-close" onClick={() => setShowAiSection(false)} title="Dismiss">
              ✕
            </button>
          </div>
          <div className="ai-content">
            <p className="ai-description">
              Describe your ideal climate in natural language, and our AI will help you find matching locations!
            </p>

            <form onSubmit={handleAiSearch} className="ai-search-form">
              <div className="ai-input-group">
                <textarea
                  className="ai-input"
                  placeholder='Example: "I currently live in New Smyrna Beach, FL. I want somewhere 15 degrees cooler from June-October, less humid, not rainy, with a good community feel."'
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  rows={4}
                  disabled={aiLoading}
                  spellCheck={true}
                />
              </div>

              <div className="ai-actions">
                <button
                  type="button"
                  className="ai-location-button"
                  onClick={handleGetMyLocation}
                  disabled={aiLoading || gettingLocation}
                >
                  {gettingLocation ? '📍 Getting location...' : '📍 Get my location'}
                </button>
                {currentLocationData && (
                  <span className="location-detected">
                    ✓ Location: {currentLocationData.city}
                  </span>
                )}
                <button
                  type="submit"
                  className="ai-submit-button"
                  disabled={aiLoading || !aiQuery.trim()}
                >
                  {aiLoading ? '🔍 Analyzing...' : '🔍 Find locations'}
                </button>
              </div>

              {aiError && (
                <div className="ai-error">
                  <p>⚠️ {aiError}</p>
                </div>
              )}

              {aiResult && (
                <div className="ai-result">
                  <h4>📊 Parsed Criteria:</h4>
                  <div className="criteria-grid">
                    {aiResult.criteria.current_location && (
                      <div className="criteria-item">
                        <strong>Current Location:</strong> {aiResult.criteria.current_location}
                      </div>
                    )}
                    {aiResult.criteria.time_period && (
                      <div className="criteria-item">
                        <strong>Time Period:</strong> {aiResult.criteria.time_period.start} - {aiResult.criteria.time_period.end}
                      </div>
                    )}
                    {aiResult.criteria.temperature_delta !== null && (
                      <div className="criteria-item">
                        <strong>Temperature:</strong> {aiResult.criteria.temperature_delta > 0 ? '+' : ''}{aiResult.criteria.temperature_delta}°F
                      </div>
                    )}
                    {aiResult.criteria.humidity && (
                      <div className="criteria-item">
                        <strong>Humidity:</strong> {aiResult.criteria.humidity}
                      </div>
                    )}
                    {aiResult.criteria.precipitation && (
                      <div className="criteria-item">
                        <strong>Precipitation:</strong> {aiResult.criteria.precipitation}
                      </div>
                    )}
                    {aiResult.criteria.lifestyle_factors && aiResult.criteria.lifestyle_factors.length > 0 && (
                      <div className="criteria-item">
                        <strong>Lifestyle:</strong> {aiResult.criteria.lifestyle_factors.join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="ai-cost-info">
                    💰 Cost: {aiResult.cost} | 🔢 Tokens: {aiResult.tokensUsed}
                  </div>
                  {aiResult.criteria.additional_notes && (
                    <div className="ai-notes">
                      <p><strong>💡 AI Insights:</strong> {aiResult.criteria.additional_notes}</p>
                    </div>
                  )}
                  <div className="ai-success">
                    <p>✅ <strong>Comparison cards auto-populated!</strong> Scroll down to view suggested locations based on your criteria.</p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Time Range Explanation */}
      <div className="time-range-explanation">
        {timeRange === '7days' && (
          <p>
            <strong>📅 7-Day Forecast:</strong> Compare upcoming weather predictions for the next week.
            Perfect for planning trips or events.
          </p>
        )}
        {timeRange === '1month' && (
          <p>
            <strong>📊 Past Month:</strong> View actual weather data from the last 30 days.
            See recent temperature trends and total rainfall.
          </p>
        )}
        {timeRange === '3months' && (
          <p>
            <strong>🍂 Past 3 Months (Seasonal):</strong> Compare seasonal patterns between cities.
            Great for understanding quarter-year climate differences.
          </p>
        )}
        {timeRange === '6months' && (
          <p>
            <strong>📈 Past 6 Months:</strong> Analyze half-year weather patterns and trends.
            See how locations compare across different seasons.
          </p>
        )}
        {timeRange === '1year' && (
          <p>
            <strong>🌍 Full Year:</strong> Compare annual climate patterns - total yearly rainfall, average temperatures, and seasonal variations.
            <em>Example: "Does Seattle really get more rain than Miami annually?"</em>
          </p>
        )}
        {timeRange === '3years' && (
          <p>
            <strong>📉 3-Year Average:</strong> See long-term climate patterns smoothed over 3 years.
            Reduces year-to-year variation for clearer trends.
          </p>
        )}
        {timeRange === '5years' && (
          <p>
            <strong>🔬 5-Year Average:</strong> Compare true climate characteristics over 5 years.
            Best for relocation decisions and understanding typical weather.
          </p>
        )}
      </div>

      {/* Location Cards Grid */}
      <div className="comparison-grid">
        {locations.map((location, index) => {
          const data = allData[index];
          const comparisonData = allComparisonData[index];
          const historyData = allHistoryData[index];
          const loading = data?.loading;
          const error = data?.error;

          // Get pre-aggregated data for this location
          const aggregationResult = aggregatedDataSets[index] || {
            aggregatedData: [],
            aggregationLabel: null
          };
          const weatherData = aggregationResult.aggregatedData || [];
          const aggregationLabel = aggregationResult.aggregationLabel;

          return (
            <div key={index} className="comparison-card">
              <div className="card-header">
                <span className="card-number">{index + 1}</span>
                {locations.length > 2 && (
                  <button
                    className="remove-card-button"
                    onClick={() => handleRemoveLocation(index)}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="card-search">
                <LocationSearchBar
                  onLocationSelect={(loc) => handleLocationSelect(index, loc)}
                  currentLocation={{ address: location }}
                />
              </div>

              {loading && (
                <div className="card-loading">
                  <div className="spinner"></div>
                  <p>Loading weather...</p>
                </div>
              )}

              {error && (
                <div className="card-error">
                  <p>⚠️ {error}</p>
                </div>
              )}

              {!loading && !error && weatherData.length === 0 && (
                <div className="card-error">
                  <p>⚠️ No weather data available</p>
                </div>
              )}

              {!loading && !error && weatherData.length > 0 && (
                <div className="card-content">
                  <h3 className="location-name">
                    {data.data.location?.address || location}
                  </h3>

                  <div className="current-weather">
                    <div className="temp-display">
                      <span className="current-temp">
                        {formatTemperature(weatherData[0].tempAvg || weatherData[0].temp, unit)}
                      </span>
                      <span className="temp-label">
                        {dateRange.type === 'forecast' ? 'Current' : 'Latest'}
                      </span>
                    </div>
                    <div className="temp-range">
                      <span className="high-temp">
                        H: {formatTemperature(weatherData[0].tempMax || weatherData[0].temp, unit)}
                      </span>
                      <span className="low-temp">
                        L: {formatTemperature(weatherData[0].tempMin || weatherData[0].temp, unit)}
                      </span>
                    </div>
                  </div>

                  <div className="forecast-summary">
                    <div className="summary-item">
                      <span className="summary-label">
                        {timeRange === '7days' ? '7-Day Avg' :
                         timeRange === '1month' ? '1-Month Avg' :
                         timeRange === '3months' ? '3-Month Avg' :
                         timeRange === '6months' ? '6-Month Avg' :
                         timeRange === '1year' ? '1-Year Avg' :
                         timeRange === '3years' ? '3-Year Avg' :
                         '5-Year Avg'}
                      </span>
                      <span className="summary-value">
                        {formatTemperature(
                          weatherData.reduce((sum, d) => sum + (d.tempAvg || d.temp), 0) / weatherData.length,
                          unit
                        )}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Total Precipitation</span>
                      <span className="summary-value">
                        {weatherData.reduce((sum, d) => sum + (d.precipitation || 0), 0).toFixed(1)} mm
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Avg Humidity</span>
                      <span className="summary-value">
                        {Math.round(weatherData.reduce((sum, d) => sum + (d.humidity || 0), 0) / weatherData.length)}%
                      </span>
                    </div>
                  </div>

                  {weatherData[0].conditions && (
                    <div className="conditions-badge">
                      {weatherData[0].conditions}
                    </div>
                  )}

                  {/* Weather Charts - only render if we have valid data */}
                  {weatherData && weatherData.length > 0 && (
                    <div className="comparison-charts">
                      {aggregationLabel && (
                        <div className="aggregation-indicator">
                          <span>📊 {aggregationLabel}</span>
                        </div>
                      )}

                      <div className="comparison-chart">
                        <TemperatureBandChart
                          data={weatherData}
                          unit={unit}
                          height={200}
                          days={weatherData.length}
                          aggregationLabel={aggregationLabel}
                        />
                      </div>

                      <div className="comparison-chart">
                        <PrecipitationChart
                          data={weatherData}
                          height={180}
                          days={weatherData.length}
                          aggregationLabel={aggregationLabel}
                        />
                      </div>

                      <div className="comparison-chart">
                        <WindChart
                          data={weatherData}
                          height={180}
                          days={weatherData.length}
                          aggregationLabel={aggregationLabel}
                        />
                      </div>

                      {/* Historical Comparison (only for forecast mode) */}
                      {dateRange.type === 'forecast' && comparisonData?.data && (
                        <div className="comparison-chart">
                          <HistoricalComparisonChart
                            forecastData={weatherData}
                            historicalData={comparisonData.data}
                            unit={unit}
                            height={220}
                            aggregationLabel={aggregationLabel}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Historical Insights (only for forecast mode) */}
                  {dateRange.type === 'forecast' && historyData?.data && (
                    <div className="historical-insights">
                      <h4>📅 Historical Context (10 years)</h4>
                      <div className="insights-stats">
                        {historyData.data.normals && (
                          <>
                            <div className="stat-item">
                              <span className="stat-label">Historical Avg:</span>
                              <span className="stat-value">
                                {formatTemperature(historyData.data.normals.tempAvg, unit)}
                              </span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">Record High:</span>
                              <span className="stat-value high">
                                {formatTemperature(historyData.data.records?.maxTemp, unit)}
                                {historyData.data.records?.maxTempYear &&
                                  ` (${historyData.data.records.maxTempYear})`}
                              </span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">Record Low:</span>
                              <span className="stat-value low">
                                {formatTemperature(historyData.data.records?.minTemp, unit)}
                                {historyData.data.records?.minTempYear &&
                                  ` (${historyData.data.records.minTempYear})`}
                              </span>
                            </div>
                          </>
                        )}
                        {weatherData.length > 0 && historyData.data.normals && (
                          <div className="stat-item comparison-stat">
                            <span className="stat-label">vs Historical:</span>
                            <span className={`stat-value ${
                              (weatherData[0].tempAvg || weatherData[0].temp) > historyData.data.normals.tempAvg
                                ? 'warmer'
                                : 'cooler'
                            }`}>
                              {(weatherData[0].tempAvg || weatherData[0].temp) > historyData.data.normals.tempAvg
                                ? '🔥 Warmer'
                                : '❄️ Cooler'} than average
                              ({Math.abs((weatherData[0].tempAvg || weatherData[0].temp) - historyData.data.normals.tempAvg).toFixed(1)}°{unit})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison Insights */}
      {metrics.length > 1 && (
        <div className="comparison-insights">
          <h3>🔍 Comparison Insights</h3>
          <div className="insights-grid">
            {warmestLocation && (
              <div className="insight-card warm">
                <span className="insight-icon">🔥</span>
                <div>
                  <p className="insight-label">Warmest</p>
                  <p className="insight-value">{warmestLocation.location}</p>
                  <p className="insight-detail">
                    {formatTemperature(warmestLocation.avgTemp, unit)} avg
                  </p>
                </div>
              </div>
            )}

            {coldestLocation && warmestLocation !== coldestLocation && (
              <div className="insight-card cold">
                <span className="insight-icon">❄️</span>
                <div>
                  <p className="insight-label">Coldest</p>
                  <p className="insight-value">{coldestLocation.location}</p>
                  <p className="insight-detail">
                    {formatTemperature(coldestLocation.avgTemp, unit)} avg
                  </p>
                </div>
              </div>
            )}

            {wettestLocation && (
              <div className="insight-card wet">
                <span className="insight-icon">🌧️</span>
                <div>
                  <p className="insight-label">Wettest</p>
                  <p className="insight-value">{wettestLocation.location}</p>
                  <p className="insight-detail">
                    {wettestLocation.totalPrecip.toFixed(1)} mm total
                  </p>
                </div>
              </div>
            )}

            {warmestLocation && coldestLocation && warmestLocation !== coldestLocation && (
              <div className="insight-card difference">
                <span className="insight-icon">📊</span>
                <div>
                  <p className="insight-label">Temperature Difference</p>
                  <p className="insight-value">
                    {Math.abs(warmestLocation.avgTemp - coldestLocation.avgTemp).toFixed(1)}°{unit}
                  </p>
                  <p className="insight-detail">
                    Between warmest and coldest
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationComparisonView;
