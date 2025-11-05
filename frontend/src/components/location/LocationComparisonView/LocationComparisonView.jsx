import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useForecast, useHistoricalWeather } from '../../../hooks/useWeatherData';
import { useForecastComparison, useThisDayInHistory } from '../../../hooks/useClimateData';
import { aggregateWeatherData } from '../../../utils/weatherHelpers';
import { useTemperatureUnit } from '../../../contexts/TemperatureUnitContext';
import { validateQuery, parseLocationQuery } from '../../../services/locationFinderService';
import { getCurrentLocation } from '../../../services/geolocationService';
import { validateClimatInput, sanitizeInput } from '../../../utils/inputSanitizer';
import useLocationConfirmation from '../../../hooks/useLocationConfirmation';
import { debugLog, debugError, debugInfo } from '../../../utils/debugLogger';
import LocationConfirmationModal from '../LocationConfirmationModal';
import TemperatureUnitToggle from '../../units/TemperatureUnitToggle';
import AILocationFinder from './AILocationFinder';
import ComparisonCard from './ComparisonCard';
import ComparisonInsights from './ComparisonInsights';
import { locationDatabase, generateLocationSuggestions } from './locationData';
import '../LocationComparisonView.css';

/**
 * LocationComparisonView Component
 * Compare weather between multiple locations side-by-side
 *
 * REFACTORED: Split into focused sub-components for better maintainability
 */
