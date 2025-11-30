/**
 * Card - Reusable card component with variants
 */

function Card({ children, className = '', hover = false, ...props }) {
  const baseClasses = hover ? 'card-hover' : 'card';

  return (
    <div className={`${baseClasses} ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
