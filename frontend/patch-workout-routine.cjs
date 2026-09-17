const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Workout.tsx', 'utf8');

// 1. Remove RoutineGeneratorModal import and add AIRoutineBuilder import
code = code.replace(
  'import RoutineGeneratorModal from "../components/RoutineGeneratorModal";',
  'import AIRoutineBuilder from "../components/AIRoutineBuilder";'
);

// 2. Remove the state variable
code = code.replace('const [showRoutineModal, setShowRoutineModal] = useState(false);', '');

// 3. Remove the modal invocation
code = code.replace(/\{showRoutineModal && \([\s\S]*?RoutineGeneratorModal[\s\S]*?\)\} \)/, ')'); 
// wait, easier to just regex replace the exact modal block, but it's at the end of the file.

// 4. Update the card body
const oldCardBody = `            <div style={{ marginTop: "auto" }}>
              <button 
                className="action-btn primary"
                onClick={() => setShowRoutineModal(true)}
                style={{ width: "100%", padding: "12px", fontSize: 14 }}
              >
                Generate Routine
              </button>
            </div>`;
const newCardBody = `            <div style={{ marginTop: "16px", flexGrow: 1 }}>
              <AIRoutineBuilder onStartWorkout={handleStartCustomWorkout} />
            </div>`;
code = code.replace(oldCardBody, newCardBody);

fs.writeFileSync('frontend/src/pages/Workout.tsx', code);
