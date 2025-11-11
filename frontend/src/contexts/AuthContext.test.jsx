/**
 * Tests for AuthContext
 * Testing authentication state management and persistence
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import * as authApi from '../services/authApi';

// Mock authApi
vi.mock('../services/authApi');

// Test component
function TestComponent() {
  const {
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  } = useAuth();

  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <div data-testid="access-token">{accessToken || 'null'}</div>
      <div data-testid="refresh-token">{refreshToken || 'null'}</div>
      <div data-testid="loading">{loading ? 'loading' : 'ready'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="is-authenticated">{isAuthenticated ? 'yes' : 'no'}</div>
      <button onClick={() => register('test@example.com', 'password123', 'Test User')}>
        Register
      </button>
      <button onClick={() => login('test@example.com', 'password123')}>Login</button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => updateUser({ id: 1, email: 'updated@example.com' })}>
        Update User
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  let getItemSpy, setItemSpy, removeItemSpy;

  beforeEach(() => {
    // Mock localStorage
    getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});

    // Mock console.error
    vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.clearAllMocks();
  });

  afterEach(() => {
    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
    removeItemSpy.mockRestore();
    vi.restoreAllMocks();
  });

  describe('Provider', () => {
    it('provides default unauthenticated state', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('access-token')).toHaveTextContent('null');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('no');
    });

    it('loads tokens from localStorage and fetches user', async () => {
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' };

      getItemSpy.mockImplementation((key) => {
        if (key === 'accessToken') return 'stored-access-token';
        if (key === 'refreshToken') return 'stored-refresh-token';
        return null;
      });

      authApi.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      });

      expect(authApi.getCurrentUser).toHaveBeenCalledWith('stored-access-token');
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('yes');
    });

    it('refreshes expired token and fetches user', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };

      getItemSpy.mockImplementation((key) => {
        if (key === 'accessToken') return 'expired-token';
        if (key === 'refreshToken') return 'valid-refresh-token';
        return null;
      });

      // First getCurrentUser call fails (token expired)
      authApi.getCurrentUser.mockRejectedValueOnce(new Error('Token expired'));

      // Refresh succeeds
      authApi.refreshAccessToken.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      // Second getCurrentUser call succeeds
      authApi.getCurrentUser.mockResolvedValueOnce(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      });

      expect(authApi.refreshAccessToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(setItemSpy).toHaveBeenCalledWith('accessToken', 'new-access-token');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('yes');
    });

    it('clears tokens when refresh fails', async () => {
      getItemSpy.mockImplementation((key) => {
        if (key === 'accessToken') return 'expired-token';
        if (key === 'refreshToken') return 'invalid-refresh-token';
        return null;
      });

      authApi.getCurrentUser.mockRejectedValue(new Error('Token expired'));
      authApi.refreshAccessToken.mockRejectedValue(new Error('Refresh failed'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      });

      expect(removeItemSpy).toHaveBeenCalledWith('accessToken');
      expect(removeItemSpy).toHaveBeenCalledWith('refreshToken');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('no');
    });
  });

  describe('register', () => {
    it('registers user successfully', async () => {
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' };
      const mockResponse = {
        user: mockUser,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      authApi.registerUser.mockResolvedValue(mockResponse);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      });

      await act(async () => {
        screen.getByText('Register').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('yes');
      });

      expect(authApi.registerUser).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        'Test User'
      );

      expect(setItemSpy).toHaveBeenCalledWith('accessToken', 'new-access-token');
      expect(setItemSpy).toHaveBeenCalledWith('refreshToken', 'new-refresh-token');
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
    });
  });

  describe('login', () => {
    it('logs in user successfully', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockResponse = {
        user: mockUser,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      authApi.loginUser.mockResolvedValue(mockResponse);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      });

      await act(async () => {
        screen.getByText('Login').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('yes');
      });

      expect(authApi.loginUser).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(setItemSpy).toHaveBeenCalledWith('accessToken', 'new-access-token');
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
    });
  });

  describe('logout', () => {
    it('logs out user successfully', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };

      getItemSpy.mockImplementation((key) => {
        if (key === 'accessToken') return 'access-token';
        if (key === 'refreshToken') return 'refresh-token';
        return null;
      });

      authApi.getCurrentUser.mockResolvedValue(mockUser);
      authApi.logoutUser.mockResolvedValue({ message: 'Logged out' });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('yes');
      });

      await act(async () => {
        screen.getByText('Logout').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('no');
      });

      expect(authApi.logoutUser).toHaveBeenCalledWith('access-token');
      expect(removeItemSpy).toHaveBeenCalledWith('accessToken');
      expect(removeItemSpy).toHaveBeenCalledWith('refreshToken');
    });

    it('handles logout errors gracefully', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };

      getItemSpy.mockImplementation((key) => {
        if (key === 'accessToken') return 'access-token';
        return null;
      });

      authApi.getCurrentUser.mockResolvedValue(mockUser);
      authApi.logoutUser.mockRejectedValue(new Error('Logout failed'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('yes');
      });

      await act(async () => {
        screen.getByText('Logout').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('no');
      });

      expect(console.error).toHaveBeenCalledWith('Logout error:', expect.any(Error));
      // Should still clear state even if API call fails
      expect(removeItemSpy).toHaveBeenCalledWith('accessToken');
    });
  });

  describe('updateUser', () => {
    it('updates user data', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };

      getItemSpy.mockImplementation((key) => {
        if (key === 'accessToken') return 'access-token';
        return null;
      });

      authApi.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      });

      act(() => {
        screen.getByText('Update User').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(
          JSON.stringify({ id: 1, email: 'updated@example.com' })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('requires AuthProvider to function', () => {
      const TestWithoutProvider = () => {
        try {
          useAuth();
          return <div>Should not render</div>;
        } catch (error) {
          return <div data-testid="error">{error.message}</div>;
        }
      };

      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<TestWithoutProvider />);

      expect(screen.getByTestId('error')).toHaveTextContent(
        'useAuth must be used within an AuthProvider'
      );

      spy.mockRestore();
    });

    it('handles auth initialization errors gracefully', async () => {
      getItemSpy.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      });

      expect(console.error).toHaveBeenCalledWith('Auth initialization error:', expect.any(Error));
    });
  });
});
