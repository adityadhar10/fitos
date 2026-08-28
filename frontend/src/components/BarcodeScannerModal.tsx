import { useState } from "react";
import { lookupBarcode } from "../services/api";

interface BarcodeModalProps {
  onSelect: (food: { name: string; calories: number; protein: number; carbs: number; fats: number }) => void;
  onClose: () => void;
}

const SAMPLE_BARCODES = [
  { name: "Quest Nutrition Protein Bar", code: "888849000104" },
  { name: "Optimum Nutrition Gold Standard Whey", code: "748927028669" },
  { name: "Chobani Plain Greek Yogurt", code: "894700010045" },
  { name: "Skippy Peanut Butter", code: "037600106253" },
];

export default function BarcodeScannerModal({ onSelect, onClose }: BarcodeModalProps) {
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    servingSize?: string;
  } | null>(null);

  const handleLookup = async (codeToSearch?: string) => {
    const query = (codeToSearch || barcode).trim();
    if (!query) return;

    setLoading(true);
    setError(null);
    setProduct(null);

    try {
      const res = await lookupBarcode(query);
      setProduct(res.data.product);
    } catch (err: any) {
      console.error("Barcode error:", err);
      // Fallback sample product if offline or rate limited
      setError("Product barcode not found in global database. Try another code or enter manually.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (product) {
      onSelect(product);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0e1511",
          border: "1px solid #24382c",
          borderRadius: 20,
          padding: 24,
          maxWidth: 440,
          width: "100%",
          boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}></span>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#ffffff" }}>Food Barcode Scanner</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "#8a968f", cursor: "pointer", fontSize: 16 }}
          >
                      </button>
        </div>

        <p className="subtext" style={{ fontSize: 13, marginBottom: 14 }}>
          Enter or scan any packaged food barcode (UPC / EAN) to pull verified nutritional macros via OpenFoodFacts.
        </p>

        {/* Input Barcode Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup();
          }}
          style={{ display: "flex", gap: 8, marginBottom: 14 }}
        >
          <input
            placeholder="Enter Barcode (e.g. 888849000104)"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 10,
              background: "#080c0a",
              border: "1px solid #233027",
              color: "#fff",
              outline: "none",
              fontSize: 13,
            }}
          />
          <button type="submit" className="primary-button" disabled={loading || !barcode.trim()}>
            {loading ? "Searching..." : "Lookup"}
          </button>
        </form>

        {/* Sample Barcode Chips */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: "#8a968f", display: "block", marginBottom: 6 }}>Popular Quick Test Barcodes:</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {SAMPLE_BARCODES.map((s) => (
              <button
                key={s.code}
                type="button"
                onClick={() => {
                  setBarcode(s.code);
                  handleLookup(s.code);
                }}
                style={{
                  padding: "5px 9px",
                  borderRadius: 8,
                  background: "#131e17",
                  border: "1px solid #223a2a",
                  color: "#4ade80",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: "#261313", color: "#f87171", padding: "10px 12px", borderRadius: 10, border: "1px solid #592121", fontSize: 12, marginBottom: 14 }}>
            ️ {error}
          </div>
        )}

        {/* Scanned Result Card */}
        {product && (
          <div style={{ background: "#111c15", border: "1px solid #254a32", borderRadius: 14, padding: 14, marginBottom: 16 }}>
            <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 700, textTransform: "uppercase" }}>Barcode Verified</span>
            <h3 style={{ margin: "4px 0 8px 0", fontSize: 15, fontWeight: 700, color: "#ffffff" }}>{product.name}</h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, textAlign: "center", marginBottom: 12 }}>
              <div style={{ background: "#0a110d", padding: "6px", borderRadius: 6 }}>
                <span style={{ fontSize: 10, color: "#8a968f" }}>Calories</span>
                <strong style={{ fontSize: 13, color: "#fff", display: "block" }}>{product.calories}</strong>
              </div>
              <div style={{ background: "#0a110d", padding: "6px", borderRadius: 6 }}>
                <span style={{ fontSize: 10, color: "#4ade80" }}>Protein</span>
                <strong style={{ fontSize: 13, color: "#fff", display: "block" }}>{product.protein}g</strong>
              </div>
              <div style={{ background: "#0a110d", padding: "6px", borderRadius: 6 }}>
                <span style={{ fontSize: 10, color: "#38bdf8" }}>Carbs</span>
                <strong style={{ fontSize: 13, color: "#fff", display: "block" }}>{product.carbs}g</strong>
              </div>
              <div style={{ background: "#0a110d", padding: "6px", borderRadius: 6 }}>
                <span style={{ fontSize: 10, color: "#fbbf24" }}>Fats</span>
                <strong style={{ fontSize: 13, color: "#fff", display: "block" }}>{product.fats}g</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              className="primary-button"
              style={{ width: "100%", padding: "10px", fontSize: 13, fontWeight: 700 }}
            >
              Use This Product In Meal Log
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
