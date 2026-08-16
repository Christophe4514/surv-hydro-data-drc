import { useState, useEffect, type ReactNode } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Carte from "./pages/Carte";
import Navigation from "./pages/Navigation";
import Hydrologie from "./pages/Hydrologie";
import Alertes from "./pages/Alertes";
import Historique from "./pages/Historique";
import Stations from "./pages/Stations";
import Donnees from "./pages/Donnees";
import Parametres from "./pages/Parametres";
import { useSettings } from "./context/SettingsContext";

export type PageId =
  | "dashboard"
  | "carte"
  | "navigation"
  | "hydrologie"
  | "alertes"
  | "historique"
  | "stations"
  | "donnees"
  | "parametres";

export default function App() {
  const [page, setPage] = useState<PageId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const { settings } = useSettings();
  const bg = settings.theme === "dim" ? "#152a45" : "#0b1a31";

  useEffect(() => {
    const clock = setInterval(() => setTime(new Date()), 60_000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    if (!settings.autoRefresh) return;
    const ms = Number(settings.refreshInterval) * 60_000;
    const t = setInterval(() => setTime(new Date()), ms);
    return () => clearInterval(t);
  }, [settings.autoRefresh, settings.refreshInterval]);

  const pages: Record<PageId, ReactNode> = {
    dashboard: <Dashboard onNavigate={setPage} />,
    carte: <Carte />,
    navigation: <Navigation />,
    hydrologie: <Hydrologie />,
    alertes: <Alertes />,
    historique: <Historique />,
    stations: <Stations onNavigate={setPage} />,
    donnees: <Donnees />,
    parametres: <Parametres />,
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: bg }}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        currentPage={page}
        onNavigate={(p) => {
          setPage(p);
          setSidebarOpen(false);
        }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          page={page}
          time={time}
          onMenuToggle={() => setSidebarOpen(true)}
          onNavigate={setPage}
        />
        <main className="flex-1 overflow-y-auto" style={{ background: bg }}>
          {pages[page]}
        </main>
      </div>
    </div>
  );
}
