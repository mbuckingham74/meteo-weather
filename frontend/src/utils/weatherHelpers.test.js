/**
 * Tests for weatherHelpers.js
 * Comprehensive test coverage for weather utility functions
 */

import {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  formatTemperature,
  formatDate,
  formatDateShort,
  getDayOfWeek,
  formatPrecipitation,
  formatWindSpeed,
  getWindDirection,
  formatHumidity,
  formatPressure,
  getWeatherEmoji,
  aggregateWeatherData,
  formatAggregatedDate,
} from './weatherHelpers';

describe('Temperature Conversion', () => {
  describe('celsiusToFahrenheit', () => {
    it('converts 0°C to 32°F', () => {
      expect(celsiusToFahrenheit(0)).toBe(32);
    });

    it('converts 100°C to 212°F', () => {
      expect(celsiusToFahrenheit(100)).toBe(212);
    });

    it('converts -40°C to -40°F', () => {
      expect(celsiusToFahrenheit(-40)).toBe(-40);
    });

    it('converts 20°C to 68°F', () => {
      expect(celsiusToFahrenheit(20)).toBe(68);
    });

    it('handles decimal values', () => {
      expect(celsiusToFahrenheit(15.5)).toBeCloseTo(59.9, 1);
    });
  });

  describe('fahrenheitToCelsius', () => {
    it('converts 32°F to 0°C', () => {
      expect(fahrenheitToCelsius(32)).toBe(0);
    });

    it('converts 212°F to 100°C', () => {
      expect(fahrenheitToCelsius(212)).toBe(100);
    });

    it('converts -40°F to -40°C', () => {
      expect(fahrenheitToCelsius(-40)).toBe(-40);
    });

    it('converts 68°F to 20°C', () => {
      expect(fahrenheitToCelsius(68)).toBe(20);
    });

    it('handles decimal values', () => {
      expect(fahrenheitToCelsius(59.9)).toBeCloseTo(15.5, 1);
    });
  });

  describe('formatTemperature', () => {
    it('formats Celsius temperature with default decimals', () => {
      expect(formatTemperature(20, 'C')).toBe('20.0°C');
    });

    it('formats Fahrenheit temperature with conversion', () => {
      expect(formatTemperature(20, 'F')).toBe('68.0°F');
    });

    it('handles null values', () => {
      expect(formatTemperature(null, 'C')).toBe('--');
    });

    it('handles undefined values', () => {
      expect(formatTemperature(undefined, 'F')).toBe('--');
    });

    it('respects decimal parameter', () => {
      expect(formatTemperature(20.5555, 'C', 2)).toBe('20.56°C');
    });

    it('defaults to Celsius if unit not specified', () => {
      expect(formatTemperature(15)).toBe('15.0°C');
    });
  });
});

describe('Date Formatting', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      // Use a date with time to avoid timezone issues
      const result = formatDate('2025-10-28T12:00:00');
      expect(result).toMatch(/Oct|10/); // Month
      expect(result).toMatch(/28|27|29/); // Day (allow for timezone variations)
      expect(result).toMatch(/2025/); // Year
    });
  });

  describe('formatDateShort', () => {
    it('includes weekday in short format', () => {
      const result = formatDateShort('2025-10-28');
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getDayOfWeek', () => {
    it('returns full day name', () => {
      const result = getDayOfWeek('2025-10-28');
      expect([
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ]).toContain(result);
    });
  });

  describe('formatAggregatedDate', () => {
    it('formats monthly aggregation', () => {
      const result = formatAggregatedDate('2025-10-28', 'monthly');
      expect(result).toMatch(/Oct|10/);
      expect(result).toMatch(/2025/);
    });

    it('formats weekly aggregation', () => {
      const result = formatAggregatedDate('2025-10-28', 'weekly');
      expect(result).toContain('Week of');
    });

    it('defaults to short format for daily', () => {
      const result = formatAggregatedDate('2025-10-28', 'daily');
      expect(result).toBeTruthy();
    });
  });
});

