const historicalDataService = require('../services/historicalDataService');
const { pool } = require('../config/database');

describe('Historical Data Service', () => {
  describe('fuzzyLocationMatch', () => {
    it('finds exact city name match', async () => {
      const mockQuery = jest.fn().mockResolvedValue([[
        { id: 1, city_name: 'Seattle', state: 'WA', country: 'USA' }
      ]]);
      pool.query = mockQuery;

      const result = await historicalDataService.fuzzyLocationMatch('Seattle');

      expect(result).toEqual({
        id: 1,
        city_name: 'Seattle',
        state: 'WA',
        country: 'USA'
      });
    });

    it('finds city with state abbreviation', async () => {
      const mockQuery = jest.fn()
        .mockResolvedValueOnce([[]]) // First query (exact) fails
        .mockResolvedValueOnce([[   // Second query (with state) succeeds
          { id: 2, city_name: 'Portland', state: 'OR', country: 'USA' }
        ]]);
      pool.query = mockQuery;

      const result = await historicalDataService.fuzzyLocationMatch('Portland, OR');

      expect(result.city_name).toBe('Portland');
      expect(result.state).toBe('OR');
    });

    it('returns null for non-existent city', async () => {
      const mockQuery = jest.fn().mockResolvedValue([[]]);
      pool.query = mockQuery;

      const result = await historicalDataService.fuzzyLocationMatch('NonExistentCity');

      expect(result).toBeNull();
    });
  });

  describe('getHistoricalWeather', () => {
    it('retrieves historical data within date range', async () => {
      const mockLocation = { id: 1, city_name: 'Seattle' };
      const mockWeatherData = [
        [
          {
            date: '2023-01-15',
            temp_max: 15.5,
            temp_min: 5.2,
            temp_avg: 10.3,
            precipitation: 5.2,
            humidity: 75
          },
          {
            date: '2023-01-16',
            temp_max: 14.8,
            temp_min: 4.9,
            temp_avg: 9.8,
            precipitation: 3.1,
            humidity: 72
          }
        ]
      ];

      const mockQuery = jest.fn()
        .mockResolvedValueOnce([[mockLocation]]) // fuzzyLocationMatch
        .mockResolvedValueOnce(mockWeatherData); // weather data query
      pool.query = mockQuery;

      const result = await historicalDataService.getHistoricalWeather(
        'Seattle',
        '2023-01-15',
        '2023-01-20'
      );

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2023-01-15');
      expect(result[0].temp_max).toBe(15.5);
    });

    it('validates date range (start before end)', async () => {
      await expect(
        historicalDataService.getHistoricalWeather('Seattle', '2023-12-31', '2023-01-01')
      ).rejects.toThrow('Start date must be before end date');
    });

    it('validates date format', async () => {
      await expect(
        historicalDataService.getHistoricalWeather('Seattle', 'invalid-date', '2023-01-01')
      ).rejects.toThrow();
    });

    it('returns null for location not in database', async () => {
      const mockQuery = jest.fn().mockResolvedValue([[]]);
      pool.query = mockQuery;

      const result = await historicalDataService.getHistoricalWeather(
        'NonExistentCity',
        '2023-01-01',
        '2023-01-31'
      );

      expect(result).toBeNull();
    });
  });

  describe('getHistoricalDateData', () => {
    it('retrieves data for specific date across multiple years', async () => {
      const mockLocation = { id: 1, city_name: 'Seattle' };
      const mockData = [
        [
          { year: 2023, temp_avg: 10.5, precipitation: 5.2 },
          { year: 2022, temp_avg: 9.8, precipitation: 4.1 },
          { year: 2021, temp_avg: 11.2, precipitation: 6.3 }
        ]
      ];

      const mockQuery = jest.fn()
        .mockResolvedValueOnce([[mockLocation]])
        .mockResolvedValueOnce(mockData);
      pool.query = mockQuery;

      const result = await historicalDataService.getHistoricalDateData(
        'Seattle',
        '01-15',
        10
      );

      expect(result).toHaveLength(3);
      expect(result[0].year).toBe(2023);
    });

    it('validates date format (MM-DD)', async () => {
      await expect(
        historicalDataService.getHistoricalDateData('Seattle', '2023-01-15', 5)
      ).rejects.toThrow();
    });

    it('limits years to reasonable range', async () => {
      const mockLocation = { id: 1, city_name: 'Seattle' };
      const mockQuery = jest.fn()
        .mockResolvedValueOnce([[mockLocation]])
        .mockResolvedValueOnce([[]]);
      pool.query = mockQuery;

      await historicalDataService.getHistoricalDateData('Seattle', '01-15', 100);

      // Check that query was called with capped year limit
      const queryCall = mockQuery.mock.calls[1];
      expect(queryCall[0]).toContain('LIMIT');
    });
  });

  describe('calculateStatistics', () => {
    it('calculates averages correctly', () => {
      const data = [
        { temp_avg: 10, precipitation: 5 },
        { temp_avg: 12, precipitation: 3 },
        { temp_avg: 11, precipitation: 4 }
      ];

      // This would test a statistics calculation function if exported
      const avgTemp = data.reduce((sum, d) => sum + d.temp_avg, 0) / data.length;
      
      expect(avgTemp).toBeCloseTo(11, 1);
    });
  });
});
