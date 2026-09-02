import { useState, useEffect, useRef } from "react";
import "../index.css";
import { chatWithCoach, getMeals, getTodayMetrics, analyzeFood } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { DEFAULT_CALORIE_GOAL, DEFAULT_PROTEIN_GOAL } from "../constants/goals";
import {
  Sparkles,
  Camera,
  Mic,
  Volume2,
  VolumeX,
  Plus,
  X,
  Copy,
  Check,
  AlertCircle,
  ArrowUp,
  RotateCcw,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  timestamp: string;
}

const STARTER_PROMPTS = [
  {
    icon: "🥩",
    title: "Protein Intake",
    subtitle: "How much do I need per day?",
    desc: "Calculate daily protein targets & best lean sources for recovery.",
    prompt: "How much protein should I eat daily for muscle recovery and what are the best lean food sources?",
  },
  {
    icon: "🥗",
    title: "Meal Macro Scan",
    subtitle: "Analyze my meal and estimate macros",
    desc: "Estimate calories and macronutrients from a food photo or note.",
    prompt: "Estimate the calories, protein, and macronutrients in this meal, and tell me if it is good for post-workout recovery.",
  },
  {
    icon: "🏋️",
    title: "5-Day Split",
    subtitle: "Build my workout routine",
    desc: "Design an evidence-based Push / Pull / Legs hypertrophy split.",
    prompt: "Design an evidence-based 5-day Push/Pull/Legs hypertrophy workout routine with exercise selection and rep ranges.",
  },
  {
    icon: "📐",
    title: "Form Cues",
    subtitle: "Squat/deadlift form & spine safety",
    desc: "Biomechanics cues for spine neutrality, depth & bar path.",
    prompt: "What are the most important biomechanical form cues to protect my lower back and ensure proper depth during squats and deadlifts?",
  },
];

