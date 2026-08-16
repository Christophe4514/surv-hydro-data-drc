import type { PageId } from "../App";
import { statsGlobales } from "../data/lubiData";

const pageTitles: Record<PageId, { title: string; sub: string }> = {
  dashboard: { title: "Vue générale", sub: "État hydrologique de la rivière Lubi" },
  carte: { title: "Carte de la Lubi", sub: "Cartographie et stations de mesure" },
  navigation: { title: "Navigation", sub: "Conditions de navigation sur la Lubi" },
  hydrologie: { title: "Hydrologie", sub: "Analyse hydrologique — rivière Lubi" },
  alertes: { title: "Alertes", sub: "Système d'alerte hydrologique" },
  historique: { title: "Historique", sub: "Données historiques de la Lubi" },
  stations: { title: "Stations", sub: "Stations de mesure de la rivière Lubi" },
  donnees: { title: "Données", sub: "Données brutes — fichier Excel" },
  parametres: { title: "Paramètres", sub: "Configuration de l'application" },
};

interface Props {
  page: PageId;
  time: Date;
  onMenuToggle: () => void;
}

export default function Header({ page, time, onMenuToggle }: Props) {
  const { title, sub } = pageTitles[page];
  const dateStr = time.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

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
            Rivière Lubi
          </p>
          <span style={{ color: "rgba(148,163,184,0.3)" }}>·</span>
          <p className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>
            RDC
          </p>
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

        <button
          className="relative p-2 rounded-lg transition-colors"
          style={{ background: "rgba(255,255,255,0.04)", color: "#94a3b8" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1.5a5 5 0 015 5v2.5l1 2H2l1-2V6.5a5 5 0 015-5z"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path d="M6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full text-[8px] flex items-center justify-center font-700"
            style={{ background: "#ef4444" }}
          />
        </button>

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
