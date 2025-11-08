import Skeleton from './Skeleton';
import './ChartSkeleton.css';

/**
 * ChartSkeleton Component
 * Loading placeholder for chart components
 * Provides a visual representation of a loading chart
 */
const ChartSkeleton = ({ height = '450px', showLegend = true, showTitle = true }) => {
  return (
    <div className="chart-skeleton-container">
      {/* Chart Title */}
      {showTitle && (
        <div className="chart-skeleton-header">
          <Skeleton width="300px" height="1.5rem" />
        </div>
      )}

      {/* Legend */}
      {showLegend && (
        <div className="chart-skeleton-legend">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="chart-skeleton-legend-item">
              <Skeleton width="12px" height="12px" variant="circular" />
              <Skeleton width="80px" height="1rem" />
            </div>
          ))}
        </div>
      )}

      {/* Chart Area */}
      <div className="chart-skeleton-chart" style={{ height }}>
        {/* Y-Axis Labels */}
        <div className="chart-skeleton-y-axis">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} width="40px" height="0.875rem" />
          ))}
        </div>

        {/* Chart Grid & Bars */}
        <div className="chart-skeleton-grid">
          {/* Grid Lines */}
          <div className="chart-skeleton-grid-lines">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="chart-skeleton-grid-line" />
            ))}
          </div>

          {/* Bar Chart Representation */}
          <div className="chart-skeleton-bars">
            {Array.from({ length: 12 }).map((_, index) => {
              const randomHeight = Math.floor(Math.random() * 70) + 20; // Random height between 20-90%
              return (
                <div key={index} className="chart-skeleton-bar-wrapper">
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
        <div className="chart-skeleton-x-axis">
          {Array.from({ length: 12 }).map((_, index) => (
            <Skeleton key={index} width="50px" height="0.875rem" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChartSkeleton;
