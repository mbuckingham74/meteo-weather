/**
 * LocationSearch - Search input for finding locations
 */
import { useState, useCallback } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { geocodeLocation } from '../../services/weatherApi';
import { useLocation } from '../../contexts/LocationContext';

function LocationSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { selectLocation } = useLocation();

  const handleSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const locations = await geocodeLocation(searchQuery, 5);
      setResults(locations || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    // Debounce search
    const timeoutId = setTimeout(() => handleSearch(value), 300);
    return () => clearTimeout(timeoutId);
  };

  const handleSelectLocation = (location) => {
    selectLocation(location);
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Search for a city..."
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

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-bg-card rounded-xl shadow-elevated overflow-hidden">
          {results.map((location, index) => (
            <button
              key={`${location.latitude}-${location.longitude}-${index}`}
              onClick={() => handleSelectLocation(location)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-bg-card-hover transition-colors text-left"
            >
              <MapPin size={18} className="text-accent flex-shrink-0" />
              <span className="text-text-primary truncate">
                {location.address || location.location_name}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && query.length >= 2 && !isSearching && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-bg-card rounded-xl shadow-elevated p-4">
          <p className="text-text-muted text-center">No locations found</p>
        </div>
      )}
    </div>
  );
}

export default LocationSearch;
