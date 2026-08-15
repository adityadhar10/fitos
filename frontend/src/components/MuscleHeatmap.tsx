import { useMemo } from "react";
import { getMusclesTouched, type MuscleGroup } from "../data/muscleMap";

interface Workout {
  id: string;
  name: string;
  date?: string;
}

interface MuscleHeatmapProps {
  workouts: Workout[];
}

/**
 * Returns a color between dim-green and bright-green based on intensity 0–1.
 */
function heatColor(intensity: number): string {
  if (intensity === 0) return "transparent";
  // From dim (#1a3325) to bright (#22c55e)
  const r = Math.round(26 + (34 - 26) * intensity);
  const g = Math.round(51 + (197 - 51) * intensity);
  const b = Math.round(37 + (94 - 37) * intensity);
  const opacity = 0.25 + 0.75 * intensity;
  return `rgba(${r},${g},${b},${opacity})`;
}

/**
 * SVG path data for each muscle group region.
 * Viewbox is 200x420 — front body on left (x<100), back body on right (x>100).
 * Front: centered at x=50. Back: centered at x=150.
 */
const MUSCLE_PATHS: Record<MuscleGroup, { front?: string; back?: string; label?: string }> = {
  chest: {
    front: "M 25,100 Q 50,90 75,100 L 75,125 Q 50,135 25,125 Z",
    label: "Chest",
  },
  shoulders: {
    front: "M 12,90 Q 20,75 30,85 L 28,105 Q 18,108 12,100 Z M 70,85 Q 80,75 88,90 L 88,100 Q 82,108 72,105 Z",
    back: "M 112,90 Q 120,75 130,85 L 128,105 Q 118,108 112,100 Z M 170,85 Q 180,75 188,90 L 188,100 Q 182,108 172,105 Z",
    label: "Shoulders",
  },
  triceps: {
    back: "M 112,105 Q 108,120 110,140 L 118,140 Q 120,120 118,105 Z M 182,105 Q 188,120 190,140 L 182,140 Q 180,120 182,105 Z",
    label: "Triceps",
  },
  biceps: {
    front: "M 12,105 Q 8,120 10,140 L 18,140 Q 20,120 18,105 Z M 82,105 Q 88,120 90,140 L 82,140 Q 80,120 82,105 Z",
    label: "Biceps",
  },
  forearms: {
    front: "M 10,140 Q 6,160 8,175 L 16,175 Q 18,160 18,140 Z M 82,140 Q 88,160 90,175 L 82,175 Q 80,160 82,140 Z",
    back: "M 110,140 Q 106,160 108,175 L 116,175 Q 118,160 118,140 Z M 182,140 Q 188,160 190,175 L 182,175 Q 180,160 182,140 Z",
    label: "Forearms",
  },
  abs: {
    front: "M 30,130 Q 50,128 70,130 L 68,200 Q 50,205 32,200 Z",
    label: "Abs",
  },
  obliques: {
    front: "M 22,130 L 30,130 L 32,200 L 18,190 Z M 70,130 L 78,130 L 82,190 L 68,200 Z",
    label: "Obliques",
  },
  quads: {
    front: "M 28,210 Q 40,208 50,210 L 48,310 Q 38,315 28,310 Z M 52,210 Q 62,208 72,210 L 72,310 Q 62,315 52,310 Z",
    label: "Quads",
  },
  glutes: {
    back: "M 128,210 Q 148,208 170,210 L 170,270 Q 148,278 128,270 Z",
    label: "Glutes",
  },
  hamstrings: {
    back: "M 128,270 Q 140,268 150,270 L 148,345 Q 138,350 128,345 Z M 152,270 Q 162,268 172,270 L 172,345 Q 162,350 152,345 Z",
    label: "Hamstrings",
  },
  calves: {
    back: "M 128,348 Q 140,346 150,348 L 148,400 Q 138,405 128,400 Z M 152,348 Q 162,346 172,348 L 172,400 Q 162,405 152,400 Z",
    front: "M 28,312 Q 40,310 50,312 L 48,375 Q 38,380 28,375 Z M 52,312 Q 62,310 72,312 L 72,375 Q 62,380 52,375 Z",
    label: "Calves",
  },
  upper_back: {
    back: "M 128,95 Q 150,88 172,95 L 172,160 Q 150,168 128,160 Z",
    label: "Upper Back",
  },
  lats: {
    back: "M 125,128 Q 133,125 138,130 L 135,190 Q 128,195 122,190 Z M 162,130 Q 167,125 175,128 L 178,190 Q 172,195 165,190 Z",
    label: "Lats",
  },
  lower_back: {
    back: "M 132,190 Q 150,187 168,190 L 168,215 Q 150,220 132,215 Z",
    label: "Lower Back",
  },
  traps: {
    back: "M 128,75 Q 150,68 172,75 L 172,97 Q 150,90 128,97 Z",
    label: "Traps",
  },
};

