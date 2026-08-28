import { useState } from "react";
import { generateRoutine } from "../services/api";

interface RoutineDay {
  day: string;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    muscleGroup?: string;
  }[];
}

interface RoutineData {
  name: string;
  description: string;
  daysPerWeek: number;
  splitType: string;
  schedule: RoutineDay[];
}

interface RoutineModalProps {
  onStartWorkout: (workoutData: { name: string; muscleGroup: string; exercises: string[] }) => void;
  onClose: () => void;
}

export default function RoutineGeneratorModal({ onStartWorkout, onClose }: RoutineModalProps) {
  const [goal, setGoal] = useState("hypertrophy");
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [experienceLevel, setExperienceLevel] = useState("intermediate");
  const [equipment, setEquipment] = useState("commercial_gym");
  const [focusArea, setFocusArea] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedRoutine, setGeneratedRoutine] = useState<RoutineData | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await generateRoutine({
        goal,
        daysPerWeek,
        experienceLevel,
        equipment,
        focusArea: focusArea || undefined,
      });
      setGeneratedRoutine(res.data.routine);
    } catch (err) {
      console.error("Routine generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchDay = (day: RoutineDay) => {
    const exerciseNames = day.exercises.map((e) => e.name);
    const primaryMuscle = day.exercises[0]?.muscleGroup || "Full Body";
    onStartWorkout({
      name: day.day,
      muscleGroup: primaryMuscle,
      exercises: exerciseNames,
    });
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0d1410",
          border: "1px solid #203527",
          borderRadius: 20,
          padding: 24,
          maxWidth: 600,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}></span>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#ffffff" }}>AI Workout Routine Generator</h2>
              <p className="subtext" style={{ margin: 0, fontSize: 12 }}>
                Custom scientific training split designed for your goals & gear
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#8a968f", cursor: "pointer", fontSize: 16 }}>
                      </button>
        </div>

        {!generatedRoutine ? (
          <form onSubmit={handleGenerate} style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: "#8a968f", display: "block", marginBottom: 4 }}>Primary Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#080c0a", border: "1px solid #233027", color: "#fff", outline: "none", fontSize: 13 }}
                >
                  <option value="hypertrophy">Muscle Hypertrophy (Size)</option>
                  <option value="strength">Pure Strength & Power</option>
                  <option value="fat_loss">Fat Loss & Conditioning</option>
                  <option value="general_fitness">Athletic Performance</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, color: "#8a968f", display: "block", marginBottom: 4 }}>Days Per Week</label>
                <select
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#080c0a", border: "1px solid #233027", color: "#fff", outline: "none", fontSize: 13 }}
                >
                  <option value={2}>2 Days / Week (Full Body)</option>
                  <option value={3}>3 Days / Week (PPL or Full)</option>
                  <option value={4}>4 Days / Week (Upper / Lower)</option>
                  <option value={5}>5 Days / Week (PPL + Upper/Lower)</option>
                  <option value={6}>6 Days / Week (PPL × 2)</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: "#8a968f", display: "block", marginBottom: 4 }}>Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#080c0a", border: "1px solid #233027", color: "#fff", outline: "none", fontSize: 13 }}
                >
                  <option value="beginner">Beginner (0-1 yr)</option>
                  <option value="intermediate">Intermediate (1-3 yrs)</option>
                  <option value="advanced">Advanced (3+ yrs)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, color: "#8a968f", display: "block", marginBottom: 4 }}>Available Equipment</label>
                <select
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#080c0a", border: "1px solid #233027", color: "#fff", outline: "none", fontSize: 13 }}
                >
                  <option value="commercial_gym">Full Commercial Gym</option>
                  <option value="home_dumbbells">Home Dumbbells & Bench</option>
                  <option value="barbell_only">Barbell & Squat Rack Only</option>
                  <option value="bodyweight_calisthenics">Bodyweight Calisthenics</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, color: "#8a968f", display: "block", marginBottom: 4 }}>Special Focus (Optional)</label>
              <input
                placeholder="e.g. Chest & Shoulders focus, or Glute hypertrophy"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "#080c0a", border: "1px solid #233027", color: "#fff", outline: "none", fontSize: 13 }}
              />
            </div>

            <button type="submit" className="primary-button" disabled={loading} style={{ padding: "12px", fontSize: 14, fontWeight: 700, marginTop: 6 }}>
              {loading ? "Designing Your Split with AI..." : "Generate Custom Routine"}
            </button>
          </form>
        ) : (
          <div>
            <div style={{ background: "#111c15", padding: "12px 16px", borderRadius: 12, border: "1px solid #23402e", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#4ade80" }}>{generatedRoutine.name}</h3>
                <span style={{ fontSize: 11, background: "#182b20", color: "#38bdf8", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>
                  {generatedRoutine.daysPerWeek} Days/wk
                </span>
              </div>
              <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#cbd5e1" }}>{generatedRoutine.description}</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              {generatedRoutine.schedule.map((day, idx) => (
                <div key={idx} style={{ background: "#090d0b", border: "1px solid #1c2720", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <strong style={{ fontSize: 14, color: "#ffffff" }}>{day.day}</strong>
                    <button
                      type="button"
                      onClick={() => handleLaunchDay(day)}
                      className="tab-btn active"
                      style={{ padding: "4px 10px", fontSize: 11, fontWeight: 700, borderRadius: 6, cursor: "pointer" }}
                    >
                      ▶ Start Workout
                    </button>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {day.exercises.map((ex, eIdx) => (
                      <span key={eIdx} style={{ fontSize: 11, background: "#121a15", color: "#9da69f", padding: "3px 8px", borderRadius: 6, border: "1px solid #1f2b23" }}>
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
              style={{ width: "100%", padding: "10px", borderRadius: 10, background: "#131a15", border: "1px solid #233027", color: "#8a968f", cursor: "pointer", fontSize: 13 }}
            >
              Generate Another Routine
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
