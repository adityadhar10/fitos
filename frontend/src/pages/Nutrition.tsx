import { useEffect, useState } from "react";
import "../index.css";
import { getMeals, addMeal, getInsight } from "../services/api";
import { useAuth } from "../context/AuthContext";
import FoodSearch from "../components/FoodSearch";

interface Meal {
  id: string;
  type: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const MEAL_ICONS: Record<string, string> = {
  Breakfast: "🍳",
  Lunch: "🍗",
  Snack: "🥜",
  Dinner: "🍲",
};

const CALORIE_GOAL = 2400;
const PROTEIN_GOAL = 160;
const CARB_GOAL = 300;
const FAT_GOAL = 82;

export default function Nutrition() {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);

  const [type, setType] = useState("Breakfast");
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");

  const loadMeals = () => {
    setLoading(true);
    getMeals()
      .then((res) => setMeals(res.data.meals))
      .catch((err) => console.error("Failed to load meals:", err))
      .finally(() => setLoading(false));
  };

  const loadInsight = () => {
    setInsightLoading(true);
    getInsight()
      .then((res) => setAiInsight(res.data.insight))
      .catch((err) => console.error("Failed to load AI insight:", err))
      .finally(() => setInsightLoading(false));
  };

  useEffect(() => {
    loadMeals();
    loadInsight();
  }, []);

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFats = meals.reduce((sum, m) => sum + m.fats, 0);

  const caloriesPct = Math.min(100, Math.round((totalCalories / CALORIE_GOAL) * 100));
  const proteinPct = Math.min(100, Math.round((totalProtein / PROTEIN_GOAL) * 100));
  const carbsPct = Math.min(100, Math.round((totalCarbs / CARB_GOAL) * 100));
  const fatsPct = Math.min(100, Math.round((totalFats / FAT_GOAL) * 100));

  const remainingCalories = Math.max(0, CALORIE_GOAL - totalCalories);
  const remainingProtein = Math.max(0, PROTEIN_GOAL - totalProtein);

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !calories) return;

    setSaving(true);
    try {
      await addMeal(
        type,
        description,
        Number(calories),
        protein ? Number(protein) : undefined,
        carbs ? Number(carbs) : undefined,
        fats ? Number(fats) : undefined
      );
      setDescription("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFats("");
      setShowForm(false);
      loadMeals();
      loadInsight();
    } catch (err) {
      console.error("Failed to add meal:", err);
    } finally {
      setSaving(false);
    }
  };

  const fallbackInsight =
    remainingCalories > 0
      ? `You're doing well with your nutrition today. You have ${remainingCalories} kcal remaining and ${remainingProtein}g of protein left to reach your daily target.`
      : `You've hit your calorie goal for today, ${user?.name || "there"}. Nice work staying on track.`;

  return (
    <div className="nutrition-page">
      <div className="page-header">
        <h1>Nutrition</h1>
        <p>Track your daily nutrition and meals.</p>
      </div>

      <div className="nutrition-card daily-calories-card">
        <div className="card-title">
          <span className="icon">🔥</span> Daily Calories
        </div>
        <div className="calories-value">
          <strong>{totalCalories.toLocaleString()}</strong>
          <span>/ {CALORIE_GOAL.toLocaleString()} kcal</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${caloriesPct}%` }} />
        </div>
        <p className="remaining-text">{remainingCalories} kcal remaining</p>
      </div>

      <div className="macros-grid">
        <div className="nutrition-card macro-card">
          <div className="card-title">
            <span className="icon">🥩</span> Protein
          </div>
          <div className="macro-value">
            <strong>{totalProtein}g</strong>
            <span>/ {PROTEIN_GOAL}g</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${proteinPct}%` }} />
          </div>
        </div>
        <div className="nutrition-card macro-card">
          <div className="card-title">
            <span className="icon">🍚</span> Carbs
          </div>
          <div className="macro-value">
            <strong>{totalCarbs}g</strong>
            <span>/ {CARB_GOAL}g</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${carbsPct}%` }} />
          </div>
        </div>
        <div className="nutrition-card macro-card">
          <div className="card-title">
            <span className="icon">🥑</span> Fats
          </div>
          <div className="macro-value">
            <strong>{totalFats}g</strong>
            <span>/ {FAT_GOAL}g</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${fatsPct}%` }} />
          </div>
        </div>
      </div>

      <div className="nutrition-card meals-section">
        <div className="meals-header">
          <h2>Today's Meals</h2>
          <button className="add-meal-btn" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "+ Add Meal"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAddMeal} style={{ marginBottom: 20, display: "grid", gap: 10 }}>
            <FoodSearch
              onSelect={(food) => {
                setDescription(food.name);
                setCalories(String(food.calories));
                setProtein(String(food.protein));
                setCarbs(String(food.carbs));
                setFats(String(food.fats));
              }}
            />
            <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: 8, borderRadius: 8 }}>
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Snack</option>
              <option>Dinner</option>
            </select>
            <input
              placeholder="Description (e.g. Eggs, oats & banana)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{ padding: 8, borderRadius: 8 }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              <input
                placeholder="Calories"
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                required
                style={{ padding: 8, borderRadius: 8 }}
              />
              <input
                placeholder="Protein (g)"
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                style={{ padding: 8, borderRadius: 8 }}
              />
              <input
                placeholder="Carbs (g)"
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                style={{ padding: 8, borderRadius: 8 }}
              />
              <input
                placeholder="Fats (g)"
                type="number"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
                style={{ padding: 8, borderRadius: 8 }}
              />
            </div>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Meal"}
            </button>
          </form>
        )}

        <div className="meals-list">
          {loading && <p>Loading meals...</p>}
          {!loading && meals.length === 0 && <p>No meals logged today yet.</p>}
          {!loading &&
            meals.map((meal) => (
              <div key={meal.id} className="meal-item">
                <div className="meal-info">
                  <span className="meal-icon">{MEAL_ICONS[meal.type] || "🍽️"}</span>
                  <div>
                    <h3>{meal.type}</h3>
                    <p>{meal.description}</p>
                  </div>
                </div>
                <div className="meal-calories">{meal.calories} kcal</div>
              </div>
            ))}
        </div>
      </div>

      <div className="nutrition-card ai-insight-card">
        <div className="ai-insight-header">
          <span className="robot-icon">🤖</span>
          <h2>AI Nutrition Insight</h2>
        </div>
        <p>{insightLoading ? "Thinking about your day..." : aiInsight || fallbackInsight}</p>
      </div>
    </div>
  );
}
