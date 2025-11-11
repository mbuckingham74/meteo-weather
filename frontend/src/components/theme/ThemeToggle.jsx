import { Button } from '@components/ui/primitives';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * ThemeToggle Component
 * Simple button to cycle between light, dark, and auto themes
 * CSS Modules Migration: Phase 1.1
 */
const THEME_SEQUENCE = ['light', 'dark', 'aurora', 'sunset', 'auto'];
const THEME_ICONS = {
  light: '☀️',
  dark: '🌙',
  aurora: '🌌',
  sunset: '🌇',
};
const THEME_LABELS = {
  light: 'Light',
  dark: 'Dark',
  aurora: 'Aurora',
  sunset: 'Sunset',
  auto: 'Auto',
};

function ThemeToggle({ compact = false }) {
  const { themePreference, actualTheme, setTheme } = useTheme();

  const getThemeIcon = () => {
    if (themePreference === 'auto') {
      if (actualTheme === 'dark') return THEME_ICONS.dark;
      return THEME_ICONS.light;
    }
    return THEME_ICONS[themePreference] || '🎨';
  };

  const getThemeLabel = () => {
    return THEME_LABELS[themePreference] || 'Custom';
  };

  // Cycle through themes: light -> dark -> aurora -> sunset -> auto -> light
  const cycleTheme = () => {
    const currentIndex = THEME_SEQUENCE.indexOf(themePreference);
    const nextIndex = (currentIndex + 1) % THEME_SEQUENCE.length;
    setTheme(THEME_SEQUENCE[nextIndex]);
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
