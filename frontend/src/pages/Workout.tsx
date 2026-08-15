import { useEffect, useState } from "react";
import "../index.css";
import { getWorkouts, addWorkout, deleteWorkout } from "../services/api";

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

const TEMPLATES = [
  {
    icon: "🏋️",
    name: "Push Day",
    desc: "Chest · Shoulders · Triceps",
    exercises: ["Bench Press", "Overhead Press", "Tricep Pushdown", "Lateral Raise"],
  },
  {
    icon: "🦾",
    name: "Pull Day",
    desc: "Back · Biceps · Rear Delts",
    exercises: ["Deadlift", "Pull-Ups", "Barbell Row", "Bicep Curl"],
  },
  {
    icon: "🦵",
    name: "Leg Day",
    desc: "Quads · Hamstrings · Calves",
    exercises: ["Squat", "Romanian Deadlift", "Leg Press", "Calf Raise"],
  },
  {
    icon: "⚡",
    name: "Full Body",
    desc: "All muscle groups",
    exercises: ["Squat", "Bench Press", "Barbell Row", "Overhead Press"],
  },
];

export default function Workout() {
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"log" | "templates">("log");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      setActiveTab("log");
      loadWorkouts();
    } catch (err) {
      console.error("Failed to add workout:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteWorkout(id);
      setWorkouts((ws) => ws.filter((w) => w.id !== id));
    } catch (err) {
      console.error("Failed to delete workout:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    setName(template.name);
    setSetRows(template.exercises.map(() => ({ reps: "3", weight: "0" })));
    setShowForm(true);
    setActiveTab("log");
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const calcVolume = (sets: WorkoutSet[]) =>
    sets.reduce((sum, s) => sum + s.reps * s.weight, 0);

  return (
    <div className="page-container page-enter">
      <div className="page-header">
        <h1>Workout</h1>
        <p>Log workouts and use templates for faster logging.</p>
      </div>

      <div className="section-card">
        {/* Tab bar */}
        <div className="tab-bar">
          <button
            className={`tab-btn ${activeTab === "log" ? "active" : ""}`}
            onClick={() => setActiveTab("log")}
          >
            📋 My Workouts
          </button>
          <button
            className={`tab-btn ${activeTab === "templates" ? "active" : ""}`}
            onClick={() => setActiveTab("templates")}
          >
            ⚡ Templates
          </button>
        </div>

        {/* TEMPLATES TAB */}
        {activeTab === "templates" && (
          <>
            <p className="subtext" style={{ marginBottom: 16 }}>
              Tap a template to instantly pre-fill your workout — then customise weights and hit Save.
            </p>
            <div className="templates-grid">
              {TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  className="template-card"
                  onClick={() => applyTemplate(t)}
                >
                  <div className="template-card-icon">{t.icon}</div>
                  <div className="template-card-name">{t.name}</div>
                  <div className="template-card-desc">{t.desc}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* LOG TAB */}
        {activeTab === "log" && (
          <>
            <div className="section-header" style={{ marginTop: 0 }}>
              <h2>Recent Workouts</h2>
              <button
                className="action-btn"
                onClick={() => setShowForm((s) => !s)}
              >
                {showForm ? "Cancel" : "+ Log Workout"}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className="workout-form">
                <input
                  placeholder="Exercise / workout name (e.g. Push Day)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                {setRows.map((row, i) => (
                  <div key={i} className="set-row">
                    <input
                      placeholder="Reps"
                      type="number"
                      value={row.reps}
                      onChange={(e) => updateSetRow(i, "reps", e.target.value)}
                    />
                    <input
                      placeholder="Weight (kg)"
                      type="number"
                      value={row.weight}
                      onChange={(e) => updateSetRow(i, "weight", e.target.value)}
                    />
                    {setRows.length > 1 && (
                      <button
                        type="button"
                        className="remove-set-btn"
                        onClick={() => removeSetRow(i)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                <button type="button" className="add-set-btn" onClick={addSetRow}>
                  + Add Set
                </button>

                <button className="primary-button" type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Workout"}
                </button>
              </form>
            )}

            <div className="workout-list">
              {loading && (
                <>
                  {[1, 2].map((i) => (
                    <div key={i} className="workout-card">
                      <div className="skeleton skeleton-text" style={{ marginBottom: 8 }} />
                      <div className="skeleton skeleton-text short" />
                    </div>
                  ))}
                </>
              )}
              {!loading && workouts.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">🏋️</div>
                  <p>No workouts logged yet. Try a template or log your first workout above.</p>
                </div>
              )}
              {!loading &&
                workouts.map((workout) => {
                  const volume = calcVolume(workout.sets);
                  return (
                    <div key={workout.id} className="workout-card">
                      <div className="workout-card-header">
                        <div className="workout-title">
                          <span style={{ fontSize: 18 }}>🏋️</span>
                          <h3>{workout.name}</h3>
                        </div>
                        <div className="workout-meta">
                          {volume > 0 && (
                            <span className="workout-volume">{volume.toLocaleString()}kg vol.</span>
                          )}
                          <span className="workout-date">📅 {formatDate(workout.date)}</span>
                          <button
                            className="workout-delete-btn"
                            onClick={() => handleDelete(workout.id)}
                            disabled={deletingId === workout.id}
                          >
                            {deletingId === workout.id ? "…" : "Delete"}
                          </button>
                        </div>
                      </div>

                      <div className="sets-list">
                        {workout.sets.map((set) => (
                          <span key={set.id} className="set-badge">
                            {set.reps} × {set.weight}kg
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
