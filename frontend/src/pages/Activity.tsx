import { useEffect, useState } from "react";
import "../index.css";
import { getTodayMetrics } from "../services/api";

const STEP_GOAL = 10000;

export default function Activity() {
  const [steps, setSteps] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTodayMetrics()
      .then((res) => setSteps(res.data.metric.steps))
      .catch((err) => console.error("Failed to load activity data:", err))
      .finally(() => setLoading(false));
  }, []);

  // Rough estimates derived from steps (average ~0.04 kcal/step, ~1,700 steps per active minute)
  const caloriesBurned = Math.round(steps * 0.04);
  const activeMinutes = Math.round(steps / 100);
  const hours = Math.floor(activeMinutes / 60);
  const minutes = activeMinutes % 60;
  const activeTimeLabel = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  const ACTIVITIES = [
    { id: "steps", icon: "🏃", label: "Steps", value: steps.toLocaleString(), target: `/ ${STEP_GOAL.toLocaleString()}` },
    { id: "calories", icon: "🔥", label: "Calories Burned", value: `${caloriesBurned} kcal` },
    { id: "time", icon: "⏱️", label: "Active Time", value: activeTimeLabel },
  ];

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
                <strong>{loading ? "-" : act.value}</strong>
                {act.target && <span className="target">{act.target}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
