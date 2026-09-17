import React, { useState } from "react";
import { generateRoutine } from "../services/api";
import { Dumbbell } from "lucide-react";

export default function AIRoutineBuilder({ onStartWorkout }: { onStartWorkout: (routine: any) => void }) {
  const [goal, setGoal] = useState("hypertrophy");
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [experienceLevel, setExperienceLevel] = useState("intermediate");
  const [equipment, setEquipment] = useState("commercial_gym");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedRoutine, setGeneratedRoutine] = useState<any>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGeneratedRoutine(null);
    try {
      const res = await generateRoutine({
        goal,
        daysPerWeek,
        experienceLevel,
        equipment,
      });
      setGeneratedRoutine(res.data.routine);
    } catch (err) {
      console.error("Routine generation error:", err);
      setError("Couldn't generate a routine right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchDay = (day: any) => {
    const exerciseNames = day.exercises.map((e: any) => e.name);
    onStartWorkout({
      name: day.day,
      exercises: exerciseNames,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {!generatedRoutine ? (
        <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: 12, borderRadius: 8, fontSize: 13, border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              {error}
            </div>
          )}
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6, fontWeight: 500 }}>Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "var(--bg-input)", border: "1px solid var(--border-color)", color: "var(--text-primary)", outline: "none", fontSize: 14 }}
              >
                <option value="hypertrophy">Muscle Gain</option>
                <option value="strength">Strength</option>
                <option value="fat_loss">Fat Loss</option>
                <option value="general_fitness">General Fitness</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6, fontWeight: 500 }}>Days per week</label>
              <select
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "var(--bg-input)", border: "1px solid var(--border-color)", color: "var(--text-primary)", outline: "none", fontSize: 14 }}
              >
                <option value={2}>2 Days</option>
                <option value={3}>3 Days</option>
                <option value={4}>4 Days</option>
                <option value={5}>5 Days</option>
                <option value={6}>6 Days</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6, fontWeight: 500 }}>Experience level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "var(--bg-input)", border: "1px solid var(--border-color)", color: "var(--text-primary)", outline: "none", fontSize: 14 }}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6, fontWeight: 500 }}>Equipment</label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "var(--bg-input)", border: "1px solid var(--border-color)", color: "var(--text-primary)", outline: "none", fontSize: 14 }}
              >
                <option value="commercial_gym">Full Gym</option>
                <option value="home_dumbbells">Dumbbells</option>
                <option value="barbell_only">Barbell Only</option>
                <option value="bodyweight_calisthenics">Bodyweight</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="action-btn primary"
            style={{ width: "100%", padding: "12px", fontSize: 14, marginTop: 8 }}
          >
            {loading ? "Generating your routine..." : "Generate Routine"}
          </button>
        </form>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--bg-input)", padding: "16px", borderRadius: 12, border: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--primary-accent)" }}>{generatedRoutine.name}</h3>
              <span style={{ fontSize: 11, background: "var(--bg-elevated)", color: "var(--text-primary)", padding: "4px 8px", borderRadius: 6, fontWeight: 600, border: "1px solid var(--border-color)" }}>
                {generatedRoutine.daysPerWeek} Days/wk
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4 }}>{generatedRoutine.description}</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {generatedRoutine.schedule.map((day: any, idx: number) => (
              <div key={idx} style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: 12, padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <strong style={{ fontSize: 14, color: "var(--text-primary)" }}>{day.day}</strong>
                  <button
                    type="button"
                    onClick={() => handleLaunchDay(day)}
                    style={{ background: "transparent", color: "var(--primary-accent)", border: "1px solid var(--primary-accent)", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}
                  >
                    Start
                  </button>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {day.exercises.map((ex: any, eIdx: number) => (
                    <span key={eIdx} style={{ fontSize: 12, background: "var(--bg-elevated)", color: "var(--text-secondary)", padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border-color)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Dumbbell size={12} />
                      {ex.name} ({ex.sets} × {ex.reps})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setGeneratedRoutine(null)}
            className="action-btn secondary"
            style={{ width: "100%", padding: "12px", fontSize: 14, marginTop: 8 }}
          >
            Reset Routine
          </button>
        </div>
      )}
    </div>
  );
}
