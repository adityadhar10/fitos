import prisma from '../lib/prisma.js';
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const workoutService = {
  async getPRs(userId: string) {
    const workouts = await prisma.workout.findMany({
      where: { userId },
      include: { sets: true, workoutSession: true },
      orderBy: { date: 'desc' },
    });

    const prMap = new Map<string, any>();

    for (const w of workouts) {
      const exerciseKey = w.name.trim().toLowerCase();
      let sessionVolume = 0;
      let sessionMaxWeight = 0;
      let sessionMaxReps = 0;
      let sessionBest1RM = 0;

      for (const s of w.sets) {
        sessionVolume += s.reps * s.weight;
        if (s.weight > sessionMaxWeight) {
          sessionMaxWeight = s.weight;
          sessionMaxReps = s.reps;
        }
        const est1RM = s.reps === 1 ? s.weight : Math.round(s.weight * (1 + s.reps / 30));
        if (est1RM > sessionBest1RM) {
          sessionBest1RM = est1RM;
        }
      }

      if (!prMap.has(exerciseKey)) {
        prMap.set(exerciseKey, {
          name: w.name,
          maxWeight: sessionMaxWeight,
          repsAtMaxWeight: sessionMaxReps,
          bestEstimated1RM: sessionBest1RM,
          maxSessionVolume: sessionVolume,
          lastDate: w.date.toISOString(),
        });
      } else {
        const existing = prMap.get(exerciseKey)!;
        if (sessionMaxWeight > existing.maxWeight) {
          existing.maxWeight = sessionMaxWeight;
          existing.repsAtMaxWeight = sessionMaxReps;
        }
        if (sessionBest1RM > existing.bestEstimated1RM) {
          existing.bestEstimated1RM = sessionBest1RM;
        }
        if (sessionVolume > existing.maxSessionVolume) {
          existing.maxSessionVolume = sessionVolume;
        }
      }
    }

    const prs = Array.from(prMap.values()).sort((a, b) => b.maxWeight - a.maxWeight);

    const standardMuscles = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];
    const now = Date.now();
    const muscleRecovery = standardMuscles.map((muscle) => {
      const lastTrained = workouts.find((w) =>
        (w.muscleGroup && w.muscleGroup.toLowerCase().includes(muscle.toLowerCase())) ||
        w.name.toLowerCase().includes(muscle.toLowerCase())
      );

      if (!lastTrained) {
        return { muscle, status: 'Fresh', score: 100, hoursAgo: null, label: '🟢 Fresh (Ready)' };
      }

      const diffHours = Math.round((now - new Date(lastTrained.date).getTime()) / (1000 * 60 * 60));
      if (diffHours < 24) {
        return { muscle, status: 'Fatigued', score: 35, hoursAgo: diffHours, label: '🔴 Fatigued (Rest)' };
      } else if (diffHours < 48) {
        return { muscle, status: 'Recovering', score: 70, hoursAgo: diffHours, label: '🟡 Recovering' };
      } else {
        return { muscle, status: 'Fresh', score: 100, hoursAgo: diffHours, label: '🟢 Fresh (Ready)' };
      }
    });

    return { prs, muscleRecovery };
  },

  async getSuggestions(userId: string) {
    const workouts = await prisma.workout.findMany({
      where: { userId },
      include: { sets: true },
      orderBy: { date: 'desc' },
    });

    const latestByExercise = new Map<string, typeof workouts[0]>();
    for (const w of workouts) {
      const key = w.name.trim().toLowerCase();
      if (!latestByExercise.has(key)) {
        latestByExercise.set(key, w);
      }
    }

    const TARGET_REPS_TOP = 10;
    const TARGET_REPS_BOTTOM = 6;
    const WEIGHT_INCREMENT_PCT = 0.025;

    const suggestions = Array.from(latestByExercise.values())
      .filter((w) => w.sets.length > 0)
      .map((w) => {
        const avgReps = w.sets.reduce((sum, s) => sum + s.reps, 0) / w.sets.length;
        const topWeight = Math.max(...w.sets.map((s) => s.weight));
        const lastSetAtTopWeight = w.sets
          .filter((s) => s.weight === topWeight)
          .sort((a, b) => b.reps - a.reps)[0];

        let recommendation: string;
        let suggestedWeight = topWeight;
        let suggestedReps = lastSetAtTopWeight.reps;

        if (avgReps >= TARGET_REPS_TOP) {
          suggestedWeight = Math.round(topWeight * (1 + WEIGHT_INCREMENT_PCT) * 2) / 2;
          suggestedReps = TARGET_REPS_BOTTOM;
          recommendation = `You hit ${avgReps.toFixed(1)} avg reps at ${topWeight}kg last time. Time to add weight — try ${suggestedWeight}kg for ${suggestedReps} reps.`;
        } else if (avgReps < TARGET_REPS_BOTTOM) {
          suggestedWeight = topWeight;
          suggestedReps = lastSetAtTopWeight.reps + 1;
          recommendation = `Reps were a bit low last session (${avgReps.toFixed(1)} avg). Stay at ${topWeight}kg and aim for ${suggestedReps} reps this time.`;
        } else {
          suggestedReps = lastSetAtTopWeight.reps + 1;
          recommendation = `Solid session at ${topWeight}kg. Try ${suggestedReps} reps at the same weight before increasing load.`;
        }

        return {
          exercise: w.name,
          lastSessionDate: w.date.toISOString(),
          lastTopWeight: topWeight,
          lastAvgReps: Math.round(avgReps * 10) / 10,
          suggestedWeight,
          suggestedReps,
          recommendation,
        };
      })
      .sort((a, b) => new Date(b.lastSessionDate).getTime() - new Date(a.lastSessionDate).getTime());

    return { suggestions };
  },

  async getSessions(userId: string) {
    const sessions = await prisma.workoutSession.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      include: {
        workouts: {
          include: { sets: true }
        }
      }
    });
    return { sessions };
  },

  async getWorkouts(userId: string) {
    const workouts = await prisma.workout.findMany({
      where: { userId },
      include: { sets: true },
      orderBy: { date: 'desc' },
      take: 30,
    });
    return { workouts };
  },

  async createSession(userId: string, data: any) {
    const { name, date, exercises } = data;
    const session = await prisma.workoutSession.create({
      data: {
        userId,
        name: name || 'Workout Session',
        date: date ? new Date(date) : new Date(),
        workouts: {
          create: exercises.map((ex: any) => ({
            userId,
            name: ex.name,
            muscleGroup: ex.muscleGroup || null,
            sets: {
              create: ex.sets.map((s: any) => ({
                reps: s.reps,
                weight: s.weight,
              })),
            },
          })),
        },
      },
      include: {
        workouts: {
          include: { sets: true },
        },
      },
    });
    return { session };
  },

  async createWorkout(userId: string, data: any) {
    const { name, muscleGroup, sets } = data;
    const workout = await prisma.workout.create({
      data: {
        userId,
        name,
        muscleGroup: muscleGroup ?? null,
        sets: {
          create: sets.map((s: { reps: number; weight: number }) => ({
            reps: s.reps,
            weight: s.weight,
          })),
        },
      },
      include: { sets: true },
    });
    return { workout };
  },

  async updateSession(userId: string, id: string, data: any) {
    const { name, date, exercises } = data;
    const session = await prisma.workoutSession.findFirst({
      where: { id, userId },
    });
    if (!session) {
      throw new Error('Session not found.');
    }

    const oldWorkouts = await prisma.workout.findMany({ where: { workoutSessionId: id } });
    for (const w of oldWorkouts) {
      await prisma.set.deleteMany({ where: { workoutId: w.id } });
    }
    await prisma.workout.deleteMany({ where: { workoutSessionId: id } });

    const updated = await prisma.workoutSession.update({
      where: { id },
      data: {
        name: name || session.name,
        date: date ? new Date(date) : session.date,
        workouts: {
          create: exercises.map((ex: any) => ({
            userId,
            name: ex.name,
            muscleGroup: ex.muscleGroup || null,
            sets: {
              create: ex.sets.map((s: any) => ({
                reps: s.reps,
                weight: s.weight,
              })),
            },
          })),
        },
      },
      include: { workouts: { include: { sets: true } } },
    });
    return { session: updated };
  },

  async deleteSession(userId: string, id: string) {
    const session = await prisma.workoutSession.findFirst({
      where: { id, userId },
    });
    if (!session) {
      throw new Error('Session not found.');
    }

    const workouts = await prisma.workout.findMany({ where: { workoutSessionId: id } });
    for (const w of workouts) {
      await prisma.set.deleteMany({ where: { workoutId: w.id } });
    }
    await prisma.workout.deleteMany({ where: { workoutSessionId: id } });
    await prisma.workoutSession.delete({ where: { id } });
    return { success: true };
  },

  async deleteAllSessions(userId: string) {
    const allSessions = await prisma.workoutSession.findMany({
      where: { userId },
      include: { workouts: true },
    });

    for (const s of allSessions) {
      for (const w of s.workouts) {
        await prisma.set.deleteMany({ where: { workoutId: w.id } });
      }
      await prisma.workout.deleteMany({ where: { workoutSessionId: s.id } });
    }
    await prisma.workoutSession.deleteMany({ where: { userId } });
    return { success: true };
  },

  async deleteWorkout(userId: string, id: string) {
    const workout = await prisma.workout.findFirst({
      where: { id, userId },
    });
    if (!workout) {
      throw new Error('Workout not found.');
    }
    await prisma.$transaction([
      prisma.set.deleteMany({ where: { workoutId: id } }),
      prisma.workout.delete({ where: { id } }),
    ]);
    return { success: true };
  },

  async analyzeSession(data: any) {
    const { sessionName, sessionDate, exercises, historicalContext, totalSessionVolume, totalSets, totalReps, personalRecords } = data;
    
    const prompt = `You are a professional strength and conditioning analyst inside FitOS.

Analyze the following workout session and produce a structured, specific assessment based exclusively on the data provided. Do not give generic advice. Reason from the actual numbers.

CURRENT SESSION:
Name: ${sessionName}
Date: ${sessionDate}
Total Sets: ${totalSets}
Total Reps: ${totalReps}
Total Volume: ${totalSessionVolume} kg

Exercises this session:
${JSON.stringify(exercises, null, 2)}

HISTORICAL COMPARISON (previous sessions for the same exercises):
${historicalContext && historicalContext.length > 0 ? JSON.stringify(historicalContext, null, 2) : 'No previous data available for these exercises.'}

PERSONAL RECORDS:
${personalRecords && personalRecords.length > 0 ? JSON.stringify(personalRecords, null, 2) : 'No records found.'}

INSTRUCTIONS:
- Compare current session to previous sessions where data exists.
- Identify progressions (higher weight, more reps, more volume) and regressions.
- Identify patterns across the full session, not just the heaviest set.
- If there is no historical data, state that clearly and base analysis on the current session only.
- Do NOT use emojis.
- Do NOT give generic advice like "maintain good form" unless it is genuinely supported by the data.

Return a JSON object with EXACTLY this structure (omit fields that do not apply):
{
  "summary": "2-3 sentence specific assessment of this session",
  "progression": "specific comparison to previous sessions, or null if no history",
  "keyObservation": "the single most important pattern detected",
  "nextWorkout": ["specific, situation-based action 1", "specific action 2"],
  "whatToAvoid": ["specific caution 1 if relevant"]
}
Respond ONLY with valid JSON. No markdown.`;

    const result = await genAI.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
    });
    
    let text = result.text || '';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let parsedData: any;
    try {
      parsedData = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
    }
    
    Object.keys(parsedData).forEach(k => { if (parsedData[k] === null) delete parsedData[k]; });
    return parsedData;
  },

  async getAdvice(userId: string) {
    const recentSessions = await prisma.workoutSession.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 10,
      include: { workouts: { include: { sets: true } } }
    });
    
    if (!recentSessions || recentSessions.length === 0) {
      return {
        summary: 'No recent workout history found.',
        priority: [],
        whatToDo: ['Log a few workouts to unlock personalized training recommendations.'],
        whatToAvoid: [],
        why: 'Insufficient data to generate a recommendation.',
      };
    }

    const context = recentSessions.map(s => ({
      name: s.name,
      date: s.date.toISOString(),
      exercises: s.workouts.map(w => ({
        name: w.name,
        muscleGroup: w.muscleGroup,
        sets: w.sets.length,
        totalReps: w.sets.reduce((sum, set) => sum + set.reps, 0),
        totalVolume: Math.round(w.sets.reduce((sum, set) => sum + set.reps * set.weight, 0)),
        topWeight: w.sets.length > 0 ? Math.max(...w.sets.map(s => s.weight)) : 0,
      }))
    }));

    const prompt = `You are a professional training coach inside FitOS.
Analyze the user's recent workout history and produce specific, data-driven next-session recommendations.
Reason ONLY from the data provided. Do not invent sessions or exercises.

RECENT SESSIONS (newest first):
${JSON.stringify(context, null, 2)}

INSTRUCTIONS:
- Identify which muscle groups were trained recently and which are overdue.
- Look for progression or regression trends in weights and volume.
- Identify imbalances in training frequency between muscle groups.
- Base your recommendation on what the data actually shows.
- Do NOT use emojis.
- Do NOT give generic advice unless clearly supported by the data.

Return a JSON object with EXACTLY this structure:
{
  "summary": "2-3 sentence assessment of recent training",
  "priority": [
    {"order": 1, "focus": "muscle group or focus area", "reason": "specific data-based reason", "suggestedApproach": "what to do and how"}
  ],
  "whatToDo": ["specific action 1", "specific action 2"],
  "whatToAvoid": ["specific caution 1"],
  "why": "brief explanation of the reasoning behind this recommendation"
}
Respond ONLY with valid JSON. No markdown. No emojis.`;

    const result = await genAI.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
    });
    
    let text = result.text || '';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let parsedData: any;
    try {
      parsedData = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
    }

    return parsedData;
  }
};
