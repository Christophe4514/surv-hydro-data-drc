import { useState, useEffect } from "react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend,
} from "recharts";
import { qFromH } from "../data/lubiData";
import { useSettings } from "../context/SettingsContext";
import { useHydroSource } from "../context/HydroSourceContext";

const card = {
  background: "rgba(15,36,68,0.7)",
  border: "1px solid rgba(34,211,238,0.1)",
  borderRadius: 12,
};

const periods = ["30j", "90j", "1an", "climato"] as const;
type Period = typeof periods[number];

const sliceByPeriod: Record<Period, number> = { "30j": 30, "90j": 90, "1an": 365, climato: 0 };

export default function Hydrologie() {
  const [period, setPeriod] = useState<Period>("1an");
  const [station, setStation] = useState("JUNCTION");
  const [param, setParam] = useState<"debit" | "profondeur">("debit");
  const { seuils, formatDepth } = useSettings();
  const { bundle } = useHydroSource();
  const { getStationSeries, stationCodes, monthlyAverages } = bundle;

  useEffect(() => {
    if (station !== "JUNCTION" && !stationCodes.includes(station)) setStation("JUNCTION");
  }, [station, stationCodes]);

  const series = period === "climato"
    ? monthlyAverages.map((m) => ({
        date: m.label.slice(0, 3),
        debit: m.qMoyenne,
        profondeur: m.profondeurMoyenne,
        niveau: m.profondeurMoyenne,
      }))
    : getStationSeries(station, sliceByPeriod[period]).map((d) => ({
        date: d.date.slice(5),
        debit: d.debit,
        profondeur: d.profondeur,
        niveau: d.profondeur,
      }));

  const chartData = series;
  const allStations = ["JUNCTION", ...stationCodes];

  const paramConfig = {
    debit: {
      label: "Débit (m³/s)",
      color: "#10b981",
      grad: "debitGrad",
      seuils: [
        { y: qFromH(seuils.navigable), color: "#10b981", label: formatDepth(seuils.navigable, 1) },
        { y: qFromH(seuils.etage), color: "#ef4444", label: formatDepth(seuils.etage, 1) },
      ],
    },
    profondeur: {
      label: "Hauteur (m)",
      color: "#8b5cf6",
      grad: "profGrad",
      seuils: [
        { y: seuils.navigable, color: "#10b981", label: formatDepth(seuils.navigable, 1) },
        { y: seuils.etage, color: "#ef4444", label: formatDepth(seuils.etage, 1) },
      ],
    },
  };

  const cfg = paramConfig[param];
  const values = chartData.map((d) => d[param] as number);
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 0;
  const avgVal = values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
  const lastVal = values.at(-1) ?? 0;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-screen-xl mx-auto">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {allStations.map((s) => (
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
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-mono font-600 transition-colors"
              style={{
                background: period === p ? "rgba(34,211,238,0.15)" : "rgba(255,255,255,0.04)",
                color: period === p ? "#22d3ee" : "rgba(148,163,184,0.6)",
                border: period === p ? "1px solid rgba(34,211,238,0.3)" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 ml-auto">
          {(["debit", "profondeur"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setParam(p)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-mono font-600 transition-colors"
              style={{
                background: param === p ? "rgba(34,211,238,0.15)" : "rgba(255,255,255,0.04)",
                color: param === p ? "#22d3ee" : "rgba(148,163,184,0.6)",
                border: param === p ? "1px solid rgba(34,211,238,0.3)" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {p === "debit" ? "Débit" : "Hauteur"}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-5" style={card}>
        <div className="mb-4">
          <p className="font-display font-600 text-base text-white">
            Évolution — {cfg.label} — {bundle.riverName}
          </p>
          <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>
            Station {station} · {period}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-[11px] font-mono" style={{ color: "#10b981" }}>
            <div className="w-3 h-1 rounded" style={{ background: "#10b981" }} />
            Zone normale
          </div>
          {cfg.seuils.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5 text-[11px] font-mono" style={{ color: s.color }}>
              <div className="w-3 h-0.5 rounded border-t border-dashed" style={{ borderColor: s.color }} />
              {s.y} {param === "debit" ? "m³/s" : "m"}
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id={cfg.grad} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={cfg.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={cfg.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(148,163,184,0.5)", fontFamily: "JetBrains Mono" }} />
            <YAxis tick={{ fontSize: 9, fill: "rgba(148,163,184,0.5)", fontFamily: "JetBrains Mono" }} />
            <Tooltip
              contentStyle={{ background: "#071223", border: "1px solid rgba(34,211,238,0.2)", borderRadius: 8, fontSize: 11 }}
              labelStyle={{ color: "#94a3b8" }}
            />
            {cfg.seuils.map((s) => (
              <ReferenceLine
                key={s.label}
                y={s.y}
                stroke={s.color}
                strokeDasharray="5 3"
                strokeOpacity={0.7}
                label={{ value: s.label, position: "insideTopRight", fontSize: 9, fill: s.color }}
              />
            ))}
            <Area
              type="monotone"
              dataKey={param}
              stroke={cfg.color}
              strokeWidth={2}
              fill={`url(#${cfg.grad})`}
              dot={false}
              name={cfg.label}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Minimum", value: minVal.toFixed(2) },
          { label: "Maximum", value: maxVal.toFixed(2) },
          { label: "Moyenne", value: avgVal.toFixed(2) },
          { label: "Dernière valeur", value: lastVal.toFixed(2) },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4" style={card}>
            <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: "rgba(148,163,184,0.5)" }}>
              {s.label}
            </p>
            <p className="font-mono font-700 text-2xl" style={{ color: cfg.color }}>
              {s.value}
            </p>
            <p className="text-[10px] mt-1" style={{ color: "rgba(148,163,184,0.4)" }}>
              {param === "debit" ? "m³/s" : "m"}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-5" style={card}>
        <p className="font-display font-600 text-sm text-white mb-4">
          Comparaison multi-paramètres — {station}
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData.slice(-14)} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "rgba(148,163,184,0.5)", fontFamily: "JetBrains Mono" }} />
            <YAxis yAxisId="left" tick={{ fontSize: 9, fill: "rgba(148,163,184,0.5)", fontFamily: "JetBrains Mono" }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: "rgba(148,163,184,0.5)", fontFamily: "JetBrains Mono" }} />
            <Tooltip
              contentStyle={{ background: "#071223", border: "1px solid rgba(34,211,238,0.2)", borderRadius: 8, fontSize: 10 }}
            />
            <Legend wrapperStyle={{ fontSize: 10, color: "#94a3b8" }} />
            <Line yAxisId="left" type="monotone" dataKey="niveau" stroke="#06b6d4" strokeWidth={1.5} dot={false} name="Niveau (m)" />
            <Line yAxisId="left" type="monotone" dataKey="profondeur" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name="Hauteur (m)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
