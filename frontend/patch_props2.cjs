const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Workout.tsx', 'utf8');

// Fix CollapsibleSection defaultExpanded
code = code.replace(/<CollapsibleSection title="([^"]+)" defaultExpanded=\{false\}>/g, '<CollapsibleSection title="$1" initiallyExpanded={false}>');

// Fix RoutineGeneratorModal onSave -> onStartWorkout
code = code.replace(/onSave=\{\(routine\) => \{/g, 'onStartWorkout={(routine: any) => {');

// Fix session.workoutIds to session.exercises ? Wait, StoredSessionRegistryItem had workoutIds. WorkoutSessionItem had exercises.
// Let's check groupedSessions. 
code = code.replace(/const w = workouts\.find\(x => session\.workoutIds\.includes\(x\.id\)\);/g, 'const w = workouts.find(x => session.exercises && session.exercises.some((e: any) => e.workoutId === x.id));');

// Fix PRCelebrationModal
code = code.replace(/pr=\{celebrationPR\}/g, 'exerciseName={celebrationPR.exerciseName} weight={celebrationPR.weight} reps={celebrationPR.reps}');

// Fix WorkoutAnalysisModal
code = code.replace(/workout=\{analysisWorkout\}/g, 'sessionId={analysisWorkout.id}');

// Fix OneRepMaxCalculator
code = code.replace(/<OneRepMaxCalculator prs=\{prs\} \/>/g, '<OneRepMaxCalculator />');

fs.writeFileSync('frontend/src/pages/Workout.tsx', code);
