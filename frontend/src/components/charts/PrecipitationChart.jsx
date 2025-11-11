import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PRECIPITATION_COLORS } from '../../utils/colorScales';
import { formatDateShort, formatPrecipitation } from '../../utils/weatherHelpers';
import { chartPalette } from '../../constants';

/**
 * Precipitation Chart Component
 * Shows precipitation amounts and probability
 */
function PrecipitationChart({ data, height = 350, days, aggregationLabel }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
        No precipitation data available
      </div>
    );
  }

  const getTimeLabel = () => {
    const numDays = days || data.length;
    if (numDays === 7) return 'Next Week';
    if (numDays === 14) return 'Next 2 Weeks';
    if (numDays <= 31) return `Next ${numDays} Days`;
    // For aggregated data, use a more generic label
    return 'Precipitation Trends';
  };

  // Format data for Recharts
  const chartData = data.map((day) => ({
    date: day.date,
    displayDate: day.displayLabel || formatDateShort(day.date),
    precipitation: day.precipitation || day.precip || 0,
    probability: day.precipProbability || day.precipProb || 0,
    snow: day.snow || 0,
    aggregatedDays: day.aggregatedDays,
  }));

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
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          {data.displayDate}
        </p>
        {data.aggregatedDays && (
          <p
            style={{
              margin: '0 0 8px 0',
              fontSize: '11px',
              color: chartPalette.positive,
              fontStyle: 'italic',
            }}
          >
            ({data.aggregatedDays} days{' '}
            {aggregationLabel?.includes('monthly') ? 'summed' : 'averaged'})
          </p>
        )}
        <p style={{ margin: '4px 0', color: chartPalette.cool }}>
          Precipitation: {formatPrecipitation(data.precipitation)}
        </p>
        {data.snow > 0 && (
          <p style={{ margin: '4px 0', color: 'var(--bg-tertiary)' }}>
            Snow: {data.snow.toFixed(1)} mm
          </p>
        )}
        <p style={{ margin: '4px 0', color: PRECIPITATION_COLORS.probability, fontWeight: '600' }}>
          Probability: {Math.round(data.probability)}%
        </p>
      </div>
    );
  };

  return (
    <div>
      <h3
        style={{
          marginBottom: '16px',
          color: 'var(--text-primary)',
          fontSize: '18px',
          fontWeight: '600',
        }}
      >
        Precipitation & Probability - {getTimeLabel()}
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.grid} />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 11, fill: chartPalette.textMuted }}
            stroke={chartPalette.grid}
            angle={chartData.length > 20 ? -45 : 0}
            textAnchor={chartData.length > 20 ? 'end' : 'middle'}
            height={chartData.length > 20 ? 80 : 30}
            interval={chartData.length > 30 ? 'preserveStartEnd' : 0}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12, fill: chartPalette.textMuted }}
            stroke={chartPalette.grid}
            label={{
              value: 'Precipitation (mm)',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: chartPalette.textMuted },
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: chartPalette.textMuted }}
            stroke={chartPalette.grid}
            label={{
              value: 'Probability (%)',
              angle: 90,
              position: 'insideRight',
              style: { textAnchor: 'middle', fill: chartPalette.textMuted },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          {/* Precipitation bars */}
          <Bar
            yAxisId="left"
            dataKey="precipitation"
            fill={PRECIPITATION_COLORS.rain}
            name="Precipitation"
            radius={[4, 4, 0, 0]}
          />

          {/* Snow bars (if any) */}
          <Bar
            yAxisId="left"
            dataKey="snow"
            fill={PRECIPITATION_COLORS.snow}
            name="Snow"
            radius={[4, 4, 0, 0]}
          />

          {/* Probability line */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="probability"
            stroke={PRECIPITATION_COLORS.probability}
            strokeWidth={3}
            name="Probability"
            dot={{ r: 5, fill: PRECIPITATION_COLORS.probability }}
            strokeDasharray="5 5"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PrecipitationChart;
