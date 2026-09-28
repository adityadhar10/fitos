import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

async function test() {
  const token = jwt.sign({ userId: "82b0e2f8-fb33-407e-b2da-a85d61ab333e" }, process.env.JWT_SECRET || 'fitos-super-secret-jwt-key-2026', { expiresIn: '7d' });
  
  const formExercises = [
    { id: "ex_1", name: "Bench Press", muscleGroup: "", sets: [{ reps: "10", weight: "50" }] }
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

  const payload = {
    name: "Test Chest Session",
    date: new Date().toISOString(),
    exercises: exercisesPayload
  };

  console.log("Payload:", JSON.stringify(payload, null, 2));

  const res = await fetch('http://localhost:5001/api/workouts/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Body:", text);
}
test();
