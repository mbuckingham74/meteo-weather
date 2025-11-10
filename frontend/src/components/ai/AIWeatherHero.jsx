import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../../contexts/LocationContext';
import './AIWeatherHero.css';

/**
 * AI Weather Hero Section
 * Compact call-to-action for the AI Weather Assistant feature
 * Displays on the dashboard as an anchor feature
 */
function AIWeatherHero() {
  const { location } = useLocation();
  const [question, setQuestion] = useState('');
  const navigate = useNavigate();

  const handleAskNow = () => {
    // Navigate to AI weather page with pre-filled question
    const questionParam = question ? `?q=${encodeURIComponent(question)}` : '';
    navigate(`/ai-weather${questionParam}`);
  };

  const exampleQuestions = [
    'Will it rain this weekend?',
    "What's the warmest day this week?",
    'Should I bring an umbrella tomorrow?',
    'When is the best day for outdoor activities?',
  ];

  return (
    <div className="ai-weather-hero">
      <div className="ai-hero-content">
        <div className="ai-hero-badge">
          <span className="ai-badge-icon" aria-hidden="true">
            ✨
          </span>
          <span className="ai-badge-text">AI POWERED</span>
        </div>

        <h2 className="ai-hero-title">Ask Meteo Weather AI</h2>

        <p className="ai-hero-subtitle">
          Get instant answers to your weather questions powered by Claude AI. Just ask in plain
          English!
        </p>

        <div className="ai-hero-input-section">
          <div className="ai-hero-input-wrapper">
            <label htmlFor="ai-weather-question" className="sr-only">
              Ask a question about the weather
            </label>
            <input
              id="ai-weather-question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAskNow()}
              placeholder="Ask a question about the weather..."
              className="ai-hero-input"
              maxLength={500}
              aria-label="Ask a question about the weather"
            />
            <button
              onClick={handleAskNow}
              className="ai-hero-button"
              disabled={!location}
              aria-label="Ask AI weather assistant"
            >
              <span className="ai-button-icon" aria-hidden="true">
                🤖
              </span>
              <span className="ai-button-text">Ask AI</span>
            </button>
          </div>

          {!location && <p className="ai-hero-warning">⚠️ Please select a location first</p>}
        </div>

        <div className="ai-hero-examples">
          <p className="ai-examples-label">Try asking:</p>
          <div className="ai-examples-grid">
            {exampleQuestions.map((q, index) => (
              <button
                key={index}
                onClick={() => setQuestion(q)}
                className="ai-example-chip"
                aria-label={`Try example question: ${q}`}
              >
                &quot;{q}&quot;
              </button>
            ))}
          </div>
        </div>

        <div className="ai-hero-features">
          <div className="ai-feature-item">
            <span className="ai-feature-icon" aria-hidden="true">
              🧠
            </span>
            <div className="ai-feature-text">
              <strong>Smart Analysis</strong>
              <span>AI-powered insights</span>
            </div>
          </div>
          <div className="ai-feature-item">
            <span className="ai-feature-icon" aria-hidden="true">
              📊
            </span>
            <div className="ai-feature-text">
              <strong>Visual Answers</strong>
              <span>Charts included</span>
            </div>
          </div>
          <div className="ai-feature-item">
            <span className="ai-feature-icon" aria-hidden="true">
              ⚡
            </span>
            <div className="ai-feature-text">
              <strong>Natural Language</strong>
              <span>Ask in plain English</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIWeatherHero;
