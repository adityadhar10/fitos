interface CircularProgressProps {
  score: number;
  max?: number;
}

function CircularProgress({ score, max = 100 }: CircularProgressProps) {
  const percentage = (score / max) * 100;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 80) return "#4ade80"; // green
    if (percentage >= 50) return "#facc15"; // yellow
    return "#f87171"; // red
  };

  return (
    <div className="circular-progress">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="#252d28"
          strokeWidth="14"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="14"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 90 90)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="circular-progress-text">
        <h2>{score}</h2>
        <small>/ {max}</small>
      </div>
    </div>
  );
}

export default CircularProgress;