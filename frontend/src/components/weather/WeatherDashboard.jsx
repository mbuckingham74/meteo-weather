/**
 * Weather Dashboard - Main dashboard placeholder
 * TODO: Implement full dashboard in PR 3-6
 */
import { useLocation } from '../../contexts/LocationContext';

function WeatherDashboard() {
  const { selectedLocation } = useLocation();

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section Placeholder */}
        <div className="card mb-6">
          <div className="text-center py-12">
            <h1 className="text-5xl font-bold text-text-primary mb-2">
              {selectedLocation ? '72°F' : '--°F'}
            </h1>
            <p className="text-xl text-text-secondary">
              {selectedLocation?.address || 'Search for a location to get started'}
            </p>
            {selectedLocation && (
              <p className="text-text-muted mt-2">Partly Cloudy • Feels like 70°F</p>
            )}
          </div>
        </div>

        {/* Search Placeholder */}
        <div className="card mb-6">
          <input type="text" placeholder="Search for a city..." className="input" />
        </div>

        {/* Stats Grid Placeholder */}
        {selectedLocation && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="card-hover text-center">
              <p className="text-text-muted text-sm">Wind</p>
              <p className="text-2xl font-bold text-text-primary">12 mph</p>
            </div>
            <div className="card-hover text-center">
              <p className="text-text-muted text-sm">Humidity</p>
              <p className="text-2xl font-bold text-text-primary">65%</p>
            </div>
            <div className="card-hover text-center">
              <p className="text-text-muted text-sm">UV Index</p>
              <p className="text-2xl font-bold text-text-primary">6</p>
            </div>
            <div className="card-hover text-center">
              <p className="text-text-muted text-sm">Pressure</p>
              <p className="text-2xl font-bold text-text-primary">30.1 in</p>
            </div>
          </div>
        )}

        {/* Placeholder Message */}
        <div className="card text-center py-8">
          <p className="text-text-muted">
            UI Redesign in Progress - Dashboard components coming in PR 3-6
          </p>
        </div>
      </div>
    </div>
  );
}

export default WeatherDashboard;
