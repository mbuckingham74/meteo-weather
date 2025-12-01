/**
 * TemperatureToggle - Clean toggle switch for °F/°C
 */
import { useTemperatureUnit } from '../../contexts/TemperatureUnitContext';

function TemperatureToggle() {
  const { unit, toggleUnit } = useTemperatureUnit();

  return (
    <button
      onClick={toggleUnit}
      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-bg-card hover:bg-bg-card-hover transition-colors"
      aria-label={`Temperature unit: ${unit === 'F' ? 'Fahrenheit' : 'Celsius'}. Click to switch to ${unit === 'F' ? 'Celsius' : 'Fahrenheit'}`}
    >
      <span
        className={`px-2 py-1 rounded-lg text-sm font-medium transition-colors ${
          unit === 'F' ? 'bg-accent text-slate-dark' : 'text-text-muted hover:text-text-secondary'
        }`}
      >
        °F
      </span>
      <span
        className={`px-2 py-1 rounded-lg text-sm font-medium transition-colors ${
          unit === 'C' ? 'bg-accent text-slate-dark' : 'text-text-muted hover:text-text-secondary'
        }`}
      >
        °C
      </span>
    </button>
  );
}

export default TemperatureToggle;
