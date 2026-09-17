const fs = require('fs');

let code = fs.readFileSync('src/pages/Activity.tsx', 'utf8');

const targetBlock = `              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>Training Days (Ctrl+Click to select multiple)</label>
                <select 
                  multiple 
                  className="metric-input" 
                  style={{ height: 'auto' }}
                  value={config.trainingDays}
                  onChange={e => {
                    const options = Array.from(e.target.selectedOptions, option => option.value);
                    setConfigState({...config, trainingDays: options});
                  }}
                >
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>`;

const newBlock = `              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>Training Days</label>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>Ctrl+Click to select multiple</div>
                <select 
                  multiple 
                  className="metric-input" 
                  style={{ height: 'auto', padding: '8px' }}
                  value={config.trainingDays}
                  onChange={e => {
                    const options = Array.from(e.target.selectedOptions, option => option.value);
                    setConfigState({...config, trainingDays: options});
                  }}
                >
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                    <option key={d} value={d} style={{ padding: '8px 12px', marginBottom: '4px', borderRadius: '4px', cursor: 'pointer' }}>{d}</option>
                  ))}
                </select>
              </div>`;

if (code.includes('Training Days (Ctrl+Click to select multiple)')) {
  // Try exact replacement first
  if (code.includes(targetBlock)) {
    code = code.replace(targetBlock, newBlock);
    console.log("Replaced target block perfectly.");
  } else {
    // Fallback if formatting differs slightly
    const startIdx = code.indexOf('<label style={{ display: \'block\', marginBottom: \'8px\', fontSize: \'12px\', color: \'var(--text-secondary)\' }}>Training Days (Ctrl+Click to select multiple)</label>');
    if (startIdx !== -1) {
      const parentDivIdx = code.lastIndexOf('<div>', startIdx);
      const selectEndIdx = code.indexOf('</select>', startIdx);
      const blockEndIdx = code.indexOf('</div>', selectEndIdx) + 6;
      
      code = code.substring(0, parentDivIdx) + newBlock + code.substring(blockEndIdx);
      console.log("Replaced using fallback index matching.");
    } else {
      console.error("Could not find the start string.");
      process.exit(1);
    }
  }
} else {
  console.log("Already patched or not found.");
}

fs.writeFileSync('src/pages/Activity.tsx', code);
