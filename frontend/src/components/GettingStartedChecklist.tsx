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
    <div className="getting-started-card">
      <div className="getting-started-header">
        <div className="getting-started-header-left">
          <h3 className="getting-started-title">Getting Started</h3>
          <p className="getting-started-desc">
            Complete these foundational steps to unlock your full Fitness Score.
          </p>
        </div>
        <span className="getting-started-badge">
          {completedCount} of {items.length} completed
        </span>
      </div>

      <div className="getting-started-list">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.to}
              className={`getting-started-item ${item.done ? "done" : ""}`}
            >
              <div className="item-status-icon">
                {item.done ? (
                  <CheckCircle2 size={18} className="text-accent" />
                ) : (
                  <Circle size={18} className="text-muted" />
                )}
              </div>
              <div className="item-icon-box">
                <Icon size={15} />
              </div>
              <div className="item-content">
                <div className="item-label">{item.label}</div>
                <div className="item-description">{item.description}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
