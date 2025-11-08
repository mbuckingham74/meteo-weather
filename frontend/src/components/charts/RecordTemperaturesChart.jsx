import React from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import styles from './charts.module.css';
import { formatDateShort, formatTemperature } from '../../utils/weatherHelpers';

/**
 * Record Temperatures Chart Component
 * Displays historical record high and low temperatures
 */
function RecordTemperaturesChart({ records, unit = 'C', height = 400 }) {
  if (!records || records.length === 0) {
    return (
      <div
        style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary, #6b7280)' }}
      >
        No record temperature data available
      </div>
    );
  }

  // Format data for Recharts
  const chartData = records.map((record) => ({
    date: record.date,
    displayDate: formatDateShort(`2024-${record.date}`), // Use 2024 as placeholder year
    recordHigh: record.recordHigh.temperature,
    recordLow: record.recordLow.temperature,
    avgHigh: record.avgHigh,
    avgLow: record.avgLow,
    recordHighYear: record.recordHigh.year,
    recordLowYear: record.recordLow.year,
    recordHighDate: record.recordHigh.date,
    recordLowDate: record.recordLow.date,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;

    return (
      <div
        style={{
          background: 'var(--bg-elevated, white)',
          padding: '14px',
          border: '1px solid var(--border-light, #e5e7eb)',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          minWidth: '200px',
        }}
      >
        <p
          style={{
            margin: '0 0 10px 0',
            fontWeight: 'bold',
            color: 'var(--text-primary, #111827)',
            fontSize: '13px',
          }}
        >
          {data.displayDate}
        </p>

        <div
          style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6' }}
        >
          <p style={{ margin: '4px 0', fontSize: '12px', color: '#dc2626', fontWeight: '600' }}>
            🔥 Record High: {formatTemperature(data.recordHigh, unit)}
          </p>
          <p
            style={{
              margin: '4px 0 4px 16px',
              fontSize: '10px',
              color: 'var(--text-tertiary, #9ca3af)',
            }}
          >
            Set in {data.recordHighYear}
          </p>
        </div>

        <div
          style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6' }}
        >
          <p style={{ margin: '4px 0', fontSize: '12px', color: '#3b82f6', fontWeight: '600' }}>
            ❄️ Record Low: {formatTemperature(data.recordLow, unit)}
          </p>
          <p
            style={{
              margin: '4px 0 4px 16px',
              fontSize: '10px',
              color: 'var(--text-tertiary, #9ca3af)',
            }}
          >
            Set in {data.recordLowYear}
          </p>
        </div>

        <div>
          <p style={{ margin: '4px 0', fontSize: '11px', color: 'var(--text-secondary, #6b7280)' }}>
            Avg High: {formatTemperature(data.avgHigh, unit)}
          </p>
          <p style={{ margin: '4px 0', fontSize: '11px', color: 'var(--text-secondary, #6b7280)' }}>
            Avg Low: {formatTemperature(data.avgLow, unit)}
          </p>
        </div>
      </div>
    );
  };

  // Calculate temperature range for Y axis
  const allTemps = chartData.flatMap((d) => [d.recordHigh, d.recordLow]);
  const minTemp = Math.floor(Math.min(...allTemps) - 5);
  const maxTemp = Math.ceil(Math.max(...allTemps) + 5);

  return (
    <div>
      <h3
        style={{
          marginBottom: '16px',
          color: 'var(--text-primary, #111827)',
          fontSize: '18px',
          fontWeight: '600',
        }}
      >
        Record High & Low Temperatures
      </h3>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="tempRange" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#6b7280' }} stroke="#9ca3af" />
          <YAxis
            domain={[minTemp, maxTemp]}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#9ca3af"
            label={{
              value: `Temperature (°${unit})`,
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#6b7280' },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          {/* Temperature range area (between avg high and low) */}
          <Area
            type="monotone"
            dataKey="avgHigh"
            stroke="none"
            fill="url(#tempRange)"
            fillOpacity={1}
            name="Average Range"
          />
          <Area type="monotone" dataKey="avgLow" stroke="none" fill="white" fillOpacity={1} />

          {/* Record high line */}
          <Line
            type="monotone"
            dataKey="recordHigh"
            stroke="#dc2626"
            strokeWidth={2.5}
            name="Record High"
            dot={{ r: 4, fill: '#dc2626', strokeWidth: 2, stroke: '#fff' }}
          />

          {/* Record low line */}
          <Line
            type="monotone"
            dataKey="recordLow"
            stroke="#3b82f6"
            strokeWidth={2.5}
            name="Record Low"
            dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
          />

          {/* Average high line */}
          <Line
            type="monotone"
            dataKey="avgHigh"
            stroke="#f97316"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            name="Average High"
            dot={false}
          />

          {/* Average low line */}
          <Line
            type="monotone"
            dataKey="avgLow"
            stroke="#60a5fa"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            name="Average Low"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Record extremes summary */}
      <div
        style={{
          marginTop: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '12px',
        }}
      >
        {/* Hottest day */}
        <div
          style={{
            padding: '12px',
            background: '#fef2f2',
            borderRadius: '8px',
            border: '1px solid #fecaca',
          }}
        >
          <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: '600', color: '#991b1b' }}>
            🔥 Hottest Day in Period
          </p>
          <p style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '700', color: '#dc2626' }}>
            {formatTemperature(Math.max(...chartData.map((d) => d.recordHigh)), unit)}
          </p>
          <p style={{ margin: '0', fontSize: '11px', color: '#7f1d1d' }}>
            {
              chartData.find(
                (d) => d.recordHigh === Math.max(...chartData.map((d) => d.recordHigh))
              )?.displayDate
            }
          </p>
        </div>

        {/* Coldest day */}
        <div
          style={{
            padding: '12px',
            background: '#eff6ff',
            borderRadius: '8px',
            border: '1px solid: #bfdbfe',
          }}
        >
          <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: '600', color: '#1e40af' }}>
            ❄️ Coldest Day in Period
          </p>
          <p style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>
            {formatTemperature(Math.min(...chartData.map((d) => d.recordLow)), unit)}
          </p>
          <p style={{ margin: '0', fontSize: '11px', color: '#1e3a8a' }}>
            {
              chartData.find((d) => d.recordLow === Math.min(...chartData.map((d) => d.recordLow)))
                ?.displayDate
            }
          </p>
        </div>
      </div>

      {/* Info panel */}
      <div
        style={{
          marginTop: '12px',
          padding: '12px',
          background: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #fbbf24',
        }}
      >
        <p style={{ margin: 0, fontSize: '11px', color: '#78350f' }}>
          <strong>Note:</strong> Records shown are based on available historical data. Actual
          all-time records may differ if more historical data is available.
        </p>
      </div>
    </div>
  );
}

export default RecordTemperaturesChart;
