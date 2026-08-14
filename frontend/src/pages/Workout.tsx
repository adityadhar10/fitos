import { useEffect, useState } from "react";
import "../index.css";
import { getWorkouts, addWorkout } from "../services/api";

interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
}

interface WorkoutItem {
  id: string;
  name: string;
  date: string;
  sets: WorkoutSet[];
}

export default function Workout() {
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [setRows, setSetRows] = useState([{ reps: "", weight: "" }]);

  const loadWorkouts = () => {
    setLoading(true);
    getWorkouts()
      .then((res) => setWorkouts(res.data.workouts))
      .catch((err) => console.error("Failed to load workouts:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const updateSetRow = (index: number, field: "reps" | "weight", value: string) => {
    setSetRows((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const addSetRow = () => setSetRows((rows) => [...rows, { reps: "", weight: "" }]);

  const removeSetRow = (index: number) =>
    setSetRows((rows) => rows.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validSets = setRows
      .filter((r) => r.reps && r.weight)
      .map((r) => ({ reps: Number(r.reps), weight: Number(r.weight) }));

    if (!name || validSets.length === 0) return;

    setSaving(true);
    try {
      await addWorkout(name, validSets);
      setName("");
      setSetRows([{ reps: "", weight: "" }]);
      setShowForm(false);
      loadWorkouts();
    } catch (err) {
      console.error("Failed to add workout:", err);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (iso: string) => new Date(iso).toISOString().split("T")[0];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Workout</h1>
        <p>Log and review your workouts.</p>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h2>Recent Workouts</h2>
          <button className="action-btn" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ Log Workout"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: "grid", gap: 10 }}>
            <input
              placeholder="Exercise name (e.g. Bench Press)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ padding: 8, borderRadius: 8 }}
            />

            {setRows.map((row, i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <input
                  placeholder="Reps"
                  type="number"
                  value={row.reps}
                  onChange={(e) => updateSetRow(i, "reps", e.target.value)}
                  style={{ padding: 8, borderRadius: 8, flex: 1 }}
                />
                <input
                  placeholder="Weight (kg)"
                  type="number"
                  value={row.weight}
                  onChange={(e) => updateSetRow(i, "weight", e.target.value)}
                  style={{ padding: 8, borderRadius: 8, flex: 1 }}
                />
                {setRows.length > 1 && (
                  <button type="button" onClick={() => removeSetRow(i)} style={{ padding: "0 12px" }}>
                    ✕
                  </button>
                )}
              </div>
            ))}

            <button type="button" onClick={addSetRow} style={{ justifySelf: "start" }}>
              + Add Set
            </button>

            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Workout"}
            </button>
          </form>
        )}

        <div className="workout-list">
          {loading && <p>Loading workouts...</p>}
          {!loading && workouts.length === 0 && <p>No workouts logged yet.</p>}
          {!loading &&
            workouts.map((workout) => (
              <div key={workout.id} className="workout-card">
                <div className="workout-card-header">
                  <div className="workout-title">
                    <span className="icon">🏋️</span>
                    <h3>{workout.name}</h3>
                  </div>
                  <span className="workout-date">📅 {formatDate(workout.date)}</span>
                </div>

                <div className="sets-list">
                  {workout.sets.map((set) => (
                    <span key={set.id} className="set-badge">
                      {set.reps} reps @ {set.weight}kg
                    </span>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
