import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";

export default function TDEECalculator() {
  const { updateGoals } = useAuth();

  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState(24);
  const [weightKg, setWeightKg] = useState(75);
  const [heightCm, setHeightCm] = useState(178);
  const [activity, setActivity] = useState<number>(1.55); // Moderate
  const [goal, setGoal] = useState<number>(-300); // Moderate Cut
  const [synced, setSynced] = useState(false);
  const [saving, setSaving] = useState(false);

  // Mifflin-St Jeor equation
  const calculation = useMemo(() => {
    const bmr =
      gender === "male"
        ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
        : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

    const tdee = Math.round(bmr * activity);
    const targetCalories = Math.max(1200, tdee + goal);

    // Protein target: 2.2g/kg on deficit, 2.0g/kg on bulk/maintenance
    const proteinFactor = goal < 0 ? 2.2 : 2.0;
    const targetProtein = Math.round(weightKg * proteinFactor);

    // Fat target: 25% of total calories (9 kcal/g)
    const targetFats = Math.round((targetCalories * 0.25) / 9);

    // Carbs target: remaining calories (4 kcal/g)
    const calFromProteinAndFat = targetProtein * 4 + targetFats * 9;
    const remainingCal = Math.max(0, targetCalories - calFromProteinAndFat);
    const targetCarbs = Math.round(remainingCal / 4);

    return {
      bmr: Math.round(bmr),
      tdee,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFats,
    };
  }, [gender, age, weightKg, heightCm, activity, goal]);

  const handleApplyGoals = async () => {
    setSaving(true);
    try {
      await updateGoals({
        calorieGoal: calculation.targetCalories,
        proteinGoal: calculation.targetProtein,
        carbGoal: calculation.targetCarbs,
        fatGoal: calculation.targetFats,
      });
      setSynced(true);
      setTimeout(() => setSynced(false), 4000);
    } catch (err) {
      console.error("Failed to sync calculated goals:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="section-card tdee-card" style={{ marginTop: 16 }}>
      <div className="section-header" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}></span>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Science-Based TDEE & Macro Calculator</h2>
            <p className="subtext" style={{ margin: 0, fontSize: 12 }}>
              Calibrated with the clinical Mifflin-St Jeor formula
            </p>
          </div>
        </div>
      </div>

      {/* Input Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 11, color: "#8a968f", display: "block", marginBottom: 4 }}>Biological Sex</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as "male" | "female")}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, background: "#0c130f", border: "1px solid #1f2d24", color: "#fff", outline: "none", fontSize: 13 }}
          >
            <option value="male">Male ()</option>
            <option value="female">Female ()</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: 11, color: "#8a968f", display: "block", marginBottom: 4 }}>Age (years)</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, background: "#0c130f", border: "1px solid #1f2d24", color: "#fff", outline: "none", fontSize: 13 }}
          />
        </div>

        <div>
          <label style={{ fontSize: 11, color: "#8a968f", display: "block", marginBottom: 4 }}>Body Weight (kg)</label>
          <input
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, background: "#0c130f", border: "1px solid #1f2d24", color: "#fff", outline: "none", fontSize: 13 }}
          />
        </div>

        <div>
          <label style={{ fontSize: 11, color: "#8a968f", display: "block", marginBottom: 4 }}>Height (cm)</label>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(Number(e.target.value))}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, background: "#0c130f", border: "1px solid #1f2d24", color: "#fff", outline: "none", fontSize: 13 }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 11, color: "#8a968f", display: "block", marginBottom: 4 }}>Activity Level</label>
          <select
            value={activity}
            onChange={(e) => setActivity(Number(e.target.value))}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, background: "#0c130f", border: "1px solid #1f2d24", color: "#fff", outline: "none", fontSize: 13 }}
          >
            <option value={1.2}>Sedentary (Desk job, minimal exercise)</option>
            <option value={1.375}>Lightly Active (1-3 workouts / week)</option>
            <option value={1.55}>Moderately Active (3-5 workouts / week)</option>
            <option value={1.725}>Very Active (6-7 intense workouts / week)</option>
            <option value={1.9}>Extremely Active (Athletic training / physical job)</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: 11, color: "#8a968f", display: "block", marginBottom: 4 }}>Fitness Goal</label>
          <select
            value={goal}
            onChange={(e) => setGoal(Number(e.target.value))}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, background: "#0c130f", border: "1px solid #1f2d24", color: "#fff", outline: "none", fontSize: 13 }}
          >
            <option value={-500}>Aggressive Fat Loss (-500 kcal/day)</option>
            <option value={-300}>Moderate Fat Loss (-300 kcal/day)</option>
            <option value={0}>Maintenance & Body Recomposition (0 kcal)</option>
            <option value={250}>Lean Muscle Growth (+250 kcal/day)</option>
            <option value={500}>Hypertrophy Surplus (+500 kcal/day)</option>
          </select>
        </div>
      </div>

      {/* Calculated Results Box */}
      <div style={{ background: "#0a110d", border: "1px solid #1b2e21", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 11, color: "#8a968f" }}>Basal Metabolic Rate (BMR)</span>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#cbd5e1" }}>{calculation.bmr.toLocaleString()} kcal</div>
          </div>
          <div>
            <span style={{ fontSize: 11, color: "#8a968f" }}>Maintenance TDEE</span>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#cbd5e1" }}>{calculation.tdee.toLocaleString()} kcal</div>
          </div>
          <div>
            <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 700 }}>Recommended Daily Target</span>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#4ade80" }}>{calculation.targetCalories.toLocaleString()} kcal</div>
          </div>
        </div>

        {/* Macros Breakdown */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, textAlign: "center" }}>
          <div style={{ background: "#111f17", padding: "8px", borderRadius: 8, border: "1px solid #203a2a" }}>
            <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 700 }}>● Protein</span>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#ffffff" }}>{calculation.targetProtein}g</div>
          </div>
          <div style={{ background: "#0d1b26", padding: "8px", borderRadius: 8, border: "1px solid #193850" }}>
            <span style={{ fontSize: 11, color: "#38bdf8", fontWeight: 700 }}>● Carbs</span>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#ffffff" }}>{calculation.targetCarbs}g</div>
          </div>
          <div style={{ background: "#211a0c", padding: "8px", borderRadius: 8, border: "1px solid #4a3819" }}>
            <span style={{ fontSize: 11, color: "#fbbf24", fontWeight: 700 }}>● Fats</span>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#ffffff" }}>{calculation.targetFats}g</div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleApplyGoals}
        disabled={saving}
        className="primary-button"
        style={{
          width: "100%",
          padding: "10px",
          fontSize: 13,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        {saving ? "Updating Live Profile..." : synced ? "Applied Successfully to FitOS Profile!" : "Apply Targets to FitOS Dashboard & Profile"}
      </button>
    </div>
  );
}
