interface StatCardProps {
  icon: string;
  title: string;
  value: string;
  unit: string;
  target: string;
}

function StatCard({
  icon,
  title,
  value,
  unit,
  target,
}: StatCardProps) {
  return (
    <div className="stat-card">

      {/* Title */}

      <div className="stat-title">
        <span className="stat-icon">{icon}</span>
        <span>{title}</span>
      </div>


      {/* Main Value */}

      <div className="stat-value">
        <strong>{value}</strong>
        <span>{unit}</span>
      </div>


      {/* Progress Information */}

      <div className="stat-target">

        <span className="taken-label">
          Taken
        </span>

        <span className="target-value">
          Target: {target}
        </span>

      </div>

    </div>
  );
}

export default StatCard;