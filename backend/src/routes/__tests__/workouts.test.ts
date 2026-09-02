import { describe, it, expect } from 'vitest';
import { addWorkoutSchema } from '../workouts.js';

describe('addWorkoutSchema validation', () => {
  it('accepts valid workout with multiple sets', () => {
    const result = addWorkoutSchema.safeParse({
      name: 'Bench Press',
      muscleGroup: 'Chest',
      sets: [
        { reps: 10, weight: 60 },
        { reps: 8, weight: 70 },
        { reps: 6, weight: 80 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects workout without sets', () => {
    const result = addWorkoutSchema.safeParse({
      name: 'Bench Press',
      sets: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-positive reps', () => {
    const result = addWorkoutSchema.safeParse({
      name: 'Squats',
      sets: [{ reps: 0, weight: 100 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative weights', () => {
    const result = addWorkoutSchema.safeParse({
      name: 'Deadlift',
      sets: [{ reps: 5, weight: -20 }],
    });
    expect(result.success).toBe(false);
  });

  it('calculates 1RM accurately with Epley formula', () => {
    const calculate1RM = (reps: number, weight: number) =>
      reps === 1 ? weight : Math.round(weight * (1 + reps / 30));

    expect(calculate1RM(1, 100)).toBe(100);
    expect(calculate1RM(10, 100)).toBe(133);
    expect(calculate1RM(5, 80)).toBe(93);
  });
});
