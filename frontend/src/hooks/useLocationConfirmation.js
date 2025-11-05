import { useState } from 'react';

/**
 * Custom hook to handle location confirmation flow (VPN/IP detection)
 *
 * This hook consolidates the duplicate logic found in:
 * - WeatherDashboard
 * - LocationComparisonView
 *
 * @param {Function} onLocationConfirmed - Callback when location is confirmed
 * @returns {Object} - Location confirmation state and handlers
 */
export function useLocationConfirmation(onLocationConfirmed) {
  const [pendingLocation, setPendingLocation] = useState(null);
  const [showModal, setShowModal] = useState(false);

  /**
   * Handle location confirmation by user
   */
  const handleConfirm = () => {
    if (pendingLocation && onLocationConfirmed) {
      onLocationConfirmed(pendingLocation);
      setShowModal(false);
      setPendingLocation(null);
    }
  };

  /**
   * Handle location rejection by user
   * @param {boolean} clearLocation - Whether to clear location data on rejection
   */
  const handleReject = (clearLocation = false) => {
    setShowModal(false);
    setPendingLocation(null);

    // Allow caller to decide what to do on rejection
    if (clearLocation && onLocationConfirmed) {
      onLocationConfirmed(null);
    }
  };

  /**
   * Handle modal close (typically uses pending location as fallback)
   * @param {boolean} useFallback - Whether to use pending location if no other location exists
   * @param {boolean} hasExistingLocation - Whether there's already a valid location
   */
  const handleClose = (useFallback = true, hasExistingLocation = false) => {
    // If user closes modal and there's no existing location, use pending as fallback
    if (useFallback && !hasExistingLocation && pendingLocation && onLocationConfirmed) {
      onLocationConfirmed(pendingLocation);
    }

    setShowModal(false);
    setPendingLocation(null);
  };

  /**
   * Set a location that requires confirmation
   * @param {Object} location - Location object from geolocation service
   */
  const requestConfirmation = (location) => {
    setPendingLocation(location);
    setShowModal(true);
  };

  return {
    // State
    pendingLocation,
    showModal,

    // Handlers
    handleConfirm,
    handleReject,
    handleClose,
    requestConfirmation,

    // Direct setters (for advanced use cases)
    setPendingLocation,
    setShowModal,
  };
}

export default useLocationConfirmation;
