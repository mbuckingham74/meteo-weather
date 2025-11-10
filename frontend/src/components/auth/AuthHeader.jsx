import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../theme/ThemeToggle';
import AuthModal from './AuthModal';
import UserProfileModal from './UserProfileModal';
import { Button, Stack } from '@components/ui/primitives';
import styles from './AuthHeader.module.css';

/**
 * AuthHeader Component
 * Displays authentication status and provides login/profile access
 */
function AuthHeader() {
  const { user, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const location = useLocation();
  const isAboutPage = location.pathname === '/about';

  const handleLoginClick = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleSignUpClick = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
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
      <Stack
        as="header"
        direction="row"
        align="center"
        justify="space-between"
        gap="md"
        wrap
        className={styles.header}
      >
        <Stack as="div" direction="row" align="center" gap="sm" wrap className={styles.linkGroup}>
          <Button as={Link} to="/about" variant="ghost">
            About Meteo Weather
          </Button>
          <Button as={Link} to="/privacy" variant="ghost">
            Privacy Policy
          </Button>
          {isAuthenticated && user?.isAdmin && (
            <Button as={Link} to="/admin" variant="secondary">
              Admin Panel
            </Button>
          )}
        </Stack>
        {isAuthenticated ? (
          <Stack direction="row" gap="md" align="center" className={styles.userSection}>
            <span className={styles.userName}>{user?.name}</span>
            <button
              type="button"
              className={styles.avatar}
              onClick={handleProfileClick}
              title="View Profile"
            >
              {getUserInitials()}
            </button>
            <ThemeToggle />
          </Stack>
        ) : (
          <Stack direction="row" gap="sm" align="center" wrap className={styles.buttonGroup}>
            <Button onClick={handleLoginClick} variant="ghost">
              Sign In
            </Button>
            <Button onClick={handleSignUpClick} variant="primary">
              Sign Up
            </Button>
            <ThemeToggle />
          </Stack>
        )}
      </Stack>

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
