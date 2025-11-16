/**
 * Tests for authApi.js
 * Testing authentication and user management API functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile,
  changePassword,
  refreshAccessToken,
  logoutUser,
  getUserPreferences,
  updateUserPreferences,
  getCloudFavorites,
  addCloudFavorite,
  removeCloudFavorite,
  importFavorites,
} from './authApi';

// Mock fetch with proper Response-like object
global.fetch = vi.fn();
// Helper to create a proper mock response
const createMockResponse = (data, options = {}) => {
  const status = options.status || 200;
  const ok = options.ok !== undefined ? options.ok : status < 400;
  let statusText = options.statusText;

  // Auto-generate statusText based on status code if not provided
  if (!statusText) {
    if (status === 200) statusText = 'OK';
    else if (status === 400) statusText = 'Bad Request';
    else if (status === 401) statusText = 'Unauthorized';
    else if (status === 403) statusText = 'Forbidden';
    else if (status === 404) statusText = 'Not Found';
    else if (status === 422) statusText = 'Unprocessable Entity';
    else if (status === 429) statusText = 'Too Many Requests';
    else if (status === 500) statusText = 'Internal Server Error';
    else statusText = 'Error';
  }

  return {
    ok,
    status,
    statusText,
    headers: new Map([['content-type', 'application/json']]),
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
};

describe('Auth API Service', () => {
  const API_BASE_URL = 'http://localhost:5001/api';
  const mockAccessToken = 'mock-access-token-12345';
  const mockRefreshToken = 'mock-refresh-token-67890';

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockClear();
    // Mock localStorage to provide auth token for apiClient
    localStorage.setItem('token', mockAccessToken);
  });

  describe('registerUser', () => {
    it('registers a new user successfully', async () => {
      const mockResponse = {
        user: { id: 1, email: 'test@example.com', name: 'Test User' },
        accessToken: mockAccessToken,
      };

      global.fetch.mockResolvedValue(createMockResponse(mockResponse));

      const result = await registerUser('test@example.com', 'password123', 'Test User');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/register`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('handles registration errors', async () => {
      global.fetch.mockResolvedValue(
        createMockResponse({ error: 'Email already exists' }, { ok: false, status: 400 })
      );

      await expect(registerUser('test@example.com', 'password123', 'Test User')).rejects.toThrow(
        'Email already exists'
      );
    });

    it('handles registration errors without error message', async () => {
      global.fetch.mockResolvedValue(createMockResponse({}, { ok: false, status: 400 }));

      await expect(registerUser('test@example.com', 'password123', 'Test User')).rejects.toThrow(
        'Bad Request'
      );
    });
  });

  describe('loginUser', () => {
    it('logs in user successfully', async () => {
      const mockResponse = {
        user: { id: 1, email: 'test@example.com' },
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      };

      global.fetch.mockResolvedValue(createMockResponse(mockResponse));

      const result = await loginUser('test@example.com', 'password123');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/login`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('handles login errors', async () => {
      global.fetch.mockResolvedValue(
        createMockResponse({ error: 'Invalid credentials' }, { ok: false, status: 400 })
      );

      await expect(loginUser('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });

    it('handles login errors without error message', async () => {
      global.fetch.mockResolvedValue(createMockResponse({}, { ok: false, status: 400 }));

      await expect(loginUser('test@example.com', 'wrong')).rejects.toThrow('Bad Request');
    });
  });

  describe('getCurrentUser', () => {
    it('fetches current user profile successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      };

      global.fetch.mockResolvedValue(createMockResponse({ user: mockUser }));

      const result = await getCurrentUser(mockAccessToken);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/me`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockAccessToken}`,
          }),
        })
      );
      expect(result).toEqual(mockUser);
    });

    it('handles authentication errors', async () => {
      global.fetch.mockResolvedValue(
        createMockResponse({ error: 'Unauthorized' }, { ok: false, status: 400 })
      );

      await expect(getCurrentUser(mockAccessToken)).rejects.toThrow('Unauthorized');
    });

    it('handles errors without error message', async () => {
      global.fetch.mockResolvedValue(createMockResponse({}, { ok: false, status: 400 }));

      await expect(getCurrentUser(mockAccessToken)).rejects.toThrow('Bad Request');
    });
  });

  describe('updateUserProfile', () => {
    it('updates user profile successfully', async () => {
      const updates = { name: 'Updated Name' };
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Updated Name',
      };

      global.fetch.mockResolvedValue(createMockResponse({ user: mockUser }));

      const result = await updateUserProfile(mockAccessToken, updates);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/profile`,
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockAccessToken}`,
          },
          body: JSON.stringify(updates),
        })
      );
      expect(result).toEqual(mockUser);
    });

    it('handles update errors', async () => {
      global.fetch.mockResolvedValue(
        createMockResponse({ error: 'Validation failed' }, { ok: false, status: 400 })
      );

      await expect(updateUserProfile(mockAccessToken, {})).rejects.toThrow('Validation failed');
    });

    it('handles update errors without error message', async () => {
      global.fetch.mockResolvedValue(createMockResponse({}, { ok: false, status: 400 }));

      await expect(updateUserProfile(mockAccessToken, {})).rejects.toThrow('Bad Request');
    });
  });

  describe('changePassword', () => {
    it('changes password successfully', async () => {
      const mockResponse = { message: 'Password changed successfully' };

      global.fetch.mockResolvedValue(createMockResponse(mockResponse));

      const result = await changePassword(mockAccessToken, 'oldPass123', 'newPass456');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/change-password`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockAccessToken}`,
          },
          body: JSON.stringify({
            currentPassword: 'oldPass123',
            newPassword: 'newPass456',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('handles password change errors', async () => {
      global.fetch.mockResolvedValue(
        createMockResponse({ error: 'Current password incorrect' }, { ok: false, status: 400 })
      );

      await expect(changePassword(mockAccessToken, 'wrong', 'newPass456')).rejects.toThrow(
        'Current password incorrect'
      );
    });

    it('handles password change errors without error message', async () => {
      global.fetch.mockResolvedValue(createMockResponse({}, { ok: false, status: 400 }));

      await expect(changePassword(mockAccessToken, 'oldPass', 'newPass')).rejects.toThrow(
        'Bad Request'
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('refreshes access token successfully', async () => {
      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      global.fetch.mockResolvedValue(createMockResponse(mockResponse));

      const result = await refreshAccessToken(mockRefreshToken);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/refresh`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: mockRefreshToken }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('handles refresh token errors', async () => {
      global.fetch.mockResolvedValue(
        createMockResponse({ error: 'Invalid refresh token' }, { ok: false, status: 400 })
      );

      await expect(refreshAccessToken(mockRefreshToken)).rejects.toThrow('Invalid refresh token');
    });

    it('handles refresh token errors without error message', async () => {
      global.fetch.mockResolvedValue(createMockResponse({}, { ok: false, status: 400 }));

      await expect(refreshAccessToken(mockRefreshToken)).rejects.toThrow('Bad Request');
    });
  });

  describe('logoutUser', () => {
    it('logs out user successfully', async () => {
      const mockResponse = { message: 'Logged out successfully' };

      global.fetch.mockResolvedValue(createMockResponse(mockResponse));

      const result = await logoutUser(mockAccessToken);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/logout`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockAccessToken}`,
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('handles logout errors', async () => {
      global.fetch.mockResolvedValue(
        createMockResponse({ error: 'Session expired' }, { ok: false, status: 400 })
      );

      // logoutUser returns success even on failure (see authApi.js lines 294-295)
      const result = await logoutUser(mockAccessToken);
      expect(result).toEqual({ success: true, message: 'Logged out (local only)' });
    });

    it('handles logout errors without error message', async () => {
      global.fetch.mockResolvedValue(createMockResponse({}, { ok: false, status: 400 }));

      // logoutUser returns success even on failure (see authApi.js lines 294-295)
      const result = await logoutUser(mockAccessToken);
      expect(result).toEqual({ success: true, message: 'Logged out (local only)' });
    });
  });

  describe('getUserPreferences', () => {
    it('fetches user preferences successfully', async () => {
      const mockPreferences = {
        temperatureUnit: 'C',
        theme: 'dark',
        language: 'en',
      };

      global.fetch.mockResolvedValue(createMockResponse({ preferences: mockPreferences }));

      const result = await getUserPreferences(mockAccessToken);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/user/preferences`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockAccessToken}`,
          }),
        })
      );
      expect(result).toEqual(mockPreferences);
    });

    it('handles preferences fetch errors', async () => {
      global.fetch.mockResolvedValue(
        createMockResponse({ error: 'User not found' }, { ok: false, status: 400 })
      );

      await expect(getUserPreferences(mockAccessToken)).rejects.toThrow('User not found');
    });

    it('handles preferences fetch errors without error message', async () => {
      global.fetch.mockResolvedValue(createMockResponse({}, { ok: false, status: 400 }));

      await expect(getUserPreferences(mockAccessToken)).rejects.toThrow('Bad Request');
    });
  });

  describe('updateUserPreferences', () => {
    it('updates user preferences successfully', async () => {
      const updates = { temperatureUnit: 'F' };
      const mockPreferences = {
        temperatureUnit: 'F',
        theme: 'dark',
        language: 'en',
      };

      global.fetch.mockResolvedValue(createMockResponse({ preferences: mockPreferences }));

      const result = await updateUserPreferences(mockAccessToken, updates);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/user/preferences`,
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockAccessToken}`,
          },
          body: JSON.stringify(updates),
        })
      );
      expect(result).toEqual(mockPreferences);
    });

    it('handles preferences update errors', async () => {
      global.fetch.mockResolvedValue(
        createMockResponse({ error: 'Invalid preference value' }, { ok: false, status: 400 })
      );

      await expect(updateUserPreferences(mockAccessToken, {})).rejects.toThrow(
        'Invalid preference value'
      );
    });

    it('handles preferences update errors without error message', async () => {
      global.fetch.mockResolvedValue(createMockResponse({}, { ok: false, status: 400 }));

      await expect(updateUserPreferences(mockAccessToken, {})).rejects.toThrow('Bad Request');
    });
  });

  describe('getCloudFavorites', () => {
    it('fetches cloud favorites successfully', async () => {
      const mockFavorites = [
        { id: 1, name: 'London', coordinates: '51.5074,-0.1278' },
        { id: 2, name: 'Paris', coordinates: '48.8566,2.3522' },
      ];

      global.fetch.mockResolvedValue(createMockResponse({ favorites: mockFavorites }));

      const result = await getCloudFavorites(mockAccessToken);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/user/favorites`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockAccessToken}`,
          }),
        })
      );
      expect(result).toEqual(mockFavorites);
    });

    it('handles favorites fetch errors', async () => {
      global.fetch.mockResolvedValue(
        createMockResponse({ error: 'Database error' }, { ok: false, status: 400 })
      );

      await expect(getCloudFavorites(mockAccessToken)).rejects.toThrow('Database error');
    });

    it('handles favorites fetch errors without error message', async () => {
      global.fetch.mockResolvedValue(createMockResponse({}, { ok: false, status: 400 }));

      await expect(getCloudFavorites(mockAccessToken)).rejects.toThrow('Bad Request');
    });
  });

  describe('addCloudFavorite', () => {
    it('adds favorite to cloud successfully', async () => {
      const newFavorite = { name: 'Tokyo', coordinates: '35.6762,139.6503' };
      const mockResponse = { id: 3, ...newFavorite };

      global.fetch.mockResolvedValue(createMockResponse({ favorite: mockResponse }));

      const result = await addCloudFavorite(mockAccessToken, newFavorite);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/user/favorites`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockAccessToken}`,
          },
          body: JSON.stringify(newFavorite),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('handles add favorite errors', async () => {
      global.fetch.mockResolvedValue(
        createMockResponse({ error: 'Duplicate favorite' }, { ok: false, status: 400 })
      );

      await expect(addCloudFavorite(mockAccessToken, {})).rejects.toThrow('Duplicate favorite');
    });

    it('handles add favorite errors without error message', async () => {
      global.fetch.mockResolvedValue(createMockResponse({}, { ok: false, status: 400 }));

      await expect(addCloudFavorite(mockAccessToken, {})).rejects.toThrow('Bad Request');
    });
  });

  describe('removeCloudFavorite', () => {
    it('removes favorite from cloud successfully', async () => {
      const favoriteId = 123;
      const mockResponse = { message: 'Favorite removed' };

      global.fetch.mockResolvedValue(createMockResponse(mockResponse));

      const result = await removeCloudFavorite(mockAccessToken, favoriteId);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/user/favorites/${favoriteId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockAccessToken}`,
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('handles remove favorite errors', async () => {
      global.fetch.mockResolvedValue(
        createMockResponse({ error: 'Favorite not found' }, { ok: false, status: 400 })
      );

      await expect(removeCloudFavorite(mockAccessToken, 999)).rejects.toThrow('Favorite not found');
    });

    it('handles remove favorite errors without error message', async () => {
      global.fetch.mockResolvedValue(createMockResponse({}, { ok: false, status: 400 }));

      await expect(removeCloudFavorite(mockAccessToken, 999)).rejects.toThrow('Bad Request');
    });
  });

  describe('importFavorites', () => {
    it('imports favorites to cloud successfully', async () => {
      const favorites = [
        { name: 'London', coordinates: '51.5074,-0.1278' },
        { name: 'Paris', coordinates: '48.8566,2.3522' },
      ];
      const mockResponse = {
        imported: 2,
        skipped: 0,
        message: 'Import completed',
      };

      global.fetch.mockResolvedValue(createMockResponse(mockResponse));

      const result = await importFavorites(mockAccessToken, favorites);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/user/favorites/import`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockAccessToken}`,
          },
          body: JSON.stringify({ favorites }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('handles import errors', async () => {
      global.fetch.mockResolvedValue(
        createMockResponse({ error: 'Import validation failed' }, { ok: false, status: 400 })
      );

      await expect(importFavorites(mockAccessToken, [])).rejects.toThrow(
        'Import validation failed'
      );
    });

    it('handles import errors without error message', async () => {
      global.fetch.mockResolvedValue(createMockResponse({}, { ok: false, status: 400 }));

      await expect(importFavorites(mockAccessToken, [])).rejects.toThrow('Bad Request');
    });
  });

  describe('Network Errors', () => {
    it('handles network errors in registerUser', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(registerUser('test@example.com', 'password123', 'Test User')).rejects.toThrow(
        'Network error'
      );
    });

    it('handles network errors in loginUser', async () => {
      global.fetch.mockRejectedValue(new Error('Connection refused'));

      await expect(loginUser('test@example.com', 'password123')).rejects.toThrow(
        'Connection refused'
      );
    });

    it('handles network errors in getCurrentUser', async () => {
      global.fetch.mockRejectedValue(new Error('Timeout'));

      await expect(getCurrentUser(mockAccessToken)).rejects.toThrow('Timeout');
    });
  });
});
