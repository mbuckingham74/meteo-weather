import { useEffect, useRef } from 'react';
import './LocationConfirmationModal.css';

/**
 * LocationConfirmationModal
 * Displays detected location and asks user to confirm accuracy
 * Helps catch VPN/IP geolocation errors
 */
function LocationConfirmationModal({ location, onConfirm, onReject, onClose }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const getAccuracyLabel = (accuracy, method) => {
    if (method === 'ip') {
      return { icon: '🌐', label: 'City-level (IP)', color: 'orange' };
    }

    if (!accuracy) {
      return { icon: '📍', label: 'Approximate', color: 'blue' };
    }

    if (accuracy < 100) {
      return { icon: '🎯', label: 'Precise (GPS)', color: 'green' };
    } else if (accuracy < 1000) {
      return { icon: '📍', label: 'Approximate (Wi-Fi)', color: 'blue' };
    } else {
      return { icon: '🌐', label: 'City-level (IP)', color: 'orange' };
    }
  };

  const accuracyInfo = getAccuracyLabel(location?.accuracy, location?.method);

  // Focus trap and keyboard navigation
  useEffect(() => {
    if (!modalRef.current) return;

    // Store the element that had focus before opening modal
    previousFocusRef.current = document.activeElement;

    // Get all focusable elements in the modal
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first element when modal opens
    setTimeout(() => firstElement?.focus(), 100);

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
      // Close on Escape
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Tab key focus trap
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab: wrap to last element
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          // Tab: wrap to first element
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup: restore focus when modal closes
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [onClose]);

  return (
    <div className="location-modal-overlay" onClick={onClose} role="presentation">
      <div
        ref={modalRef}
        className="location-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
        aria-describedby="location-modal-description"
      >
        <div className="location-modal-header">
          <h3 id="location-modal-title">📍 Confirm Your Location</h3>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close location confirmation dialog"
          >
            ✕
          </button>
        </div>

        <div className="location-modal-body">
          <div className="detected-location-card">
            <div className="location-info">
              <span className="location-icon">{accuracyInfo.icon}</span>
              <div className="location-details">
                <div className="location-name">{location?.address || 'Unknown Location'}</div>
                <div className="location-accuracy" data-accuracy-color={accuracyInfo.color}>
                  {accuracyInfo.label}
                  {location?.accuracy && ` (±${Math.round(location.accuracy)}m)`}
                </div>
                {location?.latitude && location?.longitude && (
                  <div className="location-coords">
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </div>
                )}
              </div>
            </div>

            {/* Only show VPN warning if location seems suspicious - not for normal IP geolocation */}
            {location?.method === 'ip' && location?.accuracy > 10000 && (
              <div className="vpn-warning">
                <span className="warning-icon">🔒</span>
                <div className="warning-content">
                  <strong>VPN/Proxy Detected?</strong>
                  <p>
                    Location accuracy is very low. If you&apos;re using a VPN or proxy, this might
                    not be your actual location. Please verify it&apos;s correct.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="confirmation-question">
            <p id="location-modal-description">Is this your current location?</p>
          </div>
        </div>

        <div className="location-modal-footer">
          <button className="modal-btn modal-btn-secondary" onClick={onReject}>
            ❌ No, let me search
          </button>
          <button className="modal-btn modal-btn-primary" onClick={onConfirm}>
            ✅ Yes, this is correct
          </button>
        </div>
      </div>
    </div>
  );
}

export default LocationConfirmationModal;