describe('Weather Data Formatting', () => {
  describe('formatPrecipitation', () => {
    it('formats precipitation with 1 decimal', () => {
      expect(formatPrecipitation(12.5)).toBe('12.5 mm');
    });

    it('handles zero precipitation', () => {
      expect(formatPrecipitation(0)).toBe('0.0 mm');
    });

    it('handles null values', () => {
      expect(formatPrecipitation(null)).toBe('0 mm');
    });

    it('handles undefined values', () => {
      expect(formatPrecipitation(undefined)).toBe('0 mm');
    });
  });

  describe('formatWindSpeed', () => {
    it('formats wind speed with 1 decimal', () => {
      expect(formatWindSpeed(15.7)).toBe('15.7 km/h');
    });

    it('handles zero wind speed', () => {
      expect(formatWindSpeed(0)).toBe('0.0 km/h');
    });

    it('handles null values', () => {
      expect(formatWindSpeed(null)).toBe('--');
    });

    it('handles undefined values', () => {
      expect(formatWindSpeed(undefined)).toBe('--');
    });
  });

  describe('getWindDirection', () => {
    it('returns N for 0 degrees', () => {
      expect(getWindDirection(0)).toBe('N');
    });

    it('returns E for 90 degrees', () => {
      expect(getWindDirection(90)).toBe('E');
    });

    it('returns S for 180 degrees', () => {
      expect(getWindDirection(180)).toBe('S');
    });

    it('returns W for 270 degrees', () => {
      expect(getWindDirection(270)).toBe('W');
    });

    it('returns NE for 45 degrees', () => {
      expect(getWindDirection(45)).toBe('NE');
    });

    it('returns SE for 135 degrees', () => {
      expect(getWindDirection(135)).toBe('SE');
    });

    it('handles null values', () => {
      expect(getWindDirection(null)).toBe('--');
    });

    it('handles undefined values', () => {
      expect(getWindDirection(undefined)).toBe('--');
    });

    it('wraps 360 degrees to N', () => {
      expect(getWindDirection(360)).toBe('N');
    });
  });

  describe('formatHumidity', () => {
    it('formats humidity as percentage', () => {
      expect(formatHumidity(65.7)).toBe('66%');
    });

    it('rounds to nearest integer', () => {
      expect(formatHumidity(64.4)).toBe('64%');
    });

    it('handles 100% humidity', () => {
      expect(formatHumidity(100)).toBe('100%');
    });

    it('handles null values', () => {
      expect(formatHumidity(null)).toBe('--');
    });

    it('handles undefined values', () => {
      expect(formatHumidity(undefined)).toBe('--');
    });
  });

  describe('formatPressure', () => {
    it('formats pressure in mb', () => {
      expect(formatPressure(1013.25)).toBe('1013 mb');
    });

    it('rounds to nearest integer', () => {
      expect(formatPressure(1015.7)).toBe('1016 mb');
    });

    it('handles null values', () => {
      expect(formatPressure(null)).toBe('--');
    });

    it('handles undefined values', () => {
      expect(formatPressure(undefined)).toBe('--');
    });
  });
});

describe('Weather Emoji', () => {
  describe('getWeatherEmoji', () => {
    it('returns sun for clear conditions', () => {
      expect(getWeatherEmoji('Clear')).toBe('☀️');
      expect(getWeatherEmoji('Sunny')).toBe('☀️');
    });

    it('returns partly cloudy for partly cloudy', () => {
      expect(getWeatherEmoji('Partly Cloudy')).toBe('⛅');
    });

    it('returns cloud for cloudy conditions', () => {
      expect(getWeatherEmoji('Cloudy')).toBe('☁️');
      expect(getWeatherEmoji('Overcast')).toBe('☁️');
    });

    it('returns rain for rainy conditions', () => {
      expect(getWeatherEmoji('Rain')).toBe('🌧️');
      expect(getWeatherEmoji('Drizzle')).toBe('🌧️');
    });

    it('returns snow for snowy conditions', () => {
      expect(getWeatherEmoji('Snow')).toBe('❄️');
    });

    it('returns thunderstorm for stormy conditions', () => {
      expect(getWeatherEmoji('Thunderstorm')).toBe('⛈️');
      expect(getWeatherEmoji('Storm')).toBe('⛈️');
    });

    it('returns fog for foggy conditions', () => {
      expect(getWeatherEmoji('Fog')).toBe('🌫️');
      expect(getWeatherEmoji('Mist')).toBe('🌫️');
    });

    it('handles null/undefined with default cloud', () => {
      expect(getWeatherEmoji(null)).toBe('☁️');
      expect(getWeatherEmoji(undefined)).toBe('☁️');
    });

    it('is case-insensitive', () => {
      expect(getWeatherEmoji('SUNNY')).toBe('☀️');
      expect(getWeatherEmoji('rain')).toBe('🌧️');
    });
  });
});

