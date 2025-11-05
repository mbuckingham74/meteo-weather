import React, { useState, useEffect, useCallback } from 'react';
import API_CONFIG from '../../config/api';
import './AirQualityCard.css';

/**
 * AirQualityCard Component
 * Displays current air quality index and pollutant details
 */
function AirQualityCard({ latitude, longitude }) {
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAirQuality = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/air-quality?lat=${latitude}&lon=${longitude}&days=1`
      );

      const result = await response.json();

      if (result.success) {
        setAqiData(result.data);
      } else {
        setError(result.error || 'Failed to load air quality data');
      }
    } catch (err) {
      console.error('Air quality fetch error:', err);
      setError('Unable to fetch air quality data');
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (latitude && longitude) {
      fetchAirQuality();
    }
  }, [latitude, longitude, fetchAirQuality]);

  if (loading) {
    return (
      <div className="aqi-card">
        <div className="aqi-loading">
          <div className="aqi-spinner"></div>
          <p>Loading air quality data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="aqi-card">
        <div className="aqi-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!aqiData || !aqiData.current) {
    return null;
  }

  const { current } = aqiData;
  const aqi = current.usAQI || current.europeanAQI;
  const level = current.aqiLevel;

  return (
    <div className="aqi-card">
      <h3 className="aqi-card-title">
        <span>💨</span> Air Quality Index
      </h3>

      {/* Main AQI Display */}
      <div
        className="aqi-main"
        style={{ borderColor: level?.color || '#9ca3af' }}
      >
        <div className="aqi-value-container">
          <div className="aqi-value" style={{ color: level?.color || '#9ca3af' }}>
            {aqi !== null && aqi !== undefined ? Math.round(aqi) : '—'}
          </div>
          <div className="aqi-label">{level?.level || 'Unknown'}</div>
        </div>
        {level?.description && (
          <p className="aqi-description">{level.description}</p>
        )}
      </div>

      {/* Pollutant Details */}
      <div className="aqi-pollutants">
        <h4 className="pollutants-title">Pollutant Levels</h4>
        <div className="pollutants-grid">
          {current.pm2_5 !== null && current.pm2_5 !== undefined && (
            <div className="pollutant-item">
              <span className="pollutant-label">PM2.5</span>
              <span className="pollutant-value">{current.pm2_5.toFixed(1)} µg/m³</span>
            </div>
          )}
          {current.pm10 !== null && current.pm10 !== undefined && (
            <div className="pollutant-item">
              <span className="pollutant-label">PM10</span>
              <span className="pollutant-value">{current.pm10.toFixed(1)} µg/m³</span>
            </div>
          )}
          {current.ozone !== null && current.ozone !== undefined && (
            <div className="pollutant-item">
              <span className="pollutant-label">O₃</span>
              <span className="pollutant-value">{current.ozone.toFixed(1)} µg/m³</span>
            </div>
          )}
          {current.nitrogenDioxide !== null && current.nitrogenDioxide !== undefined && (
            <div className="pollutant-item">
              <span className="pollutant-label">NO₂</span>
              <span className="pollutant-value">{current.nitrogenDioxide.toFixed(1)} µg/m³</span>
            </div>
          )}
          {current.carbonMonoxide !== null && current.carbonMonoxide !== undefined && (
            <div className="pollutant-item">
              <span className="pollutant-label">CO</span>
              <span className="pollutant-value">{current.carbonMonoxide.toFixed(0)} µg/m³</span>
            </div>
          )}
          {current.sulphurDioxide !== null && current.sulphurDioxide !== undefined && (
            <div className="pollutant-item">
              <span className="pollutant-label">SO₂</span>
              <span className="pollutant-value">{current.sulphurDioxide.toFixed(1)} µg/m³</span>
            </div>
          )}
        </div>
      </div>

      {/* Health Recommendations */}
      {current.healthRecommendation && current.healthRecommendation.length > 0 && (
        <div className="aqi-recommendations">
          <h4 className="recommendations-title">Health Recommendations</h4>
          <ul className="recommendations-list">
            {current.healthRecommendation.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Data Source */}
      <div className="aqi-footer">
        <p className="data-source">Data: Open-Meteo Air Quality API</p>
      </div>
    </div>
  );
}

export default AirQualityCard;
