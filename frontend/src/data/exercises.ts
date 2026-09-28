export type MuscleCategory =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Biceps"
  | "Triceps"
  | "Forearms"
  | "Quadriceps"
  | "Hamstrings"
  | "Glutes"
  | "Calves"
  | "Abs / Core"
  | "Obliques"
  | "Lower Back"
  | "Full Body"
  | "Cardio";

export interface Exercise {
  name: string;
  category: MuscleCategory;
  muscle: string;
  secondaryMuscles?: string[];
  muscleGroup?: MuscleCategory; // Alias for category compatibility
}

export const EXERCISES: Exercise[] = [
  // ==========================================
  // CHEST
  // ==========================================
  // Upper Chest
  { name: "Incline Barbell Bench Press", category: "Chest", muscle: "Upper Chest", muscleGroup: "Chest", secondaryMuscles: ["Front Delts", "Triceps"] },
  { name: "Incline Dumbbell Bench Press", category: "Chest", muscle: "Upper Chest", muscleGroup: "Chest", secondaryMuscles: ["Front Delts", "Triceps"] },
  { name: "Incline Dumbbell Fly", category: "Chest", muscle: "Upper Chest", muscleGroup: "Chest", secondaryMuscles: ["Front Delts"] },
  { name: "Incline Cable Fly", category: "Chest", muscle: "Upper Chest", muscleGroup: "Chest", secondaryMuscles: ["Front Delts"] },
  { name: "Low-to-High Cable Fly", category: "Chest", muscle: "Upper Chest", muscleGroup: "Chest", secondaryMuscles: ["Front Delts"] },
  { name: "Incline Machine Press", category: "Chest", muscle: "Upper Chest", muscleGroup: "Chest", secondaryMuscles: ["Front Delts", "Triceps"] },
  { name: "Reverse-Grip Bench Press", category: "Chest", muscle: "Upper Chest", muscleGroup: "Chest", secondaryMuscles: ["Triceps"] },

  // Middle Chest
  { name: "Flat Barbell Bench Press", category: "Chest", muscle: "Middle Chest", muscleGroup: "Chest", secondaryMuscles: ["Front Delts", "Triceps"] },
  { name: "Flat Dumbbell Bench Press", category: "Chest", muscle: "Middle Chest", muscleGroup: "Chest", secondaryMuscles: ["Front Delts", "Triceps"] },
  { name: "Dumbbell Fly", category: "Chest", muscle: "Middle Chest", muscleGroup: "Chest", secondaryMuscles: ["Front Delts"] },
  { name: "Cable Fly", category: "Chest", muscle: "Middle Chest", muscleGroup: "Chest", secondaryMuscles: ["Front Delts"] },
  { name: "Pec Deck Machine", category: "Chest", muscle: "Middle Chest", muscleGroup: "Chest", secondaryMuscles: ["Front Delts"] },
  { name: "Chest Press Machine", category: "Chest", muscle: "Middle Chest", muscleGroup: "Chest", secondaryMuscles: ["Triceps"] },
  { name: "Push Ups", category: "Chest", muscle: "Middle Chest", muscleGroup: "Chest", secondaryMuscles: ["Core", "Triceps"] },
  { name: "Dumbbell Squeeze Press", category: "Chest", muscle: "Middle Chest", muscleGroup: "Chest", secondaryMuscles: ["Triceps"] },

  // Lower Chest
  { name: "Decline Barbell Bench Press", category: "Chest", muscle: "Lower Chest", muscleGroup: "Chest", secondaryMuscles: ["Triceps"] },
  { name: "Decline Dumbbell Bench Press", category: "Chest", muscle: "Lower Chest", muscleGroup: "Chest", secondaryMuscles: ["Triceps"] },
  { name: "Decline Dumbbell Fly", category: "Chest", muscle: "Lower Chest", muscleGroup: "Chest", secondaryMuscles: ["Front Delts"] },
  { name: "High-to-Low Cable Fly", category: "Chest", muscle: "Lower Chest", muscleGroup: "Chest", secondaryMuscles: ["Front Delts"] },
  { name: "Chest Dips", category: "Chest", muscle: "Lower Chest", muscleGroup: "Chest", secondaryMuscles: ["Triceps", "Front Delts"] },

  // ==========================================
  // BACK
  // ==========================================
  // Lats
  { name: "Pull Ups", category: "Back", muscle: "Lats", muscleGroup: "Back", secondaryMuscles: ["Biceps", "Rhomboids"] },
  { name: "Chin Ups", category: "Back", muscle: "Lats", muscleGroup: "Back", secondaryMuscles: ["Biceps", "Rhomboids"] },
  { name: "Lat Pulldown", category: "Back", muscle: "Lats", muscleGroup: "Back", secondaryMuscles: ["Biceps", "Rhomboids"] },
  { name: "Close-Grip Lat Pulldown", category: "Back", muscle: "Lats", muscleGroup: "Back", secondaryMuscles: ["Biceps"] },
  { name: "Wide-Grip Lat Pulldown", category: "Back", muscle: "Lats", muscleGroup: "Back", secondaryMuscles: ["Rhomboids"] },
  { name: "Neutral-Grip Lat Pulldown", category: "Back", muscle: "Lats", muscleGroup: "Back", secondaryMuscles: ["Biceps"] },
  { name: "Straight-Arm Pulldown", category: "Back", muscle: "Lats", muscleGroup: "Back", secondaryMuscles: ["Core", "Teres Major"] },
  { name: "Single-Arm Lat Pulldown", category: "Back", muscle: "Lats", muscleGroup: "Back", secondaryMuscles: ["Biceps"] },
  { name: "Assisted Pull Up", category: "Back", muscle: "Lats", muscleGroup: "Back", secondaryMuscles: ["Biceps"] },

  // Mid Back / Rhomboids
  { name: "Seated Cable Row", category: "Back", muscle: "Rhomboids", muscleGroup: "Back", secondaryMuscles: ["Lats", "Biceps"] },
  { name: "Chest-Supported Row", category: "Back", muscle: "Rhomboids", muscleGroup: "Back", secondaryMuscles: ["Rear Delts", "Lats"] },
  { name: "Barbell Row", category: "Back", muscle: "Rhomboids", muscleGroup: "Back", secondaryMuscles: ["Lats", "Lower Back", "Biceps"] },
  { name: "Dumbbell Row", category: "Back", muscle: "Rhomboids", muscleGroup: "Back", secondaryMuscles: ["Lats", "Biceps"] },
  { name: "One-Arm Dumbbell Row", category: "Back", muscle: "Rhomboids", muscleGroup: "Back", secondaryMuscles: ["Lats", "Core"] },
  { name: "T-Bar Row", category: "Back", muscle: "Rhomboids", muscleGroup: "Back", secondaryMuscles: ["Lats", "Biceps"] },
  { name: "Machine Row", category: "Back", muscle: "Rhomboids", muscleGroup: "Back", secondaryMuscles: ["Lats"] },
  { name: "Cable Row", category: "Back", muscle: "Rhomboids", muscleGroup: "Back", secondaryMuscles: ["Lats", "Biceps"] },

  // Traps
  { name: "Barbell Shrugs", category: "Back", muscle: "Traps", muscleGroup: "Back", secondaryMuscles: ["Forearms"] },
  { name: "Dumbbell Shrugs", category: "Back", muscle: "Traps", muscleGroup: "Back", secondaryMuscles: ["Forearms"] },
  { name: "Machine Shrugs", category: "Back", muscle: "Traps", muscleGroup: "Back", secondaryMuscles: ["Forearms"] },
  { name: "Upright Row", category: "Back", muscle: "Traps", muscleGroup: "Back", secondaryMuscles: ["Side Delts", "Biceps"] },
  { name: "Farmer's Walk", category: "Back", muscle: "Traps", muscleGroup: "Back", secondaryMuscles: ["Forearms", "Core"] },

  // Upper Back
  { name: "Face Pull", category: "Back", muscle: "Upper Back", muscleGroup: "Back", secondaryMuscles: ["Rear Delts", "Rotator Cuff"] },
  { name: "Reverse Pec Deck", category: "Back", muscle: "Upper Back", muscleGroup: "Back", secondaryMuscles: ["Rear Delts", "Rhomboids"] },

  // ==========================================
  // SHOULDERS
  // ==========================================
  // Front Delts
  { name: "Barbell Overhead Press", category: "Shoulders", muscle: "Front Deltoid", muscleGroup: "Shoulders", secondaryMuscles: ["Triceps", "Upper Chest"] },
  { name: "Dumbbell Shoulder Press", category: "Shoulders", muscle: "Front Deltoid", muscleGroup: "Shoulders", secondaryMuscles: ["Triceps"] },
  { name: "Arnold Press", category: "Shoulders", muscle: "Front Deltoid", muscleGroup: "Shoulders", secondaryMuscles: ["Side Delts", "Triceps"] },
  { name: "Machine Shoulder Press", category: "Shoulders", muscle: "Front Deltoid", muscleGroup: "Shoulders", secondaryMuscles: ["Triceps"] },
  { name: "Landmine Press", category: "Shoulders", muscle: "Front Deltoid", muscleGroup: "Shoulders", secondaryMuscles: ["Core", "Triceps"] },
  { name: "Front Dumbbell Raise", category: "Shoulders", muscle: "Front Deltoid", muscleGroup: "Shoulders" },
  { name: "Cable Front Raise", category: "Shoulders", muscle: "Front Deltoid", muscleGroup: "Shoulders" },

  // Lateral Delts
  { name: "Dumbbell Lateral Raise", category: "Shoulders", muscle: "Lateral Deltoid", muscleGroup: "Shoulders", secondaryMuscles: ["Traps"] },
  { name: "Cable Lateral Raise", category: "Shoulders", muscle: "Lateral Deltoid", muscleGroup: "Shoulders" },
  { name: "Machine Lateral Raise", category: "Shoulders", muscle: "Lateral Deltoid", muscleGroup: "Shoulders" },
  { name: "Leaning Cable Lateral Raise", category: "Shoulders", muscle: "Lateral Deltoid", muscleGroup: "Shoulders" },

  // Rear Delts
  { name: "Rear Delt Dumbbell Fly", category: "Shoulders", muscle: "Rear Deltoid", muscleGroup: "Shoulders", secondaryMuscles: ["Rhomboids"] },
  { name: "Cable Rear Delt Fly", category: "Shoulders", muscle: "Rear Deltoid", muscleGroup: "Shoulders", secondaryMuscles: ["Rhomboids"] },
  { name: "Bent-Over Rear Delt Fly", category: "Shoulders", muscle: "Rear Deltoid", muscleGroup: "Shoulders", secondaryMuscles: ["Rhomboids"] },

  // ==========================================
  // BICEPS
  // ==========================================
  { name: "Barbell Curl", category: "Biceps", muscle: "Biceps", muscleGroup: "Biceps", secondaryMuscles: ["Forearms"] },
  { name: "EZ-Bar Curl", category: "Biceps", muscle: "Biceps", muscleGroup: "Biceps", secondaryMuscles: ["Forearms"] },
  { name: "Dumbbell Curl", category: "Biceps", muscle: "Biceps", muscleGroup: "Biceps", secondaryMuscles: ["Forearms"] },
  { name: "Alternating Dumbbell Curl", category: "Biceps", muscle: "Biceps", muscleGroup: "Biceps", secondaryMuscles: ["Forearms"] },
  { name: "Hammer Curl", category: "Biceps", muscle: "Biceps / Brachialis", muscleGroup: "Biceps", secondaryMuscles: ["Forearms"] },
  { name: "Incline Dumbbell Curl", category: "Biceps", muscle: "Biceps (Long Head)", muscleGroup: "Biceps" },
  { name: "Preacher Curl", category: "Biceps", muscle: "Biceps (Short Head)", muscleGroup: "Biceps" },
  { name: "Machine Preacher Curl", category: "Biceps", muscle: "Biceps (Short Head)", muscleGroup: "Biceps" },
  { name: "Concentration Curl", category: "Biceps", muscle: "Biceps (Peak)", muscleGroup: "Biceps" },
  { name: "Cable Curl", category: "Biceps", muscle: "Biceps", muscleGroup: "Biceps" },
  { name: "Bayesian Cable Curl", category: "Biceps", muscle: "Biceps (Long Head)", muscleGroup: "Biceps" },
  { name: "Spider Curl", category: "Biceps", muscle: "Biceps (Short Head)", muscleGroup: "Biceps" },
  { name: "Reverse Curl", category: "Biceps", muscle: "Brachioradialis / Biceps", muscleGroup: "Biceps", secondaryMuscles: ["Forearms"] },

  // ==========================================
  // TRICEPS
  // ==========================================
  { name: "Tricep Pushdown", category: "Triceps", muscle: "Triceps (Lateral Head)", muscleGroup: "Triceps" },
  { name: "Rope Tricep Pushdown", category: "Triceps", muscle: "Triceps (Lateral Head)", muscleGroup: "Triceps" },
  { name: "Straight-Bar Pushdown", category: "Triceps", muscle: "Triceps", muscleGroup: "Triceps" },
  { name: "Overhead Cable Tricep Extension", category: "Triceps", muscle: "Triceps (Long Head)", muscleGroup: "Triceps" },
  { name: "Dumbbell Overhead Tricep Extension", category: "Triceps", muscle: "Triceps (Long Head)", muscleGroup: "Triceps" },
  { name: "Skull Crushers", category: "Triceps", muscle: "Triceps (Long/Medial Head)", muscleGroup: "Triceps" },
  { name: "EZ-Bar Skull Crushers", category: "Triceps", muscle: "Triceps", muscleGroup: "Triceps" },
  { name: "Close-Grip Bench Press", category: "Triceps", muscle: "Triceps", muscleGroup: "Triceps", secondaryMuscles: ["Chest", "Front Delts"] },
  { name: "Tricep Dips", category: "Triceps", muscle: "Triceps", muscleGroup: "Triceps", secondaryMuscles: ["Chest", "Front Delts"] },
  { name: "Bench Dips", category: "Triceps", muscle: "Triceps", muscleGroup: "Triceps", secondaryMuscles: ["Front Delts"] },
  { name: "Dumbbell Kickback", category: "Triceps", muscle: "Triceps (Lateral Head)", muscleGroup: "Triceps" },
  { name: "Cable Kickback", category: "Triceps", muscle: "Triceps (Lateral Head)", muscleGroup: "Triceps" },

  // ==========================================
  // FOREARMS
  // ==========================================
  { name: "Wrist Curl", category: "Forearms", muscle: "Wrist Flexors", muscleGroup: "Forearms" },
  { name: "Reverse Wrist Curl", category: "Forearms", muscle: "Wrist Extensors", muscleGroup: "Forearms" },
  { name: "Barbell Wrist Curl", category: "Forearms", muscle: "Wrist Flexors", muscleGroup: "Forearms" },
  { name: "Dumbbell Wrist Curl", category: "Forearms", muscle: "Wrist Flexors", muscleGroup: "Forearms" },
  { name: "Reverse Barbell Curl", category: "Forearms", muscle: "Brachioradialis", muscleGroup: "Forearms", secondaryMuscles: ["Biceps"] },
  { name: "Plate Pinch", category: "Forearms", muscle: "Grip Strength", muscleGroup: "Forearms" },
  { name: "Dead Hang", category: "Forearms", muscle: "Grip Strength", muscleGroup: "Forearms", secondaryMuscles: ["Lats", "Shoulders"] },
  { name: "Wrist Roller", category: "Forearms", muscle: "Forearms (Complete)", muscleGroup: "Forearms" },

  // ==========================================
  // QUADRICEPS
  // ==========================================
  { name: "Barbell Back Squat", category: "Quadriceps", muscle: "Quadriceps", muscleGroup: "Quadriceps", secondaryMuscles: ["Glutes", "Hamstrings", "Core"] },
  { name: "Front Squat", category: "Quadriceps", muscle: "Quadriceps", muscleGroup: "Quadriceps", secondaryMuscles: ["Glutes", "Core"] },
  { name: "Goblet Squat", category: "Quadriceps", muscle: "Quadriceps", muscleGroup: "Quadriceps", secondaryMuscles: ["Glutes", "Core"] },
  { name: "Hack Squat", category: "Quadriceps", muscle: "Quadriceps", muscleGroup: "Quadriceps", secondaryMuscles: ["Glutes"] },
  { name: "Leg Press", category: "Quadriceps", muscle: "Quadriceps", muscleGroup: "Quadriceps", secondaryMuscles: ["Glutes"] },
  { name: "Bulgarian Split Squat", category: "Quadriceps", muscle: "Quadriceps", muscleGroup: "Quadriceps", secondaryMuscles: ["Glutes", "Hamstrings"] },
  { name: "Walking Lunges", category: "Quadriceps", muscle: "Quadriceps", muscleGroup: "Quadriceps", secondaryMuscles: ["Glutes", "Calves"] },
  { name: "Reverse Lunges", category: "Quadriceps", muscle: "Quadriceps", muscleGroup: "Quadriceps", secondaryMuscles: ["Glutes"] },
  { name: "Forward Lunges", category: "Quadriceps", muscle: "Quadriceps", muscleGroup: "Quadriceps", secondaryMuscles: ["Glutes"] },
  { name: "Step Ups", category: "Quadriceps", muscle: "Quadriceps", muscleGroup: "Quadriceps", secondaryMuscles: ["Glutes"] },
  { name: "Leg Extension", category: "Quadriceps", muscle: "Quadriceps (Isolated)", muscleGroup: "Quadriceps" },
  { name: "Smith Machine Squat", category: "Quadriceps", muscle: "Quadriceps", muscleGroup: "Quadriceps", secondaryMuscles: ["Glutes"] },

  // ==========================================
  // HAMSTRINGS
  // ==========================================
  { name: "Romanian Deadlift", category: "Hamstrings", muscle: "Hamstrings", muscleGroup: "Hamstrings", secondaryMuscles: ["Glutes", "Lower Back"] },
  { name: "Stiff-Leg Deadlift", category: "Hamstrings", muscle: "Hamstrings", muscleGroup: "Hamstrings", secondaryMuscles: ["Glutes", "Lower Back"] },
  { name: "Conventional Deadlift", category: "Hamstrings", muscle: "Hamstrings & Lower Back", muscleGroup: "Hamstrings", secondaryMuscles: ["Glutes", "Lats", "Traps"] },
  { name: "Seated Leg Curl", category: "Hamstrings", muscle: "Hamstrings (Isolated)", muscleGroup: "Hamstrings" },
  { name: "Lying Leg Curl", category: "Hamstrings", muscle: "Hamstrings (Isolated)", muscleGroup: "Hamstrings" },
  { name: "Standing Leg Curl", category: "Hamstrings", muscle: "Hamstrings (Isolated)", muscleGroup: "Hamstrings" },
  { name: "Nordic Hamstring Curl", category: "Hamstrings", muscle: "Hamstrings (Eccentric)", muscleGroup: "Hamstrings", secondaryMuscles: ["Calves"] },
  { name: "Good Morning", category: "Hamstrings", muscle: "Hamstrings & Erector Spinae", muscleGroup: "Hamstrings", secondaryMuscles: ["Glutes", "Lower Back"] },
  { name: "Glute-Ham Raise", category: "Hamstrings", muscle: "Hamstrings", muscleGroup: "Hamstrings", secondaryMuscles: ["Glutes", "Lower Back"] },

  // ==========================================
  // GLUTES
  // ==========================================
  { name: "Barbell Hip Thrust", category: "Glutes", muscle: "Gluteus Maximus", muscleGroup: "Glutes", secondaryMuscles: ["Hamstrings"] },
  { name: "Dumbbell Hip Thrust", category: "Glutes", muscle: "Gluteus Maximus", muscleGroup: "Glutes", secondaryMuscles: ["Hamstrings"] },
  { name: "Glute Bridge", category: "Glutes", muscle: "Gluteus Maximus", muscleGroup: "Glutes", secondaryMuscles: ["Hamstrings"] },
  { name: "Cable Kickback", category: "Glutes", muscle: "Gluteus Maximus", muscleGroup: "Glutes" },
  { name: "Hip Abduction Machine", category: "Glutes", muscle: "Gluteus Medius", muscleGroup: "Glutes" },
  { name: "Sumo Squat", category: "Glutes", muscle: "Glutes & Adductors", muscleGroup: "Glutes", secondaryMuscles: ["Quads"] },

  // ==========================================
  // CALVES
  // ==========================================
  { name: "Standing Calf Raise", category: "Calves", muscle: "Gastrocnemius", muscleGroup: "Calves" },
  { name: "Seated Calf Raise", category: "Calves", muscle: "Soleus", muscleGroup: "Calves" },
  { name: "Leg Press Calf Raise", category: "Calves", muscle: "Gastrocnemius", muscleGroup: "Calves" },
  { name: "Smith Machine Calf Raise", category: "Calves", muscle: "Gastrocnemius", muscleGroup: "Calves" },
  { name: "Single-Leg Calf Raise", category: "Calves", muscle: "Gastrocnemius", muscleGroup: "Calves" },
  { name: "Donkey Calf Raise", category: "Calves", muscle: "Gastrocnemius", muscleGroup: "Calves" },

  // ==========================================
  // ABS / CORE
  // ==========================================
  { name: "Crunch", category: "Abs / Core", muscle: "Upper Abs", muscleGroup: "Abs / Core" },
  { name: "Cable Crunch", category: "Abs / Core", muscle: "Rectus Abdominis", muscleGroup: "Abs / Core" },
  { name: "Machine Crunch", category: "Abs / Core", muscle: "Rectus Abdominis", muscleGroup: "Abs / Core" },
  { name: "Hanging Leg Raise", category: "Abs / Core", muscle: "Lower Abs", muscleGroup: "Abs / Core", secondaryMuscles: ["Hip Flexors"] },
  { name: "Lying Leg Raise", category: "Abs / Core", muscle: "Lower Abs", muscleGroup: "Abs / Core", secondaryMuscles: ["Hip Flexors"] },
  { name: "Reverse Crunch", category: "Abs / Core", muscle: "Lower Abs", muscleGroup: "Abs / Core" },
  { name: "Ab Wheel Rollout", category: "Abs / Core", muscle: "Core (Anti-Extension)", muscleGroup: "Abs / Core", secondaryMuscles: ["Lats", "Shoulders"] },
  { name: "Plank", category: "Abs / Core", muscle: "Transverse Abdominis", muscleGroup: "Abs / Core", secondaryMuscles: ["Shoulders", "Glutes"] },
  { name: "Weighted Plank", category: "Abs / Core", muscle: "Transverse Abdominis", muscleGroup: "Abs / Core" },
  { name: "Dead Bug", category: "Abs / Core", muscle: "Core Stability", muscleGroup: "Abs / Core" },
  { name: "Bird Dog", category: "Abs / Core", muscle: "Core Stability", muscleGroup: "Abs / Core", secondaryMuscles: ["Lower Back", "Glutes"] },
  { name: "Mountain Climbers", category: "Abs / Core", muscle: "Core & Hip Flexors", muscleGroup: "Abs / Core", secondaryMuscles: ["Shoulders"] },

  // ==========================================
  // OBLIQUES
  // ==========================================
  { name: "Russian Twist", category: "Obliques", muscle: "Internal/External Obliques", muscleGroup: "Obliques" },
  { name: "Cable Woodchopper", category: "Obliques", muscle: "Obliques (Rotational)", muscleGroup: "Obliques", secondaryMuscles: ["Core", "Shoulders"] },
  { name: "Dumbbell Side Bend", category: "Obliques", muscle: "Obliques (Lateral)", muscleGroup: "Obliques" },
  { name: "Side Plank", category: "Obliques", muscle: "Obliques & Quadratus Lumborum", muscleGroup: "Obliques" },
  { name: "Hanging Knee Raise with Twist", category: "Obliques", muscle: "Obliques & Lower Abs", muscleGroup: "Obliques" },
  { name: "Bicycle Crunch", category: "Obliques", muscle: "Obliques & Rectus Abdominis", muscleGroup: "Obliques" },
  { name: "Cross-Body Mountain Climber", category: "Obliques", muscle: "Obliques", muscleGroup: "Obliques" },

  // ==========================================
  // LOWER BACK
  // ==========================================
  { name: "Back Extension", category: "Lower Back", muscle: "Erector Spinae", muscleGroup: "Lower Back", secondaryMuscles: ["Glutes", "Hamstrings"] },
  { name: "Superman", category: "Lower Back", muscle: "Erector Spinae", muscleGroup: "Lower Back", secondaryMuscles: ["Glutes"] },
  { name: "Reverse Hyperextension", category: "Lower Back", muscle: "Erector Spinae", muscleGroup: "Lower Back", secondaryMuscles: ["Glutes", "Hamstrings"] },

  // ==========================================
  // FULL BODY
  // ==========================================
  { name: "Clean and Press", category: "Full Body", muscle: "Full Body (Power)", muscleGroup: "Full Body", secondaryMuscles: ["Shoulders", "Quads", "Hamstrings", "Back"] },
  { name: "Kettlebell Swing", category: "Full Body", muscle: "Posterior Chain", muscleGroup: "Full Body", secondaryMuscles: ["Glutes", "Hamstrings", "Core", "Shoulders"] },
  { name: "Thrusters", category: "Full Body", muscle: "Quads & Shoulders", muscleGroup: "Full Body", secondaryMuscles: ["Glutes", "Triceps", "Core"] },
  { name: "Burpees", category: "Full Body", muscle: "Full Body (Cardio/Power)", muscleGroup: "Full Body", secondaryMuscles: ["Chest", "Quads", "Core"] },
  { name: "Turkish Get-Up", category: "Full Body", muscle: "Full Body (Stability)", muscleGroup: "Full Body", secondaryMuscles: ["Shoulders", "Core", "Glutes"] },
  { name: "Dumbbell Snatch", category: "Full Body", muscle: "Full Body (Explosive)", muscleGroup: "Full Body", secondaryMuscles: ["Shoulders", "Back", "Hamstrings"] },
  { name: "Barbell Clean", category: "Full Body", muscle: "Full Body (Power)", muscleGroup: "Full Body", secondaryMuscles: ["Hamstrings", "Traps", "Quads"] },
  { name: "Clean and Jerk", category: "Full Body", muscle: "Full Body (Olympic)", muscleGroup: "Full Body", secondaryMuscles: ["Shoulders", "Quads", "Back", "Triceps"] },

  // ==========================================
  // CARDIO
  // ==========================================
  { name: "Running", category: "Cardio", muscle: "Cardiovascular System", muscleGroup: "Cardio" },
  { name: "Cycling", category: "Cardio", muscle: "Cardiovascular System", muscleGroup: "Cardio", secondaryMuscles: ["Quads", "Calves"] },
  { name: "Walking", category: "Cardio", muscle: "Cardiovascular System", muscleGroup: "Cardio" },
  { name: "Stair Climber", category: "Cardio", muscle: "Cardiovascular System", muscleGroup: "Cardio", secondaryMuscles: ["Glutes", "Quads", "Calves"] },
  { name: "Rowing", category: "Cardio", muscle: "Cardiovascular System", muscleGroup: "Cardio", secondaryMuscles: ["Back", "Biceps", "Core", "Legs"] },
];

