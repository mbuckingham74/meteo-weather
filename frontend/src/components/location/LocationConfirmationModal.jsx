import React from 'react';
import './LocationConfirmationModal.css';

/**
 * LocationConfirmationModal
 * Displays detected location and asks user to confirm accuracy
 * Helps catch VPN/IP geolocation errors
 */
function LocationConfirmationModal({ location, onConfirm, onReject, onClose }) {
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

  return (
    <div className="location-modal-overlay" onClick={onClose}>
      <div className="location-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="location-modal-header">
          <h3>📍 Confirm Your Location</h3>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
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

            {location?.method === 'ip' && (
              <div className="vpn-warning">
                <span className="warning-icon">🔒</span>
                <div className="warning-content">
                  <strong>VPN/Proxy Detected?</strong>
                  <p>
                    This location was detected using your IP address. If you're using a VPN or proxy,
                    this might not be your actual location. Please verify it's correct.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="confirmation-question">
            <p>Is this your current location?</p>
          </div>
        </div>

        <div className="location-modal-footer">
          <button
            className="modal-btn modal-btn-secondary"
            onClick={onReject}
          >
            ❌ No, let me search
          </button>
          <button
            className="modal-btn modal-btn-primary"
            onClick={onConfirm}
          >
            ✅ Yes, this is correct
          </button>
        </div>
      </div>
    </div>
  );
}

export default LocationConfirmationModal;
