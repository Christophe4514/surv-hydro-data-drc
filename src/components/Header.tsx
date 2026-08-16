import { useMemo, useState } from "react";
import type { PageId } from "../App";
import { useSettings } from "../context/SettingsContext";
import { useHydroSource } from "../context/HydroSourceContext";

function pageTitles(river: string): Record<PageId, { title: string; sub: string }> {
  return {
    dashboard: { title: "Vue générale", sub: `État hydrologique de la rivière ${river}` },
    carte: { title: `Carte — ${river}`, sub: "Cartographie et stations de mesure" },
    navigation: { title: "Navigation", sub: `Conditions de navigation sur ${river}` },
    hydrologie: { title: "Hydrologie", sub: `Analyse hydrologique — rivière ${river}` },
    alertes: { title: "Alertes", sub: "Système d'alerte hydrologique" },
    historique: { title: "Historique", sub: `Données historiques de ${river}` },
    stations: { title: "Stations", sub: `Stations de mesure — ${river}` },
    donnees: { title: "Données", sub: "Données brutes" },
    parametres: { title: "Paramètres", sub: "Configuration de l'application" },
  };
}

interface Props {
  page: PageId;
  time: Date;
  onMenuToggle: () => void;
  onNavigate: (p: PageId) => void;
}

export default function Header({ page, time, onMenuToggle, onNavigate }: Props) {
  const { settings, alertEnabled } = useSettings();
  const { bundle, activateLubi } = useHydroSource();
  const { alertes, statsGlobales, riverName, mode } = bundle;
  const [openNotif, setOpenNotif] = useState(false);
  const { title, sub } = pageTitles(riverName)[page];

  const locale = settings.langue === "en" ? "en-GB" : "fr-FR";
  const dateStr = time.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = time.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

  const visibleAlertes = useMemo(
    () => alertes.filter((a) => a.statut === "active" && alertEnabled(a.gravite)),
    [alertEnabled, alertes],
  );

  return (
    <header
      className="flex items-center gap-4 px-5 py-3 flex-shrink-0"
      style={{ background: "#071223", borderBottom: "1px solid rgba(34,211,238,0.1)" }}
    >
      <button
        className="lg:hidden p-1.5 rounded"
        style={{ color: "#94a3b8" }}
        onClick={onMenuToggle}
      >
        ☰
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "rgba(34,211,238,0.6)" }}>
            Rivière {riverName}
          </p>
          <span style={{ color: "rgba(148,163,184,0.3)" }}>·</span>
          <p className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>
            RDC
          </p>
          {mode !== "lubi" && (
            <button
              type="button"
              onClick={() => void activateLubi()}
              className="text-[10px] font-mono px-2 py-0.5 rounded"
              style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}
            >
              Source externe · Lubi →
            </button>
          )}
        </div>
        <h1 className="font-display font-600 text-base text-white leading-tight">{title}</h1>
        <p className="text-[11px] hidden sm:block" style={{ color: "rgba(148,163,184,0.6)" }}>
          {sub}
        </p>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="hidden md:flex flex-col items-end">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#10b981" }} />
            <p className="text-[11px] font-mono" style={{ color: "rgba(148,163,184,0.6)" }}>
              Mise à jour: {statsGlobales.derniereMiseAJour}
            </p>
          </div>
          <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.4)" }}>
            {dateStr} — {timeStr}
          </p>
        </div>

        <div className="relative">
          <button
            className="relative p-2 rounded-lg transition-colors"
            style={{ background: openNotif ? "rgba(34,211,238,0.12)" : "rgba(255,255,255,0.04)", color: "#94a3b8" }}
            onClick={() => setOpenNotif((v) => !v)}
            aria-label="Notifications"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1.5a5 5 0 015 5v2.5l1 2H2l1-2V6.5a5 5 0 015-5z"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path d="M6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            {visibleAlertes.length > 0 && (
              <span
                className="absolute top-1 right-1 min-w-2 h-2 px-0.5 rounded-full text-[8px] flex items-center justify-center font-700"
                style={{ background: "#ef4444", color: "white" }}
              />
            )}
          </button>
          {openNotif && (
            <div
              className="absolute right-0 top-11 w-72 rounded-xl p-3 z-40"
              style={{ background: "#071223", border: "1px solid rgba(34,211,238,0.2)", boxShadow: "0 12px 40px rgba(0,0,0,0.45)" }}
            >
              <p className="text-[11px] font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(148,163,184,0.5)" }}>
                Notifications ({visibleAlertes.length})
              </p>
              {visibleAlertes.length === 0 ? (
                <p className="text-xs" style={{ color: "rgba(148,163,184,0.6)" }}>
                  Aucune alerte active pour les types activés dans Paramètres.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {visibleAlertes.slice(0, 6).map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        setOpenNotif(false);
                        onNavigate("alertes");
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg"
                      style={{ background: "rgba(255,255,255,0.03)" }}
                    >
                      <p className="text-[11px] font-600 text-white truncate">{a.station}</p>
                      <p className="text-[10px] truncate" style={{ color: "rgba(148,163,184,0.55)" }}>{a.description}</p>
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => {
                  setOpenNotif(false);
                  onNavigate("alertes");
                }}
                className="mt-2 w-full text-[11px] font-mono py-1.5 rounded-lg"
                style={{ background: "rgba(34,211,238,0.08)", color: "#22d3ee" }}
              >
                Voir toutes les alertes →
              </button>
            </div>
          )}
        </div>

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-700 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)", color: "white" }}
        >
          AD
        </div>
      </div>
    </header>
  );
}
