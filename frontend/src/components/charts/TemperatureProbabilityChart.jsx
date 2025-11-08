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
  Cell
} from 'recharts';
import './charts.css';
import { getTemperatureColor } from '../../utils/colorScales';
import { formatTemperature } from '../../utils/weatherHelpers';

/**
 * Temperature Probability Chart Component
 * Shows temperature distribution histogram
 */
function TemperatureProbabilityChart({ probabilityData, unit = 'C', height = 400 }) {
  if (!probabilityData || !probabilityData.distribution || probabilityData.distribution.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary, #6b7280)' }}>
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
      <div style={{
        background: 'var(--bg-elevated, white)',
        padding: '12px',
        border: '1px solid var(--border-light, #e5e7eb)',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        minWidth: '160px'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: 'var(--text-primary, #111827)' }}>
          {formatTemperature(data.temperature, unit)} - {formatTemperature(data.temperature + 5, unit)}
        </p>
        <p style={{ margin: '4px 0', color: '#10b981', fontSize: '14px', fontWeight: '600' }}>
          {data.probability.toFixed(1)}% of days
        </p>
        <p style={{ margin: '4px 0', color: 'var(--text-tertiary, #9ca3af)', fontSize: '11px' }}>
          ({data.count} occurrences)
        </p>
      </div>
    );
  };

  return (
    <div>
      <h3 style={{ marginBottom: '16px', color: 'var(--text-primary, #111827)', fontSize: '18px', fontWeight: '600' }}>
        Temperature Probability Distribution
      </h3>

      {/* Statistics summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{ padding: '10px', background: '#f9fafb', borderRadius: '6px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: 'var(--text-secondary, #6b7280)', textTransform: 'uppercase' }}>
            Mean
          </p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-primary, #111827)' }}>
            {formatTemperature(statistics.mean, unit)}
          </p>
        </div>

        <div style={{ padding: '10px', background: '#f9fafb', borderRadius: '6px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: 'var(--text-secondary, #6b7280)', textTransform: 'uppercase' }}>
            Median
          </p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-primary, #111827)' }}>
            {formatTemperature(statistics.median, unit)}
          </p>
        </div>

        <div style={{ padding: '10px', background: '#f9fafb', borderRadius: '6px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: 'var(--text-secondary, #6b7280)', textTransform: 'uppercase' }}>
            Std Dev
          </p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-primary, #111827)' }}>
            {statistics.stdDev?.toFixed(1)}°
          </p>
        </div>

        <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '6px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#1e40af', textTransform: 'uppercase' }}>
            Min
          </p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#3b82f6' }}>
            {formatTemperature(statistics.min, unit)}
          </p>
        </div>

        <div style={{ padding: '10px', background: '#fef2f2', borderRadius: '6px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#991b1b', textTransform: 'uppercase' }}>
            Max
          </p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#dc2626' }}>
            {formatTemperature(statistics.max, unit)}
          </p>
        </div>
      </div>

      {/* Histogram */}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={distribution}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="temperature"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            stroke="#9ca3af"
            label={{
              value: `Temperature (°${unit})`,
              position: 'insideBottom',
              offset: -5,
              style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 }
            }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#9ca3af"
            label={{
              value: 'Probability (%)',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#6b7280' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          {/* Mean reference line */}
          <ReferenceLine
            x={Math.floor(statistics.mean / 5) * 5}
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="3 3"
            label={{
              value: 'Mean',
              position: 'top',
              fill: '#10b981',
              fontSize: 11,
              fontWeight: '600'
            }}
          />

          {/* Probability bars */}
          <Bar
            dataKey="probability"
            name="Probability"
            radius={[4, 4, 0, 0]}
          >
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
      <div style={{ marginTop: '16px', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary, #374151)' }}>
          Understanding the Distribution:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary, #6b7280)' }}>
            <strong>Bell curve:</strong> Most temperatures cluster around the mean
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary, #6b7280)' }}>
            <strong>Wider spread:</strong> Greater temperature variability
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary, #6b7280)' }}>
            <strong>Skewed distribution:</strong> Tendency toward warmer or cooler temps
          </div>
        </div>
      </div>

      {/* Temperature percentiles */}
      <div style={{ marginTop: '12px', padding: '12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #3b82f6' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', color: '#1e40af' }}>
          Temperature Ranges:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '11px', color: '#1e3a8a' }}>
            <strong>Coldest 10%:</strong> Below {formatTemperature(distribution[Math.floor(distribution.length * 0.1)]?.temperature || statistics.min, unit)}
          </div>
          <div style={{ fontSize: '11px', color: '#1e3a8a' }}>
            <strong>Middle 50%:</strong> {formatTemperature(distribution[Math.floor(distribution.length * 0.25)]?.temperature || statistics.min, unit)} - {formatTemperature(distribution[Math.floor(distribution.length * 0.75)]?.temperature || statistics.max, unit)}
          </div>
          <div style={{ fontSize: '11px', color: '#1e3a8a' }}>
            <strong>Warmest 10%:</strong> Above {formatTemperature(distribution[Math.floor(distribution.length * 0.9)]?.temperature || statistics.max, unit)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemperatureProbabilityChart;
