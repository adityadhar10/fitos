import { useState, useRef } from "react";

interface WeightEntry {
  id: string;
  weight: number;
  date: string;
}

interface Props {
  entries: WeightEntry[];
  goalWeight: number;
}

const WIDTH = 600;
const HEIGHT = 200;
const PAD = { top: 16, right: 20, bottom: 32, left: 44 };

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function WeightChart({ entries, goalWeight }: Props) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; weight: number; date: string } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (entries.length === 0) {
    return (
      <div className="empty-state" style={{ padding: "32px 20px" }}>
        <div className="empty-icon">📉</div>
        <p>Log your first weight entry to see your chart.</p>
      </div>
    );
  }

  const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const weights = sorted.map((e) => e.weight);
  const minW = Math.min(...weights, goalWeight) - 2;
  const maxW = Math.max(...weights, goalWeight) + 2;

  const chartW = WIDTH - PAD.left - PAD.right;
  const chartH = HEIGHT - PAD.top - PAD.bottom;

  const toX = (i: number) => PAD.left + (i / Math.max(sorted.length - 1, 1)) * chartW;
  const toY = (w: number) => PAD.top + ((maxW - w) / (maxW - minW)) * chartH;

  const points = sorted.map((e, i) => ({ x: toX(i), y: toY(e.weight), entry: e }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(PAD.top + chartH).toFixed(1)} L ${PAD.left.toFixed(1)} ${(PAD.top + chartH).toFixed(1)} Z`;

  const goalY = toY(goalWeight);

  // Y axis ticks
  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const v = minW + ((maxW - minW) * i) / tickCount;
    return { v: Math.round(v * 10) / 10, y: toY(v) };
  });

  return (
    <div className="weight-chart-svg-wrapper" style={{ position: "relative" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y-axis grid + labels */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={PAD.left} y1={t.y} x2={WIDTH - PAD.right} y2={t.y} stroke="#1a211d" strokeWidth="1" />
            <text x={PAD.left - 6} y={t.y + 4} textAnchor="end" fill="#4a5450" fontSize="10">
              {t.v}
            </text>
          </g>
        ))}

        {/* Goal line */}
        <line
          x1={PAD.left}
          y1={goalY}
          x2={WIDTH - PAD.right}
          y2={goalY}
          stroke="#facc15"
          strokeWidth="1.5"
          strokeDasharray="5 4"
          opacity="0.6"
        />
        <text x={WIDTH - PAD.right + 4} y={goalY + 4} fill="#facc15" fontSize="9" opacity="0.8">
          Goal
        </text>

        {/* Area fill */}
        <path d={areaPath} fill="url(#weightGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots + hover targets */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#4ade80" />
            <circle
              cx={p.x}
              cy={p.y}
              r="12"
              fill="transparent"
              style={{ cursor: "pointer" }}
              onMouseEnter={() =>
                setTooltip({ x: p.x, y: p.y, weight: p.entry.weight, date: p.entry.date })
              }
              onMouseLeave={() => setTooltip(null)}
            />
          </g>
        ))}

        {/* X-axis dates — show first, last, and some middle ones */}
        {points.map((p, i) => {
          const show = i === 0 || i === points.length - 1 || (points.length > 4 && i === Math.floor(points.length / 2));
          if (!show) return null;
          return (
            <text key={i} x={p.x} y={HEIGHT - 4} textAnchor="middle" fill="#4a5450" fontSize="9">
              {formatDate(p.entry.date)}
            </text>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="weight-chart-tooltip"
          style={{
            left: `${(tooltip.x / WIDTH) * 100}%`,
            top: `${(tooltip.y / HEIGHT) * 100 - 12}%`,
          }}
        >
          {tooltip.weight}kg · {formatDate(tooltip.date)}
        </div>
      )}
    </div>
  );
}
