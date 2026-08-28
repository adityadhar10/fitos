import { useState, useEffect, useRef } from "react";

const PRESETS = [
  { label: "30s", seconds: 30 },
  { label: "60s", seconds: 60 },
  { label: "90s", seconds: 90 },
  { label: "2m", seconds: 120 },
  { label: "3m", seconds: 180 },
];

export default function RestTimer() {
  const [totalSeconds, setTotalSeconds] = useState(60);
  const [remainingSeconds, setRemainingSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [voiceCoach, setVoiceCoach] = useState(true);
  const timerRef = useRef<number | null>(null);

  const speakText = (text: string) => {
    try {
      if (!voiceCoach || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech fallback
    }
  };

  // Play audio chime using Web Audio API (no external file dependency)
  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      // 2-tone melodic chime
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.15); // A5

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);

      // Trigger mobile vibration if available
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch {
      // AudioContext policy fallback
    }
  };

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      timerRef.current = window.setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev === 4 && voiceCoach) {
            speakText("Three");
          } else if (prev === 3 && voiceCoach) {
            speakText("Two");
          } else if (prev === 2 && voiceCoach) {
            speakText("One");
          }

          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setIsFinished(true);
            playChime();
            speakText("Rest complete. Start your next set!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, remainingSeconds, voiceCoach]);

  const startPreset = (sec: number) => {
    setIsFinished(false);
    setTotalSeconds(sec);
    setRemainingSeconds(sec);
    setIsRunning(true);
  };

  const toggleRun = () => {
    if (isFinished) {
      setRemainingSeconds(totalSeconds);
      setIsFinished(false);
      setIsRunning(true);
    } else {
      setIsRunning((prev) => !prev);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsFinished(false);
    setRemainingSeconds(totalSeconds);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const pct = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;
  const radius = 38;
  const circ = 2 * Math.PI * radius;
  const strokeOffset = circ - (pct / 100) * circ;

  return (
    <div
      className="section-card rest-timer-card"
      style={{
        background: isFinished ? "linear-gradient(135deg, #11261a 0%, #0d1a13 100%)" : undefined,
        borderColor: isFinished ? "#4ade80" : undefined,
        transition: "all 0.3s ease",
      }}
    >
      <div className="section-header" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>️</span>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Gym Rest Timer</h2>
            <p className="subtext" style={{ margin: 0, fontSize: 12 }}>
              {isFinished ? "Rest complete! Time for next set" : "Rest interval between sets"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={() => setVoiceCoach((v) => !v)}
            style={{
              padding: "4px 8px",
              borderRadius: 8,
              background: voiceCoach ? "#162e20" : "#131715",
              border: `1px solid ${voiceCoach ? "#2b6641" : "#242926"}`,
              color: voiceCoach ? "#4ade80" : "#8a968f",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {voiceCoach ? "️ Voice: ON" : "Voice: OFF"}
          </button>
          {isFinished && (
            <span
              style={{
                background: "#163a24",
                color: "#4ade80",
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 8px",
                borderRadius: 6,
                animation: "pulse 1.5s infinite",
              }}
            >
              NEXT SET!
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        {/* SVG Progress Ring */}
        <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
          <svg viewBox="0 0 90 90" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
            <circle cx="45" cy="45" r={radius} fill="transparent" stroke="#1f2d25" strokeWidth="6" />
            <circle
              cx="45"
              cy="45"
              r={radius}
              fill="transparent"
              stroke={isFinished ? "#4ade80" : isRunning ? "#38bdf8" : "#9da69f"}
              strokeWidth="6"
              strokeDasharray={circ}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.8s linear" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <span style={{ fontSize: 17, fontWeight: 800, color: isFinished ? "#4ade80" : "#ffffff" }}>
              {formatTime(remainingSeconds)}
            </span>
          </div>
        </div>

        {/* Controls & Preset Buttons */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => startPreset(p.seconds)}
                style={{
                  padding: "6px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 8,
                  border: totalSeconds === p.seconds && isRunning ? "1px solid #38bdf8" : "1px solid #233027",
                  background: totalSeconds === p.seconds && isRunning ? "#122533" : "#0d1410",
                  color: totalSeconds === p.seconds && isRunning ? "#38bdf8" : "#9da69f",
                  cursor: "pointer",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={toggleRun}
              className="primary-button"
              style={{
                padding: "8px 14px",
                fontSize: 13,
                flex: 1,
                background: isFinished ? "#4ade80" : isRunning ? "#eab308" : undefined,
                color: isFinished || isRunning ? "#000" : undefined,
              }}
            >
              {isFinished ? "Repeat Rest" : isRunning ? "Pause" : "▶ Start"}
            </button>
            <button
              type="button"
              onClick={resetTimer}
              style={{
                padding: "8px 12px",
                fontSize: 12,
                borderRadius: 10,
                background: "#141a16",
                border: "1px solid #28352d",
                color: "#8a968f",
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
