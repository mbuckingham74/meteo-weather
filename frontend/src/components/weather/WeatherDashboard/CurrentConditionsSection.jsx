import React from 'react';
import RadarMap from '../RadarMap';
import TodaysHighlights from './TodaysHighlights';

/**
 * Current Conditions Section Component
 * Displays current weather conditions, location info, and today's highlights
 */
function CurrentConditionsSection({
  locationData,
  data,
  currentWeather,
  hourlyData,
  unit,
  convertTemp,
  getFormattedLocationName,
}) {
  if (!currentWeather?.data || currentWeather.loading) {
    return null;
  }

  return (
    <div className="location-info">
      {/* Current Conditions Header */}
      <div className="section-header">
        <h3 className="section-title">
          <span className="section-icon">🌡️</span>
          Current Conditions
        </h3>
      </div>

      {/* Header: City name left, Coords/Timezone right */}
      <div className="location-header">
        <h2 className="location-name">{getFormattedLocationName()}</h2>
        <p className="location-coords">
          {data.location?.latitude?.toFixed(4) || locationData?.latitude?.toFixed(4)},{' '}
          {data.location?.longitude?.toFixed(4) || locationData?.longitude?.toFixed(4)}
          {(data.location?.timezone || locationData?.timezone) &&
            ` • ${data.location?.timezone || locationData?.timezone}`}
        </p>
      </div>

      {/* Current Conditions - Centered */}
      <div className="current-conditions">
        <div className="current-main">
          <div className="current-temp">
            {convertTemp(currentWeather.data.current.temperature)}°{unit}
          </div>
          <div className="current-details">
            <div className="current-condition">{currentWeather.data.current.conditions}</div>
            <div className="current-feels-like">
              Feels like {convertTemp(currentWeather.data.current.feelsLike)}°{unit}
            </div>
          </div>
        </div>

        <div className="current-stats">
          <div className="current-stat">
            <span className="stat-icon">💨</span>
            <span className="stat-value">
              {Math.round(currentWeather.data.current.windSpeed)} mph
            </span>
            <span className="stat-label">Wind</span>
          </div>
          <div className="current-stat">
            <span className="stat-icon">💧</span>
            <span className="stat-value">{currentWeather.data.current.humidity}%</span>
            <span className="stat-label">Humidity</span>
          </div>
          <div className="current-stat">
            <span className="stat-icon">👁️</span>
            <span className="stat-value">{currentWeather.data.current.visibility} mi</span>
            <span className="stat-label">Visibility</span>
          </div>
          <div className="current-stat">
            <span className="stat-icon">☁️</span>
            <span className="stat-value">{currentWeather.data.current.cloudCover}%</span>
            <span className="stat-label">Clouds</span>
          </div>
          <div className="current-stat">
            <span className="stat-icon">🌧️</span>
            <span className="stat-value">
              {hourlyData?.data?.hourly
                ? hourlyData.data.hourly
                    .slice(0, 24)
                    .reduce((sum, hour) => sum + (hour.precipitation || 0), 0)
                    .toFixed(1)
                : '0.0'}{' '}
              mm
            </span>
            <span className="stat-label">24h Precip</span>
          </div>
        </div>

        <div className="current-footer">
          {data.location && (
            <RadarMap
              latitude={data.location.latitude}
              longitude={data.location.longitude}
              zoom={7.5}
              height="350px"
              alerts={data.alerts}
            />
          )}
        </div>

        {/* Today's Highlights */}
        {data.forecast && data.forecast.length > 0 && (
          <TodaysHighlights
            currentWeather={currentWeather.data}
            forecast={data.forecast}
            unit={unit}
          />
        )}
      </div>
    </div>
  );
}

export default CurrentConditionsSection;
