import { useState, useEffect } from "react";
import { getTodayMetrics, updateTodayMetrics } from "../services/api";

interface WaterTrackerProps {
  initialWater?: number;
  dailyGoal?: number;
  onWaterChange?: (newWater: number) => void;
}

export default function WaterTracker({
  initialWater,
  dailyGoal = 3000,
  onWaterChange,
}: WaterTrackerProps) {
  const [waterMl, setWaterMl] = useState(initialWater ?? 0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialWater !== undefined) {
      setWaterMl(initialWater);
    } else {
      getTodayMetrics()
        .then((res) => {
          const w = res.data.metric?.waterMl || 0;
          setWaterMl(w);
        })
        .catch((err) => console.error("Failed to load water:", err));
    }
  }, [initialWater]);

  const handleUpdate = async (delta: number) => {
    const updated = Math.max(0, Math.min(10000, waterMl + delta));
    setWaterMl(updated);
    if (onWaterChange) onWaterChange(updated);
    setSaving(true);
    try {
      await updateTodayMetrics(undefined, undefined, updated);
    } catch (err) {
      console.error("Failed to update water:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSetExact = async (amount: number) => {
    const updated = Math.max(0, amount);
    setWaterMl(updated);
    if (onWaterChange) onWaterChange(updated);
    setSaving(true);
    try {
      await updateTodayMetrics(undefined, undefined, updated);
    } catch (err) {
      console.error("Failed to set water:", err);
    } finally {
      setSaving(false);
    }
  };

  const pct = Math.min(100, Math.round((waterMl / dailyGoal) * 100));
  const remaining = Math.max(0, dailyGoal - waterMl);

  return (
    <div className="section-card water-tracker-card" style={{ position: "relative", overflow: "hidden" }}>
      <div className="section-header" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}></span>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Hydration Tracker</h2>
            <p className="subtext" style={{ margin: 0, fontSize: 12 }}>
              Daily goal: {(dailyGoal / 1000).toFixed(1)}L ({dailyGoal} ml)
            </p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#38bdf8" }}>{waterMl.toLocaleString()}</span>
          <span style={{ fontSize: 12, color: "#8a968f", marginLeft: 4 }}>/ {dailyGoal.toLocaleString()} ml</span>
        </div>
      </div>

      {/* Progress Bar with Blue Gradient Glow */}
      <div
        style={{
          width: "100%",
          height: 10,
          background: "#0f171c",
          borderRadius: 99,
          overflow: "hidden",
          border: "1px solid #1a2a36",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)",
            borderRadius: 99,
            transition: "width 0.3s ease",
            boxShadow: pct > 0 ? "0 0 10px rgba(56, 189, 248, 0.4)" : "none",
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 12, color: pct >= 100 ? "#4ade80" : "#8a968f", fontWeight: 600 }}>
          {pct >= 100 ? "Daily Goal Achieved!" : `${remaining} ml left today (${pct}%)`}
        </span>
        {saving && <span style={{ fontSize: 11, color: "#38bdf8" }}>Syncing...</span>}
      </div>

      {/* Quick Action Buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(105px, 1fr))", gap: 8 }}>
        <button
          type="button"
          onClick={() => handleUpdate(250)}
          className="tab-btn"
          style={{
            padding: "8px 10px",
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 8,
            border: "1px solid #1e3547",
            background: "#0c1a24",
            color: "#38bdf8",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <span></span> +250ml
        </button>

        <button
          type="button"
          onClick={() => handleUpdate(500)}
          className="tab-btn"
          style={{
            padding: "8px 10px",
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 8,
            border: "1px solid #1e3547",
            background: "#0c1a24",
            color: "#38bdf8",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <span></span> +500ml
        </button>

        <button
          type="button"
          onClick={() => handleUpdate(1000)}
          className="tab-btn"
          style={{
            padding: "8px 10px",
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 8,
            border: "1px solid #1e3547",
            background: "#0c1a24",
            color: "#38bdf8",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <span></span> +1,000ml
        </button>

        {waterMl > 0 && (
          <button
            type="button"
            onClick={() => handleSetExact(0)}
            className="tab-btn"
            style={{
              padding: "8px 10px",
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 8,
              border: "1px solid #292d2b",
              background: "#141715",
              color: "#8a968f",
              cursor: "pointer",
            }}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
