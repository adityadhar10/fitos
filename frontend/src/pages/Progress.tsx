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
import PredictiveWeightChart from "../components/PredictiveWeightChart";
import { Scale, Dumbbell, Utensils } from "lucide-react";

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

      {/* ── TIER 1: CURRENT STATUS & WEIGHT TRACKING ── */}
      {!loading && currentWeight !== null && (
        <div className="weight-stats-row">
          <div className="weight-stat-item">
            <div className="weight-stat-label">Current Weight</div>
            <div className="weight-stat-value neutral">{currentWeight}kg</div>
          </div>
          <div className="weight-stat-item">
            <div className="weight-stat-label">Target Goal</div>
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

      <div className="section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">Weight Progress</h2>
            <p className="subtext" style={{ margin: 0 }}>Historical weigh-in trend line</p>
          </div>
          <button className="action-btn" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ Log Weight"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="progress-form">
            <input
              placeholder="Weight in kg (e.g. 72.5)"
              type="number"
              step="0.1"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              required
              className="progress-input"
            />
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </form>
        )}

        {loading ? (
          <div className="skeleton" style={{ height: 200, borderRadius: 10, margin: "8px 0" }} />
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

      {/* ── TIER 2: MUSCLE GROUP ACTIVATION ── */}
      <div className="section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">Muscle Group Heatmap</h2>
            <p className="subtext" style={{ margin: 0 }}>Training volume distribution across the last 7 days</p>
          </div>
        </div>
        {loading ? (
          <div className="skeleton" style={{ height: 300, borderRadius: 12 }} />
        ) : (
          <MuscleHeatmap workouts={workouts} />
        )}
      </div>

      {/* ── TIER 3: TRENDS, FORECAST & DATA EXPORT ── */}
      {!loading && entries.length > 0 && (
        <PredictiveWeightChart
          entries={entries}
          goalWeight={GOAL_WEIGHT_KG}
          calorieDeficitDaily={-350}
        />
      )}

      <div className="section-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">Weigh-In History</h2>
            <p className="subtext" style={{ margin: 0 }}>
              {entries.length} {entries.length === 1 ? "entry" : "entries"} logged
            </p>
          </div>
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
              <Scale className="empty-icon" size={24} />
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

      <div className="section-card">
        <div className="section-header" style={{ marginBottom: 4 }}>
          <div>
            <h2 className="section-title">Export Fitness Data</h2>
            <p className="subtext" style={{ margin: 0 }}>Download spreadsheet CSV reports</p>
          </div>
        </div>
        <p className="subtext" style={{ marginBottom: 16 }}>
          Take your data anywhere. Export complete logs for spreadsheet analysis, coaching reviews, or backups.
        </p>
        <div className="export-grid">
          <button
            type="button"
            className="export-tile-btn"
            onClick={() => exportWorkoutCSV().catch((err) => alert("Failed to export: " + err.message))}
          >
            <Dumbbell size={15} /> Workouts CSV
          </button>
          <button
            type="button"
            className="export-tile-btn"
            onClick={() => exportNutritionCSV().catch((err) => alert("Failed to export: " + err.message))}
          >
            <Utensils size={15} /> Nutrition CSV
          </button>
          <button
            type="button"
            className="export-tile-btn"
            onClick={() => exportWeightCSV().catch((err) => alert("Failed to export: " + err.message))}
          >
            <Scale size={15} /> Weight Log CSV
          </button>
        </div>
      </div>
    </div>
  );
}
