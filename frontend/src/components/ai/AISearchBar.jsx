import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../../contexts/LocationContext';
import './AISearchBar.css';

/**
 * AI Search Bar Component
 * Compact search bar for the dashboard that expands to show AI input
 * Can either navigate to AI page or show inline (your choice)
 */
function AISearchBar() {
  const { location } = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [question, setQuestion] = useState('');
  const navigate = useNavigate();

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleAsk = () => {
    if (question.trim()) {
      // Navigate to AI weather page with the question
      const questionParam = encodeURIComponent(question);
      navigate(`/ai-weather?q=${questionParam}`);
    } else {
      // Just go to AI page if no question entered
      navigate('/ai-weather');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && question.trim()) {
      handleAsk();
    }
  };

  return (
    <div className={`ai-search-bar ${isExpanded ? 'expanded' : ''}`}>
      {!isExpanded ? (
        // Collapsed state - attractive search bar
        <button className="ai-search-prompt" onClick={handleExpand}>
          <span className="ai-icon">🤖</span>
          <span className="ai-prompt-text">
            Ask about weather in {location?.address || 'your location'}...
          </span>
          <span className="ai-badge">AI</span>
        </button>
      ) : (
        // Expanded state - full input with examples
        <div className="ai-search-expanded">
          <div className="ai-input-wrapper">
            <span className="ai-icon">🤖</span>
            <input
              type="text"
              className="ai-search-input"
              placeholder="Ask anything about weather..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
            <button className="ai-ask-button" onClick={handleAsk}>
              Ask AI
            </button>
          </div>

          <div className="ai-examples">
            <span className="ai-examples-label">Try:</span>
            <button
              className="ai-example-chip"
              onClick={() => setQuestion("Will it rain this weekend?")}
            >
              Will it rain this weekend?
            </button>
            <button
              className="ai-example-chip"
              onClick={() => setQuestion("What's the warmest day this week?")}
            >
              What's the warmest day?
            </button>
            <button
              className="ai-example-chip"
              onClick={() => setQuestion("Should I bring an umbrella tomorrow?")}
            >
              Need an umbrella tomorrow?
            </button>
          </div>

          <button
            className="ai-collapse-button"
            onClick={() => setIsExpanded(false)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default AISearchBar;
