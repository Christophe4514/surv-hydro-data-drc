import { useState } from "react";
import { calendrierNavigation, stations, type NavStatus } from "../data/lubiData";
import StatusBadge from "../components/StatusBadge";

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
  const [calMonth, setCalMonth] = useState(7);
  const [calYear] = useState(2026);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const firstDay = new Date(calYear, calMonth, 1);
  const lastDay = new Date(calYear, calMonth + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const calData = new Map(
    calendrierNavigation
      .filter((d) => {
        const dt = new Date(d.date);
        return dt.getFullYear() === calYear && dt.getMonth() === calMonth;
      })
      .map((d) => [d.date, d])
  );

  const monthDays = Array.from(calData.values());
  const navCount = monthDays.filter((d) => d.status === "navigable").length;
  const vigCount = monthDays.filter((d) => d.status === "vigilance").length;
  const nonNavCount = monthDays.filter((d) => d.status === "non-navigable").length;

  const hoveredData = hoveredDay ? calData.get(hoveredDay) : null;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-screen-xl mx-auto">
      <div
        className="rounded-xl px-5 py-4"
        style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)" }}
      >
        <p className="text-[11px] font-mono uppercase tracking-widest mb-1" style={{ color: "rgba(16,185,129,0.6)" }}>
          État global de navigation — Rivière Lubi
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full" style={{ background: "#10b981" }} />
              <h2 className="font-display font-700 text-2xl" style={{ color: "#10b981" }}>
                NAVIGATION : PARTIELLEMENT FAVORABLE
              </h2>
            </div>
            <p className="text-sm mt-1" style={{ color: "rgba(226,232,240,0.6)" }}>
              2 zones navigables · 1 zone en vigilance · 2 zones non navigables (Zone Sud en sécheresse)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Profondeur moy.", value: "2,60 m", icon: "↕", color: "#22d3ee" },
          { label: "Niveau moyen", value: "3,06 m", icon: "〜", color: "#22d3ee" },
          { label: "Débit moyen", value: "1 292 m³/s", icon: "⇌", color: "#22d3ee" },
          { label: "Zones navigables", value: "2 / 5", icon: "⛵", color: "#10b981" },
          { label: "Zones vigilance", value: "1 / 5", icon: "⚠", color: "#f59e0b" },
          { label: "Non navigables", value: "2 / 5", icon: "🚫", color: "#ef4444" },
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
                      <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>{s.zone} · km {s.km}</p>
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
                      { label: "Profondeur", value: `${s.profondeur} m`, var: null },
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
                        Profondeur de navigation
                      </p>
                      <p className="text-[10px] font-mono" style={{ color: "rgba(148,163,184,0.5)" }}>
                        Seuil min: 2,0 m
                      </p>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (s.profondeur / 5) * 100)}%`,
                          background: s.profondeur >= 2.0 ? "#10b981" : s.profondeur >= 1.5 ? "#f59e0b" : "#ef4444",
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
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => setCalMonth((m) => Math.max(0, m - 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}
                disabled={calMonth === 0}
              >
                ‹
              </button>
              <div className="text-center">
                <p className="font-display font-700 text-base text-white">
                  {monthNames[calMonth]} {calYear}
                </p>
                <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>
                  Calendrier de navigation — Rivière Lubi
                </p>
              </div>
              <button
                onClick={() => setCalMonth((m) => Math.min(7, m + 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}
                disabled={calMonth === 7}
              >
                ›
              </button>
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
                const isToday = dateStr === "2026-08-16";
                const isFuture = new Date(dateStr) > new Date("2026-08-16");
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
                    <span className="text-[11px]" style={{ color: "rgba(148,163,184,0.6)" }}>Profondeur</span>
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
              <p className="font-display font-600 text-sm text-white mb-3">Bathymétrie</p>
              {[
                { label: "Très faible (< 1 m)", width: 10, color: "#ef4444" },
                { label: "Faible (1–2 m)", width: 30, color: "#f97316" },
                { label: "Moyenne (2–3 m)", width: 40, color: "#f59e0b" },
                { label: "Importante (> 3 m)", width: 20, color: "#10b981" },
              ].map((b) => (
                <div key={b.label} className="mb-2.5">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px]" style={{ color: "rgba(148,163,184,0.6)" }}>{b.label}</span>
                    <span className="text-[10px] font-mono" style={{ color: b.color }}>{b.width}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="h-full rounded-full" style={{ width: `${b.width}%`, background: b.color }} />
                  </div>
                </div>
              ))}
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
                { label: "Niveau d'eau", value: "3,20 m", color: "#22d3ee", icon: "〜" },
                { label: "Profondeur", value: "2,80 m", color: "#22d3ee", icon: "↕" },
                { label: "Débit", value: "1 250 m³/s", color: "#22d3ee", icon: "⇌" },
                { label: "Bathymétrie", value: "Compatible", color: "#10b981", icon: "🗺" },
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
                <p className="font-display font-700 text-2xl" style={{ color: "#10b981" }}>
                  🟢 NAVIGATION FAVORABLE
                </p>
                <p className="text-[11px] mt-1" style={{ color: "rgba(148,163,184,0.6)" }}>
                  Toutes les conditions sont réunies pour la navigation
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl p-5" style={card}>
              <p className="font-display font-600 text-sm text-white mb-4">Seuils de navigabilité</p>
              <div className="space-y-2.5">
                {[
                  { label: "Profondeur minimale", value: "2,0 m", status: "Seuil de navigabilité" },
                  { label: "Profondeur vigilance", value: "1,5 m", status: "Navigation déconseillée" },
                  { label: "Profondeur critique", value: "< 1,0 m", status: "Navigation impossible" },
                  { label: "Débit minimum", value: "500 m³/s", status: "Débit minimal requis" },
                  { label: "Niveau minimum", value: "2,5 m", status: "Niveau navigable" },
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
