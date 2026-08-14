interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  barColor?: string;
}

export function MacroBar({
  label,
  current,
  target,
  unit,
  barColor = "#10b981",
}: MacroBarProps) {
  const percentage = Math.min(100, Math.round((current / target) * 100));

  return (
    <div
      style={{
        backgroundColor: "#18181b",
        border: "1px solid #27272a",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <span style={{ color: "#f4f4f5", fontWeight: 600 }}>{label}</span>
        <span style={{ color: "#a1a1aa", fontSize: "14px" }}>
          {current} / {target}
          {unit}
        </span>
      </div>

      <div
        style={{
          width: "100%",
          height: "10px",
          backgroundColor: "#27272a",
          borderRadius: "9999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            backgroundColor: barColor,
            borderRadius: "9999px",
            transition: "width 0.4s ease-in-out",
          }}
        />
      </div>
    </div>
  );
}