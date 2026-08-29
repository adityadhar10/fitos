import { useEffect, useState } from "react";
import "../index.css";
import { getMeals, addMeal, deleteMeal, getInsight, estimateNutritionFromText } from "../services/api";
import { useAuth } from "../context/AuthContext";
import FoodSearch from "../components/FoodSearch";
import FoodPhotoScan from "../components/FoodPhotoScan";
import WaterTracker from "../components/WaterTracker";
import {
  DEFAULT_CALORIE_GOAL,
  DEFAULT_PROTEIN_GOAL,
  DEFAULT_CARB_GOAL,
  DEFAULT_FAT_GOAL,
} from "../constants/goals";
import { Camera, X, Sparkles, Utensils, Bot, Trash2 } from "lucide-react";

interface Meal {
  id: string;
  type: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  createdAt?: string;
}

export default function Nutrition() {
  const { user } = useAuth();

  const calorieGoal = user?.calorieGoal ?? DEFAULT_CALORIE_GOAL;
  const proteinGoal = user?.proteinGoal ?? DEFAULT_PROTEIN_GOAL;
  const carbGoal = user?.carbGoal ?? DEFAULT_CARB_GOAL;
  const fatGoal = user?.fatGoal ?? DEFAULT_FAT_GOAL;
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [scanMode, setScanMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [estimating, setEstimating] = useState(false);

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);

  const [type, setType] = useState("Breakfast");
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [servings, setServings] = useState("1");
  const [baseNutrition, setBaseNutrition] = useState<{ calories: number; protein: number; carbs: number; fats: number } | null>(null);
  const [assumedIngredients, setAssumedIngredients] = useState<{ name: string; grams: number }[]>([]);

  useEffect(() => {
    if (!baseNutrition) return;
    const multiplier = parseFloat(servings) || 1;
    setCalories(String(Math.round(baseNutrition.calories * multiplier)));
    setProtein(String(Math.round(baseNutrition.protein * multiplier)));
    setCarbs(String(Math.round(baseNutrition.carbs * multiplier)));
    setFats(String(Math.round(baseNutrition.fats * multiplier)));
  }, [servings, baseNutrition]);

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

  const caloriesPct = Math.min(100, Math.round((totalCalories / calorieGoal) * 100));
  const proteinPct = Math.min(100, Math.round((totalProtein / proteinGoal) * 100));
  const carbsPct = Math.min(100, Math.round((totalCarbs / carbGoal) * 100));
  const fatsPct = Math.min(100, Math.round((totalFats / fatGoal) * 100));

  const remainingCalories = Math.max(0, calorieGoal - totalCalories);
  const remainingProtein = Math.max(0, proteinGoal - totalProtein);

    const handleEstimate = async (textOverride?: string) => {
    const textToEstimate = textOverride ?? description;
    if (!textToEstimate.trim()) return;
    setEstimating(true);
    try {
      const res = await estimateNutritionFromText(textToEstimate);
      const est = res.data.estimate;
      setCalories(String(est.calories));
      setProtein(String(est.protein));
      setCarbs(String(est.carbs));
      setFats(String(est.fats));
      setAssumedIngredients(res.data.ingredients || []);
    } catch (err) {
      console.error("Failed to estimate nutrition:", err);
    } finally {
      setEstimating(false);
    }
  };

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !calories) return;

    setSaving(true);
    try {
      await addMeal(
        type.toLowerCase(),
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
      setScanMode(false);
      loadMeals();
      loadInsight();
    } catch (err) {
      console.error("Failed to add meal:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteMeal(id);
      setMeals((prev) => prev.filter((m) => m.id !== id));
      loadInsight();
    } catch (err) {
      console.error("Failed to delete meal:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatMealType = (rawType: string) => {
    const lower = (rawType || "").toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  const fallbackInsight =
    remainingCalories > 0
      ? `You're doing well with your nutrition today. You have ${remainingCalories} kcal remaining and ${remainingProtein}g of protein left to reach your daily target.`
      : `You've hit your calorie goal for today, ${user?.name || "there"}. Nice work staying on track.`;

  return (
    <div className="nutrition-page page-enter">
      <div className="page-header">
        <h1>Nutrition</h1>
        <p>Track your daily meals, macros, and calories with AI-powered tools.</p>
      </div>

      <div className="nutrition-card daily-calories-card">
        <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "#4ade80", fontSize: 16 }}>●</span> Daily Calories
        </div>
        <div className="calories-value">
          <strong>{totalCalories.toLocaleString()}</strong>
          <span>/ {calorieGoal.toLocaleString()} kcal</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${caloriesPct}%` }} />
        </div>
        <p className="remaining-text">{remainingCalories} kcal remaining</p>
      </div>

      <div className="macros-grid">
        <div className="nutrition-card macro-card">
          <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#4ade80", fontSize: 14 }}>●</span> Protein
          </div>
          <div className="macro-value">
            <strong>{totalProtein}g</strong>
            <span>/ {proteinGoal}g</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${proteinPct}%`, background: "#4ade80" }} />
          </div>
        </div>
        <div className="nutrition-card macro-card">
          <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#38bdf8", fontSize: 14 }}>●</span> Carbs
          </div>
          <div className="macro-value">
            <strong>{totalCarbs}g</strong>
            <span>/ {carbGoal}g</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${carbsPct}%`, background: "#38bdf8" }} />
          </div>
        </div>
        <div className="nutrition-card macro-card">
          <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#fbbf24", fontSize: 14 }}>●</span> Fats
          </div>
          <div className="macro-value">
            <strong>{totalFats}g</strong>
            <span>/ {fatGoal}g</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${fatsPct}%`, background: "#fbbf24" }} />
          </div>
        </div>
      </div>

      <WaterTracker />

      <div className="nutrition-card meals-section">
        <div className="meals-header">
          <div>
            <h2>Today's Meals</h2>
            <p className="subtext" style={{ marginTop: 2, marginBottom: 0 }}>
              {meals.length} {meals.length === 1 ? "meal" : "meals"} logged today
            </p>
          </div>
          <div className="meals-header-actions" style={{ display: "flex", gap: 8 }}>
            <button
              className="tab-btn"
              style={{
                background: scanMode ? "#163a24" : "#1a241e",
                border: "1px solid #2d4535",
                color: "#4ade80",
                padding: "8px 14px",
                borderRadius: 10,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 600,
                fontSize: 13,
              }}
              onClick={() => {
                setScanMode(true);
                setShowForm(true);
              }}
              type="button"
            >
              <Camera size={14} /> AI Food Scan
            </button>
            <button
              className="action-btn"
              onClick={() => {
                setScanMode(false);
                setShowForm((s) => !s);
              }}
            >
              {showForm && !scanMode ? "Cancel" : "+ Add Meal"}
            </button>
          </div>
        </div>

        {showForm && scanMode && (
          <div style={{ marginBottom: 20, padding: 16, background: "#0b100d", borderRadius: 14, border: "1px solid #1f2e24" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <strong style={{ color: "#4ade80", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                <Bot size={16} /> Multimodal Food Photo Analyzer
              </strong>
              <button
                style={{ background: "transparent", border: "none", color: "#8a958e", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}
                onClick={() => {
                  setScanMode(false);
                  setShowForm(false);
                }}
              >
                <X size={14} /> Close
              </button>
            </div>
            <FoodPhotoScan
              onResult={(result) => {
                setDescription(result.description);
                setCalories(String(result.calories));
                setProtein(String(result.protein));
                setCarbs(String(result.carbs));
                setFats(String(result.fats));
                setType(formatMealType(result.mealType));
                setScanMode(false);
                setShowForm(true);
              }}
            />
          </div>
        )}

        {showForm && !scanMode && (
          <form
            onSubmit={handleAddMeal}
            style={{
              marginBottom: 24,
              padding: 16,
              background: "#0d1310",
              borderRadius: 14,
              border: "1px solid #202b23",
              display: "grid",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#9da69f", display: "flex", alignItems: "center", gap: 6 }}>
                {description && calories ? (<><Sparkles size={13} /> Review & Log Meal</>) : "Log a Meal"}
              </span>
              <button
                type="button"
                style={{ background: "transparent", border: "none", color: "#7a8580", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                onClick={() => setShowForm(false)}
              >
                <X size={13} /> Cancel
              </button>
            </div>

              <FoodSearch
              onSelect={(food) => {
                setDescription(food.name);
                setServings("1");
                setBaseNutrition({
                  calories: food.calories,
                  protein: food.protein,
                  carbs: food.carbs,
                  fats: food.fats,
                });
              }}
              onEstimateWithAI={(query) => {
                setDescription(query);
                setBaseNutrition(null);
                handleEstimate(query);
              }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10 }}>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "#080c0a",
                  border: "1px solid #233027",
                  color: "#fff",
                  outline: "none",
                }}
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
              </select>
              <input
                placeholder="Description (e.g. Grilled Chicken & Rice)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "#080c0a",
                  border: "1px solid #233027",
                  color: "#fff",
                  outline: "none",
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => handleEstimate()}
              disabled={!description.trim() || estimating}
              style={{
                background: "#163a24",
                border: "1px solid #2d4535",
                color: "#4ade80",
                padding: "9px 14px",
                borderRadius: 10,
                cursor: description.trim() ? "pointer" : "not-allowed",
                fontWeight: 600,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                opacity: description.trim() ? 1 : 0.5,
              }}
            >
              {estimating ? (<><Bot size={14} /> Estimating...</>) : (<><Sparkles size={14} /> Estimate calories & macros with AI</>)}
            </button>

              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: "#7a8580", display: "block", marginBottom: 4 }}>Servings</label>
                <input
                  placeholder="1"
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 10,
                    background: "#080c0a",
                    border: "1px solid #233027",
                    color: "#fff",
                    outline: "none",
                  }}
                />
              </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                            <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: "#7a8580", display: "block", marginBottom: 4 }}>Servings</label>
                <input
                  placeholder="1"
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 10,
                    background: "#080c0a",
                    border: "1px solid #233027",
                    color: "#fff",
                    outline: "none",
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#7a8580", display: "block", marginBottom: 4 }}>Calories (kcal)*</label>
                <input
                  placeholder="250"
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 10,
                    background: "#080c0a",
                    border: "1px solid #233027",
                    color: "#fff",
                    outline: "none",
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#7a8580", display: "block", marginBottom: 4 }}>Protein (g)</label>
                <input
                  placeholder="20"
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 10,
                    background: "#080c0a",
                    border: "1px solid #233027",
                    color: "#fff",
                    outline: "none",
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#7a8580", display: "block", marginBottom: 4 }}>Carbs (g)</label>
                <input
                  placeholder="30"
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 10,
                    background: "#080c0a",
                    border: "1px solid #233027",
                    color: "#fff",
                    outline: "none",
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#7a8580", display: "block", marginBottom: 4 }}>Fats (g)</label>
                <input
                  placeholder="8"
                  type="number"
                  value={fats}
                  onChange={(e) => setFats(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 10,
                    background: "#080c0a",
                    border: "1px solid #233027",
                    color: "#fff",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {assumedIngredients.length > 0 && (
              <div style={{
                background: "#0a110d",
                border: "1px solid #1b2e21",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 12,
                color: "#9da69f",
              }}>
                <strong style={{ color: "#4ade80", fontSize: 12 }}>AI assumed:</strong>{" "}
                {assumedIngredients.map((ing, i) => (
                  <span key={i}>
                    {ing.grams}g {ing.name}
                    {i < assumedIngredients.length - 1 ? ", " : ""}
                  </span>
                ))}
                {" "}— adjust the fields above if any of this looks off.
              </div>
            )}

            <button className="primary-button" type="submit" disabled={saving} style={{ marginTop: 6 }}>
              {saving ? "Saving..." : "Save Meal"}
            </button>
          </form>
        )}

        <div className="meals-list" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 68, borderRadius: 12 }} />
              ))}
            </div>
          )}
          {!loading && meals.length === 0 && (
            <div className="empty-state" style={{ padding: "32px 16px", textAlign: "center" }}>
              <Utensils className="empty-icon" size={24} style={{ marginBottom: 8, color: "#4ade80" }} />
              <p style={{ color: "#7a8580", fontSize: 14 }}>No meals logged today yet. Snap a photo with AI or add your first meal above.</p>
            </div>
          )}
          {!loading &&
            meals.map((meal) => (
              <div
                key={meal.id}
                className="meal-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  background: "#0d1310",
                  border: "1px solid #1c2720",
                  borderRadius: 14,
                  transition: "border-color 0.15s ease",
                }}
              >
                <div className="meal-info" style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "#152019",
                      border: "1px solid #233328",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#4ade80",
                    }}
                  >
                    {meal.type.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          color: "#4ade80",
                          background: "#11261a",
                          padding: "2px 8px",
                          borderRadius: 6,
                        }}
                      >
                        {formatMealType(meal.type)}
                      </span>
                      <h3
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: "#ffffff",
                          margin: 0,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {meal.description}
                      </h3>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: "#9da69f", background: "#131b16", padding: "2px 6px", borderRadius: 4, display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ color: "#4ade80" }}>●</span> P: {meal.protein}g
                      </span>
                      <span style={{ fontSize: 11, color: "#9da69f", background: "#131b16", padding: "2px 6px", borderRadius: 4, display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ color: "#38bdf8" }}>●</span> C: {meal.carbs}g
                      </span>
                      <span style={{ fontSize: 11, color: "#9da69f", background: "#131b16", padding: "2px 6px", borderRadius: 4, display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ color: "#fbbf24" }}>●</span> F: {meal.fats}g
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 17, fontWeight: 700, color: "#ffffff" }}>{meal.calories}</span>
                    <span style={{ fontSize: 12, color: "#7a8580", marginLeft: 3 }}>kcal</span>
                  </div>
                  <button
                    onClick={() => handleDeleteMeal(meal.id)}
                    disabled={deletingId === meal.id}
                    title="Delete meal"
                    style={{
                      background: "transparent",
                      border: "1px solid #28352d",
                      borderRadius: 8,
                      color: "#8a968f",
                      cursor: "pointer",
                      padding: "6px 8px",
                      fontSize: 12,
                      transition: "all 0.15s ease",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#ef4444";
                      e.currentTarget.style.color = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#28352d";
                      e.currentTarget.style.color = "#8a968f";
                    }}
                  >
                    {deletingId === meal.id ? "…" : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="nutrition-card ai-insight-card">
        <div className="ai-insight-header">
          <Bot className="robot-icon" size={18} />
          <h2>AI Nutrition Coach Insight</h2>
        </div>
        <p style={{ lineHeight: 1.6, color: "#cbd5e1" }}>
          {insightLoading ? "Thinking about your day..." : aiInsight || fallbackInsight}
        </p>
      </div>
    </div>
  );
}
