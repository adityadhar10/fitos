import { useEffect, useState } from "react";
import "../index.css";
import {
  getWeightHistory,
  addWeightEntry,
  getWorkouts,
  exportWorkoutCSV,
  exportNutritionCSV,
  exportWeightCSV,
} from "../services/api";
import WeightChart from "../components/WeightChart";
import MuscleHeatmap from "../components/MuscleHeatmap";

interface WeightEntry {
  id: string;
  weight: number;
  date: string;
}

interface WorkoutItem {
  id: string;
  name: string;
  muscleGroup?: string | null;
  date: string;
}

const GOAL_WEIGHT_KG = 70;

export default function Progress() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [weightInput, setWeightInput] = useState("");

  const loadEntries = () => {
    setLoading(true);
    Promise.all([getWeightHistory(), getWorkouts()])
      .then(([weightRes, workoutRes]) => {
        setEntries(weightRes.data.entries);
        setWorkouts(workoutRes.data.workouts);
      })
      .catch((err) => console.error("Failed to load progress data:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const currentWeight = sorted.length > 0 ? sorted[sorted.length - 1].weight : null;
  const startWeight = sorted.length > 0 ? sorted[0].weight : null;
  const totalChange =
    currentWeight !== null && startWeight !== null
      ? (currentWeight - startWeight).toFixed(1)
      : null;
  const direction = currentWeight !== null && currentWeight > GOAL_WEIGHT_KG ? "lose" : "gain";
  const remaining =
    currentWeight !== null ? Math.abs(currentWeight - GOAL_WEIGHT_KG).toFixed(1) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightInput) return;

    setSaving(true);
    try {
      await addWeightEntry(Number(weightInput));
      setWeightInput("");
      setShowForm(false);
      loadEntries();
    } catch (err) {
      console.error("Failed to log weight:", err);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (iso: string) => new Date(iso).toISOString().split("T")[0];

  const changeClass =
    totalChange === null
      ? "neutral"
      : Number(totalChange) < 0
      ? "positive"
      : Number(totalChange) > 0
      ? "negative"
      : "neutral";

  return (
    <div className="page-container page-enter">
      <div className="page-header">
        <h1>Progress</h1>
        <p>Muscle heatmap, weight trends, and your full training history.</p>
      </div>

      {/* ── Muscle Group Heatmap ── */}
      <div className="section-card">
        <div className="section-header">
          <h2>💪 Muscle Group Heatmap</h2>
          <span className="subtext" style={{ marginTop: 0 }}>Last 7 days</span>
        </div>
        {loading ? (
          <div className="skeleton" style={{ height: 300, borderRadius: 12 }} />
        ) : (
          <MuscleHeatmap workouts={workouts} />
        )}
      </div>

      {/* Stats row */}
      {!loading && currentWeight !== null && (
        <div className="weight-stats-row">
          <div className="weight-stat-item">
            <div className="weight-stat-label">Current</div>
            <div className="weight-stat-value neutral">{currentWeight}kg</div>
          </div>
          <div className="weight-stat-item">
            <div className="weight-stat-label">Goal</div>
            <div className="weight-stat-value neutral">{GOAL_WEIGHT_KG}kg</div>
          </div>
          <div className="weight-stat-item">
            <div className="weight-stat-label">Total Change</div>
            <div className={`weight-stat-value ${changeClass}`}>
              {totalChange !== null
                ? `${Number(totalChange) > 0 ? "+" : ""}${totalChange}kg`
                : "—"}
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="section-card">
        <div className="section-header">
          <h2>📈 Weight Chart</h2>
          <button className="action-btn" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ Log Weight"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input
              placeholder="Weight (kg)"
              type="number"
              step="0.1"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              required
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                flex: 1,
                background: "#0f1511",
                border: "1px solid #252d28",
                color: "#fff",
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </form>
        )}

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "8px 0" }}>
            <div className="skeleton" style={{ height: 200, borderRadius: 10 }} />
          </div>
        ) : (
          <WeightChart entries={entries} goalWeight={GOAL_WEIGHT_KG} />
        )}

        {!loading && currentWeight !== null && remaining !== null && (
          <p className="subtext" style={{ marginTop: 12, textAlign: "center" }}>
            {remaining}kg to {direction} to reach your {GOAL_WEIGHT_KG}kg goal ·{" "}
            {entries.length} {entries.length === 1 ? "entry" : "entries"} logged
          </p>
        )}
      </div>

      {/* History list */}
      <div className="section-card">
        <div className="section-header">
          <h2>⚖️ History</h2>
          <span className="subtext" style={{ marginTop: 0 }}>
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        <div className="history-list">
          {loading && (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="history-item">
                  <div className="skeleton skeleton-text" />
                  <div className="skeleton skeleton-text short" />
                </div>
              ))}
            </>
          )}
          {!loading && entries.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">⚖️</div>
              <p>No entries yet. Log your first weight above.</p>
            </div>
          )}
          {!loading &&
            [...sorted].reverse().map((entry) => (
              <div key={entry.id} className="history-item">
                <span className="history-date">{formatDate(entry.date)}</span>
                <strong className="history-weight">{entry.weight}kg</strong>
              </div>
            ))}
        </div>
      </div>

      {/* ── Export Data (Phase 7) ── */}
      <div className="section-card">
        <div className="section-header">
          <h2>📥 Export Your Fitness Data</h2>
          <span className="subtext" style={{ marginTop: 0 }}>Download CSV reports</span>
        </div>
        <p className="subtext" style={{ marginBottom: 16 }}>
          Take your data anywhere. Export complete logs for spreadsheet analysis, coaching reviews, or backups.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <button
            className="tab-btn active"
            style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 10, cursor: "pointer" }}
            onClick={() => exportWorkoutCSV().catch((err) => alert("Failed to export: " + err.message))}
          >
            <span>🏋️</span> Workouts CSV
          </button>
          <button
            className="tab-btn active"
            style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 10, cursor: "pointer" }}
            onClick={() => exportNutritionCSV().catch((err) => alert("Failed to export: " + err.message))}
          >
            <span>🥗</span> Nutrition CSV
          </button>
          <button
            className="tab-btn active"
            style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 10, cursor: "pointer" }}
            onClick={() => exportWeightCSV().catch((err) => alert("Failed to export: " + err.message))}
          >
            <span>⚖️</span> Weight Log CSV
          </button>
        </div>
      </div>
    </div>
  );
}
