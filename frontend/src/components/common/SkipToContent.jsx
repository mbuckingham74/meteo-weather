import React from 'react';
import styles from './SkipToContent.module.css';

/**
 * SkipToContent Component
 * Provides skip links for keyboard users to bypass repetitive navigation
 * Only visible when focused (Tab key)
 * CSS Modules Migration: Phase 1.1
 */
const SkipToContent = () => {
  const handleSkip = (e, targetId) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.tabIndex = -1; // Make focusable
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className={styles.container} aria-label="Skip links">
      <a
        href="#main-content"
        className={styles.link}
        onClick={(e) => handleSkip(e, 'main-content')}
      >
        Skip to main content
      </a>
      <a
        href="#location-search"
        className={styles.link}
        onClick={(e) => handleSkip(e, 'location-search')}
      >
        Skip to location search
      </a>
      <a
        href="#weather-charts"
        className={styles.link}
        onClick={(e) => handleSkip(e, 'weather-charts')}
      >
        Skip to weather charts
      </a>
    </nav>
  );
};

export default SkipToContent;
