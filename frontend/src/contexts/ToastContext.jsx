/**
 * Toast notification context
 * Provides toast notification API throughout the app
 */
import { createContext, useContext } from 'react';

const ToastContext = createContext({
  // New API
  showToast: () => {},
  showSuccess: () => {},
  showError: () => {},
  showWarning: () => {},
  showInfo: () => {},
  // Legacy API (used by useApi hook)
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  // Shared implementations - console placeholders until UI is built
  const showSuccess = (message) => console.log('[Toast Success]', message);
  const showError = (message) => console.error('[Toast Error]', message);
  const showWarning = (message) => console.warn('[Toast Warning]', message);
  const showInfo = (message) => console.info('[Toast Info]', message);

  const value = {
    // New API
    showToast: (message) => console.log('[Toast]', message),
    showSuccess,
    showError,
    showWarning,
    showInfo,
    // Legacy API (aliases for useApi compatibility)
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export default ToastProvider;
