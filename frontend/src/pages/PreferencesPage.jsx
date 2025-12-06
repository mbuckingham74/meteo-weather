/**
 * User Preferences Page
 * TODO: Implement full preferences functionality
 */
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTemperatureUnit } from '../contexts/TemperatureUnitContext';
import { Settings, Sun, Moon, Thermometer } from 'lucide-react';

export default function PreferencesPage() {
  const { user, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const { unit, toggleUnit } = useTemperatureUnit();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary flex items-center gap-3">
          <Settings className="w-8 h-8" />
          Preferences
        </h1>
        <p className="text-text-secondary">Customize your weather experience</p>
      </div>

      <div className="space-y-4">
        {/* Theme Setting */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-6 h-6 text-primary" />
              ) : (
                <Sun className="w-6 h-6 text-warning" />
              )}
              <div>
                <p className="font-medium text-text-primary">Theme</p>
                <p className="text-sm text-text-secondary">Choose light or dark mode</p>
              </div>
            </div>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="input w-auto"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        {/* Temperature Unit */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Thermometer className="w-6 h-6 text-danger" />
              <div>
                <p className="font-medium text-text-primary">Temperature Unit</p>
                <p className="text-sm text-text-secondary">Fahrenheit or Celsius</p>
              </div>
            </div>
            <button onClick={toggleUnit} className="btn btn-secondary">
              °{unit}
            </button>
          </div>
        </div>

        {/* Account Info */}
        {isAuthenticated && user && (
          <div className="card">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Account</h2>
            <div className="space-y-2">
              <p className="text-text-secondary">
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p className="text-text-secondary">
                <span className="font-medium">Member since:</span>{' '}
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
