import { Link } from "react-router-dom";

const ACTIONS = [
  { to: "/nutrition", icon: "🥗", label: "Log Meal", desc: "Track calories & macros" },
  { to: "/workout", icon: "🏋️", label: "Workout", desc: "Log sets & exercises" },
  { to: "/activity", icon: "📱", label: "Track Steps", desc: "Live phone sensor" },
  { to: "/progress", icon: "⚖️", label: "Log Weight", desc: "Update body weight" },
];

export default function QuickActions() {
  return (
    <div className="quick-actions">
      <h2 className="quick-actions-title">Quick Actions</h2>
      <div className="quick-actions-grid">
        {ACTIONS.map((action) => (
          <Link key={action.to} to={action.to} className="quick-action-card">
            <span className="quick-action-icon">{action.icon}</span>
            <div>
              <strong>{action.label}</strong>
              <span>{action.desc}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
