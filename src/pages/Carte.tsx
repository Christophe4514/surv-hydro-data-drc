import { useState } from "react";
import { stations, exutoire, type Station } from "../data/lubiData";
import StatusBadge from "../components/StatusBadge";
import RiverMap from "../components/RiverMap";

type Selection = { kind: "station"; station: Station } | { kind: "exutoire" };

const card = {
  background: "rgba(15,36,68,0.7)",
  border: "1px solid rgba(34,211,238,0.1)",
  borderRadius: 12,
};

export default function Carte() {
  const [filters, setFilters] = useState({
    stations: true,
    navigables: true,
    nonNavigables: true,
    exutoire: true,
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
          <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>Rivière Lubi — RDC</p>
        </div>

        <div className="p-4 space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: "rgba(148,163,184,0.5)" }}>
            Afficher
          </p>
          {[
            { key: "stations" as const, label: "Stations hydrologiques", color: "#22d3ee" },
            { key: "navigables" as const, label: "Bassins navigables", color: "#10b981" },
            { key: "nonNavigables" as const, label: "Bassins non navigables", color: "#ef4444" },
            { key: "exutoire" as const, label: "Exutoire (Port Tshangabeni)", color: "#ef4444" },
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
            { color: "#10b981", label: "Conditions normales" },
            { color: "#f59e0b", label: "Vigilance" },
            { color: "#f97316", label: "Alerte" },
            { color: "#ef4444", label: "Critique" },
            { color: "#ef4444", label: "Exutoire (Tshangabeni)", ring: true },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: l.color, boxShadow: l.ring ? "0 0 0 2px #fff" : undefined }}
              />
              <span className="text-[11px]" style={{ color: "rgba(148,163,184,0.7)" }}>{l.label}</span>
            </div>
          ))}
        </div>

        <div className="px-4 pb-4 border-t" style={{ borderColor: "rgba(34,211,238,0.1)" }}>
          <p className="text-[10px] font-mono uppercase tracking-widest mt-4 mb-3" style={{ color: "rgba(148,163,184,0.5)" }}>
            Sites
          </p>
          <div className="space-y-1.5">
            <button
              onClick={() =>
                setSelected(selected?.kind === "exutoire" ? null : { kind: "exutoire" })
              }
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors"
              style={{
                background: selected?.kind === "exutoire" ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.02)",
                border: selected?.kind === "exutoire" ? "1px solid rgba(239,68,68,0.35)" : "1px solid transparent",
              }}
            >
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: "#ef4444", boxShadow: "0 0 0 1.5px #fff" }} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-mono font-600" style={{ color: "#ef4444" }}>{exutoire.code}</p>
                <p className="text-[10px] truncate" style={{ color: "rgba(148,163,184,0.5)" }}>{exutoire.nom}</p>
              </div>
            </button>
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
              onExutoireClick={() => setSelected({ kind: "exutoire" })}
              selectedCode={selected?.kind === "station" ? selected.station.code : null}
              selectedExutoire={selected?.kind === "exutoire"}
              filters={{
                stations: filters.stations,
                navigables: filters.navigables,
                nonNavigables: filters.nonNavigables,
                exutoire: filters.exutoire,
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

        {selected?.kind === "exutoire" && (
          <div className="p-4 pt-0">
            <div className="rounded-xl p-4" style={card}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono font-700 text-base" style={{ color: "#ef4444" }}>{exutoire.code}</p>
                  <p className="text-sm font-600 text-white">{exutoire.nom}</p>
                  <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>{exutoire.zone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={exutoire.status} size="md" />
                  <button onClick={() => setSelected(null)} style={{ color: "rgba(148,163,184,0.4)", fontSize: 16 }}>×</button>
                </div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {[
                  { label: "Débit Junction", value: `${exutoire.debit} m³/s` },
                  { label: "Profondeur", value: `${exutoire.profondeur} m` },
                  { label: "Latitude", value: `${exutoire.latitude}°` },
                  { label: "Longitude", value: `${exutoire.longitude}°` },
                ].map((item) => (
                  <div key={item.label} className="p-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "rgba(148,163,184,0.5)" }}>
                      {item.label}
                    </p>
                    <p className="text-sm font-mono font-600 text-white">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "rgba(148,163,184,0.5)" }}>
                  Navigation
                </p>
                <StatusBadge status={exutoire.navigation} />
              </div>
              <p className="text-[10px] mt-2 font-mono" style={{ color: "rgba(148,163,184,0.4)" }}>
                Dernière mesure : {exutoire.derniereMesure} · pourpoint du bassin (pointe nord, WGS84)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
