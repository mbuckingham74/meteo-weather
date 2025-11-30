/**
 * WeatherDashboard - Main weather dashboard with real data
 */
import { Wind, Droplets, Sun, Gauge, Thermometer, Eye } from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';
import { useCurrentWeatherQuery, useForecastQuery } from '../../hooks/useWeatherQueries';
import CurrentConditions from './CurrentConditions';
import LocationSearch from './LocationSearch';
import StatCard from '../ui/StatCard';
import Card from '../ui/Card';

function WeatherDashboard() {
  const { locationData } = useLocation();
  const lat = locationData?.latitude;
  const lng = locationData?.longitude;

  // Fetch current weather
  const {
    data: currentWeather,
    isLoading: isLoadingCurrent,
    error: currentError,
  } = useCurrentWeatherQuery(lat, lng);

  // Fetch 7-day forecast
  const { data: forecast, isLoading: isLoadingForecast } = useForecastQuery(lat, lng, 7);

  const weather = currentWeather?.currentConditions;
  const locationName = locationData?.address || locationData?.location_name;

  return (
    <div className="min-h-screen bg-bg-primary p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Search */}
        <LocationSearch />

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
            <StatCard icon={Wind} label="Wind" value={weather.windspeed || 0} unit="mph" />
            <StatCard icon={Droplets} label="Humidity" value={weather.humidity || 0} unit="%" />
            <StatCard icon={Sun} label="UV Index" value={weather.uvindex || 0} />
            <StatCard
              icon={Gauge}
              label="Pressure"
              value={weather.pressure ? (weather.pressure * 0.02953).toFixed(2) : '0'}
              unit="in"
            />
            <StatCard
              icon={Thermometer}
              label="Dew Point"
              value={Math.round(weather.dew || 0)}
              unit="°"
            />
            <StatCard icon={Eye} label="Visibility" value={weather.visibility || 0} unit="mi" />
          </div>
        )}

        {/* 7-Day Forecast Preview */}
        {forecast?.days && forecast.days.length > 0 && (
          <Card>
            <h2 className="text-lg font-semibold text-text-primary mb-4">7-Day Forecast</h2>
            <div className="grid grid-cols-7 gap-2">
              {forecast.days.slice(0, 7).map((day, index) => {
                const date = new Date(day.datetime);
                const dayName =
                  index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });

                return (
                  <div
                    key={day.datetime}
                    className="text-center p-3 rounded-xl hover:bg-bg-card-hover transition-colors"
                  >
                    <p className="text-text-muted text-sm mb-2">{dayName}</p>
                    <div className="text-2xl mb-2">{getWeatherEmoji(day.conditions)}</div>
                    <p className="text-text-primary font-semibold">{Math.round(day.tempmax)}°</p>
                    <p className="text-text-muted text-sm">{Math.round(day.tempmin)}°</p>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Loading state for forecast */}
        {isLoadingForecast && locationData && (
          <Card>
            <div className="animate-pulse">
              <div className="h-6 w-32 bg-bg-elevated rounded mb-4" />
              <div className="grid grid-cols-7 gap-2">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="text-center p-3">
                    <div className="h-4 w-8 bg-bg-elevated rounded mx-auto mb-2" />
                    <div className="h-8 w-8 bg-bg-elevated rounded mx-auto mb-2" />
                    <div className="h-4 w-6 bg-bg-elevated rounded mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// Helper function to get weather emoji
function getWeatherEmoji(condition) {
  if (!condition) return '☀️';
  const c = condition.toLowerCase();
  if (c.includes('rain') || c.includes('shower')) return '🌧️';
  if (c.includes('snow')) return '❄️';
  if (c.includes('thunder') || c.includes('storm')) return '⛈️';
  if (c.includes('cloud') || c.includes('overcast')) return '☁️';
  if (c.includes('partly')) return '⛅';
  if (c.includes('fog') || c.includes('mist')) return '🌫️';
  if (c.includes('wind')) return '💨';
  return '☀️';
}

export default WeatherDashboard;
