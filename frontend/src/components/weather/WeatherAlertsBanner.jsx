import { useState } from 'react';
import styles from './WeatherAlertsBanner.module.css';

/**
 * WeatherAlertsBanner Component
 * Displays active weather alerts with severity-based styling
 *
 * CSS Modules Migration: Phase 1.1 - Component isolation with scoped styles
 */
function WeatherAlertsBanner({ alerts }) {
  const [expandedAlert, setExpandedAlert] = useState(null);

  if (!alerts || alerts.length === 0) {
    return null;
  }

  // Determine alert severity and icon
  const getAlertStyle = (event) => {
    const eventLower = event?.toLowerCase() || '';

    if (eventLower.includes('warning') || eventLower.includes('severe')) {
      return { severity: 'warning', icon: '⚠️', color: 'var(--alert-critical)' };
    } else if (eventLower.includes('watch')) {
      return { severity: 'watch', icon: '👁️', color: 'var(--alert-warning)' };
    } else if (eventLower.includes('advisory')) {
      return { severity: 'advisory', icon: 'ℹ️', color: 'var(--alert-advisory)' };
    } else {
      return { severity: 'info', icon: '📢', color: 'var(--text-secondary)' };
    }
  };

  const toggleAlert = (index) => {
    setExpandedAlert(expandedAlert === index ? null : index);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleAlert(index);
    }
  };

  return (
    <div className={styles.container}>
      {alerts.map((alert, index) => {
        const style = getAlertStyle(alert.event);
        const isExpanded = expandedAlert === index;

        return (
          <div
            key={index}
            className={`${styles.alert} ${styles[`alert${style.severity.charAt(0).toUpperCase() + style.severity.slice(1)}`]}`}
            style={{ borderLeftColor: style.color }}
            data-testid="weather-alert"
            data-severity={style.severity}
          >
            <div
              className={styles.header}
              onClick={() => toggleAlert(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              aria-label={`${alert.event} alert. ${isExpanded ? 'Collapse' : 'Expand'} for more details`}
              style={{ cursor: 'pointer' }}
              data-testid="alert-header"
            >
              <div className={styles.headerContent}>
                <span className={styles.icon} style={{ color: style.color }} aria-hidden="true">
                  {style.icon}
                </span>
                <div className={styles.titleSection}>
                  <h4 className={styles.title}>{alert.event}</h4>
                  {alert.onset && (
                    <span className={styles.time}>{new Date(alert.onset).toLocaleString()}</span>
                  )}
                </div>
              </div>
              <span className={styles.expandButton} aria-hidden="true">
                {isExpanded ? '▼' : '▶'}
              </span>
            </div>

            {isExpanded && (
              <div className={styles.body}>
                {alert.headline && <p className={styles.headline}>{alert.headline}</p>}
                {alert.description && <p className={styles.description}>{alert.description}</p>}
                {alert.ends && (
                  <p className={styles.ends}>
                    <strong>Ends:</strong> {new Date(alert.ends).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default WeatherAlertsBanner;
