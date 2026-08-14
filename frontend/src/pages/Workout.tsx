import '../index.css';

interface ExerciseSet {
  reps: number;
  weight: string;
}

interface WorkoutItem {
  id: string;
  name: string;
  date: string;
  sets: ExerciseSet[];
}

const WORKOUTS: WorkoutItem[] = [
  {
    id: '1',
    name: 'Bench Press',
    date: '2026-08-12',
    sets: [
      { reps: 10, weight: '40kg' },
      { reps: 8, weight: '45kg' },
      { reps: 6, weight: '50kg' },
    ],
  },
  {
    id: '2',
    name: 'Squat',
    date: '2026-08-12',
    sets: [
      { reps: 10, weight: '60kg' },
      { reps: 8, weight: '70kg' },
    ],
  },
];

export default function Workout() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Workout</h1>
        <p>Log and review your workouts.</p>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h2>Recent Workouts</h2>
          <button className="action-btn">+ Log Workout</button>
        </div>

        <div className="workout-list">
          {WORKOUTS.map((workout) => (
            <div key={workout.id} className="workout-card">
              <div className="workout-card-header">
                <div className="workout-title">
                  <span className="icon">🏋️</span>
                  <h3>{workout.name}</h3>
                </div>
                <span className="workout-date">📅 {workout.date}</span>
              </div>

              <div className="sets-list">
                {workout.sets.map((set, index) => (
                  <span key={index} className="set-badge">
                    {set.reps} reps @ {set.weight}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}