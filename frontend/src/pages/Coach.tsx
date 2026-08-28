import { useState, useEffect, useRef } from "react";
import "../index.css";
import { chatWithCoach, getMeals, getTodayMetrics } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { DEFAULT_CALORIE_GOAL, DEFAULT_PROTEIN_GOAL } from "../constants/goals";
import { Search, Utensils, Dumbbell, TrendingUp, Bot, Send, type LucideIcon } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const SUGGESTIONS: { icon: LucideIcon; label: string; text: string }[] = [
  { icon: Search, label: "What went wrong with my progress this week?", text: "Can you analyze what went wrong with my progress this week and what I should adjust?" },
  { icon: Utensils, label: "Suggest dinner for remaining protein", text: "What should I eat for dinner to hit my remaining protein goal without exceeding my calories?" },
  { icon: Dumbbell, label: "Recommend workout based on recovery", text: "Based on my recent workout history and muscle recovery, what workout routine should I do today?" },
  { icon: TrendingUp, label: "Predict my 30-day weight progress", text: "Based on my current caloric intake and activity, what will my progress look like in 30 days?" },
];

export default function Coach() {
  const { user } = useAuth();
  const calorieGoal = user?.calorieGoal ?? DEFAULT_CALORIE_GOAL;
  const proteinGoal = user?.proteinGoal ?? DEFAULT_PROTEIN_GOAL;

  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [steps, setSteps] = useState(0);
  const [waterMl, setWaterMl] = useState(0);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello ${user?.name ? user.name.split(" ")[0] : "there"}! I am your **FitOS AI Coach**. I have full visibility into your daily macros, workout volume, recovery metrics, and weight trends.\n\nAsk me anything or tap one of the diagnostic shortcuts below to get started!`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    Promise.all([getMeals(), getTodayMetrics()])
      .then(([mealsRes, metricsRes]) => {
        const meals = mealsRes.data.meals as { calories: number; protein: number }[];
        setTotalCalories(meals.reduce((sum, m) => sum + m.calories, 0));
        setTotalProtein(meals.reduce((sum, m) => sum + m.protein, 0));
        setSteps(metricsRes.data.metric?.steps || 0);
        setWaterMl(metricsRes.data.metric?.waterMl || 0);
      })
      .catch((err) => console.error("Failed to load coach metrics context:", err));
  }, []);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: String(Date.now()),
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await chatWithCoach(query, history);
      const assistantMsg: Message = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: res.data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Coach chat error:", err);
      const errorMsg: Message = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: "Sorry, I had trouble processing that request. Please try asking again!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const remainingCal = Math.max(0, calorieGoal - totalCalories);
  const remainingProt = Math.max(0, proteinGoal - totalProtein);

  const formatCoachText = (text: string) => {
    const paragraphs = text.split("\n\n");
    return paragraphs.map((p, idx) => {
      const lines = p.split("\n");
      return (
        <p key={idx} style={{ margin: "0 0 10px 0", lineHeight: 1.6 }}>
          {lines.map((line, lIdx) => {
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
              <span key={lIdx} style={{ display: line.startsWith("•") || line.startsWith("-") || line.match(/^\d+\./) ? "block" : "inline" }}>
                {parts.map((part, pIdx) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    return (
                      <strong key={pIdx} style={{ color: "#ffffff", fontWeight: 700 }}>
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  return part;
                })}
                {lIdx < lines.length - 1 && <br />}
              </span>
            );
          })}
        </p>
      );
    });
  };

  return (
    <div className="page-container page-enter" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 40px)", maxWidth: 900 }}>
      <div className="page-header" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <h1 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Bot size={22} /> AI Coach Studio
            </h1>
            <p>Your 24/7 personal trainer, sports nutritionist, and progress diagnostic intelligence.</p>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, background: "#152219", color: "#4ade80", padding: "4px 8px", borderRadius: 8, border: "1px solid #233629", fontWeight: 600 }}>
              {remainingCal} kcal left
            </span>
            <span style={{ fontSize: 11, background: "#12232e", color: "#38bdf8", padding: "4px 8px", borderRadius: 8, border: "1px solid #1e384d", fontWeight: 600 }}>
              {remainingProt}g protein left
            </span>
            <span style={{ fontSize: 11, background: "#1c182a", color: "#c084fc", padding: "4px 8px", borderRadius: 8, border: "1px solid #332654", fontWeight: 600 }}>
              {steps.toLocaleString()} steps
            </span>
            <span style={{ fontSize: 11, background: "#0d222e", color: "#38bdf8", padding: "4px 8px", borderRadius: 8, border: "1px solid #163e54", fontWeight: 600 }}>
              {waterMl}ml water
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10, marginBottom: 10, scrollbarWidth: "none" }}>
        {SUGGESTIONS.map((s, idx) => {
          const Icon = s.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(s.text)}
              style={{
                padding: "8px 12px",
                background: "#0d1310",
                border: "1px solid #1f2b23",
                borderRadius: 20,
                color: "#cbd5e1",
                fontSize: 12,
                fontWeight: 500,
                whiteSpace: "nowrap",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#4ade80";
                e.currentTarget.style.color = "#4ade80";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#1f2b23";
                e.currentTarget.style.color = "#cbd5e1";
              }}
            >
              <Icon size={14} /> {s.label}
            </button>
          );
        })}
      </div>

      <div
        className="section-card"
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: 16,
          marginBottom: 12,
          background: "#090d0b",
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "85%",
                padding: "12px 16px",
                borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: m.role === "user" ? "linear-gradient(135deg, #166534 0%, #15803d 100%)" : "#121a15",
                border: m.role === "user" ? "1px solid #22c55e" : "1px solid #1f2d24",
                color: m.role === "user" ? "#ffffff" : "#cbd5e1",
                fontSize: 14,
                boxShadow: m.role === "user" ? "0 2px 8px rgba(34, 197, 94, 0.2)" : "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              {m.role === "assistant" && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <Bot size={14} />
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.5px", color: "#4ade80", textTransform: "uppercase" }}>
                    FitOS Intelligence Coach
                  </span>
                </div>
              )}
              <div>{formatCoachText(m.content)}</div>
              <span style={{ fontSize: 10, color: m.role === "user" ? "rgba(255,255,255,0.7)" : "#7a8580", display: "block", textAlign: "right", marginTop: 4 }}>
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#121a15", borderRadius: 16, width: "fit-content", border: "1px solid #1f2d24" }}>
            <Bot size={14} />
            <span style={{ fontSize: 13, color: "#4ade80", fontWeight: 600 }}>FitOS Coach is analyzing your data...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{ display: "flex", gap: 8, alignItems: "center" }}
      >
        <input
          placeholder="Ask Coach: 'What should I eat next?', 'Why did my strength stall?'..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{
            flex: 1,
            padding: "14px 18px",
            borderRadius: 14,
            background: "#0d1310",
            border: "1px solid #233027",
            color: "#ffffff",
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          type="submit"
          className="primary-button"
          disabled={!input.trim() || loading}
          style={{
            padding: "14px 22px",
            borderRadius: 14,
            fontWeight: 700,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>Send</span> <Send size={14} />
        </button>
      </form>
    </div>
  );
}
