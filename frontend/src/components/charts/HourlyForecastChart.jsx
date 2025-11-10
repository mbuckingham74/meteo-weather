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
import { chartPalette } from '../../constants';
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
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
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

  const axisTickSmall = { fontSize: 11, fill: chartPalette.textMuted };
  const axisTickMedium = { fontSize: 12, fill: chartPalette.textMuted };
  const axisLabelStyle = { textAnchor: 'middle', fill: chartPalette.textMuted };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    const date = new Date(data.datetime);

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
        <p
          style={{
            margin: '0 0 8px 0',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
            fontSize: '13px',
          }}
        >
          {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} -{' '}
          {data.fullTime}
        </p>

        <p style={{ margin: '4px 0', color: METRIC_COLORS.temperature, fontSize: '12px' }}>
          🌡️ Temp: {formatTemperature(data.temperature, unit)}
        </p>
        <p style={{ margin: '4px 0', color: chartPalette.accentSecondary, fontSize: '12px' }}>
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
              color: 'var(--text-secondary)',
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
            <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.grid} />
            <XAxis dataKey="displayTime" tick={axisTickSmall} stroke={chartPalette.grid} />
            <YAxis
              tick={axisTickMedium}
              stroke={chartPalette.grid}
              label={{
                value: `Temperature (°${unit})`,
                angle: -90,
                position: 'insideLeft',
                style: axisLabelStyle,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Area
              type="monotone"
              dataKey="temperature"
              stroke={chartPalette.hot}
              fill="var(--error-bg)"
              fillOpacity={0.3}
              strokeWidth={3}
              name="High Temperature"
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke={chartPalette.hot}
              strokeWidth={3}
              name="Temperature"
              dot={{ r: 3, fill: chartPalette.hot }}
            />
          </ComposedChart>
        );

      case 'low':
        return (
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.grid} />
            <XAxis dataKey="displayTime" tick={axisTickSmall} stroke={chartPalette.grid} />
            <YAxis
              tick={axisTickMedium}
              stroke={chartPalette.grid}
              label={{
                value: `Temperature (°${unit})`,
                angle: -90,
                position: 'insideLeft',
                style: axisLabelStyle,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Area
              type="monotone"
              dataKey="temperature"
              stroke={chartPalette.cool}
              fill="var(--info-bg)"
              fillOpacity={0.3}
              strokeWidth={3}
              name="Low Temperature"
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke={chartPalette.cool}
              strokeWidth={3}
              name="Temperature"
              dot={{ r: 3, fill: chartPalette.cool }}
            />
          </ComposedChart>
        );

      case 'precipitation':
        return (
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.grid} />
            <XAxis dataKey="displayTime" tick={axisTickSmall} stroke={chartPalette.grid} />
            <YAxis
              tick={axisTickMedium}
              stroke={chartPalette.grid}
              label={{
                value: 'Precipitation (mm)',
                angle: -90,
                position: 'insideLeft',
                style: axisLabelStyle,
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
              stroke={chartPalette.coolAccent}
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
            <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.grid} />
            <XAxis dataKey="displayTime" tick={axisTickSmall} stroke={chartPalette.grid} />
            <YAxis
              tick={axisTickMedium}
              stroke={chartPalette.grid}
              label={{
                value: 'Wind Speed (km/h)',
                angle: -90,
                position: 'insideLeft',
                style: axisLabelStyle,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Area
              type="monotone"
              dataKey="windSpeed"
              stroke={METRIC_COLORS.windSpeed}
              fill="var(--bg-tertiary)"
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
            <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.grid} />
            <XAxis
              dataKey="displayTime"
              tick={axisTickSmall}
              stroke={chartPalette.grid}
              label={{
                value: 'Time (hours)',
                position: 'insideBottom',
                offset: -5,
                style: { textAnchor: 'middle', fill: chartPalette.textMuted, fontSize: 12 },
              }}
            />
            <YAxis
              yAxisId="left"
              tick={axisTickMedium}
              stroke={chartPalette.grid}
              label={{
                value: `Temperature (°${unit})`,
                angle: -90,
                position: 'insideLeft',
                style: axisLabelStyle,
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={axisTickMedium}
              stroke={chartPalette.grid}
              label={{
                value: 'Precipitation (mm)',
                angle: 90,
                position: 'insideRight',
                style: axisLabelStyle,
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
              stroke={chartPalette.accentSecondary}
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
          color: 'var(--text-primary)',
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
              selectedMetric === 'overview' ? 'var(--gradient-primary)' : 'var(--bg-tertiary)',
            color:
              selectedMetric === 'overview' ? 'var(--text-on-accent)' : 'var(--text-secondary)',
            border: selectedMetric === 'overview' ? 'none' : '1px solid var(--border-light)',
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
              e.target.style.background = 'var(--hover-bg)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedMetric !== 'overview') {
              e.target.style.background = 'var(--bg-tertiary)';
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
            background: selectedMetric === 'high' ? 'var(--warning-bg-hover)' : 'var(--warning-bg)',
            borderRadius: '6px',
            textAlign: 'center',
            border:
              selectedMetric === 'high'
                ? '2px solid var(--warning-border)'
                : '1px solid transparent',
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
              color: 'var(--warning-text)',
              textTransform: 'uppercase',
              fontWeight: '600',
            }}
          >
            🔥 High
          </p>
          <p
            style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--warning-text)' }}
          >
            {formatTemperature(stats.high, unit)}
          </p>
        </button>

        <button
          onClick={() => setSelectedMetric('low')}
          style={{
            padding: '10px',
            background: selectedMetric === 'low' ? 'var(--info-border)' : 'var(--info-bg)',
            borderRadius: '6px',
            textAlign: 'center',
            border:
              selectedMetric === 'low' ? '2px solid var(--info-border)' : '1px solid transparent',
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
              color: 'var(--accent-text)',
              textTransform: 'uppercase',
              fontWeight: '600',
            }}
          >
            ❄️ Low
          </p>
          <p
            style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--accent-text)' }}
          >
            {formatTemperature(stats.low, unit)}
          </p>
        </button>

        <button
          onClick={() => setSelectedMetric('precipitation')}
          style={{
            padding: '10px',
            background:
              selectedMetric === 'precipitation' ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
            borderRadius: '6px',
            textAlign: 'center',
            border:
              selectedMetric === 'precipitation'
                ? `2px solid ${chartPalette.coolAccent}`
                : '1px solid transparent',
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
              color: chartPalette.coolAccent,
              textTransform: 'uppercase',
              fontWeight: '600',
            }}
          >
            🌧️ Total Precip
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '700',
              color: chartPalette.coolAccent,
            }}
          >
            {stats.totalPrecip.toFixed(1)} mm
          </p>
        </button>

        <button
          onClick={() => setSelectedMetric('wind')}
          style={{
            padding: '10px',
            background: selectedMetric === 'wind' ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
            borderRadius: '6px',
            textAlign: 'center',
            border:
              selectedMetric === 'wind' ? '2px solid var(--border-light)' : '1px solid transparent',
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
              color: 'var(--text-secondary)',
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
              color: 'var(--text-primary)',
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
          background: 'var(--info-bg)',
          borderRadius: '6px',
          border: '1px solid var(--info-border)',
        }}
      >
        <p style={{ margin: 0, fontSize: '11px', color: 'var(--accent-text)' }}>
          <strong>💡 Note:</strong> &quot;Feels Like&quot; temperature accounts for wind chill and
          heat index effects. Times shown in local timezone.
        </p>
      </div>
    </div>
  );
}

export default HourlyForecastChart;
