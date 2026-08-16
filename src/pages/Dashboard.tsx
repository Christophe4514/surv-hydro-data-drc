import { useState } from "react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";
import type { PageId } from "../App";
import {
  stations, alertes, getStationSeries, statsGlobales, monthlyAverages, fmtFr,
  LAST_DATE, formatDateFr,
} from "../data/lubiData";
import StatusBadge from "../components/StatusBadge";
import RiverMap from "../components/RiverMap";
import { useSettings } from "../context/SettingsContext";

interface Props { onNavigate: (p: PageId) => void; }

const card = {
  background: "rgba(15,36,68,0.7)",
  border: "1px solid rgba(34,211,238,0.1)",
  borderRadius: 12,
};

const alertTypeIcon: Record<string, string> = {
  inondation: "🌊",
  secheresse: "🏜",
  navigation: "⛵",
  debit: "💧",
};

export default function Dashboard({ onNavigate }: Props) {
  const [chartPeriod, setChartPeriod] = useState<"30j" | "365j">("30j");
  const { seuils, formatDepth, navOf, statusOf, alertEnabled } = useSettings();

  const chartData = getStationSeries("JUNCTION", chartPeriod === "30j" ? 30 : 365).map((d) => ({
    date: d.date.slice(5),
    profondeur: d.profondeur,
    debit: d.debit,
  }));

  const alertesActives = alertes.filter((a) => a.statut === "active" && alertEnabled(a.gravite)).slice(0, 4);
  const j = statsGlobales;
  const junctionNav = navOf(j.junctionProfondeur);
  const globalStatus = statusOf(j.junctionProfondeur);
  const globalLabel = {
    normal: "CONDITIONS NORMALES",
    vigilance: "VIGILANCE",
    alerte: "ALERTE",
    critique: "CRITIQUE",
  }[globalStatus];
  const statusColors: Record<string, string> = {
    normal: "#10b981", vigilance: "#f59e0b", alerte: "#f97316", critique: "#ef4444",
  };

  const kpis = [
    {
      label: "Débit jonction",
      value: `${fmtFr(j.junctionDebit, 1)} m³/s`,
      variation: "Qsim",
      varPos: true,
      status: globalStatus,
      sub: "Total à la confluence",
    },
    {
      label: "Profondeur",
      value: formatDepth(j.junctionProfondeur, 2),
      variation: `seuil ${formatDepth(seuils.navigable, 1)}`,
      varPos: j.junctionProfondeur >= seuils.navigable,
      status: j.junctionProfondeur >= seuils.navigable ? "normal" : "alerte",
      sub: "H = (Q / 45,5)^(3/5)",
    },
    {
      label: "Navigation",
      value: junctionNav === "navigable" ? "NAVIGABLE" : junctionNav === "vigilance" ? "VIGILANCE" : "IMPOSSIBLE",
      variation: `${j.zonesNavigables} / 5 bassins`,
      varPos: junctionNav === "navigable",
      status: junctionNav === "navigable" ? "normal" : "alerte",
      sub: `Tirant ${formatDepth(seuils.navigable, 1)}`,
    },
    {
      label: "Bassins OK",
      value: `${j.zonesNavigables}`,
      variation: "navigables",
      varPos: true,
      status: "normal",
      sub: "H ≥ 1,5 m",
    },
    {
      label: "Vigilance",
      value: `${j.zonesVigilance}`,
      variation: "1,2–1,5 m",
      varPos: false,
      status: "vigilance",
      sub: "Étiage possible",
    },
    {
      label: "Non navigables",
      value: `${j.zonesNonNavigables}`,
      variation: "< 1,2 m",
      varPos: false,
      status: "critique",
      sub: "Sous le tirant d'étiage",
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-screen-2xl mx-auto">
      <div
        className="rounded-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        style={{
          background: globalStatus === "alerte" ? "rgba(249,115,22,0.08)" : "rgba(16,185,129,0.08)",
          border: `1px solid ${globalStatus === "alerte" ? "rgba(249,115,22,0.25)" : "rgba(16,185,129,0.25)"}`,
        }}
      >
        <div>
          <p className="text-[11px] font-mono uppercase tracking-widest mb-1" style={{ color: statusColors[globalStatus] }}>
            État actuel — rivière Lubi · {formatDateFr(LAST_DATE)}
          </p>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full animate-pulse flex-shrink-0" style={{ background: statusColors[globalStatus] }} />
            <h2 className="font-display font-700 text-xl" style={{ color: statusColors[globalStatus] }}>
              {globalLabel}
            </h2>
          </div>
          <p className="text-sm mt-0.5" style={{ color: "rgba(226,232,240,0.6)" }}>
            Jonction {fmtFr(j.junctionDebit, 1)} m³/s · {fmtFr(j.junctionProfondeur, 2)} m · {j.zonesNavigables} bassin(s) navigable(s) · {j.zonesNonNavigables} non navigable(s) · {alertesActives.length} alertes
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={() => onNavigate("alertes")}
            className="px-4 py-2 rounded-lg text-sm font-600 transition-colors"
            style={{ background: "rgba(249,115,22,0.2)", color: "#f97316", border: "1px solid rgba(249,115,22,0.3)" }}
          >
            Voir les alertes
          </button>
          <button
            onClick={() => onNavigate("carte")}
            className="px-4 py-2 rounded-lg text-sm font-600 transition-colors"
            style={{ background: "rgba(34,211,238,0.08)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.2)" }}
          >
            Voir la carte
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl p-4" style={card}>
            <p className="text-[11px] font-mono uppercase tracking-wider mb-2" style={{ color: "rgba(148,163,184,0.6)" }}>
              {k.label}
            </p>
            <p className="font-display font-700 text-xl mb-1 leading-tight font-mono" style={{ color: statusColors[k.status] ?? "#e2e8f0" }}>
              {k.value}
            </p>
            <p className="text-xs font-mono mb-1" style={{ color: k.varPos ? "#10b981" : "#f59e0b" }}>{k.variation}</p>
            <p className="text-[10px]" style={{ color: "rgba(148,163,184,0.4)" }}>{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-xl p-5" style={card}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-display font-600 text-sm text-white">Profondeur à la jonction</p>
              <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>
                Calculée depuis Qsim · H = (Q / 45,5)^(3/5)
              </p>
            </div>
            <div className="flex gap-1.5">
              {(["30j", "365j"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className="px-2.5 py-1 rounded text-[11px] font-mono font-600 transition-colors"
                  style={{
                    background: chartPeriod === p ? "rgba(34,211,238,0.2)" : "rgba(255,255,255,0.04)",
                    color: chartPeriod === p ? "#22d3ee" : "rgba(148,163,184,0.6)",
                    border: chartPeriod === p ? "1px solid rgba(34,211,238,0.3)" : "1px solid transparent",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="niveauGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(148,163,184,0.5)", fontFamily: "JetBrains Mono" }} interval={chartPeriod === "365j" ? 40 : 4} />
              <YAxis tick={{ fontSize: 9, fill: "rgba(148,163,184,0.5)", fontFamily: "JetBrains Mono" }} />
              <Tooltip contentStyle={{ background: "#071223", border: "1px solid rgba(34,211,238,0.2)", borderRadius: 8, fontSize: 11 }} />
              <ReferenceLine y={seuils.navigable} stroke="#10b981" strokeDasharray="4 3" label={{ value: formatDepth(seuils.navigable, 1), position: "right", fontSize: 9, fill: "#10b981" }} />
              <ReferenceLine y={seuils.etage} stroke="#ef4444" strokeDasharray="4 3" label={{ value: formatDepth(seuils.etage, 1), position: "right", fontSize: 9, fill: "#ef4444" }} />
              <Area type="monotone" dataKey="profondeur" stroke="#06b6d4" strokeWidth={2} fill="url(#niveauGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl p-5" style={card}>
          <p className="font-display font-600 text-sm text-white mb-1">Débit moyen mensuel (Qmoyennes)</p>
          <p className="text-[11px] mb-4" style={{ color: "rgba(148,163,184,0.5)" }}>Climatologie 2009–2022 · jonction</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={monthlyAverages} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fontSize: 8, fill: "rgba(148,163,184,0.5)", fontFamily: "JetBrains Mono" }} />
              <YAxis tick={{ fontSize: 9, fill: "rgba(148,163,184,0.5)", fontFamily: "JetBrains Mono" }} />
              <Tooltip contentStyle={{ background: "#071223", border: "1px solid rgba(34,211,238,0.2)", borderRadius: 8, fontSize: 11 }} />
              <Line type="monotone" dataKey="qMoyenne" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Q moyenne (m³/s)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3 rounded-xl p-5 overflow-hidden" style={card}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-display font-600 text-sm text-white">Bassins versants — Shape Lubi</p>
              <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>
                5 sous-bassins WGS84 — colorés selon la navigabilité
              </p>
            </div>
            <button
              onClick={() => onNavigate("carte")}
              className="text-[11px] font-mono px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(34,211,238,0.08)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.15)" }}
            >
              Carte complète →
            </button>
          </div>
          <RiverMap compact />
        </div>

        <div className="xl:col-span-2 rounded-xl p-5" style={card}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-display font-600 text-sm text-white">Alertes du {formatDateFr(LAST_DATE)}</p>
            <button
              onClick={() => onNavigate("alertes")}
              className="text-[11px] font-mono px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(34,211,238,0.08)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.15)" }}
            >
              Toutes →
            </button>
          </div>
          <div className="space-y-2.5">
            {alertesActives.map((a) => {
              const colors: Record<string, string> = {
                critique: "#ef4444", alerte: "#f97316", vigilance: "#f59e0b", info: "#3b82f6",
              };
              const c = colors[a.gravite] ?? "#3b82f6";
              return (
                <div key={a.id} className="p-3 rounded-lg" style={{ background: `${c}12`, border: `1px solid ${c}22` }}>
                  <div className="flex items-start gap-2">
                    <span className="text-base flex-shrink-0">{alertTypeIcon[a.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-[11px] font-mono font-600" style={{ color: c }}>{a.station} · {a.zone}</p>
                        <StatusBadge status={a.gravite} />
                      </div>
                      <p className="text-xs" style={{ color: "rgba(226,232,240,0.7)" }}>{a.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-xl p-5" style={card}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-display font-600 text-sm text-white">Stations — Qsim du {formatDateFr(LAST_DATE)}</p>
          <button
            onClick={() => onNavigate("stations")}
            className="text-[11px] font-mono px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(34,211,238,0.08)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.15)" }}
          >
            Voir toutes →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Station", "Bassin", "Débit (m³/s)", "Profondeur (m)", "Navigation", "Territoire", "Superficie"].map((h) => (
                  <th key={h} className="py-2 px-3 text-left font-mono font-500 text-[10px] uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.5)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stations.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td className="py-2.5 px-3 font-mono font-600 text-[11px]" style={{ color: "#22d3ee" }}>{s.code}</td>
                  <td className="py-2.5 px-3" style={{ color: "rgba(226,232,240,0.7)" }}>{s.nom}</td>
                  <td className="py-2.5 px-3 font-mono font-600">{s.debit}</td>
                  <td className="py-2.5 px-3 font-mono">{s.profondeur}</td>
                  <td className="py-2.5 px-3"><StatusBadge status={s.navigation} /></td>
                  <td className="py-2.5 px-3" style={{ color: "rgba(226,232,240,0.6)" }}>{s.zone}</td>
                  <td className="py-2.5 px-3 font-mono" style={{ color: "rgba(148,163,184,0.7)" }}>{fmtFr(s.areaKm2, 0)} km²</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
