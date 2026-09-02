import { useEffect, useState } from "react";
import "../index.css";
import { getWorkouts, addWorkout, deleteWorkout, getWorkoutPRs, getWorkoutSuggestions, getRoutineTemplates } from "../services/api";
import RestTimer from "../components/RestTimer";
import PRCelebrationModal from "../components/PRCelebrationModal";
import RoutineGeneratorModal from "../components/RoutineGeneratorModal";
import OneRepMaxCalculator from "../components/OneRepMaxCalculator";
import {
  Dumbbell,
  ArrowUpFromLine,
  Footprints,
  Users,
  Trophy,
  Sparkles,
  Play,
  X,
  Calculator,
  TrendingUp,
} from "lucide-react";

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

interface PRItem {
  name: string;
  maxWeight: number;
  repsAtMaxWeight: number;
  bestEstimated1RM: number;
  maxSessionVolume: number;
}

interface MuscleRecoveryItem {
  muscle: string;
  status: string;
  score: number;
  hoursAgo: number | null;
  label: string;
}

interface WorkoutSuggestion {
  exercise: string;
  lastSessionDate: string;
  lastTopWeight: number;
  lastAvgReps: number;
  suggestedWeight: number;
  suggestedReps: number;
  recommendation: string;
}

interface RoutineTemplate {
  id: string;
  name: string;
  description: string;
  daysPerWeek: number;
  splitType: string;
  schedule: {
    day: string;
    exercises: {
      name: string;
      sets: number;
      reps: string;
      muscleGroup?: string;
    }[];
  }[];
}

const TEMPLATES = [
  {
    icon: Dumbbell,
    name: "Push Day",
    desc: "Chest · Shoulders · Triceps",
    muscleGroup: "Chest, Shoulders, Triceps",
    exercises: ["Bench Press", "Overhead Press", "Tricep Pushdown", "Lateral Raise"],
  },
  {
    icon: ArrowUpFromLine,
    name: "Pull Day",
    desc: "Back · Biceps · Rear Delts",
    muscleGroup: "Back, Biceps",
    exercises: ["Deadlift", "Pull-Ups", "Barbell Row", "Bicep Curl"],
  },
  {
    icon: Footprints,
    name: "Leg Day",
    desc: "Quads · Hamstrings · Calves",
    muscleGroup: "Legs",
    exercises: ["Squat", "Romanian Deadlift", "Leg Press", "Calf Raise"],
  },
  {
    icon: Users,
    name: "Full Body",
    desc: "All muscle groups",
    muscleGroup: "Full Body",
    exercises: ["Squat", "Bench Press", "Barbell Row", "Overhead Press"],
  },
];

