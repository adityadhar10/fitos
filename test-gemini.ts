import { GoogleGenAI } from '@google/genai';
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const res = await genAI.models.generateContent({ model: 'gemini-2.0-flash-lite', contents: 'hello' });
    console.log("2.0 works", res.text);
  } catch(e) {
    console.error("2.0 failed:", e.message);
  }
}
run();
