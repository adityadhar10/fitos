import '../index.css';

interface ActivityStat {
  id: string;
  icon: string;
  label: string;
  value: string;
  target?: string;
}

const ACTIVITIES: ActivityStat[] = [
  { id: 'steps', icon: '🏃', label: 'Steps', value: '8,420', target: '/ 10,000' },
  { id: 'calories', icon: '🔥', label: 'Calories Burned', value: '420 kcal' },
  { id: 'time', icon: '⏱️', label: 'Active Time', value: '1h 25m' },
];

export default function Activity() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Activity</h1>
        <p>Track your daily activity and movement.</p>
      </div>

      <div className="section-card">
        <h2 className="section-title">Today's Activity</h2>

        <div className="activity-grid">
          {ACTIVITIES.map((act) => (
            <div key={act.id} className="activity-card">
              <div className="card-title">
                <span className="icon">{act.icon}</span>
                <span>{act.label}</span>
              </div>
              <div className="activity-value">
                <strong>{act.value}</strong>
                {act.target && <span className="target">{act.target}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}