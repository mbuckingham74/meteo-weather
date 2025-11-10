import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getFavorites as getLocalFavorites,
  removeFavorite as removeLocalFavorite,
  addFavorite as addLocalFavorite,
  clearFavorites as clearLocalFavorites,
} from '../../services/favoritesService';
import {
  getCloudFavorites,
  addCloudFavorite,
  removeCloudFavorite,
  importFavorites,
} from '../../services/authApi';
import styles from './FavoritesPanel.module.css';

/**
 * FavoritesPanel Component
 * Displays and manages favorite locations
 * Syncs with cloud when authenticated, uses localStorage when not
 */
function FavoritesPanel({ onLocationSelect, currentLocation }) {
  const { isAuthenticated, accessToken } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [migrated, setMigrated] = useState(false);

  const refreshFavorites = useCallback(async () => {
    if (isAuthenticated && accessToken) {
      // Load from cloud
      try {
        const cloudFavs = await getCloudFavorites(accessToken);
        setFavorites(cloudFavs);
      } catch (error) {
        console.error('Failed to load cloud favorites:', error);
        // Fall back to localStorage
        setFavorites(getLocalFavorites());
      }
    } else {
      // Load from localStorage
      setFavorites(getLocalFavorites());
    }
  }, [isAuthenticated, accessToken]);

  const migrateToCloud = useCallback(async () => {
    setSyncing(true);
    try {
      const localFavs = getLocalFavorites();

      if (localFavs.length > 0) {
        // Import localStorage favorites to cloud
        const formattedFavs = localFavs.map((fav) => ({
          location_name: fav.address,
          latitude: fav.latitude,
          longitude: fav.longitude,
          address: fav.address,
          timezone: fav.timezone,
        }));

        await importFavorites(accessToken, formattedFavs);

        // Clear localStorage after successful migration
        clearLocalFavorites();

        // Refresh from cloud
        await refreshFavorites();
      }

      setMigrated(true);
    } catch (error) {
      console.error('Failed to migrate favorites:', error);
    } finally {
      setSyncing(false);
    }
  }, [accessToken, refreshFavorites]);

  // Load favorites on mount and when auth changes
  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  // Auto-migrate localStorage favorites to cloud when user logs in
  useEffect(() => {
    if (isAuthenticated && accessToken && !migrated) {
      migrateToCloud();
    }
  }, [isAuthenticated, accessToken, migrated, migrateToCloud]);

  const handleRemove = async (favorite, e) => {
    e.stopPropagation();

    if (isAuthenticated && accessToken) {
      // Remove from cloud
      try {
        await removeCloudFavorite(accessToken, favorite.id);
        await refreshFavorites();
      } catch (error) {
        console.error('Failed to remove cloud favorite:', error);
      }
    } else {
      // Remove from localStorage
      if (removeLocalFavorite(favorite.id)) {
        refreshFavorites();
      }
    }
  };

  const handleAdd = async (location, e) => {
    e.stopPropagation();

    if (isAuthenticated && accessToken) {
      // Add to cloud
      try {
        await addCloudFavorite(accessToken, {
          location_name: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
          timezone: location.timezone,
        });
        await refreshFavorites();
      } catch (error) {
        console.error('Failed to add cloud favorite:', error);
      }
    } else {
      // Add to localStorage
      addLocalFavorite(location);
      refreshFavorites();
    }
  };

  const isFavorited = (location) => {
    if (!location) return false;

    return favorites.some(
      (fav) => fav.latitude === location.latitude && fav.longitude === location.longitude
    );
  };

  const isCurrentFavorite = currentLocation && isFavorited(currentLocation);

  return (
    <div className={styles.panel}>
      <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <h3>
          {isAuthenticated ? '☁️' : '⭐'} Favorite Locations
          {favorites.length > 0 && <span className={styles.count}>{favorites.length}</span>}
          {syncing && <span className={styles.syncIndicator}>Syncing...</span>}
        </h3>
        <button className={styles.expandButton}>{isExpanded ? '▼' : '▶'}</button>
      </div>

      {isExpanded && (
        <div className={styles.content}>
          {/* Current Location Quick Add */}
          {currentLocation && !isCurrentFavorite && (
            <div className={styles.currentLocationAdd}>
              <button
                className={styles.addCurrentButton}
                onClick={(e) => handleAdd(currentLocation, e)}
                disabled={syncing}
              >
                <span>⭐</span>
                <span>Add &quot;{currentLocation.address}&quot; to favorites</span>
              </button>
            </div>
          )}

          {favorites.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>{isAuthenticated ? '☁️' : '⭐'}</span>
              <p>No favorite locations yet</p>
              <p className={styles.emptyHint}>
                {isAuthenticated
                  ? 'Your favorites sync across all devices'
                  : 'Sign in to sync favorites across devices'}
              </p>
            </div>
          ) : (
            <div className={styles.list}>
              {favorites.map((favorite) => {
                const isCurrent =
                  currentLocation &&
                  favorite.latitude === currentLocation.latitude &&
                  favorite.longitude === currentLocation.longitude;

                return (
                  <div
                    key={favorite.id}
                    className={`${styles.item} ${isCurrent ? styles.active : ''}`}
                    onClick={() => onLocationSelect(favorite)}
                  >
                    <div className={styles.info}>
                      <div className={styles.name}>
                        {favorite.address || favorite.location_name}
                        {isCurrent && <span className={styles.currentBadge}>Current</span>}
                      </div>
                      <div className={styles.coords}>
                        {favorite.latitude.toFixed(4)}, {favorite.longitude.toFixed(4)}
                        {favorite.timezone && ` • ${favorite.timezone}`}
                      </div>
                    </div>
                    <button
                      className={styles.removeButton}
                      onClick={(e) => handleRemove(favorite, e)}
                      title="Remove from favorites"
                      disabled={syncing}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {favorites.length > 0 && (
            <div className={styles.footer}>
              <p>
                {favorites.length} favorite location{favorites.length !== 1 ? 's' : ''}
                {isAuthenticated && ' • Synced to cloud'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FavoritesPanel;
