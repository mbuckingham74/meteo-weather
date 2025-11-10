import React from 'react';
import { formatTemperature } from '../../../utils/weatherHelpers';

/**
 * Comparison Insights Component
 * Shows summary statistics comparing all locations
 */
function ComparisonInsights({ metrics, unit }) {
  if (metrics.length < 2) {
    return null;
  }

  const warmestLocation = metrics.reduce((max, m) => (m.avgTemp > max.avgTemp ? m : max));
  const coldestLocation = metrics.reduce((min, m) => (m.avgTemp < min.avgTemp ? m : min));
  const wettestLocation = metrics.reduce((max, m) => (m.totalPrecip > max.totalPrecip ? m : max));

  return (
    <div className="comparison-insights">
      <h3>🔍 Comparison Insights</h3>
      <div className="insights-grid">
        {warmestLocation && (
          <div className="insight-card warm">
            <span className="insight-icon">🔥</span>
            <div>
              <p className="insight-label">Warmest</p>
              <p className="insight-value">{warmestLocation.location}</p>
              <p className="insight-detail">
                {formatTemperature(warmestLocation.avgTemp, unit)} avg
              </p>
            </div>
          </div>
        )}

        {coldestLocation && warmestLocation !== coldestLocation && (
          <div className="insight-card cold">
            <span className="insight-icon">❄️</span>
            <div>
              <p className="insight-label">Coldest</p>
              <p className="insight-value">{coldestLocation.location}</p>
              <p className="insight-detail">
                {formatTemperature(coldestLocation.avgTemp, unit)} avg
              </p>
            </div>
          </div>
        )}

        {wettestLocation && (
          <div className="insight-card wet">
            <span className="insight-icon">🌧️</span>
            <div>
              <p className="insight-label">Wettest</p>
              <p className="insight-value">{wettestLocation.location}</p>
              <p className="insight-detail">{wettestLocation.totalPrecip.toFixed(1)} mm total</p>
            </div>
          </div>
        )}

        {warmestLocation && coldestLocation && warmestLocation !== coldestLocation && (
          <div className="insight-card difference">
            <span className="insight-icon">📊</span>
            <div>
              <p className="insight-label">Temperature Difference</p>
              <p className="insight-value">
                {Math.abs(warmestLocation.avgTemp - coldestLocation.avgTemp).toFixed(1)}°{unit}
              </p>
              <p className="insight-detail">Between warmest and coldest</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComparisonInsights;
