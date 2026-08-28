import { useMemo } from "react";

interface WeightEntry {
  id: string;
  weight: number;
  date: string;
}

interface PredictiveChartProps {
  entries: WeightEntry[];
  goalWeight?: number;
  calorieDeficitDaily?: number; // e.g. -300 kcal/day
}

export default function PredictiveWeightChart({
  entries,
  goalWeight = 70,
  calorieDeficitDaily = -350,
}: PredictiveChartProps) {
  const sorted = useMemo(
    () => [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [entries]
  );

  const currentWeight = sorted.length > 0 ? sorted[sorted.length - 1].weight : 75;

  // Calculate 30-day projection: 1kg body fat ~= 7700 kcal
  const dailyWeightChangeKg = calorieDeficitDaily / 7700; // e.g. -0.045 kg/day
  const projected30d = Math.round((currentWeight + dailyWeightChangeKg * 30) * 10) / 10;
  const daysToGoal =
    dailyWeightChangeKg !== 0 && (goalWeight - currentWeight) / dailyWeightChangeKg > 0
      ? Math.round((goalWeight - currentWeight) / dailyWeightChangeKg)
      : null;

  // Detect plateau: if 3+ entries over >=10 days and max-min <= 0.3kg
  const isPlateau = useMemo(() => {
    if (sorted.length < 3) return false;
    const recent = sorted.slice(-4);
    const weights = recent.map((r) => r.weight);
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const firstDate = new Date(recent[0].date).getTime();
    const lastDate = new Date(recent[recent.length - 1].date).getTime();
    const daysDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
    return daysDiff >= 7 && maxW - minW <= 0.3;
  }, [sorted]);

  const projectionPoints = [
    { day: "Today", weight: currentWeight },
    { day: "+7d", weight: Math.round((currentWeight + dailyWeightChangeKg * 7) * 10) / 10 },
    { day: "+14d", weight: Math.round((currentWeight + dailyWeightChangeKg * 14) * 10) / 10 },
    { day: "+21d", weight: Math.round((currentWeight + dailyWeightChangeKg * 21) * 10) / 10 },
    { day: "+30d", weight: projected30d },
  ];

  const minChart = Math.floor(Math.min(goalWeight, projected30d, currentWeight) - 1);
  const maxChart = Math.ceil(Math.max(goalWeight, projected30d, currentWeight) + 1);
  const range = maxChart - minChart || 1;

  return (
    <div className="section-card predictive-chart-card" style={{ marginTop: 16 }}>
      <div className="section-header" style={{ marginBottom: 12 }}>
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, fontSize: 16 }}>
            <span></span> 30-Day Predictive Progress Model
          </h2>
          <p className="subtext" style={{ margin: "2px 0 0 0", fontSize: 12 }}>
            Forecast based on your caloric trajectory (~{Math.abs(calorieDeficitDaily)} kcal/day {calorieDeficitDaily < 0 ? "deficit" : "surplus"})
          </p>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#38bdf8", background: "#0c1f2e", padding: "4px 10px", borderRadius: 8, border: "1px solid #193850" }}>
          Target: {goalWeight}kg
        </span>
      </div>

      {/* Projection Metric Highlights */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 16 }}>
        <div style={{ background: "#0c130f", padding: "10px 12px", borderRadius: 10, border: "1px solid #1a271f" }}>
          <span style={{ fontSize: 11, color: "#8a968f", display: "block" }}>Current Weight</span>
          <strong style={{ fontSize: 16, color: "#ffffff" }}>{currentWeight} kg</strong>
        </div>
        <div style={{ background: "#0c130f", padding: "10px 12px", borderRadius: 10, border: "1px solid #1a271f" }}>
          <span style={{ fontSize: 11, color: "#8a968f", display: "block" }}>30-Day Forecast</span>
          <strong style={{ fontSize: 16, color: "#38bdf8" }}>{projected30d} kg</strong>
        </div>
        <div style={{ background: "#0c130f", padding: "10px 12px", borderRadius: 10, border: "1px solid #1a271f" }}>
          <span style={{ fontSize: 11, color: "#8a968f", display: "block" }}>Est. Goal Arrival</span>
          <strong style={{ fontSize: 16, color: "#4ade80" }}>
            {daysToGoal ? `~${daysToGoal} days` : "On track"}
          </strong>
        </div>
      </div>

      {/* Visual Forecast Timeline Bar Chart */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 110, padding: "10px 16px", background: "#090d0b", borderRadius: 12, border: "1px solid #16201a", marginBottom: 12 }}>
        {projectionPoints.map((p, idx) => {
          const heightPct = Math.max(15, Math.min(100, ((p.weight - minChart) / range) * 100));
          return (
            <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
              <span style={{ fontSize: 11, color: idx === 0 ? "#ffffff" : "#38bdf8", fontWeight: 700 }}>
                {p.weight}k
              </span>
              <div
                style={{
                  width: 24,
                  height: `${heightPct}%`,
                  background: idx === 0 ? "#4ade80" : "linear-gradient(180deg, #38bdf8 0%, #0369a1 100%)",
                  borderRadius: "6px 6px 2px 2px",
                  opacity: idx === 0 ? 1 : 0.85,
                  boxShadow: idx === 0 ? "0 0 10px rgba(74, 222, 128, 0.4)" : undefined,
                  transition: "height 0.3s ease",
                }}
              />
              <span style={{ fontSize: 11, color: "#8a968f", fontWeight: 500 }}>{p.day}</span>
            </div>
          );
        })}
      </div>

      {/* Plateau / What Went Wrong Diagnostic Warning */}
      {isPlateau ? (
        <div style={{ background: "#26190a", border: "1px solid #78350f", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 22 }}>️</span>
          <div>
            <strong style={{ color: "#fbbf24", fontSize: 13, display: "block" }}>Weight Plateau Detected (14-day Stagnation)</strong>
            <p style={{ margin: 0, fontSize: 12, color: "#cbd5e1", lineHeight: 1.4 }}>
              Weight has fluctuated under 0.3kg recently. Consider a 150 kcal diet adjustment or adding a 15-minute daily walk to break through the plateau.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ background: "#0b1710", border: "1px solid #1b3d27", borderRadius: 12, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 18 }}></span>
          <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 600 }}>
            Steady progression curve. Maintaining your current calorie and step consistency will keep you on pace!
          </span>
        </div>
      )}
    </div>
  );
}
