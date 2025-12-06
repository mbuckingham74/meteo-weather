import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './config/queryClient';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LocationProvider } from './contexts/LocationContext';
import { TemperatureUnitProvider, useTemperatureUnit } from './contexts/TemperatureUnitContext';
import { ToastProvider } from './contexts/ToastContext';
import {
  Cloud,
  Sun,
  Moon,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  LayoutGrid,
  Sparkles,
  GitCompare,
  Info,
  Bell,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import './index.css';
import './App.css';

// Lazy loaded pages
const WeatherDashboard = lazy(() => import('./pages/WeatherDashboard'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const AIWeatherPage = lazy(() => import('./pages/AIWeatherPage'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const PreferencesPage = lazy(() => import('./pages/PreferencesPage'));
const SharedAnswerPage = lazy(() => import('./pages/SharedAnswerPage'));

// Loading fallback
function PageLoader() {
  return (
    <div className="page-loader">
      <div className="page-loader-content">
        <div className="page-loader-icon">
          <Cloud size={48} />
        </div>
        <p className="page-loader-text">Loading...</p>
      </div>
    </div>
  );
}

// Header component
function Header() {
  const { theme, toggleTheme } = useTheme();
  const { unit, toggleUnit } = useTemperatureUnit();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutGrid },
    { to: '/ai-weather', label: 'AI Weather', icon: Sparkles },
    { to: '/compare', label: 'Compare', icon: GitCompare },
    { to: '/about', label: 'About', icon: Info },
  ];

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          {/* Logo */}
          <NavLink to="/" className="logo">
            <div className="logo-icon-wrapper">
              <Cloud size={28} className="logo-icon" />
              <Sun size={12} className="logo-accent" />
            </div>
            <span className="logo-text">Meteo</span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="header-actions">
            {/* Temperature Unit Toggle */}
            <button
              onClick={toggleUnit}
              className="unit-toggle"
              title={`Switch to °${unit === 'F' ? 'C' : 'F'}`}
            >
              °{unit}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="icon-btn"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun size={18} className="theme-icon-sun" />
              ) : (
                <Moon size={18} className="theme-icon-moon" />
              )}
            </button>

            {/* Notifications (placeholder) */}
            <button className="icon-btn icon-btn-hidden-mobile" aria-label="Notifications">
              <Bell size={18} />
            </button>

            {/* User Menu */}
            {user ? (
              <div className="user-menu">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="user-menu-trigger"
                >
                  <div className="user-avatar">
                    <User size={14} />
                  </div>
                  <ChevronDown size={14} className="user-menu-chevron" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="user-menu-backdrop" onClick={() => setUserMenuOpen(false)} />
                    <div className="user-menu-dropdown">
                      <div className="user-menu-header">
                        <p className="user-email">{user.email}</p>
                      </div>
                      <div className="user-menu-items">
                        <NavLink
                          to="/preferences"
                          onClick={() => setUserMenuOpen(false)}
                          className="user-menu-link"
                        >
                          <Settings size={16} />
                          Preferences
                        </NavLink>
                        {user.isAdmin && (
                          <NavLink
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="user-menu-link"
                          >
                            <LayoutGrid size={16} />
                            Admin Panel
                          </NavLink>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            setUserMenuOpen(false);
                          }}
                          className="user-menu-btn"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <NavLink to="/preferences" className="sign-in-btn">
                <User size={16} />
                Sign In
              </NavLink>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-btn"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="mobile-nav">
            <div className="mobile-nav-links">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}

              <div className="mobile-nav-actions">
                <button onClick={toggleUnit} className="mobile-toggle-btn">
                  °{unit}
                </button>
                <button onClick={toggleTheme} className="mobile-toggle-btn">
                  {theme === 'dark' ? (
                    <Sun size={18} className="theme-icon-sun" />
                  ) : (
                    <Moon size={18} className="theme-icon-moon" />
                  )}
                </button>
              </div>

              {!user && (
                <NavLink
                  to="/preferences"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mobile-sign-in"
                >
                  <User size={16} />
                  Sign In
                </NavLink>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

// Main layout
function AppLayout() {
  const { theme } = useTheme();

  // Apply theme class to html element
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    html.classList.add(theme);
  }, [theme]);

  return (
    <div className="app-layout">
      <Header />
      <main id="main-content">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<WeatherDashboard />} />
            <Route path="/location/:slug" element={<WeatherDashboard />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/ai-weather" element={<AIWeatherPage />} />
            <Route path="/ai-weather/shared/:shareId" element={<SharedAnswerPage />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/preferences" element={<PreferencesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <ThemeProvider>
            <TemperatureUnitProvider>
              <LocationProvider>
                <BrowserRouter>
                  <AppLayout />
                </BrowserRouter>
              </LocationProvider>
            </TemperatureUnitProvider>
          </ThemeProvider>
        </AuthProvider>
      </ToastProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />}
    </QueryClientProvider>
  );
}

export default App;
