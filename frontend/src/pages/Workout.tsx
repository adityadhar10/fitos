
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
  Users,
  MoreVertical,
  Pencil,
  AlertTriangle
} from "lucide-react";
import RestTimer from "../components/RestTimer";
import ExercisePicker from "../components/ExercisePicker";
import PRCelebrationModal from "../components/PRCelebrationModal";
import WorkoutAnalysisModal from "../components/WorkoutAnalysisModal";
import AIRoutineBuilder from "../components/AIRoutineBuilder";
import OneRepMaxCalculator from "../components/OneRepMaxCalculator";
import { 
  getWorkoutSessions,
  addWorkoutSession, 
  deleteWorkout, 
  getWorkoutPRs, 
  analyzeWorkout, 
  getTrainingAdvice,
  updateWorkoutSession,
  deleteWorkoutSession,
  deleteAllWorkoutSessions
} from "../services/api";
import { getWorkoutMuscleInfo, TEMPLATES, generateWorkoutForTemplate } from "../data/exercises";
import { speakText, stopSpeech } from "../utils/voice";

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
  const [celebrationPR, setCelebrationPR] = useState<any>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(""); // "" = hidden; otherwise = message text
  const [showErrorToast, setShowErrorToast] = useState("");
  
  const [analysisWorkout, setAnalysisWorkout] = useState<any>(null);
  
  // Edit/Delete state
  const [editSession, setEditSession] = useState<any>(null); // session being edited
  const [editName, setEditName] = useState("");
  const [editExercises, setEditExercises] = useState<any[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deleteConfirmSession, setDeleteConfirmSession] = useState<any>(null); // single delete
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [openActionsMenu, setOpenActionsMenu] = useState<string | null>(null); // session id with open menu
  
  // AI Coach State
  const [isAdvising, setIsAdvising] = useState(false);
  const [adviceResult, setAdviceResult] = useState<any>(null);
  const [adviceSpeaking, setAdviceSpeaking] = useState(false);

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
    const generatedExercises = generateWorkoutForTemplate(template.targetMuscles);
    setFormExercises(
      generatedExercises.map((exName: string, i: number) => {
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
      if (prToCelebrate) { console.log("PR CELEBRATION TRIGGERED:", prToCelebrate); setCelebrationPR(prToCelebrate); }

      setSessionName("");
      setFormExercises([{ id: "ex_1", name: "", muscleGroup: "", sets: [{ reps: "", weight: "" }] }]);
      setShowForm(false);
      loadData();
      
      setShowSuccessToast("Workout saved successfully");
      setTimeout(() => setShowSuccessToast(""), 3000);
    } catch (err: any) {
      console.error("Failed to save workout session:", err);
      if (err.response) {
        console.error("Save workout failed response:", err.response.status, err.response.data);
      }
      setShowErrorToast("Failed to save workout.");
      setTimeout(() => setShowErrorToast(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleGetAdvice = async () => {
    setIsAdvising(true);
    stopSpeech();
    setAdviceSpeaking(false);
    try {
      const data = await getTrainingAdvice();
      setAdviceResult(data);
    } catch (e) {
      console.error(e);
      setShowErrorToast("Failed to get training advice.");
      setTimeout(() => setShowErrorToast(""), 3000);
    } finally {
      setIsAdvising(false);
    }
  };

  const handleSpeakAdvice = () => {
    console.log("VOICE DEBUG: handleSpeakAdvice CLICKED");
    console.log("VOICE DEBUG: adviceResult =", adviceResult);

    if (!adviceResult) {
      console.log("VOICE DEBUG: NO adviceResult");
      return;
    }


    if (adviceSpeaking) {
      stopSpeech();
      setAdviceSpeaking(false);
      return;
    }

    const lines: string[] = [];

    if (adviceResult.priority?.length) {
      lines.push("Your next training recommendation:");

      adviceResult.priority.forEach((p: any) => {
        lines.push(
          `${p.focus}. ${p.reason} ${p.suggestedApproach}`
        );
      });
    }

    if (adviceResult.why) {
      lines.push(adviceResult.why);
    }

    const text = lines.join(" ");

    console.log("VOICE DEBUG: generated text =", text);

    if (!text.trim()) {
      console.log("VOICE DEBUG: EMPTY speech text");
      return;
    }

    setAdviceSpeaking(true);

    console.log("VOICE DEBUG: calling speakText()");

    speakText(
      text,
      () => setAdviceSpeaking(false),
      () => setAdviceSpeaking(false)
    );
  };

  // ── Edit handlers ───────────────────────────────────────────────────────────
  const openEditSession = (session: any) => {
    setEditSession(session);
    setEditName(session.name);
    setEditExercises(
      (session.workouts || []).map((w: any) => ({
        id: w.id,
        name: w.name,
        muscleGroup: w.muscleGroup || "",
        sets: (w.sets || []).map((s: any) => ({ reps: String(s.reps), weight: String(s.weight) })),
      }))
    );
    setOpenActionsMenu(null);
  };

  const addEditExercise = () => {
    setEditExercises((prev: any[]) => [
      ...prev,
      { id: "new_" + Date.now(), name: "", muscleGroup: "", sets: [{ reps: "", weight: "" }] },
    ]);
  };

  const removeEditExercise = (idx: number) => {
    setEditExercises((prev: any[]) => prev.filter((_: any, i: number) => i !== idx));
  };

  const addEditSet = (exIdx: number) => {
    setEditExercises((prev: any[]) =>
      prev.map((ex: any, i: number) =>
        i === exIdx ? { ...ex, sets: [...ex.sets, { reps: "", weight: "" }] } : ex
      )
    );
  };

  const removeEditSet = (exIdx: number, setIdx: number) => {
    setEditExercises((prev: any[]) =>
      prev.map((ex: any, i: number) =>
        i === exIdx ? { ...ex, sets: ex.sets.filter((_: any, si: number) => si !== setIdx) } : ex
      )
    );
  };

  const handleSaveEdit = async () => {
    if (!editSession) return;
    setIsSavingEdit(true);
    try {
      const exercisesPayload = editExercises
        .filter((ex: any) => ex.name.trim())
        .map((ex: any) => ({
          name: ex.name.trim(),
          muscleGroup: ex.muscleGroup || undefined,
          sets: ex.sets
            .filter((s: any) => s.reps !== "" && s.weight !== "")
            .map((s: any) => ({ reps: Number(s.reps), weight: Number(s.weight) })),
        }))
        .filter((ex: any) => ex.sets.length > 0);

      await updateWorkoutSession(
        editSession.id,
        editName.trim() || editSession.name,
        editSession.date,
        exercisesPayload
      );

      setEditSession(null);
      loadData();
      setShowSuccessToast("Workout updated successfully");
      setTimeout(() => setShowSuccessToast(""), 3000);
    } catch (err) {
      console.error("Failed to update session:", err);
      setShowErrorToast("Failed to update workout.");
      setTimeout(() => setShowErrorToast(""), 3000);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // ── Delete handlers ──────────────────────────────────────────────────────────
  const handleDeleteSession = async () => {
    if (!deleteConfirmSession) return;
    try {
      await deleteWorkoutSession(deleteConfirmSession.id);
      setDeleteConfirmSession(null);
      loadData();
      setShowSuccessToast("Workout deleted successfully");
      setTimeout(() => setShowSuccessToast(""), 3000);
    } catch (err) {
      console.error("Failed to delete session:", err);
      setDeleteConfirmSession(null);
      setShowErrorToast("Failed to delete workout.");
      setTimeout(() => setShowErrorToast(""), 3000);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllWorkoutSessions();
      setShowDeleteAllConfirm(false);
      loadData();
      setShowSuccessToast("Workout history deleted");
      setTimeout(() => setShowSuccessToast(""), 3000);
    } catch (err) {
      console.error("Failed to delete all sessions:", err);
      setShowDeleteAllConfirm(false);
      setShowErrorToast("Failed to delete workout history.");
      setTimeout(() => setShowErrorToast(""), 3000);
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
                <div key={m.muscle} className={`recovery-card ${statusClass}`} style={{ display: "flex", flexDirection: "column", padding: 16, background: "var(--bg-elevated)", border: "1px solid var(--border-color)", borderRadius: 12 }}>
                  <strong style={{ fontSize: 14, color: "var(--text-primary)", marginBottom: 8 }}>{m.muscle}</strong>
                  <span style={{ fontSize: 13, fontWeight: "bold", marginBottom: 4 }} className={`recovery-status-badge ${statusClass}`}>{actionableStatus}</span>
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
                <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  {template.name === "Full Body" ? "Compound Heavy Movements" : template.targetMuscles.join(" · ")}
                </span>
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Trophy size={18} color="#facc15" />
            <h2 className="section-title">History &amp; Progress</h2>
          </div>
          {sessions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowDeleteAllConfirm(true)}
              aria-label="Delete all workout history"
              style={{ padding: "4px 10px", borderRadius: 6, background: "transparent", border: "1px solid #374151", color: "#6b7280", fontSize: 11, cursor: "pointer", fontWeight: 500 }}
            >
              Clear History
            </button>
          )}
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32 }}>
          
          {/* Recent Sessions */}
          <div>
            <h3 className="section-title" style={{ fontSize: 15, marginBottom: 16, color: "var(--text-secondary)" }}>Recent Workouts</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {sessions.length > 0 ? sessions.map((session) => {
                const totalVolume = session.workouts?.reduce((sum: number, w: any) => sum + w.sets.reduce((sSum: number, s: any) => sSum + s.weight * s.reps, 0), 0) || 0;
                const isMenuOpen = openActionsMenu === session.id;
                return (
                  <div key={session.id} style={{ background: "var(--bg-elevated)", borderRadius: 12, padding: 20, border: "1px solid var(--border-color)", position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 16, color: "var(--text-primary)", fontWeight: "600" }}>{session.name}</h3>
                        <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: 12 }}>
                          {new Date(session.date).toLocaleDateString()} • {session.workouts?.length || 0} exercises • {totalVolume.toLocaleString()} kg
                        </p>
                      </div>
                      {/* Action buttons */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <button
                          onClick={() => setAnalysisWorkout(session)}
                          aria-label={`Analyze ${session.name}`}
                          style={{ background: "transparent", color: "var(--primary-accent)", border: "1px solid var(--primary-accent)", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: "bold", display: "flex", alignItems: "center", gap: 4 }}
                        >
                          <Sparkles size={12} /> Analyze
                        </button>
                        <button
                          onClick={() => openEditSession(session)}
                          aria-label={`Edit ${session.name}`}
                          style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-color)", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: "bold", display: "flex", alignItems: "center", gap: 4 }}
                        >
                          <Pencil size={11} /> Edit
                        </button>
                        {/* Actions menu (…) */}
                        <div style={{ position: "relative" }}>
                          <button
                            type="button"
                            onClick={() => setOpenActionsMenu(isMenuOpen ? null : session.id)}
                            aria-label="Workout actions"
                            style={{ background: "transparent", border: "1px solid var(--border-color)", color: "var(--text-muted)", padding: "4px 6px", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center" }}
                          >
                            <MoreVertical size={13} />
                          </button>
                          {isMenuOpen && (
                            <>
                              {/* Click outside overlay */}
                              <div
                                style={{ position: "fixed", inset: 0, zIndex: 9990 }}
                                onClick={() => setOpenActionsMenu(null)}
                              />
                              <div style={{
                                position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 9999,
                                background: "#111713", border: "1px solid #1e2620", borderRadius: 8,
                                boxShadow: "0 8px 32px rgba(0,0,0,0.5)", minWidth: 160, overflow: "hidden"
                              }}>
                                <button
                                  type="button"
                                  onClick={() => openEditSession(session)}
                                  style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", background: "none", border: "none", color: "var(--text-primary)", fontSize: 13, cursor: "pointer", textAlign: "left" }}
                                >
                                  <Pencil size={13} /> Edit Workout
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setDeleteConfirmSession(session); setOpenActionsMenu(null); }}
                                  style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", background: "none", border: "none", color: "#ef4444", fontSize: 13, cursor: "pointer", textAlign: "left" }}
                                >
                                  <Trash2 size={13} /> Delete Workout
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
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
            <div style={{ marginTop: "16px", flexGrow: 1 }}>
              <AIRoutineBuilder onStartWorkout={handleStartCustomWorkout} />
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
                  <div key={i} style={{ background: "var(--bg-elevated)", borderLeft: `4px solid ${i === 0 ? "var(--primary-accent)" : "var(--border-color)"}`, padding: "16px 20px", borderRadius: "0 8px 8px 0", border: "1px solid var(--border-color)", borderLeftWidth: 4 }}>
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
            
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={handleGetAdvice}
                disabled={isAdvising}
                className="action-btn secondary"
                style={{ width: "fit-content" }}
              >
                {isAdvising ? "Analyzing History..." : "Refresh Advice"}
              </button>
              
                <button
                  onClick={handleSpeakAdvice}
                  className="action-btn secondary"
                  style={{ width: "fit-content", borderColor: adviceSpeaking ? "var(--primary-accent)" : undefined, color: adviceSpeaking ? "var(--primary-accent)" : undefined }}
                  aria-label={adviceSpeaking ? "Stop voice playback" : "Listen to training advice"}
                  title={adviceSpeaking ? "Stop voice playback" : "Listen to training advice"}
                >
                  {adviceSpeaking ? "Stop Listening" : "Listen to Advice"}
                </button>
            </div>
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
      
      
{analysisWorkout && (
        <WorkoutAnalysisModal
          session={analysisWorkout}
          allSessions={sessions}
          prs={prs}
          onClose={() => setAnalysisWorkout(null)}
        />
      )}

      {showSuccessToast && (
        <>
          <style>{`
            @keyframes toastSlideIn {
              from { opacity: 0; transform: translateY(-20px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
          <div style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 999999,
            background: "#111713",
            border: "1px solid #1e2620",
            borderLeft: "4px solid #4ade80",
            borderRadius: 8,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            animation: "toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            width: "max-content",
            maxWidth: "calc(100vw - 48px)"
          }}>
            <Check size={20} color="#4ade80" />
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>{showSuccessToast}</span>
          </div>
        </>
      )}

      {showErrorToast && (
        <>
          <div style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 999999,
            background: "#111713",
            border: "1px solid #1e2620",
            borderLeft: "4px solid #ef4444",
            borderRadius: 8,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            animation: "toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            width: "max-content",
            maxWidth: "calc(100vw - 48px)"
          }}>
            <X size={20} color="#ef4444" />
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>{showErrorToast}</span>
          </div>
        </>
      )}

      {/* ── EDIT WORKOUT MODAL ─────────────────────────────────────────────── */}
      {editSession && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100000, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#111713", border: "1px solid #1e2620", borderRadius: 16, width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 18, color: "#fff", fontWeight: 700 }}>Edit Workout</h2>
              <button type="button" onClick={() => setEditSession(null)} aria-label="Close edit modal" style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            {/* Session Name */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Session Name</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", background: "#0d1410", border: "1px solid #1e2620", borderRadius: 8, color: "#fff", fontSize: 14, boxSizing: "border-box" }}
              />
            </div>

            {/* Exercises */}
            {editExercises.map((ex: any, exIdx: number) => (
              <div key={ex.id} style={{ background: "#0d1410", border: "1px solid #1e2620", borderRadius: 10, padding: 16, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <input
                    value={ex.name}
                    onChange={(e) => setEditExercises((prev: any[]) => prev.map((p: any, i: number) => i === exIdx ? { ...p, name: e.target.value } : p))}
                    placeholder="Exercise name"
                    style={{ flex: 1, padding: "8px 10px", background: "#111713", border: "1px solid #1e2620", borderRadius: 6, color: "#fff", fontSize: 13, marginRight: 8 }}
                  />
                  {editExercises.length > 1 && (
                    <button type="button" onClick={() => removeEditExercise(exIdx)} aria-label="Remove exercise" style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: 4 }}>
                      <X size={16} />
                    </button>
                  )}
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", fontSize: 11, color: "#6b7280", paddingBottom: 6, width: 40 }}>Set</th>
                      <th style={{ textAlign: "left", fontSize: 11, color: "#6b7280", paddingBottom: 6 }}>Weight (kg)</th>
                      <th style={{ textAlign: "left", fontSize: 11, color: "#6b7280", paddingBottom: 6 }}>Reps</th>
                      <th style={{ width: 30 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ex.sets.map((s: any, sIdx: number) => (
                      <tr key={sIdx}>
                        <td style={{ padding: "4px 0", color: "#6b7280", fontSize: 12 }}>{sIdx + 1}</td>
                        <td style={{ padding: "4px 4px 4px 0" }}>
                          <input
                            type="number"
                            value={s.weight}
                            onChange={(e) => setEditExercises((prev: any[]) => prev.map((p: any, i: number) => i === exIdx ? { ...p, sets: p.sets.map((ss: any, si: number) => si === sIdx ? { ...ss, weight: e.target.value } : ss) } : p))}
                            style={{ width: "100%", padding: "6px 8px", background: "#111713", border: "1px solid #1e2620", borderRadius: 6, color: "#fff", fontSize: 13 }}
                          />
                        </td>
                        <td style={{ padding: "4px 4px 4px 0" }}>
                          <input
                            type="number"
                            value={s.reps}
                            onChange={(e) => setEditExercises((prev: any[]) => prev.map((p: any, i: number) => i === exIdx ? { ...p, sets: p.sets.map((ss: any, si: number) => si === sIdx ? { ...ss, reps: e.target.value } : ss) } : p))}
                            style={{ width: "100%", padding: "6px 8px", background: "#111713", border: "1px solid #1e2620", borderRadius: 6, color: "#fff", fontSize: 13 }}
                          />
                        </td>
                        <td style={{ padding: "4px 0", textAlign: "center" }}>
                          {ex.sets.length > 1 && (
                            <button type="button" onClick={() => removeEditSet(exIdx, sIdx)} aria-label="Remove set" style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: 2 }}>
                              <X size={12} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" onClick={() => addEditSet(exIdx)} style={{ background: "none", border: "1px dashed #1e2620", color: "#6b7280", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>
                  + Add Set
                </button>
              </div>
            ))}

            <button type="button" onClick={addEditExercise} style={{ width: "100%", padding: 12, background: "none", border: "1px dashed #1e2620", color: "#6b7280", borderRadius: 8, cursor: "pointer", fontSize: 13, marginBottom: 20 }}>
              + Add Exercise
            </button>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setEditSession(null)} style={{ padding: "10px 20px", background: "none", border: "1px solid #1e2620", color: "#9ca3af", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
                Cancel
              </button>
              <button type="button" onClick={handleSaveEdit} disabled={isSavingEdit} style={{ padding: "10px 20px", background: "#4ade80", border: "none", color: "#000", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE SINGLE WORKOUT CONFIRM MODAL ───────────────────────────── */}
      {deleteConfirmSession && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100000, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#111713", border: "1px solid #1e2620", borderRadius: 16, width: "100%", maxWidth: 420, padding: 28, textAlign: "center" }}>
            <AlertTriangle size={32} color="#ef4444" style={{ marginBottom: 16 }} />
            <h2 style={{ margin: "0 0 8px 0", fontSize: 18, color: "#fff", fontWeight: 700 }}>Delete Workout?</h2>
            <p style={{ margin: "0 0 24px 0", color: "#9ca3af", fontSize: 14, lineHeight: 1.5 }}>
              This will permanently remove <strong style={{ color: "#fff" }}>{deleteConfirmSession.name}</strong> and all its recorded sets from your history.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button type="button" onClick={() => setDeleteConfirmSession(null)} style={{ padding: "10px 24px", background: "none", border: "1px solid #1e2620", color: "#9ca3af", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
                Cancel
              </button>
              <button type="button" onClick={handleDeleteSession} style={{ padding: "10px 24px", background: "#ef4444", border: "none", color: "#fff", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
                Delete Workout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE ALL CONFIRM MODAL ───────────────────────────────────────── */}
      {showDeleteAllConfirm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100000, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#111713", border: "1px solid #ef4444", borderRadius: 16, width: "100%", maxWidth: 420, padding: 28, textAlign: "center" }}>
            <AlertTriangle size={32} color="#ef4444" style={{ marginBottom: 16 }} />
            <h2 style={{ margin: "0 0 8px 0", fontSize: 18, color: "#fff", fontWeight: 700 }}>Delete All Workout History?</h2>
            <p style={{ margin: "0 0 24px 0", color: "#9ca3af", fontSize: 14, lineHeight: 1.5 }}>
              This will permanently remove all saved workout sessions, sets, and related history. This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button type="button" onClick={() => setShowDeleteAllConfirm(false)} style={{ padding: "10px 24px", background: "none", border: "1px solid #1e2620", color: "#9ca3af", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
                Cancel
              </button>
              <button type="button" onClick={handleDeleteAll} style={{ padding: "10px 24px", background: "#ef4444", border: "none", color: "#fff", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
                Delete All History
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
