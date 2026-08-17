import { useStepTracker } from "../hooks/useStepTracker";

interface AutoStepTrackerProps {
  initialSteps: number;
  onStepsChange?: (steps: number) => void;
}

export default function AutoStepTracker({ initialSteps, onStepsChange }: AutoStepTrackerProps) {
  const {
    isTracking,
    liveSteps,
    cadence,
    distanceKm,
    caloriesBurned,
    motionIntensity,
    error,
    startTracking,
    stopTracking,
  } = useStepTracker(initialSteps, onStepsChange);

  return (
    <div
      style={{
        background: "linear-gradient(145deg, #0d1510, #111d16)",
        border: "1px solid #1f3325",
        borderRadius: 16,
        padding: "20px",
        marginBottom: "24px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: isTracking ? "#22c55e" : "#6b7280",
              boxShadow: isTracking ? "0 0 10px #22c55e" : "none",
            }}
          />
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", margin: 0 }}>
              Live Motion Pedometer
            </h3>
            <span style={{ fontSize: 12, color: "#8a968f" }}>
              {isTracking
                ? "Motion sensor active · Carry phone while walking"
                : "Sensor paused · Start sensor to track live steps on your phone"}
            </span>
          </div>
        </div>

        {/* Start / Pause Sensor Toggle */}
        <div>
          {!isTracking ? (
            <button
              onClick={startTracking}
              type="button"
              style={{
                background: "#163a24",
                border: "1px solid #285437",
                color: "#4ade80",
                padding: "9px 18px",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
            >
              ▶ Start Phone Sensor
            </button>
          ) : (
            <button
              onClick={stopTracking}
              type="button"
              style={{
                background: "#3a1616",
                border: "1px solid #542828",
                color: "#f87171",
                padding: "9px 18px",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
            >
              ⏸ Pause Sensor
            </button>
          )}
        </div>
      </div>

      {isTracking && (
        <div style={{ marginBottom: 14, background: "#080e0a", padding: "8px 12px", borderRadius: 8, border: "1px solid #1a2920", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "#8a968f", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Motion Signal:
          </span>
          <div style={{ flex: 1, height: 6, background: "#152019", borderRadius: 3, overflow: "hidden" }}>
            <div
              style={{
                width: `${Math.round(motionIntensity * 100)}%`,
                height: "100%",
                background: motionIntensity > 0.5 ? "#22c55e" : "#3b82f6",
                transition: "width 0.1s ease",
              }}
            />
          </div>
          <span style={{ fontSize: 11, color: "#8a968f", minWidth: 40, textAlign: "right" }}>
            {Math.round(motionIntensity * 100)}%
          </span>
        </div>
      )}

      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            padding: "8px 12px",
            borderRadius: 8,
            color: "#f87171",
            fontSize: 12,
            marginBottom: 14,
          }}
        >
          {error}
        </div>
      )}

      {/* Live Counter Display */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 12,
        }}
      >
        <div style={{ background: "#0b110e", padding: "14px", borderRadius: 12, border: "1px solid #1a271f" }}>
          <span style={{ fontSize: 11, color: "#8a968f", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Live Steps
          </span>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", marginTop: 4 }}>
            {liveSteps.toLocaleString()}
          </div>
        </div>

        <div style={{ background: "#0b110e", padding: "14px", borderRadius: 12, border: "1px solid #1a271f" }}>
          <span style={{ fontSize: 11, color: "#8a968f", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Cadence
          </span>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#4ade80", marginTop: 4 }}>
            {cadence} <span style={{ fontSize: 12, color: "#7a8580", fontWeight: 500 }}>spm</span>
          </div>
        </div>

        <div style={{ background: "#0b110e", padding: "14px", borderRadius: 12, border: "1px solid #1a271f" }}>
          <span style={{ fontSize: 11, color: "#8a968f", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Distance
          </span>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#38bdf8", marginTop: 4 }}>
            {distanceKm} <span style={{ fontSize: 12, color: "#7a8580", fontWeight: 500 }}>km</span>
          </div>
        </div>

        <div style={{ background: "#0b110e", padding: "14px", borderRadius: 12, border: "1px solid #1a271f" }}>
          <span style={{ fontSize: 11, color: "#8a968f", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Burned
          </span>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#fbbf24", marginTop: 4 }}>
            {caloriesBurned} <span style={{ fontSize: 12, color: "#7a8580", fontWeight: 500 }}>kcal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
