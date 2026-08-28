import { useState, useMemo } from "react";
import { getMusclesTouched, type MuscleGroup } from "../data/muscleMap";
import { Dumbbell, ArrowUpFromLine, Zap, Flame, Footprints, type LucideIcon } from "lucide-react";

interface Workout {
  id: string;
  name: string;
  muscleGroup?: string | null;
  date?: string;
}

interface MuscleHeatmapProps {
  workouts: Workout[];
}

interface MuscleCategory {
  name: string;
  icon: LucideIcon;
  groups: MuscleGroup[];
}

const CATEGORIES: MuscleCategory[] = [
  { name: "Chest", icon: Dumbbell, groups: ["chest"] },
  { name: "Back & Lats", icon: ArrowUpFromLine, groups: ["lats", "upper_back", "lower_back", "traps"] },
  { name: "Shoulders", icon: Zap, groups: ["shoulders"] },
  { name: "Arms", icon: Dumbbell, groups: ["biceps", "triceps", "forearms"] },
  { name: "Legs", icon: Footprints, groups: ["quads", "hamstrings", "glutes", "calves"] },
  { name: "Core & Abs", icon: Flame, groups: ["abs", "obliques"] },
];

export default function MuscleHeatmap({ workouts }: MuscleHeatmapProps) {
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);

  const muscleHits = useMemo(() => {
    const counts: Partial<Record<MuscleGroup, number>> = {};
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    for (const w of workouts) {
      if (w.date && new Date(w.date) < sevenDaysAgo) continue;
      const touched = getMusclesTouched(w.name);
      for (const m of touched) {
        counts[m] = (counts[m] || 0) + 1;
      }
    }
    return counts;
  }, [workouts]);

  const maxHits = useMemo(() => {
    const values = Object.values(muscleHits) as number[];
    return Math.max(1, ...values);
  }, [muscleHits]);

  const getFillColor = (group: MuscleGroup) => {
    const hits = muscleHits[group] || 0;
    if (hits === 0) return "#16221a";
    const intensity = Math.min(1, hits / maxHits);
    if (intensity > 0.7) return "#22c55e";
    if (intensity > 0.3) return "#16a34a";
    return "#15803d";
  };

  const getGlowFilter = (group: MuscleGroup) => {
    const hits = muscleHits[group] || 0;
    if (hits > 0) return "drop-shadow(0px 0px 6px rgba(34, 197, 94, 0.6))";
    return "none";
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, alignItems: "center" }}>
      <div style={{ background: "#0b110e", padding: "20px 16px", borderRadius: 16, border: "1px solid #1a261f" }}>
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "1px", color: "#8a978f" }}>FRONT VIEW</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "1px", color: "#8a978f" }}>BACK VIEW</span>
        </div>

        <svg viewBox="0 0 340 380" style={{ width: "100%", maxHeight: 340, display: "block", margin: "0 auto" }}>
          <g transform="translate(10, 10)">
            <ellipse cx="75" cy="24" rx="14" ry="18" fill="#18231c" stroke="#25352a" strokeWidth="1.5" />
            <path d="M 68,40 L 68,52 L 82,52 L 82,40 Z" fill="#18231c" stroke="#25352a" strokeWidth="1.5" />

            <path d="M 46,54 Q 32,58 28,74 Q 40,78 48,68 Z" fill={getFillColor("shoulders")} stroke="#2e4235" strokeWidth="1" style={{ filter: getGlowFilter("shoulders"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Shoulders")} onMouseLeave={() => setHoveredGroup(null)} />
            <path d="M 104,54 Q 118,58 122,74 Q 110,78 102,68 Z" fill={getFillColor("shoulders")} stroke="#2e4235" strokeWidth="1" style={{ filter: getGlowFilter("shoulders"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Shoulders")} onMouseLeave={() => setHoveredGroup(null)} />

            <path d="M 50,58 Q 75,56 75,90 Q 52,94 48,72 Z" fill={getFillColor("chest")} stroke="#2e4235" strokeWidth="1.2" style={{ filter: getGlowFilter("chest"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Chest")} onMouseLeave={() => setHoveredGroup(null)} />
            <path d="M 100,58 Q 75,56 75,90 Q 98,94 102,72 Z" fill={getFillColor("chest")} stroke="#2e4235" strokeWidth="1.2" style={{ filter: getGlowFilter("chest"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Chest")} onMouseLeave={() => setHoveredGroup(null)} />

            <path d="M 26,76 Q 20,95 24,116 Q 34,114 34,92 Z" fill={getFillColor("biceps")} stroke="#2e4235" strokeWidth="1" style={{ filter: getGlowFilter("biceps"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Biceps")} onMouseLeave={() => setHoveredGroup(null)} />
            <path d="M 124,76 Q 130,95 126,116 Q 116,114 116,92 Z" fill={getFillColor("biceps")} stroke="#2e4235" strokeWidth="1" style={{ filter: getGlowFilter("biceps"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Biceps")} onMouseLeave={() => setHoveredGroup(null)} />

            <path d="M 22,118 Q 16,140 18,165 Q 26,165 28,140 Z" fill={getFillColor("forearms")} stroke="#2e4235" strokeWidth="1" style={{ filter: getGlowFilter("forearms"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Forearms")} onMouseLeave={() => setHoveredGroup(null)} />
            <path d="M 128,118 Q 134,140 132,165 Q 124,165 122,140 Z" fill={getFillColor("forearms")} stroke="#2e4235" strokeWidth="1" style={{ filter: getGlowFilter("forearms"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Forearms")} onMouseLeave={() => setHoveredGroup(null)} />

            <path d="M 58,94 L 92,94 L 90,154 L 60,154 Z" fill={getFillColor("abs")} stroke="#2e4235" strokeWidth="1.2" style={{ filter: getGlowFilter("abs"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Abs / Core")} onMouseLeave={() => setHoveredGroup(null)} />

            <path d="M 48,94 L 56,94 L 58,154 L 46,146 Z" fill={getFillColor("obliques")} stroke="#2e4235" strokeWidth="1" style={{ filter: getGlowFilter("obliques"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Obliques")} onMouseLeave={() => setHoveredGroup(null)} />
            <path d="M 102,94 L 94,94 L 92,154 L 104,146 Z" fill={getFillColor("obliques")} stroke="#2e4235" strokeWidth="1" style={{ filter: getGlowFilter("obliques"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Obliques")} onMouseLeave={() => setHoveredGroup(null)} />

            <path d="M 48,162 Q 44,210 52,250 Q 72,250 72,162 Z" fill={getFillColor("quads")} stroke="#2e4235" strokeWidth="1.2" style={{ filter: getGlowFilter("quads"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Quads")} onMouseLeave={() => setHoveredGroup(null)} />
            <path d="M 102,162 Q 106,210 98,250 Q 78,250 78,162 Z" fill={getFillColor("quads")} stroke="#2e4235" strokeWidth="1.2" style={{ filter: getGlowFilter("quads"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Quads")} onMouseLeave={() => setHoveredGroup(null)} />

            <path d="M 50,256 Q 46,295 52,340 Q 66,340 68,256 Z" fill={getFillColor("calves")} stroke="#2e4235" strokeWidth="1" style={{ filter: getGlowFilter("calves"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Calves")} onMouseLeave={() => setHoveredGroup(null)} />
            <path d="M 100,256 Q 104,295 98,340 Q 84,340 82,256 Z" fill={getFillColor("calves")} stroke="#2e4235" strokeWidth="1" style={{ filter: getGlowFilter("calves"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Calves")} onMouseLeave={() => setHoveredGroup(null)} />
          </g>

          <g transform="translate(180, 10)">
            <ellipse cx="75" cy="24" rx="14" ry="18" fill="#18231c" stroke="#25352a" strokeWidth="1.5" />
            <path d="M 62,42 Q 75,48 88,42 L 96,62 Q 75,70 54,62 Z" fill={getFillColor("traps")} stroke="#2e4235" strokeWidth="1.2" style={{ filter: getGlowFilter("traps"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Traps")} onMouseLeave={() => setHoveredGroup(null)} />

            <path d="M 52,64 Q 75,72 98,64 L 102,136 Q 75,146 48,136 Z" fill={getFillColor("lats")} stroke="#2e4235" strokeWidth="1.2" style={{ filter: getGlowFilter("lats"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Lats / Back")} onMouseLeave={() => setHoveredGroup(null)} />

            <path d="M 28,74 Q 22,96 26,118 Q 36,116 36,90 Z" fill={getFillColor("triceps")} stroke="#2e4235" strokeWidth="1" style={{ filter: getGlowFilter("triceps"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Triceps")} onMouseLeave={() => setHoveredGroup(null)} />
            <path d="M 122,74 Q 128,96 124,118 Q 114,116 114,90 Z" fill={getFillColor("triceps")} stroke="#2e4235" strokeWidth="1" style={{ filter: getGlowFilter("triceps"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Triceps")} onMouseLeave={() => setHoveredGroup(null)} />

            <path d="M 54,138 Q 75,146 96,138 L 94,158 Q 75,164 56,158 Z" fill={getFillColor("lower_back")} stroke="#2e4235" strokeWidth="1" style={{ filter: getGlowFilter("lower_back"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Lower Back")} onMouseLeave={() => setHoveredGroup(null)} />

            <path d="M 48,160 Q 75,166 75,200 Q 46,200 46,170 Z" fill={getFillColor("glutes")} stroke="#2e4235" strokeWidth="1.2" style={{ filter: getGlowFilter("glutes"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Glutes")} onMouseLeave={() => setHoveredGroup(null)} />
            <path d="M 102,160 Q 75,166 75,200 Q 104,200 104,170 Z" fill={getFillColor("glutes")} stroke="#2e4235" strokeWidth="1.2" style={{ filter: getGlowFilter("glutes"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Glutes")} onMouseLeave={() => setHoveredGroup(null)} />

            <path d="M 46,204 Q 44,235 52,252 Q 72,252 74,204 Z" fill={getFillColor("hamstrings")} stroke="#2e4235" strokeWidth="1.2" style={{ filter: getGlowFilter("hamstrings"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Hamstrings")} onMouseLeave={() => setHoveredGroup(null)} />
            <path d="M 104,204 Q 106,235 98,252 Q 78,252 76,204 Z" fill={getFillColor("hamstrings")} stroke="#2e4235" strokeWidth="1.2" style={{ filter: getGlowFilter("hamstrings"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Hamstrings")} onMouseLeave={() => setHoveredGroup(null)} />

            <path d="M 48,256 Q 44,295 52,340 Q 66,340 70,256 Z" fill={getFillColor("calves")} stroke="#2e4235" strokeWidth="1.2" style={{ filter: getGlowFilter("calves"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Calves")} onMouseLeave={() => setHoveredGroup(null)} />
            <path d="M 102,256 Q 106,295 98,340 Q 84,340 80,256 Z" fill={getFillColor("calves")} stroke="#2e4235" strokeWidth="1.2" style={{ filter: getGlowFilter("calves"), cursor: "pointer", transition: "fill 0.3s ease" }} onMouseEnter={() => setHoveredGroup("Calves")} onMouseLeave={() => setHoveredGroup(null)} />
          </g>
        </svg>

        {hoveredGroup && (
          <div style={{ textAlign: "center", marginTop: 8, color: "#4ade80", fontSize: 13, fontWeight: 600 }}>
            Highlighted: {hoveredGroup}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", marginBottom: 4 }}>Weekly Muscle Activation</h3>
          <p style={{ fontSize: 13, color: "#7a8580", margin: 0 }}>
            Visualizes which muscle groups were stimulated based on your logged workouts this week.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {CATEGORIES.map((cat) => {
            const totalHits = cat.groups.reduce((sum, g) => sum + (muscleHits[g] || 0), 0);
            const active = totalHits > 0;
            const pct = Math.min(100, Math.round((totalHits / Math.max(1, maxHits * 2)) * 100));
            const Icon = cat.icon;

            return (
              <div
                key={cat.name}
                style={{
                  padding: "10px 14px",
                  background: active ? "#101813" : "#0d120f",
                  border: `1px solid ${active ? "#223d2b" : "#19221c"}`,
                  borderRadius: 10,
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: active ? "#ffffff" : "#6a7570", display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon size={15} /> {cat.name}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: active ? "#4ade80" : "#4a5550",
                    }}
                  >
                    {totalHits === 0 ? "Not worked" : `${totalHits} session${totalHits > 1 ? "s" : ""}`}
                  </span>
                </div>
                <div style={{ width: "100%", height: 6, background: "#17221b", borderRadius: 4, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${active ? Math.max(15, pct) : 0}%`,
                      height: "100%",
                      background: active ? "linear-gradient(90deg, #15803d, #22c55e)" : "transparent",
                      borderRadius: 4,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
