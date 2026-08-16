import { useMemo, useState } from "react";
import { getQsimRows, DATA_PERIOD, statsGlobales } from "../data/lubiData";

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

export default function Donnees() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PER_PAGE = 25;
  const rows = useMemo(() => getQsimRows(), []);

  const filtered = rows.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return d.date.includes(q) || d.iso.includes(q) || d.navigation.toLowerCase().includes(q);
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
          <p className="font-display font-600 text-sm text-white">Modele_Lubi1.xlsx · feuille Qsim_DEC2022</p>
          <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>
            {DATA_PERIOD.start} → {DATA_PERIOD.end} · {DATA_PERIOD.nDays} jours · heure 00:00 · 5 stations + jonction
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Jours Qsim", value: DATA_PERIOD.nDays.toLocaleString("fr-FR") },
          { label: "Stations", value: "5 + jonction" },
          { label: "Période", value: "2009–2022" },
          { label: "Dernier Q", value: `${statsGlobales.junctionDebit} m³/s` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4" style={card}>
            <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: "rgba(148,163,184,0.5)" }}>
              {s.label}
            </p>
            <p className="font-display font-700 text-xl font-mono" style={{ color: "#22d3ee" }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg max-w-md"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <span style={{ color: "rgba(148,163,184,0.4)" }}>🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          placeholder="Date (2009-07, 31/07/2009) ou statut…"
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: "#e2e8f0" }}
        />
      </div>

      <div className="rounded-xl overflow-hidden" style={card}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <tr>
                {["Date", "Heure", "Lubi (2)", "Lubi (1)", "Lukeshi", "Bi (A)", "Lupaka", "Jonction", "H (m)", "Navigation", "Saison"].map((h) => (
                  <th key={h} className="py-2.5 px-3 text-left font-mono font-500 text-[10px] uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.5)", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.025)" }}>
                  <td className="py-2 px-3 font-mono text-[11px]" style={{ color: "rgba(226,232,240,0.7)" }}>{row.date}</td>
                  <td className="py-2 px-3 font-mono text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>{row.heure}</td>
                  <td className="py-2 px-3 font-mono text-[11px]">{row.lubi2}</td>
                  <td className="py-2 px-3 font-mono text-[11px]">{row.lubi1}</td>
                  <td className="py-2 px-3 font-mono text-[11px]">{row.lukeshi}</td>
                  <td className="py-2 px-3 font-mono text-[11px]">{row.bia}</td>
                  <td className="py-2 px-3 font-mono text-[11px]">{row.lupaka}</td>
                  <td className="py-2 px-3 font-mono font-600 text-[11px]" style={{ color: "#22d3ee" }}>{row.junction}</td>
                  <td className="py-2 px-3 font-mono text-[11px] text-white">{row.profondeur}</td>
                  <td className="py-2 px-3">
                    <span className="text-[10px] font-mono" style={{ color: navColor[row.navigation] ?? "#94a3b8" }}>
                      {row.navigation}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>{row.saison}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-[11px] font-mono" style={{ color: "rgba(148,163,184,0.5)" }}>
            {filtered.length} lignes · page {page + 1}/{pageCount}
          </p>
          <div className="flex gap-1.5">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 rounded text-[11px] font-mono" style={{ background: "rgba(255,255,255,0.04)", color: "#94a3b8" }}>‹</button>
            <button onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1} className="px-3 py-1 rounded text-[11px] font-mono" style={{ background: "rgba(255,255,255,0.04)", color: "#94a3b8" }}>›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
