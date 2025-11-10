import { useState, useEffect } from 'react';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useLocation } from '../../../contexts/LocationContext';
import { useTemperatureUnit } from '../../../contexts/TemperatureUnitContext';
import { useForecast, useHourlyForecast, useCurrentWeather } from '../../../hooks/useWeatherData';
import {
  useThisDayInHistory,
  useForecastComparison,
  useRecordTemperatures,
  useTemperatureProbability,
} from '../../../hooks/useClimateData';
import { getCurrentLocation } from '../../../services/geolocationService';
import { celsiusToFahrenheit } from '../../../utils/weatherHelpers';
import { createLocationSlug } from '../../../utils/urlHelpers';
import useKeyboardShortcuts, {
  useScreenReaderAnnouncement,
} from '../../../hooks/useKeyboardShortcuts';
import useLocationConfirmation from '../../../hooks/useLocationConfirmation';
import { WEATHER_CONFIG } from '../../../constants/weather';
import WeatherAlertsBanner from '../WeatherAlertsBanner';
import UniversalSearchBar from '../../ai/UniversalSearchBar';
import LocationConfirmationModal from '../../location/LocationConfirmationModal';
import RadarMap from '../RadarMap';
import TodaysHighlights from './TodaysHighlights';
import ChartsGrid from './ChartsGrid';
import { Button, Grid, Stack, Surface } from '@components/ui/primitives';
import '../WeatherDashboard.css';
import HeroControls from './HeroControls';

/**
 * Weather Dashboard Component
 * Main dashboard displaying weather charts and data
 *
 * REFACTORED: Split into focused sub-components for better maintainability
 */
