import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../index.css";
import { getMeals, getTodayMetrics, getWeeklyMetrics, getInsight, getStreak, getWorkouts, getWeightHistory } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  DEFAULT_CALORIE_GOAL,
  DEFAULT_PROTEIN_GOAL,
  DEFAULT_STEP_GOAL,
  DEFAULT_SLEEP_GOAL,
} from "../constants/goals";
import TodayFocus from "../components/TodayFocus";
import GettingStartedChecklist from "../components/GettingStartedChecklist";
import { Flame, Beef, Footprints, Moon, Bot, ArrowRight } from "lucide-react";

interface WeeklyPoint {
  day: string;
  steps: number;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user } = useAuth();

  const calorieGoal = user?.calorieGoal ?? DEFAULT_CALORIE_GOAL;
  const proteinGoal = user?.proteinGoal ?? DEFAULT_PROTEIN_GOAL;

  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [steps, setSteps] = useState(0);
  const [sleepHours, setSleepHours] = useState(0);
  const [weekly, setWeekly] = useState<WeeklyPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [hasWorkout, setHasWorkout] = useState(false);
  const [hasWeightEntry, setHasWeightEntry] = useState(false);
  const [hasVisitedCoach, setHasVisitedCoach] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setHasVisitedCoach(localStorage.getItem(`fitos_visited_coach_${user.id}`) === "true");
    }
  }, [user?.id]);

  const [saving, setSaving] = useState(false);

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [mealsRes, metricsRes, weeklyRes, streakRes, workoutsRes, weightRes] = await Promise.all([
        getMeals(),
        getTodayMetrics(),
        getWeeklyMetrics(),
        getStreak(),
        getWorkouts(),
        getWeightHistory(),
      ]);

      setHasWorkout((workoutsRes.data.workouts || []).length > 0);
      setHasWeightEntry((weightRes.data.entries || []).length > 0);

      const meals = mealsRes.data.meals as { calories: number; protein: number }[];
      setTotalCalories(meals.reduce((sum, m) => sum + m.calories, 0));
      setTotalProtein(meals.reduce((sum, m) => sum + m.protein, 0));

      setSteps(metricsRes.data.metric.steps || 0);
      setSleepHours(metricsRes.data.metric.sleepHours || 0);
      setStreak(streakRes.data.streak ?? 0);

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const today = new Date();
      const last7: WeeklyPoint[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const match = weeklyRes.data.metrics.find((m: { date: string; steps: number }) => {
          const md = new Date(m.date);
          return md.toDateString() === d.toDateString();
        });
        last7.push({ day: days[d.getDay()], steps: match ? match.steps : 0 });
      }
      setWeekly(last7);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadInsight = () => {
    setInsightLoading(true);
    getInsight()
      .then((res) => setAiInsight(res.data.insight))
      .catch((err) => console.error("Failed to load AI insight:", err))
      .finally(() => setInsightLoading(false));
  };

  useEffect(() => {
    loadAll();
    loadInsight();
  }, []);

  const caloriesPct = Math.min(100, (totalCalories / calorieGoal) * 100);
  const proteinPct = Math.min(100, (totalProtein / proteinGoal) * 100);
  const stepsPct = Math.min(100, (steps / DEFAULT_STEP_GOAL) * 100);
  const sleepPct = Math.min(100, (sleepHours / DEFAULT_SLEEP_GOAL) * 100);

  const activeDaysCount = weekly.filter((w) => w.steps > 0).length;
  const consistencyPct = Math.round((activeDaysCount / 7) * 100);

  const fitnessScore = Math.round(
    (caloriesPct * 0.3 + proteinPct * 0.2 + stepsPct * 0.3 + sleepPct * 0.1 + consistencyPct * 0.1)
  );

  const maxWeeklySteps = Math.max(5000, ...weekly.map((w) => w.steps));

  const STATS_DATA = [
    {
      id: "calories",
      icon: Flame,
      label: "Calories",
      value: totalCalories.toLocaleString(),
      target: `/ ${calorieGoal.toLocaleString()} kcal`,
      pct: caloriesPct,
    },
    {
      id: "protein",
      icon: Beef,
      label: "Protein",
      value: `${totalProtein}g`,
      target: `/ ${proteinGoal}g`,
      pct: proteinPct,
    },
    {
      id: "steps",
      icon: Footprints,
      label: "Steps",
      value: steps.toLocaleString(),
      target: `/ ${DEFAULT_STEP_GOAL.toLocaleString()}`,
      pct: stepsPct,
    },
    {
      id: "sleep",
      icon: Moon,
      label: "Sleep",
      value: `${sleepHours}h`,
      target: `/ ${DEFAULT_SLEEP_GOAL}h`,
      pct: sleepPct,
    },
  ];

  const SCORE_BARS = [
    { label: "Nutrition", pct: Math.round(caloriesPct), cls: "nutrition" },
    { label: "Activity", pct: Math.round(stepsPct), cls: "activity" },
    { label: "Sleep", pct: Math.round(sleepPct), cls: "sleep" },
    { label: "Consistency", pct: consistencyPct, cls: "consistency" },
  ];

  return (
    <div className="dashboard page-enter">
      <div className="dashboard-header">
        <h1>
          {getGreeting()}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p>Your daily command center — score, goals, and what to do next.</p>
      </div>

      <GettingStartedChecklist
        hasMeal={totalCalories > 0}
        hasWorkout={hasWorkout}
        hasWeightEntry={hasWeightEntry}
        hasVisitedCoach={hasVisitedCoach}
      />

      <TodayFocus
        totalCalories={totalCalories}
        calorieGoal={calorieGoal}
        totalProtein={totalProtein}
        proteinGoal={proteinGoal}
        steps={steps}
        stepGoal={DEFAULT_STEP_GOAL}
        sleepHours={sleepHours}
        sleepGoal={DEFAULT_SLEEP_GOAL}
        loading={loading}
      />

      <div className="fitness-score">
        <div className="fitness-score-left">
          <div className="fitness-score-header">
            <h2>FITNESS SCORE</h2>
          </div>
          <div className="score-ring">
            <svg viewBox="0 0 140 140">
              <circle className="bg" cx="70" cy="70" r="60" />
              <circle
                className="progress"
                cx="70"
                cy="70"
                r="60"
                style={{
                  strokeDashoffset: 377 - (fitnessScore / 100) * 377,
                }}
              />
            </svg>
            <div className="score-number">
              <strong>{loading ? "-" : fitnessScore}</strong>
              <span>/ 100</span>
            </div>
          </div>
          {streak > 0 && (
            <div className="streak-badge">
              {streak}-day streak
            </div>
          )}
        </div>

        <div className="fitness-score-right">
          <h2>Score Breakdown</h2>
          <div className="score-breakdown">
            {SCORE_BARS.map((bar) => (
              <div key={bar.label} className="score-bar-row">
                <span className="score-bar-label">{bar.label}</span>
                <div className="score-bar-track">
                  <div
                    className={`score-bar-fill ${bar.cls}`}
                    style={{ width: loading ? "0%" : `${bar.pct}%` }}
                  />
                </div>
                <span className="score-bar-value">{loading ? "-" : `${bar.pct}%`}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {STATS_DATA.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className="stat-card">
              <div className="stat-title">
                <span className="stat-icon"><Icon size={16} /></span> {stat.label}
              </div>
              <div className="stat-value">
                {loading ? (
                  <div className="skeleton skeleton-number" />
                ) : (
                  <>
                    <strong>{stat.value}</strong>
                    <span>{stat.target}</span>
                  </>
                )}
              </div>
              <div className="stat-progress">
                <div
                  className="stat-progress-fill"
                  style={{ width: loading ? "0%" : `${stat.pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="section-card"
        style={{
          background: "linear-gradient(135deg, #0e1c14 0%, #0d1511 100%)",
          border: "1px solid #1f3827",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
          padding: "16px 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#152a1e",
              border: "1px solid #254a34",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "#4ade80",
            }}
          >
            <Bot size={22} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#ffffff" }}>FitOS AI Coach Studio</h2>
              <span style={{ fontSize: 11, background: "#1b3824", color: "#4ade80", padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>
                24/7 ADVISOR
              </span>
            </div>
            <p className="subtext" style={{ margin: "2px 0 0 0", fontSize: 13 }}>
              Ask personalized questions, get meal ideas for remaining macros, and diagnose stalls.
            </p>
          </div>
        </div>

        <Link
          to="/coach"
          className="primary-button"
          style={{
            padding: "10px 18px",
            fontSize: 13,
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            textDecoration: "none",
            borderRadius: 10,
          }}
        >
          <span>Open Coach Chat</span> <ArrowRight size={14} />
        </Link>
      </div>

      <div className="weekly-chart">
        <div className="weekly-chart-header">
          <div>
            <h2>Weekly Activity</h2>
            <p>Steps over the last 7 days</p>
          </div>
          {activeDaysCount > 0 && (
            <span style={{ color: "#4ade80", fontSize: 13, fontWeight: 600 }}>
              {activeDaysCount}/7 active days
            </span>
          )}
        </div>

        <div className="chart-area">
          <div className="chart-y-axis">
            <span>{Math.round(maxWeeklySteps / 1000)}k</span>
            <span>{Math.round((maxWeeklySteps * 0.75) / 1000)}k</span>
            <span>{Math.round((maxWeeklySteps * 0.5) / 1000)}k</span>
            <span>{Math.round((maxWeeklySteps * 0.25) / 1000)}k</span>
            <span>0</span>
          </div>

          <div className="chart-content">
            <div className="chart-grid">
              <div /><div /><div /><div /><div />
            </div>

            <div className="bars">
              {weekly.map((item, i) => (
                <div key={i} className="bar-column">
                  <div
                    className="activity-bar"
                    style={{ height: `${Math.min(100, (item.steps / maxWeeklySteps) * 100)}%` }}
                  />
                  <span>{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="ai-insight">
        <h2>AI Insight</h2>
        {insightLoading ? (
          <>
            <div className="skeleton skeleton-text wide" style={{ marginBottom: 6 }} />
            <div className="skeleton skeleton-text" />
          </>
        ) : (
          <p>{aiInsight || "No insight available right now."}</p>
        )}
      </div>
    </div>
  );
}
