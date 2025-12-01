/**
 * CurrentConditions - Hero section showing current weather
 */
import { MapPin } from 'lucide-react';
import WeatherIcon from '../ui/WeatherIcon';
import Card from '../ui/Card';
import { useTemperatureUnit } from '../../contexts/TemperatureUnitContext';

function CurrentConditions({ weather, location, isLoading, error }) {
  const { formatTemperature } = useTemperatureUnit();

  if (isLoading) {
    return (
      <Card className="text-center py-16">
        <div className="animate-pulse">
          <div className="h-16 w-32 bg-bg-elevated rounded mx-auto mb-4" />
          <div className="h-6 w-48 bg-bg-elevated rounded mx-auto mb-2" />
          <div className="h-4 w-32 bg-bg-elevated rounded mx-auto" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-16">
        <p className="text-red-400 mb-2">Unable to load weather data</p>
        <p className="text-text-muted text-sm">{error.message}</p>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card className="text-center py-16">
        <WeatherIcon condition="clear" size={64} className="mx-auto mb-4 opacity-50" />
        <h1 className="text-3xl font-light text-text-secondary mb-2">Welcome to Meteo</h1>
        <p className="text-text-muted">Search for a location to see the weather</p>
      </Card>
    );
  }

  // Support both old format (snake_case) and new API format (camelCase)
  const temp = weather.temp ?? weather.temperature;
  const feelslike = weather.feelslike ?? weather.feelsLike;
  const conditions = weather.conditions;
  const humidity = weather.humidity;
  const windspeed = weather.windspeed ?? weather.windSpeed;

  return (
    <Card className="text-center py-8">
      {/* Location */}
      {location && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <MapPin size={18} className="text-accent" />
          <span className="text-text-secondary text-lg">{location}</span>
        </div>
      )}

      {/* Weather Icon & Temperature */}
      <div className="flex items-center justify-center gap-6 mb-4">
        <WeatherIcon condition={conditions} size={72} />
        <div>
          <h1 className="text-7xl font-bold text-text-primary tracking-tight">
            {formatTemperature(temp)}
          </h1>
          <p className="text-text-muted text-lg mt-1">Feels like {formatTemperature(feelslike)}</p>
        </div>
      </div>

      {/* Conditions */}
      <p className="text-xl text-text-secondary capitalize">{conditions || 'Clear'}</p>

      {/* Quick Stats */}
      <div className="flex justify-center gap-8 mt-6 text-text-muted">
        <span>Humidity: {humidity}%</span>
        <span>Wind: {windspeed} mph</span>
      </div>
    </Card>
  );
}

export default CurrentConditions;