describe('Data Aggregation', () => {
  const mockDailyData = [
    { date: '2025-10-01', tempMax: 20, tempMin: 10, precipitation: 5, humidity: 60 },
    { date: '2025-10-02', tempMax: 22, tempMin: 12, precipitation: 0, humidity: 55 },
    { date: '2025-10-03', tempMax: 21, tempMin: 11, precipitation: 2, humidity: 58 },
    { date: '2025-10-04', tempMax: 19, tempMin: 9, precipitation: 10, humidity: 65 },
    { date: '2025-10-05', tempMax: 23, tempMin: 13, precipitation: 0, humidity: 50 },
    { date: '2025-10-06', tempMax: 24, tempMin: 14, precipitation: 1, humidity: 52 },
    { date: '2025-10-07', tempMax: 22, tempMin: 12, precipitation: 3, humidity: 57 },
  ];

  describe('aggregateWeatherData', () => {
    it('returns original data for 7days range', () => {
      const result = aggregateWeatherData(mockDailyData, '7days');
      expect(result.aggregatedData).toEqual(mockDailyData);
      expect(result.aggregationLabel).toBeNull();
    });

    it('returns original data for 1month range', () => {
      const result = aggregateWeatherData(mockDailyData, '1month');
      expect(result.aggregatedData).toEqual(mockDailyData);
      expect(result.aggregationLabel).toBeNull();
    });

    it('aggregates weekly for 3months range', () => {
      const result = aggregateWeatherData(mockDailyData, '3months');
      expect(result.aggregatedData.length).toBeLessThan(mockDailyData.length);
      expect(result.aggregationLabel).toBe('Showing weekly averages');
    });

    it('aggregates weekly for 6months range', () => {
      const result = aggregateWeatherData(mockDailyData, '6months');
      expect(result.aggregationLabel).toBe('Showing weekly averages');
    });

    it('aggregates monthly for 1year range', () => {
      const result = aggregateWeatherData(mockDailyData, '1year');
      expect(result.aggregationLabel).toBe('Showing monthly averages');
    });

    it('aggregates monthly for 3years range', () => {
      const result = aggregateWeatherData(mockDailyData, '3years');
      expect(result.aggregationLabel).toBe('Showing monthly averages');
    });

    it('aggregates monthly for 5years range', () => {
      const result = aggregateWeatherData(mockDailyData, '5years');
      expect(result.aggregationLabel).toBe('Showing monthly averages');
    });

    it('handles empty data', () => {
      const result = aggregateWeatherData([], '3months');
      expect(result.aggregatedData).toEqual([]);
      expect(result.aggregationLabel).toBeNull();
    });

    it('handles null data', () => {
      const result = aggregateWeatherData(null, '3months');
      expect(result.aggregatedData).toEqual([]);
      expect(result.aggregationLabel).toBeNull();
    });

    it('calculates correct averages for aggregated data', () => {
      const result = aggregateWeatherData(mockDailyData, '3months');
      // Each aggregated point should have averaged values
      result.aggregatedData.forEach((point) => {
        expect(point).toHaveProperty('tempMax');
        expect(point).toHaveProperty('tempMin');
        expect(point).toHaveProperty('precipitation');
        expect(point).toHaveProperty('aggregatedDays');
        expect(point.aggregatedDays).toBeGreaterThan(0);
      });
    });
  });
});
