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
import { formatDateShort, formatTemperature } from '../../utils/weatherHelpers';

/**
 * Historical Comparison Chart Component
 * Compares current forecast with historical climate normals
 */
function HistoricalComparisonChart({
  forecastData,
  historicalData,
  unit = 'C',
  height = 400,
  aggregationLabel: _aggregationLabel,
}) {
  if (!forecastData || forecastData.length === 0) {
    return (
      <div
        style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary, #6b7280)' }}
      >
        No forecast data available
      </div>
    );
  }

  if (!historicalData || historicalData.length === 0) {
    return (
      <div
        style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary, #6b7280)' }}
      >
        Loading historical climate data...
      </div>
    );
  }

  // Combine forecast and historical data
  const chartData = forecastData.map((forecast, index) => {
    const historical = historicalData[index];

    return {
      date: forecast.date,
      displayDate: forecast.displayLabel || formatDateShort(forecast.date),
      aggregatedDays: forecast.aggregatedDays,
      // Forecast temperatures
      forecastMax: forecast.tempMax,
      forecastMin: forecast.tempMin,
      forecastAvg: forecast.tempAvg || forecast.temp,
      // Historical normals
      normalMax: historical?.historical.tempMax,
      normalMin: historical?.historical.tempMin,
      normalAvg: historical?.historical.tempAvg,
      // Percentile bands
      p10: historical?.historical.percentiles?.temp10,
      p90: historical?.historical.percentiles?.temp90,
      // Comparison
      comparison: historical?.comparison,
    };
  });

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;

    return (
      <div
        style={{
          background: 'var(--bg-elevated, white)',
          padding: '12px',
          border: '1px solid var(--border-light, #e5e7eb)',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          minWidth: '220px',
        }}
      >
        <p
          style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: 'var(--text-primary, #111827)' }}
        >
          {data.displayDate}
        </p>
        {data.aggregatedDays && (
          <p
            style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#10b981', fontStyle: 'italic' }}
          >
            ({data.aggregatedDays} days averaged)
          </p>
        )}

        <div style={{ marginBottom: '8px' }}>
          <p style={{ margin: '2px 0', fontSize: '12px', fontWeight: '600', color: '#10b981' }}>
            Forecast:
          </p>
          <p
            style={{
              margin: '2px 0 2px 12px',
              fontSize: '11px',
              color: 'var(--text-secondary, #6b7280)',
            }}
          >
            High: {formatTemperature(data.forecastMax, unit)}
          </p>
          <p
            style={{
              margin: '2px 0 2px 12px',
              fontSize: '11px',
              color: 'var(--text-secondary, #6b7280)',
            }}
          >
            Low: {formatTemperature(data.forecastMin, unit)}
          </p>
          <p
            style={{
              margin: '2px 0 2px 12px',
              fontSize: '11px',
              color: 'var(--text-secondary, #6b7280)',
            }}
          >
            Avg: {formatTemperature(data.forecastAvg, unit)}
          </p>
        </div>

        <div>
          <p style={{ margin: '2px 0', fontSize: '12px', fontWeight: '600', color: '#10b981' }}>
            Historical Normal:
          </p>
          <p
            style={{
              margin: '2px 0 2px 12px',
              fontSize: '11px',
              color: 'var(--text-secondary, #6b7280)',
            }}
          >
            High: {formatTemperature(data.normalMax, unit)}
          </p>
          <p
            style={{
              margin: '2px 0 2px 12px',
              fontSize: '11px',
              color: 'var(--text-secondary, #6b7280)',
            }}
          >
            Low: {formatTemperature(data.normalMin, unit)}
          </p>
          <p
            style={{
              margin: '2px 0 2px 12px',
              fontSize: '11px',
              color: 'var(--text-secondary, #6b7280)',
            }}
          >
            Avg: {formatTemperature(data.normalAvg, unit)}
          </p>
        </div>

        {data.comparison && (
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
            <p
              style={{
                margin: '2px 0',
                fontSize: '11px',
                color: data.comparison.tempDiff > 0 ? '#ef4444' : '#3b82f6',
                fontWeight: '600',
              }}
            >
              {data.comparison.tempDiff > 0 ? '↑' : '↓'}{' '}
              {Math.abs(data.comparison.tempDiff).toFixed(1)}° vs normal
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            margin: 0,
            color: 'var(--text-primary, #111827)',
            fontSize: '18px',
            fontWeight: '600',
          }}
        >
          Forecast vs Historical Climate
        </h3>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="normalRange" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            stroke="#9ca3af"
            angle={chartData.length > 20 ? -45 : 0}
            textAnchor={chartData.length > 20 ? 'end' : 'middle'}
            height={chartData.length > 20 ? 80 : 30}
            interval={chartData.length > 30 ? 'preserveStartEnd' : 0}
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

          {/* Historical normal range (p10-p90) */}
          <Area
            type="monotone"
            dataKey="p90"
            stroke="none"
            fill="url(#normalRange)"
            name="Normal Range"
            fillOpacity={1}
          />
          <Area type="monotone" dataKey="p10" stroke="none" fill="white" fillOpacity={1} />

          {/* Historical average line */}
          <Line
            type="monotone"
            dataKey="normalAvg"
            stroke="#10b981"
            strokeWidth={2}
            name="Historical Average"
            dot={{ r: 3 }}
            strokeDasharray="5 5"
          />

          {/* Forecast high/low lines */}
          <Line
            type="monotone"
            dataKey="forecastMax"
            stroke="#ef4444"
            strokeWidth={2}
            name="Forecast High"
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="forecastMin"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Forecast Low"
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="forecastAvg"
            stroke="#10b981"
            strokeWidth={3}
            name="Forecast Average"
            dot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend explanation */}
      <div
        style={{ marginTop: '16px', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}
      >
        <p
          style={{
            margin: '0 0 8px 0',
            fontSize: '12px',
            fontWeight: '600',
            color: 'var(--text-secondary, #374151)',
          }}
        >
          Understanding the chart:
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-secondary, #6b7280)' }}>
            <span style={{ color: '#10b981', fontWeight: '600' }}>Solid lines:</span> Current
            forecast
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary, #6b7280)' }}>
            <span style={{ color: '#10b981', fontWeight: '600' }}>Dashed line:</span> Historical
            average
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary, #6b7280)' }}>
            <span style={{ color: '#10b981', fontWeight: '600' }}>Shaded area:</span> Normal
            temperature range (10th-90th percentile)
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoricalComparisonChart;