function LocationComparisonView() {
  // Start with an interesting comparison pre-loaded
  const [locations, setLocations] = useState(['Seattle,WA', 'New Smyrna Beach,FL']);

  const [timeRange, setTimeRange] = useState('3months'); // Default to 3 months

  // AI Location Finder state
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [showAiSection, setShowAiSection] = useState(false);
  const [currentLocationData, setCurrentLocationData] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const { unit } = useTemperatureUnit();

  // Ref for AI finder section
  const aiFinderRef = useRef(null);

  // Location confirmation hook (replaces duplicate code)
  const locationConfirmation = useLocationConfirmation((confirmedLocation) => {
    if (confirmedLocation) {
      debugInfo('LocationComparisonView', {
        action: 'location_confirmed',
        location: confirmedLocation.address,
      });
      setCurrentLocationData({
        lat: confirmedLocation.latitude,
        lng: confirmedLocation.longitude,
        city: confirmedLocation.address,
      });
    } else {
      debugInfo('LocationComparisonView', { action: 'location_rejected' });
      setCurrentLocationData(null);
    }
  });

  // Auto-detect user's location on mount
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const location = await getCurrentLocation();

        if (location.requiresConfirmation) {
          debugInfo('LocationComparisonView', {
            action: 'location_requires_confirmation',
            location: location.address,
          });
          locationConfirmation.requestConfirmation(location);
        } else {
          setCurrentLocationData({
            lat: location.latitude,
            lng: location.longitude,
            city: location.address,
          });
        }
      } catch (error) {
        debugLog('LocationComparisonView', {
          action: 'location_detection_skipped',
          error: error.message,
        });
      }
    };

    detectLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate date range based on selected time range
  const getDateRange = () => {
    const now = new Date();
    const endDate = new Date(now);
    let startDate = new Date(now);
    let lookbackYears = 10;

    switch (timeRange) {
      case '7days':
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
      lookbackYears,
    };
  };

  const dateRange = getDateRange();

  // Fetch forecast data (always call hooks - pass null if not needed)
  const location1Forecast = useForecast(
    dateRange.type === 'forecast' ? locations[0] || null : null,
    dateRange.days || 7
  );
  const location2Forecast = useForecast(
    dateRange.type === 'forecast' ? locations[1] || null : null,
    dateRange.days || 7
  );
  const location3Forecast = useForecast(
    dateRange.type === 'forecast' ? locations[2] || null : null,
    dateRange.days || 7
  );
  const location4Forecast = useForecast(
    dateRange.type === 'forecast' ? locations[3] || null : null,
    dateRange.days || 7
  );

  // Fetch historical data
  const location1Historical = useHistoricalWeather(
    dateRange.type === 'historical' ? locations[0] || null : null,
    dateRange.startDate,
    dateRange.endDate
  );
  const location2Historical = useHistoricalWeather(
    dateRange.type === 'historical' ? locations[1] || null : null,
    dateRange.startDate,
    dateRange.endDate
  );
  const location3Historical = useHistoricalWeather(
    dateRange.type === 'historical' ? locations[2] || null : null,
    dateRange.startDate,
    dateRange.endDate
  );
  const location4Historical = useHistoricalWeather(
    dateRange.type === 'historical' ? locations[3] || null : null,
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
    dateRange.type === 'forecast' ? locations[0] || null : null,
    location1Data?.data?.forecast || [],
    10
  );
  const location2Comparison = useForecastComparison(
    dateRange.type === 'forecast' ? locations[1] || null : null,
    location2Data?.data?.forecast || [],
    10
  );
  const location3Comparison = useForecastComparison(
    dateRange.type === 'forecast' ? locations[2] || null : null,
    location3Data?.data?.forecast || [],
    10
  );
  const location4Comparison = useForecastComparison(
    dateRange.type === 'forecast' ? locations[3] || null : null,
    location4Data?.data?.forecast || [],
    10
  );

  // Fetch "This Day in History" for each location (only for forecast mode)
  const location1History = useThisDayInHistory(
    dateRange.type === 'forecast' ? locations[0] || null : null,
    null,
    10
  );
  const location2History = useThisDayInHistory(
    dateRange.type === 'forecast' ? locations[1] || null : null,
    null,
    10
  );
  const location3History = useThisDayInHistory(
    dateRange.type === 'forecast' ? locations[2] || null : null,
    null,
    10
  );
  const location4History = useThisDayInHistory(
    dateRange.type === 'forecast' ? locations[3] || null : null,
    null,
    10
  );

  // Pre-aggregate all location data
  const aggregatedDataSets = useMemo(() => {
    const dataArray = [
      locations[0] ? location1Data : null,
      locations[1] ? location2Data : null,
      locations[2] ? location3Data : null,
      locations[3] ? location4Data : null,
    ];

    return dataArray.map((data) => {
      if (!data) return { aggregatedData: [], aggregationLabel: null };
      const rawWeatherData = data?.data?.forecast || data?.data?.historical || [];
      return aggregateWeatherData(rawWeatherData, timeRange);
    });
  }, [locations, location1Data, location2Data, location3Data, location4Data, timeRange]);

  const allData = [
    locations[0] ? location1Data : null,
    locations[1] ? location2Data : null,
    locations[2] ? location3Data : null,
    locations[3] ? location4Data : null,
  ].filter(Boolean);

  const allComparisonData = [
    locations[0] ? location1Comparison : null,
    locations[1] ? location2Comparison : null,
    locations[2] ? location3Comparison : null,
    locations[3] ? location4Comparison : null,
  ];

  const allHistoryData = [
    locations[0] ? location1History : null,
    locations[1] ? location2History : null,
    locations[2] ? location3History : null,
    locations[3] ? location4History : null,
  ];

  const handleAddLocation = () => {
    if (locations.length < 4) {
      setLocations([...locations, '']);
      debugInfo('LocationComparisonView', {
        action: 'add_location',
        count: locations.length + 1,
      });
    }
  };

  const handleRemoveLocation = (index) => {
    if (locations.length > 2) {
      const newLocations = locations.filter((_, i) => i !== index);
      setLocations(newLocations);
      debugInfo('LocationComparisonView', {
        action: 'remove_location',
        index,
        remaining: newLocations.length,
      });
    }
  };

  const handleLocationSelect = (index, location) => {
    const newLocations = [...locations];
    newLocations[index] = location.address;
    setLocations(newLocations);
    debugInfo('LocationComparisonView', {
      action: 'location_selected',
      index,
      location: location.address,
    });
  };

  // Calculate comparison metrics
  const getComparisonMetrics = () => {
    const metrics = [];

    allData.forEach((locationData, index) => {
      if (!locationData.data) return;

      const weatherData = locationData.data.forecast || locationData.data.historical || [];
      if (weatherData.length === 0) return;

      const avgTemp =
        weatherData.reduce((sum, day) => sum + (day.tempAvg || day.temp), 0) / weatherData.length;
      const totalPrecip = weatherData.reduce((sum, day) => sum + (day.precipitation || 0), 0);
      const avgHumidity =
        weatherData.reduce((sum, day) => sum + (day.humidity || 0), 0) / weatherData.length;

      metrics.push({
        index,
        location: locationData.data.location?.address || locations[index],
        avgTemp,
        totalPrecip,
        avgHumidity,
        highTemp: Math.max(...weatherData.map((d) => d.tempMax || d.temp)),
        lowTemp: Math.min(...weatherData.map((d) => d.tempMin || d.temp)),
        dataPoints: weatherData.length,
      });
    });

    return metrics;
  };

  const metrics = getComparisonMetrics();

  // AI Location Finder handlers
  const handleGetMyLocation = async () => {
    setGettingLocation(true);
    setAiError(null);

    try {
      const location = await getCurrentLocation();
      setCurrentLocationData({
        lat: location.latitude,
        lng: location.longitude,
        city: location.address,
      });
      setAiError(null);
      debugInfo('LocationComparisonView', { action: 'got_location', location: location.address });
    } catch (error) {
      debugError('LocationComparisonView', { action: 'get_location_failed', error: error.message });
      setAiError(
        'Failed to get your location. Please try again or enter it manually in your query.'
      );
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

    // Client-side pre-validation
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
      debugInfo('LocationComparisonView', { action: 'ai_search_start', query: sanitized });

      // Server-side AI validation
      const validationResult = await validateQuery(sanitized);

      if (!validationResult.isValid) {
        setAiError(`Invalid query: ${validationResult.reason}`);
        setAiLoading(false);
        return;
      }

      // Full AI parsing
      const parseResult = await parseLocationQuery(sanitized, currentLocationData);
      setAiResult(parseResult);
      debugInfo('LocationComparisonView', { action: 'ai_search_complete', result: parseResult });

      // Auto-populate comparison cards with suggested locations
      const suggestions = generateLocationSuggestions(parseResult.criteria, locationDatabase);
      if (suggestions.length > 0) {
        setLocations(suggestions.slice(0, 4));
      }
    } catch (error) {
      debugError('LocationComparisonView', { action: 'ai_search_error', error: error.message });
      setAiError(error.message || 'Failed to process your query. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleOpenAiFinder = () => {
    setShowAiSection(true);
    debugInfo('LocationComparisonView', { action: 'open_ai_finder' });
    setTimeout(() => {
      aiFinderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCloseAiFinder = () => {
    setShowAiSection(false);
    debugInfo('LocationComparisonView', { action: 'close_ai_finder' });
  };

  // Time range explanations
  const getTimeRangeExplanation = () => {
    const explanations = {
      '7days': (
        <>
          <strong>📅 7-Day Forecast:</strong> Compare upcoming weather predictions for the next
          week. Perfect for planning trips or events.
        </>
      ),
      '1month': (
        <>
          <strong>📊 Past Month:</strong> View actual weather data from the last 30 days. See recent
          temperature trends and total rainfall.
        </>
      ),
      '3months': (
        <>
          <strong>🍂 Past 3 Months (Seasonal):</strong> Compare seasonal patterns between cities.
          Great for understanding quarter-year climate differences.
        </>
      ),
      '6months': (
        <>
          <strong>📈 Past 6 Months:</strong> Analyze half-year weather patterns and trends. See how
          locations compare across different seasons.
        </>
      ),
      '1year': (
        <>
          <strong>🌍 Full Year:</strong> Compare annual climate patterns - total yearly rainfall,
          average temperatures, and seasonal variations.{' '}
          <em>Example: &quot;Does Seattle really get more rain than Miami annually?&quot;</em>
        </>
      ),
      '3years': (
        <>
          <strong>📉 3-Year Average:</strong> See long-term climate patterns smoothed over 3 years.
          Reduces year-to-year variation for clearer trends.
        </>
      ),
      '5years': (
        <>
          <strong>🔬 5-Year Average:</strong> Compare true climate characteristics over 5 years.
          Best for relocation decisions and understanding typical weather.
        </>
      ),
    };

    return explanations[timeRange];
  };

  return (
    <div className="location-comparison-view">
      {/* Location Confirmation Modal */}
      {locationConfirmation.showModal && locationConfirmation.pendingLocation && (
        <LocationConfirmationModal
          location={locationConfirmation.pendingLocation}
          onConfirm={locationConfirmation.handleConfirm}
          onReject={() => locationConfirmation.handleReject(true)}
          onClose={() => locationConfirmation.handleClose(false)}
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
          Can I just tell you what I want to compare and you show me some data and pretty charts and
          graphs?
        </button>
      </div>

      {/* AI-Powered Location Finder */}
      <AILocationFinder
        showAiSection={showAiSection}
        aiQuery={aiQuery}
        setAiQuery={setAiQuery}
        aiLoading={aiLoading}
        aiError={aiError}
        aiResult={aiResult}
        currentLocationData={currentLocationData}
        gettingLocation={gettingLocation}
        handleAiSearch={handleAiSearch}
        handleGetMyLocation={handleGetMyLocation}
        handleCloseAiFinder={handleCloseAiFinder}
        aiFinderRef={aiFinderRef}
      />

      {/* Time Range Explanation */}
      <div className="time-range-explanation">
        <p>{getTimeRangeExplanation()}</p>
      </div>

      {/* Location Cards Grid */}
      <div className="comparison-grid">
        {locations.map((location, index) => {
          const data = allData[index];
          const comparisonData = allComparisonData[index];
          const historyData = allHistoryData[index];
          const aggregationResult = aggregatedDataSets[index] || {
            aggregatedData: [],
            aggregationLabel: null,
          };

          return (
            <ComparisonCard
              key={index}
              index={index}
              location={location}
              data={data}
              comparisonData={comparisonData}
              historyData={historyData}
              aggregationResult={aggregationResult}
              dateRange={dateRange}
              timeRange={timeRange}
              unit={unit}
              canRemove={locations.length > 2}
              onLocationSelect={handleLocationSelect}
              onRemove={() => handleRemoveLocation(index)}
            />
          );
        })}
      </div>

      {/* Comparison Insights */}
      <ComparisonInsights metrics={metrics} unit={unit} />
    </div>
  );
}

export default LocationComparisonView;
