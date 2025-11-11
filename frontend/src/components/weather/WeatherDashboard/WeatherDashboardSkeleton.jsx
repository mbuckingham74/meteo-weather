import Skeleton from '../../common/Skeleton';
import ChartSkeleton from '../../common/ChartSkeleton';

function WeatherDashboardSkeleton() {
  return (
    <div className="dashboard-skeleton">
      <div className="dashboard-skeleton__hero">
        <div className="dashboard-skeleton__hero-left">
          <Skeleton width="60%" height="2rem" />
          <Skeleton width="40%" height="1.25rem" />
          <div className="dashboard-skeleton__hero-temp">
            <Skeleton width="140px" height="4.5rem" />
            <Skeleton width="120px" height="1.5rem" />
          </div>
          <div className="dashboard-skeleton__stats">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={`stat-${index}`} variant="card" />
            ))}
          </div>
        </div>
        <div className="dashboard-skeleton__hero-right">
          <Skeleton width="100%" height="220px" />
        </div>
      </div>
      <div className="dashboard-skeleton__charts">
        <ChartSkeleton height="320px" />
        <ChartSkeleton height="320px" />
      </div>
    </div>
  );
}

export default WeatherDashboardSkeleton;