import { Dumbbell, ArrowUpFromLine, ArrowDownToLine, Flame } from "lucide-react";

export const TEMPLATES = [
  {
    icon: Dumbbell,
    name: "Push Day",
    targetMuscles: ["Chest", "Shoulders", "Triceps"],
  },
  {
    icon: ArrowUpFromLine,
    name: "Pull Day",
    targetMuscles: ["Back", "Biceps", "Rear Delts"],
  },
  {
    icon: ArrowDownToLine,
    name: "Leg Day",
    targetMuscles: ["Quads", "Hamstrings", "Calves"],
  },
  {
    icon: Flame,
    name: "Full Body",
    targetMuscles: ["Chest", "Back", "Shoulders", "Quads", "Hamstrings", "Biceps", "Triceps", "Calves", "Core"],
  },
];

export function generateWorkoutForTemplate(targetMuscles: string[]): string[] {
  const selected: string[] = [];
  const coveredGaps = new Set<string>();

  const gaps = new Set<string>();
  if (targetMuscles.includes("Chest")) gaps.add("Chest");
  if (targetMuscles.includes("Shoulders")) {
    gaps.add("Front Delts");
    gaps.add("Lateral Delts");
  }
  if (targetMuscles.includes("Triceps")) gaps.add("Triceps");
  
  if (targetMuscles.includes("Back")) {
    gaps.add("Vertical Pull");
    gaps.add("Horizontal Pull");
  }
  if (targetMuscles.includes("Biceps")) gaps.add("Biceps");
  if (targetMuscles.includes("Rear Delts")) gaps.add("Rear Delts");
  
  if (targetMuscles.includes("Quads")) gaps.add("Quads");
  if (targetMuscles.includes("Hamstrings")) gaps.add("Hamstrings");
  if (targetMuscles.includes("Calves")) gaps.add("Calves");
  if (targetMuscles.includes("Glutes")) gaps.add("Glutes");
  if (targetMuscles.includes("Core")) gaps.add("Core");

  const pickExercise = (gap: string) => {
    let matches = EXERCISES.filter(ex => !selected.includes(ex.name));
    
    if (gap === "Chest") matches = matches.filter(ex => ex.category === "Chest" && (ex.name.includes("Press") || ex.name.includes("Push")));
    else if (gap === "Front Delts") matches = matches.filter(ex => ex.muscle === "Front Deltoid" && ex.name.includes("Press"));
    else if (gap === "Lateral Delts") matches = matches.filter(ex => ex.muscle === "Lateral Deltoid");
    else if (gap === "Triceps") matches = matches.filter(ex => ex.category === "Triceps");
    
    else if (gap === "Vertical Pull") matches = matches.filter(ex => ex.category === "Back" && (ex.name.includes("Pull") || ex.name.includes("Chin")));
    else if (gap === "Horizontal Pull") matches = matches.filter(ex => ex.category === "Back" && ex.name.includes("Row"));
    else if (gap === "Biceps") matches = matches.filter(ex => ex.category === "Biceps");
    else if (gap === "Rear Delts") matches = matches.filter(ex => ex.muscle === "Rear Deltoid");
    
    else if (gap === "Quads") matches = matches.filter(ex => ex.category === "Quadriceps" && (ex.name.includes("Squat") || ex.name.includes("Press") || ex.name.includes("Lunge")));
    else if (gap === "Hamstrings") matches = matches.filter(ex => ex.category === "Hamstrings");
    else if (gap === "Calves") matches = matches.filter(ex => ex.category === "Calves");
    else if (gap === "Glutes") matches = matches.filter(ex => ex.category === "Glutes");
    else if (gap === "Core") matches = matches.filter(ex => ex.category === "Abs / Core");

    if (matches.length > 0) {
      return matches[Math.floor(Math.random() * Math.min(matches.length, 3))].name; 
    }
    return null;
  };

  const isFullBody = targetMuscles.length > 5;

  // Extra volume for specific splits
  if (!isFullBody) {
    if (gaps.has("Chest")) {
      const ex1 = pickExercise("Chest"); if (ex1) selected.push(ex1);
      const ex2 = pickExercise("Chest"); if (ex2) selected.push(ex2);
      coveredGaps.add("Chest");
    }
    if (gaps.has("Quads")) {
      const ex1 = pickExercise("Quads"); if (ex1) selected.push(ex1);
      const ex2 = pickExercise("Quads"); if (ex2) selected.push(ex2);
      coveredGaps.add("Quads");
    }
  }

  const order = [
    "Quads", "Hamstrings", "Chest", "Vertical Pull", "Horizontal Pull", "Front Delts", 
    "Lateral Delts", "Rear Delts", "Biceps", "Triceps", "Glutes", "Calves", "Core"
  ];

  for (const gap of order) {
    if (gaps.has(gap) && !coveredGaps.has(gap)) {
      let skip = false;
      if (isFullBody) {
         if (gap === "Front Delts" && selected.some(s => s.includes("Press") && EXERCISES.find(e => e.name === s)?.category === "Chest")) skip = true;
         if (gap === "Glutes" && selected.some(s => s.includes("Squat") || s.includes("Deadlift"))) skip = true;
      }
      
      if (!skip) {
         const ex = pickExercise(gap);
         if (ex) {
             selected.push(ex);
             coveredGaps.add(gap);
         }
      }
    }
  }

  return selected;
}

export const getWorkoutMuscleInfo = (name: string, category?: string) => {
  const found = EXERCISES.find(ex => ex.name === name);
  if (found) {
    return {
      category: found.category,
      muscle: found.muscle,
      secondaryMuscles: found.secondaryMuscles || []
    };
  }
  return {
    category: category || "Other",
    muscle: category || "Mixed",
    secondaryMuscles: []
  };
};
