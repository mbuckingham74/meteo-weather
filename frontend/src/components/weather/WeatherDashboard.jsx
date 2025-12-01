/**
 * WeatherDashboard - Main weather dashboard with real data
 */
import { Wind, Droplets, Sun, Gauge, Thermometer, Eye, AlertCircle } from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';
import {
  useCurrentWeatherQuery,
  useForecastQuery,
  useHourlyForecastQuery,
} from '../../hooks/useWeatherQueries';
import { useTemperatureUnit } from '../../contexts/TemperatureUnitContext';
import { getWeatherEmoji } from '../../utils/weatherHelpers';
import CurrentConditions from './CurrentConditions';
import LocationSearch from './LocationSearch';
import HourlyForecast from './HourlyForecast';
import TemperatureChart from './TemperatureChart';
import StatCard from '../ui/StatCard';
import Card from '../ui/Card';
import TemperatureToggle from '../ui/TemperatureToggle';

function WeatherDashboard() {
  const { locationData } = useLocation();
  const { formatTemperature } = useTemperatureUnit();
  const lat = locationData?.latitude;
  const lng = locationData?.longitude;

  // Fetch current weather
  const {
    data: currentWeather,
    isLoading: isLoadingCurrent,
    error: currentError,
  } = useCurrentWeatherQuery(lat, lng);

  // Fetch 7-day forecast
  const {
    data: forecast,
    isLoading: isLoadingForecast,
    error: forecastError,
  } = useForecastQuery(lat, lng, 7);

  // Fetch hourly forecast
  const {
    data: hourlyData,
    isLoading: isLoadingHourly,
    error: hourlyError,
  } = useHourlyForecastQuery(lat, lng);

  // Support both old format (currentConditions) and new API format (current)
  const weather = currentWeather?.currentConditions || currentWeather?.current;
  const locationName = locationData?.address || locationData?.location_name;

  // Determine if we should show loading/error states for secondary sections
  const hasLocation = Boolean(lat && lng);

  return (
    <div className="min-h-screen bg-bg-primary p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header with Search and Settings */}
        <header
          className="flex items-center gap-4"
          role="search"
          aria-label="Weather search and settings"
        >
          <div className="flex-1">
            <LocationSearch />
          </div>
          <TemperatureToggle />
        </header>

        {/* Hero - Current Conditions */}
        <CurrentConditions
          weather={weather}
          location={locationName}
          isLoading={isLoadingCurrent}
          error={currentError}
        />

        {/* Stats Grid */}
        {weather && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              icon={Wind}
              label="Wind"
              value={weather.windspeed ?? weather.windSpeed ?? 0}
              unit="mph"
            />
            <StatCard icon={Droplets} label="Humidity" value={weather.humidity || 0} unit="%" />
            <StatCard icon={Sun} label="UV Index" value={weather.uvindex ?? weather.uvIndex ?? 0} />
            <StatCard
              icon={Gauge}
              label="Pressure"
              value={weather.pressure ? (weather.pressure * 0.02953).toFixed(2) : '0'}
              unit="in"
            />
            <StatCard
              icon={Thermometer}
              label="Dew Point"
              value={formatTemperature(weather.dew ?? weather.dewPoint ?? 0)}
            />
            <StatCard icon={Eye} label="Visibility" value={weather.visibility || 0} unit="mi" />
          </div>
        )}

        {/* Hourly Forecast */}
        {hasLocation && (
          <>
            {hourlyError ? (
              <Card>
                <div className="flex items-center gap-3 text-text-muted">
                  <AlertCircle size={20} className="text-secondary" />
                  <span>Unable to load hourly forecast</span>
                </div>
              </Card>
            ) : (
              <HourlyForecast hours={hourlyData?.hourly} isLoading={isLoadingHourly} />
            )}
          </>
        )}

        {/* Temperature Chart */}
        {hasLocation && (
          <>
            {forecastError && !forecast ? (
              <Card>
                <div className="flex items-center gap-3 text-text-muted">
                  <AlertCircle size={20} className="text-secondary" />
                  <span>Unable to load temperature chart</span>
                </div>
              </Card>
            ) : (
              <TemperatureChart forecast={forecast} isLoading={isLoadingForecast} />
            )}
          </>
        )}

        {/* 7-Day Forecast Preview */}
        {hasLocation && (
          <>
            {forecastError && !forecast ? (
              <Card>
                <h2 className="text-lg font-semibold text-text-primary mb-4">7-Day Forecast</h2>
                <div className="flex items-center gap-3 text-text-muted">
                  <AlertCircle size={20} className="text-secondary" />
                  <span>Unable to load forecast data</span>
                </div>
              </Card>
            ) : isLoadingForecast ? (
              <Card>
                <div className="animate-pulse">
                  <div className="h-6 w-32 bg-bg-elevated rounded mb-4" />
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin md:grid md:grid-cols-7 md:overflow-visible">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="flex-shrink-0 w-20 md:w-auto text-center p-3">
                        <div className="h-4 w-8 bg-bg-elevated rounded mx-auto mb-2" />
                        <div className="h-8 w-8 bg-bg-elevated rounded mx-auto mb-2" />
                        <div className="h-4 w-10 bg-bg-elevated rounded mx-auto mb-1" />
                        <div className="h-4 w-8 bg-bg-elevated rounded mx-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ) : (forecast?.days || forecast?.forecast) &&
              (forecast.days || forecast.forecast).length > 0 ? (
              <Card>
                <h2 className="text-lg font-semibold text-text-primary mb-4">7-Day Forecast</h2>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin md:grid md:grid-cols-7 md:overflow-visible">
                  {(forecast.days || forecast.forecast).slice(0, 7).map((day, index) => {
                    const date = new Date(day.datetime || day.date);
                    const dayName =
                      index === 0
                        ? 'Today'
                        : date.toLocaleDateString('en-US', { weekday: 'short' });

                    return (
                      <div
                        key={day.datetime || day.date}
                        className="flex-shrink-0 w-20 md:w-auto text-center p-3 rounded-xl hover:bg-bg-card-hover transition-colors"
                      >
                        <p className="text-text-muted text-sm mb-2">{dayName}</p>
                        <div className="text-2xl mb-2">{getWeatherEmoji(day.conditions)}</div>
                        <p className="text-text-primary font-semibold">
                          {formatTemperature(day.tempmax ?? day.tempMax)}
                        </p>
                        <p className="text-text-muted text-sm">
                          {formatTemperature(day.tempmin ?? day.tempMin)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export default WeatherDashboard;
