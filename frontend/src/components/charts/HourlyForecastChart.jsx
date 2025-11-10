import React, { useState } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatTemperature } from '../../utils/weatherHelpers';
import { METRIC_COLORS } from '../../utils/colorScales';

/**
 * Hourly Forecast Chart Component
 * Displays 48-hour detailed forecast with clickable metric views
 */
function HourlyForecastChart({ hourlyData, unit = 'C', height = 400 }) {
  const [selectedMetric, setSelectedMetric] = useState('overview'); // 'overview', 'high', 'low', 'precipitation', 'wind'

  if (!hourlyData || hourlyData.length === 0) {
    return (
      <div
        style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary, #6b7280)' }}
      >
        No hourly forecast data available
      </div>
    );
  }

  // Format data for Recharts - show every 3rd hour for readability
  const chartData = hourlyData.map((hour, index) => {
    const time = hour.time.substring(0, 5); // HH:MM format
    const date = new Date(hour.datetime);
    const displayTime = index % 3 === 0 ? time : '';

    return {
      datetime: hour.datetime,
      displayTime,
      fullTime: time,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      temperature: hour.temperature,
      feelsLike: hour.feelsLike,
      precipitation: hour.precipitation || 0,
      precipProb: hour.precipProbability || 0,
      windSpeed: hour.windSpeed,
      humidity: hour.humidity,
      cloudCover: hour.cloudCover,
      uvIndex: hour.uvIndex,
      conditions: hour.conditions,
    };
  });

  // Calculate summary statistics
  const stats = {
    high: Math.max(...chartData.map((d) => d.temperature)),
    low: Math.min(...chartData.map((d) => d.temperature)),
    totalPrecip: chartData.reduce((sum, d) => sum + d.precipitation, 0),
    avgWind: chartData.reduce((sum, d) => sum + d.windSpeed, 0) / chartData.length,
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    const date = new Date(data.datetime);

    return (
      <div
        style={{
          background: 'var(--bg-elevated, white)',
          padding: '12px',
          border: '1px solid var(--border-light, #e5e7eb)',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          minWidth: '200px',
        }}
      >
        <p
          style={{
            margin: '0 0 8px 0',
            fontWeight: 'bold',
            color: 'var(--text-primary, #111827)',
            fontSize: '13px',
          }}
        >
          {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} -{' '}
          {data.fullTime}
        </p>

        <p style={{ margin: '4px 0', color: METRIC_COLORS.temperature, fontSize: '12px' }}>
          🌡️ Temp: {formatTemperature(data.temperature, unit)}
        </p>
        <p style={{ margin: '4px 0', color: '#9333ea', fontSize: '12px' }}>
          🤚 Feels: {formatTemperature(data.feelsLike, unit)}
        </p>

        {data.precipitation > 0 && (
          <p style={{ margin: '4px 0', color: METRIC_COLORS.precipitation, fontSize: '12px' }}>
            🌧️ Precip: {data.precipitation.toFixed(1)} mm ({data.precipProb}%)
          </p>
        )}

        <p style={{ margin: '4px 0', color: METRIC_COLORS.windSpeed, fontSize: '12px' }}>
          💨 Wind: {data.windSpeed.toFixed(1)} km/h
        </p>

        {data.conditions && (
          <p
            style={{
              margin: '6px 0 0 0',
              fontSize: '11px',
              color: 'var(--text-secondary, #6b7280)',
              fontStyle: 'italic',
            }}
          >
            {data.conditions}
          </p>
        )}
      </div>
    );
  };

  // Render chart based on selected metric
  const renderChart = () => {
    switch (selectedMetric) {
      case 'high':
        return (
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="displayTime"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              stroke="#9ca3af"
            />
            <YAxis
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
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="#dc2626"
              fill="#fecaca"
              fillOpacity={0.3}
              strokeWidth={3}
              name="High Temperature"
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#dc2626"
              strokeWidth={3}
              name="Temperature"
              dot={{ r: 3, fill: '#dc2626' }}
            />
          </ComposedChart>
        );

      case 'low':
        return (
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="displayTime"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              stroke="#9ca3af"
            />
            <YAxis
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
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="#2563eb"
              fill="#bfdbfe"
              fillOpacity={0.3}
              strokeWidth={3}
              name="Low Temperature"
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#2563eb"
              strokeWidth={3}
              name="Temperature"
              dot={{ r: 3, fill: '#2563eb' }}
            />
          </ComposedChart>
        );

      case 'precipitation':
        return (
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="displayTime"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              stroke="#9ca3af"
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#9ca3af"
              label={{
                value: 'Precipitation (mm)',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#6b7280' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar
              dataKey="precipitation"
              fill={METRIC_COLORS.precipitation}
              fillOpacity={0.8}
              name="Precipitation"
              radius={[4, 4, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="precipProb"
              stroke="#0891b2"
              strokeWidth={2}
              name="Precip Probability (%)"
              dot={false}
              strokeDasharray="3 3"
            />
          </ComposedChart>
        );

      case 'wind':
        return (
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="displayTime"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              stroke="#9ca3af"
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#9ca3af"
              label={{
                value: 'Wind Speed (km/h)',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#6b7280' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Area
              type="monotone"
              dataKey="windSpeed"
              stroke={METRIC_COLORS.windSpeed}
              fill="#d1d5db"
              fillOpacity={0.3}
              strokeWidth={3}
              name="Wind Speed"
            />
            <Line
              type="monotone"
              dataKey="windSpeed"
              stroke={METRIC_COLORS.windSpeed}
              strokeWidth={3}
              name="Average Wind"
              dot={{ r: 2 }}
            />
          </ComposedChart>
        );

      default: // 'overview'
        return (
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="displayTime"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              stroke="#9ca3af"
              label={{
                value: 'Time (hours)',
                position: 'insideBottom',
                offset: -5,
                style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 },
              }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#9ca3af"
              label={{
                value: `Temperature (°${unit})`,
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#6b7280' },
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#9ca3af"
              label={{
                value: 'Precipitation (mm)',
                angle: 90,
                position: 'insideRight',
                style: { textAnchor: 'middle', fill: '#6b7280' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />

            {/* Temperature line */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="temperature"
              stroke={METRIC_COLORS.temperature}
              strokeWidth={2.5}
              name="Temperature"
              dot={{ r: 2 }}
            />

            {/* Feels-like line */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="feelsLike"
              stroke="#9333ea"
              strokeWidth={2}
              name="Feels Like"
              dot={false}
              strokeDasharray="3 3"
            />

            {/* Precipitation bars */}
            <Bar
              yAxisId="right"
              dataKey="precipitation"
              fill={METRIC_COLORS.precipitation}
              fillOpacity={0.6}
              name="Precipitation"
              radius={[2, 2, 0, 0]}
            />
          </ComposedChart>
        );
    }
  };

  // Get title based on selected metric
  const getChartTitle = () => {
    switch (selectedMetric) {
      case 'high':
        return '48-Hour High Temperature';
      case 'low':
        return '48-Hour Low Temperature';
      case 'precipitation':
        return '48-Hour Precipitation';
      case 'wind':
        return '48-Hour Wind Speed';
      default:
        return '48-Hour Detailed Forecast';
    }
  };

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
        {getChartTitle()}
      </h3>

      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>

      {/* Metric selector buttons */}
      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          gap: '8px',
          marginBottom: '8px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setSelectedMetric('overview')}
          style={{
            padding: '8px 16px',
            background:
              selectedMetric === 'overview'
                ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                : '#f3f4f6',
            color: selectedMetric === 'overview' ? 'white' : '#4b5563',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
          onMouseEnter={(e) => {
            if (selectedMetric !== 'overview') {
              e.target.style.background = '#e5e7eb';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedMetric !== 'overview') {
              e.target.style.background = '#f3f4f6';
            }
          }}
        >
          📊 Overview
        </button>
      </div>

      {/* Summary stats - now clickable */}
      <div
        style={{
          marginTop: '8px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
        }}
      >
        <button
          onClick={() => setSelectedMetric('high')}
          style={{
            padding: '10px',
            background: selectedMetric === 'high' ? '#fcd34d' : '#fef3c7',
            borderRadius: '6px',
            textAlign: 'center',
            border: selectedMetric === 'high' ? '2px solid #f59e0b' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            transform: selectedMetric === 'high' ? 'scale(1.05)' : 'scale(1)',
          }}
          onMouseEnter={(e) => {
            if (selectedMetric !== 'high') {
              e.target.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedMetric !== 'high') {
              e.target.style.transform = 'scale(1)';
            }
          }}
        >
          <p
            style={{
              margin: '0 0 4px 0',
              fontSize: '11px',
              color: '#78350f',
              textTransform: 'uppercase',
              fontWeight: '600',
            }}
          >
            🔥 High
          </p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#92400e' }}>
            {formatTemperature(stats.high, unit)}
          </p>
        </button>

        <button
          onClick={() => setSelectedMetric('low')}
          style={{
            padding: '10px',
            background: selectedMetric === 'low' ? '#93c5fd' : '#dbeafe',
            borderRadius: '6px',
            textAlign: 'center',
            border: selectedMetric === 'low' ? '2px solid #3b82f6' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            transform: selectedMetric === 'low' ? 'scale(1.05)' : 'scale(1)',
          }}
          onMouseEnter={(e) => {
            if (selectedMetric !== 'low') {
              e.target.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedMetric !== 'low') {
              e.target.style.transform = 'scale(1)';
            }
          }}
        >
          <p
            style={{
              margin: '0 0 4px 0',
              fontSize: '11px',
              color: '#1e3a8a',
              textTransform: 'uppercase',
              fontWeight: '600',
            }}
          >
            ❄️ Low
          </p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e40af' }}>
            {formatTemperature(stats.low, unit)}
          </p>
        </button>

        <button
          onClick={() => setSelectedMetric('precipitation')}
          style={{
            padding: '10px',
            background: selectedMetric === 'precipitation' ? '#67e8f9' : '#e0f2fe',
            borderRadius: '6px',
            textAlign: 'center',
            border:
              selectedMetric === 'precipitation' ? '2px solid #06b6d4' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            transform: selectedMetric === 'precipitation' ? 'scale(1.05)' : 'scale(1)',
          }}
          onMouseEnter={(e) => {
            if (selectedMetric !== 'precipitation') {
              e.target.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedMetric !== 'precipitation') {
              e.target.style.transform = 'scale(1)';
            }
          }}
        >
          <p
            style={{
              margin: '0 0 4px 0',
              fontSize: '11px',
              color: '#075985',
              textTransform: 'uppercase',
              fontWeight: '600',
            }}
          >
            🌧️ Total Precip
          </p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0369a1' }}>
            {stats.totalPrecip.toFixed(1)} mm
          </p>
        </button>

        <button
          onClick={() => setSelectedMetric('wind')}
          style={{
            padding: '10px',
            background: selectedMetric === 'wind' ? '#d1d5db' : '#f3f4f6',
            borderRadius: '6px',
            textAlign: 'center',
            border: selectedMetric === 'wind' ? '2px solid #6b7280' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            transform: selectedMetric === 'wind' ? 'scale(1.05)' : 'scale(1)',
          }}
          onMouseEnter={(e) => {
            if (selectedMetric !== 'wind') {
              e.target.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedMetric !== 'wind') {
              e.target.style.transform = 'scale(1)';
            }
          }}
        >
          <p
            style={{
              margin: '0 0 4px 0',
              fontSize: '11px',
              color: 'var(--text-secondary, #374151)',
              textTransform: 'uppercase',
              fontWeight: '600',
            }}
          >
            💨 Avg Wind
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '700',
              color: 'var(--text-secondary, #4b5563)',
            }}
          >
            {stats.avgWind.toFixed(1)} km/h
          </p>
        </button>
      </div>

      {/* Info panel */}
      <div
        style={{
          marginTop: '12px',
          padding: '10px',
          background: '#eff6ff',
          borderRadius: '6px',
          border: '1px solid #3b82f6',
        }}
      >
        <p style={{ margin: 0, fontSize: '11px', color: '#1e40af' }}>
          <strong>💡 Note:</strong> &quot;Feels Like&quot; temperature accounts for wind chill and
          heat index effects. Times shown in local timezone.
        </p>
      </div>
    </div>
  );
}

export default HourlyForecastChart;
