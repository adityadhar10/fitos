const fs = require('fs');
const file = '/Users/adityadhar/FitOS/frontend/src/pages/Activity.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix imports
if (!content.includes('BarChart')) {
  content = content.replace('import { Flame, Clock, type LucideIcon } from \"lucide-react\";', 'import { Flame, Clock, Footprints, MapPin, Sparkles, CheckCircle2, AlertCircle, TrendingUp, type LucideIcon } from \"lucide-react\";\\nimport { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from \"recharts\";');
}

// Replace the return block entirely with the requested structure
const returnStart = content.indexOf('return (');
const entireReturn = content.substring(returnStart);

const newReturn = `return (
    <div className=\"page-container page-enter\">
      <div className=\"page-header\" style={{ display: \"flex\", justifyContent: \"space-between\", alignItems: \"flex-end\", flexWrap: \"wrap\", gap: 12 }}>
        <div>
          <h1>Activity</h1>
          <p>Track your movement, recovery, steps and daily activity.</p>
        </div>
        <div style={{ display: \"flex\", alignItems: \"center\", gap: 10 }}>
          {streak > 0 && (
            <span style={{
              display: \"inline-flex\", alignItems: \"center\", gap: 6,
              padding: \"6px 12px\", background: \"#1a1a0a\", border: \"1px solid #3a3510\",
              borderRadius: 99, color: \"#facc15\", fontSize: 13, fontWeight: 600,
            }}>
              🔥 {streak}-day streak
            </span>
          )}
          <button
            className=\"primary-button\"
            onClick={() => {
              setShowForm(true);
              document.getElementById(\"update-activity-section\")?.scrollIntoView({ behavior: \"smooth\", block: \"center\" });
            }}
          >
            Log Activity
          </button>
        </div>
      </div>

      {!loading && steps === 0 && sleepHours === 0 && !showForm && (
        <div className=\"section-card\" style={{ textAlign: 'center', background: 'var(--bg-elevated)', border: '1px dashed var(--border-card)', padding: '32px 24px' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Log your first activity to start tracking your progress</h3>
          <p style={{ margin: '8px 0 16px', color: 'var(--text-secondary)' }}>Update your daily steps and sleep to see personalized insights.</p>
          <button className=\"primary-button\" onClick={() => { setShowForm(true); document.getElementById(\"update-activity-section\")?.scrollIntoView({ behavior: \"smooth\", block: \"center\" }); }}>
            Log Activity
          </button>
        </div>
      )}

      {/* TODAY'S OVERVIEW */}
      <div className=\"section-card\">
        <h2 className=\"section-title\">TODAY'S OVERVIEW</h2>
        <div className=\"activity-grid\" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
          <div className=\"activity-card\">
            <div className=\"card-title\"><span className=\"icon\"><Footprints size={16} /></span><span>STEPS</span></div>
            <div className=\"activity-value\"><strong>{loading ? \"–\" : steps.toLocaleString()}</strong></div>
          </div>
          <div className=\"activity-card\">
            <div className=\"card-title\"><span className=\"icon\"><Flame size={16} /></span><span>CALORIES</span></div>
            <div className=\"activity-value\"><strong>{loading ? \"–\" : caloriesBurned} kcal</strong></div>
          </div>
          <div className=\"activity-card\">
            <div className=\"card-title\"><span className=\"icon\"><Clock size={16} /></span><span>ACTIVE TIME</span></div>
            <div className=\"activity-value\"><strong>{loading ? \"–\" : activeTimeLabel}</strong></div>
          </div>
          <div className=\"activity-card\">
            <div className=\"card-title\"><span className=\"icon\"><MapPin size={16} /></span><span>DISTANCE</span></div>
            <div className=\"activity-value\"><strong>{loading ? \"–\" : (steps * 0.00075).toFixed(2)} km</strong></div>
          </div>
        </div>
      </div>

      {/* DAILY RECOVERY */}
      {!loading && (
        <div className=\"recovery-score-card\" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-card)', padding: 24, borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: 16, margin: 0, color: 'var(--text-primary)' }}>DAILY RECOVERY</h2>
              <p style={{ margin: '4px 0 16px', color: 'var(--text-secondary)', fontSize: 13 }}>Calculated from today's movement volume and sleep duration</p>
            </div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>
              <span style={{ color: 'var(--primary-accent)' }}>{recoveryScore}</span> <span style={{ fontSize: 16, color: 'var(--text-secondary)' }}>/ 100</span>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                <span>Movement Load</span>
                <span style={{ color: 'var(--primary-accent)' }}>{stepsPct}%</span>
              </div>
              <div style={{ height: 8, background: 'var(--bg-card)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: \`\${stepsPct}%\`, background: 'var(--primary-accent)' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                <span>Sleep Restoration</span>
                <span style={{ color: '#38bdf8' }}>{sleepPct}%</span>
              </div>
              <div style={{ height: 8, background: 'var(--bg-card)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: \`\${sleepPct}%\`, background: '#38bdf8' }} />
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-card)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <Sparkles size={16} color=\"var(--primary-accent)\" />
            <span>{recoveryScore >= 70 ? \"Excellent recovery — ready to train hard.\" : recoveryScore >= 50 ? \"Good recovery — keep intensity moderate.\" : \"Rest recommended today.\"}</span>
          </div>
        </div>
      )}

      {/* STEPS & SLEEP RINGS */}
      <div className=\"activity-rings-row\">
        <div className=\"activity-ring-card\">
          <p className=\"activity-ring-label\">STEPS</p>
          <div className=\"activity-ring-wrapper\">
            <svg viewBox=\"0 0 120 120\" className=\"activity-ring-svg\">
              <circle className=\"ring-bg\" cx=\"60\" cy=\"60\" r=\"52\" />
              <circle
                className=\"ring-fill ring-steps\"
                cx=\"60\"
                cy=\"60\"
                r=\"52\"
                style={{ strokeDasharray: circumference, strokeDashoffset: loading ? circumference : stepsOffset }}
              />
            </svg>
            <div className=\"activity-ring-inner\">
              <strong>{loading ? \"–\" : steps.toLocaleString()}</strong>
              <span>/ {DEFAULT_STEP_GOAL.toLocaleString()}</span>
            </div>
          </div>
          <p className=\"activity-ring-pct\" style={{ margin: '8px 0 0', fontWeight: 'bold' }}>{loading ? \"\" : \`\${stepsPct}%\`}</p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
            {stepsPct >= 100 ? \"Goal reached! 🎉\" : stepsPct >= 90 ? \"Almost there!\" : stepsPct >= 50 ? \"Halfway to your goal!\" : \"Great start, keep it up!\"}
          </p>
        </div>

        <div className=\"activity-ring-card\">
          <p className=\"activity-ring-label\">SLEEP</p>
          <div className=\"activity-ring-wrapper\">
            <svg viewBox=\"0 0 120 120\" className=\"activity-ring-svg\">
              <circle className=\"ring-bg\" cx=\"60\" cy=\"60\" r=\"52\" />
              <circle
                className=\"ring-fill ring-sleep\"
                cx=\"60\"
                cy=\"60\"
                r=\"52\"
                style={{ strokeDasharray: circumference, strokeDashoffset: loading ? circumference : sleepOffset }}
              />
            </svg>
            <div className=\"activity-ring-inner\">
              <strong>{loading ? \"–\" : \`\${sleepHours}h\`}</strong>
              <span>/ {DEFAULT_SLEEP_GOAL}h</span>
            </div>
          </div>
          <p className=\"activity-ring-pct\" style={{ margin: '8px 0 0', fontWeight: 'bold' }}>{loading ? \"\" : \`\${sleepPct}%\`}</p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
            {sleepPct >= 100 ? \"Goal reached! 🎉\" : sleepPct >= 90 ? \"Almost there!\" : sleepPct >= 50 ? \"Halfway to your goal!\" : \"Great start, keep it up!\"}
          </p>
        </div>
      </div>

      {/* ACTIVITY INSIGHTS */}
      {!loading && steps > 0 && (
        <div className=\"section-card\">
          <h2 className=\"section-title\">ACTIVITY INSIGHTS</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--bg-elevated)', borderRadius: 8 }}>
            {stepsPct >= 100 ? <CheckCircle2 size={20} color=\"var(--primary-accent)\"/> : <TrendingUp size={20} color=\"#38bdf8\"/>}
            <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>
              {stepsPct >= 100 ? \"Awesome job! You hit your step target for today.\" : \`You are \${(DEFAULT_STEP_GOAL - steps).toLocaleString()} steps away from your daily goal.\`}
            </span>
          </div>
        </div>
      )}

      {/* 7-DAY ACTIVITY CHART */}
      <div className=\"section-card\">
        <h2 className=\"section-title\">7-DAY ACTIVITY</h2>
        <div style={{ width: '100%', height: 200, marginTop: 16 }}>
          <ResponsiveContainer width=\"100%\" height=\"100%\">
            <BarChart data={weekly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey=\"day\" stroke=\"var(--text-muted)\" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke=\"var(--text-muted)\" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => \`\${v/1000}k\`} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 8, color: '#fff' }} formatter={(v) => [\`\${v} steps\`, \"Steps\"]} />
              <Bar dataKey=\"steps\" fill=\"var(--primary-accent)\" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LIVE MOTION PEDOMETER */}
      {!loading && (
        <AutoStepTracker
          initialSteps={steps}
          onStepsChange={(newSteps) => setSteps(newSteps)}
        />
      )}

      {/* UPDATE ACTIVITY */}
      <div className=\"section-card\" id=\"update-activity-section\">
        <div className=\"section-header\">
          <div>
            <h2 className=\"section-title\">UPDATE ACTIVITY</h2>
            <p className=\"subtext\" style={{ margin: 0 }}>Manually adjust your step count or sleep log</p>
          </div>
          <button className=\"action-btn\" onClick={() => setShowForm((s) => !s)}>
            {showForm ? \"Cancel\" : \"Edit\"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSave} className=\"activity-edit-form\">
            <input
              placeholder=\"Steps (e.g. 8000)\"
              type=\"number\"
              value={stepsInput}
              onChange={(e) => setStepsInput(e.target.value)}
              className=\"metric-input\"
            />
            <input
              placeholder=\"Sleep hrs (e.g. 7.5)\"
              type=\"number\"
              step=\"0.1\"
              value={sleepInput}
              onChange={(e) => setSleepInput(e.target.value)}
              className=\"metric-input\"
            />
            <button className=\"primary-button\" type=\"submit\" disabled={saving}>
              {saving ? \"Saving…\" : \"Save\"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
`;

content = content.replace(entireReturn, newReturn);
fs.writeFileSync(file, content);
