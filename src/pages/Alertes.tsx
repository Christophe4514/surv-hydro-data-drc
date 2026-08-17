import { useState } from "react";
import { type AlerteItem } from "../data/lubiData";
import StatusBadge from "../components/StatusBadge";
import { useHydroSource } from "../context/HydroSourceContext";

const card = {
  background: "rgba(15,36,68,0.7)",
  border: "1px solid rgba(34,211,238,0.1)",
  borderRadius: 12,
};

const typeIcon: Record<string, string> = {
  inondation: "🌊",
  secheresse: "🏜",
  navigation: "⛵",
  debit: "💧",
};

const typeLabel: Record<string, string> = {
  inondation: "Inondation",
  secheresse: "Sécheresse",
  navigation: "Navigation",
  debit: "Débit",
};

const statutColor: Record<string, { bg: string; color: string }> = {
  active: { bg: "rgba(239,68,68,0.1)", color: "#ef4444" },
  "en-cours": { bg: "rgba(249,115,22,0.1)", color: "#f97316" },
  resolue: { bg: "rgba(16,185,129,0.1)", color: "#10b981" },
};

export default function Alertes() {
  const [filterGravite, setFilterGravite] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatut, setFilterStatut] = useState<string>("all");
  const [selected, setSelected] = useState<AlerteItem | null>(null);
  const { bundle } = useHydroSource();
  const { alertes } = bundle;

  const filtered = alertes.filter((a) => {
    if (filterGravite !== "all" && a.gravite !== filterGravite) return false;
    if (filterType !== "all" && a.type !== filterType) return false;
    if (filterStatut !== "all" && a.statut !== filterStatut) return false;
    return true;
  });

  const counts = {
    critique: alertes.filter((a) => a.gravite === "critique").length,
    alerte: alertes.filter((a) => a.gravite === "alerte").length,
    vigilance: alertes.filter((a) => a.gravite === "vigilance").length,
    active: alertes.filter((a) => a.statut === "active").length,
  };

  const graviteColors: Record<string, string> = {
    critique: "#ef4444", alerte: "#f97316", vigilance: "#f59e0b", info: "#3b82f6",
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-screen-xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Alertes actives", value: counts.active, color: "#ef4444" },
          { label: "Niveau Critique", value: counts.critique, color: "#ef4444" },
          { label: "Niveau Alerte", value: counts.alerte, color: "#f97316" },
          { label: "Vigilance", value: counts.vigilance, color: "#f59e0b" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4" style={card}>
            <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: "rgba(148,163,184,0.5)" }}>
              {s.label}
            </p>
            <p className="font-display font-700 text-3xl font-mono" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono self-center" style={{ color: "rgba(148,163,184,0.5)" }}>Gravité:</span>
          {["all", "critique", "alerte", "vigilance", "info"].map((g) => (
            <button
              key={g}
              onClick={() => setFilterGravite(g)}
              className="px-3 py-1 rounded-lg text-[11px] font-mono font-600 transition-colors"
              style={{
                background: filterGravite === g ? "rgba(34,211,238,0.15)" : "rgba(255,255,255,0.04)",
                color: filterGravite === g ? "#22d3ee" : "rgba(148,163,184,0.6)",
                border: filterGravite === g ? "1px solid rgba(34,211,238,0.3)" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {g === "all" ? "Tous" : g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono self-center" style={{ color: "rgba(148,163,184,0.5)" }}>Type:</span>
          {["all", "inondation", "secheresse", "navigation", "debit"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className="px-3 py-1 rounded-lg text-[11px] font-mono font-600 transition-colors"
              style={{
                background: filterType === t ? "rgba(34,211,238,0.15)" : "rgba(255,255,255,0.04)",
                color: filterType === t ? "#22d3ee" : "rgba(148,163,184,0.6)",
                border: filterType === t ? "1px solid rgba(34,211,238,0.3)" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {t === "all" ? "Tous" : typeLabel[t]}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono self-center" style={{ color: "rgba(148,163,184,0.5)" }}>Statut:</span>
          {["all", "active", "en-cours", "resolue"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatut(s)}
              className="px-3 py-1 rounded-lg text-[11px] font-mono font-600 transition-colors"
              style={{
                background: filterStatut === s ? "rgba(34,211,238,0.15)" : "rgba(255,255,255,0.04)",
                color: filterStatut === s ? "#22d3ee" : "rgba(148,163,184,0.6)",
                border: filterStatut === s ? "1px solid rgba(34,211,238,0.3)" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {s === "all" ? "Tous" : s === "active" ? "Active" : s === "en-cours" ? "En cours" : "Résolue"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        {filtered.length === 0 && (
          <div className="rounded-xl p-12 text-center" style={card}>
            <p className="text-4xl mb-3">✅</p>
            <p className="font-display font-600 text-base text-white">Aucune alerte</p>
            <p className="text-sm" style={{ color: "rgba(148,163,184,0.5)" }}>Aucune alerte ne correspond aux filtres sélectionnés</p>
          </div>
        )}
        {filtered.map((a) => {
          const gc = graviteColors[a.gravite] ?? "#3b82f6";
          const sc = statutColor[a.statut];
          const isSelected = selected?.id === a.id;
          return (
            <div
              key={a.id}
              className="rounded-xl overflow-hidden cursor-pointer transition-all"
              style={{
                background: isSelected ? "rgba(15,36,68,0.95)" : "rgba(15,36,68,0.7)",
                border: isSelected ? `1px solid ${gc}40` : "1px solid rgba(34,211,238,0.08)",
              }}
              onClick={() => setSelected(isSelected ? null : a)}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                    style={{ background: `${gc}15`, border: `1px solid ${gc}30` }}
                  >
                    {typeIcon[a.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono font-700 text-sm" style={{ color: "#22d3ee" }}>#{a.id}</span>
                      <StatusBadge status={a.gravite} />
                      <span
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                        style={{ background: sc.bg, color: sc.color }}
                      >
                        {a.statut === "active" ? "Active" : a.statut === "en-cours" ? "En cours" : "Résolue"}
                      </span>
                      <span className="text-[11px] font-mono" style={{ color: "rgba(148,163,184,0.5)" }}>
                        {a.date} {a.heure}
                      </span>
                    </div>
                    <p className="text-sm font-600 text-white mb-0.5">{a.description}</p>
                    <div className="flex flex-wrap gap-3 text-[11px]">
                      <span style={{ color: "rgba(148,163,184,0.6)" }}>
                        Station: <span className="font-mono font-600" style={{ color: "#22d3ee" }}>{a.station}</span>
                      </span>
                      <span style={{ color: "rgba(148,163,184,0.6)" }}>
                        Zone: <span style={{ color: "#e2e8f0" }}>{a.zone}</span>
                      </span>
                      <span style={{ color: "rgba(148,163,184,0.6)" }}>
                        Type: <span style={{ color: "#e2e8f0" }}>{typeLabel[a.type]}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[11px] font-mono" style={{ color: "rgba(148,163,184,0.5)" }}>{a.parametre}</p>
                    <p className="font-mono font-700 text-base" style={{ color: gc }}>
                      {a.valeurActuelle} {a.unite}
                    </p>
                    <p className="text-[10px] font-mono" style={{ color: "rgba(148,163,184,0.4)" }}>
                      seuil: {a.seuil} {a.unite}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: "Paramètre", value: a.parametre },
                        { label: "Valeur actuelle", value: `${a.valeurActuelle} ${a.unite}` },
                        { label: "Seuil dépassé", value: `${a.seuil} ${a.unite}` },
                        { label: "Écart", value: `${Math.abs(a.valeurActuelle - a.seuil).toFixed(2)} ${a.unite}` },
                      ].map((item) => (
                        <div key={item.label} className="p-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                          <p className="text-[10px] font-mono uppercase" style={{ color: "rgba(148,163,184,0.4)" }}>{item.label}</p>
                          <p className="text-sm font-mono font-600 text-white mt-0.5">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
