import { useEffect, useRef } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation as useRouterLocation,
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LocationProvider, useLocation as useLocationContext } from './contexts/LocationContext';
import { TemperatureUnitProvider } from './contexts/TemperatureUnitContext';
import { ToastProvider } from './components/common/ToastContainer';
import ErrorBoundary from './components/common/ErrorBoundary';
import SkipToContent from './components/common/SkipToContent';
import AuthHeader from './components/auth/AuthHeader';
import WeatherDashboard from './components/weather/WeatherDashboard';
import LocationComparisonView from './components/location/LocationComparisonView';
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import AIWeatherPage from './components/ai/AIWeatherPage';
import SharedAnswerPage from './components/ai/SharedAnswerPage';
import UserPreferencesPage from './components/settings/UserPreferencesPage';
import AboutPage from './components/about/AboutPage';
import AdminPanel from './components/admin/AdminPanel';
import { parseLocationSlug } from './utils/urlHelpers';
import { geocodeLocation } from './services/weatherApi';
import './styles/themes.css';
import './App.css';
import './styles/reduced-motion.css'; // Accessibility: reduced motion support
import './styles/density-compact.css'; // MUST be last to override component styles

function RouteAwareLocationManager() {
  const routerLocation = useRouterLocation();
  const { selectLocation } = useLocationContext();
  const lastSyncedRef = useRef(null);

  useEffect(() => {
    // Skip location management for non-weather routes
    const skipRoutes = ['/admin', '/compare', '/about', '/privacy', '/preferences', '/ai-weather'];
    if (skipRoutes.some((route) => routerLocation.pathname.startsWith(route))) {
      return;
    }

    const locationState = routerLocation.state?.location;
    if (locationState && locationState.address) {
      const key = `state:${locationState.latitude},${locationState.longitude}`;
      if (lastSyncedRef.current !== key) {
        lastSyncedRef.current = key;
        selectLocation(locationState);
      }
      return;
    }

    const match = routerLocation.pathname.match(/^\/location\/([^/]+)$/);
    if (!match) {
      lastSyncedRef.current = null;
      return;
    }

    const slug = match[1];
    if (lastSyncedRef.current === slug) {
      return;
    }

    let isCancelled = false;

    (async () => {
      try {
        const searchQuery = parseLocationSlug(slug);
        const results = await geocodeLocation(searchQuery, 1);
        if (!isCancelled && results && results.length > 0) {
          lastSyncedRef.current = slug;
          selectLocation(results[0]);
        }
      } catch (error) {
        if (!isCancelled) {
          // eslint-disable-next-line no-console
          console.error('Error loading location from URL:', error);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [routerLocation.pathname, routerLocation.state, selectLocation]);

  return null;
}

function ComparePage() {
  return (
    <>
      <div style={{ padding: '20px 20px 0 20px', maxWidth: '1400px', margin: '0 auto' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#f3f4f6',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#374151',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e5e7eb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f3f4f6';
          }}
        >
          ← Back to Dashboard
        </Link>
      </div>
      <LocationComparisonView />
    </>
  );
}

function AppShell() {
  return (
    <div className="App">
      <SkipToContent />
      <AuthHeader />
      <RouteAwareLocationManager />
      <main id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<WeatherDashboard />} />
          <Route path="/location/:slug" element={<WeatherDashboard />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/preferences" element={<UserPreferencesPage />} />
          <Route path="/ai-weather" element={<AIWeatherPage />} />
          <Route path="/ai-weather/shared/:shareId" element={<SharedAnswerPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <ThemeProvider>
            <TemperatureUnitProvider>
              <LocationProvider>
                <BrowserRouter>
                  <AppShell />
                </BrowserRouter>
              </LocationProvider>
            </TemperatureUnitProvider>
          </ThemeProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
