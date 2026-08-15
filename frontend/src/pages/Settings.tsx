import { useState } from 'react';
import '../index.css';
import { useAuth } from '../context/AuthContext';
import { exportWorkoutCSV, exportNutritionCSV, exportWeightCSV } from '../services/api';

interface ExportButton {
  id: string;
  icon: string;
  label: string;
  desc: string;
  fn: () => Promise<void>;
}

export default function Settings() {
  const { user } = useAuth();
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const EXPORT_BUTTONS: ExportButton[] = [
    {
      id: 'workout',
      icon: '🏋️',
      label: 'Workout History CSV',
      desc: 'All exercises, sets, reps and volume',
      fn: exportWorkoutCSV,
    },
    {
      id: 'nutrition',
      icon: '🥗',
      label: 'Nutrition Log CSV',
      desc: 'Every meal with macros logged',
      fn: exportNutritionCSV,
    },
    {
      id: 'weight',
      icon: '⚖️',
      label: 'Weight History CSV',
      desc: 'All body-weight weigh-ins over time',
      fn: exportWeightCSV,
    },
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
        <h1>Settings ⚙️</h1>
        <p>Manage your FitOS profile and export your data.</p>
      </div>

      {/* ── PROFILE ── */}
      <div className="section-card">
        <h2 className="section-title">Profile</h2>
        <div className="settings-list">
          <div className="settings-item">
            <span className="label"><span className="icon">👤</span> Name</span>
            <span className="value">{user?.name ?? '—'}</span>
          </div>
          <div className="settings-item">
            <span className="label"><span className="icon">📧</span> Email</span>
            <span className="value">{user?.email ?? '—'}</span>
          </div>
          <div className="settings-item">
            <span className="label"><span className="icon">🎯</span> Fitness Goal</span>
            <span className="value">Build Muscle</span>
          </div>
          <div className="settings-item">
            <span className="label"><span className="icon">👟</span> Daily Step Goal</span>
            <span className="value">10,000</span>
          </div>
        </div>
      </div>

      {/* ── PREFERENCES ── */}
      <div className="section-card">
        <h2 className="section-title">Preferences</h2>
        <div className="settings-list">
          {[
            { icon: '🔔', label: 'Notifications', value: 'Enabled' },
            { icon: '🌙', label: 'Dark Mode',      value: 'Enabled' },
            { icon: '🤖', label: 'AI Insights',    value: 'Enabled' },
            { icon: '📱', label: 'PWA Install',    value: 'Available' },
          ].map((item, i) => (
            <div key={i} className="settings-item">
              <span className="label">
                <span className="icon">{item.icon}</span> {item.label}
              </span>
              <span className="badge">{item.value}</span>
            </div>
          ))}
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
          <div className="export-error-banner">
            ⚠️ {exportError}
          </div>
        )}

        <div className="export-buttons-list">
          {EXPORT_BUTTONS.map((btn) => (
            <div key={btn.id} className="export-row">
              <div className="export-row-info">
                <span className="export-row-icon">{btn.icon}</span>
                <div>
                  <div className="export-row-label">{btn.label}</div>
                  <div className="export-row-desc">{btn.desc}</div>
                </div>
              </div>
              <button
                className="export-download-btn"
                onClick={() => handleExport(btn)}
                disabled={exporting === btn.id}
              >
                {exporting === btn.id ? 'Downloading…' : '⬇ Download'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── ABOUT ── */}
      <div className="section-card">
        <h2 className="section-title">About</h2>
        <div className="settings-list">
          <div className="settings-item">
            <span className="label"><span className="icon">🚀</span> Version</span>
            <span className="value">v2.0.0</span>
          </div>
          <div className="settings-item">
            <span className="label"><span className="icon">🤖</span> AI Engine</span>
            <span className="value">Gemini 2.0 Flash</span>
          </div>
          <div className="settings-item">
            <span className="label"><span className="icon">⚡</span> Stack</span>
            <span className="value">React 19 · Express · PostgreSQL</span>
          </div>
        </div>
      </div>
    </div>
  );
}