export default function Workout() {
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([]);
  const [prs, setPrs] = useState<PRItem[]>([]);
  const [muscleRecovery, setMuscleRecovery] = useState<MuscleRecoveryItem[]>([]);
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[]>([]);
  const [celebrationPR, setCelebrationPR] = useState<{ exerciseName: string; weight: number; reps: number } | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"log" | "routines" | "strength_matrix">("log");
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [routineTemplates, setRoutineTemplates] = useState<RoutineTemplate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [setRows, setSetRows] = useState([{ reps: "", weight: "" }]);

  const loadData = () => {
    setLoading(true);
    Promise.all([getWorkouts(), getWorkoutPRs(), getRoutineTemplates(), getWorkoutSuggestions()])
      .then(([workoutsRes, prsRes, routinesRes, suggestionsRes]) => {
        setWorkouts(workoutsRes.data.workouts);
        setPrs(prsRes.data.prs || []);
        setMuscleRecovery(prsRes.data.muscleRecovery || []);
        setRoutineTemplates(routinesRes.data.routines || []);
        setSuggestions(suggestionsRes.data.suggestions || []);
      })
      .catch((err) => console.error("Failed to load workouts & PRs:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
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
      const existingPR = prs.find((p) => p.name.trim().toLowerCase() === name.trim().toLowerCase());
      const maxSubmittedWeight = Math.max(...validSets.map((s) => s.weight));
      const setWithMaxWeight = validSets.find((s) => s.weight === maxSubmittedWeight);

      if (maxSubmittedWeight > 0 && (!existingPR || maxSubmittedWeight > existingPR.maxWeight)) {
        setCelebrationPR({
          exerciseName: name,
          weight: maxSubmittedWeight,
          reps: setWithMaxWeight ? setWithMaxWeight.reps : 1,
        });
      }

      await addWorkout(name, validSets, muscleGroup || undefined);
      setName("");
      setMuscleGroup("");
      setSetRows([{ reps: "", weight: "" }]);
      setShowForm(false);
      setActiveTab("log");
      loadData();
    } catch (err) {
      console.error("Failed to add workout:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      await deleteWorkout(id);
      setWorkouts((ws) => ws.filter((w) => w.id !== id));
    } catch (err: unknown) {
      console.error("Failed to delete workout:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartCustomWorkout = (workoutData: { name: string; muscleGroup: string; exercises: string[] }) => {
    setName(workoutData.name);
    setMuscleGroup(workoutData.muscleGroup || "");
    setSetRows(workoutData.exercises.map(() => ({ reps: "8", weight: "0" })));
    setShowForm(true);
    setActiveTab("log");
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const calcVolume = (sets: WorkoutSet[]) =>
    sets.reduce((sum, s) => sum + s.reps * s.weight, 0);

  return (
    <div className="page-container page-enter">
      {celebrationPR && (
        <PRCelebrationModal
          exerciseName={celebrationPR.exerciseName}
          weight={celebrationPR.weight}
          reps={celebrationPR.reps}
          onClose={() => setCelebrationPR(null)}
        />
      )}

      <div className="page-header">
        <h1>Workout</h1>
        <p>Real-time set logging, gym rest timer, personal records, and recovery tracking.</p>
      </div>

      {/* ── TIER 1: CURRENT STATUS & READINESS ── */}
      {(muscleRecovery.length > 0 || prs.length > 0) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {muscleRecovery.length > 0 && (
            <div className="section-card">
              <div className="section-header" style={{ marginBottom: 12 }}>
                <div>
                  <h2 className="section-title">Muscle Recovery Readiness</h2>
                  <p className="subtext" style={{ margin: 0 }}>
                    Estimated muscle freshness based on your recent workout dates
                  </p>
                </div>
              </div>
              <div className="recovery-grid">
                {muscleRecovery.map((m) => {
                  const statusClass = m.status === "Fatigued" ? "fatigued" : m.status === "Recovering" ? "recovering" : "fresh";
                  return (
                    <div key={m.muscle} className={`recovery-card ${statusClass}`}>
                      <div className="recovery-header">
                        <strong className="recovery-muscle-name">{m.muscle}</strong>
                        <span className={`recovery-status-badge ${statusClass}`}>
                          {m.status === "Fatigued" ? "Fatigued" : m.status === "Recovering" ? "Recovering" : "Fresh"}
                        </span>
                      </div>
                      <span className="recovery-time">
                        {m.hoursAgo !== null ? `${m.hoursAgo}h ago` : "Ready to train"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {prs.length > 0 && (
            <div className="section-card">
              <div className="section-header" style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Trophy size={18} color="#facc15" />
                  <div>
                    <h2 className="section-title">Personal Records (PRs)</h2>
                    <p className="subtext" style={{ margin: 0 }}>
                      Your all-time max weight and estimated 1RM benchmarks
                    </p>
                  </div>
                </div>
              </div>
              <div className="pr-grid">
                {prs.slice(0, 4).map((pr) => (
                  <div key={pr.name} className="pr-card">
                    <div>
                      <h3 className="pr-title">{pr.name}</h3>
                      <span className="pr-est-1rm">Est. 1RM: {pr.bestEstimated1RM}kg</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <strong className="pr-weight-value">{pr.maxWeight}kg</strong>
                      <span className="pr-reps-count">× {pr.repsAtMaxWeight}r</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TIER 2: WHAT TO DO NEXT (TIMER & LOGGING) ── */}
      <RestTimer />

      {showRoutineModal && (
        <RoutineGeneratorModal
          onStartWorkout={handleStartCustomWorkout}
          onClose={() => setShowRoutineModal(false)}
        />
      )}

      <div className="section-card">
        <div className="tab-bar">
          <button
            className={`tab-btn ${activeTab === "log" ? "active" : ""}`}
            onClick={() => setActiveTab("log")}
          >
            My Workouts
          </button>
          <button
            className={`tab-btn ${activeTab === "routines" ? "active" : ""}`}
            onClick={() => setActiveTab("routines")}
          >
            AI Routine Splits
          </button>
          <button
            className={`tab-btn ${activeTab === "strength_matrix" ? "active" : ""}`}
            onClick={() => setActiveTab("strength_matrix")}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Calculator size={14} /> 1RM Strength Matrix
          </button>
        </div>

        {activeTab === "strength_matrix" && <OneRepMaxCalculator />}

        {activeTab === "routines" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
              <div>
                <h2 className="section-title">Training Splits & AI Generator</h2>
                <p className="subtext" style={{ margin: "2px 0 0 0" }}>
                  Pre-built scientific splits or let FitOS AI build a tailored routine for your gear
                </p>
              </div>
              <button
                type="button"
                className="primary-button"
                onClick={() => setShowRoutineModal(true)}
                style={{ padding: "8px 14px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
              >
                <Sparkles size={14} /> Generate Custom Split with AI
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {routineTemplates.map((r) => (
                <div key={r.id} className="routine-split-card">
                  <div className="routine-split-header">
                    <h3 className="routine-split-title">{r.name}</h3>
                    <span className="routine-split-badge">
                      {r.daysPerWeek} Days / wk ({r.splitType})
                    </span>
                  </div>
                  <p className="routine-split-desc">{r.description}</p>

                  <div className="routine-days-grid">
                    {r.schedule.map((day, dIdx) => (
                      <div key={dIdx} className="routine-day-card">
                        <div>
                          <strong className="routine-day-title">{day.day}</strong>
                          <div className="routine-day-exercises">
                            {day.exercises.map((ex, eIdx) => (
                              <span key={eIdx} className="routine-day-exercise-item">
                                • {ex.name} ({ex.sets} × {ex.reps})
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="tab-btn active"
                          onClick={() =>
                            handleStartCustomWorkout({
                              name: day.day,
                              muscleGroup: day.exercises[0]?.muscleGroup || "Full Body",
                              exercises: day.exercises.map((e) => e.name),
                            })
                          }
                          style={{ width: "100%", padding: "6px", fontSize: 11, fontWeight: 700, borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
                        >
                          <Play size={12} /> Start This Workout
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "log" && (
          <>
            {!showForm && (
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Quick Start Templates</h2>
                <div className="quick-template-grid">
                  {TEMPLATES.map((template) => {
                    const Icon = template.icon;
                    return (
                      <button
                        key={template.name}
                        type="button"
                        onClick={() =>
                          handleStartCustomWorkout({
                            name: template.name,
                            muscleGroup: template.muscleGroup,
                            exercises: template.exercises,
                          })
                        }
                        className="quick-template-btn"
                      >
                        <Icon size={18} color="#4ade80" />
                        <strong className="quick-template-name">{template.name}</strong>
                        <span className="quick-template-desc">{template.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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

                <select
                  value={muscleGroup}
                  onChange={(e) => setMuscleGroup(e.target.value)}
                  className="workout-select-field"
                >
                  <option value="">Target Muscle Group (Auto-detect / Optional)</option>
                  <option value="Chest">Chest</option>
                  <option value="Back">Back / Lats</option>
                  <option value="Shoulders">Shoulders</option>
                  <option value="Arms">Arms (Biceps & Triceps)</option>
                  <option value="Legs">Legs (Quads, Glutes & Hamstrings)</option>
                  <option value="Core">Core / Abs</option>
                  <option value="Full Body">Full Body</option>
                </select>

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
                        <X size={14} />
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
                  <Dumbbell className="empty-icon" size={32} />
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
                          <Dumbbell size={18} />
                          <h3>{workout.name}</h3>
                        </div>
                        <div className="workout-meta">
                          {volume > 0 && (
                            <span className="workout-volume">{volume.toLocaleString()}kg vol.</span>
                          )}
                          <span className="workout-date">{formatDate(workout.date)}</span>
                          {confirmDeleteId === workout.id ? (
                            <>
                              <button
                                className="workout-delete-btn confirm"
                                onClick={() => handleDelete(workout.id)}
                                disabled={deletingId === workout.id}
                              >
                                {deletingId === workout.id ? "Deleting…" : "Confirm?"}
                              </button>
                              <button
                                className="workout-delete-btn cancel"
                                onClick={() => setConfirmDeleteId(null)}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              className="workout-delete-btn"
                              onClick={() => setConfirmDeleteId(workout.id)}
                              disabled={deletingId === workout.id}
                            >
                              Delete
                            </button>
                          )}
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

      {/* ── TIER 3: TRAINING ANALYSIS & SUGGESTIONS ── */}
      {suggestions.length > 0 && (
        <div className="section-card">
          <div className="section-header" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={18} color="#4ade80" />
              <div>
                <h2 className="section-title">Progressive Overload Suggestions</h2>
                <p className="subtext" style={{ margin: 0 }}>
                  Data-driven targets for your next session, based on your last workout per exercise
                </p>
              </div>
            </div>
          </div>
          <div className="suggestion-list">
            {suggestions.slice(0, 5).map((s) => (
              <div key={s.exercise} className="suggestion-card">
                <div className="suggestion-header">
                  <strong className="suggestion-exercise-name">{s.exercise}</strong>
                  <span className="suggestion-target-value">
                    {s.suggestedWeight}kg × {s.suggestedReps}
                  </span>
                </div>
                <p className="suggestion-rec-text">{s.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
