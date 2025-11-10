import { Button } from '@components/ui/primitives';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * ThemeToggle Component
 * Simple button to cycle between light, dark, and auto themes
 * CSS Modules Migration: Phase 1.1
 */
function ThemeToggle({ compact = false }) {
  const { themePreference, actualTheme, setTheme } = useTheme();

  const getThemeIcon = () => {
    if (themePreference === 'auto') {
      return actualTheme === 'dark' ? '🌙' : '☀️';
    }
    return themePreference === 'dark' ? '🌙' : '☀️';
  };

  const getThemeLabel = () => {
    if (themePreference === 'auto') {
      return 'Auto';
    }
    return themePreference === 'dark' ? 'Dark' : 'Light';
  };

  // Cycle through themes: light -> dark -> auto -> light
  const cycleTheme = () => {
    const themeOrder = ['light', 'dark', 'auto'];
    const currentIndex = themeOrder.indexOf(themePreference);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  return (
    <Button
      variant="ghost"
      onClick={cycleTheme}
      title={`Theme: ${getThemeLabel()} (click to cycle)`}
    >
      <span aria-hidden="true">{getThemeIcon()}</span>
      {!compact && <span>{getThemeLabel()}</span>}
    </Button>
  );
}

export default ThemeToggle;
