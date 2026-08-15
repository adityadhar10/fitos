/**
 * Maps exercise names (lowercase, partial match) to one or more muscle groups.
 * Used by MuscleHeatmap to color the SVG body diagram.
 */
export type MuscleGroup =
  | "chest"
  | "shoulders"
  | "triceps"
  | "biceps"
  | "forearms"
  | "abs"
  | "obliques"
  | "quads"
  | "glutes"
  | "hamstrings"
  | "calves"
  | "upper_back"
  | "lats"
  | "lower_back"
  | "traps";

export interface MuscleMapEntry {
  keywords: string[];
  muscles: MuscleGroup[];
}

export const MUSCLE_MAP: MuscleMapEntry[] = [
  // Chest
  { keywords: ["bench", "chest press", "fly", "flye", "pec", "push up", "pushup", "dip"], muscles: ["chest", "triceps"] },
  { keywords: ["incline bench", "incline press"], muscles: ["chest", "shoulders", "triceps"] },
  // Shoulders
  { keywords: ["shoulder press", "overhead press", "ohp", "military press", "arnold", "lateral raise", "front raise", "upright row"], muscles: ["shoulders", "triceps"] },
  { keywords: ["face pull", "rear delt"], muscles: ["shoulders", "upper_back"] },
  // Back
  { keywords: ["pull up", "pullup", "chin up", "chinup", "lat pulldown", "row", "cable row", "seated row"], muscles: ["lats", "biceps", "upper_back"] },
  { keywords: ["deadlift"], muscles: ["lower_back", "glutes", "hamstrings", "traps"] },
  { keywords: ["rdl", "romanian deadlift", "good morning"], muscles: ["hamstrings", "glutes", "lower_back"] },
  { keywords: ["shrug", "trap"], muscles: ["traps"] },
  { keywords: ["hyperextension", "back extension"], muscles: ["lower_back", "glutes"] },
  // Biceps
  { keywords: ["curl", "bicep", "hammer curl", "preacher"], muscles: ["biceps"] },
  // Triceps
  { keywords: ["tricep", "pushdown", "skull", "close grip", "overhead extension", "kickback"], muscles: ["triceps"] },
  // Legs
  { keywords: ["squat", "front squat", "hack squat", "leg press", "leg extension", "lunge", "split squat", "goblet"], muscles: ["quads", "glutes"] },
  { keywords: ["leg curl", "hamstring curl"], muscles: ["hamstrings"] },
  { keywords: ["hip thrust", "glute bridge", "sumo"], muscles: ["glutes", "hamstrings"] },
  { keywords: ["calf raise", "calf press", "seated calf"], muscles: ["calves"] },
  // Core
  { keywords: ["crunch", "sit up", "situp", "plank", "ab ", "abs", "cable crunch", "leg raise"], muscles: ["abs"] },
  { keywords: ["russian twist", "side plank", "oblique"], muscles: ["obliques", "abs"] },
  // Forearms
  { keywords: ["wrist curl", "forearm", "reverse curl", "grip"], muscles: ["forearms"] },
];

/**
 * Given a workout name, returns the list of muscle groups it targets.
 */
export function getMusclesTouched(workoutName: string): MuscleGroup[] {
  const lower = workoutName.toLowerCase();
  const touched = new Set<MuscleGroup>();

  for (const entry of MUSCLE_MAP) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      entry.muscles.forEach((m) => touched.add(m));
    }
  }

  // Default fallback: if nothing matched, treat as full-body
  if (touched.size === 0) {
    (["chest", "lats", "shoulders", "quads", "abs"] as MuscleGroup[]).forEach((m) =>
      touched.add(m)
    );
  }

  return [...touched];
}
