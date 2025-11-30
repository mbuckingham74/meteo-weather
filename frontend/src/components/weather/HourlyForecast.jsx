/**
 * HourlyForecast - Horizontal scrolling hourly forecast strip
 */
import Card from '../ui/Card';
import { useTemperatureUnit } from '../../contexts/TemperatureUnitContext';

function HourlyForecast({ hours, isLoading }) {
  const { formatTemperature } = useTemperatureUnit();

  if (isLoading) {
    return (
      <Card>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Hourly Forecast</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-16 animate-pulse">
              <div className="h-4 w-10 bg-bg-elevated rounded mx-auto mb-2" />
              <div className="h-8 w-8 bg-bg-elevated rounded mx-auto mb-2" />
              <div className="h-5 w-8 bg-bg-elevated rounded mx-auto" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!hours || hours.length === 0) {
    return null;
  }

  // Get next 24 hours
  const next24Hours = hours.slice(0, 24);

  return (
    <Card>
      <h2 className="text-lg font-semibold text-text-primary mb-4">Hourly Forecast</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {next24Hours.map((hour, index) => {
          // Handle both time-only (HH:MM:SS) and ISO timestamp formats
          const datetime = hour.datetime;
          let time;
          if (datetime.includes('T') || datetime.includes('-')) {
            // ISO format: 2025-11-30T14:00:00
            time = new Date(datetime);
          } else {
            // Time-only format: 14:00:00
            time = new Date(`2000-01-01T${datetime}`);
          }
          const timeStr =
            index === 0
              ? 'Now'
              : time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });

          return (
            <div
              key={hour.datetime}
              className="flex-shrink-0 w-16 text-center p-2 rounded-xl hover:bg-bg-card-hover transition-colors"
            >
              <p className="text-text-muted text-sm mb-2">{timeStr}</p>
              <div className="text-2xl mb-2">{getWeatherEmoji(hour.conditions)}</div>
              <p className="text-text-primary font-semibold">{formatTemperature(hour.temp)}</p>
              {hour.precipprob > 0 && (
                <p className="text-accent text-xs mt-1">{Math.round(hour.precipprob)}%</p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

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

export default HourlyForecast;
