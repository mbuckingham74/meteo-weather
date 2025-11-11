import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TemperatureUnitToggle from './TemperatureUnitToggle';
import { useTemperatureUnit } from '../../contexts/TemperatureUnitContext';

// Mock TemperatureUnitContext
vi.mock('../../contexts/TemperatureUnitContext', () => ({
  useTemperatureUnit: vi.fn(),
}));

describe('TemperatureUnitToggle Component', () => {
  let mockToggleUnit;

  beforeEach(() => {
    mockToggleUnit = vi.fn();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders temperature unit toggle button', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'C',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      expect(screen.getByTestId('temp-unit-toggle')).toBeInTheDocument();
    });

    it('displays both Celsius and Fahrenheit options', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'C',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      expect(screen.getByTestId('celsius-option')).toBeInTheDocument();
      expect(screen.getByTestId('fahrenheit-option')).toBeInTheDocument();
    });

    it('displays separator between units', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'C',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      expect(screen.getByTestId('unit-separator')).toBeInTheDocument();
    });

    it('marks Celsius as active when unit is C', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'C',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      const celsiusSpan = screen.getByTestId('celsius-option');
      const fahrenheitSpan = screen.getByTestId('fahrenheit-option');

      expect(celsiusSpan.className).toContain('active');
      expect(fahrenheitSpan.className).not.toContain('active');
    });

    it('marks Fahrenheit as active when unit is F', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'F',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      const celsiusSpan = screen.getByTestId('celsius-option');
      const fahrenheitSpan = screen.getByTestId('fahrenheit-option');

      expect(celsiusSpan.className).not.toContain('active');
      expect(fahrenheitSpan.className).toContain('active');
    });

    it('has Celsius title when unit is C', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'C',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      const button = screen.getByTestId('temp-unit-toggle');
      expect(button).toHaveAttribute('title', 'Temperature: Celsius');
    });

    it('has Fahrenheit title when unit is F', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'F',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      const button = screen.getByTestId('temp-unit-toggle');
      expect(button).toHaveAttribute('title', 'Temperature: Fahrenheit');
    });
  });

  describe('Functionality', () => {
    it('calls toggleUnit when button is clicked', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'C',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      const button = screen.getByTestId('temp-unit-toggle');
      fireEvent.click(button);

      expect(mockToggleUnit).toHaveBeenCalled();
    });

    it('calls toggleUnit only once per click', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'C',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      const button = screen.getByTestId('temp-unit-toggle');
      fireEvent.click(button);

      expect(mockToggleUnit).toHaveBeenCalledTimes(1);
    });

    it('can be clicked multiple times', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'C',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      const button = screen.getByTestId('temp-unit-toggle');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockToggleUnit).toHaveBeenCalledTimes(3);
    });

    it('toggles from Celsius when clicked', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'C',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      const button = screen.getByTestId('temp-unit-toggle');
      fireEvent.click(button);

      expect(mockToggleUnit).toHaveBeenCalled();
    });

    it('toggles from Fahrenheit when clicked', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'F',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      const button = screen.getByTestId('temp-unit-toggle');
      fireEvent.click(button);

      expect(mockToggleUnit).toHaveBeenCalled();
    });
  });

  describe('CSS Modules', () => {
    it('applies CSS module classes to button', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'C',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      const button = screen.getByTestId('temp-unit-toggle');
      expect(button.className).toBeTruthy();
    });

    it('applies CSS module classes to unit options', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'C',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      const celsiusSpan = screen.getByTestId('celsius-option');
      const fahrenheitSpan = screen.getByTestId('fahrenheit-option');

      expect(celsiusSpan.className).toBeTruthy();
      expect(fahrenheitSpan.className).toBeTruthy();
    });

    it('applies CSS module class to separator', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'C',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      const separator = screen.getByTestId('unit-separator');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveTextContent('|');
    });

    it('applies active class to Celsius when selected', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'C',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      const celsiusSpan = screen.getByTestId('celsius-option');
      expect(celsiusSpan.className).toContain('active');
    });

    it('applies active class to Fahrenheit when selected', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'F',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      const fahrenheitSpan = screen.getByTestId('fahrenheit-option');
      expect(fahrenheitSpan.className).toContain('active');
    });
  });
});
