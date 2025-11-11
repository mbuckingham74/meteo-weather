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
import useBreakpoint from '../../../hooks/useBreakpoint';
import ChartSkeleton from '../../common/ChartSkeleton';
import ErrorMessage from '../../common/ErrorMessage';

function ChartCard({ id, wide = false, padding = 'lg', children }) {
  const className = wide ? `${styles.chartCard} ${styles.chartCardWide}` : styles.chartCard;

  return (
    <Surface
      as="section"
      id={id}
      padding={padding}
      radius="lg"
      elevation="md"
      className={className}
    >
      {children}
    </Surface>
  );
}

const ChartLoader = ({ isLoading, height = 300, children }) => {
  if (isLoading) {
    return <ChartSkeleton height={height} />;
  }
  return children;
};

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
  const breakpoint = useBreakpoint();
  const isCompactViewport = breakpoint === 'base' || breakpoint === 'xs' || breakpoint === 'sm';
  const gridGap = isCompactViewport ? 'md' : 'lg';
  const cardPadding = isCompactViewport ? 'md' : 'lg';
  const hourlyLoading = hourlyData?.loading;
  const hourlySeries = hourlyData?.data?.hourly || [];
  const thisDayLoading = thisDayHistory?.loading;
  const thisDayError = thisDayHistory?.error;
  const refetchThisDay = thisDayHistory?.refetch;
  const forecastComparisonLoading = forecastComparison?.loading;
  const forecastComparisonError = forecastComparison?.error;
  const refetchForecastComparison = forecastComparison?.refetch;
  const recordTempsLoading = recordTemps?.loading;
  const recordTempsError = recordTemps?.error;
  const refetchRecordTemps = recordTemps?.refetch;
  const probabilityLoading = tempProbability?.loading;
  const probabilityError = tempProbability?.error;
  const refetchProbability = tempProbability?.refetch;

  return (
    <>
      <LayoutGrid
        id="weather-charts"
        tabIndex={-1}
        columns={{ base: 1, lg: 2 }}
        gap={gridGap}
        className={styles.grid}
      >
        {/* FORECAST TAB */}
        {activeTab === 'forecast' && visibleCharts.hourly && (
          <ChartCard id="chart-hourly" wide padding={cardPadding}>
            <ChartLoader isLoading={hourlyLoading}>
              <HourlyForecastChart hourlyData={hourlySeries} unit={unit} height={300} />
            </ChartLoader>
          </ChartCard>
        )}

        {activeTab === 'forecast' && visibleCharts.temperature && (
          <ChartCard id="chart-temperature" padding={cardPadding}>
            <TemperatureBandChart data={data.forecast || []} unit={unit} height={300} days={days} />
          </ChartCard>
        )}

        {activeTab === 'forecast' && visibleCharts.precipitation && (
          <ChartCard id="chart-precipitation" padding={cardPadding}>
            <PrecipitationChart data={data.forecast || []} height={300} days={days} />
          </ChartCard>
        )}

        {activeTab === 'forecast' && visibleCharts.wind && (
          <ChartCard id="chart-wind" padding={cardPadding}>
            <WindChart data={data.forecast || []} height={300} days={days} />
          </ChartCard>
        )}

        {/* DETAILS TAB */}
        {activeTab === 'details' && visibleCharts.cloudCover && (
          <ChartCard id="chart-cloudCover" padding={cardPadding}>
            <CloudCoverChart data={data.forecast || []} height={300} days={days} />
          </ChartCard>
        )}

        {activeTab === 'details' && visibleCharts.uvIndex && (
          <ChartCard id="chart-uvIndex" padding={cardPadding}>
            <UVIndexChart data={data.forecast || []} height={300} days={days} />
          </ChartCard>
        )}

        {activeTab === 'forecast' && visibleCharts.overview && (
          <ChartCard id="chart-overview" wide padding={cardPadding}>
            <WeatherOverviewChart data={data.forecast || []} unit={unit} height={320} days={days} />
          </ChartCard>
        )}

        {/* Enhanced Weather Charts */}
        {activeTab === 'details' && visibleCharts.humidityDew && (
          <ChartCard id="chart-humidityDew" padding={cardPadding}>
            <HumidityDewpointChart
              data={data.forecast || []}
              unit={unit}
              days={days}
              height={300}
            />
          </ChartCard>
        )}

        {activeTab === 'details' && visibleCharts.sunriseSunset && (
          <ChartCard id="chart-sunriseSunset" padding={cardPadding}>
            <SunChart data={data.forecast || []} days={days} height={300} />
          </ChartCard>
        )}

        {activeTab === 'details' && visibleCharts.feelsLike && (
          <ChartCard id="chart-feelsLike" padding={cardPadding}>
            <FeelsLikeChart data={data.forecast || []} unit={unit} days={days} height={300} />
          </ChartCard>
        )}

        {activeTab === 'air-quality' && visibleCharts.airQuality && data.location && (
          <ChartCard id="chart-airQuality" padding={cardPadding}>
            <AirQualityCard latitude={data.location.latitude} longitude={data.location.longitude} />
          </ChartCard>
        )}

        {/* Historical/Climate Charts */}
        {activeTab === 'historical' && visibleCharts.thisDayHistory && (
          <ChartCard id="chart-thisDayHistory" wide padding={cardPadding}>
            <ChartLoader isLoading={thisDayLoading} height={350}>
              {thisDayError ? (
                <ErrorMessage
                  error={thisDayError}
                  mode="inline"
                  showSuggestions={false}
                  onRetry={refetchThisDay}
                />
              ) : (
                <ThisDayInHistoryCard historyData={thisDayHistory.data} unit={unit} />
              )}
            </ChartLoader>
          </ChartCard>
        )}

        {activeTab === 'historical' && visibleCharts.historicalComparison && (
          <ChartCard id="chart-historicalComparison" wide padding={cardPadding}>
            <ChartLoader isLoading={forecastComparisonLoading} height={300}>
              {forecastComparisonError ? (
                <ErrorMessage
                  error={forecastComparisonError}
                  mode="inline"
                  showSuggestions={false}
                  onRetry={refetchForecastComparison}
                  retryLabel="Retry comparison"
                />
              ) : (
                <HistoricalComparisonChart
                  forecastData={data.forecast || []}
                  historicalData={forecastComparison.data || []}
                  unit={unit}
                  height={300}
                />
              )}
            </ChartLoader>
          </ChartCard>
        )}

        {activeTab === 'historical' && visibleCharts.recordTemps && (
          <ChartCard id="chart-recordTemps" wide padding={cardPadding}>
            <ChartLoader isLoading={recordTempsLoading} height={300}>
              {recordTempsError ? (
                <ErrorMessage
                  error={recordTempsError}
                  mode="inline"
                  showSuggestions={false}
                  onRetry={refetchRecordTemps}
                  retryLabel="Retry loading records"
                />
              ) : (
                <RecordTemperaturesChart
                  records={recordTemps.data?.records || []}
                  unit={unit}
                  height={300}
                />
              )}
            </ChartLoader>
          </ChartCard>
        )}

        {activeTab === 'historical' && visibleCharts.tempProbability && (
          <ChartCard id="chart-tempProbability" wide padding={cardPadding}>
            <ChartLoader isLoading={probabilityLoading} height={300}>
              {probabilityError ? (
                <ErrorMessage
                  error={probabilityError}
                  mode="inline"
                  showSuggestions={false}
                  onRetry={refetchProbability}
                  retryLabel="Retry probability"
                />
              ) : (
                <TemperatureProbabilityChart
                  probabilityData={tempProbability.data}
                  unit={unit}
                  height={300}
                />
              )}
            </ChartLoader>
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
