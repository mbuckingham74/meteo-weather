import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { getCloudCoverColor } from '../../utils/colorScales';
import { formatDateShort } from '../../utils/weatherHelpers';
import { chartPalette } from '../../constants';

/**
 * Cloud Cover Chart Component
 * Shows cloud cover percentage and visibility over time
 */
function CloudCoverChart({ data, days, height = 350 }) {
  const getTimeLabel = () => {
    const numDays = days || data.length;
    if (numDays === 7) return 'Next Week';
    if (numDays === 14) return 'Next 2 Weeks';
    return `Next ${numDays} Days`;
  };

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
        No cloud cover data available
      </div>
    );
  }

  // Format data for Recharts
  const chartData = data.map((day) => ({
    date: day.date,
    displayDate: formatDateShort(day.date),
    cloudCover: day.cloudCover,
    visibility: day.visibility,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    const cloudCondition =
      data.cloudCover < 20
        ? 'Clear'
        : data.cloudCover < 50
          ? 'Partly Cloudy'
          : data.cloudCover < 80
            ? 'Mostly Cloudy'
            : 'Overcast';

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
        <p style={{ margin: '4px 0', color: chartPalette.textMuted }}>
          Cloud Cover: {data.cloudCover}% ({cloudCondition})
        </p>
        <p style={{ margin: '4px 0', color: chartPalette.positive }}>
          Visibility: {data.visibility ? `${data.visibility.toFixed(1)} km` : 'N/A'}
        </p>
      </div>
    );
  };

  // Get cloud icon based on coverage
  const getCloudIcon = (cloudCover) => {
    if (cloudCover < 20) return '☀️';
    if (cloudCover < 50) return '⛅';
    if (cloudCover < 80) return '☁️';
    return '☁️☁️';
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
        Cloud Cover & Visibility - {getTimeLabel()}
      </h3>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cloudGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartPalette.neutral} stopOpacity={0.8} />
              <stop offset="95%" stopColor={chartPalette.neutral} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="visibilityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartPalette.positive} stopOpacity={0.4} />
              <stop offset="95%" stopColor={chartPalette.positive} stopOpacity={0.05} />
            </linearGradient>
          </defs>
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
            domain={[0, 100]}
            label={{
              value: 'Cloud Cover (%)',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: chartPalette.textMuted },
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: chartPalette.textMuted }}
            stroke={chartPalette.grid}
            label={{
              value: 'Visibility (km)',
              angle: 90,
              position: 'insideRight',
              style: { textAnchor: 'middle', fill: chartPalette.textMuted },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          {/* Cloud cover area */}
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="cloudCover"
            stroke={chartPalette.neutral}
            fill="url(#cloudGradient)"
            strokeWidth={2}
            name="Cloud Cover"
          />

          {/* Visibility area */}
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="visibility"
            stroke={chartPalette.positive}
            fill="url(#visibilityGradient)"
            strokeWidth={2}
            name="Visibility"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Cloud Cover Summary */}
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
          Daily Cloud Conditions:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
          {chartData.slice(0, 7).map((day, idx) => {
            const condition =
              day.cloudCover < 20
                ? 'Clear'
                : day.cloudCover < 50
                  ? 'Partly Cloudy'
                  : day.cloudCover < 80
                    ? 'Mostly Cloudy'
                    : 'Overcast';

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px',
                  background: 'var(--bg-elevated)',
                  borderRadius: '6px',
                  minWidth: '80px',
                }}
              >
                <span style={{ fontSize: '24px' }}>{getCloudIcon(day.cloudCover)}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {day.displayDate.split(',')[0]}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: getCloudCoverColor(day.cloudCover),
                  }}
                >
                  {day.cloudCover}%
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{condition}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cloud Cover Legend */}
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
          Cloud Cover Categories:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px' }}>☀️</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Clear (&lt; 20%)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px' }}>⛅</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Partly Cloudy (20-50%)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px' }}>☁️</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Mostly Cloudy (50-80%)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px' }}>☁️☁️</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Overcast (&gt; 80%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CloudCoverChart;
