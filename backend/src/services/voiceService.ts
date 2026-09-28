import { execFile, ChildProcess } from "node:child_process";

let speechProcess: ChildProcess | null = null;

export class VoiceError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const voiceService = {
  startSpeech(rawText: any) {
    const text = typeof rawText === "string" ? rawText.replace(/\s+/g, " ").trim() : "";

    if (!text) {
      throw new VoiceError("Speech text is required.", 400);
    }

    if (text.length > 2000) {
      throw new VoiceError("Speech text is too long.", 400);
    }

    if (speechProcess && !speechProcess.killed) {
      try {
        speechProcess.kill();
      } catch {}
      speechProcess = null;
    }

    speechProcess = execFile("say", ["-v", "Alex", text], (error) => {
      if (error) {
        console.error("FITOS MAC VOICE ERROR:", error);
      }
      speechProcess = null;
    });

    return {
      success: true,
      message: "Speech started.",
    };
  },

  stopSpeech() {
    if (speechProcess && !speechProcess.killed) {
      try {
        speechProcess.kill();
      } catch {}
    }

    speechProcess = null;

    return {
      success: true,
      message: "Speech stopped.",
    };
  }
};
