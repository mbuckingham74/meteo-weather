import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { METRIC_COLORS } from '../../utils/colorScales';
import { formatDateShort, formatWindSpeed, getWindDirection } from '../../utils/weatherHelpers';
import { chartPalette } from '../../constants';

/**
 * Wind Chart Component
 * Shows wind speed and direction over time
 */
function WindChart({ data, height = 350, days, aggregationLabel: _aggregationLabel }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
        No wind data available
      </div>
    );
  }

  const getTimeLabel = () => {
    const numDays = days || data.length;
    if (numDays === 7) return 'Next Week';
    if (numDays === 14) return 'Next 2 Weeks';
    if (numDays <= 31) return `Next ${numDays} Days`;
    // For aggregated data, use a more generic label
    return 'Wind Trends';
  };

  // Format data for Recharts
  const chartData = data.map((day) => ({
    date: day.date,
    displayDate: day.displayLabel || formatDateShort(day.date),
    windSpeed: day.windSpeed,
    windDirection: day.windDirection,
    windDirectionLabel: getWindDirection(day.windDirection),
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
            ({data.aggregatedDays} days averaged)
          </p>
        )}
        <p style={{ margin: '4px 0', color: chartPalette.positive }}>
          Speed: {formatWindSpeed(data.windSpeed)}
        </p>
        <p style={{ margin: '4px 0', color: 'var(--text-secondary)' }}>
          Direction: {data.windDirectionLabel} ({data.windDirection}°)
        </p>
      </div>
    );
  };

  // Wind direction indicator
  const WindDirectionIndicator = ({ direction }) => {
    const size = 40;
    const arrowLength = 15;
    const angle = direction - 90; // Adjust to point upward at 0°
    const radians = (angle * Math.PI) / 180;
    const centerX = size / 2;
    const centerY = size / 2;
    const tipX = centerX + arrowLength * Math.cos(radians);
    const tipY = centerY + arrowLength * Math.sin(radians);

    return (
      <svg width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <circle cx={centerX} cy={centerY} r={18} fill={chartPalette.grid} />
        <line
          x1={centerX}
          y1={centerY}
          x2={tipX}
          y2={tipY}
          stroke={chartPalette.positive}
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill={chartPalette.positive} />
          </marker>
        </defs>
      </svg>
    );
  };

  return (
    <div>
      <h3
        style={{
          marginBottom: '8px',
          marginTop: '0',
          color: 'var(--text-primary)',
          fontSize: '16px',
          fontWeight: '600',
        }}
      >
        Wind Speed & Direction - {getTimeLabel()}
      </h3>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
            tick={{ fontSize: 12, fill: chartPalette.textMuted }}
            stroke={chartPalette.grid}
            label={{
              value: 'Wind Speed (km/h)',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: chartPalette.textMuted },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          {/* Wind speed line */}
          <Line
            type="monotone"
            dataKey="windSpeed"
            stroke={METRIC_COLORS.windSpeed}
            strokeWidth={2}
            name="Wind Speed"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Wind Direction Legend */}
      <div
        style={{
          marginTop: '20px',
          padding: '12px',
          background: chartPalette.surface,
          borderRadius: '8px',
        }}
      >
        <p
          style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
          }}
        >
          Wind Directions by Day:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
          {chartData.slice(0, 7).map((day, idx) => (
            <div
              key={idx}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
            >
              <WindDirectionIndicator direction={day.windDirection} />
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {day.displayDate.split(',')[0]}
              </span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: chartPalette.positive }}>
                {day.windDirectionLabel}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Beaufort Scale Reference */}
      <div
        style={{
          marginTop: '12px',
          padding: '12px',
          background: chartPalette.surface,
          borderRadius: '8px',
        }}
      >
        <p
          style={{
            margin: '0 0 8px 0',
            fontSize: '12px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
          }}
        >
          Beaufort Scale Reference:
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: '600' }}>Calm:</span> &lt; 10 km/h
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: '600' }}>Light:</span> 10-30 km/h
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: '600' }}>Moderate:</span> 30-50 km/h
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: '600' }}>Strong:</span> 50-70 km/h
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: '600' }}>Gale:</span> &gt; 70 km/h
          </div>
        </div>
      </div>
    </div>
  );
}

export default WindChart;
