import type { StatusLevel, NavStatus, RiskLevel } from "../data/lubiData";

const statusConfig: Record<string, { color: string; bg: string; label: string; dot: string }> = {
  normal: { color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "Normal", dot: "#10b981" },
  vigilance: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Vigilance", dot: "#f59e0b" },
  alerte: { color: "#f97316", bg: "rgba(249,115,22,0.12)", label: "Alerte", dot: "#f97316" },
  critique: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "Critique", dot: "#ef4444" },
  info: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", label: "Information", dot: "#3b82f6" },
  navigable: { color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "Navigable", dot: "#10b981" },
  "non-navigable": { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "Non navigable", dot: "#ef4444" },
  faible: { color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "Faible", dot: "#10b981" },
  modere: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Modéré", dot: "#f59e0b" },
  eleve: { color: "#f97316", bg: "rgba(249,115,22,0.12)", label: "Élevé", dot: "#f97316" },
};

interface Props {
  status: StatusLevel | NavStatus | RiskLevel | string;
  size?: "sm" | "md";
  showDot?: boolean;
}

export default function StatusBadge({ status, size = "sm", showDot = true }: Props) {
  const cfg = statusConfig[status] ?? statusConfig["normal"];
  return (
    <span
      className="inline-flex items-center gap-1 font-mono font-500 rounded-full uppercase"
      style={{
        color: cfg.color,
        background: cfg.bg,
        fontSize: size === "sm" ? "10px" : "12px",
        padding: size === "sm" ? "2px 8px" : "3px 10px",
        letterSpacing: "0.06em",
      }}
    >
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: cfg.dot }}
        />
      )}
      {cfg.label}
    </span>
  );
}
