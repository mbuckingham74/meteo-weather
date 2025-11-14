import React, { useState, useEffect, useCallback } from 'react';
import useApi from '../../hooks/useApi';
import ChartSkeleton from '../common/ChartSkeleton';
import styles from './AirQualityCard.module.css';

/**
 * AirQualityCard Component
 * Displays current air quality index and pollutant details
 */
function AirQualityCard({ latitude, longitude }) {
  const api = useApi({ showErrorToast: false }); // Manual error handling for better UX
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAirQuality = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await api(`/air-quality?lat=${latitude}&lon=${longitude}&days=1`);

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
  }, [api, latitude, longitude]);

  useEffect(() => {
    if (latitude && longitude) {
      fetchAirQuality();
    }
  }, [latitude, longitude, fetchAirQuality]);

  if (loading) {
    return (
      <div className={styles.card}>
        <ChartSkeleton height="280px" showLegend={false} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.card}>
        <div className={styles.error}>
          <span className={styles.errorIcon}>⚠️</span>
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
    <div className={styles.card}>
      <h3 className={styles.title}>
        <span>💨</span> Air Quality Index
      </h3>

      {/* Main AQI Display */}
      <div className={styles.main} style={{ borderColor: level?.color || 'var(--border-light)' }}>
        <div className={styles.valueContainer}>
          <div className={styles.value} style={{ color: level?.color || 'var(--text-primary)' }}>
            {aqi !== null && aqi !== undefined ? Math.round(aqi) : '—'}
          </div>
          <div className={styles.label}>{level?.level || 'Unknown'}</div>
        </div>
        {level?.description && <p className={styles.description}>{level.description}</p>}
      </div>

      {/* Pollutant Details */}
      <div className={styles.pollutants}>
        <h4 className={styles.pollutantsTitle}>Pollutant Levels</h4>
        <div className={styles.pollutantsGrid}>
          {current.pm2_5 !== null && current.pm2_5 !== undefined && (
            <div className={styles.pollutantItem}>
              <span className={styles.pollutantLabel}>PM2.5</span>
              <span className={styles.pollutantValue}>{current.pm2_5.toFixed(1)} µg/m³</span>
            </div>
          )}
          {current.pm10 !== null && current.pm10 !== undefined && (
            <div className={styles.pollutantItem}>
              <span className={styles.pollutantLabel}>PM10</span>
              <span className={styles.pollutantValue}>{current.pm10.toFixed(1)} µg/m³</span>
            </div>
          )}
          {current.ozone !== null && current.ozone !== undefined && (
            <div className={styles.pollutantItem}>
              <span className={styles.pollutantLabel}>O₃</span>
              <span className={styles.pollutantValue}>{current.ozone.toFixed(1)} µg/m³</span>
            </div>
          )}
          {current.nitrogenDioxide !== null && current.nitrogenDioxide !== undefined && (
            <div className={styles.pollutantItem}>
              <span className={styles.pollutantLabel}>NO₂</span>
              <span className={styles.pollutantValue}>
                {current.nitrogenDioxide.toFixed(1)} µg/m³
              </span>
            </div>
          )}
          {current.carbonMonoxide !== null && current.carbonMonoxide !== undefined && (
            <div className={styles.pollutantItem}>
              <span className={styles.pollutantLabel}>CO</span>
              <span className={styles.pollutantValue}>
                {current.carbonMonoxide.toFixed(0)} µg/m³
              </span>
            </div>
          )}
          {current.sulphurDioxide !== null && current.sulphurDioxide !== undefined && (
            <div className={styles.pollutantItem}>
              <span className={styles.pollutantLabel}>SO₂</span>
              <span className={styles.pollutantValue}>
                {current.sulphurDioxide.toFixed(1)} µg/m³
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Health Recommendations */}
      {current.healthRecommendation && current.healthRecommendation.length > 0 && (
        <div className={styles.recommendations}>
          <h4 className={styles.recommendationsTitle}>Health Recommendations</h4>
          <ul className={styles.recommendationsList}>
            {current.healthRecommendation.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Data Source */}
      <div className={styles.footer}>
        <p className={styles.dataSource}>Data: Open-Meteo Air Quality API</p>
      </div>
    </div>
  );
}

export default AirQualityCard;
