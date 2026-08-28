import { useState, useMemo } from "react";

export default function OneRepMaxCalculator() {
  const [exercise, setExercise] = useState("Bench Press");
  const [weight, setWeight] = useState(80);
  const [reps, setReps] = useState(6);
  const [bodyWeight, setBodyWeight] = useState(75);

  const result = useMemo(() => {
    if (reps === 1) return { oneRepMax: weight };

    // Epley: weight * (1 + reps/30)
    const epley = weight * (1 + reps / 30);
    // Brzycki: weight * (36 / (37 - reps))
    const brzycki = reps < 37 ? weight * (36 / (37 - reps)) : epley;

    const avg1RM = Math.round((epley + brzycki) / 2);
    return { oneRepMax: avg1RM };
  }, [weight, reps]);

  const percentages = [
    { pct: 95, reps: "1-2 reps", intent: "Max Effort / Peak Power" },
    { pct: 90, reps: "3-4 reps", intent: "Heavy Strength" },
    { pct: 85, reps: "5-6 reps", intent: "Strength Hypertrophy" },
    { pct: 80, reps: "7-8 reps", intent: "Primary Hypertrophy" },
    { pct: 75, reps: "9-10 reps", intent: "Hypertrophy Volume" },
    { pct: 70, reps: "11-12 reps", intent: "Pump & Endurance" },
  ];

  // Strength standards calculation
  const strengthRatio = bodyWeight > 0 ? Math.round((result.oneRepMax / bodyWeight) * 100) / 100 : 1;
  const getStrengthTier = () => {
    if (exercise.includes("Bench") || exercise.includes("Chest")) {
      if (strengthRatio < 0.8) return { tier: "Beginner", color: "#9da69f" };
      if (strengthRatio < 1.1) return { tier: "Novice", color: "#4ade80" };
      if (strengthRatio < 1.4) return { tier: "Intermediate", color: "#38bdf8" };
      if (strengthRatio < 1.8) return { tier: "Advanced", color: "#c084fc" };
      return { tier: "Elite", color: "#facc15" };
    }
    if (exercise.includes("Squat") || exercise.includes("Leg")) {
      if (strengthRatio < 1.0) return { tier: "Beginner", color: "#9da69f" };
      if (strengthRatio < 1.4) return { tier: "Novice", color: "#4ade80" };
      if (strengthRatio < 1.8) return { tier: "Intermediate", color: "#38bdf8" };
      if (strengthRatio < 2.2) return { tier: "Advanced", color: "#c084fc" };
      return { tier: "Elite", color: "#facc15" };
    }
    // Deadlift / Back / Default
    if (strengthRatio < 1.2) return { tier: "Beginner", color: "#9da69f" };
    if (strengthRatio < 1.6) return { tier: "Novice", color: "#4ade80" };
    if (strengthRatio < 2.0) return { tier: "Intermediate", color: "#38bdf8" };
    if (strengthRatio < 2.5) return { tier: "Advanced", color: "#c084fc" };
    return { tier: "Elite", color: "#facc15" };
  };

  const tierInfo = getStrengthTier();

  return (
    <div className="section-card one-rep-max-card" style={{ marginTop: 16 }}>
      <div className="section-header" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>️</span>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>1RM Strength Matrix & Working Sets</h2>
            <p className="subtext" style={{ margin: 0, fontSize: 12 }}>
              Scientific powerlifting working percentages and strength tier
            </p>
          </div>
        </div>
      </div>

      {/* Input Controls */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 11, color: "#8a968f", display: "block", marginBottom: 4 }}>Exercise</label>
          <select
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, background: "#0c130f", border: "1px solid #1f2d24", color: "#fff", outline: "none", fontSize: 13 }}
          >
            <option value="Bench Press">Barbell Bench Press</option>
            <option value="Back Squat">Barbell Back Squat</option>
            <option value="Deadlift">Conventional Deadlift</option>
            <option value="Overhead Press">Overhead Military Press</option>
            <option value="Barbell Row">Barbell Row</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: 11, color: "#8a968f", display: "block", marginBottom: 4 }}>Weight Lifted (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, background: "#0c130f", border: "1px solid #1f2d24", color: "#fff", outline: "none", fontSize: 13 }}
          />
        </div>

        <div>
          <label style={{ fontSize: 11, color: "#8a968f", display: "block", marginBottom: 4 }}>Reps Performed (1-15)</label>
          <input
            type="number"
            min={1}
            max={15}
            value={reps}
            onChange={(e) => setReps(Math.min(15, Math.max(1, Number(e.target.value))))}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, background: "#0c130f", border: "1px solid #1f2d24", color: "#fff", outline: "none", fontSize: 13 }}
          />
        </div>

        <div>
          <label style={{ fontSize: 11, color: "#8a968f", display: "block", marginBottom: 4 }}>Your Weight (kg)</label>
          <input
            type="number"
            value={bodyWeight}
            onChange={(e) => setBodyWeight(Number(e.target.value))}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, background: "#0c130f", border: "1px solid #1f2d24", color: "#fff", outline: "none", fontSize: 13 }}
          />
        </div>
      </div>

      {/* 1RM Highlight & Tier Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #111a14 0%, #0d1410 100%)",
          border: "1px solid #1f3625",
          borderRadius: 12,
          padding: "14px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <span style={{ fontSize: 11, color: "#8a968f", textTransform: "uppercase", letterSpacing: "0.5px" }}>Estimated 1-Rep Max</span>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#4ade80" }}>
            {result.oneRepMax} <span style={{ fontSize: 16, color: "#cbd5e1" }}>kg</span>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: 11, color: "#8a968f" }}>Strength-to-Weight Ratio</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#ffffff" }}>{strengthRatio}x BW</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: tierInfo.color,
                background: "#16201a",
                border: `1px solid ${tierInfo.color}`,
                padding: "2px 8px",
                borderRadius: 6,
                textTransform: "uppercase",
              }}
            >
              {tierInfo.tier}
            </span>
          </div>
        </div>
      </div>

      {/* Percentage Matrix Table */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
        {percentages.map((p) => {
          const workingWeight = Math.round((result.oneRepMax * (p.pct / 100)) * 2) / 2; // 0.5kg rounding
          return (
            <div
              key={p.pct}
              style={{
                background: "#0a100d",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #1b261f",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#38bdf8" }}>{p.pct}%</span>
                <span style={{ fontSize: 11, color: "#8a968f" }}>{p.reps}</span>
              </div>
              <strong style={{ fontSize: 16, color: "#ffffff" }}>{workingWeight}kg</strong>
              <span style={{ fontSize: 10, color: "#6b7570", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {p.intent}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
