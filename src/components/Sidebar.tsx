import type { PageId } from "../App";

interface NavItem {
  id: PageId;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Vue générale", icon: "⊞" },
  { id: "carte", label: "Carte de la Lubi", icon: "◎" },
  { id: "navigation", label: "Navigation", icon: "⛵" },
  { id: "hydrologie", label: "Hydrologie", icon: "〜" },
  { id: "alertes", label: "Alertes", icon: "⚠" },
  { id: "historique", label: "Historique", icon: "📈" },
  { id: "stations", label: "Stations", icon: "📡" },
  { id: "donnees", label: "Données", icon: "⊞" },
  { id: "parametres", label: "Paramètres", icon: "⚙" },
];

interface Props {
  currentPage: PageId;
  onNavigate: (p: PageId) => void;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ currentPage, onNavigate, open }: Props) {
  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-30
        flex flex-col w-60 flex-shrink-0
        transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      style={{ background: "#071223", borderRight: "1px solid rgba(34,211,238,0.1)" }}
    >
      <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(34,211,238,0.1)" }}>
        <div className="flex items-center gap-2.5 mb-1">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M2 14c1-2 2.5-3.5 4-3.5S8.5 12 10 12s3-2 4-2"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M2 10c1-2 2.5-3.5 4-3.5S8.5 8 10 8s3-2 4-2"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <circle cx="9" cy="5" r="2" fill="rgba(255,255,255,0.9)" />
            </svg>
          </div>
          <div>
            <p className="font-display font-700 text-sm tracking-widest" style={{ color: "#22d3ee", letterSpacing: "0.12em" }}>
              LUBI HYDRO
            </p>
            <p className="text-[10px]" style={{ color: "rgba(148,163,184,0.7)" }}>
              Rivière Lubi — RDC
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        <div className="px-3">
          {navItems.map((item) => {
            const active = item.id === currentPage;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-left transition-all duration-150 group"
                style={{
                  background: active ? "rgba(34,211,238,0.12)" : "transparent",
                  color: active ? "#22d3ee" : "rgba(148,163,184,0.8)",
                  borderLeft: active ? "2px solid #22d3ee" : "2px solid transparent",
                }}
              >
                <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
                {item.id === "alertes" && (
                  <span
                    className="ml-auto text-[10px] font-mono font-600 px-1.5 py-0.5 rounded-full"
                    style={{ background: "#ef4444", color: "white" }}
                  >
                    4
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="px-5 py-4 border-t" style={{ borderColor: "rgba(34,211,238,0.1)" }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#10b981" }} />
          <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.6)" }}>
            Source: données Excel
          </p>
        </div>
        <p className="text-[10px] font-mono" style={{ color: "rgba(148,163,184,0.4)" }}>
          v1.0.0 — démo
        </p>
      </div>
    </aside>
  );
}
