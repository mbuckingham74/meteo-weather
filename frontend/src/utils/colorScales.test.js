import {
  getTemperatureColor,
  getTemperatureBand,
  TEMPERATURE_BANDS,
  PRECIPITATION_COLORS,
  METRIC_COLORS,
  getUVIndexColor,
  getCloudCoverColor,
  getWindSpeedColor,
} from './colorScales';
import { chartPalette } from '../constants';

describe('colorScales', () => {
  describe('getTemperatureColor', () => {
    it('returns frigid color for very cold temperatures', () => {
      expect(getTemperatureColor(-20)).toBe(chartPalette.accent);
      expect(getTemperatureColor(-5)).toBe(chartPalette.accent);
    });

    it('returns cold color for cold temperatures', () => {
      expect(getTemperatureColor(0)).toBe(chartPalette.cool);
      expect(getTemperatureColor(5)).toBe(chartPalette.cool);
    });

    it('returns cool color for cool temperatures', () => {
      expect(getTemperatureColor(10)).toBe(chartPalette.coolAccent);
      expect(getTemperatureColor(12)).toBe(chartPalette.coolAccent);
    });

    it('returns comfortable color for moderate temperatures', () => {
      expect(getTemperatureColor(15)).toBe(chartPalette.positive);
      expect(getTemperatureColor(20)).toBe(chartPalette.positive);
    });

    it('returns warm color for warm temperatures', () => {
      expect(getTemperatureColor(25)).toBe(chartPalette.warning);
      expect(getTemperatureColor(28)).toBe(chartPalette.warning);
    });

    it('returns hot color for hot temperatures', () => {
      expect(getTemperatureColor(30)).toBe(chartPalette.hot);
      expect(getTemperatureColor(33)).toBe(chartPalette.hot);
    });

    it('returns sweltering color for very hot temperatures', () => {
      expect(getTemperatureColor(35)).toBe(chartPalette.hot);
      expect(getTemperatureColor(45)).toBe(chartPalette.hot);
    });

    it('handles decimal temperatures', () => {
      expect(getTemperatureColor(20.5)).toBeTruthy();
      expect(getTemperatureColor(32.7)).toBeTruthy();
    });

    it('handles negative temperatures', () => {
      expect(getTemperatureColor(-40)).toBe(chartPalette.accent);
      expect(getTemperatureColor(-10)).toBe(chartPalette.accent);
    });
  });

  describe('getTemperatureBand', () => {
    it('returns correct band name for frigid', () => {
      expect(getTemperatureBand(-20)).toBe('Frigid');
      expect(getTemperatureBand(-5)).toBe('Frigid');
    });

    it('returns correct band name for cold', () => {
      expect(getTemperatureBand(0)).toBe('Cold');
      expect(getTemperatureBand(5)).toBe('Cold');
    });

    it('returns correct band name for cool', () => {
      expect(getTemperatureBand(10)).toBe('Cool');
      expect(getTemperatureBand(12)).toBe('Cool');
    });

    it('returns correct band name for comfortable', () => {
      expect(getTemperatureBand(15)).toBe('Comfortable');
      expect(getTemperatureBand(20)).toBe('Comfortable');
    });

    it('returns correct band name for warm', () => {
      expect(getTemperatureBand(25)).toBe('Warm');
      expect(getTemperatureBand(28)).toBe('Warm');
    });

    it('returns correct band name for hot', () => {
      expect(getTemperatureBand(30)).toBe('Hot');
      expect(getTemperatureBand(33)).toBe('Hot');
    });

    it('returns correct band name for sweltering', () => {
      expect(getTemperatureBand(35)).toBe('Sweltering');
      expect(getTemperatureBand(45)).toBe('Sweltering');
    });
  });

  describe('TEMPERATURE_BANDS', () => {
    it('is an array', () => {
      expect(Array.isArray(TEMPERATURE_BANDS)).toBe(true);
    });

    it('has 7 bands', () => {
      expect(TEMPERATURE_BANDS).toHaveLength(7);
    });

    it('each band has required properties', () => {
      TEMPERATURE_BANDS.forEach((band) => {
        expect(band).toHaveProperty('name');
        expect(band).toHaveProperty('min');
        expect(band).toHaveProperty('max');
        expect(band).toHaveProperty('color');
      });
    });

    it('bands have correct names', () => {
      const names = TEMPERATURE_BANDS.map((b) => b.name);
      expect(names).toContain('Frigid');
      expect(names).toContain('Cold');
      expect(names).toContain('Cool');
      expect(names).toContain('Comfortable');
      expect(names).toContain('Warm');
      expect(names).toContain('Hot');
      expect(names).toContain('Sweltering');
    });

    it('bands use chart palette tokens', () => {
      const paletteValues = Object.values(chartPalette);
      TEMPERATURE_BANDS.forEach((band) => {
        expect(paletteValues).toContain(band.color);
      });
    });
  });

  describe('PRECIPITATION_COLORS', () => {
    it('has rain color', () => {
      expect(PRECIPITATION_COLORS).toHaveProperty('rain');
      expect(PRECIPITATION_COLORS.rain).toBe(chartPalette.cool);
    });

    it('has snow color', () => {
      expect(PRECIPITATION_COLORS).toHaveProperty('snow');
      expect(PRECIPITATION_COLORS.snow).toBe('var(--bg-tertiary)');
    });

    it('has mixed color', () => {
      expect(PRECIPITATION_COLORS).toHaveProperty('mixed');
      expect(PRECIPITATION_COLORS.mixed).toBe(chartPalette.accentSecondary);
    });

    it('has probability color', () => {
      expect(PRECIPITATION_COLORS).toHaveProperty('probability');
      expect(PRECIPITATION_COLORS.probability).toBe(chartPalette.warning);
    });
  });

  describe('METRIC_COLORS', () => {
    const expectedMetrics = [
      'temperature',
      'feelsLike',
      'humidity',
      'precipitation',
      'cloudCover',
      'uvIndex',
      'windSpeed',
      'pressure',
    ];

    it('has all expected metric colors', () => {
      expectedMetrics.forEach((metric) => {
        expect(METRIC_COLORS).toHaveProperty(metric);
      });
    });

    it('all metrics use palette tokens', () => {
      expect(METRIC_COLORS.temperature).toBe(chartPalette.hot);
      expect(METRIC_COLORS.feelsLike).toBe(chartPalette.warning);
      expect(METRIC_COLORS.humidity).toBe(chartPalette.coolAccent);
      expect(METRIC_COLORS.precipitation).toBe(chartPalette.cool);
      expect(METRIC_COLORS.cloudCover).toBe(chartPalette.neutral);
      expect(METRIC_COLORS.uvIndex).toBe(chartPalette.warning);
      expect(METRIC_COLORS.windSpeed).toBe(chartPalette.positive);
      expect(METRIC_COLORS.pressure).toBe(chartPalette.accentSecondary);
    });
  });

  describe('getUVIndexColor', () => {
    it('returns green for low UV index (0-2)', () => {
      expect(getUVIndexColor(0)).toBe(chartPalette.positive);
      expect(getUVIndexColor(2)).toBe(chartPalette.positive);
    });

    it('returns yellow for moderate UV index (3-5)', () => {
      expect(getUVIndexColor(3)).toBe(chartPalette.warning);
      expect(getUVIndexColor(5)).toBe(chartPalette.warning);
    });

    it('returns orange for high UV index (6-7)', () => {
      expect(getUVIndexColor(6)).toBe(chartPalette.warning);
      expect(getUVIndexColor(7)).toBe(chartPalette.warning);
    });

    it('returns red for very high UV index (8-10)', () => {
      expect(getUVIndexColor(8)).toBe(chartPalette.hot);
      expect(getUVIndexColor(10)).toBe(chartPalette.hot);
    });

    it('returns dark red for extreme UV index (11+)', () => {
      expect(getUVIndexColor(11)).toBe(chartPalette.hot);
      expect(getUVIndexColor(15)).toBe(chartPalette.hot);
    });

    it('handles decimal UV values', () => {
      expect(getUVIndexColor(2.5)).toBeTruthy();
      expect(getUVIndexColor(7.8)).toBeTruthy();
    });
  });

  describe('getCloudCoverColor', () => {
    it('returns light blue for clear skies (0-19%)', () => {
      expect(getCloudCoverColor(0)).toBe(chartPalette.cool);
      expect(getCloudCoverColor(15)).toBe(chartPalette.cool);
    });

    it('returns light gray for partly cloudy (20-49%)', () => {
      expect(getCloudCoverColor(20)).toBe(chartPalette.neutral);
      expect(getCloudCoverColor(40)).toBe(chartPalette.neutral);
    });

    it('returns gray for mostly cloudy (50-79%)', () => {
      expect(getCloudCoverColor(50)).toBe(chartPalette.textMuted);
      expect(getCloudCoverColor(70)).toBe(chartPalette.textMuted);
    });

    it('returns dark gray for overcast (80-100%)', () => {
      expect(getCloudCoverColor(80)).toBe('var(--text-secondary)');
      expect(getCloudCoverColor(100)).toBe('var(--text-secondary)');
    });

    it('handles decimal values', () => {
      expect(getCloudCoverColor(25.5)).toBeTruthy();
      expect(getCloudCoverColor(75.3)).toBeTruthy();
    });
  });

  describe('getWindSpeedColor', () => {
    it('returns green for calm winds (0-9 km/h)', () => {
      expect(getWindSpeedColor(0)).toBe(chartPalette.positive);
      expect(getWindSpeedColor(9)).toBe(chartPalette.positive);
    });

    it('returns yellow for light winds (10-29 km/h)', () => {
      expect(getWindSpeedColor(10)).toBe(chartPalette.warning);
      expect(getWindSpeedColor(25)).toBe(chartPalette.warning);
    });

    it('returns orange for moderate winds (30-49 km/h)', () => {
      expect(getWindSpeedColor(30)).toBe(chartPalette.warning);
      expect(getWindSpeedColor(45)).toBe(chartPalette.warning);
    });

    it('returns red for strong winds (50-69 km/h)', () => {
      expect(getWindSpeedColor(50)).toBe(chartPalette.hot);
      expect(getWindSpeedColor(65)).toBe(chartPalette.hot);
    });

    it('returns hot palette color for gale winds (70+ km/h)', () => {
      expect(getWindSpeedColor(70)).toBe(chartPalette.hot);
      expect(getWindSpeedColor(100)).toBe(chartPalette.hot);
    });

    it('handles decimal values', () => {
      expect(getWindSpeedColor(12.5)).toBeTruthy();
      expect(getWindSpeedColor(55.7)).toBeTruthy();
    });
  });

  describe('Color token validation', () => {
    it('all functions return CSS variable tokens', () => {
      const cssVarRegex = /^var\(/;

      expect(getTemperatureColor(20)).toMatch(cssVarRegex);
      expect(getUVIndexColor(5)).toMatch(cssVarRegex);
      expect(getCloudCoverColor(50)).toMatch(cssVarRegex);
      expect(getWindSpeedColor(30)).toMatch(cssVarRegex);
    });
  });
});
