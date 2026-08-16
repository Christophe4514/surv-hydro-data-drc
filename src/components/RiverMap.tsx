import { useState } from "react";
import { stations, catchments, type Station, type CatchmentFeature } from "../data/lubiData";

const statusColors: Record<string, string> = {
  normal: "#10b981",
  vigilance: "#f59e0b",
  alerte: "#f97316",
  critique: "#ef4444",
};

const navFill: Record<string, string> = {
  navigable: "rgba(16,185,129,0.35)",
  vigilance: "rgba(245,158,11,0.35)",
  "non-navigable": "rgba(239,68,68,0.32)",
};

interface Props {
  onStationClick?: (s: Station) => void;
  compact?: boolean;
}

const [xmin, ymin, xmax, ymax] = catchments.bbox;
const W = 420;
const H_FULL = 640;
const PAD = 18;

function project(lon: number, lat: number, height: number): [number, number] {
  const x = PAD + ((lon - xmin) / (xmax - xmin)) * (W - PAD * 2);
  const y = PAD + ((ymax - lat) / (ymax - ymin)) * (height - PAD * 2);
  return [x, y];
}

function ringPath(ring: number[][], height: number): string {
  return ring
    .map(([lon, lat], i) => {
      const [x, y] = project(lon, lat, height);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ") + " Z";
}

export default function RiverMap({ onStationClick, compact = false }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<Station | null>(null);
  const h = compact ? 360 : H_FULL;
  const byCode = new Map(stations.map((s) => [s.code, s]));

  const handleStation = (s: Station) => {
    setSelected(selected?.id === s.id ? null : s);
    onStationClick?.(s);
  };

  return (
    <div className="relative w-full" style={{ height: compact ? 360 : 520 }}>
      <svg viewBox={`0 0 ${W} ${h}`} className="w-full h-full" style={{ background: "transparent" }}>
        <defs>
          <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(34,211,238,0.05)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={W} height={h} fill="url(#mapgrid)" />

        {catchments.features.map((f: CatchmentFeature) => {
          const st = byCode.get(f.properties.code);
          const isHov = hovered === f.properties.code;
          const isSel = selected?.code === f.properties.code;
          const fill = navFill[st?.navigation ?? "navigable"];
          const stroke = statusColors[st?.status ?? "normal"];
          return (
            <g key={f.properties.code}>
              {f.geometry.coordinates.map((ring, ri) => (
                <path
                  key={ri}
                  d={ringPath(ring, h)}
                  fill={fill}
                  stroke={isSel || isHov ? "#22d3ee" : stroke}
                  strokeWidth={isSel || isHov ? 2 : 1}
                  opacity={isHov || isSel ? 1 : 0.9}
                  style={{ cursor: "pointer" }}
                  onClick={() => st && handleStation(st)}
                  onMouseEnter={() => setHovered(f.properties.code)}
                  onMouseLeave={() => setHovered(null)}
                />
              ))}
            </g>
          );
        })}

        {stations.map((s) => {
          const [x, y] = project(s.longitude, s.latitude, h);
          const color = statusColors[s.status];
          const isHov = hovered === s.code;
          const isSel = selected?.code === s.code;
          return (
            <g key={s.code} style={{ cursor: "pointer" }} onClick={() => handleStation(s)}
              onMouseEnter={() => setHovered(s.code)} onMouseLeave={() => setHovered(null)}>
              <circle cx={x} cy={y} r={isHov || isSel ? 7 : 5} fill={color} />
              <circle cx={x} cy={y} r={2.2} fill="white" />
              <text
                x={x + 8}
                y={y + 3}
                fontSize="9"
                fill="rgba(226,232,240,0.9)"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="600"
              >
                {s.nom}
              </text>
            </g>
          );
        })}

        <text x="18" y="22" fontSize="9" fill="rgba(34,211,238,0.5)" fontFamily="JetBrains Mono, monospace">N</text>
        <path d="M 22 12 L 22 4 L 18 8 M 22 4 L 26 8" stroke="rgba(34,211,238,0.5)" strokeWidth="1" fill="none" />
        <text x={W - 12} y={h - 10} textAnchor="end" fontSize="8" fill="rgba(148,163,184,0.5)" fontFamily="JetBrains Mono, monospace">
          WGS84 · Shape Lubi
        </text>
      </svg>

      <div
        className="absolute bottom-3 left-3 flex flex-col gap-1 px-3 py-2 rounded-lg"
        style={{ background: "rgba(7,18,35,0.9)", border: "1px solid rgba(34,211,238,0.1)" }}
      >
        {[
          { color: "#10b981", label: "Navigable (≥ 1,5 m)" },
          { color: "#f59e0b", label: "Vigilance (1,2–1,5 m)" },
          { color: "#ef4444", label: "Non navigable (< 1,2 m)" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.color }} />
            <span className="text-[10px] font-mono" style={{ color: "rgba(148,163,184,0.8)" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
