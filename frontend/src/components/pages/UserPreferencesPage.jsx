/**
 * User Preferences Page - Settings and preferences management
 */
import { Link } from 'react-router-dom';
import { ArrowLeft, Thermometer, Moon, Bell, User, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTemperatureUnit } from '../../contexts/TemperatureUnitContext';

function SettingCard({ icon: Icon, title, description, children }) {
  return (
    <div className="card">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-xl bg-bg-elevated">
          <Icon size={20} className="text-accent" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-text-primary">{title}</h3>
          <p className="text-sm text-text-muted mt-1">{description}</p>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function ToggleButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
        active
          ? 'bg-accent text-slate-dark'
          : 'bg-bg-elevated text-text-secondary hover:text-text-primary'
      }`}
    >
      {children}
    </button>
  );
}

function UserPreferencesPage() {
  const { user, isAuthenticated } = useAuth();
  const { unit, setUnit } = useTemperatureUnit();

  return (
    <div className="min-h-screen bg-bg-primary p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-accent hover:text-accent-hover mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-text-primary mb-2">Preferences</h1>
        <p className="text-text-muted mb-8">Customize your weather experience</p>

        <div className="space-y-4">
          {/* Temperature Unit */}
          <SettingCard
            icon={Thermometer}
            title="Temperature Unit"
            description="Choose how temperatures are displayed"
          >
            <div className="flex gap-2">
              <ToggleButton active={unit === 'F'} onClick={() => setUnit('F')}>
                Fahrenheit (°F)
              </ToggleButton>
              <ToggleButton active={unit === 'C'} onClick={() => setUnit('C')}>
                Celsius (°C)
              </ToggleButton>
            </div>
          </SettingCard>

          {/* Theme */}
          <SettingCard icon={Moon} title="Theme" description="Customize the app appearance">
            <div className="flex gap-2">
              <ToggleButton active={true} onClick={() => {}}>
                Dark
              </ToggleButton>
              <ToggleButton active={false} onClick={() => {}}>
                Light (coming soon)
              </ToggleButton>
            </div>
            <p className="text-xs text-text-muted mt-2">Light mode coming in a future update</p>
          </SettingCard>

          {/* Notifications - Only show if authenticated */}
          {isAuthenticated && (
            <SettingCard
              icon={Bell}
              title="Notifications"
              description="Manage weather alerts and updates"
            >
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded bg-bg-elevated border-steel-blue/30 text-accent focus:ring-accent"
                    defaultChecked
                  />
                  <span className="text-sm text-text-secondary">Severe weather alerts</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded bg-bg-elevated border-steel-blue/30 text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-text-secondary">Daily forecast summary</span>
                </label>
              </div>
            </SettingCard>
          )}

          {/* Account Info - Only show if authenticated */}
          {isAuthenticated && user && (
            <SettingCard icon={User} title="Account" description="Your account information">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Name</span>
                  <span className="text-text-primary">{user.name || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Email</span>
                  <span className="text-text-primary">{user.email}</span>
                </div>
                {user.isAdmin && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Role</span>
                    <span className="text-accent flex items-center gap-1">
                      <Shield size={14} />
                      Administrator
                    </span>
                  </div>
                )}
              </div>
            </SettingCard>
          )}

          {/* Guest Notice */}
          {!isAuthenticated && (
            <div className="card bg-bg-elevated/50">
              <div className="text-center py-4">
                <p className="text-text-secondary mb-2">
                  Sign in to save your preferences and access more features
                </p>
                <Link to="/" className="text-accent hover:text-accent-hover text-sm">
                  Return to dashboard to sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserPreferencesPage;
