import { useState } from "react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";
import type { PageId } from "../App";
import { stations, alertes, historiqueData } from "../data/lubiData";
import StatusBadge from "../components/StatusBadge";
import RiverMap from "../components/RiverMap";

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
  const [chartPeriod, setChartPeriod] = useState<"7j" | "30j">("7j");

  const chartData = historiqueData
    .filter((d) => d.station === "LUB-001")
    .slice(chartPeriod === "7j" ? -7 : -30)
    .map((d) => ({ date: d.date.slice(5), niveau: d.niveau, debit: d.debit / 100 }));

  const alertesActives = alertes.filter((a) => a.statut === "active").slice(0, 4);

  const kpis = [
    {
      label: "Niveau d'eau",
      value: "3,20 m",
      variation: "+0,15 m",
      varPos: true,
      status: "normal",
      sub: "LUB-001 — 09:45",
      icon: "〜",
    },
    {
      label: "Débit",
      value: "1 250 m³/s",
      variation: "+8,2 %",
      varPos: true,
      status: "normal",
      sub: "Débit journalier",
      icon: "⇌",
    },
    {
      label: "Profondeur",
      value: "2,80 m",
      variation: "—",
      varPos: true,
      status: "normal",
      sub: "Suffisante",
      icon: "↕",
    },
    {
      label: "Navigation",
      value: "NAVIGABLE",
      variation: "2 zones",
      varPos: true,
      status: "navigable",
      sub: "Profondeur OK",
      icon: "⛵",
    },
    {
      label: "Inondation",
      value: "FAIBLE",
      variation: "Stable",
      varPos: true,
      status: "normal",
      sub: "Niveau normal",
      icon: "🌊",
    },
    {
      label: "Sécheresse",
      value: "ÉLEVÉ",
      variation: "−0,65 m",
      varPos: false,
      status: "critique",
      sub: "Zone Sud",
      icon: "🏜",
    },
  ];

  const statusColors: Record<string, string> = {
    normal: "#10b981", vigilance: "#f59e0b", alerte: "#f97316", critique: "#ef4444",
  };

  const globalStatus = "alerte";
  const globalLabel = {
    normal: "CONDITIONS NORMALES",
    vigilance: "VIGILANCE",
    alerte: "ALERTE",
    critique: "CRITIQUE",
  }[globalStatus];

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-screen-2xl mx-auto">
      <div
        className="rounded-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.25)" }}
      >
        <div>
          <p className="text-[11px] font-mono uppercase tracking-widest mb-1" style={{ color: "rgba(249,115,22,0.7)" }}>
            État actuel de la rivière Lubi
          </p>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full animate-pulse flex-shrink-0" style={{ background: "#f97316" }} />
            <h2 className="font-display font-700 text-xl" style={{ color: "#f97316" }}>
              {globalLabel}
            </h2>
          </div>
          <p className="text-sm mt-0.5" style={{ color: "rgba(226,232,240,0.6)" }}>
            2 zones en sécheresse sévère • 1 zone en vigilance hydrologique • 4 alertes actives
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
            <div className="flex items-start justify-between mb-2">
              <p className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.6)" }}>
                {k.label}
              </p>
              <span className="text-base opacity-60">{k.icon}</span>
            </div>
            <p
              className="font-display font-700 text-xl mb-1 leading-tight font-mono"
              style={{ color: statusColors[k.status] ?? "#e2e8f0" }}
            >
              {k.value}
            </p>
            {k.variation !== "—" && (
              <p
                className="text-xs font-mono mb-1"
                style={{ color: k.varPos ? "#10b981" : "#ef4444" }}
              >
                {k.varPos ? "↑" : "↓"} {k.variation}
              </p>
            )}
            <StatusBadge status={k.status} />
            <p className="text-[10px] mt-1.5" style={{ color: "rgba(148,163,184,0.4)" }}>
              {k.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-xl p-5" style={card}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-display font-600 text-sm text-white">Niveau d'eau — Lubi</p>
              <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>
                Station LUB-001 · Luputa-Amont
              </p>
            </div>
            <div className="flex gap-1.5">
              {(["7j", "30j"] as const).map((p) => (
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
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="niveauGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(148,163,184,0.5)", fontFamily: "JetBrains Mono" }} />
              <YAxis tick={{ fontSize: 9, fill: "rgba(148,163,184,0.5)", fontFamily: "JetBrains Mono" }} />
              <Tooltip
                contentStyle={{ background: "#071223", border: "1px solid rgba(34,211,238,0.2)", borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: "#94a3b8" }}
                itemStyle={{ color: "#22d3ee" }}
              />
              <ReferenceLine y={4.2} stroke="#f59e0b" strokeDasharray="4 3" strokeOpacity={0.6} label={{ value: "Vigilance", position: "right", fontSize: 9, fill: "#f59e0b" }} />
              <ReferenceLine y={5.0} stroke="#f97316" strokeDasharray="4 3" strokeOpacity={0.6} label={{ value: "Alerte", position: "right", fontSize: 9, fill: "#f97316" }} />
              <Area type="monotone" dataKey="niveau" stroke="#06b6d4" strokeWidth={2} fill="url(#niveauGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl p-5" style={card}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-display font-600 text-sm text-white">Débit — Lubi</p>
              <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>
                Station LUB-001 · × 100 m³/s
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(148,163,184,0.5)", fontFamily: "JetBrains Mono" }} />
              <YAxis tick={{ fontSize: 9, fill: "rgba(148,163,184,0.5)", fontFamily: "JetBrains Mono" }} />
              <Tooltip
                contentStyle={{ background: "#071223", border: "1px solid rgba(34,211,238,0.2)", borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: "#94a3b8" }}
                itemStyle={{ color: "#10b981" }}
              />
              <Line type="monotone" dataKey="debit" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3 rounded-xl p-5" style={card}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-display font-600 text-sm text-white">Carte de la rivière Lubi</p>
              <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>
                5 stations actives — cliquez pour les détails
              </p>
            </div>
            <button
              onClick={() => onNavigate("carte")}
              className="text-[11px] font-mono px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: "rgba(34,211,238,0.08)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.15)" }}
            >
              Carte complète →
            </button>
          </div>
          <RiverMap compact />
        </div>

        <div className="xl:col-span-2 rounded-xl p-5" style={card}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-display font-600 text-sm text-white">Alertes récentes</p>
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
                <div
                  key={a.id}
                  className="p-3 rounded-lg"
                  style={{ background: `rgba(${c === "#ef4444" ? "239,68,68" : c === "#f97316" ? "249,115,22" : "245,158,11"},0.07)`, border: `1px solid ${c}22` }}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base flex-shrink-0">{alertTypeIcon[a.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-[11px] font-mono font-600" style={{ color: c }}>
                          {a.station} · {a.zone}
                        </p>
                        <StatusBadge status={a.gravite} />
                      </div>
                      <p className="text-xs" style={{ color: "rgba(226,232,240,0.7)" }}>
                        {a.description.slice(0, 60)}…
                      </p>
                      <p className="text-[10px] mt-1 font-mono" style={{ color: "rgba(148,163,184,0.4)" }}>
                        {a.date} {a.heure}
                      </p>
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
          <p className="font-display font-600 text-sm text-white">Stations — résumé</p>
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
                {["Station", "Zone", "Niveau (m)", "Débit (m³/s)", "Profondeur (m)", "Navigation", "Risque", "Statut"].map((h) => (
                  <th
                    key={h}
                    className="py-2 px-3 text-left font-mono font-500 text-[10px] uppercase tracking-wider"
                    style={{ color: "rgba(148,163,184,0.5)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stations.map((s) => (
                <tr
                  key={s.id}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(34,211,238,0.03)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <td className="py-2.5 px-3 font-mono font-600 text-[11px]" style={{ color: "#22d3ee" }}>
                    {s.code}
                  </td>
                  <td className="py-2.5 px-3" style={{ color: "rgba(226,232,240,0.7)" }}>{s.zone}</td>
                  <td className="py-2.5 px-3 font-mono font-600" style={{ color: "#e2e8f0" }}>{s.niveau}</td>
                  <td className="py-2.5 px-3 font-mono" style={{ color: "rgba(226,232,240,0.8)" }}>{s.debit}</td>
                  <td className="py-2.5 px-3 font-mono" style={{ color: "rgba(226,232,240,0.8)" }}>{s.profondeur}</td>
                  <td className="py-2.5 px-3"><StatusBadge status={s.navigation} /></td>
                  <td className="py-2.5 px-3"><StatusBadge status={s.risqueInondation} /></td>
                  <td className="py-2.5 px-3"><StatusBadge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
