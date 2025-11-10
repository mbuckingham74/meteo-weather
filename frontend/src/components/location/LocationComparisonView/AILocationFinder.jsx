import { debugLog, LogLevel } from '../../../utils/debugLogger';

/**
 * AI Location Finder Component
 * Natural language interface for finding locations based on climate preferences
 */
function AILocationFinder({
  showAiSection,
  aiQuery,
  setAiQuery,
  aiLoading,
  aiError,
  aiResult,
  currentLocationData,
  gettingLocation,
  handleAiSearch,
  handleGetMyLocation,
  handleCloseAiFinder,
  aiFinderRef,
}) {
  if (!showAiSection) {
    return null;
  }

  const handleSubmit = (e) => {
    debugLog('AILocationFinder', { action: 'submit', query: aiQuery }, LogLevel.INFO);
    handleAiSearch(e);
  };

  const handleLocationClick = () => {
    debugLog('AILocationFinder', { action: 'get_location' }, LogLevel.INFO);
    handleGetMyLocation();
  };

  return (
    <div className="ai-location-finder" ref={aiFinderRef}>
      <div className="ai-header">
        <h3>🤖 AI-Powered Location Finder</h3>
        <button className="ai-close" onClick={handleCloseAiFinder} title="Dismiss">
          ✕
        </button>
      </div>
      <div className="ai-content">
        <p className="ai-description">
          Describe your ideal climate in natural language, and our AI will help you find matching
          locations!
        </p>

        <form onSubmit={handleSubmit} className="ai-search-form">
          <div className="ai-input-group">
            <textarea
              className="ai-input"
              placeholder='Example: "I currently live in New Smyrna Beach, FL. I want somewhere 15 degrees cooler from June-October, less humid, not rainy, with a good community feel."'
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              rows={4}
              disabled={aiLoading}
              spellCheck={true}
            />
          </div>

          <div className="ai-actions">
            <button
              type="button"
              className="ai-location-button"
              onClick={handleLocationClick}
              disabled={aiLoading || gettingLocation}
            >
              {gettingLocation ? '📍 Getting location...' : '📍 Get my location'}
            </button>
            {currentLocationData && (
              <span className="location-detected">✓ Location: {currentLocationData.city}</span>
            )}
            <button
              type="submit"
              className="ai-submit-button"
              disabled={aiLoading || !aiQuery.trim()}
            >
              {aiLoading ? '🔍 Analyzing...' : '🔍 Find locations'}
            </button>
          </div>

          {aiError && (
            <div className="ai-error">
              <p>⚠️ {aiError}</p>
            </div>
          )}

          {aiResult && (
            <div className="ai-result">
              <h4>📊 Parsed Criteria:</h4>
              <div className="criteria-grid">
                {aiResult.criteria.current_location && (
                  <div className="criteria-item">
                    <strong>Current Location:</strong> {aiResult.criteria.current_location}
                  </div>
                )}
                {aiResult.criteria.time_period && (
                  <div className="criteria-item">
                    <strong>Time Period:</strong> {aiResult.criteria.time_period.start} -{' '}
                    {aiResult.criteria.time_period.end}
                  </div>
                )}
                {aiResult.criteria.temperature_delta !== null && (
                  <div className="criteria-item">
                    <strong>Temperature:</strong>{' '}
                    {aiResult.criteria.temperature_delta > 0 ? '+' : ''}
                    {aiResult.criteria.temperature_delta}°F
                  </div>
                )}
                {aiResult.criteria.humidity && (
                  <div className="criteria-item">
                    <strong>Humidity:</strong> {aiResult.criteria.humidity}
                  </div>
                )}
                {aiResult.criteria.precipitation && (
                  <div className="criteria-item">
                    <strong>Precipitation:</strong> {aiResult.criteria.precipitation}
                  </div>
                )}
                {aiResult.criteria.lifestyle_factors &&
                  aiResult.criteria.lifestyle_factors.length > 0 && (
                    <div className="criteria-item">
                      <strong>Lifestyle:</strong> {aiResult.criteria.lifestyle_factors.join(', ')}
                    </div>
                  )}
              </div>
              <div className="ai-cost-info">
                💰 Cost: {aiResult.cost} | 🔢 Tokens: {aiResult.tokensUsed}
              </div>
              {aiResult.criteria.additional_notes && (
                <div className="ai-notes">
                  <p>
                    <strong>💡 AI Insights:</strong> {aiResult.criteria.additional_notes}
                  </p>
                </div>
              )}
              <div className="ai-success">
                <p>
                  ✅ <strong>Comparison cards auto-populated!</strong> Scroll down to view suggested
                  locations based on your criteria.
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default AILocationFinder;
