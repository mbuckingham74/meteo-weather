/**
 * Weather Dashboard - Bento Grid Layout
 * Main page with current conditions, forecast, and weather stats
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from '../contexts/LocationContext';
import {
  useCurrentWeatherQuery,
  useForecastQuery,
  useHourlyForecastQuery,
} from '../hooks/useWeatherQueries';
import { useTemperatureUnit } from '../contexts/TemperatureUnitContext';
import { geocodeLocation, getAirQuality } from '../services/weatherApi';
import { getCurrentLocation } from '../services/geolocationService';
import {
  Search,
  MapPin,
  Locate,
  Droplets,
  Eye,
  Sun,
  CloudRain,
  Navigation,
  ChevronRight,
  Cloud,
  CloudSun,
  CloudSnow,
  CloudLightning,
  Sunrise,
  Sunset,
  Loader,
  Wind,
  Activity,
  AlertTriangle,
  Heart,
} from 'lucide-react';
import RadarMap from '../components/RadarMap';
import './WeatherDashboard.css';

// Weather icon mapping
const getWeatherIcon = (conditions, size = 24) => {
  const props = { size, strokeWidth: 1.5 };
  const condition = conditions?.toLowerCase() || '';

  if (condition.includes('thunder') || condition.includes('storm')) {
    return <CloudLightning {...props} style={{ color: 'var(--color-accent-purple)' }} />;
  }
  if (condition.includes('snow') || condition.includes('sleet') || condition.includes('ice')) {
    return <CloudSnow {...props} style={{ color: 'var(--color-accent-cyan)' }} />;
  }
  if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower')) {
    return <CloudRain {...props} style={{ color: 'var(--color-accent-blue)' }} />;
  }
  if (condition.includes('cloud') || condition.includes('overcast')) {
    return <Cloud {...props} style={{ color: 'var(--color-text-secondary)' }} />;
  }
  if (condition.includes('partly') || condition.includes('partial')) {
    return <CloudSun {...props} style={{ color: 'var(--color-accent-yellow)' }} />;
  }
  return <Sun {...props} style={{ color: 'var(--color-accent-yellow)' }} />;
};

// Temperature conversion helper
// API returns temperatures in Celsius (metric), convert to F when needed
const convertTemp = (temp, unit) => {
  if (temp == null || isNaN(temp)) return '--';
  if (unit === 'F') {
    return Math.round((temp * 9) / 5 + 32);
  }
  return Math.round(temp);
};

// Format day name
const formatDay = (datetime, index) => {
  if (index === 0) return 'Today';
  if (!datetime) return '';
  const date = new Date(datetime.includes('T') ? datetime : `${datetime}T12:00:00`);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * Get color for pollutant level based on EPA AQI breakpoints
 * Returns CSS variable name for consistent theming
 * Breakpoints based on EPA standards (updated 2024)
 * Note: Open-Meteo returns µg/m³ for all pollutants
 */
const getPollutantColor = (pollutant, value) => {
  if (value == null || isNaN(value)) return 'var(--color-text-tertiary)';

  // EPA AQI breakpoints converted to µg/m³ where needed
  const thresholds = {
    // PM2.5: Good <9, Moderate 9-35.4, Unhealthy Sensitive 35.5-55.4, Unhealthy 55.5+
    pm2_5: { good: 9, moderate: 35.4, unhealthySensitive: 55.4, unhealthy: 125.4 },
    // PM10: Good <54, Moderate 55-154, Unhealthy Sensitive 155-254, Unhealthy 255+
    pm10: { good: 54, moderate: 154, unhealthySensitive: 254, unhealthy: 354 },
    // Ozone: Good <100, Moderate 100-160, Unhealthy Sensitive 160-200, Unhealthy 200+ (µg/m³)
    ozone: { good: 100, moderate: 160, unhealthySensitive: 200, unhealthy: 300 },
    // NO2: Good <40, Moderate 40-100, Unhealthy Sensitive 100-200, Unhealthy 200+ (µg/m³)
    nitrogenDioxide: { good: 40, moderate: 100, unhealthySensitive: 200, unhealthy: 400 },
    // SO2: Good <40, Moderate 40-80, Unhealthy Sensitive 80-150, Unhealthy 150+ (µg/m³)
    sulphurDioxide: { good: 40, moderate: 80, unhealthySensitive: 150, unhealthy: 250 },
    // CO: Good <4400, Moderate 4400-9400, Unhealthy Sensitive 9400-12400, Unhealthy 12400+ (µg/m³)
    carbonMonoxide: { good: 4400, moderate: 9400, unhealthySensitive: 12400, unhealthy: 15400 },
  };

  const t = thresholds[pollutant];
  if (!t) return 'var(--color-text-primary)';

  if (value <= t.good) return 'var(--color-accent-green)';
  if (value <= t.moderate) return 'var(--color-accent-yellow)';
  if (value <= t.unhealthySensitive) return 'var(--color-accent-orange)';
  return 'var(--color-accent-red)';
};

