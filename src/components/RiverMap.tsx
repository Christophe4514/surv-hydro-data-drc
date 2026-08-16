import { useState } from "react";
import { stations, type Station } from "../data/lubiData";

const statusColors: Record<string, string> = {
  normal: "#10b981",
  vigilance: "#f59e0b",
  alerte: "#f97316",
  critique: "#ef4444",
};

interface Props {
  onStationClick?: (s: Station) => void;
  compact?: boolean;
}

export default function RiverMap({ onStationClick, compact = false }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<Station | null>(null);

  const h = compact ? 320 : 500;

  const riverPath = `
    M 200 30
    C 205 60, 215 90, 230 120
    C 245 150, 235 180, 215 210
    C 195 240, 190 270, 185 300
    C 182 330, 220 370, 240 410
    C 250 440, 240 460, 230 480
  `;

  const handleStation = (s: Station) => {
    setSelected(selected?.id === s.id ? null : s);
    onStationClick?.(s);
  };

  return (
    <div className="relative w-full" style={{ height: h }}>
      <svg
        viewBox={`0 0 420 ${compact ? 320 : 500}`}
        className="w-full h-full"
        style={{ background: "transparent" }}
      >
        <defs>
          <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(34,211,238,0.05)" strokeWidth="0.5" />
          </pattern>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="420" height={compact ? 320 : 500} fill="url(#mapgrid)" />

        <path
          d={riverPath}
          stroke="rgba(34,211,238,0.15)"
          strokeWidth="20"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={riverPath}
          stroke="#06b6d4"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          filter="url(#glow)"
          opacity="0.8"
        />
        <path
          d={riverPath}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="6 8"
        />

        <text x="18" y="45" fontSize="9" fill="rgba(34,211,238,0.5)" fontFamily="JetBrains Mono, monospace">
          N
        </text>
        <path d="M 22 28 L 22 18 L 18 23 M 22 18 L 26 23" stroke="rgba(34,211,238,0.5)" strokeWidth="1" fill="none" />

        <g transform={`translate(10, ${compact ? 295 : 475})`}>
          <line x1="0" y1="0" x2="40" y2="0" stroke="rgba(148,163,184,0.4)" strokeWidth="1" />
          <line x1="0" y1="-3" x2="0" y2="3" stroke="rgba(148,163,184,0.4)" strokeWidth="1" />
          <line x1="40" y1="-3" x2="40" y2="3" stroke="rgba(148,163,184,0.4)" strokeWidth="1" />
          <text x="20" y="-6" textAnchor="middle" fontSize="8" fill="rgba(148,163,184,0.5)" fontFamily="JetBrains Mono, monospace">
            ~50 km
          </text>
        </g>

        {stations.map((s) => {
          if (compact && s.svgY > 320) return null;
          const color = statusColors[s.status];
          const isHov = hovered === s.id;
          const isSel = selected?.id === s.id;

          return (
            <g key={s.id}>
              {s.status !== "normal" && (
                <circle
                  cx={s.svgX}
                  cy={s.svgY}
                  r={isHov ? 18 : 14}
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  opacity="0.3"
                />
              )}
              <circle
                cx={s.svgX}
                cy={s.svgY}
                r={isHov || isSel ? 9 : 7}
                fill={color}
                opacity={isHov || isSel ? 1 : 0.85}
                style={{ cursor: "pointer", transition: "all 0.15s" }}
                filter="url(#glow)"
                onClick={() => handleStation(s)}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
              />
              <circle
                cx={s.svgX}
                cy={s.svgY}
                r={isHov || isSel ? 4 : 3}
                fill="white"
                opacity="0.9"
                style={{ pointerEvents: "none" }}
              />
              <text
                x={s.svgX + 12}
                y={s.svgY + 4}
                fontSize="9"
                fill="rgba(226,232,240,0.85)"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="600"
                style={{ pointerEvents: "none" }}
              >
                {s.code}
              </text>
            </g>
          );
        })}

        {selected && selected.svgY <= (compact ? 320 : 500) && (() => {
          const px = selected.svgX > 250 ? selected.svgX - 145 : selected.svgX + 15;
          const py = Math.max(10, Math.min(selected.svgY - 60, compact ? 200 : 360));
          return (
            <g transform={`translate(${px}, ${py})`}>
              <rect width="135" height="110" rx="6" fill="#071223" stroke="rgba(34,211,238,0.3)" strokeWidth="1" />
              <text x="10" y="18" fontSize="9" fontWeight="700" fill="#22d3ee" fontFamily="JetBrains Mono, monospace">
                {selected.code}
              </text>
              <text x="10" y="30" fontSize="8" fill="rgba(148,163,184,0.8)" fontFamily="Inter, sans-serif">
                {selected.nom}
              </text>
              <line x1="10" y1="36" x2="125" y2="36" stroke="rgba(34,211,238,0.15)" strokeWidth="0.5" />
              {[
                ["Niveau", `${selected.niveau} m`],
                ["Débit", `${selected.debit} m³/s`],
                ["Profondeur", `${selected.profondeur} m`],
                ["Navigation", selected.navigation],
              ].map(([k, v], i) => (
                <g key={k} transform={`translate(10, ${46 + i * 14})`}>
                  <text fontSize="8" fill="rgba(148,163,184,0.6)" fontFamily="Inter, sans-serif">{k}</text>
                  <text x="80" fontSize="8" fontWeight="600" fill="#e2e8f0" fontFamily="JetBrains Mono, monospace">{v}</text>
                </g>
              ))}
              <rect
                x="10" y="98" width="115" height="7" rx="2"
                fill="rgba(34,211,238,0.1)"
                style={{ cursor: "pointer" }}
              />
              <text x="67" y="104" textAnchor="middle" fontSize="7" fill="#22d3ee" fontFamily="Inter, sans-serif">
                Voir les détails →
              </text>
            </g>
          );
        })()}
      </svg>

      <div
        className="absolute bottom-3 right-3 flex flex-col gap-1 px-3 py-2 rounded-lg"
        style={{ background: "rgba(7,18,35,0.9)", border: "1px solid rgba(34,211,238,0.1)" }}
      >
        {[
          { color: "#10b981", label: "Normal" },
          { color: "#f59e0b", label: "Vigilance" },
          { color: "#f97316", label: "Alerte" },
          { color: "#ef4444", label: "Critique" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.color }} />
            <span className="text-[10px] font-mono" style={{ color: "rgba(148,163,184,0.8)" }}>
              {l.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
