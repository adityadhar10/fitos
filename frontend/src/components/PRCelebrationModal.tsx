import { useEffect } from "react";

interface PRCelebrationProps {
  exerciseName: string;
  weight: number;
  reps: number;
  onClose: () => void;
}

export default function PRCelebrationModal({
  exerciseName,
  weight,
  reps,
  onClose,
}: PRCelebrationProps) {
  useEffect(() => {
    // Play a brief celebratory chime
    try {
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;

      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.4);
      });
    } catch {
      // Audio fallback
    }
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
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
          background: "linear-gradient(145deg, #18221c 0%, #0d1410 100%)",
          border: "2px solid #eab308",
          borderRadius: 20,
          padding: "32px 24px",
          maxWidth: 380,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 0 40px rgba(234, 179, 8, 0.35)",
          position: "relative",
          animation: "scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 54, marginBottom: 8 }}></div>
        <span
          style={{
            background: "#422006",
            color: "#facc15",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "1px",
            textTransform: "uppercase",
            padding: "4px 12px",
            borderRadius: 99,
            border: "1px solid #a16207",
            display: "inline-block",
            marginBottom: 12,
          }}
        >
          NEW PERSONAL RECORD!
        </span>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#ffffff", margin: "0 0 6px 0" }}>
          {exerciseName}
        </h2>

        <div style={{ fontSize: 32, fontWeight: 900, color: "#facc15", margin: "10px 0" }}>
          {weight} kg <span style={{ fontSize: 18, color: "#cbd5e1" }}>× {reps} reps</span>
        </div>

        <p style={{ color: "#9da69f", fontSize: 13, margin: "0 0 20px 0" }}>
          You just beat your previous benchmark on this lift. Amazing strength progression!         </p>

        <button
          type="button"
          onClick={onClose}
          className="primary-button"
          style={{
            width: "100%",
            padding: "12px",
            fontSize: 15,
            fontWeight: 700,
            background: "linear-gradient(90deg, #eab308 0%, #ca8a04 100%)",
            color: "#000000",
            border: "none",
            borderRadius: 12,
          }}
        >
          Keep Crushing It         </button>
      </div>
    </div>
  );
}
