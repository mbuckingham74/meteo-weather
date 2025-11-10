import Skeleton from './Skeleton';
import styles from './ChartSkeleton.module.css';

/**
 * ChartSkeleton Component
 * Loading placeholder for chart components
 * Provides a visual representation of a loading chart
 */
const ChartSkeleton = ({ height = '450px', showLegend = true, showTitle = true }) => {
  return (
    <div className={styles.container}>
      {/* Chart Title */}
      {showTitle && (
        <div className={styles.header}>
          <Skeleton width="300px" height="1.5rem" />
        </div>
      )}

      {/* Legend */}
      {showLegend && (
        <div className={styles.legend}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className={styles.legendItem}>
              <Skeleton width="12px" height="12px" variant="circular" />
              <Skeleton width="80px" height="1rem" />
            </div>
          ))}
        </div>
      )}

      {/* Chart Area */}
      <div className={styles.chart} style={{ height }}>
        {/* Y-Axis Labels */}
        <div className={styles.yAxis}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} width="40px" height="0.875rem" />
          ))}
        </div>

        {/* Chart Grid & Bars */}
        <div className={styles.grid}>
          {/* Grid Lines */}
          <div className={styles.gridLines}>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className={styles.gridLine} />
            ))}
          </div>

          {/* Bar Chart Representation */}
          <div className={styles.bars}>
            {Array.from({ length: 12 }).map((_, index) => {
              const randomHeight = Math.floor(Math.random() * 70) + 20; // Random height between 20-90%
              return (
                <div key={index} className={styles.barWrapper}>
                  <Skeleton
                    width="100%"
                    height={`${randomHeight}%`}
                    variant="rectangular"
                    style={{ borderRadius: '4px 4px 0 0' }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* X-Axis Labels */}
        <div className={styles.xAxis}>
          {Array.from({ length: 12 }).map((_, index) => (
            <Skeleton key={index} width="50px" height="0.875rem" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChartSkeleton;
