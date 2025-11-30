/**
 * Location Comparison View - Compare weather between multiple locations
 */
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  X,
  Search,
  MapPin,
  Loader2,
  Thermometer,
  Droplets,
  Wind,
} from 'lucide-react';
import { useQueries } from '@tanstack/react-query';
import { queryKeys } from '../../config/queryClient';
import { getCurrentWeather, geocodeLocation } from '../../services/weatherApi';
import { useTemperatureUnit } from '../../contexts/TemperatureUnitContext';

const MAX_LOCATIONS = 4;

function LocationComparisonView() {
  const [locations, setLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { formatTemperature } = useTemperatureUnit();

  // Fetch weather for all selected locations using parallel queries
  const weatherQueries = useQueries({
    queries: locations.map((location) => ({
      queryKey: queryKeys.weather.current(location.latitude, location.longitude),
      queryFn: async () => {
        const result = await getCurrentWeather(`${location.latitude},${location.longitude}`);
        return { ...result, locationInfo: location };
      },
      enabled: !!location.latitude && !!location.longitude,
      staleTime: 5 * 60 * 1000, // 5 minutes
    })),
  });

  const handleSearch = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await geocodeLocation(query, 5);
      setSearchResults(results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Debounce search
    const timeoutId = setTimeout(() => handleSearch(value), 300);
    return () => clearTimeout(timeoutId);
  };

  const addLocation = (location) => {
    if (locations.length >= MAX_LOCATIONS) return;

    // Check for duplicates
    const exists = locations.some(
      (l) => l.latitude === location.latitude && l.longitude === location.longitude
    );
    if (exists) return;

    setLocations((prev) => [...prev, location]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeLocation = (index) => {
    setLocations((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-bg-primary p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-accent hover:text-accent-hover mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-text-primary mb-2">Compare Locations</h1>
        <p className="text-text-muted mb-8">
          Compare weather conditions across up to {MAX_LOCATIONS} locations
        </p>

        {/* Search Bar */}
        {locations.length < MAX_LOCATIONS && (
          <div className="relative mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInput}
                placeholder="Search for a location to add..."
                className="input pl-12"
                aria-label="Search for a location"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                {isSearching ? (
                  <Loader2 size={20} className="text-text-muted animate-spin" />
                ) : (
                  <Search size={20} className="text-text-muted" />
                )}
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-bg-card rounded-xl shadow-elevated overflow-hidden">
                {searchResults.map((location, index) => (
                  <button
                    key={`${location.latitude}-${location.longitude}-${index}`}
                    onClick={() => addLocation(location)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-bg-card-hover transition-colors text-left"
                  >
                    <Plus size={18} className="text-accent flex-shrink-0" />
                    <span className="text-text-primary truncate">
                      {location.address || location.location_name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Location Cards */}
        {locations.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {locations.map((location, index) => {
              const query = weatherQueries[index];
              const weather = query?.data?.currentConditions;
              const isLoading = query?.isLoading;
              const error = query?.error;

              return (
                <LocationCard
                  key={`${location.latitude}-${location.longitude}`}
                  location={location}
                  weather={weather}
                  isLoading={isLoading}
                  error={error}
                  onRemove={() => removeLocation(index)}
                  formatTemperature={formatTemperature}
                />
              );
            })}

            {/* Add More Placeholder */}
            {locations.length < MAX_LOCATIONS && (
              <button
                onClick={() => document.querySelector('input')?.focus()}
                className="card border-2 border-dashed border-steel-blue/30 hover:border-accent/50 transition-colors min-h-[200px] flex flex-col items-center justify-center gap-2 text-text-muted hover:text-text-secondary"
              >
                <Plus size={32} />
                <span>Add Location</span>
              </button>
            )}
          </div>
        )}

        {/* Comparison Table (when 2+ locations) */}
        {locations.length >= 2 && (
          <ComparisonTable
            queries={weatherQueries}
            locations={locations}
            formatTemperature={formatTemperature}
          />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card text-center py-12">
      <div className="inline-flex p-4 rounded-2xl bg-bg-elevated mb-6">
        <MapPin size={48} className="text-accent" />
      </div>
      <h2 className="text-xl font-semibold text-text-primary mb-2">No locations selected</h2>
      <p className="text-text-muted max-w-md mx-auto">
        Search for locations above to compare their weather conditions side by side.
      </p>
    </div>
  );
}

function LocationCard({ location, weather, isLoading, error, onRemove, formatTemperature }) {
  const locationName = location.address || location.location_name;

  return (
    <div className="card relative">
      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="absolute top-3 right-3 p-1.5 rounded-lg bg-bg-elevated hover:bg-red-900/30 text-text-muted hover:text-red-300 transition-colors"
        aria-label={`Remove ${locationName}`}
      >
        <X size={16} />
      </button>

      {/* Location Name */}
      <div className="flex items-start gap-2 mb-4 pr-8">
        <MapPin size={18} className="text-accent flex-shrink-0 mt-0.5" />
        <h3 className="text-sm font-medium text-text-primary line-clamp-2">{locationName}</h3>
      </div>

      {/* Weather Data */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-red-300 text-sm">Failed to load weather</p>
        </div>
      ) : weather ? (
        <div className="space-y-4">
          {/* Temperature */}
          <div className="text-center">
            <p className="text-4xl font-bold text-text-primary">
              {formatTemperature(weather.temp)}
            </p>
            <p className="text-text-muted text-sm mt-1">{weather.conditions}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-steel-blue/20">
            <div className="text-center">
              <Thermometer size={16} className="mx-auto text-text-muted mb-1" />
              <p className="text-xs text-text-muted">Feels</p>
              <p className="text-sm text-text-primary">{formatTemperature(weather.feelslike)}</p>
            </div>
            <div className="text-center">
              <Droplets size={16} className="mx-auto text-text-muted mb-1" />
              <p className="text-xs text-text-muted">Humidity</p>
              <p className="text-sm text-text-primary">{weather.humidity}%</p>
            </div>
            <div className="text-center">
              <Wind size={16} className="mx-auto text-text-muted mb-1" />
              <p className="text-xs text-text-muted">Wind</p>
              <p className="text-sm text-text-primary">{weather.windspeed} mph</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ComparisonTable({ queries, locations, formatTemperature }) {
  const metrics = [
    { key: 'temp', label: 'Temperature', format: (v) => formatTemperature(v) },
    { key: 'feelslike', label: 'Feels Like', format: (v) => formatTemperature(v) },
    { key: 'humidity', label: 'Humidity', format: (v) => `${v}%` },
    { key: 'windspeed', label: 'Wind Speed', format: (v) => `${v} mph` },
    { key: 'uvindex', label: 'UV Index', format: (v) => v },
    { key: 'visibility', label: 'Visibility', format: (v) => `${v} mi` },
    { key: 'pressure', label: 'Pressure', format: (v) => `${(v * 0.02953).toFixed(2)} in` },
  ];

  return (
    <div className="card mt-8 overflow-x-auto">
      <h2 className="text-lg font-semibold text-text-primary mb-4">Detailed Comparison</h2>

      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left text-text-muted text-sm font-medium pb-3">Metric</th>
            {locations.map((location, index) => (
              <th
                key={`${location.latitude}-${location.longitude}`}
                className="text-center text-text-muted text-sm font-medium pb-3 px-2"
              >
                <span className="line-clamp-1">
                  {(location.address || location.location_name).split(',')[0]}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric) => (
            <tr key={metric.key} className="border-t border-steel-blue/10">
              <td className="py-3 text-text-secondary text-sm">{metric.label}</td>
              {queries.map((query, index) => {
                const weather = query?.data?.currentConditions;
                const value = weather?.[metric.key];

                return (
                  <td
                    key={`${locations[index].latitude}-${locations[index].longitude}-${metric.key}`}
                    className="py-3 text-center text-text-primary text-sm px-2"
                  >
                    {query?.isLoading ? (
                      <span className="text-text-muted">...</span>
                    ) : value != null ? (
                      metric.format(value)
                    ) : (
                      <span className="text-text-muted">--</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LocationComparisonView;
