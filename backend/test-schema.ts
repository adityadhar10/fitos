import { z } from "zod";

const addWorkoutSessionSchema = z.object({
  name: z.string().max(100),
  date: z.string().optional(),
  exercises: z.array(
    z.object({
      name: z.string().min(1).max(100),
      muscleGroup: z.string().max(50).optional(),
      sets: z.array(
        z.object({
          reps: z.coerce.number().int().positive(),
          weight: z.coerce.number().nonnegative(),
        })
      ).min(1),
    })
  ).min(1),
});

const payload = {
  name: "Workout Session",
  date: new Date().toISOString(),
  exercises: [
    {
      name: "Bench Press",
      muscleGroup: "Chest",
      sets: [ { reps: 10, weight: 50 } ]
    }
  ]
};

const res = addWorkoutSessionSchema.safeParse(payload);
console.log("Normal:", res.success ? "Pass" : res.error.issues);

const formExercises = [
  { id: "ex_1", name: "Pushups", muscleGroup: "Chest", sets: [{ reps: "10", weight: "0" }] },
  { id: "ex_2", name: "", muscleGroup: "", sets: [{ reps: "", weight: "" }] }
];

const validExercises = formExercises
  .map((ex) => ({
    ...ex,
    validSets: ex.sets
      .filter((s) => s.reps && s.weight)
      .map((s) => ({ reps: Number(s.reps), weight: Number(s.weight) })),
  }))
  .filter((ex) => ex.name.trim() !== "" && ex.validSets.length > 0);

const exercisesPayload = validExercises.map(ex => ({
  name: ex.name,
  muscleGroup: ex.muscleGroup || undefined,
  sets: ex.validSets
}));

console.log("Frontend constructed payload:", JSON.stringify({ name: "A", exercises: exercisesPayload }, null, 2));

const res2 = addWorkoutSessionSchema.safeParse({ name: "A", exercises: exercisesPayload });
console.log("Parsed:", res2.success ? "Pass" : res2.error.issues);
