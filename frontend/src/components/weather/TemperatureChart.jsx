/**
 * TemperatureChart - Line chart showing temperature over time
 */
import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import Card from '../ui/Card';
import { useTemperatureUnit } from '../../contexts/TemperatureUnitContext';

function TemperatureChart({ forecast, isLoading }) {
  const { unit, formatTemperature, convertTemperature } = useTemperatureUnit();

  // Convert temperatures when building chart data so chart reacts to unit changes
  const chartData = useMemo(() => {
    if (!forecast?.days) return [];

    return forecast.days.slice(0, 7).map((day) => {
      const date = new Date(day.datetime);
      return {
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        high: Math.round(convertTemperature(day.tempmax)),
        low: Math.round(convertTemperature(day.tempmin)),
      };
    });
  }, [forecast, convertTemperature]);

  if (isLoading) {
    return (
      <Card>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Temperature Trend</h2>
        <div className="h-48 animate-pulse bg-bg-elevated rounded" />
      </Card>
    );
  }

  if (chartData.length === 0) {
    return null;
  }

  // Find min/max for Y axis domain
  const allTemps = chartData.flatMap((d) => [d.high, d.low]);
  const minTemp = Math.min(...allTemps) - 5;
  const maxTemp = Math.max(...allTemps) + 5;

  return (
    <Card>
      <h2 className="text-lg font-semibold text-text-primary mb-4">Temperature Trend</h2>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="highGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#88BDF2" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#88BDF2" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6A89A7', fontSize: 12 }}
            />
            <YAxis
              domain={[minTemp, maxTemp]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6A89A7', fontSize: 12 }}
              tickFormatter={(value) => `${value}°`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#3d5166',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
              }}
              labelStyle={{ color: '#BDDDFC' }}
              formatter={(value, name) => [
                `${Math.round(value)}°${unit}`,
                name === 'high' ? 'High' : 'Low',
              ]}
            />
            <Area
              type="monotone"
              dataKey="high"
              stroke="#88BDF2"
              strokeWidth={2}
              fill="url(#highGradient)"
              dot={{ fill: '#88BDF2', strokeWidth: 0, r: 4 }}
              activeDot={{ fill: '#88BDF2', strokeWidth: 0, r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="low"
              stroke="#6A89A7"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#6A89A7', strokeWidth: 0, r: 4 }}
              activeDot={{ fill: '#6A89A7', strokeWidth: 0, r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-accent" />
          <span className="text-text-muted">High</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-0.5 bg-text-muted border-dashed"
            style={{ borderTop: '2px dashed #6A89A7' }}
          />
          <span className="text-text-muted">Low</span>
        </div>
      </div>
    </Card>
  );
}

export default TemperatureChart;
