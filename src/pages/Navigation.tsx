import { useState, useEffect } from "react";
import { type NavStatus, fmtFr, Q_SEUIL_PLUIE } from "../data/lubiData";
import StatusBadge from "../components/StatusBadge";
import { useSettings } from "../context/SettingsContext";
import { useHydroSource } from "../context/HydroSourceContext";

const card = {
  background: "rgba(15,36,68,0.7)",
  border: "1px solid rgba(34,211,238,0.1)",
  borderRadius: 12,
};

const navColors: Record<NavStatus, { bg: string; border: string; text: string }> = {
  navigable: { bg: "rgba(16,185,129,0.18)", border: "rgba(16,185,129,0.35)", text: "#10b981" },
  vigilance: { bg: "rgba(245,158,11,0.18)", border: "rgba(245,158,11,0.35)", text: "#f59e0b" },
  "non-navigable": { bg: "rgba(239,68,68,0.18)", border: "rgba(239,68,68,0.35)", text: "#ef4444" },
};

const monthNames = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

type TabId = "conditions" | "calendrier" | "logique";

export default function Navigation() {
  const [tab, setTab] = useState<TabId>("conditions");
  const [calMonth, setCalMonth] = useState(11);
  const { seuils, qNavigable, qEtiage, formatDepth, navOf } = useSettings();
  const { bundle } = useHydroSource();
  const { stations, getCalendarDays, navigableByMonth, navigableByYear, statsGlobales, LAST_DATE, DATA_PERIOD } = bundle;
  const [calYear, setCalYear] = useState(() => Number(DATA_PERIOD.end.slice(0, 4)) || 2022);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  useEffect(() => {
    const y = Number(DATA_PERIOD.end.slice(0, 4));
    const m = Number(DATA_PERIOD.end.slice(5, 7));
    if (Number.isFinite(y) && y > 1900) setCalYear(y);
    if (Number.isFinite(m) && m >= 1 && m <= 12) setCalMonth(m - 1);
  }, [DATA_PERIOD.end]);

  const firstDay = new Date(calYear, calMonth, 1);
  const lastDay = new Date(calYear, calMonth + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const calData = new Map(getCalendarDays(calYear, calMonth).map((d) => [d.date, d]));
  const excelMonth = navigableByMonth.find((m) => m.year === calYear && m.month === calMonth + 1);
  const excelYear = navigableByYear.find((y) => y.year === calYear);

  const monthDays = Array.from(calData.values());
  const navCount = monthDays.filter((d) => d.status === "navigable").length;
  const vigCount = monthDays.filter((d) => d.status === "vigilance").length;
  const nonNavCount = monthDays.filter((d) => d.status === "non-navigable").length;

  const hoveredData = hoveredDay ? calData.get(hoveredDay) : null;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-screen-xl mx-auto">
      <div
        className="rounded-xl px-5 py-4"
        style={{
          background: statsGlobales.zonesNonNavigables > 0 ? "rgba(249,115,22,0.08)" : "rgba(16,185,129,0.07)",
          border: statsGlobales.zonesNonNavigables > 0 ? "1px solid rgba(249,115,22,0.25)" : "1px solid rgba(16,185,129,0.2)",
        }}
      >
        <p className="text-[11px] font-mono uppercase tracking-widest mb-1" style={{ color: "rgba(34,211,238,0.6)" }}>
          État global de navigation — {bundle.riverName} · {LAST_DATE}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full" style={{ background: navOf(statsGlobales.junctionProfondeur) === "navigable" ? "#10b981" : "#f97316" }} />
              <h2 className="font-display font-700 text-2xl" style={{ color: navOf(statsGlobales.junctionProfondeur) === "navigable" ? "#10b981" : "#f97316" }}>
                JONCTION : {navOf(statsGlobales.junctionProfondeur) === "navigable" ? "NAVIGABLE" : navOf(statsGlobales.junctionProfondeur) === "vigilance" ? "VIGILANCE" : "NON NAVIGABLE"}
              </h2>
            </div>
            <p className="text-sm mt-1" style={{ color: "rgba(226,232,240,0.6)" }}>
              {statsGlobales.zonesNavigables} bassin(s) navigable(s) · {statsGlobales.zonesVigilance} en vigilance · {statsGlobales.zonesNonNavigables} non navigable(s)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Hauteur jonction", value: formatDepth(statsGlobales.junctionProfondeur, 2), color: "#22d3ee" },
          { label: "Débit jonction", value: `${fmtFr(statsGlobales.junctionDebit, 1)} m³/s`, color: "#22d3ee" },
          { label: `Tirant ${formatDepth(seuils.navigable, 1)}`, value: `${qNavigable} m³/s`, color: "#10b981" },
          { label: "Bassins navigables", value: `${statsGlobales.zonesNavigables} / 5`, color: "#10b981" },
          { label: "Vigilance", value: `${statsGlobales.zonesVigilance} / 5`, color: "#f59e0b" },
          { label: "Non navigables", value: `${statsGlobales.zonesNonNavigables} / 5`, color: "#ef4444" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl p-4" style={card}>
            <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: "rgba(148,163,184,0.5)" }}>
              {k.label}
            </p>
            <p className="font-display font-700 text-xl font-mono" style={{ color: k.color }}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {([
          { id: "conditions" as const, label: "Conditions actuelles" },
          { id: "calendrier" as const, label: "Calendrier de navigation" },
          { id: "logique" as const, label: "Logique de détermination" },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-2 rounded-lg text-sm font-600 transition-colors"
            style={{
              background: tab === t.id ? "rgba(34,211,238,0.15)" : "rgba(255,255,255,0.04)",
              color: tab === t.id ? "#22d3ee" : "rgba(148,163,184,0.6)",
              border: tab === t.id ? "1px solid rgba(34,211,238,0.3)" : "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "conditions" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {stations.map((s) => {
              const navCfg = navColors[s.navigation];
              return (
                <div key={s.id} className="rounded-xl p-5" style={card}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono font-700 text-base" style={{ color: "#22d3ee" }}>{s.code}</p>
                      <p className="text-sm font-600 text-white">{s.nom}</p>
                      <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>{s.zone} · {fmtFr(s.areaKm2, 0)} km²</p>
                    </div>
                    <div
                      className="px-4 py-2 rounded-xl text-center"
                      style={{ background: navCfg.bg, border: `1px solid ${navCfg.border}` }}
                    >
                      <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: navCfg.text }}>
                        Navigation
                      </p>
                      <p className="font-mono font-700 text-sm mt-0.5" style={{ color: navCfg.text }}>
                        {s.navigation === "navigable" ? "FAVORABLE" : s.navigation === "vigilance" ? "VIGILANCE" : "IMPOSSIBLE"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: "Niveau", value: `${s.niveau} m`, var: s.niveauVariation },
                      { label: "Débit", value: `${s.debit} m³/s`, var: s.debitVariation },
                      { label: "Hauteur", value: `${s.profondeur} m`, var: null },
                    ].map((item) => (
                      <div key={item.label} className="p-2.5 rounded-lg text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "rgba(148,163,184,0.4)" }}>
                          {item.label}
                        </p>
                        <p className="font-mono font-600 text-sm text-white">{item.value}</p>
                        {item.var !== null && item.var !== undefined && (
                          <p className="text-[10px] font-mono" style={{ color: item.var > 0 ? "#10b981" : "#ef4444" }}>
                            {item.var > 0 ? "↑" : "↓"} {Math.abs(item.var)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-mono uppercase" style={{ color: "rgba(148,163,184,0.5)" }}>
                        Hauteur de navigation
                      </p>
                      <p className="text-[10px] font-mono" style={{ color: "rgba(148,163,184,0.5)" }}>
                        Seuil min: {formatDepth(seuils.navigable, 1)} (étiage {formatDepth(seuils.etage, 1)})
                      </p>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (s.profondeur / 5) * 100)}%`,
                          background: navOf(s.profondeur) === "navigable" ? "#10b981" : navOf(s.profondeur) === "vigilance" ? "#f59e0b" : "#ef4444",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "calendrier" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 rounded-xl p-5" style={card}>
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => {
                  if (calMonth === 0) { setCalYear((y) => Math.max(2009, y - 1)); setCalMonth(11); }
                  else setCalMonth((m) => m - 1);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}
              >
                ‹
              </button>
              <div className="text-center">
                <p className="font-display font-700 text-base text-white">
                  {monthNames[calMonth]} {calYear}
                </p>
                <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>
                  Jours navigables selon la hauteur calculée
                </p>
              </div>
              <button
                onClick={() => {
                  if (calMonth === 11) { setCalYear((y) => Math.min(2022, y + 1)); setCalMonth(0); }
                  else setCalMonth((m) => m + 1);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}
              >
                ›
              </button>
            </div>
            <div className="flex flex-wrap justify-center gap-1 mb-4">
              {Array.from({ length: 14 }, (_, i) => 2009 + i).map((y) => (
                <button
                  key={y}
                  onClick={() => setCalYear(y)}
                  className="px-2 py-0.5 rounded text-[10px] font-mono"
                  style={{
                    background: calYear === y ? "rgba(34,211,238,0.2)" : "transparent",
                    color: calYear === y ? "#22d3ee" : "rgba(148,163,184,0.5)",
                  }}
                >
                  {y}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {dayNames.map((d) => (
                <div key={d} className="text-center py-1">
                  <p className="text-[10px] font-mono font-600 uppercase" style={{ color: "rgba(148,163,184,0.4)" }}>
                    {d}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDow }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const data = calData.get(dateStr);
                const isToday = dateStr === LAST_DATE;
                const isFuture = dateStr > LAST_DATE;
                const status = data?.status ?? "navigable";
                const cfg = navColors[status];

                return (
                  <div
                    key={day}
                    className="relative aspect-square rounded-lg flex flex-col items-center justify-center cursor-default transition-all"
                    style={{
                      background: hoveredDay === dateStr ? cfg.bg : data ? `${cfg.bg.replace("0.18", "0.1")}` : "rgba(255,255,255,0.02)",
                      border: isToday
                        ? "1px solid #22d3ee"
                        : hoveredDay === dateStr
                        ? `1px solid ${cfg.border}`
                        : "1px solid rgba(255,255,255,0.04)",
                      opacity: isFuture ? 0.5 : 1,
                    }}
                    onMouseEnter={() => setHoveredDay(dateStr)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <span
                      className="text-[11px] font-mono font-600"
                      style={{ color: isToday ? "#22d3ee" : "rgba(226,232,240,0.8)" }}
                    >
                      {day}
                    </span>
                    {data && (
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-0.5"
                        style={{ background: cfg.text }}
                      />
                    )}
                    {isFuture && data && (
                      <span className="text-[8px]" style={{ color: "rgba(148,163,184,0.4)" }}>~</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4 mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              {[
                { status: "navigable" as NavStatus, label: "Navigable" },
                { status: "vigilance" as NavStatus, label: "Vigilance" },
                { status: "non-navigable" as NavStatus, label: "Non navigable" },
              ].map(({ status, label }) => (
                <div key={status} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: navColors[status].text }} />
                  <span className="text-[11px] font-mono" style={{ color: "rgba(148,163,184,0.6)" }}>{label}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 ml-auto">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ border: "1px solid #22d3ee" }} />
                <span className="text-[11px] font-mono" style={{ color: "rgba(148,163,184,0.6)" }}>Aujourd'hui</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {hoveredData && (
              <div className="rounded-xl p-4" style={{ ...card, border: "1px solid rgba(34,211,238,0.2)" }}>
                <p className="font-mono font-700 text-sm mb-2" style={{ color: "#22d3ee" }}>
                  {hoveredDay}
                </p>
                {hoveredData.note && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: "rgba(34,211,238,0.1)", color: "#22d3ee" }}>
                    {hoveredData.note}
                  </span>
                )}
                <div className="space-y-2 mt-3">
                  <div className="flex justify-between">
                    <span className="text-[11px]" style={{ color: "rgba(148,163,184,0.6)" }}>Navigation</span>
                    <StatusBadge status={hoveredData.status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px]" style={{ color: "rgba(148,163,184,0.6)" }}>Niveau</span>
                    <span className="text-[11px] font-mono font-600 text-white">{hoveredData.niveau} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px]" style={{ color: "rgba(148,163,184,0.6)" }}>Débit</span>
                    <span className="text-[11px] font-mono font-600 text-white">{hoveredData.debit} m³/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px]" style={{ color: "rgba(148,163,184,0.6)" }}>Hauteur</span>
                    <span className="text-[11px] font-mono font-600 text-white">{hoveredData.profondeur} m</span>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl p-5" style={card}>
              <p className="font-display font-600 text-sm text-white mb-4">
                {monthNames[calMonth]} — bilan
              </p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] font-mono" style={{ color: "#10b981" }}>Navigable</span>
                    <span className="text-[11px] font-mono text-white">{navCount} j</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="h-full rounded-full" style={{ width: `${(navCount / daysInMonth) * 100}%`, background: "#10b981" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] font-mono" style={{ color: "#f59e0b" }}>Vigilance</span>
                    <span className="text-[11px] font-mono text-white">{vigCount} j</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="h-full rounded-full" style={{ width: `${(vigCount / daysInMonth) * 100}%`, background: "#f59e0b" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] font-mono" style={{ color: "#ef4444" }}>Non navigable</span>
                    <span className="text-[11px] font-mono text-white">{nonNavCount} j</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="h-full rounded-full" style={{ width: `${(nonNavCount / daysInMonth) * 100}%`, background: "#ef4444" }} />
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: "rgba(148,163,184,0.4)" }}>
                  Taux de navigabilité
                </p>
                <p className="font-display font-700 text-2xl" style={{ color: "#22d3ee" }}>
                  {daysInMonth > 0 ? Math.round((navCount / daysInMonth) * 100) : 0}%
                </p>
              </div>
            </div>

            <div className="rounded-xl p-5" style={card}>
              <p className="font-display font-600 text-sm text-white mb-3">Jour_Navigable (Excel)</p>
              <p className="text-[10px] mb-3" style={{ color: "rgba(148,163,184,0.5)" }}>
                Nombre de jours navigables du mois selon le tirant
              </p>
              {[
                { label: "Tirant 1,5 m", value: excelMonth?.jours15 ?? 0, color: "#10b981" },
                { label: "Tirant 1,3 m", value: excelMonth?.jours13 ?? 0, color: "#f59e0b" },
                { label: "Tirant 1,2 m (étiage)", value: excelMonth?.jours12 ?? 0, color: "#22d3ee" },
              ].map((b) => (
                <div key={b.label} className="mb-2.5">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px]" style={{ color: "rgba(148,163,184,0.6)" }}>{b.label}</span>
                    <span className="text-[10px] font-mono" style={{ color: b.color }}>{b.value} j / {daysInMonth}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="h-full rounded-full" style={{ width: `${(b.value / daysInMonth) * 100}%`, background: b.color }} />
                  </div>
                </div>
              ))}
              <p className="text-[11px] font-mono mt-3" style={{ color: "rgba(148,163,184,0.5)" }}>
                {calYear} : {excelYear?.joursNavigables ?? "—"} jours navigables / an
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === "logique" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl p-6" style={card}>
            <p className="font-display font-600 text-base text-white mb-4">Logique de détermination de la navigation</p>
            <div className="space-y-3">
              {[
                { label: "Débit jonction (Qsim)", value: `${fmtFr(statsGlobales.junctionDebit, 1)} m³/s`, color: "#22d3ee", icon: "⇌" },
                { label: "Hauteur calculée", value: `${fmtFr(statsGlobales.junctionProfondeur, 2)} m`, color: "#22d3ee", icon: "↕" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-[11px] font-mono uppercase" style={{ color: "rgba(148,163,184,0.5)" }}>{item.label}</p>
                    <p className="text-base font-mono font-700" style={{ color: item.color }}>{item.value}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-center py-2">
                <div className="flex flex-col items-center gap-1" style={{ color: "rgba(148,163,184,0.4)" }}>
                  <span className="text-lg">↓</span>
                  <p className="text-[10px] font-mono uppercase tracking-wider">Analyse des conditions</p>
                  <span className="text-lg">↓</span>
                </div>
              </div>
              <div
                className="p-4 rounded-xl text-center"
                style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)" }}
              >
                <p className="text-[11px] font-mono uppercase tracking-widest mb-1" style={{ color: "#10b981" }}>
                  Résultat
                </p>
                <p className="font-display font-700 text-2xl" style={{ color: navOf(statsGlobales.junctionProfondeur) === "navigable" ? "#10b981" : "#f59e0b" }}>
                  {navOf(statsGlobales.junctionProfondeur) === "navigable" ? "🟢 NAVIGATION FAVORABLE" : navOf(statsGlobales.junctionProfondeur) === "vigilance" ? "🟡 VIGILANCE" : "🔴 NON NAVIGABLE"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl p-5" style={card}>
              <p className="font-display font-600 text-sm text-white mb-4">Seuils de navigabilité</p>
              <div className="space-y-2.5">
                {[
                  { label: "Tirant navigable", value: formatDepth(seuils.navigable, 1), status: `Q ≥ ${qNavigable} m³/s` },
                  { label: "Tirant saison des pluies", value: formatDepth(seuils.pluie, 1), status: `Q ≥ ${Q_SEUIL_PLUIE} m³/s` },
                  { label: "Tirant d'étiage", value: formatDepth(seuils.etage, 1), status: `Q ≥ ${qEtiage} m³/s` },
                  { label: "Non navigable", value: `< ${formatDepth(seuils.etage, 1)}`, status: "Navigation impossible" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div>
                      <p className="text-[11px] text-white">{s.label}</p>
                      <p className="text-[10px]" style={{ color: "rgba(148,163,184,0.5)" }}>{s.status}</p>
                    </div>
                    <p className="font-mono font-700 text-sm" style={{ color: "#22d3ee" }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-5" style={card}>
              <p className="font-display font-600 text-sm text-white mb-3">Niveaux de navigation</p>
              {[
                { label: "🟢 Navigable", desc: "Toutes les conditions optimales", color: "#10b981" },
                { label: "🟡 Vigilance", desc: "Navigation possible avec précautions", color: "#f59e0b" },
                { label: "🔴 Non navigable", desc: "Navigation impossible / dangereuse", color: "#ef4444" },
              ].map((n) => (
                <div
                  key={n.label}
                  className="p-3 rounded-lg mb-2"
                  style={{ background: `${n.color}12`, border: `1px solid ${n.color}30` }}
                >
                  <p className="text-sm font-600" style={{ color: n.color }}>{n.label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "rgba(226,232,240,0.6)" }}>{n.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
