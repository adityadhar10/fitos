import { Link } from "react-router-dom";
import { CheckCircle2, Circle, Utensils, Dumbbell, Scale, Bot } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  done: boolean;
  to: string;
  icon: typeof Utensils;
}

interface GettingStartedChecklistProps {
  hasMeal: boolean;
  hasWorkout: boolean;
  hasWeightEntry: boolean;
  hasVisitedCoach: boolean;
}

export default function GettingStartedChecklist({
  hasMeal,
  hasWorkout,
  hasWeightEntry,
  hasVisitedCoach,
}: GettingStartedChecklistProps) {
  const items: ChecklistItem[] = [
    {
      id: "meal",
      label: "Log your first meal",
      description: "Track calories and macros for anything you eat",
      done: hasMeal,
      to: "/nutrition",
      icon: Utensils,
    },
    {
      id: "workout",
      label: "Log your first workout",
      description: "Record sets, reps, and weight for an exercise",
      done: hasWorkout,
      to: "/workout",
      icon: Dumbbell,
    },
    {
      id: "weight",
      label: "Log your first weight entry",
      description: "Track your body weight over time on the Progress page",
      done: hasWeightEntry,
      to: "/progress",
      icon: Scale,
    },
    {
      id: "coach",
      label: "Try the AI Coach",
      description: "Ask a question and get personalized guidance",
      done: hasVisitedCoach,
      to: "/coach",
      icon: Bot,
    },
  ];

  const completedCount = items.filter((i) => i.done).length;

  if (completedCount === items.length) {
    return null;
  }

  return (
    <div
      className="section-card"
      style={{
        marginBottom: 16,
        background: "linear-gradient(135deg, #0e1c14 0%, #0d1511 100%)",
        border: "1px solid #1f3827",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#ffffff" }}>Getting Started</h2>
        <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 600 }}>
          {completedCount} / {items.length} complete
        </span>
      </div>
      <p className="subtext" style={{ margin: "2px 0 14px 0", fontSize: 13 }}>
        Finish these steps to unlock your full Fitness Score and get the most out of FitOS.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.to}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 10,
                background: item.done ? "#0d1712" : "#0a100d",
                border: `1px solid ${item.done ? "#1f3827" : "#1c2620"}`,
                textDecoration: "none",
                transition: "border-color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!item.done) e.currentTarget.style.borderColor = "#4ade80";
              }}
              onMouseLeave={(e) => {
                if (!item.done) e.currentTarget.style.borderColor = "#1c2620";
              }}
            >
              {item.done ? (
                <CheckCircle2 size={20} color="#4ade80" style={{ flexShrink: 0 }} />
              ) : (
                <Circle size={20} color="#4a5550" style={{ flexShrink: 0 }} />
              )}
              <Icon size={16} color={item.done ? "#4ade80" : "#8a968f"} style={{ flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: item.done ? "#8a968f" : "#ffffff",
                    textDecoration: item.done ? "line-through" : "none",
                  }}
                >
                  {item.label}
                </div>
                <div style={{ fontSize: 11, color: "#7a8580" }}>{item.description}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
