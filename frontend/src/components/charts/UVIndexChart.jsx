import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  ReferenceLine,
} from 'recharts';
import { getUVIndexColor } from '../../utils/colorScales';
import { formatDateShort } from '../../utils/weatherHelpers';

/**
 * UV Index Chart Component
 * Shows UV Index levels with safety categories
 */
function UVIndexChart({ data, days, height = 350 }) {
  const getTimeLabel = () => {
    const numDays = days || data.length;
    if (numDays === 7) return 'Next Week';
    if (numDays === 14) return 'Next 2 Weeks';
    return `Next ${numDays} Days`;
  };

  if (!data || data.length === 0) {
    return (
      <div
        style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary, #6b7280)' }}
      >
        No UV Index data available
      </div>
    );
  }

  // Format data for Recharts
  const chartData = data.map((day) => ({
    date: day.date,
    displayDate: formatDateShort(day.date),
    uvIndex: day.uvIndex || 0,
  }));

  // Get UV risk level
  const getUVRiskLevel = (uvIndex) => {
    if (uvIndex < 3) return 'Low';
    if (uvIndex < 6) return 'Moderate';
    if (uvIndex < 8) return 'High';
    if (uvIndex < 11) return 'Very High';
    return 'Extreme';
  };

  // Get protection advice
  const getProtectionAdvice = (uvIndex) => {
    if (uvIndex < 3) return 'No protection needed';
    if (uvIndex < 6) return 'Wear sunscreen';
    if (uvIndex < 8) return 'Sunscreen + hat recommended';
    if (uvIndex < 11) return 'Extra protection required';
    return 'Avoid sun exposure';
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    const riskLevel = getUVRiskLevel(data.uvIndex);
    const advice = getProtectionAdvice(data.uvIndex);

    return (
      <div
        style={{
          background: 'var(--bg-elevated, white)',
          padding: '12px',
          border: '1px solid var(--border-light, #e5e7eb)',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          minWidth: '180px',
        }}
      >
        <p
          style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: 'var(--text-primary, #111827)' }}
        >
          {data.displayDate}
        </p>
        <p style={{ margin: '4px 0', color: getUVIndexColor(data.uvIndex), fontWeight: '600' }}>
          UV Index: {data.uvIndex}
        </p>
        <p style={{ margin: '4px 0', fontSize: '12px', color: 'var(--text-secondary, #6b7280)' }}>
          Risk: {riskLevel}
        </p>
        <p
          style={{
            margin: '4px 0',
            fontSize: '11px',
            color: 'var(--text-tertiary, #9ca3af)',
            fontStyle: 'italic',
          }}
        >
          {advice}
        </p>
      </div>
    );
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
        UV Index & Sun Safety - {getTimeLabel()}
      </h3>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="displayDate" tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#9ca3af" />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#9ca3af"
            domain={[0, 12]}
            label={{
              value: 'UV Index',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: '#6b7280' },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          {/* Reference lines for UV categories */}
          <ReferenceLine
            y={3}
            stroke="#10b981"
            strokeDasharray="3 3"
            label={{ value: 'Low', position: 'right', fontSize: 10, fill: '#10b981' }}
          />
          <ReferenceLine
            y={6}
            stroke="#fbbf24"
            strokeDasharray="3 3"
            label={{ value: 'Moderate', position: 'right', fontSize: 10, fill: '#fbbf24' }}
          />
          <ReferenceLine
            y={8}
            stroke="#f97316"
            strokeDasharray="3 3"
            label={{ value: 'High', position: 'right', fontSize: 10, fill: '#f97316' }}
          />
          <ReferenceLine
            y={11}
            stroke="#dc2626"
            strokeDasharray="3 3"
            label={{ value: 'Very High', position: 'right', fontSize: 10, fill: '#dc2626' }}
          />

          {/* UV Index bars with color coding */}
          <Bar dataKey="uvIndex" name="UV Index" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getUVIndexColor(entry.uvIndex)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* UV Risk Categories */}
      <div
        style={{ marginTop: '20px', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}
      >
        <p
          style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-secondary, #374151)',
          }}
        >
          UV Risk Categories:
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              background: 'var(--bg-elevated, white)',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: '#10b981',
                borderRadius: '3px',
              }}
            />
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-primary, #111827)',
                }}
              >
                Low (0-2)
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary, #6b7280)' }}>
                No protection needed
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              background: 'var(--bg-elevated, white)',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: '#fbbf24',
                borderRadius: '3px',
              }}
            />
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-primary, #111827)',
                }}
              >
                Moderate (3-5)
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary, #6b7280)' }}>
                Wear sunscreen
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              background: 'var(--bg-elevated, white)',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: '#f97316',
                borderRadius: '3px',
              }}
            />
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-primary, #111827)',
                }}
              >
                High (6-7)
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary, #6b7280)' }}>
                Sunscreen + hat
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              background: 'var(--bg-elevated, white)',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: '#dc2626',
                borderRadius: '3px',
              }}
            />
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-primary, #111827)',
                }}
              >
                Very High (8-10)
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary, #6b7280)' }}>
                Extra protection
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              background: 'var(--bg-elevated, white)',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: '#7c2d12',
                borderRadius: '3px',
              }}
            />
            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-primary, #111827)',
                }}
              >
                Extreme (11+)
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary, #6b7280)' }}>
                Avoid sun exposure
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sun Safety Tips */}
      <div
        style={{
          marginTop: '12px',
          padding: '12px',
          background: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #fbbf24',
        }}
      >
        <p
          style={{
            margin: '0 0 6px 0',
            fontSize: '12px',
            fontWeight: '600',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>☀️</span> Sun Safety Tips:
        </p>
        <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '11px', color: '#78350f' }}>
          <li>Apply SPF 30+ sunscreen 15 minutes before sun exposure</li>
          <li>Reapply sunscreen every 2 hours and after swimming</li>
          <li>Seek shade during peak UV hours (10 AM - 4 PM)</li>
          <li>Wear protective clothing, sunglasses, and a wide-brimmed hat</li>
        </ul>
      </div>
    </div>
  );
}

export default UVIndexChart;
