import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Stack, Surface } from '@components/ui/primitives';
import styles from './AuthModal.module.css';

/**
 * AuthModal Component
 * Combined login and registration modal
 */
function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Refs for focus management
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        // Validation
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        await register(email, password, name);
        setSuccess('Registration successful! Welcome aboard!');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        await login(email, password);
        setSuccess('Login successful! Welcome back!');
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    if (!loading) {
      setError(null);
      setSuccess(null);
      setEmail('');
      setPassword('');
      setName('');
      setConfirmPassword('');
      onClose();
    }
  }, [loading, onClose]);

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
    setSuccess(null);
  };

  // Focus trap and keyboard navigation
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

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
      if (e.key === 'Escape' && !loading) {
        handleClose();
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
  }, [handleClose, isOpen, loading]);

  // Return null if modal is not open - MUST be after all hooks
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose} role="presentation">
      <Surface
        as="section"
        ref={modalRef}
        padding="none"
        radius="xl"
        elevation="lg"
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        aria-describedby="auth-modal-subtitle"
      >
        <Stack as="header" align="center" gap="xs" className={styles.header}>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close authentication dialog"
          >
            <span aria-hidden="true">×</span>
          </button>
          <h2 id="auth-modal-title" className={styles.title}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p id="auth-modal-subtitle" className={styles.subtitle}>
            {mode === 'login'
              ? 'Sign in to access your weather preferences'
              : 'Join us to save your favorite locations and preferences'}
          </p>
        </Stack>

        <div className={styles.body}>
          <Stack as="form" gap="lg" className={styles.form} onSubmit={handleSubmit}>
            {mode === 'register' && (
              <Stack as="div" gap="xs" className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className={styles.input}
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </Stack>
            )}

            <Stack as="div" gap="xs" className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className={styles.input}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </Stack>

            <Stack as="div" gap="xs" className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input
                type="password"
                id="password"
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </Stack>

            {mode === 'register' && (
              <Stack as="div" gap="xs" className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className={styles.input}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </Stack>
            )}

            {error && (
              <p className={styles.error} role="alert" aria-live="polite">
                {error}
              </p>
            )}
            {success && (
              <p className={styles.success} role="alert" aria-live="polite">
                {success}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className={styles.fullWidth}
              disabled={loading}
            >
              {loading && <span className={styles.loadingSpinner} />}
              {loading
                ? mode === 'login'
                  ? 'Signing in...'
                  : 'Creating account...'
                : mode === 'login'
                  ? 'Sign In'
                  : 'Create Account'}
            </Button>
          </Stack>
        </div>

        <Stack as="footer" align="center" justify="center" className={styles.footer}>
          <p className={styles.switchText}>
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button"
              className={styles.switchButton}
              onClick={switchMode}
              disabled={loading}
            >
              {mode === 'login' ? 'Create one!' : 'Sign in'}
            </button>
          </p>
        </Stack>
      </Surface>
    </div>
  );
}

export default AuthModal;
