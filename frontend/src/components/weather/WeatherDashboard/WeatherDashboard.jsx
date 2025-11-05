import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useLocation } from '../../../contexts/LocationContext';
import { useTemperatureUnit } from '../../../contexts/TemperatureUnitContext';
import { useAuth } from '../../../contexts/AuthContext';
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
import DashboardSkeleton from '../../common/DashboardSkeleton';
import UniversalSearchBar from '../../ai/UniversalSearchBar';
import LocationConfirmationModal from '../../location/LocationConfirmationModal';
import CurrentConditionsSection from './CurrentConditionsSection';
import QuickActionsPanel from './QuickActionsPanel';
import ChartsGrid from './ChartsGrid';
import '../WeatherDashboard.css';

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
  const { isAuthenticated } = useAuth();
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
  const [visibleCharts, setVisibleCharts] = useState({
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

  // Get city name for button (extract first part of address, truncate if too long)
  const getCityName = () => {
    const address = data?.location?.address || locationData?.address || location || 'Location';
    const cityName = address.split(',')[0].trim();
    return cityName.length > 20 ? cityName.substring(0, 20) + '...' : cityName;
  };

  // Format location name to show city name (extracted from address)
  const getFormattedLocationName = () => {
    const address =
      data?.location?.address || locationData?.address || location || 'Unknown Location';

    // If it's coordinates (lat,lon pattern), show "Your Location" as fallback
    if (/^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(address)) {
      return 'Your Location';
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
            <CurrentConditionsSection
              locationData={locationData}
              data={data}
              currentWeather={currentWeather}
              hourlyData={hourlyData}
              unit={unit}
              convertTemp={convertTemp}
              getFormattedLocationName={getFormattedLocationName}
            />

            {/* Lookup Controls - 25% */}
            <QuickActionsPanel
              detectingLocation={detectingLocation}
              locationError={locationError}
              isAuthenticated={isAuthenticated}
              visibleCharts={visibleCharts}
              handleDetectLocation={handleDetectLocation}
              setVisibleCharts={setVisibleCharts}
              getCityName={getCityName}
            />
          </div>

          {/* Weather Alerts */}
          {data.alerts && data.alerts.length > 0 && <WeatherAlertsBanner alerts={data.alerts} />}

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
