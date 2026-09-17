import type { MuscleCategory } from '../data/exercises';

export interface ActivityConfig {
  goal: "Fat Loss" | "Muscle Gain" | "Weight Gain" | "Maintenance" | "General Fitness";
  wakeTime: string;
  sleepTime: string;
  workHours: string;
  trainingTime: string;
  trainingDays: string[];
  trainingSplits?: Record<string, string | MuscleCategory[]>;
  activityLevel: "Sedentary" | "Light" | "Moderate" | "Active" | "Highly Active";
}

export const DEFAULT_ACTIVITY_CONFIG: ActivityConfig = {
  goal: "General Fitness",
  wakeTime: "07:00",
  sleepTime: "23:00",
  workHours: "09:00 - 17:00",
  trainingTime: "18:00",
  trainingDays: ["Mon", "Wed", "Fri"],
  trainingSplits: {
    "Mon": ["Quadriceps", "Hamstrings", "Glutes", "Calves"],
    "Wed": ["Chest", "Back", "Shoulders", "Abs / Core"],
    "Fri": ["Full Body"]
  },
  activityLevel: "Moderate",
};

export function getActivityConfig(): ActivityConfig {
  try {
    const data = localStorage.getItem("fitos_activity_config");
    if (data) {
      return JSON.parse(data) as ActivityConfig;
    }
  } catch (err) {
    console.error("Failed to parse activity config", err);
  }
  return DEFAULT_ACTIVITY_CONFIG;
}

export function setActivityConfig(config: ActivityConfig) {
  localStorage.setItem("fitos_activity_config", JSON.stringify(config));
}

export function calculateAdaptiveTarget(config: ActivityConfig, currentDay: string, recentAverage: number): number {
  // 1. Establish the absolute baseline based on activity level
  let baseline = 7000;
  switch (config.activityLevel) {
    case "Sedentary": baseline = 5000; break;
    case "Light": baseline = 6500; break;
    case "Moderate": baseline = 8000; break;
    case "Active": baseline = 10000; break;
    case "Highly Active": baseline = 12000; break;
  }

  // 2. Determine the "Goal Factor"
  // Goal influences recommendation, but doesn't blindly override logic.
  let goalFactor = 1.0;
  switch (config.goal) {
    case "Fat Loss": goalFactor = 1.15; break; // Slightly favors higher activity
    case "Muscle Gain": goalFactor = 0.9; break; // Prioritizes recovery
    case "Weight Gain": goalFactor = 0.9; break; // Avoid excessive additional activity
    case "Maintenance": goalFactor = 1.0; break; // Sustainable
    case "General Fitness": goalFactor = 1.05; break; // Balanced progression
  }

  const idealTarget = baseline * goalFactor;

  // 3. Establish a starting point
  let startingTarget = recentAverage > 3000 ? recentAverage : baseline;

  // 4. Gradual Progression towards Ideal Target
  let proposedTarget = startingTarget;
  
  if (startingTarget < idealTarget - 500) {
    // Consistently missing or starting low -> gradually progress up
    proposedTarget = startingTarget + (idealTarget - startingTarget) * 0.4;
  } else if (startingTarget > idealTarget + 500) {
    // Consistently exceeding or starting too high -> gradual taper
    proposedTarget = startingTarget - (startingTarget - idealTarget) * 0.3;
  } else {
    proposedTarget = idealTarget;
  }

  // Cap the jump to max 1000 steps up or down from recent average to prevent extreme changes
  if (recentAverage > 0) {
    const maxJump = 1000;
    if (proposedTarget > recentAverage + maxJump) proposedTarget = recentAverage + maxJump;
    if (proposedTarget < recentAverage - maxJump) proposedTarget = Math.max(3000, recentAverage - maxJump);
  }

  // 5. Training Day Adaptation
  const isTrainingDay = config.trainingDays.includes(currentDay);
  const rawSplit = config.trainingSplits?.[currentDay];
  let trainingSplitStr = "";
  if (Array.isArray(rawSplit)) {
    trainingSplitStr = rawSplit.join(" ").toLowerCase();
  } else if (typeof rawSplit === "string") {
    trainingSplitStr = rawSplit.toLowerCase();
  } else {
    trainingSplitStr = "training";
  }

  if (isTrainingDay) {
    if (trainingSplitStr.includes("leg") || trainingSplitStr.includes("quadriceps") || trainingSplitStr.includes("hamstrings") || trainingSplitStr.includes("glutes") || trainingSplitStr.includes("heavy") || trainingSplitStr.includes("lower")) {
      proposedTarget *= 0.85; // Heavy leg day -> prioritize recovery
    } else if (trainingSplitStr.includes("upper") || trainingSplitStr.includes("chest") || trainingSplitStr.includes("back") || trainingSplitStr.includes("shoulders") || trainingSplitStr.includes("pull") || trainingSplitStr.includes("push")) {
      proposedTarget *= 1.0; // Upper-body -> normal movement
    } else {
      proposedTarget *= 0.9; // Generic training day -> slightly lower
    }
  } else {
    // Rest day -> normal/slightly higher movement
    proposedTarget *= 1.05; 
  }

  return Math.round(proposedTarget / 100) * 100;
}

export function getTargetExplanation(config: ActivityConfig, currentDay: string, target: number, recentAverage: number): string {
  const isTrainingDay = config.trainingDays.includes(currentDay);
  const rawSplit = config.trainingSplits?.[currentDay];
  let trainingSplitStr = "";
  if (Array.isArray(rawSplit)) {
    trainingSplitStr = rawSplit.join(" ").toLowerCase();
  } else if (typeof rawSplit === "string") {
    trainingSplitStr = rawSplit.toLowerCase();
  }

  if (isTrainingDay && (trainingSplitStr.includes("leg") || trainingSplitStr.includes("quadriceps") || trainingSplitStr.includes("hamstrings") || trainingSplitStr.includes("glutes") || trainingSplitStr.includes("heavy"))) {
    return `Your target was kept lower today because you have a heavy training session scheduled.`;
  }

  let text = `Today's ${target.toLocaleString()}-step target is based on `;
  
  const factors = [];
  if (recentAverage > 0) factors.push(`your recent ${Math.round(recentAverage/100)*100}-step average`);
  factors.push(`your ${config.activityLevel.toLowerCase()} activity level`);
  
  if (isTrainingDay) {
    factors.push(`today's training schedule`);
  } else {
    factors.push(`today being a rest day`);
  }

  text += factors.join(", ") + ".";
  return text;
}

export function calculateSleepTarget(config: ActivityConfig): number {
  const parseTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h + m / 60;
  };
  let wake = parseTime(config.wakeTime);
  let sleep = parseTime(config.sleepTime);
  
  let duration = wake - sleep;
  if (duration < 0) duration += 24;
  return Number(duration.toFixed(1));
}
