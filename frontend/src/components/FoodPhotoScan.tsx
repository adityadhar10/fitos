import { useRef, useState } from "react";
import { analyzeFood } from "../services/api";

interface NutritionResult {
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  confidence: "high" | "medium" | "low";
}

interface FoodPhotoScanProps {
  onResult: (result: NutritionResult) => void;
}

const CONFIDENCE_COLORS = {
  high: "#22c55e",
  medium: "#f59e0b",
  low: "#ef4444",
};

const CONFIDENCE_LABELS = {
  high: "High Confidence",
  medium: "Medium Confidence",
  low: "Low Confidence",
};

export default function FoodPhotoScan({ onResult }: FoodPhotoScanProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<NutritionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);

      // Strip data URL prefix to get raw base64
      const base64 = dataUrl.split(",")[1];
      const mimeType = file.type as "image/jpeg" | "image/png" | "image/webp";

      setScanning(true);
      try {
        const res = await analyzeFood(base64, mimeType);
        const analysis = res.data.analysis as NutritionResult;
        setResult(analysis);
        // Don't auto-call onResult yet — let user confirm
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error ?? "Failed to analyze food. Please try again.";
        setError(msg);
      } finally {
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUseResult = () => {
    if (result) {
      onResult(result);
      setPreview(null);
      setResult(null);
    }
  };

  const handleRetry = () => {
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="food-scan-container">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: "none" }}
        id="food-photo-input"
      />

      {!preview && (
        <div className="scan-upload-zone" onClick={() => fileInputRef.current?.click()}>
          <div className="scan-upload-icon"></div>
          <p className="scan-upload-title">Scan Food with AI</p>
          <p className="scan-upload-sub">
            Take a photo or upload an image — Gemini Vision will estimate the macros
          </p>
          <button className="scan-btn" type="button">
            Open Camera / Upload
          </button>
        </div>
      )}

      {preview && (
        <div className="scan-result-container">
          <div className="scan-preview-wrapper">
            <img src={preview} alt="Food preview" className="scan-preview-img" />
            {scanning && (
              <div className="scan-overlay">
                <div className="scan-line" />
                <p className="scan-analyzing-text">Analyzing with Gemini Vision...</p>
              </div>
            )}
          </div>

          {scanning && (
            <div className="scan-loading">
              <div className="scan-pulse" />
              <span>Identifying food and estimating macros...</span>
            </div>
          )}

          {error && (
            <div className="scan-error">
              <span>️ {error}</span>
              <button className="scan-retry-btn" onClick={handleRetry} type="button">
                Try Again
              </button>
            </div>
          )}

          {result && !scanning && (
            <div className="scan-result-card">
              <div className="scan-result-header">
                <span className="scan-result-icon">️</span>
                <div>
                  <h3 className="scan-result-name">{result.description}</h3>
                  <span
                    className="scan-confidence-badge"
                    style={{ color: CONFIDENCE_COLORS[result.confidence] }}
                  >
                    ● {CONFIDENCE_LABELS[result.confidence]}
                  </span>
                </div>
              </div>

              <div className="scan-macros-grid">
                <div className="scan-macro-item">
                  <span className="scan-macro-value">{result.calories}</span>
                  <span className="scan-macro-label">kcal</span>
                </div>
                <div className="scan-macro-item">
                  <span className="scan-macro-value">{result.protein}g</span>
                  <span className="scan-macro-label">Protein</span>
                </div>
                <div className="scan-macro-item">
                  <span className="scan-macro-value">{result.carbs}g</span>
                  <span className="scan-macro-label">Carbs</span>
                </div>
                <div className="scan-macro-item">
                  <span className="scan-macro-value">{result.fats}g</span>
                  <span className="scan-macro-label">Fats</span>
                </div>
              </div>

              <div className="scan-action-row">
                <button className="scan-retry-btn" onClick={handleRetry} type="button">
                  Retake
                </button>
                <button className="scan-use-btn" onClick={handleUseResult} type="button">
                  Log This Meal
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
