import { describe, it, expect } from 'vitest';
import { signupSchema, loginSchema, updateGoalsSchema } from '../auth.js';

describe('signupSchema validation', () => {
  it('accepts valid signup credentials', () => {
    const result = signupSchema.safeParse({
      name: 'Aditya Dhar',
      email: 'aditya@example.com',
      password: 'strongpassword123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = signupSchema.safeParse({
      name: '',
      email: 'aditya@example.com',
      password: 'strongpassword123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email addresses', () => {
    const result = signupSchema.safeParse({
      name: 'Aditya Dhar',
      email: 'not-an-email',
      password: 'strongpassword123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects passwords shorter than 6 characters', () => {
    const result = signupSchema.safeParse({
      name: 'Aditya Dhar',
      email: 'aditya@example.com',
      password: '12345',
    });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema validation', () => {
  it('accepts valid login credentials', () => {
    const result = loginSchema.safeParse({
      email: 'aditya@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email format', () => {
    const result = loginSchema.safeParse({
      email: 'invalid-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'aditya@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateGoalsSchema validation', () => {
  it('accepts positive integer nutrition goals', () => {
    const result = updateGoalsSchema.safeParse({
      calorieGoal: 2400,
      proteinGoal: 160,
      carbGoal: 250,
      fatGoal: 70,
    });
    expect(result.success).toBe(true);
  });

  it('coerces string numbers to integers', () => {
    const result = updateGoalsSchema.safeParse({
      calorieGoal: '2200',
      proteinGoal: '150',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.calorieGoal).toBe(2200);
      expect(result.data.proteinGoal).toBe(150);
    }
  });

  it('rejects zero or negative calorie goals', () => {
    const resultZero = updateGoalsSchema.safeParse({
      calorieGoal: 0,
    });
    expect(resultZero.success).toBe(false);

    const resultNegative = updateGoalsSchema.safeParse({
      calorieGoal: -500,
    });
    expect(resultNegative.success).toBe(false);
  });

  it('allows partial goal updates', () => {
    const result = updateGoalsSchema.safeParse({
      proteinGoal: 180,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.proteinGoal).toBe(180);
      expect(result.data.calorieGoal).toBeUndefined();
    }
  });
});
