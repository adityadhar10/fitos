import '../index.css';

interface StatItem {
  id: string;
  icon: string;
  label: string;
  value: string;
  target: string;
}

interface ActivityDay {
  day: string;
  height: string;
}

const STATS_DATA: StatItem[] = [
  { id: 'calories', icon: '🔥', label: 'Calories', value: '2,180', target: '/ 2,400 kcal' },
  { id: 'protein', icon: '🥩', label: 'Protein', value: '142g', target: '/ 160g' },
  { id: 'steps', icon: '🏃', label: 'Steps', value: '8,420', target: '/ 10,000' },
  { id: 'sleep', icon: '😴', label: 'Sleep', value: '7.2h', target: '/ 8h' },
];

const WEEKLY_DATA: ActivityDay[] = [
  { day: 'Mon', height: '45%' },
  { day: 'Tue', height: '65%' },
  { day: 'Wed', height: '80%' },
  { day: 'Thu', height: '55%' },
  { day: 'Fri', height: '70%' },
  { day: 'Sat', height: '90%' },
  { day: 'Sun', height: '60%' },
];

export default function Dashboard() {
  return (
    <div className="dashboard">
      {/* HEADER */}
      <div className="dashboard-header">
        <h1>Good morning 👋</h1>
        <p>Your fitness overview for today</p>
      </div>

      {/* FITNESS SCORE CARD */}
      <div className="fitness-score">
        <div className="fitness-score-header">
          <h2>Fitness Score</h2>
        </div>

        <div className="fitness-score-content">
          <div className="score-ring">
            <svg viewBox="0 0 140 140">
              <circle className="bg" cx="70" cy="70" r="60" />
              <circle className="progress" cx="70" cy="70" r="60" />
            </svg>
            <div className="score-number">
              <strong>87</strong>
              <span>/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* STAT CARDS GRID */}
      <div className="stats-grid">
        {STATS_DATA.map((stat) => (
          <div key={stat.id} className="stat-card">
            <div className="stat-title">
              <span className="stat-icon">{stat.icon}</span> {stat.label}
            </div>
            <div className="stat-value">
              <strong>{stat.value}</strong>
              <span>{stat.target}</span>
            </div>
          </div>
        ))}
      </div>

      {/* WEEKLY ACTIVITY */}
      <div className="weekly-chart">
        <div className="weekly-chart-header">
          <h2>Weekly Activity</h2>
          <p>Steps over the last 7 days</p>
        </div>

        <div className="chart-area">
          <div className="chart-y-axis">
            <span>12k</span>
            <span>9k</span>
            <span>6k</span>
            <span>3k</span>
            <span>0</span>
          </div>

          <div className="chart-content">
            <div className="chart-grid">
              <div />
              <div />
              <div />
              <div />
              <div />
            </div>

            <div className="bars">
              {WEEKLY_DATA.map((item) => (
                <div key={item.day} className="bar-column">
                  <div className="activity-bar" style={{ height: item.height }} />
                  <span>{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}