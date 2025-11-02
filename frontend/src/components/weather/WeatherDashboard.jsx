import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from '../../contexts/LocationContext';
import { useTemperatureUnit } from '../../contexts/TemperatureUnitContext';
import { useForecast, useHourlyForecast, useCurrentWeather } from '../../hooks/useWeatherData';
import {
  useThisDayInHistory,
  useForecastComparison,
  useRecordTemperatures,
  useTemperatureProbability
} from '../../hooks/useClimateData';
import { getCurrentLocation } from '../../services/geolocationService';
import { celsiusToFahrenheit } from '../../utils/weatherHelpers';
import { updateLocationUrl } from '../../utils/urlHelpers';
import useKeyboardShortcuts, { useScreenReaderAnnouncement } from '../../hooks/useKeyboardShortcuts';
import TemperatureBandChart from '../charts/TemperatureBandChart';
import PrecipitationChart from '../charts/PrecipitationChart';
import WindChart from '../charts/WindChart';
import CloudCoverChart from '../charts/CloudCoverChart';
import UVIndexChart from '../charts/UVIndexChart';
import WeatherOverviewChart from '../charts/WeatherOverviewChart';
import HourlyForecastChart from '../charts/HourlyForecastChart';
import HistoricalComparisonChart from '../charts/HistoricalComparisonChart';
import RecordTemperaturesChart from '../charts/RecordTemperaturesChart';
import TemperatureProbabilityChart from '../charts/TemperatureProbabilityChart';
import HumidityDewpointChart from '../charts/HumidityDewpointChart';
import SunChart from '../charts/SunChart';
import FeelsLikeChart from '../charts/FeelsLikeChart';
import ThisDayInHistoryCard from '../cards/ThisDayInHistoryCard';
import AirQualityCard from '../cards/AirQualityCard';
import WeatherAlertsBanner from './WeatherAlertsBanner';
import TemperatureUnitToggle from '../units/TemperatureUnitToggle';
import DashboardSkeleton from '../common/DashboardSkeleton';
import RadarMap from './RadarMap';
import UniversalSearchBar from '../ai/UniversalSearchBar';
import './WeatherDashboard.css';

/**
 * Weather Dashboard Component
 * Main dashboard displaying weather charts and data
 */
