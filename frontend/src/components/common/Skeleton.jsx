import styles from './Skeleton.module.css';

/**
 * Skeleton Component
 * Displays loading placeholder with shimmer animation
 * CSS Modules Migration: Phase 1.1
 *
 * @param {Object} props
 * @param {string} props.variant - Type: 'text', 'rect', 'circle', 'card'
 * @param {string} props.width - Width (e.g., '100%', '200px')
 * @param {string} props.height - Height (e.g., '20px', '100px')
 * @param {number} props.count - Number of skeleton items to render (default: 1)
 */
function Skeleton({ variant = 'text', width, height, count = 1 }) {
  const getClassName = () => {
    const classes = [styles.skeleton, styles[variant]];
    return classes.join(' ');
  };

  const getStyle = () => {
    const style = {};
    if (width) style.width = width;
    if (height) style.height = height;
    return style;
  };

  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className={getClassName()} style={getStyle()} />
        ))}
      </>
    );
  }

  return <div className={getClassName()} style={getStyle()} />;
}

export default Skeleton;
