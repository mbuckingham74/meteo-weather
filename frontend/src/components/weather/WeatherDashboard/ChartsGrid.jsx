import React from 'react';
import TemperatureBandChart from '../../charts/TemperatureBandChart';
import PrecipitationChart from '../../charts/PrecipitationChart';
import WindChart from '../../charts/WindChart';
import CloudCoverChart from '../../charts/CloudCoverChart';
import UVIndexChart from '../../charts/UVIndexChart';
import WeatherOverviewChart from '../../charts/WeatherOverviewChart';
import HourlyForecastChart from '../../charts/HourlyForecastChart';
import HistoricalComparisonChart from '../../charts/HistoricalComparisonChart';
import RecordTemperaturesChart from '../../charts/RecordTemperaturesChart';
import TemperatureProbabilityChart from '../../charts/TemperatureProbabilityChart';
import HumidityDewpointChart from '../../charts/HumidityDewpointChart';
import SunChart from '../../charts/SunChart';
import FeelsLikeChart from '../../charts/FeelsLikeChart';
import ThisDayInHistoryCard from '../../cards/ThisDayInHistoryCard';
import AirQualityCard from '../../cards/AirQualityCard';

/**
 * Charts Grid Component
 * Displays all weather charts organized by tabs
 */
function ChartsGrid({
  activeTab,
  visibleCharts,
  data,
  hourlyData,
  thisDayHistory,
  forecastComparison,
  recordTemps,
  tempProbability,
  unit,
  days,
}) {
  const visibleChartCount = Object.values(visibleCharts).filter(Boolean).length;

  return (
    <>
      <div id="weather-charts" className="charts-grid" tabIndex={-1}>
        {/* FORECAST TAB */}
        {activeTab === 'forecast' && visibleCharts.hourly && (
          <div id="chart-hourly" className="chart-card chart-card-wide">
            <HourlyForecastChart
              hourlyData={hourlyData.data?.hourly || []}
              unit={unit}
              height={300}
            />
          </div>
        )}

        {activeTab === 'forecast' && visibleCharts.temperature && (
          <div id="chart-temperature" className="chart-card">
            <TemperatureBandChart data={data.forecast || []} unit={unit} height={300} days={days} />
          </div>
        )}

        {activeTab === 'forecast' && visibleCharts.precipitation && (
          <div id="chart-precipitation" className="chart-card">
            <PrecipitationChart data={data.forecast || []} height={300} days={days} />
          </div>
        )}

        {activeTab === 'forecast' && visibleCharts.wind && (
          <div id="chart-wind" className="chart-card">
            <WindChart data={data.forecast || []} height={300} days={days} />
          </div>
        )}

        {/* DETAILS TAB */}
        {activeTab === 'details' && visibleCharts.cloudCover && (
          <div id="chart-cloudCover" className="chart-card">
            <CloudCoverChart data={data.forecast || []} height={300} days={days} />
          </div>
        )}

        {activeTab === 'details' && visibleCharts.uvIndex && (
          <div id="chart-uvIndex" className="chart-card">
            <UVIndexChart data={data.forecast || []} height={300} days={days} />
          </div>
        )}

        {activeTab === 'forecast' && visibleCharts.overview && (
          <div id="chart-overview" className="chart-card chart-card-wide">
            <WeatherOverviewChart data={data.forecast || []} unit={unit} height={320} days={days} />
          </div>
        )}

        {/* Enhanced Weather Charts */}
        {activeTab === 'details' && visibleCharts.humidityDew && (
          <div id="chart-humidityDew" className="chart-card">
            <HumidityDewpointChart
              data={data.forecast || []}
              unit={unit}
              days={days}
              height={300}
            />
          </div>
        )}

        {activeTab === 'details' && visibleCharts.sunriseSunset && (
          <div id="chart-sunriseSunset" className="chart-card">
            <SunChart data={data.forecast || []} days={days} height={300} />
          </div>
        )}

        {activeTab === 'details' && visibleCharts.feelsLike && (
          <div id="chart-feelsLike" className="chart-card">
            <FeelsLikeChart data={data.forecast || []} unit={unit} days={days} height={300} />
          </div>
        )}

        {activeTab === 'air-quality' && visibleCharts.airQuality && data.location && (
          <div id="chart-airQuality" className="chart-card">
            <AirQualityCard latitude={data.location.latitude} longitude={data.location.longitude} />
          </div>
        )}

        {/* Historical/Climate Charts */}
        {activeTab === 'historical' && visibleCharts.thisDayHistory && (
          <div id="chart-thisDayHistory" className="chart-card chart-card-wide">
            <ThisDayInHistoryCard historyData={thisDayHistory.data} unit={unit} />
          </div>
        )}

        {activeTab === 'historical' && visibleCharts.historicalComparison && (
          <div id="chart-historicalComparison" className="chart-card chart-card-wide">
            <HistoricalComparisonChart
              forecastData={data.forecast || []}
              historicalData={forecastComparison.data || []}
              unit={unit}
              height={300}
            />
          </div>
        )}

        {activeTab === 'historical' && visibleCharts.recordTemps && (
          <div id="chart-recordTemps" className="chart-card chart-card-wide">
            <RecordTemperaturesChart
              records={recordTemps.data?.records || []}
              unit={unit}
              height={300}
            />
          </div>
        )}

        {activeTab === 'historical' && visibleCharts.tempProbability && (
          <div id="chart-tempProbability" className="chart-card chart-card-wide">
            <TemperatureProbabilityChart
              probabilityData={tempProbability.data}
              unit={unit}
              height={300}
            />
          </div>
        )}
      </div>

      {/* No charts selected message */}
      {visibleChartCount === 0 && (
        <div className="no-charts-message">
          <p>📊 No charts selected</p>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Use the toggles above to show weather charts
          </p>
        </div>
      )}
    </>
  );
}

export default ChartsGrid;
