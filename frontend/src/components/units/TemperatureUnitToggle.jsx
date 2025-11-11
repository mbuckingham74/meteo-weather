import React from 'react';
import { useTemperatureUnit } from '../../contexts/TemperatureUnitContext';
import styles from './TemperatureUnitToggle.module.css';

/**
 * TemperatureUnitToggle Component
 * Toggle button to switch between Celsius and Fahrenheit
 * CSS Modules Migration: Phase 1.1
 */
function TemperatureUnitToggle() {
  const { unit, toggleUnit } = useTemperatureUnit();

  return (
    <button
      className={styles.toggle}
      onClick={toggleUnit}
      title={`Temperature: ${unit === 'C' ? 'Celsius' : 'Fahrenheit'}`}
      data-testid="temp-unit-toggle"
    >
      <span
        className={`${styles.option} ${unit === 'C' ? styles.active : ''}`}
        data-testid="celsius-option"
      >
        °C
      </span>
      <span className={styles.separator} data-testid="unit-separator">
        |
      </span>
      <span
        className={`${styles.option} ${unit === 'F' ? styles.active : ''}`}
        data-testid="fahrenheit-option"
      >
        °F
      </span>
    </button>
  );
}

export default TemperatureUnitToggle;
