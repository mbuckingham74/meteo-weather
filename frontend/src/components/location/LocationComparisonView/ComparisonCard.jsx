import React from 'react';
import { formatTemperature } from '../../../utils/weatherHelpers';
import { getUserMessage } from '../../../utils/errorHandler';
import LocationSearchBar from '../LocationSearchBar';
import TemperatureBandChart from '../../charts/TemperatureBandChart';
import PrecipitationChart from '../../charts/PrecipitationChart';
import WindChart from '../../charts/WindChart';
import HistoricalComparisonChart from '../../charts/HistoricalComparisonChart';

/**
 * Comparison Card Component
 * Displays weather data and charts for a single location in the comparison view
 */
function ComparisonCard({
  index,
  location,
  data,
  comparisonData,
  historyData,
  aggregationResult,
  dateRange,
  timeRange,
  unit,
  canRemove,
  onLocationSelect,
  onRemove,
}) {
  const loading = data?.loading;
  const error = data?.error;
  const weatherData = aggregationResult?.aggregatedData || [];
  const aggregationLabel = aggregationResult?.aggregationLabel;

  return (
    <div className="comparison-card">
      <div className="card-header">
        <span className="card-number">{index + 1}</span>
        {canRemove && (
          <button className="remove-card-button" onClick={onRemove}>
            ✕
          </button>
        )}
      </div>

      <div className="card-search">
        <LocationSearchBar
          onLocationSelect={(loc) => onLocationSelect(index, loc)}
          currentLocation={{ address: location }}
        />
      </div>

      {loading && (
        <div className="card-loading">
          <div className="spinner"></div>
          <p>Loading weather...</p>
        </div>
      )}

      {error && (
        <div className="card-error">
          <p>⚠️ {getUserMessage(error)}</p>
        </div>
      )}

      {!loading && !error && weatherData.length === 0 && (
        <div className="card-error">
          <p>⚠️ No weather data available</p>
        </div>
      )}

      {!loading && !error && weatherData.length > 0 && (
        <div className="card-content">
          <h3 className="location-name">{data.data.location?.address || location}</h3>

          <div className="current-weather">
            <div className="temp-display">
              <span className="current-temp">
                {formatTemperature(weatherData[0].tempAvg || weatherData[0].temp, unit)}
              </span>
              <span className="temp-label">
                {dateRange.type === 'forecast' ? 'Current' : 'Latest'}
              </span>
            </div>
            <div className="temp-range">
              <span className="high-temp">
                H: {formatTemperature(weatherData[0].tempMax || weatherData[0].temp, unit)}
              </span>
              <span className="low-temp">
                L: {formatTemperature(weatherData[0].tempMin || weatherData[0].temp, unit)}
              </span>
            </div>
          </div>

          <div className="forecast-summary">
            <div className="summary-item">
              <span className="summary-label">
                {timeRange === '7days'
                  ? '7-Day Avg'
                  : timeRange === '1month'
                    ? '1-Month Avg'
                    : timeRange === '3months'
                      ? '3-Month Avg'
                      : timeRange === '6months'
                        ? '6-Month Avg'
                        : timeRange === '1year'
                          ? '1-Year Avg'
                          : timeRange === '3years'
                            ? '3-Year Avg'
                            : '5-Year Avg'}
              </span>
              <span className="summary-value">
                {formatTemperature(
                  weatherData.reduce((sum, d) => sum + (d.tempAvg || d.temp), 0) /
                    weatherData.length,
                  unit
                )}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Precipitation</span>
              <span className="summary-value">
                {weatherData.reduce((sum, d) => sum + (d.precipitation || 0), 0).toFixed(1)} mm
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Avg Humidity</span>
              <span className="summary-value">
                {Math.round(
                  weatherData.reduce((sum, d) => sum + (d.humidity || 0), 0) / weatherData.length
                )}
                %
              </span>
            </div>
          </div>

          {weatherData[0].conditions && (
            <div className="conditions-badge">{weatherData[0].conditions}</div>
          )}

          {/* Weather Charts */}
          {weatherData && weatherData.length > 0 && (
            <div className="comparison-charts">
              {aggregationLabel && (
                <div className="aggregation-indicator">
                  <span>📊 {aggregationLabel}</span>
                </div>
              )}

              <div className="comparison-chart">
                <TemperatureBandChart
                  data={weatherData}
                  unit={unit}
                  height={200}
                  days={weatherData.length}
                  aggregationLabel={aggregationLabel}
                />
              </div>

              <div className="comparison-chart">
                <PrecipitationChart
                  data={weatherData}
                  height={180}
                  days={weatherData.length}
                  aggregationLabel={aggregationLabel}
                />
              </div>

              <div className="comparison-chart">
                <WindChart
                  data={weatherData}
                  height={180}
                  days={weatherData.length}
                  aggregationLabel={aggregationLabel}
                />
              </div>

              {/* Historical Comparison (only for forecast mode) */}
              {dateRange.type === 'forecast' && comparisonData?.data && (
                <div className="comparison-chart">
                  <HistoricalComparisonChart
                    forecastData={weatherData}
                    historicalData={comparisonData.data}
                    unit={unit}
                    height={220}
                    aggregationLabel={aggregationLabel}
                  />
                </div>
              )}
            </div>
          )}

          {/* Historical Insights (only for forecast mode) */}
          {dateRange.type === 'forecast' && historyData?.data && (
            <div className="historical-insights">
              <h4>📅 Historical Context (10 years)</h4>
              <div className="insights-stats">
                {historyData.data.normals && (
                  <>
                    <div className="stat-item">
                      <span className="stat-label">Historical Avg:</span>
                      <span className="stat-value">
                        {formatTemperature(historyData.data.normals.tempAvg, unit)}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Record High:</span>
                      <span className="stat-value high">
                        {formatTemperature(historyData.data.records?.maxTemp, unit)}
                        {historyData.data.records?.maxTempYear &&
                          ` (${historyData.data.records.maxTempYear})`}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Record Low:</span>
                      <span className="stat-value low">
                        {formatTemperature(historyData.data.records?.minTemp, unit)}
                        {historyData.data.records?.minTempYear &&
                          ` (${historyData.data.records.minTempYear})`}
                      </span>
                    </div>
                  </>
                )}
                {weatherData.length > 0 && historyData.data.normals && (
                  <div className="stat-item comparison-stat">
                    <span className="stat-label">vs Historical:</span>
                    <span
                      className={`stat-value ${
                        (weatherData[0].tempAvg || weatherData[0].temp) >
                        historyData.data.normals.tempAvg
                          ? 'warmer'
                          : 'cooler'
                      }`}
                    >
                      {(weatherData[0].tempAvg || weatherData[0].temp) >
                      historyData.data.normals.tempAvg
                        ? '🔥 Warmer'
                        : '❄️ Cooler'}{' '}
                      than average (
                      {Math.abs(
                        (weatherData[0].tempAvg || weatherData[0].temp) -
                          historyData.data.normals.tempAvg
                      ).toFixed(1)}
                      °{unit})
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ComparisonCard;