function WeatherDashboard() {
  // Use shared location state from context
  const { location, locationData, selectLocation } = useLocation();
  const { unit } = useTemperatureUnit();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

  const days = 7; // Default forecast days for charts
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [activeTab, setActiveTab] = useState('forecast');
  const [hasAttemptedGeolocation, setHasAttemptedGeolocation] = useState(false);

  // Location confirmation hook (VPN/IP detection)
  const locationConfirmation = useLocationConfirmation(selectLocation);

  // Chart visibility state
  const [visibleCharts] = useState({
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
    historicalComparison: false,
    recordTemps: false,
    tempProbability: false,
  });

  // Screen reader announcements
  const { announce } = useScreenReaderAnnouncement();

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onFocusSearch: () => {
      const searchInput = document.querySelector('[data-search-input]');
      if (searchInput) {
        searchInput.focus();
        announce('Search focused. Type to search for a location.');
      }
    },
    onEscape: () => {
      document.activeElement?.blur();
    },
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

  // Announce weather data loading status to screen readers
  useEffect(() => {
    if (loading) {
      announce('Loading weather data...');
    } else if (error) {
      announce(`Error loading weather data: ${error}`);
    } else if (data) {
      announce('Weather data loaded successfully');
    }
  }, [loading, error, data, announce]);

  // Auto-detect location on home page if no location saved
  useEffect(() => {
    const isHomePage = routerLocation.pathname === '/';
    const hasNoSavedLocation = !locationData || !locationData.latitude;

    if (isHomePage && hasNoSavedLocation && !hasAttemptedGeolocation) {
      setHasAttemptedGeolocation(true);
      setDetectingLocation(true);
      setLocationError(null);

      getCurrentLocation()
        .then((currentLoc) => {
          if (currentLoc.requiresConfirmation) {
            locationConfirmation.requestConfirmation(currentLoc);
          } else {
            selectLocation(currentLoc);
          }
        })
        .catch((error) => {
          setLocationError(error.message);
        })
        .finally(() => {
          setDetectingLocation(false);
        });
    }
  }, [
    routerLocation.pathname,
    locationData,
    hasAttemptedGeolocation,
    selectLocation,
    locationConfirmation,
  ]);

  // Sync location with URL (but don't redirect from home page)
  useEffect(() => {
    if (locationData?.address) {
      const slug = createLocationSlug(locationData.address);
      const targetPath = `/location/${slug}`;

      if (routerLocation.pathname !== targetPath && routerLocation.pathname !== '/') {
        navigate(targetPath, {
          replace: true,
          state: { location: locationData },
        });
      }
    }
  }, [locationData, navigate, routerLocation.pathname]);

  // Get date ranges for records and probability
  const today = new Date();
  const startDate = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const endDateObj = new Date(today);
  endDateObj.setDate(today.getDate() + days);
  const endDate = `${String(endDateObj.getMonth() + 1).padStart(2, '0')}-${String(endDateObj.getDate()).padStart(2, '0')}`;

  // Fetch climate/historical data ONLY if charts are visible
  const thisDayHistory = useThisDayInHistory(
    visibleCharts.thisDayHistory ? location : null,
    null,
    10
  );
  const forecastComparison = useForecastComparison(
    visibleCharts.historicalComparison ? location : null,
    visibleCharts.historicalComparison ? data?.forecast || [] : [],
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

  // Handle current location detection
  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    setLocationError(null);

    try {
      const currentLoc = await getCurrentLocation();

      if (currentLoc.requiresConfirmation) {
        locationConfirmation.requestConfirmation(currentLoc);
      } else {
        selectLocation(currentLoc);
      }
    } catch (error) {
      setLocationError(error.message);
    } finally {
      setDetectingLocation(false);
    }
  };

  // Helper to convert temperature from API (Celsius) to selected unit
  const convertTemp = (tempCelsius) => {
    if (tempCelsius === null || tempCelsius === undefined) return '--';
    return unit === 'F' ? Math.round(celsiusToFahrenheit(tempCelsius)) : Math.round(tempCelsius);
  };

  // Format location name to show city name (extracted from address)
  const getFormattedLocationName = () => {
    // CRITICAL FIX: Prioritize API-resolved address over stored coordinates
    // The API (via Nominatim reverse geocoding) resolves coordinates to city names
    // We should use that resolved name, not fall back to showing "Your Location"
    // See docs/troubleshooting/OLD_LOCATION_BUG_FIX.md for context

    // Check if API has returned a resolved address (not coordinates)
    const apiAddress = data?.location?.address;
    const isApiAddressResolved = apiAddress && !/^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(apiAddress);

    // Use API-resolved address if available, otherwise fall back to stored data
    const address = isApiAddressResolved
      ? apiAddress
      : locationData?.address || location || 'Unknown Location';

    // If it's coordinates (lat,lon pattern), show "Your Location" as user-friendly display
    // NOTE: This is for DISPLAY ONLY - the coordinates are still sent to the API for accurate weather
    // See docs/troubleshooting/OLD_LOCATION_BUG_FIX.md for full context
    if (/^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(address)) {
      // If API has a displayName, use that instead of "Your Location"
      if (data?.location?.displayName) {
        return data.location.displayName;
      }
      return 'Your Location';
    }

    // If address is a placeholder or generic name (API couldn't resolve it)
    // This fixes cached "Old Location" values from earlier API responses
    if (/^(old location|location|unknown|coordinates?|unnamed)$/i.test(address.trim())) {
      return data?.location?.displayName || locationData?.displayName || 'Your Location';
    }

    // If address is the generic fallback, use displayName if available
    if (address === 'Your Location' || address === 'Unknown Location') {
      return data?.location?.displayName || locationData?.displayName || address;
    }

    // Extract just the city name (first part before comma)
    const cityName = address.split(',')[0].trim();

    // Capitalize properly (handle special cases)
    return cityName
      .split(' ')
      .map((word) => {
        const upper = word.toUpperCase();
        if (WEATHER_CONFIG.TIMEZONE_ABBREVIATIONS.includes(upper)) {
          return upper;
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };

  return (
    <div className="weather-dashboard">
      {/* Main page heading for accessibility */}
      <h1 className="sr-only">Meteo Weather Dashboard</h1>

      {/* Live region for screen reader announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {loading && 'Loading weather data...'}
        {error && `Error: ${error}`}
        {!loading && !error && data && 'Weather data loaded'}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading weather data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p className="error-icon">⚠️</p>
          <p className="error-message">Error: {error}</p>
          <p className="error-hint">Please check the location and try again.</p>
        </div>
      )}

      {/* Data Display */}
      {!loading && !error && data && (
        <>
          {/* UNIFIED HERO CARD - Everything in one place */}
          <Surface
            as="section"
            padding="none"
            radius="lg"
            elevation="xl"
            className="unified-hero-card"
          >
            {/* Search Section */}
            <Surface
              as="div"
              padding="md"
              background="var(--bg-secondary)"
              border="transparent"
              className="hero-search-section"
            >
              <UniversalSearchBar />
            </Surface>

            {/* Main Weather Display - Two Column Layout */}
            <Grid
              as="div"
              columns={{ base: 1, lg: 2 }}
              gap="lg"
              align="start"
              className="hero-weather-display"
            >
              {/* LEFT COLUMN: Weather Info */}
              <Stack as="div" gap="md" className="hero-left-column">
                {/* Location Header */}
                <Stack as="div" gap="xs" className="hero-location-header">
                  <h2 className="hero-location-name">{getFormattedLocationName()}</h2>
                  <p className="hero-location-coords">
                    {data.location?.latitude?.toFixed(4) || locationData?.latitude?.toFixed(4)},{' '}
                    {data.location?.longitude?.toFixed(4) || locationData?.longitude?.toFixed(4)}
                    {(data.location?.timezone || locationData?.timezone) &&
                      ` • ${data.location?.timezone || locationData?.timezone}`}
                  </p>
                </Stack>

                {/* Current Temperature & Conditions */}
                {currentWeather?.data && !currentWeather.loading && (
                  <div className="hero-current-conditions">
                    <div className="hero-temp-main">
                      <div className="hero-temperature">
                        {convertTemp(currentWeather.data.current.temperature)}°{unit}
                      </div>
                      <div className="hero-feels-like">
                        Feels like {convertTemp(currentWeather.data.current.feelsLike)}°{unit}
                      </div>
                    </div>

                    {/* Quick Stats Bar - Compact 5 column with conditions */}
                    <Grid
                      as="div"
                      columns={{ base: 2, md: 3, xl: 5 }}
                      gap="xs"
                      className="hero-quick-stats"
                    >
                      <div className="hero-stat">
                        <span className="hero-stat-icon" aria-hidden="true">
                          {currentWeather.data.current.conditions?.toLowerCase().includes('rain')
                            ? '🌧️'
                            : currentWeather.data.current.conditions
                                  ?.toLowerCase()
                                  .includes('cloud')
                              ? '☁️'
                              : currentWeather.data.current.conditions
                                    ?.toLowerCase()
                                    .includes('clear')
                                ? '☀️'
                                : '🌤️'}
                        </span>
                        <span className="hero-stat-value">
                          {currentWeather.data.current.conditions}
                        </span>
                        <span className="hero-stat-label">Conditions</span>
                      </div>
                      <div className="hero-stat">
                        <span className="hero-stat-icon" aria-hidden="true">
                          💧
                        </span>
                        <span className="hero-stat-value">
                          {data.forecast?.[0]?.precipProbability ?? 0}%
                        </span>
                        <span className="hero-stat-label">Precip Chance</span>
                      </div>
                      <div className="hero-stat">
                        <span className="hero-stat-icon" aria-hidden="true">
                          💨
                        </span>
                        <span className="hero-stat-value">
                          {Math.round(currentWeather.data.current.windSpeed)} mph
                        </span>
                        <span className="hero-stat-label">Wind</span>
                      </div>
                      <div className="hero-stat">
                        <span className="hero-stat-icon" aria-hidden="true">
                          💧
                        </span>
                        <span className="hero-stat-value">
                          {currentWeather.data.current.humidity}%
                        </span>
                        <span className="hero-stat-label">Humidity</span>
                      </div>
                      <div className="hero-stat">
                        <span className="hero-stat-icon" aria-hidden="true">
                          🌧️
                        </span>
                        <span className="hero-stat-value">
                          {hourlyData?.data?.hourly
                            ? hourlyData.data.hourly
                                .slice(0, 24)
                                .reduce((sum, hour) => sum + (hour.precipitation || 0), 0)
                                .toFixed(1)
                            : '0.0'}{' '}
                          mm
                        </span>
                        <span className="hero-stat-label">24h Precip</span>
                      </div>
                    </Grid>
                  </div>
                )}

                {/* Today's Highlights - Compact */}
                {data.forecast && data.forecast.length > 0 && currentWeather?.data && (
                  <div className="hero-highlights-section">
                    <h4 className="hero-section-title">Today&apos;s Highlights</h4>
                    <TodaysHighlights
                      currentWeather={currentWeather.data}
                      forecast={data.forecast}
                      unit={unit}
                    />
                  </div>
                )}

                {/* Quick Actions - Compact */}
                <HeroControls
                  detectingLocation={detectingLocation}
                  handleDetectLocation={handleDetectLocation}
                  locationError={locationError}
                />
              </Stack>

              {/* RIGHT COLUMN: Radar Map */}
              <Stack as="div" gap="md" className="hero-right-column">
                {data.location && (
                  <div className="hero-radar-section">
                    <RadarMap
                      latitude={data.location.latitude}
                      longitude={data.location.longitude}
                      zoom={7.5}
                      height={600}
                      alerts={data.alerts}
                    />
                  </div>
                )}
              </Stack>
            </Grid>
          </Surface>

          {/* Weather Alerts */}
          {data.alerts && data.alerts.length > 0 && <WeatherAlertsBanner alerts={data.alerts} />}

          {/* Forecast Section Header */}
          <div id="forecast-section" className="section-header forecast-header">
            <h3 className="section-title">
              <span className="section-icon" aria-hidden="true">
                📊
              </span>
              Forecast & Charts
            </h3>
          </div>

          {/* Tab Navigation */}
          <div className="chart-tabs" role="tablist" aria-label="Chart categories">
            <Button
              variant="ghost"
              size="sm"
              className={`chart-tab ${activeTab === 'forecast' ? 'active' : ''}`}
              onClick={() => setActiveTab('forecast')}
              role="tab"
              aria-selected={activeTab === 'forecast'}
              aria-controls="chart-content"
            >
              <span aria-hidden="true">📈</span> Forecast
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`chart-tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
              role="tab"
              aria-selected={activeTab === 'details'}
              aria-controls="chart-content"
            >
              <span aria-hidden="true">🔍</span> Details
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`chart-tab ${activeTab === 'historical' ? 'active' : ''}`}
              onClick={() => setActiveTab('historical')}
              role="tab"
              aria-selected={activeTab === 'historical'}
              aria-controls="chart-content"
            >
              <span aria-hidden="true">📅</span> Historical
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`chart-tab ${activeTab === 'air-quality' ? 'active' : ''}`}
              onClick={() => setActiveTab('air-quality')}
              role="tab"
              aria-selected={activeTab === 'air-quality'}
              aria-controls="chart-content"
            >
              <span aria-hidden="true">💨</span> Air Quality
            </Button>
          </div>

          {/* Charts */}
          <div id="chart-content" role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
            <ChartsGrid
              activeTab={activeTab}
              visibleCharts={visibleCharts}
              data={data}
              hourlyData={hourlyData}
              thisDayHistory={thisDayHistory}
              forecastComparison={forecastComparison}
              recordTemps={recordTemps}
              tempProbability={tempProbability}
              unit={unit}
              days={days}
            />
          </div>

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

      {/* Location Confirmation Modal (VPN/IP Detection) */}
      {locationConfirmation.showModal && locationConfirmation.pendingLocation && (
        <LocationConfirmationModal
          location={locationConfirmation.pendingLocation}
          onConfirm={locationConfirmation.handleConfirm}
          onReject={() => locationConfirmation.handleReject(false)}
          onClose={() => locationConfirmation.handleClose(true, locationData?.latitude != null)}
        />
      )}
    </div>
  );
}

export default WeatherDashboard;
