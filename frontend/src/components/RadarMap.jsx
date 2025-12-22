/**
 * RadarMap - Custom Leaflet radar map with OpenWeatherMap tiles
 * Uses OWM precipitation layer for clean, static radar display
 */
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Layers, CloudRain, Thermometer, Wind } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import 'leaflet/dist/leaflet.css';
import './RadarMap.css';

// OpenWeatherMap API key from environment
const OWM_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

// Available weather layers
const WEATHER_LAYERS = {
  precipitation: {
    id: 'precipitation_new',
    label: 'Precipitation',
    icon: CloudRain,
  },
  clouds: {
    id: 'clouds_new',
    label: 'Clouds',
    icon: Layers,
  },
  temp: {
    id: 'temp_new',
    label: 'Temperature',
    icon: Thermometer,
  },
  wind: {
    id: 'wind_new',
    label: 'Wind',
    icon: Wind,
  },
};

// Component to handle map center updates
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

// Base map tile URLs
const BASE_MAPS = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
};

export default function RadarMap({ latitude, longitude, height = '100%' }) {
  const { theme } = useTheme();
  const [activeLayer, setActiveLayer] = useState('precipitation');
  const [loading, setLoading] = useState(true);

  const center = [latitude || 40, longitude || -100];
  const zoom = 7;

  // Mark as loaded once component mounts
  useEffect(() => {
    setLoading(false);
  }, []);

  const currentLayer = WEATHER_LAYERS[activeLayer];

  if (loading) {
    return (
      <div className="radar-loading" style={{ height }}>
        <div className="radar-loading-spinner" />
        <span>Loading map...</span>
      </div>
    );
  }

  return (
    <div className="radar-map-wrapper" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="radar-map-container"
        zoomControl={true}
        attributionControl={false}
      >
        {/* Base map - switches between dark and light based on theme */}
        <TileLayer
          key={theme} // Force re-render when theme changes
          url={BASE_MAPS[theme] || BASE_MAPS.dark}
          maxZoom={19}
        />

        {/* OpenWeatherMap weather layer */}
        <TileLayer
          url={`https://tile.openweathermap.org/map/${currentLayer.id}/{z}/{x}/{y}.png?appid=${OWM_API_KEY}`}
          opacity={0.6}
          maxZoom={19}
        />

        {/* Update map center when location changes */}
        <MapUpdater center={center} zoom={zoom} />
      </MapContainer>

      {/* Layer switcher */}
      <div className="radar-layer-switcher">
        {Object.entries(WEATHER_LAYERS).map(([key, layer]) => {
          const Icon = layer.icon;
          return (
            <button
              key={key}
              onClick={() => setActiveLayer(key)}
              className={`radar-layer-btn ${activeLayer === key ? 'active' : ''}`}
              title={layer.label}
            >
              <Icon size={16} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
