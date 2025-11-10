import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid as LayoutGrid, Stack, Surface } from '@components/ui/primitives';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import {
  changePassword,
  getUserPreferences,
  updateUserPreferences,
  updateUserProfile,
  getCloudFavorites,
  removeCloudFavorite,
} from '../../services/authApi';
import styles from './UserProfileModal.module.css';

/**
 * UserProfileModal Component
 * Manages user profile, preferences, password, and favorites
 */
function UserProfileModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, accessToken, logout, updateUser } = useAuth();
  const { selectLocation } = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
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
    theme: 'light',
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
    } catch (err) {
      console.error('Failed to load preferences:', err);
    }
  }, [accessToken]);

  const loadFavorites = useCallback(async () => {
    if (!accessToken) return;

    setFavoritesLoading(true);
    try {
      const cloudFavs = await getCloudFavorites(accessToken);
      setFavorites(cloudFavs);
    } catch (err) {
      console.error('Failed to load favorites:', err);
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

  const tabClass = (value) =>
    value === activeTab ? `${styles.tab} ${styles.tabActive}` : styles.tab;

  return (
    <div className={styles.overlay} onClick={handleClose} role="presentation">
      <Surface
        as="section"
        padding="none"
        radius="xl"
        elevation="lg"
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        aria-describedby="profile-modal-subtitle"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close profile dialog"
          >
            ×
          </button>
          <h2 id="profile-modal-title" className={styles.title}>
            Account Settings
          </h2>
          <p id="profile-modal-subtitle" className={styles.subtitle}>
            Manage your profile and preferences
          </p>
        </header>

        <div className={styles.body}>
          <div className={styles.tabs} role="tablist" aria-label="Account sections">
            <button
              type="button"
              className={tabClass('profile')}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              type="button"
              className={tabClass('favorites')}
              onClick={() => setActiveTab('favorites')}
            >
              ⭐ Favorites
            </button>
            <button
              type="button"
              className={tabClass('preferences')}
              onClick={() => setActiveTab('preferences')}
            >
              Preferences
            </button>
            <button
              type="button"
              className={tabClass('security')}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
          </div>

          {error && <p className={styles.feedbackError}>{error}</p>}
          {success && <p className={styles.feedbackSuccess}>{success}</p>}

          {activeTab === 'profile' && (
            <Stack as="section" gap="lg" className={styles.section}>
              <Surface padding="lg" className={styles.infoCard}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Member Since</span>
                  <span className={styles.infoValue}>
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Last Login</span>
                  <span className={styles.infoValue}>
                    {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </Surface>

              <form onSubmit={handleUpdateProfile} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="profile-name" className={styles.formLabel}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="profile-name"
                    className={styles.formInput}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="profile-email" className={styles.formLabel}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="profile-email"
                    className={styles.formInput}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <button type="submit" className={styles.actionButton} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </Stack>
          )}

          {activeTab === 'preferences' && (
            <Stack as="section" gap="lg" className={styles.section}>
              <h3 className={styles.sectionTitle}>Weather Preferences</h3>

              <LayoutGrid columns={{ base: 1 }} gap="md" className={styles.preferenceGrid}>
                <Surface padding="md" className={styles.preferenceItem}>
                  <div className={styles.preferenceLabel}>
                    <span className={styles.preferenceLabelText}>Temperature Unit</span>
                    <span className={styles.preferenceDescription}>
                      Default temperature unit for weather display
                    </span>
                  </div>
                  <div className={styles.preferenceControl}>
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
                </Surface>

                <Surface padding="md" className={styles.preferenceItem}>
                  <div className={styles.preferenceLabel}>
                    <span className={styles.preferenceLabelText}>Default Forecast Days</span>
                    <span className={styles.preferenceDescription}>
                      Number of days to show in forecast
                    </span>
                  </div>
                  <div className={styles.preferenceControl}>
                    <select
                      value={preferences.default_forecast_days}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          default_forecast_days: Number.parseInt(e.target.value, 10),
                        })
                      }
                    >
                      <option value="3">3 days</option>
                      <option value="7">7 days</option>
                      <option value="14">14 days</option>
                    </select>
                  </div>
                </Surface>

                <Surface padding="md" className={styles.preferenceItem}>
                  <div className={styles.preferenceLabel}>
                    <span className={styles.preferenceLabelText}>Theme</span>
                    <span className={styles.preferenceDescription}>App color theme preference</span>
                  </div>
                  <div className={styles.preferenceControl}>
                    <select
                      value={preferences.theme}
                      onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </Surface>
              </LayoutGrid>

              <button
                className={styles.actionButton}
                onClick={handleUpdatePreferences}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>

              <div className={styles.advancedSection}>
                <p className={styles.advancedText}>
                  Want more control? Configure email notifications, weather reports, and advanced
                  settings.
                </p>
                <button
                  className={`${styles.actionButton} ${styles.advancedButton}`}
                  onClick={() => {
                    onClose();
                    navigate('/preferences');
                  }}
                >
                  ⚙️ Advanced Settings & Email Preferences
                </button>
              </div>
            </Stack>
          )}

          {activeTab === 'favorites' && (
            <Stack as="section" gap="lg" className={styles.section}>
              <h3 className={styles.sectionTitle}>
                Your Favorite Locations
                {favorites.length > 0 && (
                  <span className={styles.favoritesBadge}>{favorites.length}</span>
                )}
              </h3>

              {favoritesLoading && (
                <div className={styles.favoritesLoading}>
                  <div className={styles.spinner} />
                  <p>Loading favorites...</p>
                </div>
              )}

              {!favoritesLoading && favorites.length === 0 && (
                <div className={styles.favoritesEmpty}>
                  <span className={styles.emptyIcon}>⭐</span>
                  <h4>No favorite locations yet</h4>
                  <p>Add locations to your favorites from the main dashboard.</p>
                  <p className={styles.emptyHint}>
                    Your favorites are securely stored and synced across all your devices.
                  </p>
                </div>
              )}

              {!favoritesLoading && favorites.length > 0 && (
                <div className={styles.favoritesList}>
                  {favorites.map((favorite) => (
                    <div key={favorite.id} className={styles.favoriteItem}>
                      <div
                        className={styles.favoriteContent}
                        onClick={() => handleSelectFavorite(favorite)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSelectFavorite(favorite);
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className={styles.favoriteIcon}>📍</div>
                        <div className={styles.favoriteDetails}>
                          <div className={styles.favoriteName}>
                            {favorite.address || favorite.location_name}
                          </div>
                          <div className={styles.favoriteCoords}>
                            {favorite.latitude.toFixed(4)}, {favorite.longitude.toFixed(4)}
                            {favorite.timezone && ` • ${favorite.timezone}`}
                          </div>
                        </div>
                      </div>
                      <button
                        className={styles.removeFavorite}
                        onClick={() => handleRemoveFavorite(favorite.id)}
                        title="Remove from favorites"
                        disabled={favoritesLoading}
                        type="button"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {favorites.length > 0 && (
                <div className={styles.favoritesInfo}>
                  <p className={styles.favoritesMeta}>
                    💾 {favorites.length} location{favorites.length !== 1 ? 's' : ''} saved • Synced
                    to cloud
                  </p>
                </div>
              )}
            </Stack>
          )}

          {activeTab === 'security' && (
            <Stack as="section" gap="lg" className={styles.section}>
              <h3 className={styles.sectionTitle}>Change Password</h3>

              <form onSubmit={handleChangePassword} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="current-password" className={styles.formLabel}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="current-password"
                    className={styles.formInput}
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="new-password" className={styles.formLabel}>
                    New Password
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    className={styles.formInput}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirm-new-password" className={styles.formLabel}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirm-new-password"
                    className={styles.formInput}
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <button type="submit" className={styles.actionButton} disabled={loading}>
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </Stack>
          )}
        </div>

        <footer className={styles.footer}>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.actionButtonDanger}`}
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </footer>
      </Surface>
    </div>
  );
}

export default UserProfileModal;
