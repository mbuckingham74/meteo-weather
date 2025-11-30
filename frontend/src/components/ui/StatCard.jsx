/**
 * StatCard - Display a weather statistic with icon, value, and label
 */
import Card from './Card';

function StatCard({ icon: Icon, label, value, unit = '', className = '' }) {
  return (
    <Card hover className={`text-center ${className}`}>
      {Icon && (
        <div className="flex justify-center mb-2">
          <Icon size={24} className="text-accent" strokeWidth={1.5} />
        </div>
      )}
      <p className="text-text-muted text-sm mb-1">{label}</p>
      <p className="text-2xl font-semibold text-text-primary">
        {value}
        {unit && <span className="text-lg text-text-secondary ml-1">{unit}</span>}
      </p>
    </Card>
  );
}

export default StatCard;
