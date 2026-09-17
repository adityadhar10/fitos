const fs = require('fs');

const jsx = `
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
import React, { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Dumbbell, 
  Trophy, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  Calculator, 
  Users 
} from "lucide-react";
import RestTimer from "../components/RestTimer";
import ExercisePicker from "../components/ExercisePicker";
import PRCelebrationModal from "../components/PRCelebrationModal";
import WorkoutAnalysisModal from "../components/WorkoutAnalysisModal";
import RoutineGeneratorModal from "../components/RoutineGeneratorModal";
import OneRepMaxCalculator from "../components/OneRepMaxCalculator";
import { 
  getWorkoutSessions,
  addWorkoutSession, 
  deleteWorkout, 
  getWorkoutPRs, 
  analyzeWorkout, 
  getTrainingAdvice 
} from "../services/api";
import { getWorkoutMuscleInfo, TEMPLATES } from "../data/exercises";
import "../pages/Workout.css"; // We will add a small CSS file for any specific things if needed, or rely on inline

export default function Workout() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [prs, setPrs] = useState<any[]>([]);
  const [muscleRecovery, setMuscleRecovery] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [sessionName, setSessionName] = useState("");
  const [formExercises, setFormExercises] = useState([
    { id: "ex_1", name: "", muscleGroup: "", sets: [{ reps: "", weight: "" }] },
  ]);

  // UI Modals
  const [celebrationPR, setCelebrationPR] = useState(null);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [analysisWorkout, setAnalysisWorkout] = useState(null);
  
  // AI Coach State
  const [isAdvising, setIsAdvising] = useState(false);
  const [adviceResult, setAdviceResult] = useState<any>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([getWorkoutSessions(), getWorkoutPRs()])
      .then(([sessionsRes, prsRes]) => {
        setSessions(sessionsRes.data.sessions || []);
        setPrs(prsRes.data.prs || []);
        setMuscleRecovery(prsRes.data.muscleRecovery || []);
      })
      .catch((err) => console.error("Failed to load workout data:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const addExerciseToForm = () => {
    setFormExercises((prev) => [
      ...prev,
      { id: "ex_" + Date.now(), name: "", muscleGroup: "", sets: [{ reps: "", weight: "" }] },
    ]);
  };

  const removeExerciseFromForm = (exIdx: number) => {
    setFormExercises((prev) => prev.filter((_, i) => i !== exIdx));
  };

  const addSetToExercise = (exIdx: number) => {
    setFormExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx ? { ...ex, sets: [...ex.sets, { reps: "", weight: "" }] } : ex
      )
    );
  };

  const removeSetFromExercise = (exIdx: number, setIdx: number) => {
    setFormExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx ? { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) } : ex
      )
    );
  };

  const updateExerciseName = (exIdx: number, name: string, muscleGroup?: string) => {
    setFormExercises((prev) =>
      prev.map((ex, i) => (i === exIdx ? { ...ex, name, muscleGroup: muscleGroup || ex.muscleGroup } : ex))
    );
  };

  const updateSetField = (exIdx: number, setIdx: number, field: "reps" | "weight", value: string) => {
    setFormExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx
          ? {
              ...ex,
              sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, [field]: value } : s)),
            }
          : ex
      )
    );
  };

  const handleStartCustomWorkout = (template: any) => {
    setSessionName(template.name);
    setFormExercises(
      template.exercises.map((exName: string, i: number) => {
        const info = getWorkoutMuscleInfo(exName);
        return {
          id: "ex_" + Date.now() + "_" + i,
          name: exName,
          muscleGroup: info.category,
          sets: [{ reps: "", weight: "" }, { reps: "", weight: "" }, { reps: "", weight: "" }],
        };
      })
    );
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitSession = async (e: React.FormEvent) => {
    e.preventDefault();

    const validExercises = formExercises
      .map((ex) => ({
        ...ex,
        validSets: ex.sets
          .filter((s) => s.reps && s.weight)
          .map((s) => ({ reps: Number(s.reps), weight: Number(s.weight) })),
      }))
      .filter((ex) => ex.name.trim() !== "" && ex.validSets.length > 0);

    if (validExercises.length === 0) return;

    setSaving(true);
    try {
      const finalName = sessionName.trim() || "Workout Session";
      const exercisesPayload = validExercises.map(ex => ({
        name: ex.name,
        muscleGroup: ex.muscleGroup || undefined,
        sets: ex.validSets
      }));

      await addWorkoutSession(finalName, new Date().toISOString(), exercisesPayload);

      // Check for PR locally to show modal
      let prToCelebrate = null;
      for (const ex of validExercises) {
        const existingPR = prs.find((p) => p.name.trim().toLowerCase() === ex.name.trim().toLowerCase());
        const maxWeight = Math.max(...ex.validSets.map((s) => s.weight));
        const setAtMax = ex.validSets.find((s) => s.weight === maxWeight);
        if (maxWeight > 0 && (!existingPR || maxWeight > existingPR.maxWeight)) {
          if (!prToCelebrate) {
            prToCelebrate = { exerciseName: ex.name, weight: maxWeight, reps: setAtMax ? setAtMax.reps : 1 };
          }
        }
      }
      if (prToCelebrate) setCelebrationPR(prToCelebrate);

      setSessionName("");
      setFormExercises([{ id: "ex_1", name: "", muscleGroup: "", sets: [{ reps: "", weight: "" }] }]);
      setShowForm(false);
      loadData();
    } catch (err) {
      console.error("Failed to save workout session:", err);
      alert("Failed to save workout.");
    } finally {
      setSaving(false);
    }
  };

  const handleGetAdvice = async () => {
    setIsAdvising(true);
    try {
      const res = await getTrainingAdvice();
      setAdviceResult(res.data);
    } catch (e) {
      console.error(e);
      alert("Failed to get training advice.");
    } finally {
      setIsAdvising(false);
    }
  };

  return (
    <div className="page-container page-enter" style={{ padding: "26px 30px", gap: 24, display: "flex", flexDirection: "column" }}>
      
      {/* 1. HEADER */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1>Workout</h1>
          <p>Log workouts, track strength progress, and stay on top of recovery.</p>
        </div>
      </div>

      {/* 2. CURRENT STATUS */}
      <div className="section-card">
        <div className="section-header">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={18} color="var(--primary-accent)" />
            <h2 className="section-title">Current Status</h2>
          </div>
        </div>
        
        {muscleRecovery.length === 0 ? (
          <p style={{ color: "var(--text-muted)", margin: 0 }}>Not enough recent workout data.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
            {muscleRecovery.map((m) => {
              const statusClass = m.status === "Fatigued" ? "fatigued" : m.status === "Recovering" ? "recovering" : "fresh";
              const actionableStatus = m.status === "Fatigued" ? "Rest Needed" : m.status === "Recovering" ? "1 Day Left" : "Ready to Train";
              const advice = m.status === "Fatigued" ? "Still recovering" : m.status === "Recovering" ? "Almost recovered" : "Ready";
              return (
                <div key={m.muscle} className={\`recovery-card \${statusClass}\`} style={{ display: "flex", flexDirection: "column", padding: 16, background: "var(--bg-elevated)", border: "1px solid var(--border-color)", borderRadius: 12 }}>
                  <strong style={{ fontSize: 14, color: "var(--text-primary)", marginBottom: 8 }}>{m.muscle}</strong>
                  <span style={{ fontSize: 13, fontWeight: "bold", marginBottom: 4 }} className={\`recovery-status-badge \${statusClass}\`}>{actionableStatus}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{advice}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. QUICK ACTIONS & TEMPLATES */}
      <div className="section-card">
        <h2 className="section-title" style={{ marginBottom: 16 }}>Quick Actions</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24, alignItems: "center" }}>
          <button className="action-btn primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel Logging" : "+ Log Workout"}
          </button>
          <button className="action-btn secondary" onClick={() => {
            const timerEl = document.getElementById("timer-section");
            if (timerEl) timerEl.scrollIntoView({ behavior: "smooth" });
          }}>
            Start Rest Timer
          </button>
        </div>
        
        <h3 className="section-title" style={{ fontSize: 16, marginBottom: 16 }}>Templates</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {TEMPLATES.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.name}
                type="button"
                onClick={() => handleStartCustomWorkout(template)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-start", padding: 16,
                  background: "var(--bg-elevated)", border: "1px solid var(--border-color)", borderRadius: 12,
                  cursor: "pointer", textAlign: "left", transition: "border-color 0.2s"
                }}
                className="quick-template-btn"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Icon size={16} color="var(--primary-accent)" />
                  <strong style={{ fontSize: 14, color: "var(--text-primary)" }}>{template.name}</strong>
                </div>
                <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>{template.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. WORKOUT LOGGING (REDESIGN) */}
      {showForm && (
        <div className="section-card" style={{ border: "2px solid var(--primary-accent)", background: "var(--bg-panel)" }}>
          <h2 className="section-title" style={{ marginBottom: 16 }}>Log Workout</h2>
          <form onSubmit={handleSubmitSession} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <input
              type="text"
              placeholder="Workout Session Name (Optional)"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="workout-input"
              style={{ fontSize: 18, fontWeight: "bold", padding: "12px 16px", background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: 8, color: "var(--text-primary)" }}
            />

            {formExercises.map((exercise, exIdx) => (
              <div key={exercise.id} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, fontSize: 16 }}>
                    <Dumbbell size={16} color="var(--primary-accent)" />
                    Exercise {exIdx + 1}
                  </h3>
                  {formExercises.length > 1 && (
                    <button type="button" onClick={() => removeExerciseFromForm(exIdx)} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: "bold" }}>
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <ExercisePicker
                    value={exercise.name}
                    selectedCategory={exercise.muscleGroup}
                    onSelect={(selected) => updateExerciseName(exIdx, selected.name, selected.category)}
                  />
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 300 }}>
                    <thead>
                      <tr style={{ color: "var(--text-muted)", fontSize: 12, textAlign: "left", borderBottom: "1px solid var(--border-color)" }}>
                        <th style={{ padding: "8px", width: "10%" }}>Set</th>
                        <th style={{ padding: "8px", width: "40%" }}>Weight (kg)</th>
                        <th style={{ padding: "8px", width: "40%" }}>Reps</th>
                        <th style={{ padding: "8px", width: "10%", textAlign: "right" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {exercise.sets.map((set, setIdx) => (
                        <tr key={setIdx} style={{ borderBottom: "1px solid var(--border-color)" }}>
                          <td style={{ padding: "8px", fontWeight: "bold", color: "var(--text-secondary)", fontSize: 13 }}>{setIdx + 1}</td>
                          <td style={{ padding: "8px" }}>
                            <input
                              type="number"
                              placeholder="0"
                              value={set.weight}
                              onChange={(e) => updateSetField(exIdx, setIdx, "weight", e.target.value)}
                              style={{ width: "100%", padding: "8px 12px", background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: 6, color: "var(--text-primary)", fontSize: 14 }}
                            />
                          </td>
                          <td style={{ padding: "8px" }}>
                            <input
                              type="number"
                              placeholder="0"
                              value={set.reps}
                              onChange={(e) => updateSetField(exIdx, setIdx, "reps", e.target.value)}
                              style={{ width: "100%", padding: "8px 12px", background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: 6, color: "var(--text-primary)", fontSize: 14 }}
                            />
                          </td>
                          <td style={{ padding: "8px", textAlign: "right" }}>
                            {exercise.sets.length > 1 && (
                              <button type="button" onClick={() => removeSetFromExercise(exIdx, setIdx)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}>
                                <X size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <button type="button" onClick={() => addSetToExercise(exIdx)} style={{ marginTop: 12, background: "transparent", border: "1px dashed var(--border-color)", color: "var(--text-secondary)", padding: "8px 16px", borderRadius: 6, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: "500" }}>
                  + Add Set
                </button>
              </div>
            ))}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button type="button" onClick={addExerciseToForm} style={{ flex: "1 1 150px", padding: "14px", background: "var(--bg-elevated)", border: "1px solid var(--border-color)", color: "var(--text-primary)", borderRadius: 8, cursor: "pointer", fontWeight: "bold", fontSize: 14 }}>
                + Add Exercise
              </button>
              <button type="submit" disabled={saving} style={{ flex: "2 1 200px", padding: "14px", background: "var(--primary-accent)", border: "none", color: "#000", borderRadius: 8, cursor: "pointer", fontWeight: "bold", fontSize: 14 }}>
                {saving ? "Saving..." : "Save Workout"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REST TIMER */}
      <div id="timer-section">
        <RestTimer />
      </div>

      {/* 5. HISTORY & PROGRESS */}
      <div className="section-card">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <Trophy size={18} color="#facc15" />
          <h2 className="section-title">History & Progress</h2>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32 }}>
          
          {/* Recent Sessions */}
          <div>
            <h3 className="section-title" style={{ fontSize: 15, marginBottom: 16, color: "var(--text-secondary)" }}>Recent Workouts</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {sessions.length > 0 ? sessions.map((session) => {
                const totalVolume = session.workouts?.reduce((sum: number, w: any) => sum + w.sets.reduce((sSum: number, s: any) => sSum + s.weight * s.reps, 0), 0) || 0;
                return (
                  <div key={session.id} style={{ background: "var(--bg-elevated)", borderRadius: 12, padding: 20, border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 16, color: "var(--text-primary)", fontWeight: "600" }}>{session.name}</h3>
                        <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: 12 }}>
                          {new Date(session.date).toLocaleDateString()} • {session.workouts?.length || 0} exercises • {totalVolume.toLocaleString()} kg
                        </p>
                      </div>
                      <button 
                        onClick={() => setAnalysisWorkout(session)}
                        style={{ background: "transparent", color: "var(--primary-accent)", border: "1px solid var(--primary-accent)", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: "bold", display: "flex", alignItems: "center", gap: 4 }}
                      >
                        <Sparkles size={12} /> Analyze
                      </button>
                    </div>
                    
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {session.workouts?.map((w: any, i: number) => (
                        <span key={i} style={{ background: "var(--bg-input)", padding: "4px 8px", borderRadius: 6, fontSize: 11, color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}>
                          {w.name} ({w.sets.length} sets)
                        </span>
                      ))}
                    </div>
                  </div>
                );
              }) : (
                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No recent workouts found.</p>
              )}
            </div>
          </div>

          {/* Personal Records */}
          <div>
            <h3 className="section-title" style={{ fontSize: 15, marginBottom: 16, color: "var(--text-secondary)" }}>Personal Records</h3>
            {prs.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                {prs.map((pr) => (
                  <div key={pr.name} style={{ background: "var(--bg-elevated)", padding: 16, borderRadius: 12, border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ margin: "0 0 4px 0", fontSize: 14, color: "var(--text-primary)", fontWeight: "500" }}>{pr.name}</h3>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Est. 1RM: {pr.bestEstimated1RM} kg</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <strong style={{ fontSize: 16, color: "var(--primary-accent)" }}>{pr.maxWeight} kg</strong>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 4 }}>× {pr.repsAtMaxWeight}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No personal records yet.</p>
            )}
          </div>

        </div>
      </div>

      {/* 6. ADVANCED TOOLS */}
      <div className="section-card">
        <h2 className="section-title" style={{ marginBottom: 24 }}>Advanced Tools</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          
          <div style={{ background: "var(--bg-elevated)", padding: 24, borderRadius: 16, border: "1px solid var(--border-color)" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 16, display: "flex", alignItems: "center", gap: 8, color: "var(--text-primary)" }}>
              <Calculator size={18} color="var(--primary-accent)" /> 1RM Calculator
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>Estimate your one-rep max and view working weight ranges based on your history.</p>
            <OneRepMaxCalculator />
          </div>
          
          <div style={{ background: "var(--bg-elevated)", padding: 24, borderRadius: 16, border: "1px solid var(--border-color)", display: "flex", flexDirection: "column" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 16, display: "flex", alignItems: "center", gap: 8, color: "var(--text-primary)" }}>
              <Users size={18} color="var(--primary-accent)" /> AI Routine Builder
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>Generate a custom training split dynamically tailored to your goals, available days, and experience level.</p>
            <div style={{ marginTop: "auto" }}>
              <button 
                className="action-btn primary"
                onClick={() => setShowRoutineModal(true)}
                style={{ width: "100%", padding: "12px", fontSize: 14 }}
              >
                Generate Routine
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 7. AI COACH / INSIGHTS */}
      <div className="section-card">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Sparkles size={18} color="var(--primary-accent)" />
          <h2 className="section-title">AI Coach / Insights</h2>
        </div>
        
        {!adviceResult ? (
          <div>
            <p style={{ color: "var(--text-secondary)", marginBottom: 20, fontSize: 14 }}>
              Get a professional, context-aware training recommendation based on your actual workout history, recovery status, and volume trends.
            </p>
            <button 
              onClick={handleGetAdvice}
              disabled={isAdvising || sessions.length === 0}
              className="action-btn secondary"
              style={{ width: "fit-content", opacity: sessions.length === 0 ? 0.5 : 1 }}
            >
              {isAdvising ? "Analyzing History..." : "Get Training Advice"}
            </button>
            {sessions.length === 0 && (
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 12 }}>
                No recent workout history. Log a few workouts to unlock personalized recommendations.
              </p>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 8 }}>
            
            <div>
              <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", marginBottom: 12 }}>Your Next Training Recommendation</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {adviceResult.priority?.map((p: any, i: number) => (
                  <div key={i} style={{ background: "var(--bg-elevated)", borderLeft: \`4px solid \${i === 0 ? "var(--primary-accent)" : "var(--border-color)"}\`, padding: "16px 20px", borderRadius: "0 8px 8px 0", border: "1px solid var(--border-color)", borderLeftWidth: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <strong style={{ fontSize: 15, color: "var(--text-primary)" }}>0{p.order} {p.focus.toUpperCase()}</strong>
                      <span style={{ fontSize: 11, background: "var(--bg-input)", padding: "2px 8px", borderRadius: 100, color: "var(--text-secondary)" }}>
                        {i === 0 ? "Priority" : "Secondary"}
                      </span>
                    </div>
                    <p style={{ margin: "0 0 4px 0", fontSize: 13, color: "var(--text-secondary)" }}>{p.reason}</p>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>Suggested: {p.suggestedApproach}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
              <div style={{ background: "var(--bg-elevated)", padding: 20, borderRadius: 12, border: "1px solid var(--border-color)" }}>
                <strong style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-primary)", marginBottom: 12, fontSize: 14 }}>
                  <Check size={16} color="var(--primary-accent)" /> WHAT TO DO
                </strong>
                <ul style={{ margin: 0, paddingLeft: 20, color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.6 }}>
                  {adviceResult.whatToDo?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div style={{ background: "var(--bg-elevated)", padding: 20, borderRadius: 12, border: "1px solid var(--border-color)" }}>
                <strong style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-primary)", marginBottom: 12, fontSize: 14 }}>
                  <X size={16} color="#ef4444" /> WHAT TO AVOID
                </strong>
                <ul style={{ margin: 0, paddingLeft: 20, color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.6 }}>
                  {adviceResult.whatToAvoid?.map((item: string, i: number) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            </div>

            {adviceResult.why && (
              <div style={{ padding: 16, background: "var(--bg-input)", borderRadius: 8, border: "1px solid var(--border-color)" }}>
                <strong style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>WHY THIS PLAN</strong>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{adviceResult.why}</p>
              </div>
            )}
            
            <button 
              onClick={handleGetAdvice}
              disabled={isAdvising}
              className="action-btn secondary"
              style={{ width: "fit-content" }}
            >
              {isAdvising ? "Analyzing History..." : "Refresh Advice"}
            </button>
          </div>
        )}
      </div>

      {/* MODALS */}
      {celebrationPR && (
        <PRCelebrationModal
          exerciseName={celebrationPR.exerciseName}
          weight={celebrationPR.weight}
          reps={celebrationPR.reps}
          onClose={() => setCelebrationPR(null)}
        />
      )}
      
      {showRoutineModal && (
        <RoutineGeneratorModal
          onClose={() => setShowRoutineModal(false)}
          onStartWorkout={(routine: any) => {
            handleStartCustomWorkout(routine);
            setShowRoutineModal(false);
          }}
        />
      )}

      {analysisWorkout && (
        <WorkoutAnalysisModal
          sessionName={analysisWorkout.name}
          exercises={analysisWorkout.workouts}
          onClose={() => setAnalysisWorkout(null)}
        />
      )}

    </div>
  );
}
`;

fs.writeFileSync('frontend/src/pages/Workout.tsx', jsx);
console.log("Workout.tsx rewritten completely.");
