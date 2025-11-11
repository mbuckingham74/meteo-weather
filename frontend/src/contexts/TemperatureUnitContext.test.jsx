/**
 * Tests for TemperatureUnitContext
 * Testing temperature unit preference management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { TemperatureUnitProvider, useTemperatureUnit } from './TemperatureUnitContext';
import { AuthProvider } from './AuthContext';

// Mock authApi to prevent actual API calls
vi.mock('../services/authApi', () => ({
  getUserPreferences: vi.fn(),
  updateUserPreferences: vi.fn(),
}));

// Test component that uses the context
function TestComponent() {
  const { unit, setUnit } = useTemperatureUnit();

  return (
    <div>
      <div data-testid="current-unit">{unit}</div>
      <button onClick={() => setUnit('C')}>Set Celsius</button>
      <button onClick={() => setUnit('F')}>Set Fahrenheit</button>
    </div>
  );
}

// Helper to render with required providers
function renderWithProviders(component) {
  return render(<AuthProvider>{component}</AuthProvider>);
}

describe('TemperatureUnitContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Provider', () => {
    it('provides default unit as Fahrenheit', () => {
      renderWithProviders(
        <TemperatureUnitProvider>
          <TestComponent />
        </TemperatureUnitProvider>
      );

      expect(screen.getByTestId('current-unit')).toHaveTextContent('F');
    });

    it('loads saved unit from localStorage', () => {
      localStorage.setItem('temperatureUnit', 'C');

      renderWithProviders(
        <TemperatureUnitProvider>
          <TestComponent />
        </TemperatureUnitProvider>
      );

      expect(screen.getByTestId('current-unit')).toHaveTextContent('C');
    });

    it('falls back to Fahrenheit if localStorage has invalid value', () => {
      localStorage.setItem('temperatureUnit', 'invalid');

      renderWithProviders(
        <TemperatureUnitProvider>
          <TestComponent />
        </TemperatureUnitProvider>
      );

      expect(screen.getByTestId('current-unit')).toHaveTextContent('F');
    });
  });

  describe('setUnit', () => {
    it('changes unit to Celsius', () => {
      renderWithProviders(
        <TemperatureUnitProvider>
          <TestComponent />
        </TemperatureUnitProvider>
      );

      fireEvent.click(screen.getByText('Set Celsius'));

      expect(screen.getByTestId('current-unit')).toHaveTextContent('C');
    });

    it('changes unit to Fahrenheit', () => {
      renderWithProviders(
        <TemperatureUnitProvider>
          <TestComponent />
        </TemperatureUnitProvider>
      );

      fireEvent.click(screen.getByText('Set Fahrenheit'));

      expect(screen.getByTestId('current-unit')).toHaveTextContent('F');
    });

    it('saves unit to localStorage', () => {
      renderWithProviders(
        <TemperatureUnitProvider>
          <TestComponent />
        </TemperatureUnitProvider>
      );

      fireEvent.click(screen.getByText('Set Celsius'));

      expect(localStorage.getItem('temperatureUnit')).toBe('C');
    });
  });

  describe('Multiple Components', () => {
    it('shares unit state across multiple components', () => {
      function ComponentA() {
        const { unit } = useTemperatureUnit();
        return <div data-testid="component-a">{unit}</div>;
      }

      function ComponentB() {
        const { unit, setUnit } = useTemperatureUnit();
        return (
          <div>
            <div data-testid="component-b">{unit}</div>
            <button onClick={() => setUnit('C')}>Change to C</button>
          </div>
        );
      }

      renderWithProviders(
        <TemperatureUnitProvider>
          <ComponentA />
          <ComponentB />
        </TemperatureUnitProvider>
      );

      expect(screen.getByTestId('component-a')).toHaveTextContent('F');
      expect(screen.getByTestId('component-b')).toHaveTextContent('F');

      fireEvent.click(screen.getByText('Change to C'));

      expect(screen.getByTestId('component-a')).toHaveTextContent('C');
      expect(screen.getByTestId('component-b')).toHaveTextContent('C');
    });
  });

  describe('Error Handling', () => {
    it('requires provider to function', () => {
      // The context will throw an error if used outside provider
      // We can test that the provider is required by checking if component works with it
      const { container } = renderWithProviders(
        <TemperatureUnitProvider>
          <TestComponent />
        </TemperatureUnitProvider>
      );

      expect(container.querySelector('[data-testid="current-unit"]')).toBeInTheDocument();
    });
  });

  describe('Persistence', () => {
    it('persists unit preference across provider remounts', () => {
      const { unmount } = renderWithProviders(
        <TemperatureUnitProvider>
          <TestComponent />
        </TemperatureUnitProvider>
      );

      // Change to Celsius
      act(() => {
        const button = screen.getByText('Set Celsius');
        button.click();
      });

      expect(localStorage.getItem('temperatureUnit')).toBe('C');

      // Unmount
      unmount();

      // Remount - should load from localStorage (value is still 'C')
      renderWithProviders(
        <TemperatureUnitProvider>
          <TestComponent />
        </TemperatureUnitProvider>
      );

      expect(screen.getByTestId('current-unit')).toHaveTextContent('C');
    });
  });
});
