/**
 * Toast notification system - Minimal placeholder
 * TODO: Implement full toast system in PR 7
 */
import { createContext, useContext } from 'react';

const ToastContext = createContext({
  showToast: () => {},
  showSuccess: () => {},
  showError: () => {},
  showWarning: () => {},
  showInfo: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const value = {
    showToast: (message) => console.log('[Toast]', message),
    showSuccess: (message) => console.log('[Toast Success]', message),
    showError: (message) => console.error('[Toast Error]', message),
    showWarning: (message) => console.warn('[Toast Warning]', message),
    showInfo: (message) => console.info('[Toast Info]', message),
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export default ToastProvider;
