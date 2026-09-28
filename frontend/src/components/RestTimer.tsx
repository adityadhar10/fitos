import { useState, useEffect, useRef, useCallback } from "react";
import { speakText, stopSpeech } from "../utils/voice";

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
  const [voiceCoach, setVoiceCoach] = useState(false);
  const voiceAvailable = "speechSynthesis" in window;

  // Keep voice setting in a ref so interval callbacks always see current value (stale closure fix)
  const voiceCoachRef = useRef(voiceCoach);
  useEffect(() => { voiceCoachRef.current = voiceCoach; }, [voiceCoach]);

  // Guards so each milestone is spoken exactly once per timer run
  const tenSecondSpoken = useRef(false);
  const threeSecondSpoken = useRef(false);
  const twoSecondSpoken = useRef(false);
  const oneSecondSpoken = useRef(false);
  const completionSpoken = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep the latest timer value available to the interval without
  // recreating the interval on every second.
  const remainingSecondsRef = useRef(remainingSeconds);

  useEffect(() => {
    remainingSecondsRef.current = remainingSeconds;
  }, [remainingSeconds]);

  // Safe speak — only speaks when voice is ON
  const speak = useCallback((text: string) => {
    if (!voiceCoachRef.current) return;
    speakText(text);
  }, []);

  const playChime = useCallback(() => {
    try {
      const AC = window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.9);
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    } catch {
      // AudioContext may be blocked; silently ignore
    }
  }, []);

  // Single interval effect.
  // The interval is created only when the timer starts/stops.
  // Speech is handled outside the React state updater.
  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      const current = remainingSecondsRef.current;

      if (current <= 1) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        remainingSecondsRef.current = 0;
        setRemainingSeconds(0);
        setIsRunning(false);
        setIsFinished(true);

        playChime();

        if (!completionSpoken.current) {
          completionSpoken.current = true;
          speak("Rest complete. Get ready for your next set.");
        }

        return;
      }

      // Speak each milestone exactly once.
      if (current === 12 && !tenSecondSpoken.current) {
        tenSecondSpoken.current = true;
        speak("10 seconds remaining.");
      }

      // Final countdown — one single speech request.
      if (current === 5 && !threeSecondSpoken.current) {
        threeSecondSpoken.current = true;
        speak("Three. Two. One. Go!");
      }

      const next = current - 1;
      remainingSecondsRef.current = next;
      setRemainingSeconds(next);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, speak, playChime]);

  const startPreset = (sec: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    tenSecondSpoken.current = false;
    threeSecondSpoken.current = false;
    twoSecondSpoken.current = false;
    oneSecondSpoken.current = false;
    completionSpoken.current = false;
    setIsFinished(false);
    setTotalSeconds(sec);
    remainingSecondsRef.current = sec;
    setRemainingSeconds(sec);
    setIsRunning(true);
    speak(`Rest timer started. ${sec} seconds.`);
  };

  const toggleRun = () => {
    if (isFinished) {
      // Repeat
      tenSecondSpoken.current = false;
      completionSpoken.current = false;
      remainingSecondsRef.current = totalSeconds;
      setRemainingSeconds(totalSeconds);
      setIsFinished(false);
      setIsRunning(true);
      speak(`Rest timer started. ${totalSeconds} seconds.`);
    } else if (isRunning) {
      setIsRunning(false);
      speak("Timer paused.");
    } else {
      setIsRunning(true);
      speak(`Rest timer started. ${remainingSecondsRef.current} seconds.`);
    }
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    tenSecondSpoken.current = false;
    threeSecondSpoken.current = false;
    twoSecondSpoken.current = false;
    oneSecondSpoken.current = false;
    completionSpoken.current = false;
    setIsRunning(false);
    setIsFinished(false);
    remainingSecondsRef.current = totalSeconds;
    setRemainingSeconds(totalSeconds);
    stopSpeech(); // cancel any in-progress speech
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
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Gym Rest Timer</h2>
            <p className="subtext" style={{ margin: 0, fontSize: 12 }}>
              {isFinished ? "Rest complete. Time for next set." : "Rest interval between sets"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {!voiceAvailable ? (
            <span style={{ fontSize: 11, color: "#ef4444", padding: "4px 8px", border: "1px solid #ef4444", borderRadius: 8 }}>
              Voice unavailable
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setVoiceCoach((v) => !v)}
              aria-label={voiceCoach ? "Turn voice off" : "Turn voice on"}
              title={voiceCoach ? "Voice announcements on" : "Voice announcements off"}
              style={{
                padding: "4px 10px",
                borderRadius: 8,
                background: voiceCoach ? "#162e20" : "#131715",
                border: `1px solid ${voiceCoach ? "#2b6641" : "#242926"}`,
                color: voiceCoach ? "#4ade80" : "#8a968f",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {voiceCoach ? "Voice: ON" : "Voice: OFF"}
            </button>
          )}
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
                aria-label={`Start ${p.label} rest timer`}
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
              aria-label={isFinished ? "Repeat rest" : isRunning ? "Pause timer" : "Start timer"}
              style={{
                padding: "8px 14px",
                fontSize: 13,
                flex: 1,
                background: isFinished ? "#4ade80" : isRunning ? "#eab308" : undefined,
                color: isFinished || isRunning ? "#000" : undefined,
              }}
            >
              {isFinished ? "Repeat Rest" : isRunning ? "Pause" : "Start"}
            </button>
            <button
              type="button"
              onClick={resetTimer}
              aria-label="Reset timer"
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
