import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../theme/ThemeToggle';
import AuthModal from './AuthModal';
import UserProfileModal from './UserProfileModal';
import { Button, Stack } from '@components/ui/primitives';
import styles from './AuthHeader.module.css';

/**
 * AuthHeader Component
 * Premium sticky header with mobile menu and branding
 */
function AuthHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isAboutPage = location.pathname === '/about';

  // Handle scroll for sticky header shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLoginClick = () => {
    setAuthMode('login');
    setShowAuthModal(true);
    setIsMobileMenuOpen(false);
  };

  const handleSignUpClick = () => {
    setAuthMode('register');
    setShowAuthModal(true);
    setIsMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return '?';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return names[0][0];
  };

  return (
    <>
      <header className={`${styles.headerWrapper} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.headerContainer}>
          {/* Logo/Branding */}
          <Link to="/" className={styles.logo} aria-label="Meteo Weather Home">
            <span className={styles.logoIcon} aria-hidden="true">
              ⛅
            </span>
            <span className={styles.logoText}>Meteo</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.desktopNav} aria-label="Main navigation">
            <Stack as="div" direction="row" align="center" gap="sm" className={styles.navLinks}>
              <Button as={Link} to="/about" variant="ghost">
                About
              </Button>
              <Button as={Link} to="/privacy" variant="ghost">
                Privacy
              </Button>
              {isAuthenticated && user?.isAdmin && (
                <Button as={Link} to="/admin" variant="secondary">
                  Admin
                </Button>
              )}
            </Stack>
          </nav>

          {/* Desktop Auth Section */}
          <div className={styles.desktopAuth}>
            {isAuthenticated ? (
              <Stack direction="row" gap="md" align="center" className={styles.userSection}>
                <span className={styles.userName}>{user?.name || user?.email}</span>
                <button
                  type="button"
                  className={styles.avatar}
                  onClick={handleProfileClick}
                  title="View Profile"
                  aria-label="View Profile"
                >
                  {getUserInitials()}
                </button>
                <Button onClick={handleLogout} variant="ghost" size="sm">
                  Sign Out
                </Button>
                <ThemeToggle />
              </Stack>
            ) : (
              <Stack direction="row" gap="sm" align="center" className={styles.buttonGroup}>
                <Button onClick={handleLoginClick} variant="ghost">
                  Sign In
                </Button>
                <Button onClick={handleSignUpClick} variant="primary">
                  Sign Up
                </Button>
                <ThemeToggle />
              </Stack>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className={styles.hamburger}
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.open : ''}`} />
            <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.open : ''}`} />
            <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.open : ''}`} />
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        <div
          className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}
          aria-hidden={!isMobileMenuOpen}
        >
          <nav className={styles.mobileNav} aria-label="Mobile navigation">
            {/* Navigation Links */}
            <div className={styles.mobileNavSection}>
              <h3 className={styles.mobileNavHeading}>Navigation</h3>
              <Button as={Link} to="/about" variant="ghost" fullWidth>
                About Meteo Weather
              </Button>
              <Button as={Link} to="/privacy" variant="ghost" fullWidth>
                Privacy Policy
              </Button>
              {isAuthenticated && user?.isAdmin && (
                <Button as={Link} to="/admin" variant="secondary" fullWidth>
                  Admin Panel
                </Button>
              )}
            </div>

            {/* Divider */}
            <div className={styles.mobileDivider} />

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className={styles.mobileNavSection}>
                <h3 className={styles.mobileNavHeading}>Account</h3>
                <div className={styles.mobileUserInfo}>
                  <div className={styles.avatar}>{getUserInitials()}</div>
                  <div className={styles.mobileUserDetails}>
                    <div className={styles.mobileUserName}>{user?.name || 'User'}</div>
                    <div className={styles.mobileUserEmail}>{user?.email}</div>
                  </div>
                </div>
                <Button onClick={handleProfileClick} variant="ghost" fullWidth>
                  View Profile
                </Button>
                <Button onClick={handleLogout} variant="ghost" fullWidth>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className={styles.mobileNavSection}>
                <h3 className={styles.mobileNavHeading}>Get Started</h3>
                <Button onClick={handleSignUpClick} variant="primary" fullWidth>
                  Sign Up
                </Button>
                <Button onClick={handleLoginClick} variant="ghost" fullWidth>
                  Sign In
                </Button>
              </div>
            )}

            {/* Theme Toggle */}
            <div className={styles.mobileThemeSection}>
              <ThemeToggle />
            </div>
          </nav>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className={styles.mobileOverlay} onClick={toggleMobileMenu} aria-hidden="true" />
        )}
      </header>

      {/* Hero Image Button - Only shows on About page */}
      {isAboutPage && (
        <Link to="/" className={styles.heroButton} aria-label="Go to Meteo Weather home page">
          <div className={styles.heroOverlay}>
            <span className={styles.heroText}>🏠 Go to Meteo Weather</span>
          </div>
        </Link>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />

      <UserProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </>
  );
}

export default AuthHeader;
