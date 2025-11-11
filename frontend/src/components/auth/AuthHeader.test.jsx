import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuthHeader from './AuthHeader';
import { useAuth } from '../../contexts/AuthContext';

// Mock dependencies
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../theme/ThemeToggle', () => {
  return function MockThemeToggle() {
    return <div data-testid="theme-toggle">ThemeToggle</div>;
  };
});

vi.mock('./AuthModal', () => {
  return function MockAuthModal({ isOpen, onClose, initialMode }) {
    return isOpen ? (
      <div data-testid="auth-modal">
        AuthModal - {initialMode}
        <button onClick={onClose}>Close</button>
      </div>
    ) : null;
  };
});

vi.mock('./UserProfileModal', () => {
  return function MockUserProfileModal({ isOpen, onClose }) {
    return isOpen ? (
      <div data-testid="profile-modal">
        UserProfileModal
        <button onClick={onClose}>Close</button>
      </div>
    ) : null;
  };
});

describe('AuthHeader Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Unauthenticated State', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });
    });

    it('renders privacy policy link', () => {
      render(<AuthHeader />);

      const privacyLink = screen.getByText('Meteo Privacy Policy');
      expect(privacyLink).toBeInTheDocument();
      expect(privacyLink).toHaveAttribute('href', '/privacy');
    });

    it('renders Sign In button when not authenticated', () => {
      render(<AuthHeader />);

      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('renders Sign Up button when not authenticated', () => {
      render(<AuthHeader />);

      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('renders ThemeToggle when not authenticated', () => {
      render(<AuthHeader />);

      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    it('does not render user info when not authenticated', () => {
      const { container } = render(<AuthHeader />);

      expect(container.querySelector('.auth-user-info')).not.toBeInTheDocument();
    });

    it('opens auth modal in login mode when Sign In clicked', () => {
      render(<AuthHeader />);

      const signInButton = screen.getByText('Sign In');
      fireEvent.click(signInButton);

      expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
      expect(screen.getByText(/AuthModal - login/i)).toBeInTheDocument();
    });

    it('opens auth modal in register mode when Sign Up clicked', () => {
      render(<AuthHeader />);

      const signUpButton = screen.getByText('Sign Up');
      fireEvent.click(signUpButton);

      expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
      expect(screen.getByText(/AuthModal - register/i)).toBeInTheDocument();
    });

    it('closes auth modal when onClose called', () => {
      render(<AuthHeader />);

      // Open modal
      const signInButton = screen.getByText('Sign In');
      fireEvent.click(signInButton);

      expect(screen.getByTestId('auth-modal')).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated State', () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
    };

    beforeEach(() => {
      useAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      });
    });

    it('renders user name when authenticated', () => {
      render(<AuthHeader />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders user avatar button when authenticated', () => {
      render(<AuthHeader />);

      expect(screen.getByTitle('View Profile')).toBeInTheDocument();
    });

    it('does not render Sign In button when authenticated', () => {
      render(<AuthHeader />);

      expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    });

    it('does not render Sign Up button when authenticated', () => {
      render(<AuthHeader />);

      expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
    });

    it('renders ThemeToggle when authenticated', () => {
      render(<AuthHeader />);

      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    it('opens profile modal when avatar clicked', () => {
      render(<AuthHeader />);

      const avatarButton = screen.getByTitle('View Profile');
      fireEvent.click(avatarButton);

      expect(screen.getByTestId('profile-modal')).toBeInTheDocument();
    });

    it('closes profile modal when onClose called', () => {
      render(<AuthHeader />);

      // Open modal
      const avatarButton = screen.getByTitle('View Profile');
      fireEvent.click(avatarButton);

      expect(screen.getByTestId('profile-modal')).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('profile-modal')).not.toBeInTheDocument();
    });
  });

  describe('User Initials', () => {
    it('displays initials for full name', () => {
      useAuth.mockReturnValue({
        user: { name: 'John Doe' },
        isAuthenticated: true,
      });

      render(<AuthHeader />);

      const avatar = screen.getByTitle('View Profile');
      expect(avatar).toHaveTextContent('JD');
    });

    it('displays first letter for single name', () => {
      useAuth.mockReturnValue({
        user: { name: 'John' },
        isAuthenticated: true,
      });

      render(<AuthHeader />);

      const avatar = screen.getByTitle('View Profile');
      expect(avatar).toHaveTextContent('J');
    });

    it('displays question mark when name is missing', () => {
      useAuth.mockReturnValue({
        user: {},
        isAuthenticated: true,
      });

      render(<AuthHeader />);

      const avatar = screen.getByTitle('View Profile');
      expect(avatar).toHaveTextContent('?');
    });

    it('displays question mark when user is null', () => {
      useAuth.mockReturnValue({
        user: null,
        isAuthenticated: true,
      });

      render(<AuthHeader />);

      const avatar = screen.getByTitle('View Profile');
      expect(avatar).toHaveTextContent('?');
    });

    it('handles names with more than 2 parts', () => {
      useAuth.mockReturnValue({
        user: { name: 'John Michael Doe' },
        isAuthenticated: true,
      });

      render(<AuthHeader />);

      const avatar = screen.getByTitle('View Profile');
      expect(avatar).toHaveTextContent('JM');
    });
  });

  describe('CSS Classes', () => {
    it('has auth-header class on container', () => {
      useAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });

      const { container } = render(<AuthHeader />);

      expect(container.querySelector('.auth-header')).toBeInTheDocument();
    });

    it('has auth-header-left class on privacy link container', () => {
      useAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });

      const { container } = render(<AuthHeader />);

      expect(container.querySelector('.auth-header-left')).toBeInTheDocument();
    });

    it('has auth-header-buttons class when not authenticated', () => {
      useAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });

      const { container } = render(<AuthHeader />);

      expect(container.querySelector('.auth-header-buttons')).toBeInTheDocument();
    });

    it('has auth-user-info class when authenticated', () => {
      useAuth.mockReturnValue({
        user: { name: 'John Doe' },
        isAuthenticated: true,
      });

      const { container } = render(<AuthHeader />);

      expect(container.querySelector('.auth-user-info')).toBeInTheDocument();
    });

    it('has primary class on Sign Up button', () => {
      useAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
      });

      render(<AuthHeader />);

      const signUpButton = screen.getByText('Sign Up').closest('button');
      expect(signUpButton).toHaveClass('primary');
    });
  });
});
