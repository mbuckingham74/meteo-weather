import { useState } from 'react';
import './WeatherAlertsBanner.css';

/**
 * WeatherAlertsBanner Component
 * Displays active weather alerts with severity-based styling
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
      return { severity: 'warning', icon: '⚠️', color: '#ef4444' };
    } else if (eventLower.includes('watch')) {
      return { severity: 'watch', icon: '👁️', color: '#f59e0b' };
    } else if (eventLower.includes('advisory')) {
      return { severity: 'advisory', icon: 'ℹ️', color: '#3b82f6' };
    } else {
      return { severity: 'info', icon: '📢', color: '#6b7280' };
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
    <div className="weather-alerts-container">
      {alerts.map((alert, index) => {
        const style = getAlertStyle(alert.event);
        const isExpanded = expandedAlert === index;

        return (
          <div
            key={index}
            className={`weather-alert weather-alert-${style.severity}`}
            style={{ borderLeftColor: style.color }}
          >
            <div
              className="alert-header"
              onClick={() => toggleAlert(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              aria-label={`${alert.event} alert. ${isExpanded ? 'Collapse' : 'Expand'} for more details`}
              style={{ cursor: 'pointer' }}
            >
              <div className="alert-header-content">
                <span className="alert-icon" style={{ color: style.color }} aria-hidden="true">
                  {style.icon}
                </span>
                <div className="alert-title-section">
                  <h4 className="alert-title">{alert.event}</h4>
                  {alert.onset && (
                    <span className="alert-time">{new Date(alert.onset).toLocaleString()}</span>
                  )}
                </div>
              </div>
              <span className="alert-expand-button" aria-hidden="true">
                {isExpanded ? '▼' : '▶'}
              </span>
            </div>

            {isExpanded && (
              <div className="alert-body">
                {alert.headline && <p className="alert-headline">{alert.headline}</p>}
                {alert.description && <p className="alert-description">{alert.description}</p>}
                {alert.ends && (
                  <p className="alert-ends">
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
