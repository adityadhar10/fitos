const fs = require('fs');

const orig = fs.readFileSync('frontend/src/pages/Workout.tsx', 'utf8');
const lines = orig.split('\n');

const returnIdx = lines.findIndex(l => l.includes('return ('));
let topLogic = lines.slice(0, returnIdx).join('\n');

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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
            {muscleRecovery.map((m) => {
              const statusClass = m.status === "Fatigued" ? "fatigued" : m.status === "Recovering" ? "recovering" : "fresh";
              const actionableStatus = m.status === "Fatigued" ? "🔴 Rest Needed" : m.status === "Recovering" ? "🟡 1 Day Left" : "🟢 Ready to Train";
              const advice = m.status === "Fatigued" ? "Still recovering" : m.status === "Recovering" ? "Almost recovered" : "Ready";
              return (
                <div key={m.muscle} className={\`recovery-card \${statusClass}\`} style={{ display: "flex", flexDirection: "column", height: "100%", padding: 16, background: "var(--bg-elevated)", border: "1px solid var(--border-color)", borderRadius: 12 }}>
                  <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <strong style={{ fontSize: 15 }}>{m.muscle}</strong>
                  </div>
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
                onClick={() => handleStartCustomWorkout({
                  name: template.name,
                  muscleGroup: template.muscleGroup,
                  exercises: template.exercises,
                })}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-start", padding: 16,
                  background: "var(--bg-elevated)", border: "1px solid var(--border-color)", borderRadius: 12,
                  cursor: "pointer", textAlign: "left", transition: "border-color 0.2s"
                }}
                className="quick-template-btn"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Icon size={18} color="var(--primary-accent)" />
                  <strong style={{ fontSize: 15, color: "var(--text-primary)" }}>{template.name}</strong>
                </div>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{template.desc}</span>
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
                  <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, fontSize: 16 }}>
                    <Dumbbell size={18} color="var(--primary-accent)" />
                    Exercise {exIdx + 1}
                  </h3>
                  <button type="button" onClick={() => removeExerciseFromForm(exIdx)} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: "bold" }}>
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
                
                <button type="button" onClick={() => addSetToExercise(exIdx)} style={{ background: "var(--bg-input)", border: "1px dashed var(--border-color)", color: "var(--text-primary)", padding: "8px 16px", borderRadius: 6, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: "bold" }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <Trophy size={18} color="#facc15" />
          <h2 className="section-title">History & Progress</h2>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 32 }}>
          
          {/* Recent Sessions */}
          <div>
            <h3 className="section-title" style={{ fontSize: 16, marginBottom: 16 }}>Recent Workouts</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {groupedSessions.length > 0 ? groupedSessions.map((session) => (
                <div key={session.sessionId} style={{ background: "var(--bg-elevated)", borderRadius: 12, padding: 20, border: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, color: "var(--text-primary)" }}>{session.name}</h3>
                      <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: 13 }}>
                        {new Date(session.date).toLocaleDateString()} • {session.totalExercises} exercises • {session.totalVolume.toLocaleString()} kg
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        const w = workouts.find(x => session.exercises && session.exercises.some((e: any) => e.workoutId === x.id));
                        if(w) setAnalysisWorkout(w);
                      }}
                      style={{ background: "transparent", color: "var(--primary-accent)", border: "1px solid var(--primary-accent)", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: "bold", display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <Sparkles size={12} /> Analyze
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

          {/* Personal Records */}
          <div>
            <h3 className="section-title" style={{ fontSize: 16, marginBottom: 16 }}>Personal Records</h3>
            {prs.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
                {prs.map((pr) => (
                  <div key={pr.name} style={{ background: "var(--bg-elevated)", padding: 16, borderRadius: 12, border: "1px solid var(--border-color)" }}>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: 15, color: "var(--text-primary)" }}>{pr.name}</h3>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Est. 1RM: {pr.bestEstimated1RM}kg</span>
                      <div style={{ textAlign: "right" }}>
                        <strong style={{ fontSize: 18, color: "var(--primary-accent)" }}>{pr.maxWeight}kg</strong>
                        <span style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: 4 }}>× {pr.repsAtMaxWeight}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)" }}>No personal records yet.</p>
            )}
          </div>

        </div>
      </div>

      {/* 6. ADVANCED TOOLS */}
      <div className="section-card">
        <h2 className="section-title" style={{ marginBottom: 24 }}>Advanced Tools</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 24 }}>
          
          <div style={{ background: "var(--bg-elevated)", padding: 20, borderRadius: 12, border: "1px solid var(--border-color)" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Calculator size={16} color="var(--primary-accent)" /> 1RM Strength Matrix
            </h3>
            <OneRepMaxCalculator />
          </div>
          
          <div style={{ background: "var(--bg-elevated)", padding: 20, borderRadius: 12, border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Users size={16} color="var(--primary-accent)" /> AI Routine Splits
            </h3>
            <p style={{ margin: "0 0 16px 0", color: "var(--text-secondary)", fontSize: 14 }}>Generate a custom split based on your goals and schedule.</p>
            <button 
              className="action-btn primary"
              onClick={() => setShowRoutineModal(true)}
              style={{ width: "fit-content" }}
            >
              Create Routine
            </button>
          </div>

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
          style={{ width: "fit-content" }}
        >
          {isAdvising ? "Analyzing History..." : "Get Training Advice"}
        </button>

        {adviceResult && (
          <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            <div style={{ background: "var(--bg-elevated)", padding: 20, borderRadius: 12, border: "1px solid var(--border-color)" }}>
              <strong style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--primary-accent)", marginBottom: 12, fontSize: 15 }}>
                <Check size={16} /> What To Do
              </strong>
              <p style={{ margin: 0, color: "var(--text-primary)", lineHeight: 1.5, fontSize: 14 }}>
                {adviceResult.whatToDo}
              </p>
            </div>
            <div style={{ background: "var(--bg-elevated)", padding: 20, borderRadius: 12, border: "1px solid var(--border-color)" }}>
              <strong style={{ display: "flex", alignItems: "center", gap: 8, color: "#ef4444", marginBottom: 12, fontSize: 15 }}>
                <X size={16} /> What To Avoid
              </strong>
              <p style={{ margin: 0, color: "var(--text-primary)", lineHeight: 1.5, fontSize: 14 }}>
                {adviceResult.whatToAvoid}
              </p>
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
      
      {showRoutineModal && (
        <RoutineGeneratorModal
          onClose={() => setShowRoutineModal(false)}
          onStartWorkout={(routine: any) => {
            console.log("Started routine:", routine);
            setShowRoutineModal(false);
          }}
        />
      )}

      {analysisWorkout && (
        <WorkoutAnalysisModal
          sessionName={analysisWorkout.name}
          exercises={[{ name: analysisWorkout.name, sets: analysisWorkout.sets.map((s:any) => ({ reps: s.reps, weight: s.weight })) }]}
          onClose={() => setAnalysisWorkout(null)}
        />
      )}

    </div>
  );
}
`;

fs.writeFileSync('frontend/src/pages/Workout.tsx', topLogic + '\n' + jsx);
console.log("Workout UI redesigned with grids and responsive layout!");
