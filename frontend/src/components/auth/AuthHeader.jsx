import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../theme/ThemeToggle';
import AuthModal from './AuthModal';
import UserProfileModal from './UserProfileModal';
import './AuthHeader.css';

/**
 * AuthHeader Component
 * Displays authentication status and provides login/profile access
 */
function AuthHeader() {
  const { user, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const isAboutPage = window.location.pathname === '/about';

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
      <div className="auth-header">
        <div className="auth-header-left">
          <a href="/about" className="auth-header-button auth-header-about-button">
            About Meteo Weather
          </a>
          <a href="/privacy" className="auth-header-button auth-header-privacy-button">
            Privacy Policy
          </a>
        </div>
        {isAuthenticated ? (
          <div className="auth-user-info">
            <span className="auth-user-name">{user?.name}</span>
            <button
              className="auth-user-avatar"
              onClick={handleProfileClick}
              title="View Profile"
            >
              {getUserInitials()}
            </button>
          </div>
        ) : (
          <div className="auth-header-buttons">
            <button
              className="auth-header-button"
              onClick={handleLoginClick}
            >
              <span>Sign In</span>
            </button>
            <button
              className="auth-header-button primary"
              onClick={handleSignUpClick}
            >
              <span>Sign Up</span>
            </button>
            <ThemeToggle />
          </div>
        )}
        {isAuthenticated && <ThemeToggle />}
      </div>

      {/* Hero Image Button - Only shows on About page */}
      {isAboutPage && (
        <a href="/" className="hero-image-button" aria-label="Go to Meteo Weather home page">
          <div className="hero-image-overlay">
            <span className="hero-image-text">🏠 Go to Meteo Weather</span>
          </div>
        </a>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />

      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
}

export default AuthHeader;
