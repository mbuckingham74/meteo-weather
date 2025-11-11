/**
 * Tests for WeatherAlertsBanner component
 * Testing alert display and severity-based styling
 */

import { render, screen, fireEvent } from '@testing-library/react';
import WeatherAlertsBanner from './WeatherAlertsBanner';

describe('WeatherAlertsBanner', () => {
  const mockAlerts = [
    {
      event: 'Severe Thunderstorm Warning',
      headline: 'Severe thunderstorm warning in effect',
      description: 'A severe thunderstorm warning has been issued for the area.',
      onset: '2025-10-28T14:00:00Z',
      ends: '2025-10-28T18:00:00Z',
    },
    {
      event: 'Flood Watch',
      headline: 'Flood watch in effect',
      description: 'Flooding is possible in low-lying areas.',
      onset: '2025-10-28T12:00:00Z',
      ends: '2025-10-29T06:00:00Z',
    },
    {
      event: 'Heat Advisory',
      headline: 'Heat advisory in effect',
      description: 'Temperatures will be dangerously high.',
      onset: '2025-10-28T10:00:00Z',
      ends: '2025-10-28T20:00:00Z',
    },
  ];

  it('renders nothing when no alerts', () => {
    const { container } = render(<WeatherAlertsBanner alerts={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when alerts is null', () => {
    const { container } = render(<WeatherAlertsBanner alerts={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all alerts', () => {
    render(<WeatherAlertsBanner alerts={mockAlerts} />);

    expect(screen.getByText('Severe Thunderstorm Warning')).toBeInTheDocument();
    expect(screen.getByText('Flood Watch')).toBeInTheDocument();
    expect(screen.getByText('Heat Advisory')).toBeInTheDocument();
  });

  it('displays alert headlines when present and expanded', () => {
    render(<WeatherAlertsBanner alerts={mockAlerts} />);

    const alertHeaders = screen.getAllByTestId('alert-header');
    fireEvent.click(alertHeaders[0]);

    expect(screen.getByText('Severe thunderstorm warning in effect')).toBeInTheDocument();
  });

  it('expands alert when clicked', () => {
    render(<WeatherAlertsBanner alerts={mockAlerts} />);

    const alertHeaders = screen.getAllByTestId('alert-header');

    // Description should not be visible initially
    expect(
      screen.queryByText(/A severe thunderstorm warning has been issued/)
    ).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(alertHeaders[0]);

    // Description should now be visible
    expect(screen.getByText(/A severe thunderstorm warning has been issued/)).toBeInTheDocument();
  });

  it('collapses alert when clicked twice', () => {
    render(<WeatherAlertsBanner alerts={mockAlerts} />);

    const alertHeaders = screen.getAllByTestId('alert-header');
    const alertHeader = alertHeaders[0];

    // Expand
    fireEvent.click(alertHeader);
    expect(screen.getByText(/A severe thunderstorm warning has been issued/)).toBeInTheDocument();

    // Collapse
    fireEvent.click(alertHeader);
    expect(
      screen.queryByText(/A severe thunderstorm warning has been issued/)
    ).not.toBeInTheDocument();
  });

  it('shows warning severity for warnings', () => {
    render(<WeatherAlertsBanner alerts={[mockAlerts[0]]} />);

    const alertElement = screen.getByTestId('weather-alert');
    expect(alertElement).toHaveAttribute('data-severity', 'warning');
  });

  it('shows watch severity for watches', () => {
    render(<WeatherAlertsBanner alerts={[mockAlerts[1]]} />);

    const alertElement = screen.getByTestId('weather-alert');
    expect(alertElement).toHaveAttribute('data-severity', 'watch');
  });

  it('shows advisory severity for advisories', () => {
    render(<WeatherAlertsBanner alerts={[mockAlerts[2]]} />);

    const alertElement = screen.getByTestId('weather-alert');
    expect(alertElement).toHaveAttribute('data-severity', 'advisory');
  });

  it('displays appropriate icon for warnings', () => {
    render(<WeatherAlertsBanner alerts={[mockAlerts[0]]} />);

    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('displays appropriate icon for watches', () => {
    render(<WeatherAlertsBanner alerts={[mockAlerts[1]]} />);

    expect(screen.getByText('👁️')).toBeInTheDocument();
  });

  it('displays appropriate icon for advisories', () => {
    render(<WeatherAlertsBanner alerts={[mockAlerts[2]]} />);

    expect(screen.getByText('ℹ️')).toBeInTheDocument();
  });

  it('displays onset time when available', () => {
    render(<WeatherAlertsBanner alerts={[mockAlerts[0]]} />);

    // Check that some time is displayed (exact format depends on locale)
    const timeElements = screen.getAllByText(/202[0-9]|[AP]M|:[0-9]{2}/i);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it('displays end time when expanded', () => {
    render(<WeatherAlertsBanner alerts={[mockAlerts[0]]} />);

    const alertHeader = screen.getByTestId('alert-header');
    fireEvent.click(alertHeader);

    expect(screen.getByText(/Ends:/)).toBeInTheDocument();
  });

  it('handles alerts without descriptions gracefully', () => {
    const minimalAlert = [
      {
        event: 'Test Alert',
        onset: '2025-10-28T12:00:00Z',
      },
    ];

    render(<WeatherAlertsBanner alerts={minimalAlert} />);

    expect(screen.getByText('Test Alert')).toBeInTheDocument();

    const alertHeader = screen.getByTestId('alert-header');
    fireEvent.click(alertHeader);

    // Should not crash when description is missing
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
  });

  it('allows only one alert expanded at a time', () => {
    render(<WeatherAlertsBanner alerts={mockAlerts} />);

    const alertHeaders = screen.getAllByTestId('alert-header');

    // Expand first alert
    fireEvent.click(alertHeaders[0]);
    expect(screen.getByText(/A severe thunderstorm warning has been issued/)).toBeInTheDocument();

    // Expand second alert
    fireEvent.click(alertHeaders[1]);

    // First alert should now be collapsed
    expect(
      screen.queryByText(/A severe thunderstorm warning has been issued/)
    ).not.toBeInTheDocument();

    // Second alert should be expanded
    expect(screen.getByText(/Flooding is possible/)).toBeInTheDocument();
  });

  it('uses info severity for unknown alert types', () => {
    const unknownAlert = [
      {
        event: 'Special Weather Statement',
        description: 'Something is happening',
      },
    ];

    render(<WeatherAlertsBanner alerts={unknownAlert} />);

    const alertElement = screen.getByTestId('weather-alert');
    expect(alertElement).toHaveAttribute('data-severity', 'info');
    expect(screen.getByText('📢')).toBeInTheDocument();
  });
});
