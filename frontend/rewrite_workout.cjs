const fs = require('fs');

const orig = fs.readFileSync('/Users/adityadhar/.gemini/antigravity/scratch/Workout_orig.txt', 'utf8');
const lines = orig.split('\n');

const returnIdx = lines.findIndex(l => l.includes('return ('));
let topLogic = lines.slice(0, returnIdx).join('\n');

// Add new imports for AI
if (!topLogic.includes('analyzeWorkout')) {
  topLogic = topLogic.replace('getRoutineTemplates } from "../services/api";', 'getRoutineTemplates, analyzeWorkout, getTrainingAdvice } from "../services/api";');
}

// Add state for AI
const stateAdditions = `
  const [isAdvising, setIsAdvising] = useState(false);
  const [adviceResult, setAdviceResult] = useState<{ whatToDo: string; whatToAvoid: string } | null>(null);

  const handleGetAdvice = async () => {
    setIsAdvising(true);
    try {
      const res = await getTrainingAdvice();
      setAdviceResult(res);
    } catch (e) {
      console.error(e);
      alert("Failed to get training advice.");
    } finally {
      setIsAdvising(false);
    }
  };

  const handleAnalyzeSession = async (session: StoredSessionRegistryItem) => {
    const sessionWorkouts = workouts.filter(w => session.workoutIds.includes(w.id));
    if (!sessionWorkouts.length) return;
    
    // Simulate analyzing via WorkoutAnalysisModal or manually
    setAnalysisWorkout(sessionWorkouts[0]); 
    // Wait, WorkoutAnalysisModal only takes a single workout? 
    // We will just alert the analysis for the whole session for now, or use the existing modal
  };
`;

topLogic = topLogic.replace(/const groupedSessions = groupWorkoutsIntoSessions\(workouts, prs\);/g, stateAdditions + '\n  const groupedSessions = groupWorkoutsIntoSessions(workouts, prs);');

