import '../index.css';

interface WeightEntry {
  date: string;
  weight: string;
}

const WEIGHT_HISTORY: WeightEntry[] = [
  { date: '2026-07-15', weight: '76kg' },
  { date: '2026-07-22', weight: '75.4kg' },
  { date: '2026-07-29', weight: '75kg' },
  { date: '2026-08-05', weight: '74.5kg' },
  { date: '2026-08-12', weight: '74kg' },
];

export default function Progress() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Progress</h1>
        <p>Track your weight and long-term progress.</p>
      </div>

      {/* CURRENT WEIGHT */}
      <div className="section-card">
        <div className="card-title">
          <span className="icon">⚖️</span>
          <h2>Current Weight</h2>
        </div>
        <div className="weight-display">
          <strong>74kg</strong>
          <span className="target">/ 70kg goal</span>
        </div>
        <p className="subtext">4.0kg to lose to reach your goal</p>
      </div>

      {/* WEIGHT HISTORY */}
      <div className="section-card">
        <div className="card-title">
          <span className="icon">📈</span>
          <h2>Weight History</h2>
        </div>

        <div className="history-list">
          {WEIGHT_HISTORY.map((entry, index) => (
            <div key={index} className="history-item">
              <span className="history-date">📅 {entry.date}</span>
              <strong className="history-weight">{entry.weight}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}