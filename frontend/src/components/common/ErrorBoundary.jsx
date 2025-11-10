import React from 'react';
import './ErrorBoundary.css';

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * Displays fallback UI and provides error reporting capability
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(_error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Send to error logging service (e.g., Sentry, LogRocket)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // TODO: Integrate with error monitoring service
    // Example: Sentry.captureException(error, { extra: errorInfo });

    const errorDetails = {
      message: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.log('📊 Error logged:', errorDetails);

    // In production, send to backend logging endpoint
    if (process.env.NODE_ENV === 'production') {
      // fetch('/api/errors/log', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorDetails)
      // }).catch(err => console.error('Failed to log error:', err));
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReportIssue = () => {
    const { error, errorInfo } = this.state;

    // Generate GitHub issue URL with pre-filled details
    const issueTitle = encodeURIComponent(`Bug Report: ${error?.message || 'Application Error'}`);
    const issueBody = encodeURIComponent(`
## Error Details

**Message:** ${error?.message || 'Unknown error'}

**Stack Trace:**
\`\`\`
${error?.stack || 'No stack trace available'}
\`\`\`

**Component Stack:**
\`\`\`
${errorInfo?.componentStack || 'No component stack available'}
\`\`\`

## Environment

- **URL:** ${window.location.href}
- **User Agent:** ${navigator.userAgent}
- **Timestamp:** ${new Date().toISOString()}

## Steps to Reproduce

1.
2.
3.

## Expected Behavior


## Actual Behavior


    `);

    // Open GitHub issue in new tab
    const githubUrl = `https://github.com/mbuckingham74/meteo-weather/issues/new?title=${issueTitle}&body=${issueBody}`;
    window.open(githubUrl, '_blank');
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorCount } = this.state;
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            {/* Icon */}
            <div className="error-boundary-icon">⚠️</div>

            {/* Title */}
            <h1 className="error-boundary-title">Oops! Something went wrong</h1>

            {/* Message */}
            <p className="error-boundary-message">
              We&apos;re sorry for the inconvenience. The application encountered an unexpected
              error.
            </p>

            {/* Error count warning */}
            {errorCount > 2 && (
              <div className="error-boundary-warning">
                <strong>Multiple errors detected ({errorCount})</strong>
                <p>There may be a persistent issue. Please try refreshing the page.</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="error-boundary-actions">
              <button className="error-boundary-button primary" onClick={this.handleReset}>
                🔄 Try Again
              </button>
              <button
                className="error-boundary-button secondary"
                onClick={() => window.location.reload()}
              >
                ↻ Refresh Page
              </button>
              <button className="error-boundary-button tertiary" onClick={this.handleReportIssue}>
                🐛 Report Issue
              </button>
            </div>

            {/* Development-only error details */}
            {isDevelopment && error && (
              <details className="error-boundary-details">
                <summary>🔧 Error Details (Development Only)</summary>
                <div className="error-boundary-details-content">
                  <div className="error-detail-section">
                    <h3>Error Message:</h3>
                    <pre>{error.toString()}</pre>
                  </div>

                  {error.stack && (
                    <div className="error-detail-section">
                      <h3>Stack Trace:</h3>
                      <pre>{error.stack}</pre>
                    </div>
                  )}

                  {errorInfo?.componentStack && (
                    <div className="error-detail-section">
                      <h3>Component Stack:</h3>
                      <pre>{errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Help text */}
            <div className="error-boundary-help">
              <p>If this problem persists, please:</p>
              <ul>
                <li>Clear your browser cache and cookies</li>
                <li>Try using a different browser</li>
                <li>Report the issue using the button above</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
