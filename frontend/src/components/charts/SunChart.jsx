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
} from 'recharts';
import { chartPalette } from '../../constants';

/**
 * SunChart Component
 * Visualizes sunrise and sunset times with daylight hours
 */
function SunChart({ data, days, height = 300 }) {
  const getTimeLabel = () => {
    const numDays = days || data.length;
    if (numDays === 7) return 'Next Week';
    if (numDays === 14) return 'Next 2 Weeks';
    return `Next ${numDays} Days`;
  };

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
        <p>No sunrise/sunset data available</p>
      </div>
    );
  }

  // Convert time string (HH:MM:SS) to minutes since midnight
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes to time string
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  // Prepare chart data
  const chartData = data.map((day) => {
    const sunriseMinutes = timeToMinutes(day.sunrise);
    const sunsetMinutes = timeToMinutes(day.sunset);
    const daylightMinutes = sunsetMinutes - sunriseMinutes;
    const daylightHours = (daylightMinutes / 60).toFixed(1);

    return {
      date: new Date(day.datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sunrise: sunriseMinutes,
      sunset: sunsetMinutes,
      daylight: daylightMinutes,
      daylightHours,
      sunriseTime: day.sunrise,
      sunsetTime: day.sunset,
    };
  });

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
          <p style={{ margin: '4px 0', color: chartPalette.warning, fontWeight: '500' }}>
            🌅 Sunrise: {data.sunriseTime}
          </p>
          <p style={{ margin: '4px 0', color: chartPalette.hot, fontWeight: '500' }}>
            🌇 Sunset: {data.sunsetTime}
          </p>
          <p style={{ margin: '4px 0', color: chartPalette.cool, fontWeight: '500' }}>
            ☀️ Daylight: {data.daylightHours} hours
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%' }}>
      <h3
        style={{
          margin: '0 0 8px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: 'var(--text-primary)',
        }}
      >
        🌅 Sunrise & Sunset - {getTimeLabel()}
      </h3>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.grid} opacity={0.5} />
          <XAxis
            dataKey="date"
            stroke={chartPalette.textMuted}
            tick={{ fill: chartPalette.textMuted, fontSize: 13, fontWeight: 500 }}
            style={{ fontSize: '13px' }}
          />
          <YAxis
            stroke={chartPalette.textMuted}
            tick={{ fill: chartPalette.textMuted, fontSize: 13, fontWeight: 500 }}
            style={{ fontSize: '13px' }}
            tickFormatter={minutesToTime}
            domain={[300, 1200]} // 5 AM to 8 PM
            ticks={[360, 480, 600, 720, 840, 960, 1080, 1200]}
            label={{
              value: 'Time of Day',
              angle: -90,
              position: 'insideLeft',
              style: { fill: 'var(--text-primary)', fontSize: 14, fontWeight: 600 },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '14px', fontWeight: 600 }} />
          <Bar dataKey="sunrise" fill={chartPalette.warning} name="Sunrise" radius={[4, 4, 0, 0]} />
          <Bar dataKey="sunset" fill={chartPalette.hot} name="Sunset" radius={[4, 4, 0, 0]} />
          <Bar dataKey="daylight" fill={chartPalette.cool} name="Daylight Duration (min)" hide />
        </BarChart>
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
        <p style={{ margin: '0 0 8px 0' }}>
          💡 <strong>Daylight Hours:</strong> The chart shows sunrise and sunset times. Longer bars
          indicate more daylight hours.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <span>
            📊 Avg:{' '}
            {(
              chartData.reduce((sum, d) => sum + parseFloat(d.daylightHours), 0) / chartData.length
            ).toFixed(1)}
            h
          </span>
          <span>
            ⬆️ Max: {Math.max(...chartData.map((d) => parseFloat(d.daylightHours))).toFixed(1)}h
          </span>
          <span>
            ⬇️ Min: {Math.min(...chartData.map((d) => parseFloat(d.daylightHours))).toFixed(1)}h
          </span>
        </div>
      </div>
    </div>
  );
}

export default SunChart;