// Body outline paths (front and back silhouettes in viewBox 0 0 200 420)
const FRONT_BODY =
  "M 50,10 Q 35,10 28,30 Q 20,55 20,80 L 12,80 Q 5,82 5,95 L 8,175 L 14,175 L 14,200 Q 22,205 28,200 L 28,380 Q 32,395 42,400 L 58,400 Q 68,395 72,380 L 72,200 Q 78,205 86,200 L 86,175 L 92,175 L 95,95 Q 95,82 88,80 L 80,80 Q 80,55 72,30 Q 65,10 50,10 Z";

const BACK_BODY =
  "M 150,10 Q 135,10 128,30 Q 120,55 120,80 L 112,80 Q 105,82 105,95 L 108,175 L 114,175 L 114,200 Q 122,205 128,200 L 128,380 Q 132,395 142,400 L 158,400 Q 168,395 172,380 L 172,200 Q 178,205 186,200 L 186,175 L 192,175 L 195,95 Q 195,82 188,80 L 180,80 Q 180,55 172,30 Q 165,10 150,10 Z";

const HEAD_FRONT = "M 50,5 m -15,0 a 15,20 0 1 1 30,0 a 15,20 0 1 1 -30,0";
const HEAD_BACK  = "M 150,5 m -15,0 a 15,20 0 1 1 30,0 a 15,20 0 1 1 -30,0";

export default function MuscleHeatmap({ workouts }: MuscleHeatmapProps) {
  // Count how many times each muscle group was hit in the last 7 days
  const heatMap = useMemo(() => {
    const counts: Partial<Record<MuscleGroup, number>> = {};

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    for (const workout of workouts) {
      const date = workout.date ? new Date(workout.date) : new Date();
      if (date < sevenDaysAgo) continue;

      const muscles = getMusclesTouched(workout.name);
      for (const m of muscles) {
        counts[m] = (counts[m] ?? 0) + 1;
      }
    }

    // Normalize: find max count
    const maxCount = Math.max(1, ...Object.values(counts));

    const heat: Partial<Record<MuscleGroup, number>> = {};
    for (const [muscle, count] of Object.entries(counts) as [MuscleGroup, number][]) {
      heat[muscle] = count / maxCount;
    }

    return heat;
  }, [workouts]);

  const muscleList = Object.keys(MUSCLE_PATHS) as MuscleGroup[];

  // Legend entries: only muscles that are activated
  const activeMuscles = muscleList.filter((m) => (heatMap[m] ?? 0) > 0);

  return (
    <div className="heatmap-wrapper">
      <div className="heatmap-labels-row">
        <span className="heatmap-side-label">Front</span>
        <span className="heatmap-side-label">Back</span>
      </div>

      <svg
        viewBox="0 0 200 420"
        className="heatmap-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Body silhouettes ── */}
        <path d={FRONT_BODY} fill="#141e18" stroke="#2a3d30" strokeWidth="1" />
        <path d={BACK_BODY}  fill="#141e18" stroke="#2a3d30" strokeWidth="1" />
        <path d={HEAD_FRONT} fill="#141e18" stroke="#2a3d30" strokeWidth="1" />
        <path d={HEAD_BACK}  fill="#141e18" stroke="#2a3d30" strokeWidth="1" />

        {/* Front label */}
        <text x="50" y="415" textAnchor="middle" fill="#4a6155" fontSize="8" fontFamily="Inter, sans-serif">FRONT</text>
        {/* Back label */}
        <text x="150" y="415" textAnchor="middle" fill="#4a6155" fontSize="8" fontFamily="Inter, sans-serif">BACK</text>

        {/* ── Muscle group heat regions ── */}
        {muscleList.map((muscle) => {
          const intensity = heatMap[muscle] ?? 0;
          const color = heatColor(intensity);
          const paths = MUSCLE_PATHS[muscle];

          return (
            <g key={muscle}>
              {paths.front && (
                <path
                  d={paths.front}
                  fill={color}
                  className={intensity > 0 ? "heatmap-muscle active" : "heatmap-muscle"}
                >
                  <title>{paths.label ?? muscle} (front)</title>
                </path>
              )}
              {paths.back && (
                <path
                  d={paths.back}
                  fill={color}
                  className={intensity > 0 ? "heatmap-muscle active" : "heatmap-muscle"}
                >
                  <title>{paths.label ?? muscle} (back)</title>
                </path>
              )}
            </g>
          );
        })}
      </svg>

      {/* ── Legend ── */}
      {activeMuscles.length > 0 ? (
        <div className="heatmap-legend">
          {activeMuscles.map((m) => {
            const intensity = heatMap[m] ?? 0;
            return (
              <div key={m} className="heatmap-legend-item">
                <span
                  className="heatmap-legend-dot"
                  style={{ background: heatColor(intensity) }}
                />
                <span className="heatmap-legend-label">
                  {MUSCLE_PATHS[m].label ?? m}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="heatmap-empty">Log workouts this week to see your muscle heatmap light up.</p>
      )}

      <div className="heatmap-scale">
        <span className="heatmap-scale-label">Low</span>
        <div className="heatmap-scale-bar">
          {[0.15, 0.3, 0.5, 0.7, 0.85, 1].map((v) => (
            <div
              key={v}
              className="heatmap-scale-seg"
              style={{ background: heatColor(v) }}
            />
          ))}
        </div>
        <span className="heatmap-scale-label">High</span>
      </div>
    </div>
  );
}
