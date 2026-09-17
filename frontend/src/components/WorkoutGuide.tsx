import { useState } from "react";
import { ChevronDown, ChevronUp, X, Sparkles, Dumbbell, Timer, Trophy, ShieldCheck } from "lucide-react";

/**
 * WorkoutGuide component
 * A friendly, collapsible, and dismissible onboarding guide for new users
 * explaining how FitOS workout tracking, timers, PRs, and recovery work.
 */
export default function WorkoutGuide() {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("fitos_dismiss_workout_guide") === "true";
    } catch {
      return false;
    }
  });
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Handle permanent dismissal
  const handleDismiss = () => {
    try {
      localStorage.setItem("fitos_dismiss_workout_guide", "true");
    } catch {
      // ignore
    }
    setIsDismissed(true);
  };

  if (isDismissed) {
    return null;
  }

  const steps = [
    {
      num: "1",
      icon: Dumbbell,
      title: "Pick a template or log custom",
      desc: "Select a Quick Start split (Push/Pull/Legs) or add any exercise with your reps and weights.",
    },
    {
      num: "2",
      icon: Timer,
      title: "Use the Rest Timer between sets",
      desc: "Start the 30s–3m countdown between sets to get alerted with audio & voice cues when it's time to lift.",
    },
    {
      num: "3",
      icon: Trophy,
      title: "Beat previous records for PR celebrations",
      desc: "Whenever you lift more weight or hit more reps on an exercise, FitOS triggers a live PR celebration.",
    },
    {
      num: "4",
      icon: ShieldCheck,
      title: "Check Muscle Recovery readiness",
      desc: "View estimated muscle freshness so you know which muscles are Fresh to train and which need rest.",
    },
  ];

  return (
    <div className="workout-guide-card">
      <div className="workout-guide-header">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="workout-guide-toggle-btn"
          aria-expanded={isExpanded}
        >
          <div className="workout-guide-title-wrap">
            <Sparkles size={16} className="text-accent" />
            <span className="workout-guide-title">
              New here? Here&apos;s how Workout tracking works
            </span>
          </div>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="workout-guide-dismiss-btn"
          title="Dismiss guide"
        >
          <X size={15} />
          <span>Got it</span>
        </button>
      </div>

      {isExpanded && (
        <div className="workout-guide-steps">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="workout-guide-step-item">
                <div className="workout-guide-step-num-box">
                  <Icon size={14} className="workout-guide-step-icon" />
                </div>
                <div className="workout-guide-step-content">
                  <strong className="workout-guide-step-title">{step.title}</strong>
                  <p className="workout-guide-step-desc">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
