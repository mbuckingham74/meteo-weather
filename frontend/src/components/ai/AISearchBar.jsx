import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../../contexts/LocationContext';
import styles from './AISearchBar.module.css';

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
    <div className={`${styles.searchBar} ${isExpanded ? styles.expanded : ''}`}>
      {!isExpanded ? (
        // Collapsed state - attractive search bar
        <button className={styles.prompt} onClick={handleExpand}>
          <span className={styles.icon}>🤖</span>
          <span className={styles.promptText}>
            Ask about weather in {location?.address || 'your location'}...
          </span>
          <span className={styles.badge}>AI</span>
        </button>
      ) : (
        // Expanded state - full input with examples
        <div className={styles.expandedView}>
          <div className={styles.inputWrapper}>
            <span className={styles.icon}>🤖</span>
            <input
              type="text"
              className={styles.input}
              placeholder="Ask anything about weather..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
            <button className={styles.askButton} onClick={handleAsk}>
              Ask AI
            </button>
          </div>

          <div className={styles.examples}>
            <span className={styles.examplesLabel}>Try:</span>
            <button
              className={styles.exampleChip}
              onClick={() => setQuestion('Will it rain this weekend?')}
            >
              Will it rain this weekend?
            </button>
            <button
              className={styles.exampleChip}
              onClick={() => setQuestion("What's the warmest day this week?")}
            >
              What&apos;s the warmest day?
            </button>
            <button
              className={styles.exampleChip}
              onClick={() => setQuestion('Should I bring an umbrella tomorrow?')}
            >
              Need an umbrella tomorrow?
            </button>
          </div>

          <button className={styles.collapseButton} onClick={() => setIsExpanded(false)}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default AISearchBar;
