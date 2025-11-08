import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import {
  changePassword,
  getUserPreferences,
  updateUserPreferences,
  updateUserProfile,
  getCloudFavorites,
  removeCloudFavorite
} from '../../services/authApi';
import './UserProfileModal.css';

/**
 * UserProfileModal Component
 * Manages user profile, preferences, password, and favorites
 */
function UserProfileModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, accessToken, logout, updateUser } = useAuth();
  const { selectLocation } = useLocation();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'preferences', 'security', 'favorites'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Preferences state
  const [preferences, setPreferences] = useState({
    temperature_unit: 'C',
    default_forecast_days: 7,
    default_location: '',
    theme: 'light'
  });

  // Favorites state
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const loadPreferences = useCallback(async () => {
    try {
      const prefs = await getUserPreferences(accessToken);
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }, [accessToken]);

  const loadFavorites = useCallback(async () => {
    if (!accessToken) return;

    setFavoritesLoading(true);
    try {
      const cloudFavs = await getCloudFavorites(accessToken);
      setFavorites(cloudFavs);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setFavoritesLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (isOpen && accessToken) {
      loadPreferences();
      loadFavorites();
    }
  }, [isOpen, accessToken, loadPreferences, loadFavorites]);

  if (!isOpen) return null;

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    onClose();
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const updatedUser = await updateUserProfile(accessToken, { name, email });
      updateUser(updatedUser);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await changePassword(accessToken, currentPassword, newPassword);
      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreferences = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const updated = await updateUserPreferences(accessToken, preferences);
      setPreferences(updated);
      setSuccess('Preferences saved successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    setError(null);
    setSuccess(null);
    setFavoritesLoading(true);

    try {
      await removeCloudFavorite(accessToken, favoriteId);
      await loadFavorites();
      setSuccess('Favorite removed successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const handleSelectFavorite = (favorite) => {
    selectLocation(favorite);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="profile-modal-overlay" onClick={handleClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <button className="profile-modal-close" onClick={handleClose}>
            ×
          </button>
          <h2 className="profile-modal-title">Account Settings</h2>
          <p className="profile-modal-subtitle">Manage your profile and preferences</p>
        </div>

        <div className="profile-modal-body">
          {/* Tabs */}
          <div className="profile-tabs">
            <button
              className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`profile-tab ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              ⭐ Favorites
            </button>
            <button
              className={`profile-tab ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              Preferences
            </button>
            <button
              className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
          </div>

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="profile-info-card">
                <div className="profile-info-row">
                  <span className="profile-info-label">Member Since</span>
                  <span className="profile-info-value">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="profile-info-row">
                  <span className="profile-info-label">Last Login</span>
                  <span className="profile-info-value">
                    {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="auth-form">
                <div className="form-group">
                  <label htmlFor="profile-name" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="profile-name"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="profile-email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="profile-email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="profile-action-button"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="profile-section">
              <h3 className="profile-section-title">Weather Preferences</h3>

              <div className="preferences-grid">
                <div className="preference-item">
                  <div className="preference-label">
                    <span className="preference-label-text">Temperature Unit</span>
                    <span className="preference-label-description">
                      Default temperature unit for weather display
                    </span>
                  </div>
                  <div className="preference-control">
                    <select
                      value={preferences.temperature_unit}
                      onChange={(e) =>
                        setPreferences({ ...preferences, temperature_unit: e.target.value })
                      }
                    >
                      <option value="C">Celsius (°C)</option>
                      <option value="F">Fahrenheit (°F)</option>
                    </select>
                  </div>
                </div>

                <div className="preference-item">
                  <div className="preference-label">
                    <span className="preference-label-text">Default Forecast Days</span>
                    <span className="preference-label-description">
                      Number of days to show in forecast
                    </span>
                  </div>
                  <div className="preference-control">
                    <select
                      value={preferences.default_forecast_days}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          default_forecast_days: parseInt(e.target.value)
                        })
                      }
                    >
                      <option value="3">3 days</option>
                      <option value="7">7 days</option>
                      <option value="14">14 days</option>
                    </select>
                  </div>
                </div>

                <div className="preference-item">
                  <div className="preference-label">
                    <span className="preference-label-text">Theme</span>
                    <span className="preference-label-description">
                      App color theme preference
                    </span>
                  </div>
                  <div className="preference-control">
                    <select
                      value={preferences.theme}
                      onChange={(e) =>
                        setPreferences({ ...preferences, theme: e.target.value })
                      }
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                className="profile-action-button"
                onClick={handleUpdatePreferences}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>

              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color, #e0e0e0)' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Want more control? Configure email notifications, weather reports, and advanced settings.
                </p>
                <button
                  className="profile-action-button"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                    color: 'white',
                    fontWeight: '600'
                  }}
                  onClick={() => {
                    onClose();
                    navigate('/preferences');
                  }}
                >
                  ⚙️ Advanced Settings & Email Preferences
                </button>
              </div>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="profile-section">
              <h3 className="profile-section-title">
                Your Favorite Locations
                {favorites.length > 0 && (
                  <span className="favorite-count-badge">{favorites.length}</span>
                )}
              </h3>

              {favoritesLoading && (
                <div className="favorites-loading">
                  <div className="spinner-small"></div>
                  <p>Loading favorites...</p>
                </div>
              )}

              {!favoritesLoading && favorites.length === 0 && (
                <div className="favorites-empty-state">
                  <span className="empty-icon">⭐</span>
                  <h4>No favorite locations yet</h4>
                  <p>Add locations to your favorites from the main dashboard.</p>
                  <p className="empty-hint">
                    Your favorites are securely stored and synced across all your devices.
                  </p>
                </div>
              )}

              {!favoritesLoading && favorites.length > 0 && (
                <div className="favorites-list-profile">
                  {favorites.map((favorite) => (
                    <div
                      key={favorite.id}
                      className="favorite-item-profile"
                    >
                      <div
                        className="favorite-content"
                        onClick={() => handleSelectFavorite(favorite)}
                      >
                        <div className="favorite-icon">📍</div>
                        <div className="favorite-details">
                          <div className="favorite-name-profile">
                            {favorite.address || favorite.location_name}
                          </div>
                          <div className="favorite-coords-profile">
                            {favorite.latitude.toFixed(4)}, {favorite.longitude.toFixed(4)}
                            {favorite.timezone && ` • ${favorite.timezone}`}
                          </div>
                        </div>
                      </div>
                      <button
                        className="remove-favorite-button"
                        onClick={() => handleRemoveFavorite(favorite.id)}
                        title="Remove from favorites"
                        disabled={favoritesLoading}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {favorites.length > 0 && (
                <div className="favorites-info">
                  <p>
                    💾 {favorites.length} location{favorites.length !== 1 ? 's' : ''} saved • Synced to cloud
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="profile-section">
              <h3 className="profile-section-title">Change Password</h3>

              <form onSubmit={handleChangePassword} className="password-change-form">
                <div className="form-group">
                  <label htmlFor="current-password" className="form-label">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="current-password"
                    className="form-input"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="new-password" className="form-label">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    className="form-input"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-new-password" className="form-label">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirm-new-password"
                    className="form-input"
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="profile-action-button"
                  disabled={loading}
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="profile-modal-footer">
          <button
            className="profile-action-button danger"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProfileModal;