// Offline smart intelligence fallback
function generateOfflineResponse(rawQuery: string, userName = "Athlete"): string {
  const q = rawQuery.toLowerCase().trim();

  // Safety medical notice
  if (
    q.includes("pain") ||
    q.includes("hurt") ||
    q.includes("injury") ||
    q.includes("tear") ||
    q.includes("sprain") ||
    q.includes("fracture") ||
    q.includes("meniscus") ||
    q.includes("dislocat") ||
    q.includes("swelling") ||
    q.includes("diagnos") ||
    q.includes("emergency")
  ) {
    return `### 🩺 Important Health & Safety Notice\n\nI cannot diagnose an injury or medical condition from an image or description. If you are experiencing severe or persistent pain, swelling, numbness, or suspect an acute injury, please consult a qualified healthcare professional or physical therapist.\n\n#### General Recovery Best Practices (R.I.C.E. Protocol):\n- **Rest**: Temporarily avoid heavy loading or high-impact stress on the affected area.\n- **Ice**: Apply a cold compress for 15–20 minutes at a time to reduce acute swelling.\n- **Compression & Elevation**: Use a light wrap and elevate the limb above heart level.\n- **Gradual Return**: Never push through sharp or worsening joint pain.`;
  }

  // Nutrition & Protein
  if (
    q.includes("protein") ||
    q.includes("food") ||
    q.includes("meal") ||
    q.includes("diet") ||
    q.includes("eat") ||
    q.includes("nutrition") ||
    q.includes("calorie")
  ) {
    return `### 🥩 Protein Targets & High-Yield Sources\n\nTo maximize muscle recovery and lean mass retention, aim for **1.6g to 2.2g of protein per kg of bodyweight** daily.\n\n#### 🍗 Lean Non-Vegetarian Sources (Per 100g Cooked):\n- **Chicken Breast**: ~31g protein (165 kcal) — Gold standard lean protein.\n- **Atlantic Salmon**: ~25g protein (208 kcal) — High in Omega-3 EPA/DHA.\n- **Whole Eggs / Egg Whites**: ~6g per large egg / ~11g per 100g whites.\n- **Canned Tuna**: ~26g protein (116 kcal) — Ultra-lean convenience.\n\n#### 🧀 Vegetarian & Plant-Based Sources (Per 100g):\n- **Soy Chunks (TVP)**: ~52g protein per 100g dry — Highest plant density.\n- **Paneer / Cottage Cheese**: ~18g protein (265 kcal) — Rich in slow-digesting casein.\n- **Low-Fat Greek Yogurt**: ~10g protein (59 kcal) — Probiotic rich with leucine.\n- **Tofu (Extra Firm)**: ~15g protein (144 kcal) — Complete amino acid profile.`;
  }

  // Workout splits
  if (
    q.includes("workout") ||
    q.includes("split") ||
    q.includes("routine") ||
    q.includes("squat") ||
    q.includes("bench") ||
    q.includes("deadlift")
  ) {
    return `### 🏋️ Evidence-Based Workout Programming\n\n#### 1. Push / Pull / Legs (PPL) 5-Day Split\n- **Push**: Incline Dumbbell Press (3x8-10), Overhead Barbell Press (3x8), Cable Lateral Raises (4x12-15), Tricep Rope Pushdowns (3x12).\n- **Pull**: Barbell Rows (3x8), Lat Pulldowns (3x10-12), Facepulls (4x15), Incline Dumbbell Curls (3x10-12).\n- **Legs**: Barbell Back Squats (3x6-8), Romanian Deadlifts (3x8-10), Leg Extensions (3x12-15), Standing Calf Raises (4x15).\n\n#### 2. Progressive Overload Principles\n- Increase the load by 2.5kg once you can perform the upper rep target with clean form (RPE 8).\n- Rest 2–3 minutes on compound barbell lifts and 60–90 seconds on isolation accessories.`;
  }

  // Form cues
  if (q.includes("form") || q.includes("biomechanic") || q.includes("depth") || q.includes("cue")) {
    return `### 📐 Biomechanical Form Cues for Squats & Deadlifts\n\n#### 🏋️ Squats (Back & Front):\n1. **Root Your Feet**: Tripod foot contact (big toe, pinky toe, heel).\n2. **Knee Tracking**: Drive knees out in line with your middle toes.\n3. **Depth**: Hip crease below top of knee for full range.\n4. **Spine**: Chest up, brace core 360 degrees.\n\n#### ⚡ Deadlifts (Conventional & Romanian):\n1. **Bar Placement**: Mid-foot balance, 1 inch from shins.\n2. **Lat Engagement**: Squeeze armpits like squeezing oranges.\n3. **Spine Neutrality**: Lock pelvis and ribs; avoid hyperextension.\n4. **Leg Drive**: Push the floor away before hinging hips forward.`;
  }

  return `### ✦ FitOS Coach\n\nRegarding **"${rawQuery}"**:\n\nI'm here to support your training, nutrition, and recovery, ${userName}!\n- **Workout Programming**: Custom splits and exercise cues.\n- **Nutrition & Diet**: Protein requirements and calorie targets.\n- **Exercise Form**: Biomechanics and setup tips.\n\nFeel free to ask any fitness question, tap **🎙️ Voice**, or attach a **📷 Photo**!`;
}

