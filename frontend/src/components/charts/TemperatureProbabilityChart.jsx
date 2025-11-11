import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { getTemperatureColor } from '../../utils/colorScales';
import { formatTemperature } from '../../utils/weatherHelpers';
import { chartPalette } from '../../constants';

/**
 * Temperature Probability Chart Component
 * Shows temperature distribution histogram
 */
function TemperatureProbabilityChart({ probabilityData, unit = 'C', height = 400 }) {
  if (
    !probabilityData ||
    !probabilityData.distribution ||
    probabilityData.distribution.length === 0
  ) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
        No temperature probability data available
      </div>
    );
  }

  const { distribution, statistics } = probabilityData;

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
          minWidth: '160px',
        }}
      >
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          {formatTemperature(data.temperature, unit)} -{' '}
          {formatTemperature(data.temperature + 5, unit)}
        </p>
        <p
          style={{
            margin: '4px 0',
            color: chartPalette.positive,
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          {data.probability.toFixed(1)}% of days
        </p>
        <p style={{ margin: '4px 0', color: 'var(--text-tertiary)', fontSize: '11px' }}>
          ({data.count} occurrences)
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
        Temperature Probability Distribution
      </h3>

      {/* Statistics summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            padding: '10px',
            background: chartPalette.surface,
            borderRadius: '6px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: '0 0 4px 0',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            Mean
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '700',
              color: 'var(--text-primary)',
            }}
          >
            {formatTemperature(statistics.mean, unit)}
          </p>
        </div>

        <div
          style={{
            padding: '10px',
            background: chartPalette.surface,
            borderRadius: '6px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: '0 0 4px 0',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            Median
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '700',
              color: 'var(--text-primary)',
            }}
          >
            {formatTemperature(statistics.median, unit)}
          </p>
        </div>

        <div
          style={{
            padding: '10px',
            background: chartPalette.surface,
            borderRadius: '6px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: '0 0 4px 0',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            Std Dev
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '700',
              color: 'var(--text-primary)',
            }}
          >
            {statistics.stdDev?.toFixed(1)}°
          </p>
        </div>

        <div
          style={{
            padding: '10px',
            background: 'var(--info-bg)',
            borderRadius: '6px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: '0 0 4px 0',
              fontSize: '11px',
              color: 'var(--accent-text)',
              textTransform: 'uppercase',
            }}
          >
            Min
          </p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: chartPalette.cool }}>
            {formatTemperature(statistics.min, unit)}
          </p>
        </div>

        <div
          style={{
            padding: '10px',
            background: 'var(--error-bg)',
            borderRadius: '6px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: '0 0 4px 0',
              fontSize: '11px',
              color: 'var(--error-text)',
              textTransform: 'uppercase',
            }}
          >
            Max
          </p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: chartPalette.hot }}>
            {formatTemperature(statistics.max, unit)}
          </p>
        </div>
      </div>

      {/* Histogram */}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={distribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.grid} />
          <XAxis
            dataKey="temperature"
            tick={{ fontSize: 11, fill: chartPalette.textMuted }}
            stroke={chartPalette.grid}
            label={{
              value: `Temperature (°${unit})`,
              position: 'insideBottom',
              offset: -5,
              style: { textAnchor: 'middle', fill: chartPalette.textMuted, fontSize: 12 },
            }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: chartPalette.textMuted }}
            stroke={chartPalette.grid}
            label={{
              value: 'Probability (%)',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: chartPalette.textMuted },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          {/* Mean reference line */}
          <ReferenceLine
            x={Math.floor(statistics.mean / 5) * 5}
            stroke={chartPalette.positive}
            strokeWidth={2}
            strokeDasharray="3 3"
            label={{
              value: 'Mean',
              position: 'top',
              fill: chartPalette.positive,
              fontSize: 11,
              fontWeight: '600',
            }}
          />

          {/* Probability bars */}
          <Bar dataKey="probability" name="Probability" radius={[4, 4, 0, 0]}>
            {distribution.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getTemperatureColor(entry.temperature)}
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Interpretation guide */}
      <div
        style={{
          marginTop: '16px',
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
          Understanding the Distribution:
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            <strong>Bell curve:</strong> Most temperatures cluster around the mean
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            <strong>Wider spread:</strong> Greater temperature variability
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            <strong>Skewed distribution:</strong> Tendency toward warmer or cooler temps
          </div>
        </div>
      </div>

      {/* Temperature percentiles */}
      <div
        style={{
          marginTop: '12px',
          padding: '12px',
          background: 'var(--info-bg)',
          borderRadius: '8px',
          border: '1px solid var(--info-border)',
        }}
      >
        <p
          style={{
            margin: '0 0 8px 0',
            fontSize: '12px',
            fontWeight: '600',
            color: 'var(--accent-text)',
          }}
        >
          Temperature Ranges:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '11px', color: chartPalette.accent }}>
            <strong>Coldest 10%:</strong> Below{' '}
            {formatTemperature(
              distribution[Math.floor(distribution.length * 0.1)]?.temperature || statistics.min,
              unit
            )}
          </div>
          <div style={{ fontSize: '11px', color: chartPalette.accent }}>
            <strong>Middle 50%:</strong>{' '}
            {formatTemperature(
              distribution[Math.floor(distribution.length * 0.25)]?.temperature || statistics.min,
              unit
            )}{' '}
            -{' '}
            {formatTemperature(
              distribution[Math.floor(distribution.length * 0.75)]?.temperature || statistics.max,
              unit
            )}
          </div>
          <div style={{ fontSize: '11px', color: chartPalette.accent }}>
            <strong>Warmest 10%:</strong> Above{' '}
            {formatTemperature(
              distribution[Math.floor(distribution.length * 0.9)]?.temperature || statistics.max,
              unit
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemperatureProbabilityChart;
