import Skeleton from '../common/Skeleton';
import './AdminPanelSkeleton.css';

/**
 * AdminPanelSkeleton Component
 * Loading skeleton for the admin panel
 */
function AdminPanelSkeleton() {
  return (
    <div className="admin-panel-skeleton">
      {/* Header Skeleton */}
      <div className="admin-skeleton-header">
        <Skeleton variant="rect" width="250px" height="36px" />
        <Skeleton variant="rect" width="120px" height="36px" />
      </div>

      {/* Tabs Skeleton */}
      <div className="admin-skeleton-tabs">
        <Skeleton variant="rect" width="100px" height="40px" />
        <Skeleton variant="rect" width="80px" height="40px" />
        <Skeleton variant="rect" width="120px" height="40px" />
        <Skeleton variant="rect" width="90px" height="40px" />
        <Skeleton variant="rect" width="100px" height="40px" />
        <Skeleton variant="rect" width="110px" height="40px" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="admin-skeleton-stats-grid">
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>

      {/* Content Section Skeleton */}
      <div className="admin-skeleton-section">
        <Skeleton variant="rect" width="200px" height="28px" />
        <div className="admin-skeleton-table">
          <Skeleton variant="rect" height="40px" />
          <Skeleton variant="rect" height="30px" />
          <Skeleton variant="rect" height="30px" />
          <Skeleton variant="rect" height="30px" />
          <Skeleton variant="rect" height="30px" />
        </div>
      </div>
    </div>
  );
}

export default AdminPanelSkeleton;
