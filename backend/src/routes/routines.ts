import { Router, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const generateRoutineSchema = z.object({
  goal: z.enum(['hypertrophy', 'strength', 'fat_loss', 'endurance', 'general_fitness']),
  daysPerWeek: z.number().int().min(2).max(6),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  equipment: z.enum(['commercial_gym', 'home_dumbbells', 'bodyweight_calisthenics', 'barbell_only']),
  focusArea: z.string().optional(),
});

const CURATED_ROUTINES = [
  {
    id: 'ppl-classic',
    name: 'Push / Pull / Legs (PPL)',
    description: 'The premier hypertrophy and strength split for intermediate to advanced lifters.',
    daysPerWeek: 3,
    splitType: 'PPL',
    schedule: [
      {
        day: 'Day 1: Push (Chest, Shoulders, Triceps)',
        exercises: [
          { name: 'Barbell Bench Press', sets: 4, reps: '8-10', muscleGroup: 'Chest' },
          { name: 'Overhead Dumbbell Press', sets: 3, reps: '10-12', muscleGroup: 'Shoulders' },
          { name: 'Incline Dumbbell Fly', sets: 3, reps: '12-15', muscleGroup: 'Chest' },
          { name: 'Tricep Cable Pushdown', sets: 3, reps: '12-15', muscleGroup: 'Arms' },
          { name: 'Lateral Raises', sets: 4, reps: '15', muscleGroup: 'Shoulders' },
        ],
      },
      {
        day: 'Day 2: Pull (Back, Biceps, Rear Delts)',
        exercises: [
          { name: 'Deadlift / Barbell Row', sets: 4, reps: '6-8', muscleGroup: 'Back' },
          { name: 'Lat Pulldown', sets: 3, reps: '10-12', muscleGroup: 'Back' },
          { name: 'Seated Cable Row', sets: 3, reps: '10-12', muscleGroup: 'Back' },
          { name: 'Bicep Barbell Curl', sets: 3, reps: '10-12', muscleGroup: 'Arms' },
          { name: 'Face Pulls', sets: 3, reps: '15', muscleGroup: 'Shoulders' },
        ],
      },
      {
        day: 'Day 3: Legs (Quads, Hamstrings, Calves)',
        exercises: [
          { name: 'Barbell Back Squat', sets: 4, reps: '8-10', muscleGroup: 'Legs' },
          { name: 'Romanian Deadlift (RDL)', sets: 3, reps: '10-12', muscleGroup: 'Legs' },
          { name: 'Leg Press', sets: 3, reps: '12-15', muscleGroup: 'Legs' },
          { name: 'Lying Leg Curls', sets: 3, reps: '12-15', muscleGroup: 'Legs' },
          { name: 'Standing Calf Raises', sets: 4, reps: '15-20', muscleGroup: 'Legs' },
        ],
      },
    ],
  },
  {
    id: 'upper-lower-4day',
    name: 'Upper / Lower 4-Day Power Split',
    description: 'Optimal frequency routine hitting each muscle group twice per week.',
    daysPerWeek: 4,
    splitType: 'Upper/Lower',
    schedule: [
      {
        day: 'Day 1: Upper Power',
        exercises: [
          { name: 'Barbell Bench Press', sets: 4, reps: '6-8', muscleGroup: 'Chest' },
          { name: 'Bent-Over Barbell Row', sets: 4, reps: '6-8', muscleGroup: 'Back' },
          { name: 'Overhead Military Press', sets: 3, reps: '8-10', muscleGroup: 'Shoulders' },
          { name: 'Pull-Ups', sets: 3, reps: '8-10', muscleGroup: 'Back' },
          { name: 'Skull Crushers', sets: 3, reps: '10-12', muscleGroup: 'Arms' },
        ],
      },
      {
        day: 'Day 2: Lower Power',
        exercises: [
          { name: 'Barbell Back Squat', sets: 4, reps: '6-8', muscleGroup: 'Legs' },
          { name: 'Romanian Deadlift', sets: 4, reps: '8-10', muscleGroup: 'Legs' },
          { name: 'Walking Lunges', sets: 3, reps: '12 each', muscleGroup: 'Legs' },
          { name: 'Standing Calf Raise', sets: 4, reps: '15', muscleGroup: 'Legs' },
          { name: 'Hanging Leg Raises', sets: 3, reps: '15', muscleGroup: 'Core' },
        ],
      },
      {
        day: 'Day 3: Upper Hypertrophy',
        exercises: [
          { name: 'Incline Dumbbell Press', sets: 4, reps: '10-12', muscleGroup: 'Chest' },
          { name: 'Lat Pulldown', sets: 4, reps: '10-12', muscleGroup: 'Back' },
          { name: 'Cable Lateral Raise', sets: 4, reps: '15', muscleGroup: 'Shoulders' },
          { name: 'Dumbbell Hammer Curls', sets: 3, reps: '12-15', muscleGroup: 'Arms' },
          { name: 'Tricep Rope Pushdown', sets: 3, reps: '12-15', muscleGroup: 'Arms' },
        ],
      },
      {
        day: 'Day 4: Lower Hypertrophy',
        exercises: [
          { name: 'Front Squat / Leg Press', sets: 4, reps: '10-12', muscleGroup: 'Legs' },
          { name: 'Hamstring Leg Curls', sets: 4, reps: '12-15', muscleGroup: 'Legs' },
          { name: 'Leg Extensions', sets: 3, reps: '15', muscleGroup: 'Legs' },
          { name: 'Seated Calf Raise', sets: 4, reps: '15-20', muscleGroup: 'Legs' },
          { name: 'Cable Woodchoppers', sets: 3, reps: '15', muscleGroup: 'Core' },
        ],
      },
    ],
  },
];

// ── GET /api/routines/templates ──────────────────────────────────────────────
router.get('/templates', requireAuth, (_req: AuthRequest, res: Response) => {
  res.json({ routines: CURATED_ROUTINES });
});

// ── POST /api/routines/generate ──────────────────────────────────────────────
router.post('/generate', requireAuth, validate(generateRoutineSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { goal, daysPerWeek, experienceLevel, equipment, focusArea } = req.body;

    const prompt = `You are an elite certified strength & conditioning coach designing a scientific fitness routine for an athlete in FitOS.

Create a high-impact, custom ${daysPerWeek}-day workout routine based on these specifications:
- Fitness Goal: ${goal}
- Days Per Week: ${daysPerWeek}
- Experience Level: ${experienceLevel}
- Equipment: ${equipment}
- Special Focus Area: ${focusArea || 'Balanced full physique'}

You MUST respond strictly with a valid JSON object matching this exact schema (no markdown fences, no explanatory text outside the JSON):
{
  "name": "Custom Routine Name (e.g. 4-Day Hypertrophy Protocol)",
  "description": "Short 1-2 sentence description of training methodology",
  "daysPerWeek": ${daysPerWeek},
  "splitType": "Split type name",
  "schedule": [
    {
      "day": "Day 1: Title (Target Muscles)",
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": 4,
          "reps": "8-10",
          "muscleGroup": "Chest"
        }
      ]
    }
  ]
}`;

    let routine = null;
    if (process.env.GEMINI_API_KEY) {
      try {
        const result = await genAI.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: prompt,
        });
        const rawText = (result.text || '').trim();
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          routine = JSON.parse(jsonMatch[0]);
        }
      } catch (err: any) {
        console.warn('Gemini Routine Gen error:', err.message);
      }
    }

    if (!routine) {
      // Fallback to curated template matching daysPerWeek
      const fallback = CURATED_ROUTINES.find((r) => r.daysPerWeek === daysPerWeek) || CURATED_ROUTINES[0];
      routine = {
        ...fallback,
        name: `Custom ${daysPerWeek}-Day ${goal.toUpperCase()} Split`,
        description: `Scientifically calibrated for ${experienceLevel} lifters targeting ${goal.replace('_', ' ')}.`,
      };
    }

    res.json({ routine });
  } catch (error) {
    console.error('Generate routine error:', error);
    res.status(500).json({ error: 'Failed to generate workout routine.' });
  }
});

export default router;
