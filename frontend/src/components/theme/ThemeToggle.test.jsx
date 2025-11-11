import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../../contexts/ThemeContext';

// Mock ThemeContext
vi.mock('../../contexts/ThemeContext', () => ({
  useTheme: vi.fn(),
}));

describe('ThemeToggle Component', () => {
  let mockSetTheme;

  beforeEach(() => {
    mockSetTheme = vi.fn();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders theme toggle button', () => {
      useTheme.mockReturnValue({
        themePreference: 'light',
        actualTheme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Light')).toBeInTheDocument();
    });

    it('displays sun icon for light theme', () => {
      useTheme.mockReturnValue({
        themePreference: 'light',
        actualTheme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      expect(screen.getByText('☀️')).toBeInTheDocument();
      expect(screen.getByText('Light')).toBeInTheDocument();
    });

    it('displays moon icon for dark theme', () => {
      useTheme.mockReturnValue({
        themePreference: 'dark',
        actualTheme: 'dark',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      expect(screen.getByText('🌙')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
    });

    it('displays Auto label for auto theme', () => {
      useTheme.mockReturnValue({
        themePreference: 'auto',
        actualTheme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      expect(screen.getByText('Auto')).toBeInTheDocument();
    });

    it('displays sun icon in auto mode when actual theme is light', () => {
      useTheme.mockReturnValue({
        themePreference: 'auto',
        actualTheme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      expect(screen.getByText('☀️')).toBeInTheDocument();
    });

    it('displays moon icon in auto mode when actual theme is dark', () => {
      useTheme.mockReturnValue({
        themePreference: 'auto',
        actualTheme: 'dark',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      expect(screen.getByText('🌙')).toBeInTheDocument();
    });

    it('displays aurora icon and label', () => {
      useTheme.mockReturnValue({
        themePreference: 'aurora',
        actualTheme: 'aurora',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      expect(screen.getByText('🌌')).toBeInTheDocument();
      expect(screen.getByText('Aurora')).toBeInTheDocument();
    });

    it('displays sunset icon and label', () => {
      useTheme.mockReturnValue({
        themePreference: 'sunset',
        actualTheme: 'sunset',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      expect(screen.getByText('🌇')).toBeInTheDocument();
      expect(screen.getByText('Sunset')).toBeInTheDocument();
    });

    it('hides the label when compact prop is true', () => {
      useTheme.mockReturnValue({
        themePreference: 'light',
        actualTheme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle compact={true} />);

      expect(screen.queryByText('Light')).not.toBeInTheDocument();
    });

    it('shows the label when compact prop is false', () => {
      useTheme.mockReturnValue({
        themePreference: 'light',
        actualTheme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle compact={false} />);

      expect(screen.getByText('Light')).toBeInTheDocument();
    });
  });

  describe('Theme Cycling', () => {
    it('cycles from light to dark when clicked', () => {
      useTheme.mockReturnValue({
        themePreference: 'light',
        actualTheme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('cycles from dark to aurora when clicked', () => {
      useTheme.mockReturnValue({
        themePreference: 'dark',
        actualTheme: 'dark',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockSetTheme).toHaveBeenCalledWith('aurora');
    });

    it('cycles from aurora to sunset when clicked', () => {
      useTheme.mockReturnValue({
        themePreference: 'aurora',
        actualTheme: 'aurora',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockSetTheme).toHaveBeenCalledWith('sunset');
    });

    it('cycles from sunset to auto when clicked', () => {
      useTheme.mockReturnValue({
        themePreference: 'sunset',
        actualTheme: 'sunset',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockSetTheme).toHaveBeenCalledWith('auto');
    });

    it('cycles from auto to light when clicked', () => {
      useTheme.mockReturnValue({
        themePreference: 'auto',
        actualTheme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    it('calls setTheme only once per click', () => {
      useTheme.mockReturnValue({
        themePreference: 'light',
        actualTheme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockSetTheme).toHaveBeenCalledTimes(1);
    });

    it('can be clicked multiple times', () => {
      useTheme.mockReturnValue({
        themePreference: 'light',
        actualTheme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockSetTheme).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('has descriptive title for light theme', () => {
      useTheme.mockReturnValue({
        themePreference: 'light',
        actualTheme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Theme: Light (click to cycle)');
    });

    it('has descriptive title for dark theme', () => {
      useTheme.mockReturnValue({
        themePreference: 'dark',
        actualTheme: 'dark',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Theme: Dark (click to cycle)');
    });

    it('has descriptive title for auto theme', () => {
      useTheme.mockReturnValue({
        themePreference: 'auto',
        actualTheme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Theme: Auto (click to cycle)');
    });
  });

  describe('Structure', () => {
    it('renders exactly one button element', () => {
      useTheme.mockReturnValue({
        themePreference: 'light',
        actualTheme: 'light',
        setTheme: mockSetTheme,
      });

      const { container } = render(<ThemeToggle />);

      expect(container.querySelectorAll('button')).toHaveLength(1);
    });

    it('renders the icon inside an aria-hidden span', () => {
      useTheme.mockReturnValue({
        themePreference: 'light',
        actualTheme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle />);

      const iconSpan = screen.getByRole('button').querySelector("span[aria-hidden='true']");
      expect(iconSpan).not.toBeNull();
    });

    it('renders a label span when not compact', () => {
      useTheme.mockReturnValue({
        themePreference: 'light',
        actualTheme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle compact={false} />);

      const label = screen.getByText('Light');
      expect(label.tagName).toBe('SPAN');
    });

    it('omits the label span when compact', () => {
      useTheme.mockReturnValue({
        themePreference: 'light',
        actualTheme: 'light',
        setTheme: mockSetTheme,
      });

      render(<ThemeToggle compact />);

      expect(screen.queryByText('Light')).not.toBeInTheDocument();
    });
  });
});
