import '../index.css';

interface SettingItem {
  icon: string;
  label: string;
  value: string;
}

const PROFILE: SettingItem[] = [
  { icon: '👤', label: 'Name', value: 'Aditya' },
  { icon: '🎯', label: 'Fitness Goal', value: 'Build Muscle' },
  { icon: '👟', label: 'Daily Step Goal', value: '10,000' },
];

const PREFERENCES: SettingItem[] = [
  { icon: '🔔', label: 'Notifications', value: 'Enabled' },
  { icon: '🌙', label: 'Dark Mode', value: 'Enabled' },
  { icon: '🤖', label: 'AI Insights', value: 'Enabled' },
];

export default function Settings() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Settings ⚙️</h1>
        <p>Manage your FitOS preferences.</p>
      </div>

      {/* PROFILE SECTION */}
      <div className="section-card">
        <h2 className="section-title">Profile</h2>
        <div className="settings-list">
          {PROFILE.map((item, i) => (
            <div key={i} className="settings-item">
              <span className="label">
                <span className="icon">{item.icon}</span> {item.label}
              </span>
              <span className="value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PREFERENCES SECTION */}
      <div className="section-card">
        <h2 className="section-title">Preferences</h2>
        <div className="settings-list">
          {PREFERENCES.map((item, i) => (
            <div key={i} className="settings-item">
              <span className="label">
                <span className="icon">{item.icon}</span> {item.label}
              </span>
              <span className="badge">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}