/**
 * Get color for AQI value based on EPA standards
 * @param {number} aqi - AQI value (0-500+)
 * @returns {string} CSS color variable
 */
const getAQIColor = (aqi) => {
  if (aqi == null || isNaN(aqi)) return 'var(--color-text-tertiary)';
  if (aqi <= 50) return 'var(--color-accent-green)';
  if (aqi <= 100) return 'var(--color-accent-yellow)';
  if (aqi <= 150) return 'var(--color-accent-orange)';
  return 'var(--color-accent-red)';
};

export default function WeatherDashboard() {
  const { locationData, selectLocation } = useLocation();
  const { unit, setUnitBasedOnLocation } = useTemperatureUnit();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState('forecast');
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [airQualityLoading, setAirQualityLoading] = useState(false);
  const [activeTimeTab, setActiveTimeTab] = useState('today');
  const [highlightedDay, setHighlightedDay] = useState(null);
  const searchRef = useRef(null);
  const forecastRef = useRef(null);

  // Fetch weather data using React Query hooks
  const {
    data: weather,
    isLoading: weatherLoading,
    error: weatherError,
  } = useCurrentWeatherQuery(locationData?.latitude, locationData?.longitude, {
    enabled: Boolean(locationData?.latitude && locationData?.longitude),
  });

  const { data: forecast } = useForecastQuery(locationData?.latitude, locationData?.longitude, 7, {
    enabled: Boolean(locationData?.latitude && locationData?.longitude),
  });

  const { data: hourlyData } = useHourlyForecastQuery(
    locationData?.latitude,
    locationData?.longitude,
    24,
    {
      enabled: Boolean(locationData?.latitude && locationData?.longitude),
    }
  );

  // Auto-set temperature unit based on initial location (from localStorage)
  useEffect(() => {
    if (locationData?.address) {
      setUnitBasedOnLocation(locationData.address);
    }
  }, []); // Only run on mount

  // Fetch air quality data when tab is switched or location changes
  useEffect(() => {
    const fetchAirQuality = async () => {
      if (activeTab !== 'airQuality' || !locationData?.latitude || !locationData?.longitude) {
        return;
      }
      setAirQualityLoading(true);
      try {
        const data = await getAirQuality(locationData.latitude, locationData.longitude);
        setAirQualityData(data);
      } catch (error) {
        console.error('Failed to fetch air quality:', error);
        setAirQualityData(null);
      } finally {
        setAirQualityLoading(false);
      }
    };
    fetchAirQuality();
  }, [activeTab, locationData?.latitude, locationData?.longitude]);

  // Handle "Use My Location" click
  const handleUseMyLocation = useCallback(async () => {
    setLocating(true);
    setLocationError(null);
    try {
      const location = await getCurrentLocation();
      selectLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        city: location.address?.split(',')[0] || 'Your Location',
      });
      // Auto-set temperature unit based on location (US = F, others = C)
      setUnitBasedOnLocation(location.address);
    } catch (error) {
      setLocationError(error.message);
    } finally {
      setLocating(false);
    }
  }, [selectLocation, setUnitBasedOnLocation]);

  // Debounced search
  useEffect(() => {
    const searchLocations = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      const results = await geocodeLocation(searchQuery, 5);
      setSearchResults(results || []);
    };

    const timeoutId = setTimeout(searchLocations, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle time tab clicks - scroll to forecast and highlight relevant day
  const handleTimeTabClick = useCallback((tab) => {
    setActiveTimeTab(tab);

    // Scroll to forecast section
    if (forecastRef.current) {
      forecastRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Set highlighted day based on tab
    if (tab === 'tomorrow') {
      setHighlightedDay(1);
      // Clear highlight after animation
      setTimeout(() => setHighlightedDay(null), 2000);
    } else if (tab === 'next7') {
      setHighlightedDay('all');
      setTimeout(() => setHighlightedDay(null), 2000);
    } else {
      setHighlightedDay(0);
      setTimeout(() => setHighlightedDay(null), 2000);
    }
  }, []);

  const handleSelectLocation = useCallback(
    (result) => {
      const address = result.address || result.display_name || result.name;
      selectLocation({
        latitude: result.latitude || result.lat,
        longitude: result.longitude || result.lon,
        address: address,
        city: result.address?.split(',')[0] || result.name || result.address,
      });
      // Auto-set temperature unit based on location (US = F, others = C)
      setUnitBasedOnLocation(address);
      setSearchQuery('');
      setSearchResults([]);
      setShowResults(false);
    },
    [selectLocation, setUnitBasedOnLocation]
  );

  // Extract data from API responses (handle both nested and flat structures)
  const currentWeather = weather?.current || weather;
  const forecastDays = forecast?.forecast || forecast?.days || [];
  // hourlyHours available for future hourly display
  const _hourlyHours =
    hourlyData?.hourly?.slice(0, 6) ||
    hourlyData?.hours?.slice(0, 6) ||
    forecastDays?.[0]?.hours?.slice(0, 6) ||
    [];

  // Current time for display
  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="dashboard">
      {/* Top Bar - Location & Search */}
      <div className="dashboard-topbar">
        <div className="location-display">
          <MapPin size={18} />
          <span className="location-name">
            {locationData?.city || locationData?.address?.split(',')[0] || 'Select Location'}
          </span>
        </div>

        {/* Search & Location */}
        <div className="search-actions">
          {/* Use My Location Button */}
          <button
            onClick={handleUseMyLocation}
            disabled={locating}
            className="btn btn-secondary locate-btn"
            title="Use my location"
          >
            {locating ? <Loader size={16} className="spin" /> : <Locate size={16} />}
          </button>

          {/* Search */}
          <div className="search-container" ref={searchRef}>
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search City"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                className="input search-input"
              />
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.map((result, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectLocation(result)}
                    className="search-result"
                  >
                    <MapPin size={16} />
                    <span>{result.address || result.display_name || result.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location Error */}
      {locationError && (
        <div
          className="card"
          style={{
            marginBottom: 'var(--space-4)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-surface-300)',
          }}
        >
          <p style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)' }}>
            {locationError}
          </p>
        </div>
      )}

      {/* Time Tabs */}
      <div className="time-tabs">
        <button
          onClick={() => handleTimeTabClick('today')}
          className={`time-tab ${activeTimeTab === 'today' ? 'active' : ''}`}
        >
          Today
        </button>
        <button
          onClick={() => handleTimeTabClick('tomorrow')}
          className={`time-tab ${activeTimeTab === 'tomorrow' ? 'active' : ''}`}
        >
          Tomorrow
        </button>
        <button
          onClick={() => handleTimeTabClick('next7')}
          className={`time-tab ${activeTimeTab === 'next7' ? 'active' : ''}`}
        >
          Next 7 days
        </button>

        <div className="tab-spacer" />

        <div className="tab-list">
          <button
            onClick={() => setActiveTab('forecast')}
            className={`tab ${activeTab === 'forecast' ? 'active' : ''}`}
          >
            Forecast
          </button>
          <button
            onClick={() => setActiveTab('airQuality')}
            className={`tab ${activeTab === 'airQuality' ? 'active' : ''}`}
          >
            Air Quality
          </button>
        </div>
      </div>

      {/* Loading State */}
      {weatherLoading && (
        <div className="loading-grid">
          <div className="col-3 loading-card">
            <div className="skeleton skeleton-line w-24" />
            <div className="skeleton skeleton-line h-20 w-32" />
            <div className="skeleton skeleton-line w-40" />
          </div>
          <div className="col-6">
            <div className="forecast-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="loading-card">
                  <div className="skeleton skeleton-line w-12" style={{ width: 48 }} />
                  <div className="skeleton skeleton-line h-8" style={{ height: 24 }} />
                  <div className="skeleton skeleton-line w-10" style={{ width: 40 }} />
                </div>
              ))}
            </div>
          </div>
          <div className="col-3 loading-card">
            <div className="skeleton skeleton-line w-32" />
            <div className="skeleton skeleton-line h-40" />
          </div>
        </div>
      )}

      {/* Error State */}
      {weatherError && (
        <div className="card error-card">
          <CloudRain size={48} className="error-icon" />
          <h2 className="error-title">Unable to load weather data</h2>
          <p className="error-text">Please check your connection and try again</p>
        </div>
      )}

      {/* Main Content - Bento Grid */}
      {currentWeather && !weatherLoading && (
        <div className="bento-grid">
          {/* Left Column - Current Weather + Forecast */}
          <div className="col-4 left-column">
            {/* Current Weather Card */}
            <div className="card current-weather">
              <div className="current-weather-header">
                <span className="current-day">
                  {now.toLocaleDateString('en-US', { weekday: 'long' })}
                </span>
                <span className="current-time">{currentTime}</span>
              </div>

              <div className="current-weather-main">
                <div>
                  <div className="temperature-display">
                    {convertTemp(currentWeather.temperature || currentWeather.temp, unit)}°
                  </div>
                  <p className="conditions-text">
                    {currentWeather.conditions || currentWeather.description || 'Clear'}
                  </p>
                </div>
                <div className="weather-icon-large">
                  {getWeatherIcon(currentWeather.conditions || currentWeather.description, 64)}
                </div>
              </div>

              <div className="current-weather-details">
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Real Feel</span>
                    <span className="detail-value">
                      {convertTemp(currentWeather.feelsLike || currentWeather.feelslike, unit)}°
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Wind</span>
                    <span className="detail-value">
                      {Math.round(currentWeather.windSpeed || currentWeather.windspeed || 0)} mph
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Pressure</span>
                    <span className="detail-value">
                      {Math.round(currentWeather.pressure || 1013)} MB
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Humidity</span>
                    <span className="detail-value">{currentWeather.humidity || 0}%</span>
                  </div>
                </div>
                {forecastDays?.[0]?.sunrise && (
                  <div className="sun-times">
                    <div className="sun-time">
                      <Sunrise size={12} style={{ color: 'var(--color-accent-yellow)' }} />
                      <span className="detail-value">
                        {forecastDays[0].sunrise?.slice(0, 5) || forecastDays[0].sunrise}
                      </span>
                    </div>
                    <div className="sun-time">
                      <Sunset size={12} style={{ color: 'var(--color-accent-orange)' }} />
                      <span className="detail-value">
                        {forecastDays[0].sunset?.slice(0, 5) || forecastDays[0].sunset}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 7-Day Forecast - Below Current Weather */}
            <div className="forecast-column" ref={forecastRef}>
              {forecastDays.slice(0, 6).map((day, i) => {
                const precipProb = day.precipProbability || day.precipprob || day.precip_prob || 0;
                const isHighlighted = highlightedDay === i || highlightedDay === 'all';
                return (
                  <div
                    key={i}
                    className={`card card-hover forecast-card-horizontal ${i === 0 ? 'today' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                  >
                    <p className="forecast-day">{formatDay(day.date || day.datetime, i)}</p>
                    <div className="forecast-icon">{getWeatherIcon(day.conditions, 24)}</div>
                    <div className="forecast-temps">
                      <span className="forecast-high">
                        {convertTemp(day.tempMax || day.tempmax, unit)}°
                      </span>
                      <span className="forecast-low">
                        {convertTemp(day.tempMin || day.tempmin, unit)}°
                      </span>
                    </div>
                    <div className="forecast-precip">
                      <Droplets size={12} />
                      <span>{Math.round(precipProb)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Radar Map or Air Quality Display */}
          <div className="col-8 card radar-card-large">
            {activeTab === 'forecast' ? (
              <>
                <div className="radar-header">
                  <h3>Radar</h3>
                  <span className="radar-live">LIVE</span>
                </div>
                <div className="radar-map-container-large">
                  <RadarMap
                    latitude={locationData?.latitude}
                    longitude={locationData?.longitude}
                    height="100%"
                  />
                </div>
              </>
            ) : (
              <div className="air-quality-display">
                <div className="aqi-header">
                  <h3>Air Quality Index</h3>
                  <Activity size={20} />
                </div>

                {airQualityLoading && (
                  <div className="aqi-loading">
                    <Loader size={32} className="spin" />
                    <p>Loading air quality data...</p>
                  </div>
                )}

                {!airQualityLoading && !airQualityData && (
                  <div className="aqi-error">
                    <AlertTriangle size={48} />
                    <p>Unable to load air quality data</p>
                    <p className="aqi-error-hint">Please try again later</p>
                  </div>
                )}

                {!airQualityLoading && airQualityData?.current && (
                  <>
                    {/* Main AQI Display */}
                    <div
                      className="aqi-main"
                      style={{
                        '--aqi-color': getAQIColor(
                          airQualityData.current.usAQI || airQualityData.current.europeanAQI
                        ),
                      }}
                    >
                      <div className="aqi-value-container">
                        <span className="aqi-value">
                          {airQualityData.current.usAQI ||
                            airQualityData.current.europeanAQI ||
                            '--'}
                        </span>
                        <span className="aqi-label">US AQI</span>
                      </div>
                      <div className="aqi-level">
                        <span
                          className="aqi-level-badge"
                          style={{
                            backgroundColor: getAQIColor(
                              airQualityData.current.usAQI || airQualityData.current.europeanAQI
                            ),
                          }}
                        >
                          {airQualityData.current.aqiLevel?.level || 'Unknown'}
                        </span>
                        <p className="aqi-description">
                          {airQualityData.current.aqiLevel?.description}
                        </p>
                      </div>
                    </div>

                    {/* Health Recommendations */}
                    {airQualityData.current.healthRecommendation?.length > 0 && (
                      <div className="aqi-health">
                        <div className="aqi-health-header">
                          <Heart size={16} />
                          <span>Health Recommendations</span>
                        </div>
                        <ul className="aqi-health-list">
                          {airQualityData.current.healthRecommendation.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Pollutant Breakdown */}
                    <div className="pollutants-grid">
                      <div
                        className="pollutant-card"
                        style={{
                          '--pollutant-color': getPollutantColor(
                            'pm2_5',
                            airQualityData.current.pm2_5
                          ),
                        }}
                      >
                        <span className="pollutant-name">PM2.5</span>
                        <span className="pollutant-value">
                          {airQualityData.current.pm2_5?.toFixed(1) || '--'}
                        </span>
                        <span className="pollutant-unit">µg/m³</span>
                      </div>
                      <div
                        className="pollutant-card"
                        style={{
                          '--pollutant-color': getPollutantColor(
                            'pm10',
                            airQualityData.current.pm10
                          ),
                        }}
                      >
                        <span className="pollutant-name">PM10</span>
                        <span className="pollutant-value">
                          {airQualityData.current.pm10?.toFixed(1) || '--'}
                        </span>
                        <span className="pollutant-unit">µg/m³</span>
                      </div>
                      <div
                        className="pollutant-card"
                        style={{
                          '--pollutant-color': getPollutantColor(
                            'ozone',
                            airQualityData.current.ozone
                          ),
                        }}
                      >
                        <span className="pollutant-name">Ozone</span>
                        <span className="pollutant-value">
                          {airQualityData.current.ozone?.toFixed(1) || '--'}
                        </span>
                        <span className="pollutant-unit">µg/m³</span>
                      </div>
                      <div
                        className="pollutant-card"
                        style={{
                          '--pollutant-color': getPollutantColor(
                            'nitrogenDioxide',
                            airQualityData.current.nitrogenDioxide
                          ),
                        }}
                      >
                        <span className="pollutant-name">NO₂</span>
                        <span className="pollutant-value">
                          {airQualityData.current.nitrogenDioxide?.toFixed(1) || '--'}
                        </span>
                        <span className="pollutant-unit">µg/m³</span>
                      </div>
                      <div
                        className="pollutant-card"
                        style={{
                          '--pollutant-color': getPollutantColor(
                            'sulphurDioxide',
                            airQualityData.current.sulphurDioxide
                          ),
                        }}
                      >
                        <span className="pollutant-name">SO₂</span>
                        <span className="pollutant-value">
                          {airQualityData.current.sulphurDioxide?.toFixed(1) || '--'}
                        </span>
                        <span className="pollutant-unit">µg/m³</span>
                      </div>
                      <div
                        className="pollutant-card"
                        style={{
                          '--pollutant-color': getPollutantColor(
                            'carbonMonoxide',
                            airQualityData.current.carbonMonoxide
                          ),
                        }}
                      >
                        <span className="pollutant-name">CO</span>
                        <span className="pollutant-value">
                          {airQualityData.current.carbonMonoxide?.toFixed(0) || '--'}
                        </span>
                        <span className="pollutant-unit">µg/m³</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Section Header - Today's Overview */}
          <div className="section-header">
            <h2 className="section-title">Today&apos;s Overview</h2>
          </div>

          {/* Wind Status */}
          <div className="col-3 card card-hover stat-card">
            <h3>Wind Status</h3>
            <div className="stat-content">
              <div>
                <span className="stat-value">
                  {(currentWeather.windSpeed || currentWeather.windspeed || 0).toFixed(1)}
                </span>
                <span className="stat-unit">km/h</span>
              </div>
              {currentWeather.windDirection && (
                <div className="stat-secondary">
                  <Navigation
                    size={16}
                    style={{
                      color: 'var(--color-accent-blue)',
                      transform: `rotate(${currentWeather.windDirection}deg)`,
                      display: 'inline-block',
                    }}
                  />
                  <span style={{ marginLeft: 4 }}>{currentWeather.windDirection}°</span>
                </div>
              )}
            </div>
            <div className="stat-bar">
              <div
                className="stat-bar-fill"
                style={{ width: `${Math.min(((currentWeather.windSpeed || 0) / 50) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* UV Index */}
          <div className="col-3 card card-hover stat-card">
            <h3>UV Index</h3>
            <div className="uv-gauge">
              <div className="uv-gauge-container">
                <svg viewBox="0 0 100 60" className="uv-gauge-svg">
                  <path
                    d="M 10 55 A 40 40 0 0 1 90 55"
                    fill="none"
                    stroke="var(--color-surface-300)"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 10 55 A 40 40 0 0 1 90 55"
                    fill="none"
                    stroke="url(#uvGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${((currentWeather.uvIndex || 0) / 11) * 126} 126`}
                  />
                  <defs>
                    <linearGradient id="uvGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--color-accent-green)" />
                      <stop offset="50%" stopColor="var(--color-accent-yellow)" />
                      <stop offset="100%" stopColor="var(--color-accent-red)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="uv-gauge-value">
                  <span className="uv-number">{(currentWeather.uvIndex || 0).toFixed(1)}</span>
                  <span className="uv-label">UV</span>
                </div>
              </div>
            </div>
          </div>

          {/* Humidity */}
          <div className="col-3 card card-hover stat-card">
            <h3>Humidity</h3>
            <div className="humidity-content">
              <Droplets size={48} className="humidity-icon" />
              <div>
                <span className="stat-value">{currentWeather.humidity || 0}%</span>
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div className="col-3 card card-hover stat-card">
            <h3>Visibility</h3>
            <div className="visibility-content">
              <Eye size={32} className="visibility-icon" />
              <div>
                <span className="stat-value">{(currentWeather.visibility || 10).toFixed(0)}</span>
                <span className="stat-unit">km</span>
                {currentWeather.visibility < 5 && (
                  <p className="visibility-warning">Reduced visibility</p>
                )}
              </div>
            </div>
          </div>

          {/* Other Cities Section */}
          <div className="col-3" style={{ marginTop: 'var(--space-2)' }}>
            <div className="cities-header">
              <h2 className="cities-title">Other Cities</h2>
              <button className="cities-see-all">
                See All <ChevronRight size={14} />
              </button>
            </div>

            <div className="cities-list">
              {[
                { name: 'Beijing', country: 'China', condition: 'Cloudy' },
                { name: 'California', country: 'US', condition: 'Windy' },
                { name: 'Dubai', country: 'Arab Emirates', condition: 'Mostly Sunny' },
              ].map((city, i) => (
                <div key={i} className="card card-hover city-card">
                  <div>
                    <p className="city-country">{city.country}</p>
                    <p className="city-name">{city.name}</p>
                    <p className="city-condition">{city.condition}</p>
                  </div>
                  {getWeatherIcon(city.condition, 24)}
                </div>
              ))}
            </div>
          </div>

          {/* Promo Card */}
          <div className="col-6 card promo-card">
            <div className="promo-content">
              <h3 className="promo-title">Explore global map of wind weather</h3>
              <p className="promo-text">View real-time weather conditions across the world</p>
              <button className="btn btn-success">GET STARTED</button>
            </div>
            <div className="promo-bg">
              <Cloud size={192} />
            </div>
          </div>

          {/* Additional city card */}
          <div className="col-3 card card-hover city-card">
            <div>
              <p className="city-country">Canada</p>
              <p className="city-name">Charlottetown</p>
              <p className="city-condition">Light Snow</p>
            </div>
            {getWeatherIcon('snow', 24)}
          </div>
        </div>
      )}

      {/* No Location Selected - Show US Weather Overview */}
      {!locationData && !weatherLoading && (
        <div className="welcome-overview">
          {/* Hero Welcome Section */}
          <div className="welcome-hero">
            <div className="welcome-hero-content">
              <h1 className="welcome-title">Weather at a Glance</h1>
              <p className="welcome-subtitle">
                Get started by selecting your location or explore conditions across major cities
              </p>
              <button
                onClick={handleUseMyLocation}
                disabled={locating}
                className="btn btn-primary btn-lg"
              >
                {locating ? (
                  <>
                    <Loader size={18} className="spin" />
                    Detecting Location...
                  </>
                ) : (
                  <>
                    <Locate size={18} />
                    Use My Location
                  </>
                )}
              </button>
            </div>
            <div className="welcome-hero-graphic">
              <Sun size={120} style={{ color: 'var(--color-accent-yellow)', opacity: 0.3 }} />
            </div>
          </div>

          {/* US Cities Weather Grid */}
          <div className="section-header">
            <h2 className="section-title">Current Conditions</h2>
          </div>

          <div className="bento-grid">
            {[
              {
                city: 'New York',
                state: 'NY',
                temp: 45,
                condition: 'Partly Cloudy',
                high: 48,
                low: 38,
              },
              { city: 'Los Angeles', state: 'CA', temp: 68, condition: 'Sunny', high: 72, low: 55 },
              { city: 'Chicago', state: 'IL', temp: 38, condition: 'Cloudy', high: 41, low: 32 },
              { city: 'Houston', state: 'TX', temp: 62, condition: 'Clear', high: 67, low: 52 },
              { city: 'Phoenix', state: 'AZ', temp: 71, condition: 'Sunny', high: 76, low: 54 },
              { city: 'Seattle', state: 'WA', temp: 48, condition: 'Rain', high: 50, low: 42 },
              {
                city: 'Denver',
                state: 'CO',
                temp: 42,
                condition: 'Partly Cloudy',
                high: 47,
                low: 28,
              },
              { city: 'Miami', state: 'FL', temp: 78, condition: 'Sunny', high: 82, low: 68 },
            ].map((city) => (
              <div
                key={city.city}
                className="col-3 card card-hover city-overview-card"
                onClick={() => {
                  setSearchQuery(city.city);
                  setShowResults(true);
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="city-overview-header">
                  <div>
                    <p className="city-overview-name">{city.city}</p>
                    <p className="city-overview-state">{city.state}</p>
                  </div>
                  {getWeatherIcon(city.condition, 32)}
                </div>
                <div className="city-overview-temp">{convertTemp(city.temp, unit)}°</div>
                <p className="city-overview-condition">{city.condition}</p>
                <div className="city-overview-range">
                  <span className="city-high">H: {convertTemp(city.high, unit)}°</span>
                  <span className="city-low">L: {convertTemp(city.low, unit)}°</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Tips */}
          <div className="welcome-tips">
            <div className="tip-card">
              <Search size={24} style={{ color: 'var(--color-primary)' }} />
              <h3>Search Any City</h3>
              <p>Type a city name in the search bar above</p>
            </div>
            <div className="tip-card">
              <Locate size={24} style={{ color: 'var(--color-accent-green)' }} />
              <h3>Auto-Detect Location</h3>
              <p>Click the location button for local weather</p>
            </div>
            <div className="tip-card">
              <CloudRain size={24} style={{ color: 'var(--color-accent-blue)' }} />
              <h3>Detailed Forecasts</h3>
              <p>Get hourly and 7-day predictions</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
