import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThisDayInHistoryCard from './ThisDayInHistoryCard';

describe('ThisDayInHistoryCard Component', () => {
  const mockHistoryData = {
    date: '10-28',
    location: {
      address: 'Seattle, WA, USA',
      latitude: 47.6062,
      longitude: -122.3321,
    },
    yearsAnalyzed: [2020, 2021, 2022, 2023, 2024],
    records: {
      highTemperature: {
        value: 25.5,
        year: 2023,
      },
      lowTemperature: {
        value: -5.2,
        year: 2021,
      },
      maxPrecipitation: {
        value: 45.3,
        year: 2022,
      },
    },
    averages: {
      temp: 12.5,
      tempMax: 18.3,
      tempMin: 6.7,
    },
  };

  describe('Loading State', () => {
    it('renders loading message when historyData is null', () => {
      render(<ThisDayInHistoryCard historyData={null} />);

      expect(screen.getByText('Loading historical data...')).toBeInTheDocument();
    });

    it('renders loading message when historyData has no records', () => {
      render(<ThisDayInHistoryCard historyData={{}} />);

      expect(screen.getByText('Loading historical data...')).toBeInTheDocument();
    });

    it('renders loading message when records is undefined', () => {
      render(<ThisDayInHistoryCard historyData={{ date: '10-28' }} />);

      expect(screen.getByText('Loading historical data...')).toBeInTheDocument();
    });
  });

  describe('Rendering with Data', () => {
    it('renders card title', () => {
      render(<ThisDayInHistoryCard historyData={mockHistoryData} />);

      expect(screen.getByText(/This Day in History/i)).toBeInTheDocument();
    });

    it('renders formatted date', () => {
      render(<ThisDayInHistoryCard historyData={mockHistoryData} />);

      expect(screen.getByText(/Oct 28/i)).toBeInTheDocument();
    });

    it('renders location address', () => {
      render(<ThisDayInHistoryCard historyData={mockHistoryData} />);

      expect(screen.getByText(/Seattle, WA, USA/i)).toBeInTheDocument();
    });

    it('renders years analyzed count', () => {
      render(<ThisDayInHistoryCard historyData={mockHistoryData} />);

      expect(screen.getByText(/Based on 5 years of data/i)).toBeInTheDocument();
    });

    it('renders record high label', () => {
      render(<ThisDayInHistoryCard historyData={mockHistoryData} />);

      expect(screen.getByText('Record High')).toBeInTheDocument();
    });

    it('renders record low label', () => {
      render(<ThisDayInHistoryCard historyData={mockHistoryData} />);

      expect(screen.getByText('Record Low')).toBeInTheDocument();
    });

    it('renders record high year', () => {
      render(<ThisDayInHistoryCard historyData={mockHistoryData} />);

      expect(screen.getByText(/Set in 2023/i)).toBeInTheDocument();
    });

    it('renders record low year', () => {
      render(<ThisDayInHistoryCard historyData={mockHistoryData} />);

      expect(screen.getByText(/Set in 2021/i)).toBeInTheDocument();
    });
  });

  describe('Temperature Display', () => {
    it('displays temperatures in Celsius by default', () => {
      render(<ThisDayInHistoryCard historyData={mockHistoryData} />);

      expect(screen.getByText('25.5°C')).toBeInTheDocument();
      expect(screen.getByText('-5.2°C')).toBeInTheDocument();
    });

    it('displays temperatures in Fahrenheit when unit is F', () => {
      render(<ThisDayInHistoryCard historyData={mockHistoryData} unit="F" />);

      expect(screen.getByText('77.9°F')).toBeInTheDocument();
      expect(screen.getByText('22.6°F')).toBeInTheDocument();
    });

    it('renders historical averages section', () => {
      render(<ThisDayInHistoryCard historyData={mockHistoryData} />);

      expect(screen.getByText(/Historical Averages/i)).toBeInTheDocument();
    });

    it('renders average high temperature', () => {
      render(<ThisDayInHistoryCard historyData={mockHistoryData} />);

      expect(screen.getByText('18.3°C')).toBeInTheDocument();
    });

    it('renders average temperature', () => {
      render(<ThisDayInHistoryCard historyData={mockHistoryData} />);

      expect(screen.getByText('12.5°C')).toBeInTheDocument();
    });

    it('renders average low temperature', () => {
      render(<ThisDayInHistoryCard historyData={mockHistoryData} />);

      expect(screen.getByText('6.7°C')).toBeInTheDocument();
    });
  });

  describe('Precipitation Record', () => {
    it('renders precipitation record when data exists', () => {
      render(<ThisDayInHistoryCard historyData={mockHistoryData} />);

      expect(screen.getByText('Most Precipitation')).toBeInTheDocument();
      expect(screen.getByText('45.3 mm')).toBeInTheDocument();
      expect(screen.getByText(/in 2022/i)).toBeInTheDocument();
    });

    it('does not render precipitation when value is 0', () => {
      const dataWithZeroPrecip = {
        ...mockHistoryData,
        records: {
          ...mockHistoryData.records,
          maxPrecipitation: {
            value: 0,
            year: 2022,
          },
        },
      };

      render(<ThisDayInHistoryCard historyData={dataWithZeroPrecip} />);

      expect(screen.queryByText('Most Precipitation')).not.toBeInTheDocument();
    });

    it('does not render precipitation when data is missing', () => {
      const dataWithoutPrecip = {
        ...mockHistoryData,
        records: {
          highTemperature: mockHistoryData.records.highTemperature,
          lowTemperature: mockHistoryData.records.lowTemperature,
        },
      };

      render(<ThisDayInHistoryCard historyData={dataWithoutPrecip} />);

      expect(screen.queryByText('Most Precipitation')).not.toBeInTheDocument();
    });
  });

  describe('Fun Fact Section', () => {
    it('renders fun fact section', () => {
      render(<ThisDayInHistoryCard historyData={mockHistoryData} />);

      expect(screen.getByText(/Did you know\?/i)).toBeInTheDocument();
    });

    it('calculates temperature variation correctly', () => {
      render(<ThisDayInHistoryCard historyData={mockHistoryData} />);

      // 25.5 - (-5.2) = 30.7
      expect(screen.getByText(/30.7°C/i)).toBeInTheDocument();
    });

    it('shows years analyzed in fun fact', () => {
      render(<ThisDayInHistoryCard historyData={mockHistoryData} />);

      expect(screen.getByText(/past 5 years/i)).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('formats January dates correctly', () => {
      const janData = { ...mockHistoryData, date: '01-15' };
      render(<ThisDayInHistoryCard historyData={janData} />);

      expect(screen.getByText(/Jan 15/i)).toBeInTheDocument();
    });

    it('formats December dates correctly', () => {
      const decData = { ...mockHistoryData, date: '12-25' };
      render(<ThisDayInHistoryCard historyData={decData} />);

      expect(screen.getByText(/Dec 25/i)).toBeInTheDocument();
    });

    it('handles single digit months', () => {
      const data = { ...mockHistoryData, date: '02-05' };
      render(<ThisDayInHistoryCard historyData={data} />);

      expect(screen.getByText(/Feb 5/i)).toBeInTheDocument();
    });

    it('handles single digit days', () => {
      const data = { ...mockHistoryData, date: '03-09' };
      render(<ThisDayInHistoryCard historyData={data} />);

      expect(screen.getByText(/Mar 9/i)).toBeInTheDocument();
    });
  });

  describe('Missing Location Data', () => {
    it('renders Loading when location is missing', () => {
      const dataWithoutLocation = {
        ...mockHistoryData,
        location: null,
      };

      render(<ThisDayInHistoryCard historyData={dataWithoutLocation} />);

      expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument();
    });

    it('renders Loading when location address is missing', () => {
      const dataWithoutAddress = {
        ...mockHistoryData,
        location: {},
      };

      render(<ThisDayInHistoryCard historyData={dataWithoutAddress} />);

      expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument();
    });
  });

  describe('Missing Years Data', () => {
    it('renders 0 years when yearsAnalyzed is missing', () => {
      const dataWithoutYears = {
        ...mockHistoryData,
        yearsAnalyzed: null,
      };

      render(<ThisDayInHistoryCard historyData={dataWithoutYears} />);

      expect(screen.getByText(/Based on 0 years of data/i)).toBeInTheDocument();
    });

    it('renders 0 years when yearsAnalyzed is empty array', () => {
      const dataWithEmptyYears = {
        ...mockHistoryData,
        yearsAnalyzed: [],
      };

      render(<ThisDayInHistoryCard historyData={dataWithEmptyYears} />);

      expect(screen.getByText(/Based on 0 years of data/i)).toBeInTheDocument();
    });
  });

  describe('Emoji Icons', () => {
    it('renders fire emoji for record high', () => {
      render(<ThisDayInHistoryCard historyData={mockHistoryData} />);

      expect(screen.getByText((content, _element) => content.includes('🔥'))).toBeInTheDocument();
    });

    it('renders snowflake emoji for record low', () => {
      render(<ThisDayInHistoryCard historyData={mockHistoryData} />);

      expect(screen.getByText((content, _element) => content.includes('❄️'))).toBeInTheDocument();
    });

    it('renders chart emoji for averages', () => {
      render(<ThisDayInHistoryCard historyData={mockHistoryData} />);

      expect(screen.getByText(/📊/)).toBeInTheDocument();
    });

    it('renders rain emoji for precipitation', () => {
      render(<ThisDayInHistoryCard historyData={mockHistoryData} />);

      expect(screen.getByText((content, _element) => content.includes('🌧️'))).toBeInTheDocument();
    });

    it('renders lightbulb emoji for fun fact', () => {
      render(<ThisDayInHistoryCard historyData={mockHistoryData} />);

      expect(screen.getByText((content, _element) => content.includes('💡'))).toBeInTheDocument();
    });
  });
});
