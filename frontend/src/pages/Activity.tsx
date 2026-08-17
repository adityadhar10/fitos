import { useEffect, useState } from "react";
import "../index.css";
import { getTodayMetrics, updateTodayMetrics } from "../services/api";
import AutoStepTracker from "../components/AutoStepTracker";
import { DEFAULT_STEP_GOAL, DEFAULT_SLEEP_GOAL } from "../constants/goals";

export default function Activity() {
  const [steps, setSteps] = useState(0);
  const [sleepHours, setSleepHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [stepsInput, setStepsInput] = useState("");
  const [sleepInput, setSleepInput] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = () => {
    setLoading(true);
    getTodayMetrics()
      .then((res) => {
        setSteps(res.data.metric.steps);
        setSleepHours(res.data.metric.sleepHours);
      })
      .catch((err) => console.error("Failed to load activity data:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const caloriesBurned = Math.round(steps * 0.04);
  const activeMinutes = Math.round(steps / 100);
  const hours = Math.floor(activeMinutes / 60);
  const minutes = activeMinutes % 60;
  const activeTimeLabel = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  const stepsPct = Math.min(100, Math.round((steps / DEFAULT_STEP_GOAL) * 100));
  const sleepPct = Math.min(100, Math.round((sleepHours / DEFAULT_SLEEP_GOAL) * 100));

  const circumference = 2 * Math.PI * 52; // r=52
  const stepsOffset = circumference - (stepsPct / 100) * circumference;
  const sleepOffset = circumference - (sleepPct / 100) * circumference;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateTodayMetrics(
        stepsInput ? Number(stepsInput) : undefined,
        sleepInput ? Number(sleepInput) : undefined
      );
      setStepsInput("");
      setSleepInput("");
      setShowForm(false);
      loadData();
    } catch (err) {
      console.error("Failed to update metrics:", err);
    } finally {
      setSaving(false);
    }
  };

  const recoveryScore = Math.round((stepsPct + sleepPct) / 2);

  const ACTIVITY_STATS = [
    { id: "calories", icon: "🔥", label: "Calories Burned", value: `${caloriesBurned} kcal` },
    { id: "time",     icon: "⏱️", label: "Active Time",     value: activeTimeLabel },
  ];

  return (
    <div className="page-container page-enter">
      <div className="page-header">
        <h1>Activity ⚡</h1>
        <p>Real-time movement detection, automatic step counter, and sleep tracker.</p>
      </div>

      {/* ── Real-Time Auto Step Sensor Tracker ── */}
      {!loading && (
        <AutoStepTracker
          initialSteps={steps}
          onStepsChange={(newSteps) => setSteps(newSteps)}
        />
      )}

      {/* ── Recovery score ── */}
      {!loading && (
        <div className="recovery-score-card">
          <div>
            <h2>Recovery Score</h2>
            <p>Based on movement and sleep today</p>
          </div>
          <div className="recovery-score-value">
            <strong>{recoveryScore}</strong>
            <span>/ 100</span>
          </div>
          <div className="recovery-score-bar">
            <div className="recovery-score-fill" style={{ width: `${recoveryScore}%` }} />
          </div>
        </div>
      )}

      {/* ── Ring cards ── */}
      <div className="activity-rings-row">
        {/* Steps ring */}
        <div className="activity-ring-card">
          <p className="activity-ring-label">Steps</p>
          <div className="activity-ring-wrapper">
            <svg viewBox="0 0 120 120" className="activity-ring-svg">
              <circle className="ring-bg" cx="60" cy="60" r="52" />
              <circle
                className="ring-fill ring-steps"
                cx="60"
                cy="60"
                r="52"
                style={{ strokeDasharray: circumference, strokeDashoffset: loading ? circumference : stepsOffset }}
              />
            </svg>
            <div className="activity-ring-inner">
              <strong>{loading ? "–" : steps.toLocaleString()}</strong>
              <span>/ {DEFAULT_STEP_GOAL.toLocaleString()}</span>
            </div>
          </div>
          <p className="activity-ring-pct">{loading ? "" : `${stepsPct}%`}</p>
        </div>

        {/* Sleep ring */}
        <div className="activity-ring-card">
          <p className="activity-ring-label">Sleep</p>
          <div className="activity-ring-wrapper">
            <svg viewBox="0 0 120 120" className="activity-ring-svg">
              <circle className="ring-bg" cx="60" cy="60" r="52" />
              <circle
                className="ring-fill ring-sleep"
                cx="60"
                cy="60"
                r="52"
                style={{ strokeDasharray: circumference, strokeDashoffset: loading ? circumference : sleepOffset }}
              />
            </svg>
            <div className="activity-ring-inner">
              <strong>{loading ? "–" : `${sleepHours}h`}</strong>
              <span>/ {DEFAULT_SLEEP_GOAL}h</span>
            </div>
          </div>
          <p className="activity-ring-pct">{loading ? "" : `${sleepPct}%`}</p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="section-card">
        <h2 className="section-title">Today's Stats</h2>
        <div className="activity-grid">
          {ACTIVITY_STATS.map((act) => (
            <div key={act.id} className="activity-card">
              <div className="card-title">
                <span className="icon">{act.icon}</span>
                <span>{act.label}</span>
              </div>
              <div className="activity-value">
                <strong>{loading ? "–" : act.value}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Update form ── */}
      <div className="section-card">
        <div className="section-header">
          <h2>Update Activity</h2>
          <button className="action-btn" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "Edit"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSave} style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input
              placeholder="Steps (e.g. 8000)"
              type="number"
              value={stepsInput}
              onChange={(e) => setStepsInput(e.target.value)}
              className="metric-input"
            />
            <input
              placeholder="Sleep hrs (e.g. 7.5)"
              type="number"
              step="0.1"
              value={sleepInput}
              onChange={(e) => setSleepInput(e.target.value)}
              className="metric-input"
            />
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
