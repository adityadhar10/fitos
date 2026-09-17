const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Workout.tsx', 'utf8');

// 1. Current status grid: 
// It currently has `<div className="recovery-grid">`
// Let's replace the inline style of recovery-grid or add it if it doesn't exist inline.
code = code.replace(/<div className="recovery-grid">/g, '<div className="recovery-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px" }}>');

// 2. Quick Actions + Templates
// Replace Quick actions flex to be a tight row:
code = code.replace(/<div style=\{\{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 \}\}>/, '<div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24, alignItems: "center" }}>');

// Replace Templates grid:
code = code.replace(/<div className="quick-templates-grid">/g, '<div className="quick-templates-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>');

// 3. History & Progress: 2 column layout
// I need to wrap the PRs and Recent Sessions in a 2-column grid.
// Find: <CollapsibleSection title="Personal Records" defaultOpen={false} summary="">
// and <h3 className="section-title" style={{ fontSize: 16, marginTop: 24, marginBottom: 16 }}>Recent Sessions</h3>
// Let's replace the whole section content.
let historyStart = code.indexOf('<div className="section-card">\n        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>\n          <Trophy size={18} color="#facc15" />\n          <h2 className="section-title">History & Progress</h2>\n        </div>');
if(historyStart !== -1) {
  let advancedToolsStart = code.indexOf('{/* 6. ADVANCED TOOLS */}');
  let historySection = code.substring(historyStart, advancedToolsStart);
  
  // Modify the history section to have a 2-column grid
  let newHistorySection = historySection.replace(
    /<CollapsibleSection title="Personal Records"([\s\S]*?)<\/CollapsibleSection>([\s\S]*?)<h3 className="section-title" style=\{\{ fontSize: 16, marginTop: 24, marginBottom: 16 \}\}>Recent Sessions<\/h3>([\s\S]*?)<\/div>\n      <\/div>/,
    `<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>
          <div>
            <h3 className="section-title" style={{ fontSize: 16, marginBottom: 16 }}>Recent Sessions</h3>
            $3
          </div>
          <div>
            <h3 className="section-title" style={{ fontSize: 16, marginBottom: 16 }}>Personal Records</h3>
            $1
            </CollapsibleSection>
          </div>
        </div>
      </div>`
  );
  code = code.replace(historySection, newHistorySection);
}

// 4. Advanced Tools grid
// Replace the flex column with a grid
code = code.replace(/<div style=\{\{ display: "flex", flexDirection: "column", gap: 16 \}\}>\n          <CollapsibleSection title="1RM Strength Matrix"/g, '<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>\n          <CollapsibleSection title="1RM Strength Matrix"');

fs.writeFileSync('frontend/src/pages/Workout.tsx', code);
