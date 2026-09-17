import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const res = await genAI.models.generateContent({ model: 'gemini-2.0-flash-lite', contents: 'hello' });
    console.log("2.0 works", res.text);
  } catch(e) {
    console.error("2.0 failed:", e.message);
    try {
      const res2 = await genAI.models.generateContent({ model: 'gemini-3.5-flash-lite', contents: 'hello' });
      console.log("3.5 works", res2.text);
    } catch(e2) {
      console.error("3.5 failed:", e2.message);
    }
  }
}
run();
