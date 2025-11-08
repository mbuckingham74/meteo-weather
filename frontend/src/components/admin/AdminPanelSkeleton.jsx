import Skeleton from '../common/Skeleton';
import styles from './AdminPanelSkeleton.module.css';

/**
 * AdminPanelSkeleton Component
 * Loading skeleton for the admin panel
 * CSS Modules Migration: Phase 1.1 - Batch 2
 */
function AdminPanelSkeleton() {
  return (
    <div className={styles.container}>
      {/* Header Skeleton */}
      <div className={styles.header}>
        <Skeleton variant="rect" width="250px" height="36px" />
        <Skeleton variant="rect" width="120px" height="36px" />
      </div>

      {/* Tabs Skeleton */}
      <div className={styles.tabs}>
        <Skeleton variant="rect" width="100px" height="40px" />
        <Skeleton variant="rect" width="80px" height="40px" />
        <Skeleton variant="rect" width="120px" height="40px" />
        <Skeleton variant="rect" width="90px" height="40px" />
        <Skeleton variant="rect" width="100px" height="40px" />
        <Skeleton variant="rect" width="110px" height="40px" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className={styles.statsGrid}>
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>

      {/* Content Section Skeleton */}
      <div className={styles.section}>
        <Skeleton variant="rect" width="200px" height="28px" />
        <div className={styles.table}>
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
