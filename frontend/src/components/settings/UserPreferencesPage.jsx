/**
 * User Preferences Page
 * Comprehensive settings page for user preferences with auth integration
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/api';
import './UserPreferencesPage.css';

const UserPreferencesPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Preferences state
  const [preferences, setPreferences] = useState({
    temperature_unit: 'F',
    default_forecast_days: 7,
    default_location: '',
    theme: 'auto',
    language: 'en',
    email_notifications: false,
    daily_weather_report: false,
    weather_alert_notifications: true,
    weekly_summary: false,
    report_time: '08:00',
    report_locations: [],
  });

  // Location search for adding report locations
  const [locationSearch, setLocationSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Fetch preferences on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/preferences' } });
      return;
    }

    fetchPreferences();
  }, [isAuthenticated, navigate]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_CONFIG.BASE_URL.replace('/api', '')}/api/user-preferences`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }

      const data = await response.json();

      // Convert time from HH:MM:SS to HH:MM for input
      if (data.report_time) {
        data.report_time = data.report_time.substring(0, 5);
      }

      setPreferences(data);
    } catch (err) {
      console.error('Error fetching preferences:', err);
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${API_CONFIG.BASE_URL.replace('/api', '')}/api/user-preferences`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...preferences,
            report_time: preferences.report_time + ':00', // Convert HH:MM to HH:MM:SS
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save preferences');
      }

      await response.json();
      setMessage('Preferences saved successfully!');

      // Update local context if needed
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationSearch = async (query) => {
    setLocationSearch(query);

    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Error searching locations:', err);
    }
  };

  const addReportLocation = (location) => {
    const newLocation = {
      id: Date.now(),
      name: `${location.name}, ${location.state || location.country}`,
      latitude: location.lat,
      longitude: location.lon,
    };

    // Check if location already added
    const exists = preferences.report_locations.some(
      (loc) => loc.latitude === newLocation.latitude && loc.longitude === newLocation.longitude
    );

    if (!exists) {
      setPreferences((prev) => ({
        ...prev,
        report_locations: [...prev.report_locations, newLocation],
      }));
    }

    setLocationSearch('');
    setSearchResults([]);
  };

  const removeReportLocation = (id) => {
    setPreferences((prev) => ({
      ...prev,
      report_locations: prev.report_locations.filter((loc) => loc.id !== id),
    }));
  };

  if (loading) {
    return (
      <div className="preferences-loading">
        <div className="spinner"></div>
        <p>Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="preferences-page">
      <div className="preferences-container">
        <header className="preferences-header">
          <h1>User Preferences</h1>
          <p className="user-email">{user?.email}</p>
        </header>

        <form onSubmit={handleSave} className="preferences-form">
          {/* General Settings */}
          <section className="preferences-section">
            <h2>General Settings</h2>

            <div className="form-group">
              <label htmlFor="temperature_unit">Temperature Unit</label>
              <select
                id="temperature_unit"
                value={preferences.temperature_unit}
                onChange={(e) => handleInputChange('temperature_unit', e.target.value)}
              >
                <option value="F">Fahrenheit (°F)</option>
                <option value="C">Celsius (°C)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="default_forecast_days">Default Forecast Days</label>
              <select
                id="default_forecast_days"
                value={preferences.default_forecast_days}
                onChange={(e) =>
                  handleInputChange('default_forecast_days', parseInt(e.target.value))
                }
              >
                <option value={7}>7 days</option>
                <option value={10}>10 days</option>
                <option value={14}>14 days</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="theme">Theme</label>
              <select
                id="theme"
                value={preferences.theme}
                onChange={(e) => handleInputChange('theme', e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="language">Language</label>
              <select
                id="language"
                value={preferences.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </section>

          {/* Email Notifications */}
          <section className="preferences-section">
            <h2>Email Notifications</h2>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={preferences.email_notifications}
                  onChange={(e) => handleInputChange('email_notifications', e.target.checked)}
                />
                <span>Enable email notifications</span>
              </label>
              <p className="help-text">Master switch for all email notifications</p>
            </div>

            {preferences.email_notifications && (
              <>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={preferences.daily_weather_report}
                      onChange={(e) => handleInputChange('daily_weather_report', e.target.checked)}
                    />
                    <span>Daily Weather Report</span>
                  </label>
                  <p className="help-text">Receive daily weather summary for your locations</p>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={preferences.weather_alert_notifications}
                      onChange={(e) =>
                        handleInputChange('weather_alert_notifications', e.target.checked)
                      }
                    />
                    <span>Weather Alert Notifications</span>
                  </label>
                  <p className="help-text">Get notified about severe weather warnings</p>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={preferences.weekly_summary}
                      onChange={(e) => handleInputChange('weekly_summary', e.target.checked)}
                    />
                    <span>Weekly Summary</span>
                  </label>
                  <p className="help-text">Weekly climate summary every Monday morning</p>
                </div>

                <div className="form-group">
                  <label htmlFor="report_time">Report Time</label>
                  <input
                    type="time"
                    id="report_time"
                    value={preferences.report_time}
                    onChange={(e) => handleInputChange('report_time', e.target.value)}
                  />
                  <p className="help-text">
                    Time to receive daily/weekly reports (your local time)
                  </p>
                </div>
              </>
            )}
          </section>

          {/* Report Locations */}
          {preferences.email_notifications &&
            (preferences.daily_weather_report || preferences.weekly_summary) && (
              <section className="preferences-section">
                <h2>Report Locations</h2>
                <p className="section-description">
                  Add locations to include in your weather reports
                </p>

                <div className="form-group">
                  <label htmlFor="location_search">Add Location</label>
                  <input
                    type="text"
                    id="location_search"
                    placeholder="Search for a city..."
                    value={locationSearch}
                    onChange={(e) => handleLocationSearch(e.target.value)}
                    autoComplete="off"
                  />

                  {searchResults.length > 0 && (
                    <div className="search-results">
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="search-result-item"
                          onClick={() => addReportLocation(result)}
                        >
                          {result.name}, {result.state || result.country}
                          <span className="coordinates">
                            ({result.lat.toFixed(2)}, {result.lon.toFixed(2)})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="report-locations-list">
                  {preferences.report_locations.length === 0 ? (
                    <p className="no-locations">
                      No locations added yet. Search above to add locations.
                    </p>
                  ) : (
                    preferences.report_locations.map((location) => (
                      <div key={location.id} className="report-location-item">
                        <span className="location-name">{location.name}</span>
                        <button
                          type="button"
                          onClick={() => removeReportLocation(location.id)}
                          className="remove-button"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}

          {/* Messages */}
          {message && <div className="message success-message">{message}</div>}

          {error && <div className="message error-message">{error}</div>}

          {/* Actions */}
          <div className="preferences-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="button button-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="button button-primary">
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserPreferencesPage;
