import { Grid as LayoutGrid, Surface } from '@components/ui/primitives';
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
import styles from './ChartsGrid.module.css';

function ChartCard({ id, wide = false, children }) {
  const className = wide ? `${styles.chartCard} ${styles.chartCardWide}` : styles.chartCard;

  return (
    <Surface as="section" id={id} padding="lg" radius="lg" elevation="md" className={className}>
      {children}
    </Surface>
  );
}

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
      <LayoutGrid
        id="weather-charts"
        tabIndex={-1}
        columns={{ base: 1, lg: 2 }}
        gap="lg"
        className={styles.grid}
      >
        {/* FORECAST TAB */}
        {activeTab === 'forecast' && visibleCharts.hourly && (
          <ChartCard id="chart-hourly" wide>
            <HourlyForecastChart
              hourlyData={hourlyData.data?.hourly || []}
              unit={unit}
              height={300}
            />
          </ChartCard>
        )}

        {activeTab === 'forecast' && visibleCharts.temperature && (
          <ChartCard id="chart-temperature">
            <TemperatureBandChart data={data.forecast || []} unit={unit} height={300} days={days} />
          </ChartCard>
        )}

        {activeTab === 'forecast' && visibleCharts.precipitation && (
          <ChartCard id="chart-precipitation">
            <PrecipitationChart data={data.forecast || []} height={300} days={days} />
          </ChartCard>
        )}

        {activeTab === 'forecast' && visibleCharts.wind && (
          <ChartCard id="chart-wind">
            <WindChart data={data.forecast || []} height={300} days={days} />
          </ChartCard>
        )}

        {/* DETAILS TAB */}
        {activeTab === 'details' && visibleCharts.cloudCover && (
          <ChartCard id="chart-cloudCover">
            <CloudCoverChart data={data.forecast || []} height={300} days={days} />
          </ChartCard>
        )}

        {activeTab === 'details' && visibleCharts.uvIndex && (
          <ChartCard id="chart-uvIndex">
            <UVIndexChart data={data.forecast || []} height={300} days={days} />
          </ChartCard>
        )}

        {activeTab === 'forecast' && visibleCharts.overview && (
          <ChartCard id="chart-overview" wide>
            <WeatherOverviewChart data={data.forecast || []} unit={unit} height={320} days={days} />
          </ChartCard>
        )}

        {/* Enhanced Weather Charts */}
        {activeTab === 'details' && visibleCharts.humidityDew && (
          <ChartCard id="chart-humidityDew">
            <HumidityDewpointChart
              data={data.forecast || []}
              unit={unit}
              days={days}
              height={300}
            />
          </ChartCard>
        )}

        {activeTab === 'details' && visibleCharts.sunriseSunset && (
          <ChartCard id="chart-sunriseSunset">
            <SunChart data={data.forecast || []} days={days} height={300} />
          </ChartCard>
        )}

        {activeTab === 'details' && visibleCharts.feelsLike && (
          <ChartCard id="chart-feelsLike">
            <FeelsLikeChart data={data.forecast || []} unit={unit} days={days} height={300} />
          </ChartCard>
        )}

        {activeTab === 'air-quality' && visibleCharts.airQuality && data.location && (
          <ChartCard id="chart-airQuality">
            <AirQualityCard latitude={data.location.latitude} longitude={data.location.longitude} />
          </ChartCard>
        )}

        {/* Historical/Climate Charts */}
        {activeTab === 'historical' && visibleCharts.thisDayHistory && (
          <ChartCard id="chart-thisDayHistory" wide>
            <ThisDayInHistoryCard historyData={thisDayHistory.data} unit={unit} />
          </ChartCard>
        )}

        {activeTab === 'historical' && visibleCharts.historicalComparison && (
          <ChartCard id="chart-historicalComparison" wide>
            <HistoricalComparisonChart
              forecastData={data.forecast || []}
              historicalData={forecastComparison.data || []}
              unit={unit}
              height={300}
            />
          </ChartCard>
        )}

        {activeTab === 'historical' && visibleCharts.recordTemps && (
          <ChartCard id="chart-recordTemps" wide>
            <RecordTemperaturesChart
              records={recordTemps.data?.records || []}
              unit={unit}
              height={300}
            />
          </ChartCard>
        )}

        {activeTab === 'historical' && visibleCharts.tempProbability && (
          <ChartCard id="chart-tempProbability" wide>
            <TemperatureProbabilityChart
              probabilityData={tempProbability.data}
              unit={unit}
              height={300}
            />
          </ChartCard>
        )}
      </LayoutGrid>

      {/* No charts selected message */}
      {visibleChartCount === 0 && (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>📊 No charts selected</p>
          <p className={styles.emptySubtitle}>Use the toggles above to show weather charts</p>
        </div>
      )}
    </>
  );
}

export default ChartsGrid;
