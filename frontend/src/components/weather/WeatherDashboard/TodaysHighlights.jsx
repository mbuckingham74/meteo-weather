import { celsiusToFahrenheit } from '../../../utils/weatherHelpers';
import {
  getUVCategory,
  getVisibilityCategory,
  getCloudCoverCategory,
  getDewPointCategory,
  getWindDirection,
  getPressureCategory,
} from '../../../constants/weather';

/**
 * Today's Highlights Component
 * Displays key weather metrics for the current day
 */
function TodaysHighlights({ currentWeather, forecast, unit }) {
  if (!currentWeather || !forecast || forecast.length === 0) {
    return null;
  }

  const todayForecast = forecast[0];

  // Calculate dew point using Magnus formula
  const calculateDewPoint = () => {
    const temp = currentWeather.current.temperature;
    const humidity = currentWeather.current.humidity;
    const a = 17.27;
    const b = 237.7;
    const alpha = (a * temp) / (b + temp) + Math.log(humidity / 100);
    const dewPoint = (b * alpha) / (a - alpha);
    return dewPoint;
  };

  // Format time from 24h to 12h format
  const formatTime = (date, time) => {
    const dateTime = new Date(`${date}T${time}`);
    return dateTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const dewPoint = calculateDewPoint();
  const dewPointF = celsiusToFahrenheit(dewPoint);

  return (
    <div className="todays-highlights">
      <h4 className="highlights-title">Today&apos;s Highlights</h4>
      <div className="highlights-grid">
        {/* Sunrise/Sunset */}
        <div className="highlight-card">
          <div className="highlight-icon">🌅</div>
          <div className="highlight-content">
            <div className="highlight-label">Sunrise</div>
            <div className="highlight-value">
              {todayForecast?.sunrise
                ? formatTime(todayForecast.date, todayForecast.sunrise)
                : '--'}
            </div>
          </div>
          <div className="highlight-content">
            <div className="highlight-label">Sunset</div>
            <div className="highlight-value">
              {todayForecast?.sunset ? formatTime(todayForecast.date, todayForecast.sunset) : '--'}
            </div>
          </div>
        </div>

        {/* UV Index */}
        <div className="highlight-card">
          <div className="highlight-icon">☀️</div>
          <div className="highlight-content">
            <div className="highlight-label">UV Index</div>
            <div className="highlight-value">
              {todayForecast?.uvIndex ?? currentWeather.current.uvIndex ?? '--'}
            </div>
            <div className="highlight-subtext">
              {getUVCategory(todayForecast?.uvIndex ?? currentWeather.current.uvIndex ?? 0)}
            </div>
          </div>
        </div>

        {/* Pressure */}
        <div className="highlight-card">
          <div className="highlight-icon">🌡️</div>
          <div className="highlight-content">
            <div className="highlight-label">Pressure</div>
            <div className="highlight-value">
              {currentWeather.current.pressure
                ? `${Math.round(currentWeather.current.pressure)} mb`
                : '--'}
            </div>
            <div className="highlight-subtext">
              {currentWeather.current.pressure
                ? getPressureCategory(currentWeather.current.pressure)
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
              {todayForecast?.visibility
                ? `${todayForecast.visibility.toFixed(1)} km`
                : currentWeather.current.visibility
                  ? `${currentWeather.current.visibility} mi`
                  : '--'}
            </div>
            <div className="highlight-subtext">
              {getVisibilityCategory(todayForecast?.visibility ?? 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Wind Details Section */}
      <h4 className="highlights-title" style={{ marginTop: '12px' }}>
        Wind & Air
      </h4>
      <div className="highlights-grid">
        {/* Wind Speed & Direction */}
        <div className="highlight-card">
          <div className="highlight-icon">💨</div>
          <div className="highlight-content">
            <div className="highlight-label">Wind</div>
            <div className="highlight-value">
              {Math.round(currentWeather.current.windSpeed)} mph
            </div>
            <div className="highlight-subtext">
              From {getWindDirection(todayForecast?.windDirection ?? 0)}
            </div>
          </div>
        </div>

        {/* Cloud Cover */}
        <div className="highlight-card">
          <div className="highlight-icon">☁️</div>
          <div className="highlight-content">
            <div className="highlight-label">Cloud Cover</div>
            <div className="highlight-value">{currentWeather.current.cloudCover}%</div>
            <div className="highlight-subtext">
              {getCloudCoverCategory(currentWeather.current.cloudCover)}
            </div>
          </div>
        </div>

        {/* Dew Point */}
        <div className="highlight-card">
          <div className="highlight-icon">💧</div>
          <div className="highlight-content">
            <div className="highlight-label">Dew Point</div>
            <div className="highlight-value">
              {unit === 'F' ? `${Math.round(dewPointF)}°F` : `${Math.round(dewPoint)}°C`}
            </div>
            <div className="highlight-subtext">{getDewPointCategory(dewPointF)}</div>
          </div>
        </div>

        {/* Precipitation Type */}
        <div className="highlight-card">
          <div className="highlight-icon">
            {todayForecast?.snow > 0 ? '❄️' : todayForecast?.precipitation > 0 ? '🌧️' : '☀️'}
          </div>
          <div className="highlight-content">
            <div className="highlight-label">Precip Type</div>
            <div className="highlight-value">
              {todayForecast?.snow > 0
                ? 'Snow'
                : todayForecast?.precipitation > 0
                  ? 'Rain'
                  : 'None'}
            </div>
            <div className="highlight-subtext">
              {todayForecast?.snow > 0
                ? `${todayForecast.snow.toFixed(1)} mm expected`
                : todayForecast?.precipitation > 0
                  ? `${todayForecast.precipitation.toFixed(1)} mm expected`
                  : 'Dry conditions'}
            </div>
          </div>
        </div>
      </div>

      {/* Weather Summary Section */}
      <h4 className="highlights-title" style={{ marginTop: '12px' }}>
        Conditions
      </h4>
      <div className="weather-summary-card">
        <div className="summary-main">
          <span className="summary-icon">
            {todayForecast?.icon === 'rain'
              ? '🌧️'
              : todayForecast?.icon === 'snow'
                ? '❄️'
                : todayForecast?.icon === 'cloudy'
                  ? '☁️'
                  : todayForecast?.icon === 'partly-cloudy-day'
                    ? '⛅'
                    : todayForecast?.icon === 'clear-day'
                      ? '☀️'
                      : '🌤️'}
          </span>
          <div className="summary-text">
            <div className="summary-conditions">{todayForecast?.conditions || 'Loading...'}</div>
            <div className="summary-description">
              {todayForecast?.description || 'Fetching weather details...'}
            </div>
          </div>
        </div>
        {todayForecast?.precipProbability > 0 && (
          <div className="summary-precipitation">
            <span className="precip-icon">💧</span>
            <span className="precip-text">
              {todayForecast.precipProbability}% chance of precipitation
              {todayForecast.precipitation > 0 &&
                ` (${todayForecast.precipitation.toFixed(1)} mm expected)`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default TodaysHighlights;
