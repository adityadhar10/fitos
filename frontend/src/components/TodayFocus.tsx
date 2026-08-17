import { Link } from "react-router-dom";

interface TodayFocusProps {
  totalCalories: number;
  calorieGoal: number;
  totalProtein: number;
  proteinGoal: number;
  steps: number;
  stepGoal: number;
  sleepHours: number;
  sleepGoal: number;
  loading?: boolean;
}

export default function TodayFocus({
  totalCalories,
  calorieGoal,
  totalProtein,
  proteinGoal,
  steps,
  stepGoal,
  sleepHours,
  sleepGoal,
  loading,
}: TodayFocusProps) {
  if (loading) {
    return (
      <div className="today-focus">
        <div className="skeleton" style={{ height: 72, borderRadius: 14 }} />
      </div>
    );
  }

  let message = "You're on track today. Keep building momentum!";
  let cta = "View Progress";
  let to = "/progress";
  let icon = "✨";

  if (totalCalories === 0) {
    message = "Start fueling your day — log your first meal to kick off nutrition tracking.";
    cta = "Log Meal";
    to = "/nutrition";
    icon = "🥗";
  } else if (totalCalories < calorieGoal * 0.5) {
    message = `You're at ${totalCalories} / ${calorieGoal} kcal. Add a meal or snack to stay on pace.`;
    cta = "Add Meal";
    to = "/nutrition";
    icon = "🔥";
  } else if (totalProtein < proteinGoal * 0.5) {
    message = `Protein is at ${totalProtein}g / ${proteinGoal}g. Prioritize a high-protein meal next.`;
    cta = "Boost Protein";
    to = "/nutrition";
    icon = "🥩";
  } else if (steps < stepGoal * 0.4) {
    message = `Only ${steps.toLocaleString()} steps so far. Start the phone sensor or take a short walk.`;
    cta = "Track Steps";
    to = "/activity";
    icon = "🚶";
  } else if (sleepHours === 0) {
    message = `Sleep isn't logged yet. Log at least ${sleepGoal}h for a complete fitness score.`;
    cta = "Log Sleep";
    to = "/activity";
    icon = "😴";
  } else if (totalCalories >= calorieGoal && steps >= stepGoal) {
    message = "Outstanding day — calorie and step goals crushed. Recovery and consistency win tomorrow.";
    cta = "See Badges";
    to = "/badges";
    icon = "🏆";
  }

  return (
    <div className="today-focus">
      <div className="today-focus-icon">{icon}</div>
      <div className="today-focus-body">
        <h2>Today's Focus</h2>
        <p>{message}</p>
      </div>
      <Link to={to} className="today-focus-cta">{cta}</Link>
    </div>
  );
}
