import API_CONFIG from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Authentication API Service
 * Handles all auth-related API calls
 */

/**
 * Register a new user
 */
export async function registerUser(email, password, name) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  return data;
}

/**
 * Login user
 */
export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  return data;
}

/**
 * Get current user profile
 */
export async function getCurrentUser(accessToken) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch user profile');
  }

  return data.user;
}

/**
 * Update user profile
 */
export async function updateUserProfile(accessToken, updates) {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(updates),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update profile');
  }

  return data.user;
}

/**
 * Change user password
 */
export async function changePassword(accessToken, currentPassword, newPassword) {
  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to change password');
  }

  return data;
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken) {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to refresh token');
  }

  return data;
}

/**
 * Logout user
 */
export async function logoutUser(accessToken) {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Logout failed');
  }

  return data;
}

/**
 * Get user preferences
 */
export async function getUserPreferences(accessToken) {
  const response = await fetch(`${API_BASE_URL}/user/preferences`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch preferences');
  }

  return data.preferences;
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(accessToken, preferences) {
  const response = await fetch(`${API_BASE_URL}/user/preferences`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(preferences),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update preferences');
  }

  return data.preferences;
}

/**
 * Get cloud favorites
 */
export async function getCloudFavorites(accessToken) {
  const response = await fetch(`${API_BASE_URL}/user/favorites`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch favorites');
  }

  return data.favorites;
}

/**
 * Add favorite to cloud
 */
export async function addCloudFavorite(accessToken, favorite) {
  const response = await fetch(`${API_BASE_URL}/user/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(favorite),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to add favorite');
  }

  return data.favorite;
}

/**
 * Remove favorite from cloud
 */
export async function removeCloudFavorite(accessToken, favoriteId) {
  const response = await fetch(`${API_BASE_URL}/user/favorites/${favoriteId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to remove favorite');
  }

  return data;
}

/**
 * Import favorites from localStorage to cloud
 */
export async function importFavorites(accessToken, favorites) {
  const response = await fetch(`${API_BASE_URL}/user/favorites/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ favorites }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to import favorites');
  }

  return data;
}
