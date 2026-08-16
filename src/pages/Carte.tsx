import { useState } from "react";
import { type Station, type Port } from "../data/lubiData";
import StatusBadge from "../components/StatusBadge";
import RiverMap from "../components/RiverMap";
import { useHydroSource } from "../context/HydroSourceContext";

type Selection = { kind: "station"; station: Station } | { kind: "port"; port: Port };

const card = {
  background: "rgba(15,36,68,0.7)",
  border: "1px solid rgba(34,211,238,0.1)",
  borderRadius: 12,
};

export default function Carte() {
  const { bundle } = useHydroSource();
  const { stations, ports, exutoire } = bundle;
  const [filters, setFilters] = useState({
    stations: true,
    navigables: true,
    nonNavigables: true,
    ports: true,
    inondation: true,
    secheresse: true,
    alertes: true,
  });
  const [selected, setSelected] = useState<Selection | null>(null);

  const toggle = (key: keyof typeof filters) =>
    setFilters((f) => ({ ...f, [key]: !f[key] }));

  return (
    <div className="flex h-full overflow-hidden" style={{ maxHeight: "calc(100vh - 64px)" }}>
      <div
        className="w-64 flex-shrink-0 flex flex-col overflow-y-auto"
        style={{ background: "#071223", borderRight: "1px solid rgba(34,211,238,0.1)" }}
      >
        <div className="p-4 border-b" style={{ borderColor: "rgba(34,211,238,0.1)" }}>
          <p className="font-display font-600 text-sm text-white mb-1">Filtres cartographiques</p>
          <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>{bundle.riverName} — RDC</p>
        </div>

        <div className="p-4 space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: "rgba(148,163,184,0.5)" }}>
            Afficher
          </p>
          {[
            { key: "stations" as const, label: "Stations hydrologiques", color: "#22d3ee" },
            { key: "navigables" as const, label: "Bassins navigables", color: "#10b981" },
            { key: "nonNavigables" as const, label: "Bassins non navigables", color: "#ef4444" },
            { key: "ports" as const, label: "Ports fluviaux", color: "#f8fafc" },
          ].map(({ key, label, color }) => (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer group py-1">
              <div
                className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors"
                style={{
                  background: filters[key] ? color : "rgba(255,255,255,0.05)",
                  border: `1px solid ${filters[key] ? color : "rgba(255,255,255,0.1)"}`,
                }}
                onClick={() => toggle(key)}
              >
                {filters[key] && <span style={{ fontSize: 10, color: "white" }}>✓</span>}
              </div>
              <span className="text-xs" style={{ color: "rgba(226,232,240,0.7)" }}>{label}</span>
            </label>
          ))}
        </div>

        <div className="px-4 pb-4">
          <p className="text-[10px] font-mono uppercase tracking-widest mb-3 mt-2" style={{ color: "rgba(148,163,184,0.5)" }}>
            Légende
          </p>
          {[
            { color: "#10b981", label: "Conditions normales", ring: false, star: false },
            { color: "#f59e0b", label: "Vigilance", ring: false, star: false },
            { color: "#f97316", label: "Alerte", ring: false, star: false },
            { color: "#ef4444", label: "Critique", ring: false, star: false },
            ...(bundle.mode === "lubi"
              ? [
                  { color: "#ef4444", label: "Exutoire (Tshangabeni)", ring: true, star: false },
                  { color: "#f8fafc", label: "Port fluvial", ring: false, star: true },
                ]
              : [{ color: "#22d3ee", label: "Point de mesure", ring: false, star: false }]),
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full flex items-center justify-center"
                style={{
                  background: l.star ? "transparent" : l.color,
                  color: l.star ? "#f8fafc" : undefined,
                  fontSize: l.star ? 12 : undefined,
                  lineHeight: 1,
                  boxShadow: l.ring ? "0 0 0 2px #fff" : undefined,
                }}
              >
                {l.star ? "★" : null}
              </div>
              <span className="text-[11px]" style={{ color: "rgba(148,163,184,0.7)" }}>{l.label}</span>
            </div>
          ))}
        </div>

        <div className="px-4 pb-4 border-t" style={{ borderColor: "rgba(34,211,238,0.1)" }}>
          <p className="text-[10px] font-mono uppercase tracking-widest mt-4 mb-3" style={{ color: "rgba(148,163,184,0.5)" }}>
            Sites
          </p>
          <div className="space-y-1.5">
            {ports.map((p) => {
              const active = selected?.kind === "port" && selected.port.id === p.id;
              const isExu = p.role === "exutoire";
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(active ? null : { kind: "port", port: p })}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors"
                  style={{
                    background: active
                      ? isExu
                        ? "rgba(239,68,68,0.12)"
                        : "rgba(34,211,238,0.08)"
                      : "rgba(255,255,255,0.02)",
                    border: active
                      ? isExu
                        ? "1px solid rgba(239,68,68,0.35)"
                        : "1px solid rgba(34,211,238,0.2)"
                      : "1px solid transparent",
                  }}
                >
                  <div
                    className="flex-shrink-0 flex items-center justify-center"
                    style={{
                      width: 10,
                      height: 10,
                      color: isExu ? undefined : "#f8fafc",
                      fontSize: 11,
                      lineHeight: 1,
                      background: isExu ? "#ef4444" : "transparent",
                      borderRadius: 999,
                      boxShadow: isExu ? "0 0 0 1.5px #fff" : undefined,
                    }}
                  >
                    {isExu ? null : "★"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-mono font-600" style={{ color: isExu ? "#ef4444" : "#e2e8f0" }}>
                      {p.code}
                    </p>
                    <p className="text-[10px] truncate" style={{ color: "rgba(148,163,184,0.5)" }}>{p.nom}</p>
                  </div>
                </button>
              );
            })}
            {stations.map((s) => {
              const c: Record<string, string> = { normal: "#10b981", vigilance: "#f59e0b", alerte: "#f97316", critique: "#ef4444" };
              const active = selected?.kind === "station" && selected.station.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelected(active ? null : { kind: "station", station: s })}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors"
                  style={{
                    background: active ? "rgba(34,211,238,0.08)" : "rgba(255,255,255,0.02)",
                    border: active ? "1px solid rgba(34,211,238,0.2)" : "1px solid transparent",
                  }}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c[s.status] }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-mono font-600" style={{ color: "#22d3ee" }}>{s.code}</p>
                    <p className="text-[10px] truncate" style={{ color: "rgba(148,163,184,0.5)" }}>{s.nom}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-4 overflow-hidden flex flex-col">
          <div className="rounded-xl overflow-hidden flex-1 min-h-0" style={{ background: "rgba(7,18,35,0.8)", border: "1px solid rgba(34,211,238,0.1)" }}>
            <RiverMap
              onStationClick={(s) => setSelected({ kind: "station", station: s })}
              onPortClick={(p) => setSelected({ kind: "port", port: p })}
              selectedCode={selected?.kind === "station" ? selected.station.code : null}
              selectedPortId={selected?.kind === "port" ? selected.port.id : null}
              filters={{
                stations: filters.stations,
                navigables: filters.navigables,
                nonNavigables: filters.nonNavigables,
                ports: filters.ports,
              }}
            />
          </div>
        </div>

        {selected?.kind === "station" && (
          <div className="p-4 pt-0">
            <div className="rounded-xl p-4" style={card}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono font-700 text-base" style={{ color: "#22d3ee" }}>{selected.station.code}</p>
                  <p className="text-sm font-600 text-white">{selected.station.nom}</p>
                  <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>{selected.station.zone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selected.station.status} size="md" />
                  <button onClick={() => setSelected(null)} style={{ color: "rgba(148,163,184,0.4)", fontSize: 16 }}>×</button>
                </div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { label: "Niveau", value: `${selected.station.niveau} m`, status: "normal" },
                  { label: "Débit", value: `${selected.station.debit} m³/s`, status: null },
                  { label: "Profondeur", value: `${selected.station.profondeur} m`, status: null },
                  { label: "Navigation", value: null, status: selected.station.navigation },
                  { label: "Inondation", value: null, status: selected.station.risqueInondation },
                  { label: "Sécheresse", value: null, status: selected.station.risqueSecheresse },
                ].map((item) => (
                  <div key={item.label} className="p-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "rgba(148,163,184,0.5)" }}>
                      {item.label}
                    </p>
                    {item.value ? (
                      <p className="text-sm font-mono font-600 text-white">{item.value}</p>
                    ) : (
                      <StatusBadge status={item.status!} />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] mt-2 font-mono" style={{ color: "rgba(148,163,184,0.4)" }}>
                Dernière mesure : {selected.station.derniereMesure} · Lat {selected.station.latitude} / Lon {selected.station.longitude} · km {selected.station.km}
              </p>
            </div>
          </div>
        )}

        {selected?.kind === "port" && (
          <div className="p-4 pt-0">
            <div className="rounded-xl p-4" style={card}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono font-700 text-base" style={{ color: selected.port.role === "exutoire" ? "#ef4444" : "#22d3ee" }}>
                    {selected.port.code}
                  </p>
                  <p className="text-sm font-600 text-white">{selected.port.nom}</p>
                  <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>
                    {selected.port.role === "exutoire"
                      ? exutoire?.zone
                      : `${selected.port.territoire || "Bassin"}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selected.port.role === "exutoire" && exutoire && <StatusBadge status={exutoire.status} size="md" />}
                  <button onClick={() => setSelected(null)} style={{ color: "rgba(148,163,184,0.4)", fontSize: 16 }}>×</button>
                </div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {(selected.port.role === "exutoire" && exutoire
                  ? [
                      { label: "Débit Junction", value: `${exutoire.debit} m³/s` },
                      { label: "Profondeur", value: `${exutoire.profondeur} m` },
                      { label: "Latitude", value: `${selected.port.latitude}°` },
                      { label: "Longitude", value: `${selected.port.longitude}°` },
                    ]
                  : [
                      { label: "Latitude", value: `${selected.port.latitude}°` },
                      { label: "Longitude", value: `${selected.port.longitude}°` },
                      { label: "Altitude", value: selected.port.altitudeM != null ? `${selected.port.altitudeM} m` : "—" },
                      { label: "Territoire", value: selected.port.territoire || "—" },
                    ]
                ).map((item) => (
                  <div key={item.label} className="p-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "rgba(148,163,184,0.5)" }}>
                      {item.label}
                    </p>
                    <p className="text-sm font-mono font-600 text-white">{item.value}</p>
                  </div>
                ))}
              </div>
              {selected.port.role === "exutoire" && exutoire && (
                <div className="mt-3">
                  <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "rgba(148,163,184,0.5)" }}>
                    Navigation
                  </p>
                  <StatusBadge status={exutoire.navigation} />
                </div>
              )}
              <p className="text-[10px] mt-2 font-mono" style={{ color: "rgba(148,163,184,0.4)" }}>
                Source : {bundle.sourceLabel}
                {selected.port.role === "exutoire" && exutoire ? ` · ${exutoire.derniereMesure}` : ""}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
