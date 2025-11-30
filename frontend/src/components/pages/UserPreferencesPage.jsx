/**
 * User Preferences Page - Placeholder
 * TODO: Implement in PR 7
 */
import { Link } from 'react-router-dom';

function UserPreferencesPage() {
  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-accent hover:text-accent-hover mb-6 inline-block">
          ← Back to Dashboard
        </Link>
        <div className="card">
          <h1 className="text-3xl font-bold text-text-primary mb-6">Preferences</h1>
          <div className="space-y-6">
            <div>
              <label className="block text-text-secondary mb-2">Temperature Unit</label>
              <div className="flex gap-4">
                <button className="btn btn-primary">Fahrenheit</button>
                <button className="btn btn-secondary">Celsius</button>
              </div>
            </div>
            <div>
              <label className="block text-text-secondary mb-2">Theme</label>
              <div className="flex gap-4">
                <button className="btn btn-secondary">Light</button>
                <button className="btn btn-primary">Dark</button>
              </div>
            </div>
          </div>
          <p className="text-text-muted mt-8 text-center">Full preferences coming in PR 7</p>
        </div>
      </div>
    </div>
  );
}

export default UserPreferencesPage;
