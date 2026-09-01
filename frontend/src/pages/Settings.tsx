import { useEffect, useState } from 'react';
import '../index.css';
import { useAuth } from '../context/AuthContext';
import { exportWorkoutCSV, exportNutritionCSV, exportWeightCSV } from '../services/api';
import { DEFAULT_STEP_GOAL } from '../constants/goals';
import { APP_VERSION } from '../constants/version';
import {
  User,
  Mail,
  Target,
  Footprints,
  AlertTriangle,
  Dumbbell,
  Utensils,
  Scale,
  Bell,
  Moon,
  Bot,
  Smartphone,
  Download,
  Info,
  Cpu,
  Layers,
  type LucideIcon,
} from 'lucide-react';

interface ExportButton {
  id: string;
  icon: LucideIcon;
  label: string;
  desc: string;
  fn: () => Promise<void>;
}

export default function Settings() {
  const { user, updateGoals } = useAuth();
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const [calorieGoal, setCalorieGoal] = useState('');
  const [proteinGoal, setProteinGoal] = useState('');
  const [carbGoal, setCarbGoal] = useState('');
  const [fatGoal, setFatGoal] = useState('');
  const [savingGoals, setSavingGoals] = useState(false);
  const [goalsMessage, setGoalsMessage] = useState<string | null>(null);
  const [goalsError, setGoalsError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setCalorieGoal(String(user.calorieGoal));
    setProteinGoal(String(user.proteinGoal));
    setCarbGoal(String(user.carbGoal));
    setFatGoal(String(user.fatGoal));
  }, [user]);

  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGoals(true);
    setGoalsMessage(null);
    setGoalsError(null);
    try {
      await updateGoals({
        calorieGoal: Number(calorieGoal),
        proteinGoal: Number(proteinGoal),
        carbGoal: Number(carbGoal),
        fatGoal: Number(fatGoal),
      });
      setGoalsMessage('Nutrition goals updated.');
    } catch {
      setGoalsError('Could not save goals. Check that all values are positive numbers.');
    } finally {
      setSavingGoals(false);
    }
  };

  const EXPORT_BUTTONS: ExportButton[] = [
    {
      id: 'workout',
      icon: Dumbbell,
      label: 'Workout History CSV',
      desc: 'All exercises, sets, reps and volume',
      fn: exportWorkoutCSV,
    },
    {
      id: 'nutrition',
      icon: Utensils,
      label: 'Nutrition Log CSV',
      desc: 'Every meal with macros logged',
      fn: exportNutritionCSV,
    },
    {
      id: 'weight',
      icon: Scale,
      label: 'Weight History CSV',
      desc: 'All body-weight weigh-ins over time',
      fn: exportWeightCSV,
    },
  ];

  const PREFERENCES: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Bell, label: 'Notifications', value: 'Enabled' },
    { icon: Moon, label: 'Dark Mode', value: 'Enabled' },
    { icon: Bot, label: 'AI Insights', value: 'Enabled' },
    { icon: Smartphone, label: 'PWA Install', value: 'Available' },
  ];

  const handleExport = async (btn: ExportButton) => {
    setExporting(btn.id);
    setExportError(null);
    try {
      await btn.fn();
    } catch {
      setExportError(`Failed to export ${btn.label}. Make sure you have data logged.`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="page-container page-enter">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your FitOS profile and export your data.</p>
      </div>

      {/* ── PROFILE ── */}
      <div className="section-card">
        <h2 className="section-title">Profile</h2>
        <div className="settings-list">
          <div className="settings-item">
            <span className="label"><span className="icon"><User size={16} /></span> Name</span>
            <span className="value">{user?.name ?? '—'}</span>
          </div>
          <div className="settings-item">
            <span className="label"><span className="icon"><Mail size={16} /></span> Email</span>
            <span className="value">{user?.email ?? '—'}</span>
          </div>
          <div className="settings-item">
            <span className="label"><span className="icon"><Target size={16} /></span> Fitness Goal</span>
            <span className="value">Build Muscle</span>
          </div>
          <div className="settings-item">
            <span className="label"><span className="icon"><Footprints size={16} /></span> Daily Step Goal</span>
            <span className="value">{DEFAULT_STEP_GOAL.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ── NUTRITION GOALS ── */}
      <div className="section-card">
        <h2 className="section-title">Nutrition Goals</h2>
        <p className="subtext" style={{ marginBottom: 16 }}>
          Customize your daily calorie and macro targets. Dashboard and Nutrition pages use these values.
        </p>

        {goalsError && (
          <div className="export-error-banner" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={14} /> {goalsError}
          </div>
        )}
        {goalsMessage && (
          <div style={{ color: '#4ade80', fontSize: 14, marginBottom: 12 }}>{goalsMessage}</div>
        )}

        <form onSubmit={handleSaveGoals} className="goals-form">
          <div className="goals-form-grid">
            <label className="goals-field">
              <span>Calories (kcal)</span>
              <input
                type="number"
                min={1}
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(e.target.value)}
                required
              />
            </label>
            <label className="goals-field">
              <span>Protein (g)</span>
              <input
                type="number"
                min={1}
                value={proteinGoal}
                onChange={(e) => setProteinGoal(e.target.value)}
                required
              />
            </label>
            <label className="goals-field">
              <span>Carbs (g)</span>
              <input
                type="number"
                min={1}
                value={carbGoal}
                onChange={(e) => setCarbGoal(e.target.value)}
                required
              />
            </label>
            <label className="goals-field">
              <span>Fats (g)</span>
              <input
                type="number"
                min={1}
                value={fatGoal}
                onChange={(e) => setFatGoal(e.target.value)}
                required
              />
            </label>
          </div>
          <button className="primary-button" type="submit" disabled={savingGoals}>
            {savingGoals ? 'Saving…' : 'Save Goals'}
          </button>
        </form>
      </div>

      {/* ── SCIENCE-BASED TDEE & MACRO CALCULATOR ── */}

      {/* ── PREFERENCES ── */}
      <div className="section-card">
        <h2 className="section-title">Preferences</h2>
        <div className="settings-list">
          {PREFERENCES.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="settings-item">
                <span className="label">
                  <span className="icon"><Icon size={16} /></span> {item.label}
                </span>
                <span className="badge">{item.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── EXPORT DATA ── */}
      <div className="section-card">
        <div className="section-header" style={{ marginBottom: 4 }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Export Data</h2>
        </div>
        <p className="subtext" style={{ marginBottom: 16 }}>
          Download your fitness data as CSV files, ready for spreadsheets or analysis.
        </p>

        {exportError && (
          <div className="export-error-banner" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={14} /> {exportError}
          </div>
        )}

        <div className="export-buttons-list">
          {EXPORT_BUTTONS.map((btn) => {
            const Icon = btn.icon;
            return (
              <div key={btn.id} className="export-row">
                <div className="export-row-info">
                  <span className="export-row-icon"><Icon size={18} /></span>
                  <div>
                    <div className="export-row-label">{btn.label}</div>
                    <div className="export-row-desc">{btn.desc}</div>
                  </div>
                </div>
                <button
                  className="export-download-btn"
                  onClick={() => handleExport(btn)}
                  disabled={exporting === btn.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {exporting === btn.id ? 'Downloading…' : (<><Download size={14} /> Download</>)}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ABOUT ── */}
      <div className="section-card">
        <h2 className="section-title">About</h2>
        <div className="settings-list">
          <div className="settings-item">
            <span className="label"><span className="icon"><Info size={16} /></span> Version</span>
            <span className="value">v{APP_VERSION}</span>
          </div>
          <div className="settings-item">
            <span className="label"><span className="icon"><Cpu size={16} /></span> AI Engine</span>
            <span className="value">Gemini 3.7 Flash</span>
          </div>
          <div className="settings-item">
            <span className="label"><span className="icon"><Layers size={16} /></span> Stack</span>
            <span className="value">React 19 · Express · PostgreSQL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
