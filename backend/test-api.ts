import prisma from './src/lib/prisma.js';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) { console.log("No user"); return; }
  const JWT_SECRET = process.env.JWT_SECRET || 'fitos-super-secret-jwt-key-2026';
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  
  const payload = {
    name: "Test Workout",
    date: new Date().toISOString(),
    exercises: [
      {
        name: "Bench Press",
        muscleGroup: "Chest",
        sets: [ { reps: 10, weight: 50 } ]
      }
    ]
  };

  console.log("Sending payload:", payload);
  const res = await fetch('http://localhost:5001/api/workouts/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  
  const text = await res.text();
  console.log("Response status:", res.status);
  console.log("Response body:", text);
}
main().then(() => process.exit(0));
