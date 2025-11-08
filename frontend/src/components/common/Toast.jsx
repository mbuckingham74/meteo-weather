import { useEffect } from 'react';
import './Toast.css';

/**
 * Toast Component
 * Displays temporary notification messages
 *
 * @param {Object} props
 * @param {string} props.message - Message to display
 * @param {string} props.type - Type of toast: 'success', 'error', 'info', 'warning'
 * @param {number} props.duration - Duration in ms before auto-dismiss (default: 4000)
 * @param {Function} props.onClose - Callback when toast is dismissed
 */
function Toast({ message, type = 'info', duration = 4000, onClose }) {
  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`toast toast-${type}`} role="alert" aria-live="polite">
      <span className="toast-icon">{getIcon()}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Close notification">
        ×
      </button>
    </div>
  );
}

export default Toast;
