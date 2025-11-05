import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTemperatureUnit } from '../../contexts/TemperatureUnitContext';
import RadarMap from '../weather/RadarMap';
import HistoricalRainTable from '../weather/HistoricalRainTable';
import TemperatureBandChart from '../charts/TemperatureBandChart';
import WindChart from '../charts/WindChart';
import HourlyForecastChart from '../charts/HourlyForecastChart';
import { ChartSkeleton, TableSkeleton, MapSkeleton } from '../common/Skeleton';
import API_CONFIG from '../../config/api';
import './AIWeatherPage.css';

// Use centralized API configuration
const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Shared Answer Page
 * Displays a publicly shared AI weather analysis
 */
function SharedAnswerPage() {
  const { shareId } = useParams();
  const { unit } = useTemperatureUnit();
  const [sharedAnswer, setSharedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visualizationsLoaded, setVisualizationsLoaded] = useState({});

  // Fetch shared answer on mount
  useEffect(() => {
    async function fetchSharedAnswer() {
      if (!shareId || shareId.length !== 10) {
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/share/${shareId}`);
        const data = await response.json();

        if (response.ok) {
          setSharedAnswer(data);
        } else {
          setError(data.error || 'Failed to load shared answer');
        }
      } catch (err) {
        setError(`Failed to load shared answer: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchSharedAnswer();
  }, [shareId]);

  // Auto-mark visualizations as loaded after a short delay
  useEffect(() => {
    if (sharedAnswer && sharedAnswer.visualizations) {
      const timer = setTimeout(() => {
        const loadedStates = {};
        sharedAnswer.visualizations.forEach((viz, index) => {
          loadedStates[`${viz.type}-${index}`] = true;
        });
        setVisualizationsLoaded(loadedStates);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [sharedAnswer]);

  if (loading) {
    return (
      <div className="ai-weather-page">
        <div className="ai-page-header">
          <h1>🔗 Loading Shared Answer...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-weather-page">
        <div className="ai-page-header">
          <h1>❌ Error</h1>
          <p>{error}</p>
        </div>
        <div className="back-link">
          <Link to="/ai-weather">← Ask your own question</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-weather-page">
      <div className="ai-page-header">
        <h1>🔗 Shared Weather Answer</h1>
        <p>Someone shared this AI weather analysis with you</p>
        <div className="current-location-badge">
          📍 {sharedAnswer.location}
        </div>
      </div>

      <div className="ai-answer-section">
        <div className="answer-header">
          <h2>💬 Answer</h2>
          <div className="answer-actions">
            <div className="answer-meta">
              <span className="confidence-badge">{sharedAnswer.confidence} confidence</span>
              <span className="tokens-used">{sharedAnswer.views} views</span>
            </div>
          </div>
        </div>

        <div className="answer-text shared-question">
          <strong>Question:</strong> {sharedAnswer.question}
        </div>

        <div className="answer-text">
          {sharedAnswer.answer}
        </div>

        <div className="answer-context">
          <strong>Location:</strong> {sharedAnswer.location} <br />
          <strong>Current Conditions:</strong> {sharedAnswer.weatherData.currentConditions}, {sharedAnswer.weatherData.temperature}°C<br />
          <strong>Shared:</strong> {new Date(sharedAnswer.createdAt).toLocaleDateString()}
        </div>

        {/* Render Visualizations */}
        {sharedAnswer.visualizations && sharedAnswer.visualizations.length > 0 && (
          <div className="visualizations-section">
            <h3>📊 Interactive Visualizations</h3>
            {sharedAnswer.visualizations.map((viz, index) => (
              <div key={index} className="visualization-container">
                <div className="viz-header">
                  <h4>{viz.reason}</h4>
                </div>

                {/* Radar Map with skeleton */}
                {viz.type === 'radar' && sharedAnswer.weatherData.coordinates && (
                  <>
                    {!visualizationsLoaded[`radar-${index}`] && <MapSkeleton height={350} />}
                    <div className={visualizationsLoaded[`radar-${index}`] ? 'fade-in' : 'hidden'}>
                      <RadarMap
                        center={[sharedAnswer.weatherData.coordinates.lat, sharedAnswer.weatherData.coordinates.lon]}
                        zoom={8}
                      />
                    </div>
                  </>
                )}

                {/* Historical Precipitation Table */}
                {viz.type === 'historical-precipitation' && viz.params && (
                  <>
                    {!visualizationsLoaded[`historical-precipitation-${index}`] && (
                      <TableSkeleton rows={10} columns={4} height={500} />
                    )}
                    <div className={visualizationsLoaded[`historical-precipitation-${index}`] ? 'fade-in' : 'hidden'}>
                      <HistoricalRainTable
                        location={sharedAnswer.location}
                        date={viz.params.date}
                        years={viz.params.years}
                      />
                    </div>
                  </>
                )}

                {/* Temperature Chart */}
                {viz.type === 'chart-temperature' && sharedAnswer.weatherData.forecast && (
                  <>
                    {!visualizationsLoaded[`chart-temperature-${index}`] && <ChartSkeleton height={400} />}
                    <div className={visualizationsLoaded[`chart-temperature-${index}`] ? 'fade-in' : 'hidden'}>
                      <TemperatureBandChart
                        data={sharedAnswer.weatherData.forecast}
                        unit={unit}
                        height={400}
                      />
                    </div>
                  </>
                )}

                {/* Wind Chart */}
                {viz.type === 'chart-wind' && sharedAnswer.weatherData.forecast && (
                  <>
                    {!visualizationsLoaded[`chart-wind-${index}`] && <ChartSkeleton height={350} />}
                    <div className={visualizationsLoaded[`chart-wind-${index}`] ? 'fade-in' : 'hidden'}>
                      <WindChart
                        data={sharedAnswer.weatherData.forecast}
                        height={350}
                      />
                    </div>
                  </>
                )}

                {/* Hourly Forecast Chart */}
                {viz.type === 'chart-hourly' && sharedAnswer.weatherData.hourly && (
                  <>
                    {!visualizationsLoaded[`chart-hourly-${index}`] && <ChartSkeleton height={400} />}
                    <div className={visualizationsLoaded[`chart-hourly-${index}`] ? 'fade-in' : 'hidden'}>
                      <HourlyForecastChart
                        hourlyData={sharedAnswer.weatherData.hourly}
                        unit={unit}
                        height={400}
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="back-link">
        <a href="/ai-weather">← Ask your own question</a>
      </div>
    </div>
  );
}

export default SharedAnswerPage;
