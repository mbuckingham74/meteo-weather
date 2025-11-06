import React from 'react';
import PropTypes from 'prop-types';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import ErrorMessage from './ErrorMessage';

/**
 * OfflineBanner Component
 *
 * Displays a persistent banner when the user is offline or has a slow connection.
 * Part of Error Message Improvement Initiative (Phase 4).
 *
 * Features:
 * - Automatic detection of online/offline status
 * - Optional slow connection warning
 * - Customizable messages
 * - Auto-dismisses when connection restored
 *
 * @component
 * @example
 * // Basic usage (auto-detects connectivity)
 * <OfflineBanner />
 *
 * @example
 * // With connection quality checking
 * <OfflineBanner checkQuality={true} />
 *
 * @example
 * // Custom messages
 * <OfflineBanner
 *   offlineMessage="No internet connection. Some features are disabled."
 *   slowMessage="Your connection is slow. Loading may take longer."
 * />
 */
const OfflineBanner = ({
  checkQuality = false,
  showSlowWarning = true,
  offlineMessage = "You're offline. Check your internet connection.",
  slowMessage = 'Your connection is slow. Some features may be delayed.',
  onOnline = null,
  onOffline = null,
  dismissible = false,
  className = '',
}) => {
  const { isOnline, isSlowConnection, connectionQuality } = useOnlineStatus({
    onOnline,
    onOffline,
    checkQuality,
  });

  // Don't render if online and connection is good
  if (isOnline && !isSlowConnection) {
    return null;
  }

  // Determine message and severity
  const message = !isOnline ? offlineMessage : slowMessage;
  const severity = !isOnline ? 'error' : 'warning';
  const shouldShow = !isOnline || (isSlowConnection && showSlowWarning);

  if (!shouldShow) {
    return null;
  }

  return (
    <ErrorMessage
      error={message}
      mode="banner"
      severity={severity}
      dismissible={dismissible}
      showIcon={true}
      className={className}
      onDismiss={null} // Banner should not be dismissible by default for offline state
    />
  );
};

OfflineBanner.propTypes = {
  /** Whether to check connection quality (slow detection) */
  checkQuality: PropTypes.bool,

  /** Whether to show warning for slow connections */
  showSlowWarning: PropTypes.bool,

  /** Message to display when offline */
  offlineMessage: PropTypes.string,

  /** Message to display when connection is slow */
  slowMessage: PropTypes.string,

  /** Callback when connection is restored */
  onOnline: PropTypes.func,

  /** Callback when connection is lost */
  onOffline: PropTypes.func,

  /** Whether banner can be dismissed */
  dismissible: PropTypes.bool,

  /** Additional CSS class name */
  className: PropTypes.string,
};

export default OfflineBanner;
