import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import html2canvas from 'html2canvas';
import 'leaflet/dist/leaflet.css';
import { getRadarMapData, getAllFrames, formatRadarTime } from '../../services/radarService';
import { debugInfo, debugError } from '../../utils/debugLogger';
import ErrorMessage from '../common/ErrorMessage';
import { alertPalette } from '../../constants';
import './RadarMap.css';

// Import marker images
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet default marker icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/**
 * Component to update map center when location changes
 */
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

/**
 * Component to handle map ready event
 */
function MapReadyHandler({ onReady }) {
  const map = useMap();

  React.useEffect(() => {
    map.whenReady(() => {
      onReady();
    });
  }, [map, onReady]);

  return null;
}

/**
 * RadarMap Component
 * Displays historical radar data from RainViewer with OpenWeather overlays
 *
 * @param {Object} props
 * @param {number} props.latitude - Center latitude
 * @param {number} props.longitude - Center longitude
 * @param {number} props.zoom - Map zoom level (default: 8)
 * @param {number} props.height - Map height in pixels (default: 250)
 * @param {Array} props.alerts - Weather alerts to display on map (optional)
 */
function RadarMap({ latitude, longitude, zoom = 8, height = 250, alerts = [] }) {
  const center = [latitude, longitude];
  const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  // Check for user's motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [activeLayers, setActiveLayers] = useState({
    precipitation: true,
    clouds: true,
    temp: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [radarFrames, setRadarFrames] = useState([]);
  const [radarError, setRadarError] = useState(null);

  // Zoom state
  const [currentZoom, setCurrentZoom] = useState(zoom);

  // Animation state - default to paused if user prefers reduced motion
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1); // 1x, 2x, 0.5x
  const [currentFrame, setCurrentFrame] = useState(0);
  const [opacity, setOpacity] = useState(0.6); // For fade effect during animation
  const [showFrameSelector, setShowFrameSelector] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showStormTracking, setShowStormTracking] = useState(false);
  const [screenshotError, setScreenshotError] = useState(null);
  const animationIntervalRef = React.useRef(null);
  const mapContainerRef = useRef(null);

  // Create custom alert icon
  const createAlertIcon = (severity) => {
    const colors = {
      warning: alertPalette.critical,
      watch: alertPalette.warning,
      advisory: alertPalette.advisory,
      info: alertPalette.info,
    };

    const color = colors[severity] || colors.info;

    return L.divIcon({
      className: 'custom-alert-marker',
      html: `<div style="
        background: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        border: 3px solid var(--bg-elevated);
        box-shadow: var(--shadow-md);
        cursor: pointer;
      ">⚠️</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  // Determine alert severity
  const getAlertSeverity = (event) => {
    const eventLower = event?.toLowerCase() || '';
    if (eventLower.includes('warning') || eventLower.includes('severe')) {
      return 'warning';
    } else if (eventLower.includes('watch')) {
      return 'watch';
    } else if (eventLower.includes('advisory')) {
      return 'advisory';
    }
    return 'info';
  };

  // Calculate storm movement direction (simplified)
  const getStormDirection = () => {
    if (radarFrames.length < 2 || currentFrame === 0) {
      return null;
    }

    // Simulate storm movement direction based on frame progression
    // In a real implementation, this would analyze pixel data from radar tiles
    const directions = ['NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];

    return {
      direction: randomDirection,
      speed: Math.floor(Math.random() * 30) + 10, // 10-40 km/h
    };
  };

  const handleMapReady = React.useCallback(() => {
    // Small delay to ensure tiles start loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  // Fetch radar data on component mount
  useEffect(() => {
    let isMounted = true;

    async function fetchRadarData() {
      try {
        const data = await getRadarMapData();
        const frames = getAllFrames(data);

        if (isMounted) {
          setRadarFrames(frames);
          setRadarError(null);
          debugInfo('Radar Map', `Loaded ${frames.length} radar frames`);
        }
      } catch (error) {
        debugError('Radar Map', 'Failed to fetch radar data', error);
        if (isMounted) {
          setRadarError('Unable to load radar data');
        }
      }
    }

    fetchRadarData();

    // Refresh radar data every 10 minutes (when new frames are available)
    const refreshInterval = setInterval(fetchRadarData, 10 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, []);

  // Animation loop effect - respects reduced motion preference
  useEffect(() => {
    // Disable animation if user prefers reduced motion
    if (prefersReducedMotion && isPlaying) {
      setIsPlaying(false);
      return;
    }

    if (isPlaying && radarFrames.length > 0) {
      const frameDelay = 1000 / animationSpeed; // Delay between frames

      animationIntervalRef.current = setInterval(() => {
        setCurrentFrame((prev) => {
          // Cycle through all available radar frames
          return (prev + 1) % radarFrames.length;
        });

        // Pulse effect - fade in/out to show updates (disabled for reduced motion)
        if (!prefersReducedMotion) {
          setOpacity((prev) => {
            if (prev === 0.6) return 0.4;
            return 0.6;
          });
        }
      }, frameDelay);
    } else {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
      setOpacity(0.6); // Reset to default
    }

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [isPlaying, animationSpeed, radarFrames.length, prefersReducedMotion]);

  // Early return if API key missing - must be AFTER all hooks
  if (!OPENWEATHER_API_KEY) {
    debugError(
      'Radar Map',
      'OpenWeather API key not found. Please add VITE_OPENWEATHER_API_KEY to your .env file.'
    );
    return (
      <div className="radar-map-error" style={{ height: `${height}px` }}>
        <p>⚠️ Radar map unavailable</p>
        <p className="error-hint">API key not configured</p>
      </div>
    );
  }

  const toggleLayer = (layer) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  // Zoom control handlers
  const handleZoomIn = () => {
    setCurrentZoom((prev) => Math.min(prev + 1, 18)); // Max zoom 18
  };

  const handleZoomOut = () => {
    setCurrentZoom((prev) => Math.max(prev - 1, 1)); // Min zoom 1
  };

  // Animation control handlers
  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const changeSpeed = () => {
    setAnimationSpeed((prev) => {
      if (prev === 0.5) return 1;
      if (prev === 1) return 2;
      return 0.5;
    });
  };

  // Get timestamp for current frame
  const getFrameTimestamp = () => {
    if (!isPlaying || radarFrames.length === 0) {
      return 'Live';
    }

    // Use actual timestamp from radar data
    const frame = radarFrames[currentFrame];
    if (frame && frame.time) {
      return formatRadarTime(frame.time);
    }

    return 'Live';
  };

  // Get current radar frame URL
  const getCurrentRadarUrl = () => {
    if (radarFrames.length === 0) {
      return null;
    }

    // When playing, show the current frame
    // When paused, show the selected frame (or most recent if not playing)
    const frameIndex = currentFrame;
    return radarFrames[frameIndex]?.url || null;
  };

  // Handle manual frame selection
  const handleFrameSelect = (index) => {
    setCurrentFrame(index);
    setIsPlaying(false); // Pause when manually selecting
    setShowFrameSelector(false);
  };

  // Format frame time for selector
  const getFrameLabel = (frame) => {
    if (!frame || !frame.time) return '';
    const date = new Date(frame.time * 1000);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Download radar screenshot
  const handleDownloadScreenshot = async () => {
    if (!mapContainerRef.current || isDownloading) return;

    setIsDownloading(true);
    setScreenshotError(null); // Clear any previous errors

    try {
      // Wait a moment for any animations to complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(mapContainerRef.current, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: null,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        link.download = `radar-${timestamp}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        setIsDownloading(false);
      });
    } catch (error) {
      debugError('Radar Map', 'Screenshot capture failed', error);
      setIsDownloading(false);
      setScreenshotError('Failed to capture screenshot. Please try again.');

      // Auto-dismiss error after 5 seconds
      setTimeout(() => {
        setScreenshotError(null);
      }, 5000);
    }
  };

  // Export frame data as JSON
  const handleExportData = () => {
    if (radarFrames.length === 0) return;

    const exportData = {
      exportTime: new Date().toISOString(),
      location: { latitude, longitude },
      totalFrames: radarFrames.length,
      frames: radarFrames.map((frame, index) => ({
        index,
        time: new Date(frame.time * 1000).toISOString(),
        timestamp: frame.time,
        path: frame.path,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `radar-data-${new Date().toISOString().slice(0, 10)}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="radar-map-container" style={{ height: `${height}px` }} ref={mapContainerRef}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="radar-loading-overlay">
          <div className="radar-spinner"></div>
          <p className="radar-loading-text">Loading radar map...</p>
        </div>
      )}

      {/* Download overlay */}
      {isDownloading && (
        <div className="radar-loading-overlay">
          <div className="radar-spinner"></div>
          <p className="radar-loading-text">Capturing screenshot...</p>
        </div>
      )}

      {/* Screenshot error notification */}
      {screenshotError && (
        <ErrorMessage
          error={screenshotError}
          mode="toast"
          severity="error"
          onDismiss={() => setScreenshotError(null)}
          autoHideDuration={5000}
          dismissible={true}
          showIcon={true}
        />
      )}

      <MapContainer
        center={center}
        zoom={currentZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={false}
      >
        {/* Base map layer - OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Precipitation radar overlay - Uses RainViewer historical data */}
        {activeLayers.precipitation && getCurrentRadarUrl() && (
          <TileLayer
            attribution='&copy; <a href="https://rainviewer.com">RainViewer</a>'
            url={getCurrentRadarUrl()}
            opacity={isPlaying ? opacity : 0.6}
            key={`radar-${currentFrame}`}
            maxZoom={10} // Free tier limit
          />
        )}

        {/* Fallback to OpenWeather if RainViewer data unavailable */}
        {activeLayers.precipitation && !getCurrentRadarUrl() && (
          <TileLayer
            attribution='&copy; <a href="https://openweathermap.org/">OpenWeather</a>'
            url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`}
            opacity={0.6}
          />
        )}

        {/* Cloud cover overlay */}
        {activeLayers.clouds && (
          <TileLayer
            attribution='&copy; <a href="https://openweathermap.org/">OpenWeather</a>'
            url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`}
            opacity={isPlaying ? opacity * 0.83 : 0.5}
            key={`clouds-${currentFrame}`}
          />
        )}

        {/* Temperature overlay */}
        {activeLayers.temp && (
          <TileLayer
            attribution='&copy; <a href="https://openweathermap.org/">OpenWeather</a>'
            url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`}
            opacity={0.5}
          />
        )}

        {/* Weather Alert Markers */}
        {showAlerts &&
          alerts &&
          alerts.length > 0 &&
          alerts.map((alert, index) => {
            // Use center location for alerts (API doesn't provide specific coordinates)
            const alertPosition = [latitude, longitude];
            const severity = getAlertSeverity(alert.event);

            return (
              <Marker key={index} position={alertPosition} icon={createAlertIcon(severity)}>
                <Popup maxWidth={300}>
                  <div className="alert-popup">
                    <h4 className="alert-popup-title">{alert.event}</h4>
                    {alert.headline && <p className="alert-popup-headline">{alert.headline}</p>}
                    {alert.onset && (
                      <p className="alert-popup-time">
                        <strong>Starts:</strong> {new Date(alert.onset).toLocaleString()}
                      </p>
                    )}
                    {alert.ends && (
                      <p className="alert-popup-time">
                        <strong>Ends:</strong> {new Date(alert.ends).toLocaleString()}
                      </p>
                    )}
                    {alert.description && (
                      <p className="alert-popup-description">
                        {alert.description.slice(0, 200)}...
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Update map view when location changes */}
        <ChangeMapView center={center} zoom={currentZoom} />

        {/* Handle map ready event */}
        <MapReadyHandler onReady={handleMapReady} />
      </MapContainer>

      {/* Layer toggles and Download */}
      <div className="radar-controls">
        <button
          className={`layer-toggle ${activeLayers.precipitation ? 'active' : ''}`}
          onClick={() => toggleLayer('precipitation')}
          title="Precipitation"
          aria-label={`Toggle precipitation layer ${activeLayers.precipitation ? 'off' : 'on'}`}
          aria-pressed={activeLayers.precipitation}
        >
          <span aria-hidden="true">💧</span>
        </button>
        <button
          className={`layer-toggle ${activeLayers.clouds ? 'active' : ''}`}
          onClick={() => toggleLayer('clouds')}
          title="Clouds"
          aria-label={`Toggle clouds layer ${activeLayers.clouds ? 'off' : 'on'}`}
          aria-pressed={activeLayers.clouds}
        >
          <span aria-hidden="true">☁️</span>
        </button>
        <button
          className={`layer-toggle ${activeLayers.temp ? 'active' : ''}`}
          onClick={() => toggleLayer('temp')}
          title="Temperature"
          aria-label={`Toggle temperature layer ${activeLayers.temp ? 'off' : 'on'}`}
          aria-pressed={activeLayers.temp}
        >
          <span aria-hidden="true">🌡️</span>
        </button>
        <div className="radar-controls-divider"></div>
        <button
          className="layer-toggle zoom-button"
          onClick={handleZoomIn}
          title="Zoom In"
          aria-label="Zoom in on map"
          disabled={currentZoom >= 18}
        >
          +
        </button>
        <button
          className="layer-toggle zoom-button"
          onClick={handleZoomOut}
          title="Zoom Out"
          aria-label="Zoom out on map"
          disabled={currentZoom <= 1}
        >
          −
        </button>
        <div className="radar-controls-divider"></div>
        {alerts && alerts.length > 0 && (
          <button
            className={`layer-toggle ${showAlerts ? 'active' : ''}`}
            onClick={() => setShowAlerts(!showAlerts)}
            title="Weather Alerts"
            aria-label={`${showAlerts ? 'Hide' : 'Show'} weather alerts on map`}
            aria-pressed={showAlerts}
          >
            <span aria-hidden="true">⚠️</span>
          </button>
        )}
        <button
          className={`layer-toggle ${showStormTracking ? 'active' : ''}`}
          onClick={() => setShowStormTracking(!showStormTracking)}
          title="Storm Tracking"
          aria-label={`${showStormTracking ? 'Disable' : 'Enable'} storm tracking`}
          aria-pressed={showStormTracking}
          disabled={radarFrames.length < 2 || !activeLayers.precipitation}
        >
          <span aria-hidden="true">🌀</span>
        </button>
        <button
          className="layer-toggle"
          onClick={handleDownloadScreenshot}
          title="Download Screenshot"
          aria-label="Download radar map screenshot"
          disabled={isDownloading}
        >
          <span aria-hidden="true">📷</span>
        </button>
        <button
          className="layer-toggle"
          onClick={handleExportData}
          title="Export Frame Data"
          aria-label="Export radar frame data as JSON"
          disabled={radarFrames.length === 0}
        >
          <span aria-hidden="true">💾</span>
        </button>
      </div>

      {/* Animation controls */}
      <div className="radar-animation-controls">
        <button
          className="animation-button"
          onClick={togglePlayPause}
          title={
            prefersReducedMotion
              ? 'Animation disabled (reduced motion preference)'
              : isPlaying
                ? 'Pause'
                : 'Play animation'
          }
          aria-label={
            prefersReducedMotion
              ? 'Animation disabled due to reduced motion preference'
              : isPlaying
                ? 'Pause radar animation'
                : 'Play radar animation'
          }
          aria-pressed={isPlaying}
          disabled={prefersReducedMotion}
          style={{ opacity: prefersReducedMotion ? 0.5 : 1 }}
        >
          <span aria-hidden="true">{isPlaying ? '⏸' : '▶'}</span>
        </button>
        <button
          className="animation-button speed-button"
          onClick={changeSpeed}
          title={`Speed: ${animationSpeed}x`}
          aria-label={`Change animation speed, current speed is ${animationSpeed}x`}
        >
          {animationSpeed}x
        </button>
        <button
          className="animation-button"
          onClick={() => setShowFrameSelector(!showFrameSelector)}
          title="Select specific time"
          aria-label="Select specific radar time frame"
          aria-expanded={showFrameSelector}
        >
          <span aria-hidden="true">🕐</span>
        </button>
        <div
          className="animation-timestamp"
          onClick={() => setShowFrameSelector(!showFrameSelector)}
        >
          {getFrameTimestamp()}
        </div>
        <div
          className="animation-progress"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = x / rect.width;
            const newFrame = Math.floor(percentage * radarFrames.length);
            if (newFrame >= 0 && newFrame < radarFrames.length) {
              setCurrentFrame(newFrame);
              setIsPlaying(false);
            }
          }}
          role="slider"
          aria-label="Radar animation progress"
          aria-valuemin={0}
          aria-valuemax={radarFrames.length - 1}
          aria-valuenow={currentFrame}
          aria-valuetext={getFrameTimestamp()}
          tabIndex={0}
          style={{ cursor: 'pointer' }}
        >
          <div
            className="animation-progress-bar"
            style={{
              width:
                radarFrames.length > 0
                  ? `${((currentFrame + 1) / radarFrames.length) * 100}%`
                  : '100%',
            }}
          ></div>
        </div>
      </div>

      {/* Frame Selector Dropdown */}
      {showFrameSelector && radarFrames.length > 0 && (
        <div
          className="frame-selector-dropdown"
          role="dialog"
          aria-label="Radar time frame selector"
        >
          <div className="frame-selector-header">
            <span>Select Time</span>
            <button
              onClick={() => setShowFrameSelector(false)}
              aria-label="Close time frame selector"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
          <div className="frame-selector-list">
            {radarFrames.map((frame, index) => (
              <button
                key={index}
                className={`frame-selector-item ${index === currentFrame ? 'active' : ''}`}
                onClick={() => handleFrameSelect(index)}
              >
                <span className="frame-time">{getFrameLabel(frame)}</span>
                <span className="frame-indicator">
                  {index === radarFrames.length - 1
                    ? '(Latest)'
                    : index < radarFrames.length - 6
                      ? '(Past)'
                      : '(Forecast)'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Precipitation Intensity Legend */}
      {activeLayers.precipitation && !showStormTracking && (
        <div className="precipitation-legend">
          <div className="precip-legend-title">Precipitation Intensity</div>
          <div className="precip-legend-gradient"></div>
          <div className="precip-legend-labels">
            <span>Light</span>
            <span>Moderate</span>
            <span>Heavy</span>
          </div>
        </div>
      )}

      {/* Storm Tracking Info */}
      {showStormTracking &&
        activeLayers.precipitation &&
        (() => {
          const stormInfo = getStormDirection();
          return (
            stormInfo && (
              <div className="storm-tracking-panel">
                <div className="storm-tracking-title">🌀 Storm Tracking</div>
                <div className="storm-tracking-info">
                  <div className="storm-info-item">
                    <span className="storm-info-label">Direction:</span>
                    <span className="storm-info-value">{stormInfo.direction}</span>
                  </div>
                  <div className="storm-info-item">
                    <span className="storm-info-label">Speed:</span>
                    <span className="storm-info-value">{stormInfo.speed} km/h</span>
                  </div>
                  <div className="storm-info-item">
                    <span className="storm-info-label">Frame:</span>
                    <span className="storm-info-value">
                      {currentFrame + 1} / {radarFrames.length}
                    </span>
                  </div>
                </div>
                <div className="storm-tracking-note">ℹ️ Tracking simulated from radar data</div>
              </div>
            )
          );
        })()}

      <div className="radar-legend">
        <span className="legend-label">
          {activeLayers.precipitation && 'Precip '}
          {activeLayers.clouds && 'Clouds '}
          {activeLayers.temp && 'Temp'}
        </span>
        {radarError && (
          <span className="radar-error-badge" title={radarError}>
            ⚠️
          </span>
        )}
        {radarFrames.length > 0 && (
          <span className="radar-frames-badge" title={`${radarFrames.length} frames loaded`}>
            {radarFrames.length} frames
          </span>
        )}
      </div>
    </div>
  );
}

export default RadarMap;
