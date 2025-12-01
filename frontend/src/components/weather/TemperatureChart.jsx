/**
 * TemperatureChart - Line chart showing temperature over time
 */
import { useMemo, useState, useEffect } from 'react';
import { Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import Card from '../ui/Card';
import { useTemperatureUnit } from '../../contexts/TemperatureUnitContext';

// Hook to get computed CSS variable values for chart colors
function useChartColors() {
  const [colors, setColors] = useState({
    high: '#469110',
    highHover: '#5aab24',
    low: '#e673ac',
    lowHover: '#f09dc7',
    grid: '#a03a6a',
    tooltipBg: '#7a1a4a',
    text: '#e673ac',
    textSecondary: '#f09dc7',
  });

  useEffect(() => {
    const updateColors = () => {
      const style = getComputedStyle(document.documentElement);
      setColors({
        high: style.getPropertyValue('--color-chart-high').trim() || '#469110',
        highHover: style.getPropertyValue('--color-accent-hover').trim() || '#5aab24',
        low: style.getPropertyValue('--color-chart-low').trim() || '#e673ac',
        lowHover: style.getPropertyValue('--color-secondary-hover').trim() || '#f09dc7',
        grid: style.getPropertyValue('--color-chart-grid').trim() || '#a03a6a',
        tooltipBg: style.getPropertyValue('--color-chart-tooltip-bg').trim() || '#7a1a4a',
        text: style.getPropertyValue('--color-text-muted').trim() || '#e673ac',
        textSecondary: style.getPropertyValue('--color-text-secondary').trim() || '#f09dc7',
      });
    };

    // Update on mount and when theme changes
    updateColors();

    // Listen for theme changes via MutationObserver
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          updateColors();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  return colors;
}

function TemperatureChart({ forecast, isLoading }) {
  const { unit, convertTemperature } = useTemperatureUnit();
  const chartColors = useChartColors();

  // Convert temperatures when building chart data so chart reacts to unit changes
  // Support both old format (forecast.days with tempmax/tempmin) and new API format (forecast.forecast with tempMax/tempMin)
  const chartData = useMemo(() => {
    const days = forecast?.days || forecast?.forecast;
    if (!days || !Array.isArray(days)) return [];

    return days
      .slice(0, 7)
      .map((day) => {
        // Validate date
        const dateStr = day.datetime || day.date;
        if (!dateStr) return null;

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;

        // Validate temperatures
        const highTemp = day.tempmax ?? day.tempMax;
        const lowTemp = day.tempmin ?? day.tempMin;
        if (highTemp == null || lowTemp == null) return null;

        const convertedHigh = convertTemperature(highTemp);
        const convertedLow = convertTemperature(lowTemp);
        if (convertedHigh == null || convertedLow == null) return null;

        return {
          name: date.toLocaleDateString('en-US', { weekday: 'short' }),
          high: Math.round(convertedHigh),
          low: Math.round(convertedLow),
        };
      })
      .filter(Boolean); // Remove null entries
  }, [forecast, convertTemperature]);

  if (isLoading) {
    return (
      <Card>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Temperature Trend</h2>
        <div className="h-48 animate-pulse bg-bg-elevated rounded" />
      </Card>
    );
  }

  if (chartData.length === 0) {
    return null;
  }

  // Find min/max for Y axis domain
  const allTemps = chartData.flatMap((d) => [d.high, d.low]);
  const minTemp = Math.min(...allTemps) - 5;
  const maxTemp = Math.max(...allTemps) + 5;

  return (
    <Card>
      <h2 className="text-lg font-semibold text-text-primary mb-4">Temperature Trend</h2>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="highGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.high} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColors.high} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: chartColors.text, fontSize: 12 }}
            />
            <YAxis
              domain={[minTemp, maxTemp]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: chartColors.text, fontSize: 12 }}
              tickFormatter={(value) => `${value}°`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: chartColors.tooltipBg,
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              }}
              labelStyle={{ color: chartColors.textSecondary }}
              formatter={(value, name) => [
                `${Math.round(value)}°${unit}`,
                name === 'high' ? 'High' : 'Low',
              ]}
            />
            <Area
              type="monotone"
              dataKey="high"
              stroke={chartColors.high}
              strokeWidth={2}
              fill="url(#highGradient)"
              dot={{ fill: chartColors.high, strokeWidth: 0, r: 4 }}
              activeDot={{ fill: chartColors.highHover, strokeWidth: 0, r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="low"
              stroke={chartColors.low}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: chartColors.low, strokeWidth: 0, r: 4 }}
              activeDot={{ fill: chartColors.lowHover, strokeWidth: 0, r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5" style={{ backgroundColor: chartColors.high }} />
          <span className="text-text-muted">High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5" style={{ borderTop: `2px dashed ${chartColors.low}` }} />
          <span className="text-text-muted">Low</span>
        </div>
      </div>
    </Card>
  );
}

export default TemperatureChart;
