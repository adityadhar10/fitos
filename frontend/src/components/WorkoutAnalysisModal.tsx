import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, TrendingUp, Dumbbell, Target, Loader, AlertCircle } from "lucide-react";
import { analyzeWorkout } from "../services/api";
import { speakText, stopSpeech } from "../utils/voice";

interface WorkoutExercise {
  name: string;
  muscleGroup?: string | null;
  sets: { reps: number; weight: number }[];
}

interface WorkoutSession {
  id: string;
  name: string;
  date: string;
  workouts: WorkoutExercise[];
}

interface AnalysisResult {
  summary?: string;
  progression?: string;
  keyObservation?: string;
  nextWorkout?: string[];
  whatToAvoid?: string[];
  // support alternative field names from backend
  whatToDo?: string[];
  why?: string;
}

interface Props {
  session: WorkoutSession;
  allSessions: WorkoutSession[]; // for historical context
  prs: { name: string; maxWeight: number; repsAtMaxWeight: number; bestEstimated1RM?: number }[];
  onClose: () => void;
}

function calcVolume(sets: { reps: number; weight: number }[]): number {
  return sets.reduce((sum, s) => sum + s.reps * s.weight, 0);
}

export default function WorkoutAnalysisModal({ session, allSessions, prs, onClose }: Props) {
  const [state, setState] = useState<"loading" | "done" | "error">("loading");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Prevent body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Calculate quick metrics from session data
  const totalSets = session.workouts.reduce((sum, ex) => sum + ex.sets.length, 0);
  const totalReps = session.workouts.reduce((sum, ex) => sum + ex.sets.reduce((s, set) => s + set.reps, 0), 0);
  const totalVolume = session.workouts.reduce((sum, ex) => sum + calcVolume(ex.sets), 0);

  // Build rich context and call AI on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchAnalysis() {
      try {
        // Build the current session context
        const currentExercises = session.workouts.map(ex => {
          const topWeight = ex.sets.length > 0 ? Math.max(...ex.sets.map(s => s.weight)) : 0;
          const pr = prs.find(p => p.name.trim().toLowerCase() === ex.name.trim().toLowerCase());
          return {
            name: ex.name,
            muscleGroup: ex.muscleGroup || null,
            sets: ex.sets.length,
            totalReps: ex.sets.reduce((s, set) => s + set.reps, 0),
            volume: Math.round(calcVolume(ex.sets)),
            topWeight,
            isPR: pr ? topWeight >= pr.maxWeight && topWeight > 0 : false,
            setsDetail: ex.sets.map((s, i) => ({ setNumber: i + 1, reps: s.reps, weight: s.weight })),
          };
        });

        // Build historical context: find previous sessions that share any of these exercises
        const exerciseNames = session.workouts.map(ex => ex.name.trim().toLowerCase());
        const historicalComparisons = exerciseNames.map(exName => {
          const prevSessions = allSessions
            .filter(s => s.id !== session.id && s.workouts.some(w => w.name.trim().toLowerCase() === exName))
            .slice(0, 3); // last 3 relevant sessions per exercise

          return {
            exercise: exName,
            previousSessions: prevSessions.map(prev => {
              const prevEx = prev.workouts.find(w => w.name.trim().toLowerCase() === exName)!;
              return {
                date: prev.date,
                sets: prevEx.sets.length,
                totalReps: prevEx.sets.reduce((s, set) => s + set.reps, 0),
                volume: Math.round(calcVolume(prevEx.sets)),
                topWeight: prevEx.sets.length > 0 ? Math.max(...prevEx.sets.map(s => s.weight)) : 0,
              };
            }),
          };
        }).filter(e => e.previousSessions.length > 0);

        const payload = {
          sessionName: session.name,
          sessionDate: session.date,
          exercises: currentExercises,
          historicalContext: historicalComparisons,
          totalSessionVolume: Math.round(totalVolume),
          totalSets,
          totalReps,
          personalRecords: prs.filter(pr => exerciseNames.includes(pr.name.trim().toLowerCase())),
        };

        const data = await analyzeWorkout(payload);
        if (!cancelled) {
          setResult(data);
          setState("done");
        }
      } catch (err: any) {
        if (!cancelled) {
          setErrorMsg(err?.message || "Unknown error");
          setState("error");
        }
      }
    }

    fetchAnalysis();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Resolve field names — backend may return nextWorkout or whatToDo
  const nextWorkout = result?.nextWorkout ?? result?.whatToDo ?? [];
  const whatToAvoid = result?.whatToAvoid ?? [];

  const modal = (
    <div
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        zIndex: 99999,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "32px 20px",
        overflowY: "auto",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 680,
          marginTop: 20,
          marginBottom: 40,
          background: "#0f1410",
          border: "1px solid #1e2620",
          borderRadius: 16,
          color: "#fff",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          padding: "24px 24px 0 24px",
          position: "sticky", top: 0, background: "#0f1410", zIndex: 1,
          paddingBottom: 20,
          borderBottom: "1px solid #1e2620",
          marginBottom: 0,
        }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "1.5px", color: "#8a938d", textTransform: "uppercase", marginBottom: 6 }}>
              Workout Analysis
            </div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#fff" }}>{session.name}</h2>
            <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#8a938d" }}>
              {new Date(session.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid #1e2620",
              color: "#8a938d", borderRadius: 8, padding: 8, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Metrics Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, padding: "20px 24px" }}>
          {[
            { icon: <Dumbbell size={16} color="#4ade80" />, label: "Sets", value: totalSets },
            { icon: <Target size={16} color="#4ade80" />, label: "Reps", value: totalReps },
            { icon: <TrendingUp size={16} color="#4ade80" />, label: "Volume", value: `${Math.round(totalVolume).toLocaleString()} kg` },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{
              background: "#111713", border: "1px solid #1e2620", borderRadius: 10,
              padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8,
            }}>
              {icon}
              <div style={{ fontSize: 11, color: "#8a938d", letterSpacing: "1px" }}>{label}</div>
              <strong style={{ fontSize: 20, color: "#fff" }}>{value}</strong>
            </div>
          ))}
        </div>

        {/* AI Analysis Area */}
        <div style={{ padding: "0 24px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

          {state === "loading" && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 16, padding: "40px 24px",
              background: "#111713", border: "1px solid #1e2620", borderRadius: 12,
            }}>
              <Loader size={28} color="#4ade80" style={{ animation: "spin 1s linear infinite" }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", textAlign: "center", marginBottom: 6 }}>
                  Analyzing workout...
                </div>
                <div style={{ fontSize: 13, color: "#8a938d", textAlign: "center" }}>
                  Reviewing your exercises, volume, and progression
                </div>
              </div>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {state === "error" && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 12, padding: 20,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12,
            }}>
              <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4, color: "#ef4444" }}>Analysis unavailable</div>
                <div style={{ fontSize: 13, color: "#8a938d" }}>
                  Workout analysis is temporarily unavailable. Please try again.
                  {errorMsg && <div style={{ marginTop: 4, opacity: 0.8 }}>{errorMsg}</div>}
                </div>
              </div>
            </div>
          )}

          {state === "done" && result && (
            <>
              {/* Voice Actions */}
              {"speechSynthesis" in window && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: -4 }}>
                  <button
                    onClick={() => {
                      if (speaking) {
                        stopSpeech();
                        setSpeaking(false);
                      } else {
                        const lines = [];
                        if (result.summary) lines.push(result.summary);
                        if (result.progression) lines.push("Progression: " + result.progression);
                        if (result.keyObservation) lines.push("Key observation: " + result.keyObservation);
                        const nextWorkout = result.nextWorkout ?? result.whatToDo ?? [];
                        if (nextWorkout.length > 0) lines.push("Next workout focus: " + nextWorkout.join(". "));
                        const whatToAvoid = result.whatToAvoid ?? [];
                        if (whatToAvoid.length > 0) lines.push("What to avoid: " + whatToAvoid.join(". "));
                        if (result.why) lines.push("Why this plan: " + result.why);
                        
                        const text = lines.join(". ");
                        if (!text.trim()) return;
                        
                        setSpeaking(true);
                        speakText(
                          text, 
                          () => setSpeaking(false), // onEnd
                          () => setSpeaking(false)  // onError
                        );
                      }
                    }}
                    style={{
                      padding: "8px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                      background: "rgba(255,255,255,0.06)", border: "1px solid #1e2620",
                      color: speaking ? "#4ade80" : "#8a938d",
                      borderColor: speaking ? "#4ade80" : "#1e2620"
                    }}
                  >
                    {speaking ? "Stop Listening" : "Listen to Analysis"}
                  </button>
                </div>
              )}

              {result.summary && (
                <Section title="Performance Summary">
                  <p style={{ margin: 0, lineHeight: 1.65, fontSize: 14, color: "#d1d5db" }}>
                    {result.summary}
                  </p>
                </Section>
              )}

              {result.progression && (
                <Section title="Progression">
                  <p style={{ margin: 0, lineHeight: 1.65, fontSize: 14, color: "#d1d5db" }}>
                    {result.progression}
                  </p>
                </Section>
              )}

              {result.keyObservation && (
                <Section title="Key Observation">
                  <p style={{ margin: 0, lineHeight: 1.65, fontSize: 14, color: "#d1d5db" }}>
                    {result.keyObservation}
                  </p>
                </Section>
              )}

              {nextWorkout.length > 0 && (
                <Section title="What To Do Next">
                  <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                    {nextWorkout.map((item: string, i: number) => (
                      <li key={i} style={{ fontSize: 14, color: "#d1d5db", lineHeight: 1.5 }}>{item}</li>
                    ))}
                  </ul>
                </Section>
              )}

              {whatToAvoid.length > 0 && (
                <Section title="What To Avoid">
                  <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                    {whatToAvoid.map((item: string, i: number) => (
                      <li key={i} style={{ fontSize: 14, color: "#d1d5db", lineHeight: 1.5 }}>{item}</li>
                    ))}
                  </ul>
                </Section>
              )}

              {result.why && !result.progression && (
                <div style={{
                  padding: "14px 16px", background: "#111713",
                  border: "1px solid #1e2620", borderRadius: 10,
                }}>
                  <div style={{ fontSize: 11, letterSpacing: "1px", color: "#8a938d", marginBottom: 6, textTransform: "uppercase" }}>Reasoning</div>
                  <p style={{ margin: 0, fontSize: 13, color: "#8a938d", lineHeight: 1.6 }}>{result.why}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#111713", border: "1px solid #1e2620", borderRadius: 12, padding: "18px 20px",
    }}>
      <div style={{
        fontSize: 11, letterSpacing: "1.5px", color: "#4ade80", textTransform: "uppercase",
        marginBottom: 12, fontWeight: 600,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}