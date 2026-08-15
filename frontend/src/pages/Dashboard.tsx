import { useEffect, useState } from "react";
import "../index.css";
import { getMeals, getTodayMetrics, updateTodayMetrics, getWeeklyMetrics, getInsight, getStreak } from "../services/api";
import { useAuth } from "../context/AuthContext";

const CALORIE_GOAL = 2400;
const PROTEIN_GOAL = 160;
const STEP_GOAL = 10000;
const SLEEP_GOAL = 8;

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

  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [steps, setSteps] = useState(0);
  const [sleepHours, setSleepHours] = useState(0);
  const [weekly, setWeekly] = useState<WeeklyPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  const [editingMetrics, setEditingMetrics] = useState(false);
  const [stepsInput, setStepsInput] = useState("");
  const [sleepInput, setSleepInput] = useState("");
  const [saving, setSaving] = useState(false);

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [mealsRes, metricsRes, weeklyRes, streakRes] = await Promise.all([
        getMeals(),
        getTodayMetrics(),
        getWeeklyMetrics(),
        getStreak(),
      ]);

      const meals = mealsRes.data.meals as { calories: number; protein: number }[];
      setTotalCalories(meals.reduce((sum, m) => sum + m.calories, 0));
      setTotalProtein(meals.reduce((sum, m) => sum + m.protein, 0));

      setSteps(metricsRes.data.metric.steps);
      setSleepHours(metricsRes.data.metric.sleepHours);
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

  const caloriesPct = Math.min(100, (totalCalories / CALORIE_GOAL) * 100);
  const proteinPct = Math.min(100, (totalProtein / PROTEIN_GOAL) * 100);
  const stepsPct = Math.min(100, (steps / STEP_GOAL) * 100);
  const sleepPct = Math.min(100, (sleepHours / SLEEP_GOAL) * 100);

  // Consistency score: how many of last 7 days had steps > 0
  const activeDaysCount = weekly.filter((w) => w.steps > 0).length;
  const consistencyPct = Math.round((activeDaysCount / 7) * 100);

  const fitnessScore = Math.round(
    (caloriesPct * 0.3 + proteinPct * 0.2 + stepsPct * 0.3 + sleepPct * 0.1 + consistencyPct * 0.1)
  );

  const maxWeeklySteps = Math.max(5000, ...weekly.map((w) => w.steps));

  const handleSaveMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateTodayMetrics(
        stepsInput ? Number(stepsInput) : undefined,
        sleepInput ? Number(sleepInput) : undefined
      );
      setStepsInput("");
      setSleepInput("");
      setEditingMetrics(false);
      loadAll();
      loadInsight();
    } catch (err) {
      console.error("Failed to update metrics:", err);
    } finally {
      setSaving(false);
    }
  };

  const STATS_DATA = [
    {
      id: "calories",
      icon: "🔥",
      label: "Calories",
      value: totalCalories.toLocaleString(),
      target: `/ ${CALORIE_GOAL.toLocaleString()} kcal`,
      pct: caloriesPct,
    },
    {
      id: "protein",
      icon: "🥩",
      label: "Protein",
      value: `${totalProtein}g`,
      target: `/ ${PROTEIN_GOAL}g`,
      pct: proteinPct,
    },
    {
      id: "steps",
      icon: "🏃",
      label: "Steps",
      value: steps.toLocaleString(),
      target: `/ ${STEP_GOAL.toLocaleString()}`,
      pct: stepsPct,
    },
    {
      id: "sleep",
      icon: "😴",
      label: "Sleep",
      value: `${sleepHours}h`,
      target: `/ ${SLEEP_GOAL}h`,
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
          {getGreeting()}{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
        </h1>
        <p>Here's your fitness overview for today.</p>
      </div>

      {/* Fitness Score + breakdown */}
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
              🔥 {streak}-day streak
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

      {/* Stat cards */}
      <div className="stats-grid">
        {STATS_DATA.map((stat) => (
          <div key={stat.id} className="stat-card">
            <div className="stat-title">
              <span className="stat-icon">{stat.icon}</span> {stat.label}
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
        ))}
      </div>

      {/* Update steps & sleep */}
      <div className="section-card">
        <div className="section-header">
          <h2>⚡ Update Steps & Sleep</h2>
          <button className="action-btn" onClick={() => setEditingMetrics((s) => !s)}>
            {editingMetrics ? "Cancel" : "Edit"}
          </button>
        </div>

        {editingMetrics && (
          <form onSubmit={handleSaveMetrics} style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="Steps"
              type="number"
              value={stepsInput}
              onChange={(e) => setStepsInput(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                flex: 1,
                background: "#0f1511",
                border: "1px solid #252d28",
                color: "#fff",
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            <input
              placeholder="Sleep (hrs)"
              type="number"
              step="0.1"
              value={sleepInput}
              onChange={(e) => setSleepInput(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                flex: 1,
                background: "#0f1511",
                border: "1px solid #252d28",
                color: "#fff",
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </form>
        )}
      </div>

      {/* Weekly chart */}
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

      {/* AI Insight */}
      <div className="ai-insight">
        <h2>🤖 AI Insight</h2>
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
