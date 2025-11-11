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

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('displays both Celsius and Fahrenheit options', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'C',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      expect(screen.getByText('°C')).toBeInTheDocument();
      expect(screen.getByText('°F')).toBeInTheDocument();
    });

    it('displays separator between units', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'C',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      expect(screen.getByText('|')).toBeInTheDocument();
    });

    it('marks Celsius as active when unit is C', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'C',
        toggleUnit: mockToggleUnit,
      });

      const { container: _container } = render(<TemperatureUnitToggle />);

      const celsiusSpan = screen.getByText('°C');
      const fahrenheitSpan = screen.getByText('°F');

      expect(celsiusSpan).toHaveClass('active');
      expect(fahrenheitSpan).not.toHaveClass('active');
    });

    it('marks Fahrenheit as active when unit is F', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'F',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      const celsiusSpan = screen.getByText('°C');
      const fahrenheitSpan = screen.getByText('°F');

      expect(celsiusSpan).not.toHaveClass('active');
      expect(fahrenheitSpan).toHaveClass('active');
    });

    it('has Celsius title when unit is C', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'C',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Temperature: Celsius');
    });

    it('has Fahrenheit title when unit is F', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'F',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      const button = screen.getByRole('button');
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

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockToggleUnit).toHaveBeenCalled();
    });

    it('calls toggleUnit only once per click', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'C',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockToggleUnit).toHaveBeenCalledTimes(1);
    });

    it('can be clicked multiple times', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'C',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      const button = screen.getByRole('button');
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

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockToggleUnit).toHaveBeenCalled();
    });

    it('toggles from Fahrenheit when clicked', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'F',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockToggleUnit).toHaveBeenCalled();
    });
  });

  describe('CSS Classes', () => {
    it('has temp-unit-toggle class on button', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'C',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('temp-unit-toggle');
    });

    it('has unit-option class on both unit spans', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'C',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      const celsiusSpan = screen.getByText('°C');
      const fahrenheitSpan = screen.getByText('°F');

      expect(celsiusSpan).toHaveClass('unit-option');
      expect(fahrenheitSpan).toHaveClass('unit-option');
    });

    it('has unit-separator class on separator span', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'C',
        toggleUnit: mockToggleUnit,
      });

      const { container } = render(<TemperatureUnitToggle />);

      const separator = container.querySelector('.unit-separator');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveTextContent('|');
    });

    it('applies both unit-option and active classes to Celsius when selected', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'C',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      const celsiusSpan = screen.getByText('°C');
      expect(celsiusSpan.className).toContain('unit-option');
      expect(celsiusSpan.className).toContain('active');
    });

    it('applies both unit-option and active classes to Fahrenheit when selected', () => {
      useTemperatureUnit.mockReturnValue({
        unit: 'F',
        toggleUnit: mockToggleUnit,
      });

      render(<TemperatureUnitToggle />);

      const fahrenheitSpan = screen.getByText('°F');
      expect(fahrenheitSpan.className).toContain('unit-option');
      expect(fahrenheitSpan.className).toContain('active');
    });
  });
});
