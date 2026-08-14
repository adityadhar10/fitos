import { useEffect, useState } from "react";
import "../index.css";
import { getWeightHistory, addWeightEntry } from "../services/api";

interface WeightEntry {
  id: string;
  weight: number;
  date: string;
}

const GOAL_WEIGHT_KG = 70;

export default function Progress() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [weightInput, setWeightInput] = useState("");

  const loadEntries = () => {
    setLoading(true);
    getWeightHistory()
      .then((res) => setEntries(res.data.entries))
      .catch((err) => console.error("Failed to load weight history:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const currentWeight = entries.length > 0 ? entries[entries.length - 1].weight : null;
  const diff = currentWeight !== null ? Math.abs(currentWeight - GOAL_WEIGHT_KG).toFixed(1) : null;
  const direction = currentWeight !== null && currentWeight > GOAL_WEIGHT_KG ? "lose" : "gain";

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

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Progress</h1>
        <p>Track your weight and long-term progress.</p>
      </div>

      <div className="section-card">
        <div className="card-title">
          <span className="icon">⚖️</span>
          <h2>Current Weight</h2>
        </div>

        {loading && <p>Loading...</p>}

        {!loading && currentWeight === null && (
          <p className="subtext">No weight logged yet. Add your first entry below.</p>
        )}

        {!loading && currentWeight !== null && (
          <>
            <div className="weight-display">
              <strong>{currentWeight}kg</strong>
              <span className="target">/ {GOAL_WEIGHT_KG}kg goal</span>
            </div>
            <p className="subtext">
              {diff}kg to {direction} to reach your goal
            </p>
          </>
        )}

        <button className="action-btn" style={{ marginTop: 16 }} onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ Log Weight"}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <input
              placeholder="Weight (kg)"
              type="number"
              step="0.1"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              required
              style={{ padding: 8, borderRadius: 8, flex: 1 }}
            />
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </form>
        )}
      </div>

      <div className="section-card">
        <div className="card-title">
          <span className="icon">📈</span>
          <h2>Weight History</h2>
        </div>

        <div className="history-list">
          {loading && <p>Loading...</p>}
          {!loading && entries.length === 0 && <p>No entries yet.</p>}
          {!loading &&
            [...entries].reverse().map((entry) => (
              <div key={entry.id} className="history-item">
                <span className="history-date">{formatDate(entry.date)}</span>
                <strong className="history-weight">{entry.weight}kg</strong>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
