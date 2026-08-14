import '../index.css';

interface MacroCard {
  id: string;
  icon: string;
  label: string;
  value: string;
  target: string;
  progressPercentage: number;
}

interface MealItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  calories: string;
}

const MACROS: MacroCard[] = [
  { id: 'protein', icon: '🥩', label: 'Protein', value: '142g', target: '/ 160g', progressPercentage: 88 },
  { id: 'carbs', icon: '🍚', label: 'Carbs', value: '250g', target: '/ 300g', progressPercentage: 83 },
  { id: 'fats', icon: '🥑', label: 'Fats', value: '70g', target: '/ 82g', progressPercentage: 85 },
];

const MEALS: MealItem[] = [
  { id: 'breakfast', icon: '🍳', title: 'Breakfast', description: 'Eggs, oats & banana', calories: '520 kcal' },
  { id: 'lunch', icon: '🍗', title: 'Lunch', description: 'Chicken, rice & vegetables', calories: '680 kcal' },
  { id: 'snack', icon: '🥜', title: 'Snack', description: 'Peanut butter & whey shake', calories: '380 kcal' },
  { id: 'dinner', icon: '🍲', title: 'Dinner', description: 'Paneer, roti & vegetables', calories: '600 kcal' },
];

export default function Nutrition() {
  return (
    <div className="nutrition-page">
      {/* HEADER */}
      <div className="page-header">
        <h1>Nutrition</h1>
        <p>Track your daily nutrition and meals.</p>
      </div>

      {/* DAILY CALORIES CARD */}
      <div className="nutrition-card daily-calories-card">
        <div className="card-title">
          <span className="icon">🔥</span> Daily Calories
        </div>
        <div className="calories-value">
          <strong>2,180</strong>
          <span>/ 2,400 kcal</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: '90%' }} />
        </div>
        <p className="remaining-text">220 kcal remaining</p>
      </div>

      {/* MACROS GRID */}
      <div className="macros-grid">
        {MACROS.map((macro) => (
          <div key={macro.id} className="nutrition-card macro-card">
            <div className="card-title">
              <span className="icon">{macro.icon}</span> {macro.label}
            </div>
            <div className="macro-value">
              <strong>{macro.value}</strong>
              <span>{macro.target}</span>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${macro.progressPercentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* TODAY'S MEALS */}
      <div className="nutrition-card meals-section">
        <div className="meals-header">
          <h2>Today's Meals</h2>
          <button className="add-meal-btn">+ Add Meal</button>
        </div>

        <div className="meals-list">
          {MEALS.map((meal) => (
            <div key={meal.id} className="meal-item">
              <div className="meal-info">
                <span className="meal-icon">{meal.icon}</span>
                <div>
                  <h3>{meal.title}</h3>
                  <p>{meal.description}</p>
                </div>
              </div>
              <div className="meal-calories">{meal.calories}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI NUTRITION INSIGHT */}
      <div className="nutrition-card ai-insight-card">
        <div className="ai-insight-header">
          <span className="robot-icon">🤖</span>
          <h2>AI Nutrition Insight</h2>
        </div>
        <p>
          You're doing well with your nutrition today. You have 220 kcal remaining and only 18g of protein left to reach your daily target.
        </p>
      </div>
    </div>
  );
}