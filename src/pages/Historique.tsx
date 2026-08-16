import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { historiqueData, saisonStats } from "../data/lubiData";

const card = {
  background: "rgba(15,36,68,0.7)",
  border: "1px solid rgba(34,211,238,0.1)",
  borderRadius: 12,
};

export default function Historique() {
  const [station, setStation] = useState("LUB-001");
  const [parametre, setParametre] = useState<"niveau" | "debit" | "profondeur">("niveau");

  const data = historiqueData.filter((d) => d.station === station);

  const chartData = data.map((d) => ({
    date: d.date.slice(5),
    niveau: d.niveau,
    debit: d.debit,
    profondeur: d.profondeur,
    saison: d.saison,
  }));

  const alertsData = Array.from({ length: 4 }, (_, i) => ({
    week: `S${i + 1}`,
    alertes: [2, 1, 3, 0][i],
    vigilances: [1, 2, 1, 2][i],
  }));

  const colors = { niveau: "#06b6d4", debit: "#10b981", profondeur: "#8b5cf6" };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-screen-xl mx-auto">
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1.5">
          {["LUB-001", "LUB-002", "LUB-003"].map((s) => (
            <button
              key={s}
              onClick={() => setStation(s)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-mono font-600 transition-colors"
              style={{
                background: station === s ? "rgba(34,211,238,0.15)" : "rgba(255,255,255,0.04)",
                color: station === s ? "#22d3ee" : "rgba(148,163,184,0.6)",
                border: station === s ? "1px solid rgba(34,211,238,0.3)" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(["niveau", "debit", "profondeur"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setParametre(p)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-mono font-600 transition-colors"
              style={{
                background: parametre === p ? "rgba(34,211,238,0.15)" : "rgba(255,255,255,0.04)",
                color: parametre === p ? "#22d3ee" : "rgba(148,163,184,0.6)",
                border: parametre === p ? "1px solid rgba(34,211,238,0.3)" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {p === "niveau" ? "Niveau" : p === "debit" ? "Débit" : "Profondeur"}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-5" style={card}>
        <p className="font-display font-600 text-sm text-white mb-1">
          Évolution historique — {parametre} — {station}
        </p>
        <p className="text-[11px] mb-4" style={{ color: "rgba(148,163,184,0.5)" }}>
          30 derniers jours · données de démonstration
        </p>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[parametre]} stopOpacity={0.25} />
                <stop offset="95%" stopColor={colors[parametre]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(148,163,184,0.5)", fontFamily: "JetBrains Mono" }} interval={4} />
            <YAxis tick={{ fontSize: 9, fill: "rgba(148,163,184,0.5)", fontFamily: "JetBrains Mono" }} />
            <Tooltip
              contentStyle={{ background: "#071223", border: "1px solid rgba(34,211,238,0.2)", borderRadius: 8, fontSize: 11 }}
            />
            <Area type="monotone" dataKey={parametre} stroke={colors[parametre]} strokeWidth={2} fill="url(#histGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          className="rounded-xl p-5"
          style={{ ...card, background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.2)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🌧</span>
            <div>
              <p className="font-display font-700 text-base" style={{ color: "#3b82f6" }}>
                Saison des pluies
              </p>
              <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>
                Octobre — Mars · données historiques
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "Niveau moyen", value: `${saisonStats.pluies.niveauMoyen} m`, icon: "〜" },
              { label: "Débit moyen", value: `${saisonStats.pluies.debitMoyen} m³/s`, icon: "⇌" },
              { label: "Niveau maximal", value: `${saisonStats.pluies.niveauMax} m`, icon: "↑" },
              { label: "Alertes déclenchées", value: `${saisonStats.pluies.alertes}`, icon: "⚠" },
              { label: "Jours à risque", value: `${saisonStats.pluies.joursARisque} j`, icon: "🔴" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: "rgba(59,130,246,0.06)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{s.icon}</span>
                  <span className="text-[11px]" style={{ color: "rgba(226,232,240,0.7)" }}>{s.label}</span>
                </div>
                <span className="font-mono font-700 text-sm" style={{ color: "#3b82f6" }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-xl p-5"
          style={{ ...card, background: "rgba(249,115,22,0.07)", border: "1px solid rgba(249,115,22,0.2)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">☀</span>
            <div>
              <p className="font-display font-700 text-base" style={{ color: "#f97316" }}>
                Saison sèche
              </p>
              <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>
                Avril — Septembre · données historiques
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "Niveau moyen", value: `${saisonStats.seche.niveauMoyen} m`, icon: "〜" },
              { label: "Débit moyen", value: `${saisonStats.seche.debitMoyen} m³/s`, icon: "⇌" },
              { label: "Niveau minimal", value: `${saisonStats.seche.niveauMin} m`, icon: "↓" },
              { label: "Alertes déclenchées", value: `${saisonStats.seche.alertes}`, icon: "⚠" },
              { label: "Jours sécheresse", value: `${saisonStats.seche.joursSecheresse} j`, icon: "🏜" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: "rgba(249,115,22,0.06)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{s.icon}</span>
                  <span className="text-[11px]" style={{ color: "rgba(226,232,240,0.7)" }}>{s.label}</span>
                </div>
                <span className="font-mono font-700 text-sm" style={{ color: "#f97316" }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl p-5" style={card}>
        <p className="font-display font-600 text-sm text-white mb-4">Historique des alertes — 4 dernières semaines</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={alertsData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: "rgba(148,163,184,0.5)", fontFamily: "JetBrains Mono" }} />
            <YAxis tick={{ fontSize: 10, fill: "rgba(148,163,184,0.5)", fontFamily: "JetBrains Mono" }} />
            <Tooltip contentStyle={{ background: "#071223", border: "1px solid rgba(34,211,238,0.2)", borderRadius: 8, fontSize: 11 }} />
            <Bar dataKey="alertes" fill="#ef4444" fillOpacity={0.8} radius={[3, 3, 0, 0]} name="Alertes" />
            <Bar dataKey="vigilances" fill="#f59e0b" fillOpacity={0.8} radius={[3, 3, 0, 0]} name="Vigilances" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
