/**
 * useApi Hook
 * Safe wrapper around API requests that prevents infinite loops with toast notifications
 * and provides consistent error handling across components.
 *
 * PROBLEM SOLVED:
 * Using toast in useCallback dependencies causes infinite loops because toast
 * is recreated on every render. This hook solves that by using useRef.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { apiRequest, ApiError } from '../services/apiClient';

/**
 * Custom hook for making API requests with toast notifications
 * @param {Object} options - Hook options
 * @param {boolean} options.showSuccessToast - Show toast on success (default: false)
 * @param {boolean} options.showErrorToast - Show toast on error (default: true)
 * @returns {Function} API request function
 *
 * @example
 * // Basic usage
 * const api = useApi();
 * const fetchData = useCallback(async () => {
 *   const data = await api('/admin/stats');
 *   setStats(data.stats);
 * }, [api]);
 *
 * @example
 * // With custom error handling
 * const api = useApi({ showErrorToast: false });
 * const fetchData = useCallback(async () => {
 *   try {
 *     const data = await api('/admin/stats');
 *     setStats(data.stats);
 *   } catch (error) {
 *     // Custom error handling
 *     if (error.status === 404) {
 *       setStats(null);
 *     }
 *   }
 * }, [api]);
 *
 * @example
 * // POST request
 * const api = useApi({ showSuccessToast: true });
 * const createKey = useCallback(async (keyData) => {
 *   const result = await api('/api-keys', { method: 'POST', body: keyData });
 *   return result;
 * }, [api]);
 */
export function useApi(options = {}) {
  const { showSuccessToast = false, showErrorToast = true } = options;

  const toast = useToast();

  // Use ref to prevent toast from triggering re-renders
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  // Stable API request function that won't cause infinite loops
  const request = useCallback(
    async (endpoint, requestOptions = {}) => {
      try {
        const data = await apiRequest(endpoint, requestOptions);

        // Show success toast if enabled
        if (showSuccessToast && requestOptions.successMessage) {
          toastRef.current.success(requestOptions.successMessage);
        }

        return data;
      } catch (error) {
        // Show error toast if enabled
        if (showErrorToast) {
          const errorMessage =
            error instanceof ApiError ? error.message : 'An unexpected error occurred';
          toastRef.current.error(errorMessage);
        }

        // Re-throw so caller can handle if needed
        throw error;
      }
    },
    [showSuccessToast, showErrorToast]
  );

  return request;
}

/**
 * Hook for API requests with loading state management
 * @param {Function} apiFunction - Async function that makes the API call
 * @param {Array} dependencies - Dependencies array for useCallback
 * @returns {Object} { data, loading, error, execute, reset }
 *
 * @example
 * const { data, loading, error, execute } = useApiWithLoading(
 *   async (api) => {
 *     const result = await api('/admin/stats');
 *     return result.stats;
 *   },
 *   []
 * );
 *
 * // Call execute() to trigger the request
 * useEffect(() => {
 *   execute();
 * }, [execute]);
 */
export function useApiWithLoading(apiFunction, dependencies = []) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
  });

  const api = useApi({ showErrorToast: false });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await apiFunction(api);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      setState({ data: null, loading: false, error });
      throw error;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, ...dependencies]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

export default useApi;