// Markdown Formatter
function renderMarkdown(text: string) {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div style={{ fontSize: 14.5, lineHeight: 1.68, color: "#e2e8f0" }}>
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();

        const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const content = headerMatch[2];
          if (level === 1) {
            return (
              <h2 key={lIdx} style={{ margin: "16px 0 8px", color: "#ffffff", fontSize: 17, fontWeight: 700 }}>
                {renderInline(content)}
              </h2>
            );
          }
          if (level === 2) {
            return (
              <h3 key={lIdx} style={{ margin: "14px 0 6px", color: "#ffffff", fontSize: 15.5, fontWeight: 700 }}>
                {renderInline(content)}
              </h3>
            );
          }
          return (
            <h4 key={lIdx} style={{ margin: "10px 0 4px", color: "#4ade80", fontSize: 14, fontWeight: 600 }}>
              {renderInline(content)}
            </h4>
          );
        }

        if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
          return (
            <div key={lIdx} style={{ display: "flex", gap: 8, margin: "4px 0", paddingLeft: 4 }}>
              <span style={{ color: "#22c55e", fontWeight: 700 }}>•</span>
              <div>{renderInline(trimmed.replace(/^[-*•]\s+/, ""))}</div>
            </div>
          );
        }
        if (/^\d+\.\s+/.test(trimmed)) {
          return (
            <div key={lIdx} style={{ margin: "4px 0", paddingLeft: 4 }}>
              {renderInline(trimmed)}
            </div>
          );
        }
        if (trimmed.startsWith("> ")) {
          return (
            <div key={lIdx} style={{ padding: "8px 14px", background: "rgba(34, 197, 94, 0.08)", borderLeft: "3px solid #22c55e", borderRadius: 6, margin: "8px 0", color: "#d1fae5" }}>
              {renderInline(trimmed.slice(2))}
            </div>
          );
        }
        if (trimmed === "") {
          return <div key={lIdx} style={{ height: 6 }} />;
        }
        return (
          <p key={lIdx} style={{ margin: "5px 0" }}>
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(str: string) {
  const parts = str.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
  return (
    <>
      {parts.map((p, idx) => {
        if (p.startsWith("**") && p.endsWith("**") && p.length >= 4) {
          return (
            <strong key={idx} style={{ color: "#ffffff", fontWeight: 600 }}>
              {p.slice(2, -2)}
            </strong>
          );
        }
        if (p.startsWith("`") && p.endsWith("`") && p.length >= 2) {
          return (
            <code
              key={idx}
              style={{
                background: "rgba(34, 197, 94, 0.12)",
                padding: "2px 6px",
                borderRadius: 4,
                color: "#86efac",
                fontSize: 12.5,
                fontFamily: "monospace",
              }}
            >
              {p.slice(1, -1)}
            </code>
          );
        }
        if (p.startsWith("*") && p.endsWith("*") && p.length >= 3) {
          return (
            <span key={idx} style={{ color: "#86efac", fontStyle: "italic" }}>
              {p.slice(1, -1)}
            </span>
          );
        }
        return p;
      })}
    </>
  );
}

export default function Coach() {
  const { user } = useAuth();
  const userName = user?.name ? user.name.split(" ")[0] : "Athlete";

  const calorieGoal = user?.calorieGoal ?? DEFAULT_CALORIE_GOAL;
  const proteinGoal = user?.proteinGoal ?? DEFAULT_PROTEIN_GOAL;

  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [steps, setSteps] = useState(0);

  // Chat messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 📷 Image upload
  const [selectedImage, setSelectedImage] = useState<{
    dataUrl: string;
    name: string;
    sizeFormatted: string;
    mimeType: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🎙️ Voice recognition
  const [isListening, setIsListening] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // 🔊 Text-to-speech
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Copy message state
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`fitos_visited_coach_${user.id}`, "true");
    }
  }, [user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    Promise.all([getMeals(), getTodayMetrics()])
      .then(([mealsRes, metricsRes]) => {
        const meals = mealsRes.data.meals as { calories: number; protein: number }[];
        setTotalCalories(meals.reduce((sum, m) => sum + m.calories, 0));
        setTotalProtein(meals.reduce((sum, m) => sum + m.protein, 0));
        setSteps(metricsRes.data.metric?.steps || 0);
      })
      .catch((err) => console.error("Failed to load coach metrics context:", err));
  }, []);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const handleNewChat = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMsgId(null);
    setMessages([]);
    setSelectedImage(null);
    setInput("");
  };

  // ----------------------------------------------------
  // 🎙️ VOICE INPUT (Web Speech API with zero duplication bug)
  // ----------------------------------------------------
  const handleToggleVoice = () => {
    setSpeechNotice(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechNotice("Voice input is not supported in this browser.");
      setTimeout(() => setSpeechNotice(null), 4500);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = false;

      const baseText = input.trim();
      let finalTranscript = "";

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechNotice(null);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        const spoken = (finalTranscript + " " + interimTranscript).trim();
        if (spoken) {
          setInput(baseText ? `${baseText} ${spoken}` : spoken);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === "not-allowed") {
          setSpeechNotice("Microphone permission denied. Please allow microphone access.");
        } else if (event.error !== "no-speech") {
          setSpeechNotice("Voice error: " + event.error);
        }
        setIsListening(false);
        setTimeout(() => setSpeechNotice(null), 4500);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setSpeechNotice("Could not start microphone.");
      setIsListening(false);
      setTimeout(() => setSpeechNotice(null), 4500);
    }
  };

  // ----------------------------------------------------
  // 📷 IMAGE INPUT (Native File Selection & Preview)
  // ----------------------------------------------------
  const handleImageButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSpeechNotice("Please select a valid image file (JPG, PNG, WebP).");
      setTimeout(() => setSpeechNotice(null), 4000);
      return;
    }

    let sizeFormatted = `${(file.size / 1024).toFixed(1)} KB`;
    if (file.size >= 1024 * 1024) {
      sizeFormatted = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSelectedImage({
          dataUrl: reader.result,
          name: file.name,
          sizeFormatted,
          mimeType: file.type || "image/jpeg",
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  // ----------------------------------------------------
  // 🔊 TEXT-TO-SPEECH (SpeechSynthesis API Listen Button)
  // ----------------------------------------------------
  const handleListenMessage = (msgId: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechNotice("Speech synthesis is not supported in this browser.");
      setTimeout(() => setSpeechNotice(null), 4000);
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/[#*`_~>]/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const copyMessageText = (msg: Message) => {
    navigator.clipboard.writeText(msg.content);
    setCopiedMsgId(msg.id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      handleSend(lastUserMsg.content);
    }
  };

  // ----------------------------------------------------
  // 💬 SEND HANDLER
  // ----------------------------------------------------
  const handleSend = async (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : input).trim();
    const currentImage = selectedImage;

    if (!query && !currentImage) return;
    if (loading) return;

    const userMsg: Message = {
      id: String(Date.now()),
      role: "user",
      content: query,
      imageUrl: currentImage?.dataUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSelectedImage(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    try {
      // 1. If photo attached
      if (currentImage) {
        try {
          const visionRes = await analyzeFood(currentImage.dataUrl, currentImage.mimeType);
          const analysis = visionRes.data.analysis;
          const reply = `### 📷 Photo Analysis Results\n\n- **Identified**: ${analysis.description || "Item"}\n- **Estimated Calories**: ~${analysis.calories} kcal\n- **Protein**: ~${analysis.protein}g\n- **Carbs**: ~${analysis.carbs}g\n- **Fats**: ~${analysis.fats}g\n- **Confidence**: ${analysis.confidence}\n\n${query ? `#### Regarding your note "${query}":\n\nThis fits into your daily macronutrient targets — let me know if you'd like help balancing the rest of your day around it.` : ""}`;
          setMessages((prev) => [
            ...prev,
            {
              id: String(Date.now() + 1),
              role: "assistant",
              content: reply,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
          setLoading(false);
          return;
        } catch (vErr) {
          console.error("Vision API error:", vErr);
        }

        // Vision analysis failed (network error, rate limit, etc.)
        let reply = `> ⚠️ I couldn't analyze that photo right now — the AI vision service may be temporarily unavailable or rate-limited. Please try again in a moment.\n\n`;
        if (query) {
          const generalAns = generateOfflineResponse(query, userName);
          reply += `Regarding your question **"${query}"**:\n\n` + generalAns;
        }
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: "assistant",
            content: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setLoading(false);
        return;
      }

      // 2. Text-only query
      try {
        const history = messages.map((m) => ({ role: m.role, content: m.content }));
        const res = await chatWithCoach(query, history);
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: "assistant",
            content: res.data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } catch {
        // Fallback offline engine
        const fallbackAns = generateOfflineResponse(query, userName);
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: "assistant",
            content: fallbackAns,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="coach-page">
      {/* Hidden File Input for Native Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageFileChange}
        style={{ display: "none" }}
      />

      {/* ========================================================
          PAGE HEADER
      ======================================================== */}
      <div className="coach-header">
        <div className="coach-header-brand">
          <div className="coach-header-logo">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="coach-title-row">
              <h1 className="coach-title">AI Coach</h1>
              <span className="coach-engine-badge">
                <span className="coach-status-dot" />
                AI Coach Engine [Online]
              </span>
            </div>
            <p className="coach-subtitle">
              Your personal fitness intelligence
            </p>
          </div>
        </div>

        <button
          onClick={handleNewChat}
          className="coach-header-btn"
          title="Start fresh conversation"
          type="button"
        >
          <Plus size={14} /> New Chat
        </button>
      </div>

      {/* Notice Banner */}
      {speechNotice && (
        <div
          style={{
            padding: "10px 16px",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            borderRadius: 12,
            color: "#f87171",
            fontSize: 12.5,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <AlertCircle size={16} />
          <span>{speechNotice}</span>
        </div>
      )}

      {/* ========================================================
          CHAT CANVAS
      ======================================================== */}
      <div className="coach-messages">
        {/* Empty State when no messages */}
        {messages.length === 0 && (
          <div className="coach-empty-state">
            <div className="coach-empty-icon">
              <Sparkles size={22} />
            </div>
            <h2 className="coach-empty-title">
              Your AI Fitness Coach
            </h2>
            <p className="coach-empty-subtitle">
              Ask me anything about your training, nutrition, recovery or progress.
            </p>

            <div className="coach-starter-grid">
              {STARTER_PROMPTS.map((card, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(card.prompt)}
                  className="coach-starter-card"
                  type="button"
                >
                  <div className="coach-starter-header">
                    <span style={{ fontSize: 20, lineHeight: 1 }}>{card.icon}</span>
                    <div>
                      <div className="coach-starter-title">{card.title}</div>
                      <div className="coach-starter-sub">{card.subtitle}</div>
                    </div>
                  </div>
                  <div className="coach-starter-desc">{card.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message history */}
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: m.role === "user" ? "flex-end" : "flex-start",
              gap: 4,
            }}
          >
            <div className={m.role === "user" ? "coach-user-card" : "coach-assistant-card"}>
              <div className="coach-card-header">
                <span className="coach-card-sender" style={{ color: m.role === "user" ? "#86efac" : "#4ade80" }}>
                  {m.role === "user" ? "You" : "FitOS Coach"}
                </span>
                <span className="coach-card-time">{m.timestamp}</span>
              </div>

              {/* Image Preview in User Message */}
              {m.imageUrl && (
                <img
                  src={m.imageUrl}
                  alt="Attached upload"
                  className="coach-attached-img"
                />
              )}

              {/* Message Content */}
              {m.role === "user" ? (
                m.content ? <div style={{ fontSize: 14, lineHeight: 1.6, color: "#ffffff" }}>{m.content}</div> : null
              ) : (
                renderMarkdown(m.content)
              )}
            </div>

            {/* AI Message Action Toolbar */}
            {m.role === "assistant" && (
              <div className="coach-toolbar">
                <button
                  onClick={() => handleListenMessage(m.id, m.content)}
                  className={`coach-tool-btn ${speakingMsgId === m.id ? "coach-tool-btn-active" : ""}`}
                  title={speakingMsgId === m.id ? "Stop voice playback" : "Listen to response"}
                  type="button"
                >
                  {speakingMsgId === m.id ? <VolumeX size={13} color="#fca5a5" /> : <Volume2 size={13} color="#4ade80" />}
                  <span>{speakingMsgId === m.id ? "■ Stop" : "🔊 Listen"}</span>
                </button>

                <button
                  onClick={() => copyMessageText(m)}
                  className="coach-tool-btn"
                  type="button"
                >
                  {copiedMsgId === m.id ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                  <span>{copiedMsgId === m.id ? "Copied" : "Copy"}</span>
                </button>

                <button
                  onClick={handleRegenerate}
                  className="coach-tool-btn"
                  type="button"
                >
                  <RotateCcw size={12} />
                  <span>Regenerate</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div
            style={{
              alignSelf: "flex-start",
              background: "#111713",
              border: "1px solid #1e2620",
              borderRadius: 12,
              padding: "10px 14px",
              color: "#4ade80",
              fontSize: 12.5,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Sparkles size={15} />
            <span>Analyzing &amp; formulating response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ========================================================
          COMPOSER INPUT AREA
      ======================================================== */}
      <div className="coach-composer-wrap">
        {/* 📷 Attached Image Preview Bar */}
        {selectedImage && (
          <div className="coach-preview-bar">
            <div className="coach-preview-meta">
              <img
                src={selectedImage.dataUrl}
                alt={selectedImage.name}
                className="coach-preview-thumb"
              />
              <div>
                <div className="coach-preview-name">{selectedImage.name}</div>
                <div className="coach-preview-size">{selectedImage.sizeFormatted} • Ready to send</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveImage}
              className="coach-preview-remove"
              title="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={2}
          placeholder={
            selectedImage
              ? "Ask something about this image... (e.g. calories, macros, form cues)"
              : isListening
              ? "Listening... Speak your question..."
              : "Ask your AI Coach anything..."
          }
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="coach-input-textarea"
        />

        {/* Action Controls Row */}
        <div className="coach-controls-row">
          <div className="coach-btn-group">
            {/* 🎙️ Voice Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`coach-input-btn ${isListening ? "coach-input-btn-active" : ""}`}
              title={isListening ? "Stop listening" : "Speak using microphone"}
            >
              <Mic size={14} />
              <span>{isListening ? "🔴 Listening..." : "🎙️ Voice"}</span>
            </button>

            {/* 📷 Photo Button */}
            <button
              type="button"
              onClick={handleImageButtonClick}
              className="coach-input-btn"
              title="Attach photo"
            >
              <Camera size={14} />
              <span>📷 Photo</span>
            </button>
          </div>

          {/* ➤ Send Button */}
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={(!input.trim() && !selectedImage) || loading}
            className="coach-submit-btn"
          >
            <span>Send</span>
            <ArrowUp size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
