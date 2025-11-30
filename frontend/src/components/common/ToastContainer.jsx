/**
 * Toast notification system
 * Provides toast notifications with auto-dismiss and queue management
 */
import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback for when used outside provider (e.g., during SSR or tests)
    return {
      showToast: () => {},
      showSuccess: () => {},
      showError: () => {},
      showWarning: () => {},
      showInfo: () => {},
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
    };
  }
  return context;
}

const TOAST_DURATION = 5000;

const toastStyles = {
  success: {
    bg: 'bg-green-900/90',
    border: 'border-green-700',
    icon: CheckCircle,
    iconColor: 'text-green-400',
  },
  error: {
    bg: 'bg-red-900/90',
    border: 'border-red-700',
    icon: AlertCircle,
    iconColor: 'text-red-400',
  },
  warning: {
    bg: 'bg-yellow-900/90',
    border: 'border-yellow-700',
    icon: AlertTriangle,
    iconColor: 'text-yellow-400',
  },
  info: {
    bg: 'bg-blue-900/90',
    border: 'border-blue-700',
    icon: Info,
    iconColor: 'text-blue-400',
  },
};

function Toast({ id, type, message, onDismiss }) {
  const style = toastStyles[type] || toastStyles.info;
  const Icon = style.icon;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${style.bg} ${style.border} shadow-elevated animate-slide-in`}
    >
      <Icon size={20} className={style.iconColor} />
      <p className="flex-1 text-sm text-text-primary">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="text-text-muted hover:text-text-primary transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message) => {
    const id = Date.now() + Math.random();

    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto dismiss after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION);

    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // API methods
  const showSuccess = useCallback((message) => addToast('success', message), [addToast]);
  const showError = useCallback((message) => addToast('error', message), [addToast]);
  const showWarning = useCallback((message) => addToast('warning', message), [addToast]);
  const showInfo = useCallback((message) => addToast('info', message), [addToast]);

  const value = {
    // New API
    showToast: (message, type = 'info') => addToast(type, message),
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

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast Container - Fixed position bottom right */}
      {toasts.length > 0 && (
        <div
          aria-label="Notifications"
          className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm"
        >
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} onDismiss={dismissToast} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export default ToastProvider;
