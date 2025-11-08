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

/**
 * FeelsLikeChart Component
 * Compares actual temperature with feels-like temperature
 */
function FeelsLikeChart({ data, days, unit = 'C', height = 300 }) {
  const getTimeLabel = () => {
    const numDays = days || data.length;
    if (numDays === 7) return 'Next Week';
    if (numDays === 14) return 'Next 2 Weeks';
    return `Next ${numDays} Days`;
  };

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary, #9ca3af)' }}>
        <p>No temperature data available</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = data.map((day) => ({
    date: new Date(day.datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    actualMax: day.tempmax,
    actualMin: day.tempmin,
    feelsLikeMax: day.feelslikemax,
    feelsLikeMin: day.feelslikemin,
    difference: Math.abs(day.temp - day.feelslike).toFixed(1),
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            background: 'var(--bg-elevated)',
            border: '2px solid var(--border-light)',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: 'var(--text-primary)' }}>
            {data.date}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p style={{ margin: 0, color: '#ef4444', fontWeight: '500' }}>
              🌡️ Actual High: {data.actualMax}°{unit}
            </p>
            <p style={{ margin: 0, color: '#f97316', fontWeight: '500' }}>
              🔥 Feels Like High: {data.feelsLikeMax}°{unit}
            </p>
            <p style={{ margin: 0, color: '#3b82f6', fontWeight: '500' }}>
              ❄️ Actual Low: {data.actualMin}°{unit}
            </p>
            <p style={{ margin: 0, color: '#06b6d4', fontWeight: '500' }}>
              🥶 Feels Like Low: {data.feelsLikeMin}°{unit}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate temperature range for Y-axis
  const allTemps = chartData.flatMap((d) => [
    d.actualMax,
    d.actualMin,
    d.feelsLikeMax,
    d.feelsLikeMin,
  ]);
  const minTemp = Math.floor(Math.min(...allTemps)) - 2;
  const maxTemp = Math.ceil(Math.max(...allTemps)) + 2;

  return (
    <div style={{ width: '100%' }}>
      <h3
        style={{
          margin: '0 0 8px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: 'var(--text-primary, #111827)',
        }}
      >
        🌡️ Feels Like Temperature - {getTimeLabel()}
      </h3>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 25, bottom: 5 }}>
          <defs>
            <linearGradient id="colorFeelsLike" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
          <XAxis
            dataKey="date"
            stroke="#374151"
            tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
            style={{ fontSize: '13px' }}
          />
          <YAxis
            stroke="#374151"
            tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
            style={{ fontSize: '13px' }}
            domain={[minTemp, maxTemp]}
            label={{
              value: `Temperature (°${unit})`,
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#111827', fontSize: 14, fontWeight: 600 },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px', fontSize: '14px', fontWeight: 600 }}
            iconType="line"
          />

          {/* Feels-like range area */}
          <Area
            type="monotone"
            dataKey="feelsLikeMax"
            stackId="1"
            stroke="none"
            fill="url(#colorFeelsLike)"
            name="Feels Like Range"
          />
          <Area
            type="monotone"
            dataKey="feelsLikeMin"
            stackId="2"
            stroke="none"
            fill="url(#colorFeelsLike)"
            name=""
          />

          {/* Actual temperature lines */}
          <Line
            type="monotone"
            dataKey="actualMax"
            stroke="#ef4444"
            strokeWidth={3}
            name="Actual High"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="actualMin"
            stroke="#3b82f6"
            strokeWidth={3}
            name="Actual Low"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />

          {/* Feels-like temperature lines */}
          <Line
            type="monotone"
            dataKey="feelsLikeMax"
            stroke="#f97316"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Feels Like High"
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="feelsLikeMin"
            stroke="#06b6d4"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Feels Like Low"
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          background: 'var(--bg-tertiary)',
          borderRadius: '8px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
        }}
      >
        <p style={{ margin: 0 }}>
          💡 <strong>Feels Like</strong> temperature accounts for wind chill (cold weather) and heat
          index (hot weather), showing what the temperature actually feels like on your skin. Solid
          lines show actual temperature, dashed lines show feels-like temperature.
        </p>
      </div>
    </div>
  );
}

export default FeelsLikeChart;
