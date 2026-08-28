import { Link } from "react-router-dom";
import { Utensils, Dumbbell, Footprints, Scale } from "lucide-react";

const ACTIONS = [
  { to: "/nutrition", icon: Utensils, label: "Log Meal", desc: "Track calories & macros" },
  { to: "/workout", icon: Dumbbell, label: "Workout", desc: "Log sets & exercises" },
  { to: "/activity", icon: Footprints, label: "Track Steps", desc: "Live phone sensor" },
  { to: "/progress", icon: Scale, label: "Log Weight", desc: "Update body weight" },
];

export default function QuickActions() {
  return (
    <div className="quick-actions">
      <h2 className="quick-actions-title">Quick Actions</h2>
      <div className="quick-actions-grid">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.to} to={action.to} className="quick-action-card">
              <span className="quick-action-icon">
                <Icon size={20} />
              </span>
              <div>
                <strong>{action.label}</strong>
                <span>{action.desc}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
