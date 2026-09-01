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
      {/* Top Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>
            {getGreeting()}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="dashboard-subtitle">Your daily health metrics, targets, and personalized actions.</p>
        </div>
        {streak > 0 && (
          <div className="dashboard-streak-pill">
            <span className="streak-dot" />
            <span>{streak}-day active streak</span>
          </div>
        )}
      </div>

      {/* TIER 1: Current Status Overview (Fitness Score + Key Stats) */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Current Status</h2>
        </div>
        <div className="dashboard-status-grid">
          {/* Main Fitness Score Card */}
          <div className="fitness-score-hero-card">
            <div className="hero-card-header">
              <div className="hero-card-title-group">
                <span className="card-kicker">OVERALL HEALTH</span>
                <h3 className="hero-card-title">Fitness Score</h3>
              </div>
              <span className="score-summary-badge">
                {fitnessScore >= 80 ? "Optimal" : fitnessScore >= 50 ? "On Track" : "In Progress"}
              </span>
            </div>

            <div className="hero-score-content">
              <div className="score-ring">
                <svg viewBox="0 0 140 140">
                  <circle className="bg" cx="70" cy="70" r="58" />
                  <circle
                    className="progress"
                    cx="70"
                    cy="70"
                    r="58"
                    style={{
                      strokeDashoffset: 364 - (fitnessScore / 100) * 364,
                    }}
                  />
                </svg>
                <div className="score-number">
                  <strong>{loading ? "-" : fitnessScore}</strong>
                  <span>/ 100</span>
                </div>
              </div>

              <div className="score-breakdown-container">
                <div className="score-breakdown-title">Score Composition</div>
                <div className="score-breakdown">
                  {SCORE_BARS.map((bar) => (
                    <div key={bar.label} className="score-bar-row">
                      <span className="score-bar-label">{bar.label}</span>
                      <div className="score-bar-track">
                        <div
                          className={`score-bar-fill ${bar.cls}`}
                          style={{ width: loading ? "0%" : `${Math.min(100, bar.pct)}%` }}
                        />
                      </div>
                      <span className="score-bar-value">{loading ? "-" : `${bar.pct}%`}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 4 Key Metric Cards (2x2 Grid) */}
          <div className="stats-metric-grid">
            {STATS_DATA.map((stat) => {
              const Icon = stat.icon;
              const pctInt = Math.round(stat.pct);
              return (
                <div key={stat.id} className="stat-metric-card">
                  <div className="stat-card-top">
                    <div className="stat-label-group">
                      <span className="stat-icon-wrap"><Icon size={15} /></span>
                      <span className="stat-card-label">{stat.label}</span>
                    </div>
                    <span className="stat-pct-badge">{loading ? "--" : `${pctInt}%`}</span>
                  </div>

                  <div className="stat-card-value">
                    {loading ? (
                      <div className="skeleton skeleton-number" />
                    ) : (
                      <>
                        <strong>{stat.value}</strong>
                        <span className="stat-target-label">{stat.target}</span>
                      </>
                    )}
                  </div>

                  <div className="stat-progress-track">
                    <div
                      className="stat-progress-bar"
                      style={{ width: loading ? "0%" : `${Math.min(100, stat.pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TIER 2: What To Do Next (Actions & Recommendations) */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">What To Do Next</h2>
        </div>
        <div className="dashboard-actions-group">
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

          <GettingStartedChecklist
            hasMeal={totalCalories > 0}
            hasWorkout={hasWorkout}
            hasWeightEntry={hasWeightEntry}
            hasVisitedCoach={hasVisitedCoach}
          />

          <div className="coach-shortcut-card">
            <div className="coach-shortcut-info">
              <div className="coach-shortcut-icon">
                <Bot size={18} />
              </div>
              <div className="coach-shortcut-text">
                <div className="coach-shortcut-title-row">
                  <h3 className="coach-shortcut-title">FitOS AI Coach Studio</h3>
                  <span className="coach-badge">24/7 ADVISOR</span>
                </div>
                <p className="coach-shortcut-desc">
                  Ask questions about remaining macros, workout adjustments, or plateau diagnosis.
                </p>
              </div>
            </div>

            <Link to="/coach" className="coach-action-btn">
              <span>Open Coach Chat</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* TIER 3: Trends & Insights (Weekly History + AI Intelligence) */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Trends & Analysis</h2>
        </div>
        <div className="dashboard-insights-grid">
          {/* Weekly Activity Chart */}
          <div className="weekly-activity-card">
            <div className="card-header-row">
              <div className="card-header-title-group">
                <h3 className="card-title">Weekly Activity</h3>
                <p className="card-subtitle">Daily step counts over the last 7 days</p>
              </div>
              {activeDaysCount > 0 && (
                <span className="active-days-badge">
                  {activeDaysCount} of 7 active days
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
                        title={`${item.day}: ${item.steps.toLocaleString()} steps`}
                      />
                      <span className="bar-day-label">{item.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Insight Card */}
          <div className="ai-insight-card">
            <div className="card-header-row">
              <div className="card-header-title-group">
                <h3 className="card-title">Daily AI Insight</h3>
                <p className="card-subtitle">Automated feedback based on recent performance</p>
              </div>
            </div>

            <div className="ai-insight-content">
              {insightLoading ? (
                <div className="ai-insight-skeleton">
                  <div className="skeleton skeleton-text wide" style={{ marginBottom: 8 }} />
                  <div className="skeleton skeleton-text wide" style={{ marginBottom: 8 }} />
                  <div className="skeleton skeleton-text short" />
                </div>
              ) : (
                <p className="ai-insight-text">
                  {aiInsight || "Log your daily activity and meals to generate personalized AI coaching insights."}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
