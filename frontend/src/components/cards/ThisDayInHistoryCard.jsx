import React from 'react';
import { formatTemperature } from '../../utils/weatherHelpers';

const FROSTED_PANEL_STYLE = {
  padding: '10px',
  background: 'var(--overlay-accent-strong)',
  borderRadius: '10px',
  backdropFilter: 'blur(10px)',
};

const FROSTED_BLOCK_STYLE = {
  padding: '12px',
  background: 'var(--overlay-accent)',
  borderRadius: '8px',
  backdropFilter: 'blur(10px)',
};

/**
 * This Day in History Card Component
 * Displays historical weather records for the current date
 */
function ThisDayInHistoryCard({ historyData, unit = 'C' }) {
  if (!historyData || !historyData.records) {
    return (
      <div
        style={{
          padding: '12px',
          background: 'var(--bg-elevated)',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center',
          color: 'var(--text-tertiary)',
        }}
      >
        Loading historical data...
      </div>
    );
  }

  const { date, records, averages, yearsAnalyzed, location } = historyData;

  // Format date for display
  const formatDate = (dateStr) => {
    const [month, day] = dateStr.split('-');
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}`;
  };

  return (
    <div
      style={{
        padding: '12px',
        background: 'var(--gradient-primary)',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-lg)',
        color: 'var(--text-on-accent)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '12px', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '600' }}>
          📅 This Day in History
        </h3>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
          {formatDate(date)} • {location?.address || 'Loading...'}
        </p>
        <p style={{ margin: '2px 0 0 0', fontSize: '11px', opacity: 0.75 }}>
          Based on {yearsAnalyzed?.length || 0} years of data
        </p>
      </div>

      {/* Record temperatures */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
          marginBottom: '12px',
        }}
      >
        {/* Record High */}
        <div style={FROSTED_PANEL_STYLE}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '24px' }}>🔥</span>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, fontWeight: '600' }}>
              Record High
            </p>
          </div>
          <p style={{ margin: '0 0 4px 0', fontSize: '32px', fontWeight: '700' }}>
            {formatTemperature(records.highTemperature.value, unit)}
          </p>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.75 }}>
            Set in {records.highTemperature.year}
          </p>
        </div>

        {/* Record Low */}
        <div style={FROSTED_PANEL_STYLE}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '24px' }}>❄️</span>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, fontWeight: '600' }}>
              Record Low
            </p>
          </div>
          <p style={{ margin: '0 0 4px 0', fontSize: '32px', fontWeight: '700' }}>
            {formatTemperature(records.lowTemperature.value, unit)}
          </p>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.75 }}>
            Set in {records.lowTemperature.year}
          </p>
        </div>
      </div>

      {/* Average temperatures */}
      <div style={FROSTED_PANEL_STYLE}>
        <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600', opacity: 0.9 }}>
          📊 Historical Averages
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <div>
            <p
              style={{
                margin: '0 0 4px 0',
                fontSize: '11px',
                opacity: 0.75,
                textTransform: 'uppercase',
              }}
            >
              High
            </p>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              {formatTemperature(averages.tempMax, unit)}
            </p>
          </div>
          <div>
            <p
              style={{
                margin: '0 0 4px 0',
                fontSize: '11px',
                opacity: 0.75,
                textTransform: 'uppercase',
              }}
            >
              Average
            </p>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              {formatTemperature(averages.temp, unit)}
            </p>
          </div>
          <div>
            <p
              style={{
                margin: '0 0 4px 0',
                fontSize: '11px',
                opacity: 0.75,
                textTransform: 'uppercase',
              }}
            >
              Low
            </p>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              {formatTemperature(averages.tempMin, unit)}
            </p>
          </div>
        </div>
      </div>

      {/* Precipitation record */}
      {records.maxPrecipitation && records.maxPrecipitation.value > 0 && (
        <div style={{ ...FROSTED_BLOCK_STYLE, marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🌧️</span>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Most Precipitation</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: '600' }}>
                {records.maxPrecipitation.value.toFixed(1)} mm
              </p>
              <p style={{ margin: 0, fontSize: '10px', opacity: 0.75 }}>
                in {records.maxPrecipitation.year}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fun fact */}
      <div
        style={{
          ...FROSTED_BLOCK_STYLE,
          marginTop: '16px',
          border: '1px solid var(--overlay-accent-strong)',
        }}
      >
        <p style={{ margin: 0, fontSize: '11px', opacity: 0.85, lineHeight: '1.5' }}>
          💡 <strong>Did you know?</strong> The temperature on this day has varied by{' '}
          {Math.abs(records.highTemperature.value - records.lowTemperature.value).toFixed(1)}°{unit}{' '}
          over the past {yearsAnalyzed?.length || 0} years!
        </p>
      </div>
    </div>
  );
}

export default ThisDayInHistoryCard;
