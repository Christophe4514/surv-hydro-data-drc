import { useState } from "react";
import { tableauDonnees } from "../data/lubiData";

const card = {
  background: "rgba(15,36,68,0.7)",
  border: "1px solid rgba(34,211,238,0.1)",
  borderRadius: 12,
};

const navColor: Record<string, string> = {
  Navigable: "#10b981",
  Vigilance: "#f59e0b",
  "Non navigable": "#ef4444",
};

const riskColor: Record<string, string> = {
  Faible: "#10b981",
  Modéré: "#f59e0b",
  Élevé: "#ef4444",
};

export default function Donnees() {
  const [search, setSearch] = useState("");
  const [filterStation, setFilterStation] = useState("all");
  const [page, setPage] = useState(0);
  const PER_PAGE = 20;

  const stationList = [...new Set(tableauDonnees.map((d) => d.station))];

  const filtered = tableauDonnees.filter((d) => {
    if (filterStation !== "all" && d.station !== filterStation) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!d.station.toLowerCase().includes(q) && !d.date.includes(q) && !d.zone.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const paginated = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const pageCount = Math.ceil(filtered.length / PER_PAGE) || 1;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-screen-2xl mx-auto">
      <div
        className="rounded-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        style={{ background: "rgba(34,211,238,0.06)", border: "1px solid rgba(34,211,238,0.15)" }}
      >
        <div>
          <p className="text-[11px] font-mono uppercase tracking-widest mb-1" style={{ color: "rgba(34,211,238,0.6)" }}>
            Source des données
          </p>
          <p className="font-display font-600 text-sm text-white">donnees_lubi.xlsx</p>
          <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>
            Dernière importation : 16/08/2026 — 09:45 · {tableauDonnees.length} lignes
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-600 transition-colors"
          style={{ background: "rgba(34,211,238,0.15)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.3)" }}
        >
          <span>📁</span> Importer un fichier Excel
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total lignes", value: tableauDonnees.length.toLocaleString() },
          { label: "Stations", value: stationList.length },
          { label: "Jours couverts", value: "7" },
          { label: "Paramètres", value: "11" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4" style={card}>
            <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: "rgba(148,163,184,0.5)" }}>
              {s.label}
            </p>
            <p className="font-display font-700 text-2xl font-mono" style={{ color: "#22d3ee" }}>{s.value}</p>
          </div>
        ))}
      </div>

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
            placeholder="Rechercher (station, date, zone)…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "#e2e8f0" }}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => { setFilterStation("all"); setPage(0); }}
            className="px-3 py-1.5 rounded-lg text-[11px] font-mono font-600 transition-colors"
            style={{
              background: filterStation === "all" ? "rgba(34,211,238,0.15)" : "rgba(255,255,255,0.04)",
              color: filterStation === "all" ? "#22d3ee" : "rgba(148,163,184,0.6)",
              border: filterStation === "all" ? "1px solid rgba(34,211,238,0.3)" : "1px solid rgba(255,255,255,0.06)",
            }}
          >
            Toutes
          </button>
          {stationList.map((s) => (
            <button
              key={s}
              onClick={() => { setFilterStation(s); setPage(0); }}
              className="px-3 py-1.5 rounded-lg text-[11px] font-mono font-600 transition-colors"
              style={{
                background: filterStation === s ? "rgba(34,211,238,0.15)" : "rgba(255,255,255,0.04)",
                color: filterStation === s ? "#22d3ee" : "rgba(148,163,184,0.6)",
                border: filterStation === s ? "1px solid rgba(34,211,238,0.3)" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={card}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <tr>
                {["ID", "Date", "Heure", "Station", "Zone", "Niveau (m)", "Débit (m³/s)", "Profondeur (m)", "Saison", "Navigation", "Inondation", "Sécheresse"].map((h) => (
                  <th
                    key={h}
                    className="py-2.5 px-3 text-left font-mono font-500 text-[10px] uppercase tracking-wider"
                    style={{ color: "rgba(148,163,184,0.5)", whiteSpace: "nowrap" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.025)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(34,211,238,0.03)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <td className="py-2 px-3 font-mono text-[10px]" style={{ color: "rgba(148,163,184,0.4)" }}>{row.id}</td>
                  <td className="py-2 px-3 font-mono text-[11px]" style={{ color: "rgba(226,232,240,0.7)" }}>{row.date}</td>
                  <td className="py-2 px-3 font-mono text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>{row.heure}</td>
                  <td className="py-2 px-3 font-mono font-600 text-[11px]" style={{ color: "#22d3ee" }}>{row.station}</td>
                  <td className="py-2 px-3 text-[11px]" style={{ color: "rgba(226,232,240,0.6)" }}>{row.zone}</td>
                  <td className="py-2 px-3 font-mono font-600 text-[11px] text-white">{row.niveau}</td>
                  <td className="py-2 px-3 font-mono text-[11px]" style={{ color: "rgba(226,232,240,0.8)" }}>{row.debit}</td>
                  <td className="py-2 px-3 font-mono text-[11px]" style={{ color: "rgba(226,232,240,0.8)" }}>{row.profondeur}</td>
                  <td className="py-2 px-3 text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>{row.saison}</td>
                  <td className="py-2 px-3">
                    <span className="text-[10px] font-mono" style={{ color: navColor[row.navigation] ?? "#94a3b8" }}>
                      {row.navigation}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-[10px] font-mono" style={{ color: riskColor[row.risqueInondation] ?? "#94a3b8" }}>
                      {row.risqueInondation}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-[10px] font-mono" style={{ color: riskColor[row.risqueSecheresse] ?? "#94a3b8" }}>
                      {row.risqueSecheresse}
                    </span>
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
            {filtered.length} lignes · page {page + 1}/{pageCount}
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 rounded text-[11px] font-mono transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", color: page === 0 ? "rgba(148,163,184,0.2)" : "#94a3b8" }}
            >
              ‹
            </button>
            {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
              const p = Math.max(0, Math.min(pageCount - 5, page - 2)) + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-7 h-7 rounded text-[11px] font-mono font-600 transition-colors"
                  style={{
                    background: page === p ? "rgba(34,211,238,0.2)" : "rgba(255,255,255,0.04)",
                    color: page === p ? "#22d3ee" : "rgba(148,163,184,0.5)",
                  }}
                >
                  {p + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={page >= pageCount - 1}
              className="px-3 py-1 rounded text-[11px] font-mono transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", color: page >= pageCount - 1 ? "rgba(148,163,184,0.2)" : "#94a3b8" }}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
