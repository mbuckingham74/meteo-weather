/**
 * HourlyForecast - Horizontal scrolling hourly forecast strip
 */
import Card from '../ui/Card';
import { useTemperatureUnit } from '../../contexts/TemperatureUnitContext';
import { getWeatherEmoji } from '../../utils/weatherHelpers';

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

  // Get next 24 hours, filtering out invalid entries
  const next24Hours = hours
    .filter((hour) => {
      // Skip entries without datetime/time or temperature
      const hasTime = hour.datetime || hour.time;
      const hasTemp = hour.temp != null || hour.temperature != null;
      return hasTime && hasTemp;
    })
    .slice(0, 24);

  if (next24Hours.length === 0) {
    return null;
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-text-primary mb-4">Hourly Forecast</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {next24Hours.map((hour, index) => {
          // Handle both time-only (HH:MM:SS) and ISO timestamp formats
          // Support both datetime and time fields
          const datetime = hour.datetime || hour.time;
          let time;
          try {
            if (datetime.includes('T') || datetime.includes('-')) {
              // ISO format: 2025-11-30T14:00:00
              time = new Date(datetime);
            } else {
              // Time-only format: 14:00:00
              time = new Date(`2000-01-01T${datetime}`);
            }
            // Validate the date is valid
            if (isNaN(time.getTime())) {
              time = new Date();
            }
          } catch {
            time = new Date();
          }
          const timeStr =
            index === 0
              ? 'Now'
              : time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });

          // Support both temp and temperature field names
          const temp = hour.temp ?? hour.temperature;
          const precipProb = hour.precipprob ?? hour.precipProbability ?? 0;

          return (
            <div
              key={hour.datetime || hour.time || index}
              className="flex-shrink-0 w-16 text-center p-2 rounded-xl hover:bg-bg-card-hover transition-colors"
            >
              <p className="text-text-muted text-sm mb-2">{timeStr}</p>
              <div className="text-2xl mb-2">{getWeatherEmoji(hour.conditions)}</div>
              <p className="text-text-primary font-semibold">{formatTemperature(temp)}</p>
              {precipProb > 0 && (
                <p className="text-accent text-xs mt-1">{Math.round(precipProb)}%</p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default HourlyForecast;
