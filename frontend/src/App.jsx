import { useEffect, useRef, lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation as useRouterLocation,
} from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './config/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LocationProvider, useLocation as useLocationContext } from './contexts/LocationContext';
import { TemperatureUnitProvider } from './contexts/TemperatureUnitContext';
import { ToastProvider } from './components/common/ToastContainer';
import ErrorBoundary from './components/common/ErrorBoundary';
import SkipToContent from './components/common/SkipToContent';
import AuthHeader from './components/auth/AuthHeader';
import WeatherDashboard from './components/weather/WeatherDashboard';
import PrivacyPolicy from './components/pages/PrivacyPolicy';
import { parseLocationSlug } from './utils/urlHelpers';
import { geocodeLocation } from './services/weatherApi';
import './index.css'; // Tailwind CSS with custom theme

// Code-split heavy components that aren't needed on initial load
const LocationComparisonView = lazy(() => import('./components/pages/LocationComparisonView'));
const AIWeatherPage = lazy(() => import('./components/pages/AIWeatherPage'));
const SharedAnswerPage = lazy(() => import('./components/pages/SharedAnswerPage'));
const UserPreferencesPage = lazy(() => import('./components/pages/UserPreferencesPage'));
const AboutPage = lazy(() => import('./components/pages/AboutPage'));
const AdminPanel = lazy(() => import('./components/pages/AdminPanel'));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="text-text-secondary text-lg">Loading...</div>
    </div>
  );
}

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
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <Link to="/" className="text-accent hover:text-accent-hover">
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
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
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
        {/* React Query Devtools - only shown in development */}
        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