function WeatherDashboard() {
  // Use shared location state from context
  const { location, locationData, selectLocation } = useLocation();
  const { unit } = useTemperatureUnit();

  const days = 7; // Default forecast days for charts
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [activeTab, setActiveTab] = useState('forecast'); // Tab state: forecast, details, historical, air-quality

  // Chart visibility state
  const [visibleCharts, setVisibleCharts] = useState({
    hourly: true,
    temperature: true,
    precipitation: true,
    wind: true,
    cloudCover: true,
    uvIndex: true,
    overview: true,
    // New enhanced charts
    humidityDew: true,
    sunriseSunset: true,
    feelsLike: true,
    airQuality: true,
    // Historical/Climate charts
    thisDayHistory: true,
    historicalComparison: false,
    recordTemps: false,
    tempProbability: false
  });

  // Refs for keyboard navigation
  const searchInputRef = useRef(null);

  // Screen reader announcements
  const { announce } = useScreenReaderAnnouncement();

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onFocusSearch: () => {
      // Focus the search input (will be passed to LocationSearchBar)
      const searchInput = document.querySelector('[data-search-input]');
      if (searchInput) {
        searchInput.focus();
        announce('Search focused. Type to search for a location.');
      }
    },
    onEscape: () => {
      // Clear focus from search
      document.activeElement?.blur();
    }
  });

  // Fetch weather data
  const { data, loading, error } = useForecast(location, days);
  const hourlyData = useHourlyForecast(location, 48);
  const currentWeather = useCurrentWeather(location);

  // Announce location changes to screen readers
  useEffect(() => {
    if (locationData?.address) {
      announce(`Location changed to ${locationData.address}`);
    }
  }, [locationData?.address, announce]);

  // Sync location with URL
  useEffect(() => {
    if (locationData?.address) {
      updateLocationUrl(locationData, true); // Use replace to avoid cluttering history
    }
  }, [locationData]);

  // Get date ranges for records and probability
  const today = new Date();
  const startDate = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const endDateObj = new Date(today);
  endDateObj.setDate(today.getDate() + days);
  const endDate = `${String(endDateObj.getMonth() + 1).padStart(2, '0')}-${String(endDateObj.getDate()).padStart(2, '0')}`;

  // Fetch climate/historical data ONLY if charts are visible
  // This prevents unnecessary API calls and helps stay within rate limits
  const thisDayHistory = useThisDayInHistory(
    visibleCharts.thisDayHistory ? location : null,
    null,
    10
  );
  const forecastComparison = useForecastComparison(
    visibleCharts.historicalComparison ? location : null,
    visibleCharts.historicalComparison ? (data?.forecast || []) : [],
    10
  );
  const recordTemps = useRecordTemperatures(
    visibleCharts.recordTemps ? location : null,
    startDate,
    endDate,
    10
  );
  const tempProbability = useTemperatureProbability(
    visibleCharts.tempProbability ? location : null,
    startDate,
    endDate,
    10
  );

  // Handle location selection from search
  const handleLocationSelect = (locationObj) => {
    selectLocation(locationObj);
    setLocationError(null);
  };

  // Handle current location detection
  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    setLocationError(null);

    try {
      const currentLoc = await getCurrentLocation();
      selectLocation(currentLoc);
    } catch (error) {
      setLocationError(error.message);
    } finally {
      setDetectingLocation(false);
    }
  };

  // Handle adding current location to favorites
  // Note: Currently unused - favorites are managed through FavoritesPanel
  // Keeping for potential future use (quick-add button in dashboard)
  // const handleToggleFavorite = () => {
  //   if (locationData) {
  //     const favorited = isFavorite(locationData.latitude, locationData.longitude);
  //     if (!favorited) {
  //       addFavorite(locationData);
  //     }
  //   }
  // };

  // Helper to convert temperature from API (Celsius) to selected unit
  const convertTemp = (tempCelsius) => {
    if (tempCelsius === null || tempCelsius === undefined) return '--';
    return unit === 'F' ? Math.round(celsiusToFahrenheit(tempCelsius)) : Math.round(tempCelsius);
  };

  // Get city name for button (extract first part of address, truncate if too long)
  const getCityName = () => {
    const address = data?.location?.address || locationData?.address || location || 'Location';
    // Extract city name (everything before first comma, or full string if no comma)
    const cityName = address.split(',')[0].trim();
    // Truncate if longer than 20 characters
    return cityName.length > 20 ? cityName.substring(0, 20) + '...' : cityName;
  };

  // Capitalize location name for proper display (in case of cached lowercase data)
  const getFormattedLocationName = () => {
    const address = data?.location?.address || locationData?.address || location || 'Unknown Location';

    // If it's all lowercase or has mixed capitalization issues, fix it
    // Split by comma and capitalize each part
    return address
      .split(',')
      .map(part => {
        part = part.trim();
        // Split by spaces and capitalize each word
        return part
          .split(' ')
          .map(word => {
            // Handle special cases (abbreviations)
            const upper = word.toUpperCase();
            if (['US', 'USA', 'UK', 'UAE', 'NSW', 'NY', 'CA', 'FL', 'TX', 'WA', 'DC'].includes(upper)) {
              return upper;
            }
            // Capitalize first letter
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          })
          .join(' ');
      })
      .join(', ');
  };

  // Count visible charts
  const visibleChartCount = Object.values(visibleCharts).filter(Boolean).length;

  return (
    <div className="weather-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <h1 className="dashboard-title">
          <a href="/" className="dashboard-title-link">
            <span className="title-icon">🌤️</span>
            Meteo Weather
          </a>
        </h1>
        <p className="dashboard-subtitle">Historical Weather Data & Forecasts</p>
      </header>

      {/* Loading State */}
      {loading && <DashboardSkeleton />}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p className="error-icon">⚠️</p>
          <p className="error-message">Error: {error}</p>
          <p className="error-hint">Please check the location and try again.</p>
        </div>
      )}

      {/* Universal Search Hero - Full Width */}
      <div className="universal-search-hero">
        <UniversalSearchBar />
      </div>

      {/* Data Display */}
      {!loading && !error && data && (
        <>
          {/* City Box and Lookup Controls - Side by Side */}
          <div className="dashboard-main-row">
            {/* Location Info with Current Conditions - 75% */}
            <div className="location-info">
              {/* Current Conditions Header */}
              <div className="section-header">
                <h3 className="section-title">
                  <span className="section-icon">🌡️</span>
                  Current Conditions
                </h3>
              </div>

              {/* Header: City name left, Coords/Timezone right */}
              <div className="location-header">
                <h2 className="location-name">
                  {getFormattedLocationName()}
                </h2>
                <p className="location-coords">
                  {data.location?.latitude?.toFixed(4) || locationData?.latitude?.toFixed(4)}, {data.location?.longitude?.toFixed(4) || locationData?.longitude?.toFixed(4)}
                  {(data.location?.timezone || locationData?.timezone) && ` • ${data.location?.timezone || locationData?.timezone}`}
                </p>
              </div>

              {/* Current Conditions - Centered */}
              {currentWeather.data && !currentWeather.loading && (
                <div className="current-conditions">
                  <div className="current-main">
                    <div className="current-temp">
                      {convertTemp(currentWeather.data.current.temperature)}°{unit}
                    </div>
                    <div className="current-details">
                      <div className="current-condition">{currentWeather.data.current.conditions}</div>
                      <div className="current-feels-like">
                        Feels like {convertTemp(currentWeather.data.current.feelsLike)}°{unit}
                      </div>
                    </div>
                  </div>

                  <div className="current-stats">
                    <div className="current-stat">
                      <span className="stat-icon">💨</span>
                      <span className="stat-value">{Math.round(currentWeather.data.current.windSpeed)} mph</span>
                      <span className="stat-label">Wind</span>
                    </div>
                    <div className="current-stat">
                      <span className="stat-icon">💧</span>
                      <span className="stat-value">{currentWeather.data.current.humidity}%</span>
                      <span className="stat-label">Humidity</span>
                    </div>
                    <div className="current-stat">
                      <span className="stat-icon">👁️</span>
                      <span className="stat-value">{currentWeather.data.current.visibility} mi</span>
                      <span className="stat-label">Visibility</span>
                    </div>
                    <div className="current-stat">
                      <span className="stat-icon">☁️</span>
                      <span className="stat-value">{currentWeather.data.current.cloudCover}%</span>
                      <span className="stat-label">Clouds</span>
                    </div>
                    <div className="current-stat">
                      <span className="stat-icon">🌧️</span>
                      <span className="stat-value">
                        {hourlyData?.data?.hourly
                          ? hourlyData.data.hourly.slice(0, 24).reduce((sum, hour) => sum + (hour.precipitation || 0), 0).toFixed(1)
                          : '0.0'
                        } mm
                      </span>
                      <span className="stat-label">24h Precip</span>
                    </div>
                  </div>

                  <div className="current-footer">
                    {data.location && (
                      <RadarMap
                        latitude={data.location.latitude}
                        longitude={data.location.longitude}
                        zoom={7.5}
                        height="350px"
                        alerts={data.alerts}
                      />
                    )}
                  </div>

                  {/* Today's Highlights */}
                  {currentWeather.data && !currentWeather.loading && data.forecast && data.forecast.length > 0 && (
                    <div className="todays-highlights">
                      <h4 className="highlights-title">Today's Highlights</h4>
                      <div className="highlights-grid">
                        {/* Sunrise/Sunset */}
                        <div className="highlight-card">
                          <div className="highlight-icon">🌅</div>
                          <div className="highlight-content">
                            <div className="highlight-label">Sunrise</div>
                            <div className="highlight-value">
                              {data.forecast[0]?.sunrise
                                ? (() => {
                                    const date = data.forecast[0].date;
                                    const time = data.forecast[0].sunrise;
                                    const dateTime = new Date(`${date}T${time}`);
                                    return dateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                                  })()
                                : '--'}
                            </div>
                          </div>
                          <div className="highlight-content">
                            <div className="highlight-label">Sunset</div>
                            <div className="highlight-value">
                              {data.forecast[0]?.sunset
                                ? (() => {
                                    const date = data.forecast[0].date;
                                    const time = data.forecast[0].sunset;
                                    const dateTime = new Date(`${date}T${time}`);
                                    return dateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                                  })()
                                : '--'}
                            </div>
                          </div>
                        </div>

                        {/* UV Index */}
                        <div className="highlight-card">
                          <div className="highlight-icon">☀️</div>
                          <div className="highlight-content">
                            <div className="highlight-label">UV Index</div>
                            <div className="highlight-value">
                              {data.forecast[0]?.uvIndex ?? currentWeather.data.current.uvIndex ?? '--'}
                            </div>
                            <div className="highlight-subtext">
                              {(() => {
                                const uv = data.forecast[0]?.uvIndex ?? currentWeather.data.current.uvIndex ?? 0;
                                if (uv <= 2) return 'Low';
                                if (uv <= 5) return 'Moderate';
                                if (uv <= 7) return 'High';
                                if (uv <= 10) return 'Very High';
                                return 'Extreme';
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Pressure */}
                        <div className="highlight-card">
                          <div className="highlight-icon">🌡️</div>
                          <div className="highlight-content">
                            <div className="highlight-label">Pressure</div>
                            <div className="highlight-value">
                              {currentWeather.data.current.pressure
                                ? `${Math.round(currentWeather.data.current.pressure)} mb`
                                : '--'}
                            </div>
                            <div className="highlight-subtext">
                              {currentWeather.data.current.pressure
                                ? currentWeather.data.current.pressure > 1013 ? 'High' : 'Low'
                                : ''}
                            </div>
                          </div>
                        </div>

                        {/* Visibility */}
                        <div className="highlight-card">
                          <div className="highlight-icon">👁️</div>
                          <div className="highlight-content">
                            <div className="highlight-label">Visibility</div>
                            <div className="highlight-value">
                              {data.forecast[0]?.visibility
                                ? `${data.forecast[0].visibility.toFixed(1)} km`
                                : currentWeather.data.current.visibility
                                ? `${currentWeather.data.current.visibility} mi`
                                : '--'}
                            </div>
                            <div className="highlight-subtext">
                              {(() => {
                                const vis = data.forecast[0]?.visibility ?? 0;
                                if (vis >= 10) return 'Excellent';
                                if (vis >= 5) return 'Good';
                                if (vis >= 2) return 'Moderate';
                                return 'Poor';
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Wind Details Section */}
                      <h4 className="highlights-title" style={{ marginTop: '12px' }}>Wind & Air</h4>
                      <div className="highlights-grid">
                        {/* Wind Speed & Direction */}
                        <div className="highlight-card">
                          <div className="highlight-icon">💨</div>
                          <div className="highlight-content">
                            <div className="highlight-label">Wind</div>
                            <div className="highlight-value">
                              {Math.round(currentWeather.data.current.windSpeed)} mph
                            </div>
                            <div className="highlight-subtext">
                              {(() => {
                                const deg = data.forecast[0]?.windDirection ?? 0;
                                const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
                                const index = Math.round(deg / 22.5) % 16;
                                return `From ${directions[index]}`;
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Cloud Cover */}
                        <div className="highlight-card">
                          <div className="highlight-icon">☁️</div>
                          <div className="highlight-content">
                            <div className="highlight-label">Cloud Cover</div>
                            <div className="highlight-value">
                              {currentWeather.data.current.cloudCover}%
                            </div>
                            <div className="highlight-subtext">
                              {(() => {
                                const cc = currentWeather.data.current.cloudCover;
                                if (cc < 20) return 'Clear';
                                if (cc < 50) return 'Partly Cloudy';
                                if (cc < 80) return 'Mostly Cloudy';
                                return 'Overcast';
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Dew Point */}
                        <div className="highlight-card">
                          <div className="highlight-icon">💧</div>
                          <div className="highlight-content">
                            <div className="highlight-label">Dew Point</div>
                            <div className="highlight-value">
                              {(() => {
                                // Calculate dew point using Magnus formula
                                const temp = currentWeather.data.current.temperature;
                                const humidity = currentWeather.data.current.humidity;
                                const a = 17.27;
                                const b = 237.7;
                                const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
                                const dewPoint = (b * alpha) / (a - alpha);
                                return unit === 'F'
                                  ? `${Math.round(celsiusToFahrenheit(dewPoint))}°F`
                                  : `${Math.round(dewPoint)}°C`;
                              })()}
                            </div>
                            <div className="highlight-subtext">
                              {(() => {
                                const temp = currentWeather.data.current.temperature;
                                const humidity = currentWeather.data.current.humidity;
                                const a = 17.27;
                                const b = 237.7;
                                const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
                                const dewPoint = (b * alpha) / (a - alpha);
                                const dewPointF = celsiusToFahrenheit(dewPoint);
                                if (dewPointF < 50) return 'Dry';
                                if (dewPointF < 60) return 'Comfortable';
                                if (dewPointF < 65) return 'Sticky';
                                if (dewPointF < 70) return 'Humid';
                                return 'Oppressive';
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Precipitation Type */}
                        <div className="highlight-card">
                          <div className="highlight-icon">
                            {data.forecast[0]?.snow > 0 ? '❄️' :
                             data.forecast[0]?.precipitation > 0 ? '🌧️' : '☀️'}
                          </div>
                          <div className="highlight-content">
                            <div className="highlight-label">Precip Type</div>
                            <div className="highlight-value">
                              {(() => {
                                if (data.forecast[0]?.snow > 0) return 'Snow';
                                if (data.forecast[0]?.precipitation > 0) return 'Rain';
                                return 'None';
                              })()}
                            </div>
                            <div className="highlight-subtext">
                              {(() => {
                                const precip = data.forecast[0]?.precipitation ?? 0;
                                const snow = data.forecast[0]?.snow ?? 0;
                                if (snow > 0) return `${snow.toFixed(1)} mm expected`;
                                if (precip > 0) return `${precip.toFixed(1)} mm expected`;
                                return 'Dry conditions';
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Weather Summary Section */}
                      <h4 className="highlights-title" style={{ marginTop: '12px' }}>Conditions</h4>
                      <div className="weather-summary-card">
                        <div className="summary-main">
                          <span className="summary-icon">{
                            data.forecast[0]?.icon === 'rain' ? '🌧️' :
                            data.forecast[0]?.icon === 'snow' ? '❄️' :
                            data.forecast[0]?.icon === 'cloudy' ? '☁️' :
                            data.forecast[0]?.icon === 'partly-cloudy-day' ? '⛅' :
                            data.forecast[0]?.icon === 'clear-day' ? '☀️' : '🌤️'
                          }</span>
                          <div className="summary-text">
                            <div className="summary-conditions">
                              {data.forecast[0]?.conditions || 'Loading...'}
                            </div>
                            <div className="summary-description">
                              {data.forecast[0]?.description || 'Fetching weather details...'}
                            </div>
                          </div>
                        </div>
                        {data.forecast[0]?.precipProbability > 0 && (
                          <div className="summary-precipitation">
                            <span className="precip-icon">💧</span>
                            <span className="precip-text">
                              {data.forecast[0].precipProbability}% chance of precipitation
                              {data.forecast[0].precipitation > 0 && ` (${data.forecast[0].precipitation.toFixed(1)} mm expected)`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          {/* Lookup Controls - 25% */}
          <div className="dashboard-controls">
            <h3 className="controls-title">Quick Actions</h3>

            <div id="location-search" className="location-search-section">
              <div className="location-actions">
                <button
                  className="location-action-button detect-location"
                  onClick={handleDetectLocation}
                  disabled={detectingLocation}
                  aria-label={detectingLocation ? 'Detecting your location...' : 'Use my current location'}
                  aria-busy={detectingLocation}
                >
                  <span aria-hidden="true">{detectingLocation ? '🔄' : '📍'}</span> {detectingLocation ? 'Detecting...' : 'Use My Location'}
                </button>
                <a
                  href="/compare"
                  className="location-action-button compare-link"
                  aria-label="Go to location comparison page"
                >
                  <span aria-hidden="true">📊</span> Compare Locations
                </a>
                <a
                  href="/ai-weather"
                  className="location-action-button ai-link"
                  aria-label="Ask AI about the weather"
                >
                  <span aria-hidden="true">🤖</span> Ask AI
                </a>
              </div>
              {locationError && (
                <div className="location-error">
                  ⚠️ {locationError}
                </div>
              )}
            </div>

            <div className="control-group">
              <label className="control-label">Temperature Unit:</label>
              <TemperatureUnitToggle />
            </div>

            {/* View Forecast Button */}
            <button
              className="view-forecast-button"
              onClick={() => document.getElementById('forecast-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              <span className="button-icon">📊</span>
              <span className="button-text">
                <strong>View {getCityName()} Forecast & Charts</strong>
                <span className="button-subtitle">Interactive weather visualizations</span>
              </span>
            </button>

            {/* Chart Navigation */}
            <div className="chart-controls-section">
              <div className="chart-controls-header">
                <h3>📊 Charts</h3>
                <div className="chart-toggle-buttons">
                  <button
                    className="toggle-all-button"
                    onClick={() => setVisibleCharts({
                      hourly: true,
                      temperature: true,
                      precipitation: true,
                      wind: true,
                      cloudCover: true,
                      uvIndex: true,
                      overview: true,
                      humidityDew: true,
                      sunriseSunset: true,
                      feelsLike: true,
                      airQuality: true,
                      thisDayHistory: true,
                      historicalComparison: true,
                      recordTemps: true,
                      tempProbability: true
                    })}
                  >
                    Show All
                  </button>
                  <button
                    className="toggle-all-button"
                    onClick={() => setVisibleCharts({
                      hourly: false,
                      temperature: false,
                      precipitation: false,
                      wind: false,
                      cloudCover: false,
                      uvIndex: false,
                      overview: false,
                      humidityDew: false,
                      sunriseSunset: false,
                      feelsLike: false,
                      airQuality: false,
                      thisDayHistory: false,
                      historicalComparison: false,
                      recordTemps: false,
                      tempProbability: false
                    })}
                  >
                    Hide All
                  </button>
                </div>
              </div>
              <div className="chart-nav-list">
                <button className="chart-nav-button" onClick={() => document.getElementById('chart-hourly')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                  🕐 48-Hour Forecast
                </button>
                <button className="chart-nav-button" onClick={() => document.getElementById('chart-temperature')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                  🌡️ Temperature Bands
                </button>
                <button className="chart-nav-button" onClick={() => document.getElementById('chart-precipitation')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                  🌧️ Precipitation
                </button>
                <button className="chart-nav-button" onClick={() => document.getElementById('chart-wind')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                  💨 Wind
                </button>
                <button className="chart-nav-button" onClick={() => document.getElementById('chart-cloudCover')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                  ☁️ Cloud Cover
                </button>
                <button className="chart-nav-button" onClick={() => document.getElementById('chart-uvIndex')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                  ☀️ UV Index
                </button>
                <button className="chart-nav-button" onClick={() => document.getElementById('chart-overview')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                  📈 Multi-Metric Overview
                </button>
                <button className="chart-nav-button" onClick={() => document.getElementById('chart-humidityDew')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                  💧 Humidity & Dewpoint
                </button>
                <button className="chart-nav-button" onClick={() => document.getElementById('chart-sunriseSunset')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                  🌅 Sunrise & Sunset
                </button>
                <button className="chart-nav-button" onClick={() => document.getElementById('chart-feelsLike')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                  🌡️ Feels Like Temperature
                </button>
                <button className="chart-nav-button" onClick={() => document.getElementById('chart-airQuality')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                  💨 Air Quality Index
                </button>

                {/* Historical/Climate section */}
                <div style={{ width: '100%', height: '1px', background: 'var(--border-light)', margin: '8px 0' }} />

                <button className="chart-nav-button" onClick={() => document.getElementById('chart-thisDayHistory')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                  📅 This Day in History
                </button>
                <button className="chart-nav-button" onClick={() => document.getElementById('chart-historicalComparison')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                  📊 Historical Comparison
                </button>
                <button className="chart-nav-button" onClick={() => document.getElementById('chart-recordTemps')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                  🏆 Record Temperatures
                </button>
                <button className="chart-nav-button" onClick={() => document.getElementById('chart-tempProbability')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                  📉 Temperature Probability
                </button>
              </div>
            </div>
          </div>
        </div>

          {/* Weather Alerts */}
          {data.alerts && data.alerts.length > 0 && (
            <WeatherAlertsBanner alerts={data.alerts} />
          )}

          {/* Forecast Section Header */}
          <div id="forecast-section" className="section-header forecast-header">
            <h3 className="section-title">
              <span className="section-icon">📊</span>
              Forecast & Charts
            </h3>
          </div>

          {/* Tab Navigation */}
          <div className="chart-tabs">
            <button
              className={`chart-tab ${activeTab === 'forecast' ? 'active' : ''}`}
              onClick={() => setActiveTab('forecast')}
            >
              📈 Forecast
            </button>
            <button
              className={`chart-tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              🔍 Details
            </button>
            <button
              className={`chart-tab ${activeTab === 'historical' ? 'active' : ''}`}
              onClick={() => setActiveTab('historical')}
            >
              📅 Historical
            </button>
            <button
              className={`chart-tab ${activeTab === 'air-quality' ? 'active' : ''}`}
              onClick={() => setActiveTab('air-quality')}
            >
              💨 Air Quality
            </button>
          </div>

          {/* Charts */}
          <div id="weather-charts" className="charts-grid" tabIndex={-1}>
            {/* FORECAST TAB */}
            {activeTab === 'forecast' && visibleCharts.hourly && (
              <div id="chart-hourly" className="chart-card chart-card-wide">
                <HourlyForecastChart
                  hourlyData={hourlyData.data?.hourly || []}
                  unit={unit}
                  height={300}
                />
              </div>
            )}

            {activeTab === 'forecast' && visibleCharts.temperature && (
              <div id="chart-temperature" className="chart-card">
                <TemperatureBandChart
                  data={data.forecast || []}
                  unit={unit}
                  height={300}
                  days={days}
                />
              </div>
            )}

            {activeTab === 'forecast' && visibleCharts.precipitation && (
              <div id="chart-precipitation" className="chart-card">
                <PrecipitationChart
                  data={data.forecast || []}
                  height={300}
                  days={days}
                />
              </div>
            )}

            {activeTab === 'forecast' && visibleCharts.wind && (
              <div id="chart-wind" className="chart-card">
                <WindChart
                  data={data.forecast || []}
                  height={300}
                  days={days}
                />
              </div>
            )}

            {/* DETAILS TAB */}
            {activeTab === 'details' && visibleCharts.cloudCover && (
              <div id="chart-cloudCover" className="chart-card">
                <CloudCoverChart
                  data={data.forecast || []}
                  height={300}
                  days={days}
                />
              </div>
            )}

            {activeTab === 'details' && visibleCharts.uvIndex && (
              <div id="chart-uvIndex" className="chart-card">
                <UVIndexChart
                  data={data.forecast || []}
                  height={300}
                  days={days}
                />
              </div>
            )}

            {activeTab === 'forecast' && visibleCharts.overview && (
              <div id="chart-overview" className="chart-card chart-card-wide">
                <WeatherOverviewChart
                  data={data.forecast || []}
                  unit={unit}
                  height={320}
                  days={days}
                />
              </div>
            )}

            {/* Enhanced Weather Charts */}
            {activeTab === 'details' && visibleCharts.humidityDew && (
              <div id="chart-humidityDew" className="chart-card">
                <HumidityDewpointChart
                  data={data.forecast || []}
                  unit={unit}
                  days={days}
                  height={300}
                />
              </div>
            )}

            {activeTab === 'details' && visibleCharts.sunriseSunset && (
              <div id="chart-sunriseSunset" className="chart-card">
                <SunChart
                  data={data.forecast || []}
                  days={days}
                  height={300}
                />
              </div>
            )}

            {activeTab === 'details' && visibleCharts.feelsLike && (
              <div id="chart-feelsLike" className="chart-card">
                <FeelsLikeChart
                  data={data.forecast || []}
                  unit={unit}
                  days={days}
                  height={300}
                />
              </div>
            )}

            {activeTab === 'air-quality' && visibleCharts.airQuality && data.location && (
              <div id="chart-airQuality" className="chart-card">
                <AirQualityCard
                  latitude={data.location.latitude}
                  longitude={data.location.longitude}
                />
              </div>
            )}

            {/* Historical/Climate Charts */}
            {activeTab === 'historical' && visibleCharts.thisDayHistory && (
              <div id="chart-thisDayHistory" className="chart-card chart-card-wide">
                <ThisDayInHistoryCard
                  historyData={thisDayHistory.data}
                  unit={unit}
                />
              </div>
            )}

            {activeTab === 'historical' && visibleCharts.historicalComparison && (
              <div id="chart-historicalComparison" className="chart-card chart-card-wide">
                <HistoricalComparisonChart
                  forecastData={data.forecast || []}
                  historicalData={forecastComparison.data || []}
                  unit={unit}
                  height={300}
                />
              </div>
            )}

            {activeTab === 'historical' && visibleCharts.recordTemps && (
              <div id="chart-recordTemps" className="chart-card chart-card-wide">
                <RecordTemperaturesChart
                  records={recordTemps.data?.records || []}
                  unit={unit}
                  height={300}
                />
              </div>
            )}

            {activeTab === 'historical' && visibleCharts.tempProbability && (
              <div id="chart-tempProbability" className="chart-card chart-card-wide">
                <TemperatureProbabilityChart
                  probabilityData={tempProbability.data}
                  unit={unit}
                  height={300}
                />
              </div>
            )}
          </div>

          {/* No charts selected message */}
          {visibleChartCount === 0 && (
            <div className="no-charts-message">
              <p>📊 No charts selected</p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Use the toggles above to show weather charts
              </p>
            </div>
          )}

          {/* API Cost Info */}
          {data.queryCost && (
            <div className="api-info">
              <p>API Query Cost: {data.queryCost}</p>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>Data provided by Visual Crossing Weather API</p>
      </footer>
    </div>
  );
}

export default WeatherDashboard;