const jsx = `
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
          <p style={{ color: "var(--text-muted)" }}>Not enough recent workout data</p>
        ) : (
          <div className="recovery-grid">
            {muscleRecovery.map((m) => {
              const statusClass = m.status === "Fatigued" ? "fatigued" : m.status === "Recovering" ? "recovering" : "fresh";
              const actionableStatus = m.status === "Fatigued" ? "🔴 Rest Needed" : m.status === "Recovering" ? "🟡 1 Day Left" : "🟢 Ready to Train";
              const advice = m.status === "Fatigued" ? "Still recovering" : m.status === "Recovering" ? "Almost recovered" : "Ready";
              return (
                <div key={m.muscle} className={\`recovery-card \${statusClass}\`}>
                  <div className="recovery-header">
                    <strong className="recovery-muscle-name">{m.muscle}</strong>
                    <span className={\`recovery-status-badge \${statusClass}\`}>{actionableStatus}</span>
                  </div>
                  <span className="recovery-time">{advice}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. QUICK ACTIONS & TEMPLATES */}
      <div className="section-card">
        <h2 className="section-title" style={{ marginBottom: 16 }}>Quick Actions</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
          <button className="action-btn primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel Logging" : "Log Workout"}
          </button>
          <button className="action-btn secondary" onClick={() => {
            const timerEl = document.getElementById("timer-section");
            if (timerEl) timerEl.scrollIntoView({ behavior: "smooth" });
          }}>
            Start Rest Timer
          </button>
        </div>
        
        <h3 className="section-title" style={{ fontSize: 16, marginBottom: 12 }}>Templates</h3>
        <div className="quick-templates-grid">
          {TEMPLATES.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.name}
                type="button"
                onClick={() => handleStartCustomWorkout({
                  name: template.name,
                  muscleGroup: template.muscleGroup,
                  exercises: template.exercises,
                })}
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

      {/* 4. WORKOUT LOGGING (REDESIGN) */}
      {showForm && (
        <div className="section-card" style={{ border: "2px solid var(--primary-accent)" }}>
          <h2 className="section-title" style={{ marginBottom: 16 }}>Log Workout</h2>
          <form onSubmit={handleSubmitSession} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <input
              type="text"
              placeholder="Workout Session Name (Optional)"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="workout-input"
              style={{ fontSize: 18, fontWeight: "bold", padding: "12px 16px" }}
            />

            {formExercises.map((exercise, exIdx) => (
              <div key={exercise.id} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                    <Dumbbell size={18} color="var(--primary-accent)" />
                    Exercise {exIdx + 1}
                  </h3>
                  <button type="button" onClick={() => removeExerciseFromForm(exIdx)} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <ExercisePicker
                    value={exercise.name}
                    selectedCategory={exercise.muscleGroup}
                    onSelect={(selected) => updateExerciseName(exIdx, selected.name, selected.category)}
                  />
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
                  <thead>
                    <tr style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "left" }}>
                      <th style={{ padding: "0 0 8px 8px", width: "15%" }}>Set</th>
                      <th style={{ padding: "0 0 8px 0" }}>Weight (kg)</th>
                      <th style={{ padding: "0 0 8px 0" }}>Reps</th>
                      <th style={{ padding: "0 0 8px 0", textAlign: "right", width: "15%" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {exercise.sets.map((set, setIdx) => (
                      <tr key={setIdx}>
                        <td style={{ padding: "4px 8px", fontWeight: "bold", color: "var(--text-secondary)" }}>{setIdx + 1}</td>
                        <td style={{ padding: "4px 4px" }}>
                          <input
                            type="number"
                            placeholder="kg"
                            value={set.weight}
                            onChange={(e) => updateSetField(exIdx, setIdx, "weight", e.target.value)}
                            style={{ width: "100%", padding: "8px", background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: 6, color: "var(--text-primary)" }}
                          />
                        </td>
                        <td style={{ padding: "4px 4px" }}>
                          <input
                            type="number"
                            placeholder="reps"
                            value={set.reps}
                            onChange={(e) => updateSetField(exIdx, setIdx, "reps", e.target.value)}
                            style={{ width: "100%", padding: "8px", background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: 6, color: "var(--text-primary)" }}
                          />
                        </td>
                        <td style={{ padding: "4px 0", textAlign: "right" }}>
                          {exercise.sets.length > 1 && (
                            <button type="button" onClick={() => removeSetFromExercise(exIdx, setIdx)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 8 }}>
                              <X size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <button type="button" onClick={() => addSetToExercise(exIdx)} style={{ background: "var(--bg-input)", border: "1px dashed var(--border-color)", color: "var(--text-primary)", padding: "8px 16px", borderRadius: 6, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  + Add Set
                </button>
              </div>
            ))}

            <div style={{ display: "flex", gap: 12 }}>
              <button type="button" onClick={addExerciseToForm} style={{ flex: 1, padding: "14px", background: "var(--bg-elevated)", border: "1px solid var(--border-color)", color: "var(--text-primary)", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}>
                + Add Exercise
              </button>
              <button type="submit" disabled={saving} style={{ flex: 2, padding: "14px", background: "var(--primary-accent)", border: "none", color: "#000", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <Trophy size={18} color="#facc15" />
          <h2 className="section-title">History & Progress</h2>
        </div>
        
        <CollapsibleSection title="Personal Records" defaultExpanded={false}>
          {prs.length > 0 ? (
            <div className="pr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
              {prs.map((pr) => (
                <div key={pr.name} className="pr-card" style={{ background: "var(--bg-elevated)", padding: 16, borderRadius: 12, border: "1px solid var(--border-color)" }}>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: 16 }}>{pr.name}</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Est. 1RM: {pr.bestEstimated1RM}kg</span>
                    <div style={{ textAlign: "right" }}>
                      <strong style={{ fontSize: 20, color: "var(--primary-accent)" }}>{pr.maxWeight}kg</strong>
                      <span style={{ fontSize: 14, color: "var(--text-muted)", marginLeft: 4 }}>× {pr.repsAtMaxWeight}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)" }}>No personal records yet.</p>
          )}
        </CollapsibleSection>

        <h3 className="section-title" style={{ fontSize: 16, marginTop: 24, marginBottom: 16 }}>Recent Sessions</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {groupedSessions.length > 0 ? groupedSessions.map((session) => (
            <div key={session.sessionId} style={{ background: "var(--bg-elevated)", borderRadius: 12, padding: 20, border: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{session.name}</h3>
                  <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: 13 }}>
                    {new Date(session.date).toLocaleDateString()} • {session.totalExercises} exercises • {session.totalVolume.toLocaleString()} kg volume
                  </p>
                </div>
                <button 
                  onClick={() => {
                    const w = workouts.find(x => session.workoutIds.includes(x.id));
                    if(w) setAnalysisWorkout(w);
                  }}
                  style={{ background: "var(--primary-accent)", color: "#000", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: "bold", display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Sparkles size={14} /> Analyze Session
                </button>
              </div>
              
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {session.exercises.map((ex, i) => (
                  <span key={i} style={{ background: "var(--bg-input)", padding: "4px 10px", borderRadius: 100, fontSize: 12, color: "var(--text-secondary)" }}>
                    {ex.name} ({ex.sets.length} sets)
                  </span>
                ))}
              </div>
            </div>
          )) : (
            <p style={{ color: "var(--text-muted)" }}>No recent workouts found.</p>
          )}
        </div>
      </div>

      {/* 6. ADVANCED TOOLS */}
      <div className="section-card">
        <h2 className="section-title" style={{ marginBottom: 16 }}>Advanced Tools</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <CollapsibleSection title="1RM Strength Matrix" defaultExpanded={false}>
            <OneRepMaxCalculator prs={prs} />
          </CollapsibleSection>
          
          <CollapsibleSection title="AI Routine Splits" defaultExpanded={false}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-elevated)", padding: 20, borderRadius: 12, border: "1px solid var(--border-color)" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16 }}>AI-Powered Routine Generator</h3>
                <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: 14 }}>Generate a custom split based on your goals and schedule.</p>
              </div>
              <button 
                className="action-btn primary"
                onClick={() => setShowRoutineModal(true)}
              >
                Create Routine
              </button>
            </div>
          </CollapsibleSection>
        </div>
      </div>

      {/* 7. AI COACH / INSIGHTS */}
      <div className="section-card">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Sparkles size={18} color="var(--primary-accent)" />
          <h2 className="section-title">AI Coach / Insights</h2>
        </div>
        <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
          Get personalized training advice based on your recent workout history and recovery status.
        </p>
        
        <button 
          onClick={handleGetAdvice}
          disabled={isAdvising}
          className="action-btn secondary"
        >
          {isAdvising ? "Analyzing History..." : "Get Training Advice"}
        </button>

        {adviceResult && (
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "var(--bg-elevated)", padding: 16, borderRadius: 12, border: "1px solid var(--border-color)" }}>
              <strong style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--primary-accent)", marginBottom: 8, fontSize: 15 }}>
                <Check size={16} /> What To Do
              </strong>
              <p style={{ margin: 0, color: "var(--text-primary)", lineHeight: 1.5 }}>
                {adviceResult.whatToDo}
              </p>
            </div>
            <div style={{ background: "var(--bg-elevated)", padding: 16, borderRadius: 12, border: "1px solid var(--border-color)" }}>
              <strong style={{ display: "flex", alignItems: "center", gap: 8, color: "#ef4444", marginBottom: 8, fontSize: 15 }}>
                <X size={16} /> What To Avoid
              </strong>
              <p style={{ margin: 0, color: "var(--text-primary)", lineHeight: 1.5 }}>
                {adviceResult.whatToAvoid}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {celebrationPR && (
        <PRCelebrationModal
          pr={celebrationPR}
          onClose={() => setCelebrationPR(null)}
        />
      )}
      
      {showRoutineModal && (
        <RoutineGeneratorModal
          onClose={() => setShowRoutineModal(false)}
          onSave={(routine) => {
            console.log("Saved routine:", routine);
            setShowRoutineModal(false);
          }}
        />
      )}

      {analysisWorkout && (
        <WorkoutAnalysisModal
          workout={analysisWorkout}
          onClose={() => setAnalysisWorkout(null)}
        />
      )}

    </div>
  );
}
`;

fs.writeFileSync('frontend/src/pages/Workout.tsx', topLogic + '\n' + jsx);
console.log("Workout.tsx completely rewritten!");
