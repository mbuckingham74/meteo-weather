import { useEffect, useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  formatErrorWithSuggestions,
  getContextualHelp,
  getPrioritySuggestion,
} from '../../utils/errorSuggestions';
import './ErrorMessage.css';

/**
 * Enhanced Error Message Component
 *
 * Flexible, accessible error display component with multiple modes.
 * Part of Error Message Improvement Initiative (Phase 3).
 *
 * @component
 * @example
 * // Toast notification (auto-dismiss)
 * <ErrorMessage
 *   error={error}
 *   mode="toast"
 *   onRetry={() => refetch()}
 *   onDismiss={() => setError(null)}
 *   autoHideDuration={5000}
 * />
 *
 * @example
 * // Inline form error
 * <ErrorMessage
 *   error="Email format is invalid"
 *   mode="inline"
 * />
 *
 * @example
 * // Banner warning
 * <ErrorMessage
 *   error="You're offline. Some features may be unavailable."
 *   mode="banner"
 *   severity="warning"
 *   dismissible={true}
 * />
 */
const ErrorMessage = ({
  error,
  mode = 'inline',
  severity = 'error',
  onRetry = null,
  onDismiss = null,
  autoHideDuration = 0,
  dismissible = true,
  showIcon = true,
  showCode = false,
  showSuggestions = true,
  maxSuggestions = 3,
  className = '',
  retryLabel = 'Retry',
  dismissLabel = '✕',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef(null);
  const errorRef = useRef(null);

  // Extract error message and code
  const errorMessage = typeof error === 'string' ? error : error?.message || 'An error occurred';
  const errorCode = error?.code || null;

  // Get error suggestions and contextual help
  const errorWithSuggestions = errorCode
    ? formatErrorWithSuggestions(errorMessage, errorCode)
    : { message: errorMessage, suggestions: [] };

  const contextualHelp = errorCode ? getContextualHelp(errorCode) : null;
  const prioritySuggestion = errorCode ? getPrioritySuggestion(errorCode) : null;

  // Determine which suggestions to show based on mode
  const suggestionsToShow =
    mode === 'toast' || mode === 'inline'
      ? prioritySuggestion
        ? [prioritySuggestion]
        : []
      : errorWithSuggestions.suggestions?.slice(0, maxSuggestions) || [];

  // Auto-dismiss logic
  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) {
        onDismiss();
      }
    }, 300);
  }, [onDismiss]);

  useEffect(() => {
    if (autoHideDuration > 0 && isVisible) {
      timerRef.current = setTimeout(handleDismiss, autoHideDuration);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [autoHideDuration, handleDismiss, isVisible]);

  // Focus management for accessibility
  useEffect(() => {
    if (mode === 'modal' && errorRef.current) {
      errorRef.current.focus();
    }
  }, [mode]);

  // Keyboard support (Escape to dismiss)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && dismissible) {
        handleDismiss();
      }
    };

    if (mode === 'modal' || mode === 'toast') {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [dismissible, handleDismiss, mode]);

  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry();
    }
  }, [onRetry]);

  // Don't render if not visible
  if (!isVisible || !error) {
    return null;
  }

  // Icon selection based on severity
  const getIcon = () => {
    if (!showIcon) return null;

    const icons = {
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      success: '✅',
    };

    return icons[severity] || icons.error;
  };

  // Get CSS classes based on mode and state
  const getClassName = () => {
    const classes = ['error-message', `error-message--${mode}`, `error-message--${severity}`];

    if (isExiting) {
      classes.push('error-message--exiting');
    }

    if (className) {
      classes.push(className);
    }

    return classes.join(' ');
  };

  // Render different layouts based on mode
  const renderContent = () => {
    return (
      <>
        {showIcon && (
          <span className="error-message__icon" aria-hidden="true">
            {getIcon()}
          </span>
        )}
        <div className="error-message__content">
          <span className="error-message__text">{errorMessage}</span>
          {showCode && errorCode && <span className="error-message__code">({errorCode})</span>}

          {/* Contextual help text */}
          {contextualHelp && mode !== 'toast' && (
            <p className="error-message__help" role="note">
              {contextualHelp}
            </p>
          )}

          {/* Error suggestions */}
          {showSuggestions && suggestionsToShow.length > 0 && (
            <div className="error-message__suggestions" role="region" aria-label="Suggestions">
              <p className="error-message__suggestions-label">
                {mode === 'toast' || mode === 'inline' ? 'Try this:' : 'Try these solutions:'}
              </p>
              <ul className="error-message__suggestions-list">
                {suggestionsToShow.map((suggestion, index) => (
                  <li key={index} className="error-message__suggestion-item">
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="error-message__actions">
          {onRetry && (
            <button
              className="error-message__button error-message__button--retry"
              onClick={handleRetry}
              type="button"
              aria-label={retryLabel}
            >
              {retryLabel}
            </button>
          )}
          {dismissible && onDismiss && (
            <button
              className="error-message__button error-message__button--dismiss"
              onClick={handleDismiss}
              type="button"
              aria-label="Dismiss error"
            >
              {dismissLabel}
            </button>
          )}
        </div>
      </>
    );
  };

  // Modal mode needs backdrop
  if (mode === 'modal') {
    return (
      <div className="error-message-backdrop" role="presentation">
        <div
          ref={errorRef}
          className={getClassName()}
          role="alertdialog"
          aria-live="assertive"
          aria-atomic="true"
          tabIndex={-1}
        >
          {renderContent()}
        </div>
      </div>
    );
  }

  // All other modes
  return (
    <div
      ref={errorRef}
      className={getClassName()}
      role="alert"
      aria-live={mode === 'inline' ? 'polite' : 'assertive'}
      aria-atomic="true"
    >
      {renderContent()}
    </div>
  );
};

ErrorMessage.propTypes = {
  /** Error object with message and code, or string message */
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      message: PropTypes.string,
      code: PropTypes.string,
    }),
  ]),

  /** Display mode: inline, toast, banner, or modal */
  mode: PropTypes.oneOf(['inline', 'toast', 'banner', 'modal']),

  /** Severity level: error, warning, info, success */
  severity: PropTypes.oneOf(['error', 'warning', 'info', 'success']),

  /** Callback for retry action */
  onRetry: PropTypes.func,

  /** Callback for dismiss action */
  onDismiss: PropTypes.func,

  /** Auto-hide duration in milliseconds (0 = no auto-hide) */
  autoHideDuration: PropTypes.number,

  /** Whether error can be dismissed */
  dismissible: PropTypes.bool,

  /** Show icon indicator */
  showIcon: PropTypes.bool,

  /** Show error code (development mode) */
  showCode: PropTypes.bool,

  /** Show error suggestions (WCAG 3.3.3 Level AA) */
  showSuggestions: PropTypes.bool,

  /** Maximum number of suggestions to show */
  maxSuggestions: PropTypes.number,

  /** Additional CSS class name */
  className: PropTypes.string,

  /** Label for retry button */
  retryLabel: PropTypes.string,

  /** Label for dismiss button */
  dismissLabel: PropTypes.string,
};

export default ErrorMessage;
