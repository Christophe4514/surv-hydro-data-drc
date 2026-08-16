import { useState } from "react";
import { type Station } from "../data/lubiData";
import StatusBadge from "../components/StatusBadge";
import type { PageId } from "../App";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useHydroSource } from "../context/HydroSourceContext";

const card = {
  background: "rgba(15,36,68,0.7)",
  border: "1px solid rgba(34,211,238,0.1)",
  borderRadius: 12,
};

interface Props { onNavigate: (p: PageId) => void; }

export default function Stations({ onNavigate: _onNavigate }: Props) {
  const { bundle } = useHydroSource();
  const { stations, getStationSeries } = bundle;
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterNav, setFilterNav] = useState("all");
  const [sortKey, setSortKey] = useState<keyof Station>("code");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Station | null>(null);
  const [page, setPage] = useState(0);
  const PER_PAGE = 10;

  const filtered = stations
    .filter((s) => {
      if (search && !s.code.toLowerCase().includes(search.toLowerCase()) && !s.nom.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus !== "all" && s.status !== filterStatus) return false;
      if (filterNav !== "all" && s.navigation !== filterNav) return false;
      return true;
    })
    .sort((a, b) => {
      const av = a[sortKey] as string | number;
      const bv = b[sortKey] as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const paginated = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const pages = Math.ceil(filtered.length / PER_PAGE);

  const handleSort = (key: keyof Station) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const th = (key: keyof Station, label: string) => (
    <th
      key={key}
      className="py-2.5 px-3 text-left font-mono font-500 text-[10px] uppercase tracking-wider cursor-pointer select-none"
      style={{ color: "rgba(148,163,184,0.5)", whiteSpace: "nowrap" }}
      onClick={() => handleSort(key)}
    >
      {label} {sortKey === key ? (sortDir === "asc" ? "↑" : "↓") : ""}
    </th>
  );

  const miniData = (code: string) =>
    getStationSeries(code, 14).map((d) => ({ v: d.debit }));

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-screen-xl mx-auto">
      <div className="flex flex-wrap gap-3 items-center">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-48"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <span style={{ color: "rgba(148,163,184,0.4)" }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Rechercher une station…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "#e2e8f0" }}
          />
        </div>
        <div className="flex gap-1.5">
          {["all", "normal", "vigilance", "alerte", "critique"].map((s) => (
            <button
              key={s}
              onClick={() => { setFilterStatus(s); setPage(0); }}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-600 transition-colors"
              style={{
                background: filterStatus === s ? "rgba(34,211,238,0.15)" : "rgba(255,255,255,0.04)",
                color: filterStatus === s ? "#22d3ee" : "rgba(148,163,184,0.6)",
                border: filterStatus === s ? "1px solid rgba(34,211,238,0.3)" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {s === "all" ? "Tous" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={card}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <tr>
                {th("code", "Station")}
                {th("zone", "Zone")}
                {th("niveau", "Niveau (m)")}
                {th("debit", "Débit (m³/s)")}
                {th("profondeur", "Profondeur (m)")}
                <th className="py-2.5 px-3 text-left font-mono font-500 text-[10px] uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.5)" }}>
                  Navigation
                </th>
                <th className="py-2.5 px-3 text-left font-mono font-500 text-[10px] uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.5)" }}>
                  Inondation
                </th>
                <th className="py-2.5 px-3 text-left font-mono font-500 text-[10px] uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.5)" }}>
                  Sécheresse
                </th>
                <th className="py-2.5 px-3 text-left font-mono font-500 text-[10px] uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.5)" }}>
                  Tendance
                </th>
                <th className="py-2.5 px-3 text-left font-mono font-500 text-[10px] uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.5)" }}>
                  Statut
                </th>
                <th className="py-2.5 px-3 text-left font-mono font-500 text-[10px] uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.5)" }}>
                  Dernière mesure
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((s) => (
                <tr
                  key={s.id}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", background: selected?.id === s.id ? "rgba(34,211,238,0.04)" : "transparent" }}
                  onClick={() => setSelected(selected?.id === s.id ? null : s)}
                  onMouseEnter={(e) => { if (selected?.id !== s.id) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
                  onMouseLeave={(e) => { if (selected?.id !== s.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <td className="py-3 px-3">
                    <div>
                      <p className="font-mono font-700 text-[11px]" style={{ color: "#22d3ee" }}>{s.code}</p>
                      <p className="text-[10px]" style={{ color: "rgba(148,163,184,0.5)" }}>{s.nom}</p>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[11px]" style={{ color: "rgba(226,232,240,0.7)" }}>{s.zone}</td>
                  <td className="py-3 px-3">
                    <p className="font-mono font-600 text-[11px] text-white">{s.niveau}</p>
                    <p className="text-[10px] font-mono" style={{ color: s.niveauVariation >= 0 ? "#10b981" : "#ef4444" }}>
                      {s.niveauVariation >= 0 ? "↑" : "↓"} {Math.abs(s.niveauVariation)}
                    </p>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px]" style={{ color: "rgba(226,232,240,0.8)" }}>{s.debit}</td>
                  <td className="py-3 px-3 font-mono text-[11px]" style={{ color: "rgba(226,232,240,0.8)" }}>{s.profondeur}</td>
                  <td className="py-3 px-3"><StatusBadge status={s.navigation} /></td>
                  <td className="py-3 px-3"><StatusBadge status={s.risqueInondation} /></td>
                  <td className="py-3 px-3"><StatusBadge status={s.risqueSecheresse} /></td>
                  <td className="py-3 px-3 w-20">
                    <ResponsiveContainer width={60} height={28}>
                      <AreaChart data={miniData(s.code)} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
                        <Area type="monotone" dataKey="v" stroke="#06b6d4" strokeWidth={1.5} fill="rgba(6,182,212,0.15)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </td>
                  <td className="py-3 px-3"><StatusBadge status={s.status} /></td>
                  <td className="py-3 px-3 text-[10px] font-mono" style={{ color: "rgba(148,163,184,0.5)", whiteSpace: "nowrap" }}>
                    {s.derniereMesure}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p className="text-[11px] font-mono" style={{ color: "rgba(148,163,184,0.5)" }}>
            {filtered.length} station{filtered.length > 1 ? "s" : ""}
          </p>
          <div className="flex gap-1">
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className="w-7 h-7 rounded text-[11px] font-mono font-600 transition-colors"
                style={{
                  background: page === i ? "rgba(34,211,238,0.2)" : "rgba(255,255,255,0.04)",
                  color: page === i ? "#22d3ee" : "rgba(148,163,184,0.5)",
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div className="rounded-xl p-5" style={card}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-mono font-700 text-lg" style={{ color: "#22d3ee" }}>Station {selected.code}</p>
              <p className="text-base font-600 text-white">{selected.nom}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={selected.status} size="md" />
              <button onClick={() => setSelected(null)} style={{ color: "rgba(148,163,184,0.4)", fontSize: 18 }}>×</button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: "Code", value: selected.code },
              { label: "Bassin", value: selected.nom },
              { label: "Latitude", value: selected.latitude.toFixed(4) },
              { label: "Longitude", value: selected.longitude.toFixed(4) },
              { label: "Superficie", value: `${selected.areaKm2} km²` },
              { label: "Dernière mesure", value: selected.derniereMesure },
              { label: "Profondeur", value: `${selected.profondeur} m` },
              { label: "Débit Qsim", value: `${selected.debit} m³/s` },
              { label: "Colonne Excel", value: selected.excelCol },
              { label: "Code bassin", value: selected.catchCode },
              { label: "Navigation", value: selected.navigation },
              { label: "Territoire", value: selected.zone },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "rgba(148,163,184,0.4)" }}>
                  {item.label}
                </p>
                <p className="text-sm font-mono font-600 text-white">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[11px] font-mono uppercase tracking-wider mb-3" style={{ color: "rgba(148,163,184,0.4)" }}>
              Seuils hydrologiques
            </p>
            <div className="flex gap-3 flex-wrap">
              {[
                { label: "Étiage", value: selected.seuils.etage, color: "#ef4444" },
                { label: "Saison des pluies", value: selected.seuils.pluie, color: "#f59e0b" },
                { label: "Navigable", value: selected.seuils.navigable, color: "#10b981" },
              ].map((s) => (
                <div key={s.label} className="px-3 py-2 rounded-lg" style={{ background: `${s.color}12`, border: `1px solid ${s.color}30` }}>
                  <p className="text-[10px] font-mono" style={{ color: "rgba(148,163,184,0.6)" }}>{s.label}</p>
                  <p className="font-mono font-700 text-sm" style={{ color: s.color }}>{s.value} m</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
