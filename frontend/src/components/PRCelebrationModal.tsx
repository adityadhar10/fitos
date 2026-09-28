import { useEffect } from "react";
import { createPortal } from "react-dom";

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
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as {
          webkitAudioContext: typeof AudioContext;
        }).webkitAudioContext;

      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      const frequencies = [523.25, 659.25, 783.99, 1046.5];

      frequencies.forEach((frequency, index) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        const startTime = now + index * 0.1;
        const endTime = startTime + 0.4;

        oscillator.frequency.value = frequency;
        oscillator.type = "sine";

        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, endTime);

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start(startTime);
        oscillator.stop(endTime);
      });

      return () => {
        if (ctx.state !== "closed") {
          ctx.close().catch(() => {});
        }
      };
    } catch {
      // Audio is optional; ignore browser audio errors.
    }
  }, []);

  const modal = (
    <>
      <style>
        {`
          @keyframes prCelebrationScaleIn {
            from {
              opacity: 0;
              transform: scale(0.92);
            }

            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pr-celebration-title"
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          background: "rgba(0, 0, 0, 0.78)",
          backdropFilter: "blur(7px)",
          WebkitBackdropFilter: "blur(7px)",
          zIndex: 2147483647,
          overflowY: "auto",
        }}
      >
        <div
          onClick={(event) => event.stopPropagation()}
          style={{
            width: "min(380px, calc(100vw - 40px))",
            maxHeight: "calc(100vh - 40px)",
            overflowY: "auto",
            background:
              "linear-gradient(145deg, #18221c 0%, #0d1410 100%)",
            border: "2px solid #eab308",
            borderRadius: "20px",
            padding: "32px 24px",
            textAlign: "center",
            boxShadow: "0 0 40px rgba(234, 179, 8, 0.35)",
            animation:
              "prCelebrationScaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <div
            style={{
              fontSize: "42px",
              fontWeight: 900,
              color: "#facc15",
              marginBottom: "10px",
              letterSpacing: "2px",
            }}
          >
            PR
          </div>

          <span
            style={{
              display: "inline-block",
              background: "#422006",
              color: "#facc15",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "1px",
              textTransform: "uppercase",
              padding: "5px 12px",
              borderRadius: "999px",
              border: "1px solid #a16207",
              marginBottom: "14px",
            }}
          >
            New Personal Record
          </span>

          <h2
            id="pr-celebration-title"
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#ffffff",
              margin: "0 0 8px",
              lineHeight: 1.3,
            }}
          >
            {exerciseName}
          </h2>

          <div
            style={{
              fontSize: "32px",
              fontWeight: 900,
              color: "#facc15",
              margin: "12px 0",
            }}
          >
            {weight} kg{" "}
            <span
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#cbd5e1",
              }}
            >
              × {reps} reps
            </span>
          </div>

          <p
            style={{
              color: "#9da69f",
              fontSize: "13px",
              lineHeight: 1.6,
              margin: "0 0 20px",
            }}
          >
            You just beat your previous benchmark on this lift.
          </p>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "15px",
              fontWeight: 700,
              background: "linear-gradient(90deg, #eab308 0%, #ca8a04 100%)",
              color: "#000000",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            Keep Crushing It
          </button>
        </div>
      </div>
    </>
  );

  return createPortal(modal, document.body);
}