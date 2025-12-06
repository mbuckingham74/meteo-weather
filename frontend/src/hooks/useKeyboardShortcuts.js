import { useEffect, useCallback } from 'react';

/**
 * Custom hook for keyboard shortcuts
 * Provides accessible keyboard navigation throughout the app
 *
 * Supported shortcuts:
 * - '/' - Focus search bar
 * - 'Escape' - Close modals, clear search
 * - 'Ctrl+K' / 'Cmd+K' - Quick search
 * - '?' - Show keyboard shortcuts help (future)
 */

const useKeyboardShortcuts = (handlers = {}) => {
  const handleKeyDown = useCallback(
    (event) => {
      const { key, ctrlKey, metaKey, target } = event;

      // Don't trigger shortcuts when typing in input fields (except for Escape)
      const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if (isInputField && key !== 'Escape') {
        return;
      }

      // Slash (/) - Focus search
      if (key === '/' && handlers.onFocusSearch) {
        event.preventDefault();
        handlers.onFocusSearch();
      }

      // Escape - Close modals, unfocus search
      if (key === 'Escape' && handlers.onEscape) {
        event.preventDefault();
        handlers.onEscape();
      }

      // Ctrl+K or Cmd+K - Quick search
      if ((ctrlKey || metaKey) && key === 'k' && handlers.onQuickSearch) {
        event.preventDefault();
        handlers.onQuickSearch();
      }

      // Question mark (?) - Show help (future feature)
      if (key === '?' && handlers.onShowHelp) {
        event.preventDefault();
        handlers.onShowHelp();
      }

      // Arrow keys for navigation (when not in input)
      if (!isInputField) {
        if (key === 'ArrowUp' && handlers.onArrowUp) {
          event.preventDefault();
          handlers.onArrowUp();
        }
        if (key === 'ArrowDown' && handlers.onArrowDown) {
          event.preventDefault();
          handlers.onArrowDown();
        }
      }
    },
    [handlers]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

/**
 * Hook for managing focus trap in modals
 * Ensures keyboard focus stays within modal when open
 */
export const useFocusTrap = (isOpen, containerRef) => {
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element when modal opens
    firstElement?.focus();

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift+Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen, containerRef]);
};

/**
 * Hook for screen reader announcements
 * Creates ARIA live region for dynamic content updates
 */
export const useScreenReaderAnnouncement = () => {
  const announce = useCallback((message, priority = 'polite') => {
    // Create or get existing announcement element
    let announcer = document.getElementById('sr-announcer');

    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'sr-announcer';
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      document.body.appendChild(announcer);
    }

    // Update priority if different
    if (announcer.getAttribute('aria-live') !== priority) {
      announcer.setAttribute('aria-live', priority);
    }

    // Clear and set message
    announcer.textContent = '';
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);
  }, []);

  return { announce };
};

/**
 * Hook for skip links navigation
 * Allows keyboard users to skip repetitive content
 */
export const useSkipLinks = () => {
  const skipToContent = useCallback((targetId) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return { skipToContent };
};

export default useKeyboardShortcuts;
