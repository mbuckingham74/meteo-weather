import { useNavigate } from 'react-router-dom';
import TemperatureUnitToggle from '../../units/TemperatureUnitToggle';
import { Button } from '@components/ui/primitives';

/**
 * Quick Actions Panel Component
 * Displays location detection, navigation buttons, and chart controls
 */
function QuickActionsPanel({
  detectingLocation,
  locationError,
  isAuthenticated,
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
          <Button
            variant="ghost"
            onClick={handleDetectLocation}
            disabled={detectingLocation}
            aria-label={
              detectingLocation ? 'Detecting your location...' : 'Use my current location'
            }
          >
            {detectingLocation ? '🔄 Detecting…' : '📍 Use My Location'}
          </Button>
          <Button
            as="a"
            href="/compare"
            variant="ghost"
            aria-label="Go to location comparison page"
          >
            📊 Compare Locations
          </Button>
          <Button as="a" href="/ai-weather" variant="ghost" aria-label="Ask AI about the weather">
            🤖 Ask AI
          </Button>
          {isAuthenticated && (
            <Button
              variant="secondary"
              onClick={() => navigate('/preferences')}
              aria-label="Go to my preferences and settings"
            >
              ⚙️ My Settings
            </Button>
          )}
        </div>
        {locationError && <div className="location-error">⚠️ {locationError}</div>}
      </div>

      <div className="control-group">
        <label className="control-label">Temperature Unit:</label>
        <TemperatureUnitToggle />
      </div>

      {/* View Forecast Button */}
      <Button
        fullWidth
        size="lg"
        onClick={() =>
          document
            .getElementById('forecast-section')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      >
        📊 View {getCityName()} Forecast & Charts
      </Button>

      {/* Chart Navigation */}
      <div className="chart-controls-section">
        <div className="chart-controls-header">
          <h3>📊 Charts</h3>
          <div className="chart-toggle-buttons">
            <Button
              variant="secondary"
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
            </Button>
            <Button
              variant="outline"
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
            </Button>
          </div>
        </div>
        <div className="chart-nav-list">
          <Button
            variant="outline"
            onClick={() =>
              document
                .getElementById('chart-hourly')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            🕐 48-Hour Forecast
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              document
                .getElementById('chart-temperature')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            🌡️ Temperature Bands
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              document
                .getElementById('chart-precipitation')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            🌧️ Precipitation
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              document
                .getElementById('chart-wind')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            💨 Wind
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              document
                .getElementById('chart-cloudCover')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            ☁️ Cloud Cover
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              document
                .getElementById('chart-uvIndex')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            ☀️ UV Index
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              document
                .getElementById('chart-overview')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            📈 Multi-Metric Overview
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              document
                .getElementById('chart-humidityDew')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            💧 Humidity & Dewpoint
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              document
                .getElementById('chart-sunriseSunset')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            🌅 Sunrise & Sunset
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              document
                .getElementById('chart-feelsLike')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            🌡️ Feels Like Temperature
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              document
                .getElementById('chart-airQuality')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            💨 Air Quality Index
          </Button>

          {/* Historical/Climate section */}
          <div className="chart-nav-divider" role="separator" aria-hidden="true" />
          <Button
            variant="outline"
            onClick={() =>
              document
                .getElementById('chart-thisDayHistory')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            📅 This Day in History
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              document
                .getElementById('chart-historicalComparison')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            📊 Historical Comparison
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              document
                .getElementById('chart-recordTemps')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            🏆 Record Temperatures
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              document
                .getElementById('chart-tempProbability')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            📉 Temperature Probability
          </Button>
        </div>
      </div>
    </div>
  );
}

export default QuickActionsPanel;
