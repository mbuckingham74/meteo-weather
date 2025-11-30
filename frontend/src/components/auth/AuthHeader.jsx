/**
 * AuthHeader - Navigation header with auth integration
 */
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, LogOut, Settings, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function AuthHeader() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location]);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  const navLinks = [
    { to: '/', label: 'Weather' },
    { to: '/ai-weather', label: 'AI Weather' },
    { to: '/compare', label: 'Compare' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="bg-bg-card border-b border-steel-blue/20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="text-xl font-bold text-text-primary hover:text-accent transition-colors"
            >
              Meteo
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'text-accent'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side - Auth & Mobile Menu */}
            <div className="flex items-center gap-3">
              {/* Auth Section */}
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-bg-elevated animate-pulse" />
              ) : isAuthenticated ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-card-hover hover:bg-bg-elevated transition-colors"
                    aria-expanded={showUserMenu}
                    aria-haspopup="true"
                  >
                    <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                      <User size={16} className="text-slate-dark" />
                    </div>
                    <span className="hidden sm:block text-sm text-text-primary max-w-24 truncate">
                      {user?.name || user?.email?.split('@')[0]}
                    </span>
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 py-2 bg-bg-card rounded-xl shadow-elevated border border-steel-blue/20 z-50">
                      <div className="px-4 py-2 border-b border-steel-blue/20">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-text-muted truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/preferences"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-card-hover hover:text-text-primary transition-colors"
                      >
                        <Settings size={16} />
                        Preferences
                      </Link>

                      {user?.isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-card-hover hover:text-text-primary transition-colors"
                        >
                          <Shield size={16} />
                          Admin Panel
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-bg-card-hover transition-colors"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => setShowAuthModal(true)} className="btn btn-primary text-sm">
                  Sign In
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
                aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <nav className="md:hidden pt-4 pb-2 border-t border-steel-blue/20 mt-3">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.to)
                        ? 'bg-accent/10 text-accent'
                        : 'text-text-secondary hover:bg-bg-card-hover hover:text-text-primary'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Auth Modal - Simple inline for now, will be extracted in PR 7C */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}

/**
 * Simple Auth Modal - Login/Register form
 */
function AuthModal({ onClose }) {
  const { login, register, error } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError('');

    try {
      if (mode === 'register') {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setLocalError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative bg-bg-card rounded-2xl p-6 w-full max-w-md shadow-elevated"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <h2 id="auth-modal-title" className="text-xl font-semibold text-text-primary mb-6">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label htmlFor="name" className="block text-sm text-text-secondary mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Your name"
                required={mode === 'register'}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm text-text-secondary mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-text-secondary mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
            />
          </div>

          {(localError || error) && <p className="text-red-400 text-sm">{localError || error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn btn-primary py-3 disabled:opacity-50"
          >
            {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setLocalError('');
            }}
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

export default AuthHeader;
