import { useState } from 'react';
import { useLocation } from '../../contexts/LocationContext';
import { useTemperatureUnit } from '../../contexts/TemperatureUnitContext';
import { geocodeLocation } from '../../services/weatherApi';
import RadarMap from '../weather/RadarMap';
import HistoricalRainTable from '../weather/HistoricalRainTable';
import TemperatureBandChart from '../charts/TemperatureBandChart';
import WindChart from '../charts/WindChart';
import HourlyForecastChart from '../charts/HourlyForecastChart';
import ChartSkeleton from '../common/ChartSkeleton';
import { addToAIHistory } from '../../utils/aiHistoryStorage';
import useApi from '../../hooks/useApi';
import './UniversalSearchBar.css';

/**
 * Universal Smart Search Bar
 * One input to handle both simple location searches and complex AI queries
 * - Simple locations (e.g., "Seattle") → Fast geocoding
 * - Complex questions (e.g., "What's similar to Seattle?") → AI analysis
 */
function UniversalSearchBar() {
  const { location, selectLocation } = useLocation();
  const { unit } = useTemperatureUnit();
  const api = useApi({ showErrorToast: false }); // Manual error handling for better UX
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // AI answer state
  const [aiAnswer, setAiAnswer] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [visualizationsLoaded, setVisualizationsLoaded] = useState({
    hourly: false,
    temperature: false,
    wind: false,
    radar: false,
    historical: false,
  });

  // Get current city for dynamic queries
  const currentCity = location?.address?.split(',')[0] || 'Seattle';

  /**
   * Smart detection: Is this a simple location or a complex AI query?
   */
  const isComplexQuery = (input) => {
    const text = input.toLowerCase().trim();

    // Question indicators
    if (text.includes('?')) return true;

    // Question words
    const questionWords = [
      'what',
      'where',
      'when',
      'why',
      'how',
      'should',
      'will',
      'can',
      'is',
      'are',
    ];
    if (
      questionWords.some((word) => text.startsWith(word + ' ') || text.includes(' ' + word + ' '))
    ) {
      return true;
    }

    // Comparative/analytical words
    const analyticalWords = [
      'similar',
      'like',
      'warmer',
      'cooler',
      'better',
      'compare',
      'than',
      'climate',
    ];
    if (analyticalWords.some((word) => text.includes(word))) {
      return true;
    }

    // Multiple sentences (likely complex)
    if (text.split('.').length > 2) return true;

    // Otherwise, treat as simple location
    return false;
  };

  /**
   * Handle simple location search (fast geocoding)
   */
  const handleLocationSearch = async (locationQuery) => {
    try {
      setIsProcessing(true);
      const results = await geocodeLocation(locationQuery, 5);

      if (results && results.length > 0) {
        // Use first result
        selectLocation(results[0]);
        setQuery(''); // Clear input on success
      } else {
        // No results - could show error or fallback to AI
        console.warn('No location found, consider AI fallback');
      }
    } catch (error) {
      console.error('Location search error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle complex AI query (intelligent analysis) - INLINE
   */
  const handleAIQuery = async (question) => {
    if (!location || !location.trim()) {
      setAiError('Please select a location first');
      return;
    }

    try {
      setIsProcessing(true);
      setAiError(null);
      setAiAnswer(null);
      setVisualizationsLoaded({
        hourly: false,
        temperature: false,
        wind: false,
        radar: false,
        historical: false,
      });

      // Step 1: Validate query
      const validateData = await api('/ai-weather/validate', {
        method: 'POST',
        body: { query: question, location },
        skipAuth: true,
      });

      if (!validateData.isValid) {
        setAiError(`Invalid query: ${validateData.reason}`);
        setIsProcessing(false);
        return;
      }

      // Step 2: Get AI analysis
      const analyzeData = await api('/ai-weather/analyze', {
        method: 'POST',
        body: {
          query: question,
          location,
          days: 7,
        },
        skipAuth: true,
      });

      // Set AI answer
      setAiAnswer({
        question,
        answer: analyzeData.answer,
        confidence: analyzeData.confidence,
        tokensUsed: analyzeData.tokensUsed,
        model: analyzeData.model,
        weatherData: analyzeData.weatherData,
        visualizations: analyzeData.visualizations || [],
        followUpQuestions: analyzeData.followUpQuestions || [],
      });

      // Save to history
      addToAIHistory({
        question,
        answer: analyzeData.answer,
        location,
        confidence: analyzeData.confidence,
        tokensUsed: analyzeData.tokensUsed,
        visualizations: analyzeData.visualizations,
        followUpQuestions: analyzeData.followUpQuestions,
      });

      setQuery(''); // Clear input on success
    } catch (error) {
      console.error('AI query error:', error);
      setAiError(error.message || 'Failed to process AI query');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Universal submit handler - routes to appropriate handler
   */
  const handleSubmit = () => {
    if (!query.trim()) return;

    if (isComplexQuery(query)) {
      // Complex query → AI
      handleAIQuery(query);
    } else {
      // Simple location → Geocoding
      handleLocationSearch(query);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="universal-search-bar">
      {/* Hero Message */}
      <div className="universal-hero">
        <h2 className="universal-hero-title">A New Way to Check Weather</h2>
        <p className="universal-hero-subtitle">
          Just type a city name or ask any weather question. Our AI understands both.
        </p>
      </div>

      {/* Main Input - Dead Center */}
      <div className="universal-input-wrapper">
        <span className="universal-icon">🔍</span>
        <input
          type="text"
          className="universal-search-input"
          placeholder="Ask me anything... e.g., 'Will it rain this weekend in Seattle?' or 'When did Denver experience its highest temperature?' or 'I live in Florida June-November and it's miserable - where should I move?'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isProcessing}
        />
        <button
          className="universal-submit-button"
          onClick={handleSubmit}
          disabled={!query.trim() || isProcessing}
        >
          {isProcessing ? '...' : '→'}
        </button>
      </div>

      {/* Example Query Bar - Centered */}
      <div className="universal-examples">
        <span className="universal-examples-label">👇 Try asking:</span>
        <button
          className="universal-example-chip question"
          onClick={() => setQuery(`Will it rain this weekend in ${currentCity}?`)}
          title="Weather forecast question"
        >
          🌧️ Will it rain this weekend?
        </button>
        <button
          className="universal-example-chip analysis"
          onClick={() =>
            setQuery(`What are the rainiest months in ${currentCity} based on historical data?`)
          }
          title="Historical data analysis"
        >
          📊 Show me the rainiest months
        </button>
        <button
          className="universal-example-chip comparison"
          onClick={() => setQuery(`What cities have a similar climate to ${currentCity}?`)}
          title="Find similar climates"
        >
          🌍 Find similar climates
        </button>
        <button
          className="universal-example-chip practical"
          onClick={() => setQuery(`How does ${currentCity}'s weather compare to Denver, Colorado?`)}
          title="Compare cities"
        >
          🏔️ Compare to another city
        </button>
      </div>

      {/* Smart Detection Hint - Centered */}
      {query.trim() && (
        <div className="universal-hint">
          {isComplexQuery(query) ? (
            <span className="hint-ai">🤖 AI will analyze this question</span>
          ) : (
            <span className="hint-location">📍 Searching for location</span>
          )}
        </div>
      )}

      {/* AI Answer Section - Inline */}
      {aiError && (
        <div className="ai-error-inline">
          <p>⚠️ {aiError}</p>
        </div>
      )}

      {aiAnswer && (
        <div className="ai-answer-inline">
          {/* Answer Header */}
          <div className="ai-answer-header">
            <div className="ai-answer-title">
              <span className="ai-icon">🤖</span>
              <h3>{aiAnswer.question}</h3>
            </div>
            <div className="ai-answer-meta">
              <span className={`confidence-badge ${aiAnswer.confidence?.toLowerCase()}`}>
                {aiAnswer.confidence} confidence
              </span>
              <span className="tokens-used">{aiAnswer.tokensUsed} tokens</span>
            </div>
          </div>

          {/* Answer Text */}
          <div className="ai-answer-text">
            <p>{aiAnswer.answer}</p>
          </div>

          {/* Visualizations */}
          {aiAnswer.visualizations && aiAnswer.visualizations.length > 0 && (
            <div className="ai-visualizations-inline">
              {aiAnswer.visualizations.map((viz, index) => {
                const loaded = visualizationsLoaded[viz.type];

                return (
                  <div
                    key={index}
                    className={`visualization-card ${loaded ? 'loaded' : 'loading'}`}
                  >
                    {viz.type === 'hourly_forecast' && (
                      <>
                        {!loaded && <ChartSkeleton height={400} />}
                        <div style={{ display: loaded ? 'block' : 'none' }}>
                          <HourlyForecastChart
                            data={aiAnswer.weatherData?.hourly || []}
                            unit={unit}
                            onLoad={() =>
                              setVisualizationsLoaded((prev) => ({ ...prev, hourly: true }))
                            }
                          />
                        </div>
                      </>
                    )}

                    {viz.type === 'temperature' && (
                      <>
                        {!loaded && <ChartSkeleton height={450} />}
                        <div style={{ display: loaded ? 'block' : 'none' }}>
                          <TemperatureBandChart
                            data={aiAnswer.weatherData?.forecast || []}
                            unit={unit}
                            onLoad={() =>
                              setVisualizationsLoaded((prev) => ({ ...prev, temperature: true }))
                            }
                          />
                        </div>
                      </>
                    )}

                    {viz.type === 'wind' && (
                      <>
                        {!loaded && <ChartSkeleton height={450} />}
                        <div style={{ display: loaded ? 'block' : 'none' }}>
                          <WindChart
                            data={aiAnswer.weatherData?.forecast || []}
                            unit={unit}
                            onLoad={() =>
                              setVisualizationsLoaded((prev) => ({ ...prev, wind: true }))
                            }
                          />
                        </div>
                      </>
                    )}

                    {viz.type === 'radar' && (
                      <>
                        {!loaded && <ChartSkeleton height="350px" />}
                        <div style={{ display: loaded ? 'block' : 'none' }}>
                          <RadarMap
                            location={location}
                            onLoad={() =>
                              setVisualizationsLoaded((prev) => ({ ...prev, radar: true }))
                            }
                          />
                        </div>
                      </>
                    )}

                    {viz.type === 'historical' && (
                      <>
                        {!loaded && <ChartSkeleton height="500px" />}
                        <div style={{ display: loaded ? 'block' : 'none' }}>
                          <HistoricalRainTable
                            location={location}
                            unit={unit}
                            onLoad={() =>
                              setVisualizationsLoaded((prev) => ({ ...prev, historical: true }))
                            }
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Follow-up Questions */}
          {aiAnswer.followUpQuestions && aiAnswer.followUpQuestions.length > 0 && (
            <div className="follow-up-questions-inline">
              <p className="follow-up-label">💡 Related questions:</p>
              <div className="follow-up-chips">
                {aiAnswer.followUpQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    className="follow-up-chip"
                    onClick={() => {
                      setQuery(q);
                      handleAIQuery(q);
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UniversalSearchBar;
