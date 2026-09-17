import { useEffect, useState, useMemo } from "react";
import type { MuscleCategory } from "../data/exercises";
import "../index.css";
import { getTodayMetrics, updateTodayMetrics, getWeeklyMetrics } from "../services/api";
import AutoStepTracker from "../components/AutoStepTracker";
import { 
  type ActivityConfig, 
  DEFAULT_ACTIVITY_CONFIG, 
  getActivityConfig, 
  setActivityConfig, 
  calculateAdaptiveTarget, 
  calculateSleepTarget, 
  getTargetExplanation 
} from "../services/activityStorage";
import { Flame, Clock, Footprints, MapPin, Moon, AlertCircle, Settings, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export default function Activity() {
  const [steps, setSteps] = useState(0);
  const [sleepHours, setSleepHours] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Adaptive Target State
  const [config, setConfigState] = useState<ActivityConfig>(DEFAULT_ACTIVITY_CONFIG);
  const [showConfig, setShowConfig] = useState(false);
  const [weekly, setWeekly] = useState<{ day: string; steps: number }[]>([]);
  
  // Manual Entry State
  const [showForm, setShowForm] = useState(false);
  const [stepsInput, setStepsInput] = useState("");
  const [sleepInput, setSleepInput] = useState("");
  const [saving, setSaving] = useState(false);

  const currentDay = useMemo(() => new Date().toLocaleDateString('en-US', { weekday: 'short' }), []);

  const loadData = () => {
    setLoading(true);
    
    // Load config
    const savedConfig = getActivityConfig();
    setConfigState(savedConfig);

    getTodayMetrics()
      .then((res) => {
        setSteps(res.data.metric.steps || 0);
        setSleepHours(res.data.metric.sleepHours || 0);
      })
      .catch((err) => console.error("Failed to load activity data:", err))
      .finally(() => setLoading(false));

    getWeeklyMetrics()
      .then((res) => setWeekly(res.data.weekly ?? []))
      .catch((err) => console.error("Failed to load weekly activity:", err));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Adaptive Calculations
  const recentAverage = useMemo(() => {
    if (!weekly || weekly.length === 0) return 0;
    const total = weekly.reduce((acc, curr) => acc + (curr.steps || 0), 0);
    return total / weekly.length;
  }, [weekly]);

  const stepTarget = useMemo(() => calculateAdaptiveTarget(config, currentDay, recentAverage), [config, currentDay, recentAverage]);
  const sleepTarget = useMemo(() => calculateSleepTarget(config), [config]);
  const isTrainingDay = config.trainingDays.includes(currentDay);
  
  // Progress
  const stepsPct = Math.min(100, Math.round((steps / stepTarget) * 100));
  const sleepPct = Math.min(100, Math.round((sleepHours / sleepTarget) * 100));
  
  const recoveryScore = Math.round((stepsPct * 0.4) + (sleepPct * 0.6));

  const caloriesBurned = Math.round(steps * 0.04);
  const activeMinutes = Math.round(steps / 100);
  const hours = Math.floor(activeMinutes / 60);
  const minutes = activeMinutes % 60;
  const activeTimeLabel = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  const distance = (steps * 0.00075).toFixed(2);

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
      setShowForm(false);
      loadData();
    } catch (err) {
      console.error("Failed to update metrics:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setActivityConfig(config);
    setShowConfig(false);
  };

  return (
    <>
      <div className="page-container page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
        
        {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: '12px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 'bold' }}>Activity</h1>
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>
            Your adaptive movement and recovery plan
          </p>
        </div>
        <button 
          className="action-btn" 
          onClick={() => setShowConfig(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Settings size={16} /> Edit Plan
        </button>
      </div>



      {/* TODAY'S PLAN */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Today's Plan</h2>
        <div className="section-card" style={{ margin: 0, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'linear-gradient(145deg, #0f1712, #132018)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase' }}>
                <Target size={14} /> <span>🎯 Recommended</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px', color: 'var(--text-primary)' }}>
                {stepTarget.toLocaleString()} <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>steps</span>
              </div>
            </div>
            
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-accent)', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase' }}>
                <Footprints size={14} /> <span>🚶 Detected</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px', color: 'var(--text-primary)' }}>
                {loading ? "–" : steps.toLocaleString()} <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>steps</span>
              </div>
            </div>
          </div>

          <div>
            <div style={{ height: '12px', background: 'var(--bg-elevated)', borderRadius: '6px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ width: `${stepsPct}%`, height: '100%', background: 'var(--primary-accent)', transition: 'width 0.5s ease-out' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold' }}>
              <span style={{ color: 'var(--primary-accent)' }}>{stepsPct}% COMPLETE</span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {steps < stepTarget ? `${(stepTarget - steps).toLocaleString()} remaining` : 'Target reached!'}
              </span>
            </div>
        </div>
      </div>

      {/* TODAY'S OVERVIEW */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Today's Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px', width: '100%' }}>
          <div className="section-card" style={{ display: 'flex', flexDirection: 'column', padding: '16px', gap: '8px', margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
              <span>Steps</span> <Footprints size={16} color="var(--primary-accent)" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{loading ? "–" : steps.toLocaleString()}</div>
          </div>
          <div className="section-card" style={{ display: 'flex', flexDirection: 'column', padding: '16px', gap: '8px', margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
              <span>Distance</span> <MapPin size={16} color="#a855f7" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{loading ? "–" : distance} <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>km</span></div>
          </div>
          <div className="section-card" style={{ display: 'flex', flexDirection: 'column', padding: '16px', gap: '8px', margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
              <span>Calories</span> <Flame size={16} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{loading ? "–" : caloriesBurned} <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>kcal</span></div>
          </div>
          <div className="section-card" style={{ display: 'flex', flexDirection: 'column', padding: '16px', gap: '8px', margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
              <span>Active Time</span> <Clock size={16} color="#38bdf8" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{loading ? "–" : activeTimeLabel}</div>
          </div>
        </div>
      </div>

      {/* RECOVERY & SLEEP ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* RECOVERY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Recovery</h2>
          <div className="section-card" style={{ margin: 0, height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: recoveryScore >= 70 ? 'var(--primary-accent)' : '#f59e0b' }}>
              {loading ? "–" : recoveryScore} <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>/ 100</span>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span>Movement Load</span> <strong>{stepsPct}%</strong>
              </div>
              <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${stepsPct}%`, height: '100%', background: 'var(--primary-accent)' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span>Sleep Restoration</span> <strong>{sleepPct}%</strong>
              </div>
              <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${sleepPct}%`, height: '100%', background: '#38bdf8' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* SLEEP */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Sleep</h2>
          <div className="section-card" style={{ margin: 0, height: '100%', display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Moon size={24} color="#38bdf8" />
              </div>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                  {loading ? "–" : `${sleepHours}h`} <span style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>/ {sleepTarget}h</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Target derived from your {config.wakeTime} - {config.sleepTime} schedule.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVITY INSIGHTS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Activity Insights</h2>
        <div className="section-card" style={{ margin: 0, padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'rgba(34, 197, 94, 0.05)' }}>
          <AlertCircle size={20} color="var(--primary-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
              {getTargetExplanation(config, currentDay, stepTarget, recentAverage)}
            </span>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              You are {stepsPct}% toward today's movement target.
            </span>
            {isTrainingDay && (
              <span style={{ fontSize: '14px', color: '#f59e0b', fontWeight: 'bold', marginTop: '4px' }}>
                Heavy training day — prioritize recovery.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 7-DAY ACTIVITY */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>7-Day Activity</h2>
        <div className="section-card" style={{ margin: 0, padding: '24px 16px', height: '300px' }}>
          {weekly.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-card)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-elevated)', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--primary-accent)' }}
                />
                <ReferenceLine y={stepTarget} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'top', value: 'Target', fill: '#f59e0b', fontSize: 12 }} />
                <Bar dataKey="steps" fill="var(--primary-accent)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              No history available.
            </div>
          )}
        </div>
      </div>

      {/* LIVE MOTION PEDOMETER */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Live Motion Pedometer</h2>
        {!loading && (
          <div style={{ margin: 0 }}>
            <AutoStepTracker
              initialSteps={steps}
              onStepsChange={(newSteps) => setSteps(newSteps)}
            />
          </div>
        )}
      </div>

      {/* MANUAL ADJUSTMENT (FALLBACK) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Manual Adjustment</h2>
        <div className="section-card" id="update-activity-section" style={{ margin: 0 }}>
          <div className="section-header" style={{ marginBottom: showForm ? '16px' : 0 }}>
            <div>
              <p className="subtext" style={{ margin: 0 }}>Only as a fallback. Use manual entry if sensor tracking is unavailable.</p>
            </div>
            <button className="action-btn" onClick={() => setShowForm((s) => !s)}>
              {showForm ? "Cancel" : "Adjust Activity"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSaveMetrics} className="activity-edit-form">
              <input
                placeholder="Steps (e.g. 8000)"
                type="number"
                value={stepsInput}
                onChange={(e) => setStepsInput(e.target.value)}
                className="metric-input"
              />
              <input
                placeholder="Sleep hrs (e.g. 7.5)"
                type="number"
                step="0.1"
                value={sleepInput}
                onChange={(e) => setSleepInput(e.target.value)}
                className="metric-input"
              />
              <button className="primary-button" type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save Corrections"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
    </div>
    
      {/* CONFIG MODAL */}
      {showConfig && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#111713',
            border: '1px solid #1e2620',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #1e2620',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 'bold' }}>Edit Activity Plan</h2>
                <p style={{ margin: 0, fontSize: '14px', color: '#7a8580' }}>
                  Personalize your daily activity and recovery targets.
                </p>
              </div>
              <button 
                onClick={() => { setShowConfig(false); setConfigState(getActivityConfig()); }}
                style={{ 
                  background: 'transparent', border: 'none', color: '#7a8580', cursor: 'pointer', 
                  padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseOut={(e) => e.currentTarget.style.color = '#7a8580'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* SECTION 1 — GOAL */}
              <div>
                <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>Primary Goal</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                  {["Fat Loss", "Muscle Gain", "Weight Gain", "Maintenance", "General Fitness"].map(goal => {
                    const isSelected = config.goal === goal;
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => setConfigState({...config, goal: goal as any})}
                        style={{
                          padding: '12px',
                          background: isSelected ? 'rgba(74, 222, 128, 0.1)' : 'transparent',
                          border: `1px solid ${isSelected ? '#4ade80' : '#1e2620'}`,
                          borderRadius: '8px',
                          color: isSelected ? '#ffffff' : '#7a8580',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: isSelected ? '600' : '400',
                          transition: 'all 0.2s',
                          textAlign: 'center'
                        }}
                      >
                        {goal}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* SECTION 2 — DAILY SCHEDULE */}
              <div>
                <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>Daily Schedule</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#7a8580' }}>Wake Time</label>
                    <input 
                      type="time" 
                      className="metric-input" 
                      value={config.wakeTime} 
                      onChange={e => setConfigState({...config, wakeTime: e.target.value})} 
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#7a8580' }}>Sleep Time</label>
                    <input 
                      type="time" 
                      className="metric-input" 
                      value={config.sleepTime} 
                      onChange={e => setConfigState({...config, sleepTime: e.target.value})} 
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3 — ACTIVITY LEVEL */}
              <div>
                <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>Activity Level</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {["Sedentary", "Light", "Moderate", "Active"].map(level => {
                    const isSelected = config.activityLevel === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setConfigState({...config, activityLevel: level as any})}
                        style={{
                          padding: '12px',
                          background: isSelected ? 'rgba(74, 222, 128, 0.1)' : 'transparent',
                          border: `1px solid ${isSelected ? '#4ade80' : '#1e2620'}`,
                          borderRadius: '8px',
                          color: isSelected ? '#ffffff' : '#7a8580',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: isSelected ? '600' : '400',
                          transition: 'all 0.2s',
                          textAlign: 'center'
                        }}
                      >
                        {level}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* SECTION 4 — TRAINING DAYS */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>Training Days</label>
                <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#7a8580' }}>Select the days you normally train.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => {
                    const isSelected = config.trainingDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          const newDays = isSelected 
                            ? config.trainingDays.filter(day => day !== d)
                            : [...config.trainingDays, d];
                          setConfigState({...config, trainingDays: newDays});
                        }}
                        style={{
                          padding: '10px 0',
                          background: isSelected ? '#4ade80' : 'transparent',
                          border: `1px solid ${isSelected ? '#4ade80' : '#1e2620'}`,
                          borderRadius: '8px',
                          color: isSelected ? '#000000' : '#7a8580',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: isSelected ? 'bold' : '500',
                          transition: 'all 0.2s',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
                {config.trainingDays.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>Training Focus</label>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#7a8580' }}>Select the muscle groups you train regularly on these days.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {config.trainingDays.map(day => {
                        const currentSplitsRaw = config.trainingSplits?.[day];
                        let currentSplits: MuscleCategory[] = [];
                        if (Array.isArray(currentSplitsRaw)) {
                          currentSplits = currentSplitsRaw as MuscleCategory[];
                        } else if (typeof currentSplitsRaw === "string" && currentSplitsRaw.trim() !== "") {
                          // Try to map existing string to array if possible, or just ignore for now
                          currentSplits = currentSplitsRaw.split(",").map(s => s.trim() as MuscleCategory);
                        }

                        const options: MuscleCategory[] = [
                          "Chest", "Back", "Shoulders", "Biceps", "Triceps", "Forearms", 
                          "Abs / Core", "Quadriceps", "Hamstrings", "Glutes", "Calves", "Full Body", "Cardio"
                        ];

                        return (
                          <div key={day}>
                            <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#ffffff' }}>{day}</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {options.map(opt => {
                                const isSelected = currentSplits.includes(opt);
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => {
                                      const newSplits = isSelected
                                        ? currentSplits.filter(s => s !== opt)
                                        : [...currentSplits, opt];
                                      setConfigState({
                                        ...config,
                                        trainingSplits: { ...config.trainingSplits, [day]: newSplits }
                                      });
                                    }}
                                    style={{
                                      padding: '6px 12px',
                                      background: isSelected ? 'rgba(74, 222, 128, 0.1)' : 'transparent',
                                      border: `1px solid ${isSelected ? '#4ade80' : '#1e2620'}`,
                                      borderRadius: '16px',
                                      color: isSelected ? '#ffffff' : '#7a8580',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                      fontWeight: isSelected ? '600' : '400',
                                      transition: 'all 0.2s',
                                    }}
                                  >
                                    {isSelected && <span style={{ marginRight: '4px' }}>✓</span>}
                                    {opt === "Quadriceps" ? "Quads" : opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 5 — ACTIONS */}
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid #1e2620',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button 
                type="button" 
                className="action-btn" 
                onClick={() => { setShowConfig(false); setConfigState(getActivityConfig()); }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="primary-button"
                onClick={handleSaveConfig}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
