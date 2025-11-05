import { useNavigate } from 'react-router-dom';
import TemperatureUnitToggle from '../../units/TemperatureUnitToggle';

/**
 * Quick Actions Panel Component
 * Displays location detection, navigation buttons, and chart controls
 */
function QuickActionsPanel({
  detectingLocation,
  locationError,
  isAuthenticated,
  visibleCharts,
  handleDetectLocation,
  setVisibleCharts,
  getCityName,
}) {
  const navigate = useNavigate();

  return (
    <div className="dashboard-controls">
      <h3 className="controls-title">Quick Actions</h3>

      <div id="location-search" className="location-search-section">
        <div className="location-actions">
          <button
            className="location-action-button detect-location"
            onClick={handleDetectLocation}
            disabled={detectingLocation}
            aria-label={
              detectingLocation ? 'Detecting your location...' : 'Use my current location'
            }
            aria-busy={detectingLocation}
          >
            <span aria-hidden="true">{detectingLocation ? '🔄' : '📍'}</span>{' '}
            {detectingLocation ? 'Detecting...' : 'Use My Location'}
          </button>
          <a
            href="/compare"
            className="location-action-button compare-link"
            aria-label="Go to location comparison page"
          >
            <span aria-hidden="true">📊</span> Compare Locations
          </a>
          <a
            href="/ai-weather"
            className="location-action-button ai-link"
            aria-label="Ask AI about the weather"
          >
            <span aria-hidden="true">🤖</span> Ask AI
          </a>
          {isAuthenticated && (
            <button
              className="location-action-button settings-link"
              onClick={() => navigate('/preferences')}
              aria-label="Go to my preferences and settings"
            >
              <span aria-hidden="true">⚙️</span> My Settings
            </button>
          )}
        </div>
        {locationError && <div className="location-error">⚠️ {locationError}</div>}
      </div>

      <div className="control-group">
        <label className="control-label">Temperature Unit:</label>
        <TemperatureUnitToggle />
      </div>

      {/* View Forecast Button */}
      <button
        className="view-forecast-button"
        onClick={() =>
          document
            .getElementById('forecast-section')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      >
        <span className="button-icon">📊</span>
        <span className="button-text">
          <strong>View {getCityName()} Forecast & Charts</strong>
          <span className="button-subtitle">Interactive weather visualizations</span>
        </span>
      </button>

      {/* Chart Navigation */}
      <div className="chart-controls-section">
        <div className="chart-controls-header">
          <h3>📊 Charts</h3>
          <div className="chart-toggle-buttons">
            <button
              className="toggle-all-button"
              onClick={() =>
                setVisibleCharts({
                  hourly: true,
                  temperature: true,
                  precipitation: true,
                  wind: true,
                  cloudCover: true,
                  uvIndex: true,
                  overview: true,
                  humidityDew: true,
                  sunriseSunset: true,
                  feelsLike: true,
                  airQuality: true,
                  thisDayHistory: true,
                  historicalComparison: true,
                  recordTemps: true,
                  tempProbability: true,
                })
              }
            >
              Show All
            </button>
            <button
              className="toggle-all-button"
              onClick={() =>
                setVisibleCharts({
                  hourly: false,
                  temperature: false,
                  precipitation: false,
                  wind: false,
                  cloudCover: false,
                  uvIndex: false,
                  overview: false,
                  humidityDew: false,
                  sunriseSunset: false,
                  feelsLike: false,
                  airQuality: false,
                  thisDayHistory: false,
                  historicalComparison: false,
                  recordTemps: false,
                  tempProbability: false,
                })
              }
            >
              Hide All
            </button>
          </div>
        </div>
        <div className="chart-nav-list">
          <button
            className="chart-nav-button"
            onClick={() =>
              document
                .getElementById('chart-hourly')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            🕐 48-Hour Forecast
          </button>
          <button
            className="chart-nav-button"
            onClick={() =>
              document
                .getElementById('chart-temperature')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            🌡️ Temperature Bands
          </button>
          <button
            className="chart-nav-button"
            onClick={() =>
              document
                .getElementById('chart-precipitation')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            🌧️ Precipitation
          </button>
          <button
            className="chart-nav-button"
            onClick={() =>
              document
                .getElementById('chart-wind')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            💨 Wind
          </button>
          <button
            className="chart-nav-button"
            onClick={() =>
              document
                .getElementById('chart-cloudCover')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            ☁️ Cloud Cover
          </button>
          <button
            className="chart-nav-button"
            onClick={() =>
              document
                .getElementById('chart-uvIndex')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            ☀️ UV Index
          </button>
          <button
            className="chart-nav-button"
            onClick={() =>
              document
                .getElementById('chart-overview')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            📈 Multi-Metric Overview
          </button>
          <button
            className="chart-nav-button"
            onClick={() =>
              document
                .getElementById('chart-humidityDew')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            💧 Humidity & Dewpoint
          </button>
          <button
            className="chart-nav-button"
            onClick={() =>
              document
                .getElementById('chart-sunriseSunset')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            🌅 Sunrise & Sunset
          </button>
          <button
            className="chart-nav-button"
            onClick={() =>
              document
                .getElementById('chart-feelsLike')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            🌡️ Feels Like Temperature
          </button>
          <button
            className="chart-nav-button"
            onClick={() =>
              document
                .getElementById('chart-airQuality')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            💨 Air Quality Index
          </button>

          {/* Historical/Climate section */}
          <div
            style={{
              width: '100%',
              height: '1px',
              background: 'var(--border-light)',
              margin: '8px 0',
            }}
          />

          <button
            className="chart-nav-button"
            onClick={() =>
              document
                .getElementById('chart-thisDayHistory')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            📅 This Day in History
          </button>
          <button
            className="chart-nav-button"
            onClick={() =>
              document
                .getElementById('chart-historicalComparison')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            📊 Historical Comparison
          </button>
          <button
            className="chart-nav-button"
            onClick={() =>
              document
                .getElementById('chart-recordTemps')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            🏆 Record Temperatures
          </button>
          <button
            className="chart-nav-button"
            onClick={() =>
              document
                .getElementById('chart-tempProbability')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            📉 Temperature Probability
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuickActionsPanel;
