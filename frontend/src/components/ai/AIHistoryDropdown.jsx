import React, { useState, useEffect, useRef } from 'react';
import {
  getAIHistory,
  deleteHistoryItem,
  clearAIHistory,
  formatHistoryTimestamp,
} from '../../utils/aiHistoryStorage';
import styles from './AIHistoryDropdown.module.css';

/**
 * AI History Dropdown
 * Shows recent AI weather queries with instant replay
 */
function AIHistoryDropdown({ onSelectHistory }) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const dropdownRef = useRef(null);

  // Load history on mount and when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setHistory(getAIHistory());
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelectItem = (item) => {
    setIsOpen(false);
    onSelectHistory(item);
  };

  const handleDeleteItem = (e, itemId) => {
    e.stopPropagation(); // Prevent selection
    deleteHistoryItem(itemId);
    setHistory(getAIHistory());
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all history? This cannot be undone.')) {
      clearAIHistory();
      setHistory([]);
      setIsOpen(false);
    }
  };

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.toggleButton}
        title="View recent AI queries"
      >
        📜 History {history.length > 0 && `(${history.length})`}
      </button>

      {isOpen && (
        <div className={styles.menu}>
          <div className={styles.header}>
            <h3>Recent Questions</h3>
            {history.length > 0 && (
              <button onClick={handleClearAll} className={styles.clearButton}>
                Clear All
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className={styles.empty}>
              <p>No recent questions</p>
              <p className={styles.emptyHint}>Ask a question to see it here</p>
            </div>
          ) : (
            <div className={styles.items}>
              {history.map((item) => (
                <div key={item.id} className={styles.item} onClick={() => handleSelectItem(item)}>
                  <div className={styles.itemHeader}>
                    <span className={styles.location}>📍 {item.location}</span>
                    <span className={styles.timestamp}>
                      {formatHistoryTimestamp(item.timestamp)}
                    </span>
                  </div>
                  <div className={styles.question}>{item.question}</div>
                  <div className={styles.itemFooter}>
                    <span className={styles.confidence}>{item.confidence} confidence</span>
                    {item.visualizations && item.visualizations.length > 0 && (
                      <span className={styles.vizCount}>
                        {item.visualizations.length} visualization
                        {item.visualizations.length > 1 ? 's' : ''}
                      </span>
                    )}
                    <button
                      onClick={(e) => handleDeleteItem(e, item.id)}
                      className={styles.deleteButton}
                      title="Delete this item"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AIHistoryDropdown;
