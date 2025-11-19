import React from 'react';
import Skeleton from './Skeleton';
import './DashboardSkeleton.css';

/**
 * DashboardSkeleton Component
 * Loading placeholder for WeatherDashboard
 * Mimics the layout and structure of the actual dashboard
 */
const DashboardSkeleton = () => {
  return (
    <div className="dashboard-skeleton">
      {/* Main Grid Layout */}
      <div className="dashboard-skeleton-grid">
        {/* Left Column - Current Conditions */}
        <div className="dashboard-skeleton-left">
          {/* Current Conditions Header */}
          <div className="skeleton-section-header">
            <Skeleton width="200px" height="1.5rem" />
          </div>

          {/* City Name & Coordinates */}
          <div className="skeleton-location-header">
            <Skeleton width="250px" height="2rem" />
            <Skeleton width="180px" height="1rem" style={{ marginTop: '0.5rem' }} />
          </div>

          {/* Current Weather Display */}
          <div className="skeleton-current-weather">
            <div className="skeleton-temperature-display">
              <Skeleton
                width="150px"
                height="100px"
                variant="rectangular"
                style={{ borderRadius: '12px' }}
              />
              <Skeleton width="120px" height="1.5rem" style={{ marginTop: '1rem' }} />
              <Skeleton width="100px" height="1rem" style={{ marginTop: '0.5rem' }} />
            </div>
          </div>

          {/* Stat Boxes Grid */}
          <div className="skeleton-stat-boxes">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="skeleton-stat-box">
                <Skeleton variant="circle" width="40px" height="40px" />
                <div className="skeleton-stat-content">
                  <Skeleton width="80%" height="0.875rem" />
                  <Skeleton width="60%" height="1rem" style={{ marginTop: '0.5rem' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Radar Map Placeholder */}
          <div className="skeleton-radar">
            <Skeleton width="100%" height="350px" variant="rectangular" />
            <div className="skeleton-radar-controls">
              <Skeleton width="60px" height="36px" />
              <Skeleton width="100px" height="36px" />
              <Skeleton width="60px" height="36px" />
            </div>
          </div>

          {/* Highlights Section */}
          <div className="skeleton-highlights">
            <div className="skeleton-section-header">
              <Skeleton width="150px" height="1.25rem" />
            </div>
            <div className="skeleton-highlights-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} variant="card" width="100%" height="100px" />
              ))}
            </div>
          </div>

          {/* Wind & Air Section */}
          <div className="skeleton-wind-air">
            <div className="skeleton-section-header">
              <Skeleton width="120px" height="1.25rem" />
            </div>
            <div className="skeleton-wind-air-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} variant="card" width="100%" height="100px" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Controls & Forecast */}
        <div className="dashboard-skeleton-right">
          {/* Location Search */}
          <div className="skeleton-location-section">
            <Skeleton
              width="100%"
              height="48px"
              variant="rectangular"
              style={{ borderRadius: '8px' }}
            />
            <Skeleton
              width="100%"
              height="44px"
              variant="rectangular"
              style={{ borderRadius: '8px', marginTop: '1rem' }}
            />
            <Skeleton
              width="100%"
              height="44px"
              variant="rectangular"
              style={{ borderRadius: '8px', marginTop: '0.75rem' }}
            />
          </div>

          {/* Temperature Unit Toggle */}
          <div className="skeleton-unit-toggle">
            <Skeleton
              width="100%"
              height="40px"
              variant="rectangular"
              style={{ borderRadius: '8px' }}
            />
          </div>

          {/* Forecast Button */}
          <div className="skeleton-forecast-button">
            <Skeleton
              width="100%"
              height="56px"
              variant="rectangular"
              style={{ borderRadius: '12px' }}
            />
          </div>

          {/* Chart Navigation */}
          <div className="skeleton-chart-nav">
            <div className="skeleton-section-header">
              <Skeleton width="100px" height="1rem" />
            </div>
            <div className="skeleton-chart-buttons">
              {Array.from({ length: 15 }).map((_, index) => (
                <Skeleton
                  key={index}
                  width="100%"
                  height="36px"
                  variant="rectangular"
                  style={{ borderRadius: '6px' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="skeleton-charts-section">
        <div className="skeleton-section-header">
          <Skeleton width="200px" height="1.5rem" />
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="skeleton-chart">
            <Skeleton width="300px" height="1.5rem" style={{ marginBottom: '1.5rem' }} />
            <Skeleton width="100%" height="450px" variant="rectangular" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;
