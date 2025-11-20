import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './WeatherTwinsModal.css';

const WeatherTwinsModal = ({ isOpen, onClose, locationId, locationName, currentWeather }) => {
  const [twins, setTwins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scope, setScope] = useState('us');
  const [selectedTwin, setSelectedTwin] = useState(null);

  useEffect(() => {
    if (isOpen && locationId) {
      fetchWeatherTwins();
    }
  }, [isOpen, locationId, scope]);

  const fetchWeatherTwins = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/weather/twins/${locationId}?scope=${scope}&limit=5&minSimilarity=80`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather twins');
      }

      const data = await response.json();

      if (data.success) {
        setTwins(data.twins || []);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err.message);
      setTwins([]);
    } finally {
      setLoading(false);
    }
  };

  const formatLocationName = (twin) => {
    const parts = [twin.location.name];
    if (twin.location.state) parts.push(twin.location.state);
    if (twin.location.country_code !== 'US') parts.push(twin.location.country);
    return parts.join(', ');
  };

  const getScopeLabel = (scopeValue) => {
    const labels = {
      us: 'United States',
      'north-america': 'North America',
      worldwide: 'Worldwide',
    };
    return labels[scopeValue] || scopeValue;
  };

  const getMatchQuality = (score) => {
    if (score >= 95) return { label: 'Excellent', emoji: '⭐⭐⭐⭐⭐' };
    if (score >= 90) return { label: 'Great', emoji: '⭐⭐⭐⭐' };
    if (score >= 85) return { label: 'Good', emoji: '⭐⭐⭐' };
    return { label: 'Fair', emoji: '⭐⭐' };
  };

  if (!isOpen) return null;

  return (
    <div className="weather-twins-modal-overlay" onClick={onClose}>
      <div className="weather-twins-modal" onClick={(e) => e.stopPropagation()}>
        <div className="weather-twins-modal-header">
          <h2>🌍 Weather Twins for {locationName}</h2>
          <button className="weather-twins-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {currentWeather && (
          <div className="weather-twins-current">
            <p>
              Current: {Math.round(currentWeather.temperature)}°F, {currentWeather.conditions}
            </p>
          </div>
        )}

        <div className="weather-twins-scope-selector">
          <label htmlFor="scope-select">Search in:</label>
          <select
            id="scope-select"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="weather-twins-scope-select"
          >
            <option value="us">United States Only</option>
            <option value="north-america">North America</option>
            <option value="worldwide">Worldwide</option>
          </select>
        </div>

        <div className="weather-twins-modal-body">
          {loading && (
            <div className="weather-twins-loading">
              <div className="weather-twins-spinner"></div>
              <p>Finding weather twins in {getScopeLabel(scope)}...</p>
            </div>
          )}

          {error && (
            <div className="weather-twins-error">
              <p>❌ {error}</p>
            </div>
          )}

          {!loading && !error && twins.length === 0 && (
            <div className="weather-twins-empty">
              <p>No weather twins found with similar conditions.</p>
              <p className="weather-twins-empty-hint">
                Try expanding your search scope or check back later.
              </p>
            </div>
          )}

          {!loading && !error && twins.length > 0 && !selectedTwin && (
            <div className="weather-twins-list">
              <p className="weather-twins-count">
                Found {twins.length} weather twin{twins.length !== 1 ? 's' : ''} in{' '}
                {getScopeLabel(scope)}
              </p>
              {twins.map((twin, index) => {
                const quality = getMatchQuality(twin.similarity.overall);
                return (
                  <div key={twin.location.id} className="weather-twin-card">
                    <div className="weather-twin-header">
                      <span className="weather-twin-rank">#{index + 1}</span>
                      <h3>{formatLocationName(twin)}</h3>
                    </div>

                    <div className="weather-twin-conditions">
                      <p className="weather-twin-temp">
                        {Math.round(twin.conditions.temperature)}°F
                      </p>
                      <p className="weather-twin-desc">{twin.conditions.weatherCondition}</p>
                    </div>

                    <div className="weather-twin-similarity">
                      <div className="similarity-score">
                        <span className="similarity-percentage">{twin.similarity.overall}%</span>
                        <span className="similarity-label">Match</span>
                      </div>
                      <div className="similarity-bar">
                        <div
                          className="similarity-bar-fill"
                          style={{ width: `${twin.similarity.overall}%` }}
                        ></div>
                      </div>
                      <p className="similarity-quality">
                        {quality.emoji} {quality.label}
                      </p>
                    </div>

                    <button
                      className="weather-twin-compare-btn"
                      onClick={() => setSelectedTwin(twin)}
                    >
                      Compare Details →
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {selectedTwin && (
            <div className="weather-twin-comparison">
              <button className="weather-twin-back-btn" onClick={() => setSelectedTwin(null)}>
                ← Back to List
              </button>

              <h3>Side-by-Side Comparison</h3>

              <div className="comparison-grid">
                <div className="comparison-column">
                  <h4>{locationName}</h4>
                  <div className="comparison-stat">
                    <span className="stat-label">Temperature</span>
                    <span className="stat-value">
                      {Math.round(currentWeather?.temperature || 0)}°F
                    </span>
                  </div>
                  <div className="comparison-stat">
                    <span className="stat-label">Conditions</span>
                    <span className="stat-value">{currentWeather?.conditions || 'N/A'}</span>
                  </div>
                  <div className="comparison-stat">
                    <span className="stat-label">Humidity</span>
                    <span className="stat-value">{currentWeather?.humidity || 0}%</span>
                  </div>
                  <div className="comparison-stat">
                    <span className="stat-label">Wind</span>
                    <span className="stat-value">{currentWeather?.windSpeed || 0} mph</span>
                  </div>
                </div>

                <div className="comparison-divider">
                  <span className="comparison-vs">vs</span>
                </div>

                <div className="comparison-column">
                  <h4>{formatLocationName(selectedTwin)}</h4>
                  <div className="comparison-stat">
                    <span className="stat-label">Temperature</span>
                    <span className="stat-value">
                      {Math.round(selectedTwin.conditions.temperature)}°F
                    </span>
                  </div>
                  <div className="comparison-stat">
                    <span className="stat-label">Conditions</span>
                    <span className="stat-value">{selectedTwin.conditions.weatherCondition}</span>
                  </div>
                  <div className="comparison-stat">
                    <span className="stat-label">Humidity</span>
                    <span className="stat-value">{selectedTwin.conditions.humidity}%</span>
                  </div>
                  <div className="comparison-stat">
                    <span className="stat-label">Wind</span>
                    <span className="stat-value">{selectedTwin.conditions.windSpeed} mph</span>
                  </div>
                </div>
              </div>

              <div className="similarity-breakdown">
                <h4>Similarity Breakdown</h4>
                <div className="breakdown-bars">
                  {Object.entries(selectedTwin.similarity.breakdown).map(([key, value]) => (
                    <div key={key} className="breakdown-item">
                      <span className="breakdown-label">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                      <div className="breakdown-bar">
                        <div className="breakdown-bar-fill" style={{ width: `${value}%` }}></div>
                      </div>
                      <span className="breakdown-value">{value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

WeatherTwinsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  locationId: PropTypes.number,
  locationName: PropTypes.string,
  currentWeather: PropTypes.shape({
    temperature: PropTypes.number,
    conditions: PropTypes.string,
    humidity: PropTypes.number,
    windSpeed: PropTypes.number,
  }),
};

export default WeatherTwinsModal;
