/**
 * Weather Dashboard - Bento Grid Layout
 * Main page with current conditions, forecast, and weather stats
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from '../contexts/LocationContext';
import {
  useCurrentWeatherQuery,
  useForecastQuery,
  useHourlyForecastQuery,
  useHistoricalWeatherQuery,
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
  Calendar,
  TrendingUp,
  ChevronLeft,
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
  const [activeContentTab, setActiveContentTab] = useState('today'); // today, hourly, 10day, history
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [airQualityLoading, setAirQualityLoading] = useState(false);
  const searchRef = useRef(null);

  // Fetch weather data using React Query hooks
  const {
    data: weather,
    isLoading: weatherLoading,
    error: weatherError,
  } = useCurrentWeatherQuery(locationData?.latitude, locationData?.longitude, {
    enabled: Boolean(locationData?.latitude && locationData?.longitude),
  });

  const { data: forecast } = useForecastQuery(locationData?.latitude, locationData?.longitude, 10, {
    enabled: Boolean(locationData?.latitude && locationData?.longitude),
  });

  const { data: hourlyData } = useHourlyForecastQuery(
    locationData?.latitude,
    locationData?.longitude,
    48,
    {
      enabled: Boolean(locationData?.latitude && locationData?.longitude),
    }
  );

  // Calculate dates for historical data (last 5 days for table)
  const historicalDates = useMemo(() => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Yesterday
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 5); // 5 days ago
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    };
  }, []);

  // State for trend graph date range (30 days default, user can extend back)
  const [trendRangeStart, setTrendRangeStart] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // 30 days ago
    return date.toISOString().split('T')[0];
  });

  // Calculate trend dates for 30-day graph
  const trendDates = useMemo(() => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Yesterday
    return {
      start: trendRangeStart,
      end: endDate.toISOString().split('T')[0],
    };
  }, [trendRangeStart]);

  const { data: historicalData, isLoading: historicalLoading } = useHistoricalWeatherQuery(
    locationData?.latitude,
    locationData?.longitude,
    historicalDates.start,
    historicalDates.end,
    {
      enabled:
        Boolean(locationData?.latitude && locationData?.longitude) &&
        activeContentTab === 'history',
    }
  );

  // Trend data query (30+ days for the graph)
  const { data: trendData, isLoading: trendLoading } = useHistoricalWeatherQuery(
    locationData?.latitude,
    locationData?.longitude,
    trendDates.start,
    trendDates.end,
    {
      enabled:
        Boolean(locationData?.latitude && locationData?.longitude) &&
        activeContentTab === 'history',
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
  const hourlyHours = hourlyData?.hourly || hourlyData?.hours || forecastDays?.[0]?.hours || [];
  const historicalDays = historicalData?.days || historicalData?.historical || [];
  const trendDays = trendData?.days || trendData?.historical || [];

  // Handle trend range change (for draggable date selector)
  const handleTrendRangeChange = useCallback((newStartDate) => {
    setTrendRangeStart(newStartDate);
  }, []);

  // Calculate how far back we can go (backend typically has ~1 year of data)
  const minTrendDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1); // 1 year back max
    return date.toISOString().split('T')[0];
  }, []);

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

      {/* Main Content Tabs - Controls the entire right column */}
      <div className="content-tabs">
        <button
          onClick={() => setActiveContentTab('today')}
          className={`content-tab ${activeContentTab === 'today' ? 'active' : ''}`}
        >
          Today
        </button>
        <button
          onClick={() => setActiveContentTab('hourly')}
          className={`content-tab ${activeContentTab === 'hourly' ? 'active' : ''}`}
        >
          Hourly
        </button>
        <button
          onClick={() => setActiveContentTab('10day')}
          className={`content-tab ${activeContentTab === '10day' ? 'active' : ''}`}
        >
          10-Day
        </button>
        <button
          onClick={() => setActiveContentTab('history')}
          className={`content-tab ${activeContentTab === 'history' ? 'active' : ''}`}
        >
          History
        </button>
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
          {/* Left Column - Current Weather Summary (stays fixed) */}
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
          </div>

          {/* Right Column - Main Content Area (changes based on tab) */}
          <div className="col-8 main-content-area">
            {/* TODAY TAB - Radar map + today's hourly preview */}
            {activeContentTab === 'today' && (
              <div className="tab-content today-tab-content">
                <div className="card radar-card-large">
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
                </div>
                {/* Today's hourly preview below radar */}
                <div className="card today-hourly-preview">
                  <h4 className="tab-content-title">Today&apos;s Forecast</h4>
                  <div className="today-hours-grid">
                    {hourlyHours.slice(0, 8).map((hour, i) => {
                      const hourTime = hour.time || hour.datetime;
                      let displayTime = `${i}:00`;
                      if (hourTime) {
                        const dateStr = hourTime.includes('T')
                          ? hourTime
                          : `2000-01-01T${hourTime}`;
                        const parsed = new Date(dateStr);
                        if (!isNaN(parsed.getTime())) {
                          displayTime = parsed.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            hour12: true,
                          });
                        }
                      }
                      return (
                        <div key={i} className="hour-card">
                          <span className="hour-time">{displayTime}</span>
                          <div className="hour-icon">
                            {getWeatherIcon(hour.conditions || hour.icon, 20)}
                          </div>
                          <span className="hour-temp">
                            {convertTemp(hour.temp || hour.temperature, unit)}°
                          </span>
                          <div className="hour-precip">
                            <Droplets size={10} />
                            <span>
                              {Math.round(hour.precipprob || hour.precipProbability || 0)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* HOURLY TAB - Full 48-hour scrollable list */}
            {activeContentTab === 'hourly' && (
              <div className="tab-content hourly-tab-content">
                <div className="card hourly-card-full">
                  <h3 className="tab-content-title-large">48-Hour Forecast</h3>
                  <div className="hourly-list-full">
                    {hourlyHours.map((hour, i) => {
                      const hourTime = hour.time || hour.datetime;
                      let displayTime = `${i}:00`;
                      let displayDate = '';
                      if (hourTime) {
                        const dateStr = hourTime.includes('T')
                          ? hourTime
                          : `2000-01-01T${hourTime}`;
                        const parsed = new Date(dateStr);
                        if (!isNaN(parsed.getTime())) {
                          displayTime = parsed.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            hour12: true,
                          });
                          // Show day label for first hour of each day
                          if (i === 0) {
                            displayDate = 'Today';
                          } else if (hourTime.includes('T')) {
                            const currentDate = new Date(hourTime).toDateString();
                            const prevHour = hourlyHours[i - 1];
                            const prevTime = prevHour?.time || prevHour?.datetime;
                            if (prevTime?.includes('T')) {
                              const prevDate = new Date(prevTime).toDateString();
                              if (currentDate !== prevDate) {
                                displayDate = new Date(hourTime).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                });
                              }
                            }
                          }
                        }
                      }
                      const precipProb = Math.round(hour.precipprob || hour.precipProbability || 0);
                      const windSpeed = Math.round(hour.windspeed || hour.windSpeed || 0);
                      const humidity = Math.round(hour.humidity || 0);

                      return (
                        <div key={i}>
                          {displayDate && (
                            <div className="hourly-date-separator">{displayDate}</div>
                          )}
                          <div className={`hourly-row-full ${i === 0 ? 'now' : ''}`}>
                            <div className="hourly-time-col">
                              <span className="hourly-time-text">
                                {i === 0 ? 'Now' : displayTime}
                              </span>
                            </div>
                            <div className="hourly-icon-col">
                              {getWeatherIcon(hour.conditions || hour.icon, 24)}
                            </div>
                            <div className="hourly-temp-col">
                              <span className="hourly-temp-large">
                                {convertTemp(hour.temp || hour.temperature, unit)}°
                              </span>
                            </div>
                            <div className="hourly-precip-col">
                              <Droplets size={14} />
                              <span>{precipProb}%</span>
                            </div>
                            <div className="hourly-wind-col">
                              <Wind size={14} />
                              <span>{windSpeed} mph</span>
                            </div>
                            <div className="hourly-humidity-col">
                              <Droplets size={14} className="humidity-icon-small" />
                              <span>{humidity}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 10-DAY TAB - Full extended forecast */}
            {activeContentTab === '10day' && (
              <div className="tab-content tenday-tab-content">
                <div className="card tenday-card-full">
                  <h3 className="tab-content-title-large">10-Day Forecast</h3>
                  <div className="tenday-list-full">
                    {forecastDays.slice(0, 10).map((day, i) => {
                      const precipProb =
                        day.precipProbability || day.precipprob || day.precip_prob || 0;
                      const windSpeed = Math.round(day.windspeed || day.windSpeed || 0);
                      const date = new Date(
                        day.date?.includes('T') || day.datetime?.includes('T')
                          ? day.date || day.datetime
                          : `${day.date || day.datetime}T12:00:00`
                      );
                      const dateStr = date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      });
                      const highTemp = convertTemp(day.tempMax || day.tempmax, unit);
                      const lowTemp = convertTemp(day.tempMin || day.tempmin, unit);

                      return (
                        <div key={i} className={`tenday-row-full ${i === 0 ? 'today' : ''}`}>
                          <div className="tenday-day-col">
                            <span className="tenday-day-name">
                              {formatDay(day.date || day.datetime, i)}
                            </span>
                            <span className="tenday-date">{dateStr}</span>
                          </div>
                          <div className="tenday-icon-col">
                            {getWeatherIcon(day.conditions, 28)}
                          </div>
                          <div className="tenday-temps-col">
                            <span className="tenday-high">{highTemp}°</span>
                            <div className="tenday-temp-bar">
                              <div
                                className="tenday-temp-bar-fill"
                                style={{
                                  left: `${Math.max(0, ((lowTemp - 20) / 80) * 100)}%`,
                                  width: `${Math.max(5, ((highTemp - lowTemp) / 80) * 100)}%`,
                                }}
                              />
                            </div>
                            <span className="tenday-low">{lowTemp}°</span>
                          </div>
                          <div className="tenday-precip-col">
                            <Droplets size={14} />
                            <span>{Math.round(precipProb)}%</span>
                          </div>
                          <div className="tenday-wind-col">
                            <Wind size={14} />
                            <span>{windSpeed} mph</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* HISTORY TAB - Charts and historical data */}
            {activeContentTab === 'history' && (
              <div className="tab-content history-tab-content">
                {/* Past 5 Days Table */}
                <div className="card history-card-full">
                  <h3 className="tab-content-title-large">Recent Weather</h3>
                  <p className="history-subtitle">Past 5 Days</p>

                  {historicalLoading && (
                    <div className="history-loading-full">
                      <Loader size={32} className="spin" />
                      <span>Loading historical data...</span>
                    </div>
                  )}

                  {!historicalLoading && historicalDays.length === 0 && (
                    <div className="history-empty-full">
                      <CloudRain size={48} />
                      <p>No historical data available</p>
                    </div>
                  )}

                  {!historicalLoading && historicalDays.length > 0 && (
                    <div className="history-details-list">
                      {historicalDays.map((day, i) => {
                        const date = new Date(day.datetime || day.date);
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                        const dateStr = date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        });

                        return (
                          <div key={i} className="history-detail-row">
                            <div className="history-detail-date">
                              <span className="history-detail-day">{dayName}</span>
                              <span className="history-detail-datestr">{dateStr}</span>
                            </div>
                            <div className="history-detail-icon">
                              {getWeatherIcon(day.conditions, 24)}
                            </div>
                            <div className="history-detail-temps">
                              <span className="temp-high">
                                {convertTemp(day.tempmax || day.tempMax, unit)}°
                              </span>
                              <span className="temp-separator">/</span>
                              <span className="temp-low">
                                {convertTemp(day.tempmin || day.tempMin, unit)}°
                              </span>
                            </div>
                            <div className="history-detail-stats">
                              <span className="history-stat">
                                <Droplets size={12} />
                                {(day.precip || day.precipitation || 0).toFixed(2)} in
                              </span>
                              <span className="history-stat">
                                <Wind size={12} />
                                {Math.round(day.windspeed || day.windSpeed || 0)} mph
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Trend Graph Section */}
                <div className="card history-trend-card">
                  <div className="trend-header">
                    <div className="trend-title-section">
                      <TrendingUp size={20} />
                      <h3 className="trend-title">Weather Trends</h3>
                    </div>
                    <div className="trend-range-selector">
                      <Calendar size={16} />
                      <input
                        type="date"
                        className="trend-date-input"
                        value={trendRangeStart}
                        min={minTrendDate}
                        max={
                          new Date(Date.now() - 31 * 24 * 60 * 60 * 1000)
                            .toISOString()
                            .split('T')[0]
                        }
                        onChange={(e) => handleTrendRangeChange(e.target.value)}
                      />
                      <span className="trend-range-label">to Yesterday</span>
                    </div>
                  </div>

                  {/* Quick range buttons */}
                  <div className="trend-range-buttons">
                    <button
                      className={`trend-range-btn ${
                        (() => {
                          const thirtyDaysAgo = new Date();
                          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                          return trendRangeStart === thirtyDaysAgo.toISOString().split('T')[0];
                        })()
                          ? 'active'
                          : ''
                      }`}
                      onClick={() => {
                        const date = new Date();
                        date.setDate(date.getDate() - 30);
                        handleTrendRangeChange(date.toISOString().split('T')[0]);
                      }}
                    >
                      30 Days
                    </button>
                    <button
                      className={`trend-range-btn ${
                        (() => {
                          const sixtyDaysAgo = new Date();
                          sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
                          return trendRangeStart === sixtyDaysAgo.toISOString().split('T')[0];
                        })()
                          ? 'active'
                          : ''
                      }`}
                      onClick={() => {
                        const date = new Date();
                        date.setDate(date.getDate() - 60);
                        handleTrendRangeChange(date.toISOString().split('T')[0]);
                      }}
                    >
                      60 Days
                    </button>
                    <button
                      className={`trend-range-btn ${
                        (() => {
                          const ninetyDaysAgo = new Date();
                          ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                          return trendRangeStart === ninetyDaysAgo.toISOString().split('T')[0];
                        })()
                          ? 'active'
                          : ''
                      }`}
                      onClick={() => {
                        const date = new Date();
                        date.setDate(date.getDate() - 90);
                        handleTrendRangeChange(date.toISOString().split('T')[0]);
                      }}
                    >
                      90 Days
                    </button>
                    <button
                      className={`trend-range-btn ${
                        (() => {
                          const sixMonthsAgo = new Date();
                          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                          return trendRangeStart === sixMonthsAgo.toISOString().split('T')[0];
                        })()
                          ? 'active'
                          : ''
                      }`}
                      onClick={() => {
                        const date = new Date();
                        date.setMonth(date.getMonth() - 6);
                        handleTrendRangeChange(date.toISOString().split('T')[0]);
                      }}
                    >
                      6 Months
                    </button>
                    <button
                      className={`trend-range-btn ${
                        (() => {
                          const oneYearAgo = new Date();
                          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                          return trendRangeStart === oneYearAgo.toISOString().split('T')[0];
                        })()
                          ? 'active'
                          : ''
                      }`}
                      onClick={() => {
                        const date = new Date();
                        date.setFullYear(date.getFullYear() - 1);
                        handleTrendRangeChange(date.toISOString().split('T')[0]);
                      }}
                    >
                      1 Year
                    </button>
                  </div>

                  {trendLoading && (
                    <div className="trend-loading">
                      <Loader size={24} className="spin" />
                      <span>Loading trend data...</span>
                    </div>
                  )}

                  {!trendLoading && trendDays.length === 0 && (
                    <div className="trend-empty">
                      <CloudRain size={32} />
                      <p>No trend data available for this period</p>
                    </div>
                  )}

                  {!trendLoading && trendDays.length > 0 && (
                    <>
                      {/* Temperature Trend Graph */}
                      <div className="trend-chart-section">
                        <h4 className="trend-chart-title">Temperature Trend</h4>
                        <div className="trend-chart-container">
                          <div className="trend-y-axis">
                            {(() => {
                              const temps = trendDays.flatMap((d) => [
                                convertTemp(d.tempmax || d.tempMax, unit),
                                convertTemp(d.tempmin || d.tempMin, unit),
                              ]);
                              const maxTemp = Math.max(...temps);
                              const minTemp = Math.min(...temps);
                              const range = maxTemp - minTemp || 20;
                              const step = Math.ceil(range / 4);
                              return [0, 1, 2, 3, 4].map((i) => (
                                <span key={i} className="trend-y-label">
                                  {Math.round(maxTemp - i * step)}°
                                </span>
                              ));
                            })()}
                          </div>
                          <div className="trend-graph-area">
                            <svg
                              className="trend-svg"
                              viewBox={`0 0 ${trendDays.length * 12} 120`}
                              preserveAspectRatio="none"
                            >
                              {/* High temperature line */}
                              <polyline
                                className="trend-line trend-line-high"
                                fill="none"
                                stroke="var(--color-accent-red)"
                                strokeWidth="2"
                                points={trendDays
                                  .map((d, i) => {
                                    const temps = trendDays.flatMap((day) => [
                                      convertTemp(day.tempmax || day.tempMax, unit),
                                      convertTemp(day.tempmin || day.tempMin, unit),
                                    ]);
                                    const maxTemp = Math.max(...temps);
                                    const minTemp = Math.min(...temps);
                                    const range = maxTemp - minTemp || 20;
                                    const high = convertTemp(d.tempmax || d.tempMax, unit);
                                    const y = 110 - ((high - minTemp) / range) * 100;
                                    return `${i * 12 + 6},${y}`;
                                  })
                                  .join(' ')}
                              />
                              {/* Low temperature line */}
                              <polyline
                                className="trend-line trend-line-low"
                                fill="none"
                                stroke="var(--color-accent-blue)"
                                strokeWidth="2"
                                points={trendDays
                                  .map((d, i) => {
                                    const temps = trendDays.flatMap((day) => [
                                      convertTemp(day.tempmax || day.tempMax, unit),
                                      convertTemp(day.tempmin || day.tempMin, unit),
                                    ]);
                                    const maxTemp = Math.max(...temps);
                                    const minTemp = Math.min(...temps);
                                    const range = maxTemp - minTemp || 20;
                                    const low = convertTemp(d.tempmin || d.tempMin, unit);
                                    const y = 110 - ((low - minTemp) / range) * 100;
                                    return `${i * 12 + 6},${y}`;
                                  })
                                  .join(' ')}
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="trend-legend">
                          <span className="trend-legend-item">
                            <span
                              className="trend-legend-color"
                              style={{ backgroundColor: 'var(--color-accent-red)' }}
                            />
                            High
                          </span>
                          <span className="trend-legend-item">
                            <span
                              className="trend-legend-color"
                              style={{ backgroundColor: 'var(--color-accent-blue)' }}
                            />
                            Low
                          </span>
                        </div>
                      </div>

                      {/* Precipitation Trend Graph */}
                      <div className="trend-chart-section">
                        <h4 className="trend-chart-title">Precipitation Trend</h4>
                        <div className="trend-chart-container">
                          <div className="trend-y-axis">
                            {(() => {
                              const precips = trendDays.map(
                                (d) => d.precip || d.precipitation || 0
                              );
                              const maxPrecip = Math.max(...precips, 0.5);
                              return [0, 1, 2, 3, 4].map((i) => (
                                <span key={i} className="trend-y-label">
                                  {(maxPrecip - (i * maxPrecip) / 4).toFixed(1)}&quot;
                                </span>
                              ));
                            })()}
                          </div>
                          <div className="trend-graph-area">
                            <svg
                              className="trend-svg precip-svg"
                              viewBox={`0 0 ${trendDays.length * 12} 120`}
                              preserveAspectRatio="none"
                            >
                              {/* Precipitation bars */}
                              {trendDays.map((d, i) => {
                                const precips = trendDays.map(
                                  (day) => day.precip || day.precipitation || 0
                                );
                                const maxPrecip = Math.max(...precips, 0.5);
                                const precip = d.precip || d.precipitation || 0;
                                const height = (precip / maxPrecip) * 100;
                                return (
                                  <rect
                                    key={i}
                                    className="trend-precip-bar"
                                    x={i * 12 + 2}
                                    y={110 - height}
                                    width="8"
                                    height={height}
                                    fill="var(--color-accent-cyan)"
                                    rx="1"
                                  />
                                );
                              })}
                            </svg>
                          </div>
                        </div>
                        <div className="trend-x-axis">
                          {trendDays.length > 0 && (
                            <>
                              <span>
                                {new Date(
                                  trendDays[0].datetime || trendDays[0].date
                                ).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                              <span>
                                {new Date(
                                  trendDays[Math.floor(trendDays.length / 2)]?.datetime ||
                                    trendDays[Math.floor(trendDays.length / 2)]?.date
                                ).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                              <span>
                                {new Date(
                                  trendDays[trendDays.length - 1].datetime ||
                                    trendDays[trendDays.length - 1].date
                                ).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Summary stats */}
                      <div className="trend-summary">
                        <div className="trend-stat">
                          <span className="trend-stat-label">Avg High</span>
                          <span className="trend-stat-value">
                            {Math.round(
                              trendDays.reduce(
                                (sum, d) => sum + convertTemp(d.tempmax || d.tempMax, unit),
                                0
                              ) / trendDays.length
                            )}
                            °
                          </span>
                        </div>
                        <div className="trend-stat">
                          <span className="trend-stat-label">Avg Low</span>
                          <span className="trend-stat-value">
                            {Math.round(
                              trendDays.reduce(
                                (sum, d) => sum + convertTemp(d.tempmin || d.tempMin, unit),
                                0
                              ) / trendDays.length
                            )}
                            °
                          </span>
                        </div>
                        <div className="trend-stat">
                          <span className="trend-stat-label">Total Precip</span>
                          <span className="trend-stat-value">
                            {trendDays
                              .reduce((sum, d) => sum + (d.precip || d.precipitation || 0), 0)
                              .toFixed(2)}
                            &quot;
                          </span>
                        </div>
                        <div className="trend-stat">
                          <span className="trend-stat-label">Rainy Days</span>
                          <span className="trend-stat-value">
                            {
                              trendDays.filter((d) => (d.precip || d.precipitation || 0) > 0.01)
                                .length
                            }
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
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
