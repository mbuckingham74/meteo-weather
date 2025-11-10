import React, { useState } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { chartPalette } from '../../constants';
import { METRIC_COLORS } from '../../utils/colorScales';
import {
  formatDateShort,
  formatTemperature,
  formatPrecipitation,
} from '../../utils/weatherHelpers';

/**
 * Weather Overview Chart Component
 * Multi-metric visualization with toggleable data series
 */
function WeatherOverviewChart({ data, days, unit = 'C', height = 450 }) {
  const getTimeLabel = () => {
    const numDays = days || data.length;
    if (numDays === 7) return 'Next Week';
    if (numDays === 14) return 'Next 2 Weeks';
    return `Next ${numDays} Days`;
  };

  const [visibleMetrics, setVisibleMetrics] = useState({
    temperature: true,
    precipitation: true,
    humidity: true,
    windSpeed: false,
    cloudCover: false,
    pressure: false,
  });

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
        No weather data available
      </div>
    );
  }

  // Format data for Recharts
  const chartData = data.map((day) => ({
    date: day.date,
    displayDate: formatDateShort(day.date),
    temperature: day.tempAvg || day.temp,
    precipitation: day.precipitation || day.precip || 0,
    humidity: day.humidity,
    windSpeed: day.windSpeed,
    cloudCover: day.cloudCover,
    pressure: day.pressure ? day.pressure - 1000 : 0, // Normalize pressure for better visualization
  }));

  // Toggle metric visibility
  const toggleMetric = (metric) => {
    setVisibleMetrics((prev) => ({
      ...prev,
      [metric]: !prev[metric],
    }));
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;

    return (
      <div
        style={{
          background: 'var(--bg-elevated)',
          padding: '12px',
          border: '1px solid var(--border-light)',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          minWidth: '200px',
        }}
      >
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          {data.displayDate}
        </p>
        {visibleMetrics.temperature && (
          <p style={{ margin: '4px 0', color: METRIC_COLORS.temperature }}>
            Temperature: {formatTemperature(data.temperature, unit)}
          </p>
        )}
        {visibleMetrics.precipitation && (
          <p style={{ margin: '4px 0', color: METRIC_COLORS.precipitation }}>
            Precipitation: {formatPrecipitation(data.precipitation)}
          </p>
        )}
        {visibleMetrics.humidity && (
          <p style={{ margin: '4px 0', color: METRIC_COLORS.humidity }}>
            Humidity: {Math.round(data.humidity)}%
          </p>
        )}
        {visibleMetrics.windSpeed && (
          <p style={{ margin: '4px 0', color: METRIC_COLORS.windSpeed }}>
            Wind: {data.windSpeed?.toFixed(1)} km/h
          </p>
        )}
        {visibleMetrics.cloudCover && (
          <p style={{ margin: '4px 0', color: METRIC_COLORS.cloudCover }}>
            Cloud Cover: {data.cloudCover}%
          </p>
        )}
        {visibleMetrics.pressure && (
          <p style={{ margin: '4px 0', color: METRIC_COLORS.pressure }}>
            Pressure: {(data.pressure + 1000).toFixed(0)} mb
          </p>
        )}
      </div>
    );
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <h3
          style={{
            margin: 0,
            color: 'var(--text-primary)',
            fontSize: '18px',
            fontWeight: '600',
          }}
        >
          Multi-Metric Weather Overview - {getTimeLabel()}
        </h3>

        {/* Metric Toggles */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {Object.entries(visibleMetrics).map(([metric, isVisible]) => (
            <button
              key={metric}
              onClick={() => toggleMetric(metric)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                borderRadius: '6px',
                border: `2px solid ${METRIC_COLORS[metric]}`,
                background: isVisible ? METRIC_COLORS[metric] : 'var(--bg-elevated)',
                color: isVisible ? 'var(--text-on-accent)' : METRIC_COLORS[metric],
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s',
                textTransform: 'capitalize',
              }}
            >
              {metric.replace(/([A-Z])/g, ' $1').trim()}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.grid} />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 12, fill: chartPalette.textMuted }}
            stroke={chartPalette.grid}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12, fill: chartPalette.textMuted }}
            stroke={chartPalette.grid}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: chartPalette.textMuted }}
            stroke={chartPalette.grid}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          {/* Temperature Line */}
          {visibleMetrics.temperature && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="temperature"
              stroke={METRIC_COLORS.temperature}
              strokeWidth={2}
              name="Temperature"
              dot={{ r: 4 }}
            />
          )}

          {/* Humidity Line */}
          {visibleMetrics.humidity && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="humidity"
              stroke={METRIC_COLORS.humidity}
              strokeWidth={2}
              name="Humidity"
              dot={{ r: 3 }}
              strokeDasharray="5 5"
            />
          )}

          {/* Cloud Cover Line */}
          {visibleMetrics.cloudCover && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cloudCover"
              stroke={METRIC_COLORS.cloudCover}
              strokeWidth={2}
              name="Cloud Cover"
              dot={{ r: 3 }}
              strokeDasharray="3 3"
            />
          )}

          {/* Wind Speed Line */}
          {visibleMetrics.windSpeed && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="windSpeed"
              stroke={METRIC_COLORS.windSpeed}
              strokeWidth={2}
              name="Wind Speed"
              dot={{ r: 3 }}
            />
          )}

          {/* Precipitation Bars */}
          {visibleMetrics.precipitation && (
            <Bar
              yAxisId="left"
              dataKey="precipitation"
              fill={METRIC_COLORS.precipitation}
              fillOpacity={0.6}
              name="Precipitation"
              radius={[4, 4, 0, 0]}
            />
          )}

          {/* Pressure Line */}
          {visibleMetrics.pressure && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="pressure"
              stroke={METRIC_COLORS.pressure}
              strokeWidth={2}
              name="Pressure (normalized)"
              dot={{ r: 3 }}
              strokeDasharray="2 2"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Help Text */}
      <div
        style={{
          marginTop: '12px',
          padding: '10px',
          background: 'var(--info-bg)',
          borderRadius: '6px',
          border: '1px solid var(--info-border)',
        }}
      >
        <p style={{ margin: 0, fontSize: '11px', color: 'var(--accent-text)' }}>
          <strong>💡 Tip:</strong> Click the colored buttons above to show/hide different weather
          metrics on the chart
        </p>
      </div>
    </div>
  );
}

export default WeatherOverviewChart;
