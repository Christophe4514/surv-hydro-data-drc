import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { NavStatus, StatusLevel } from "../data/lubiData";
import { LAST_DATE, LAST_HEURE, formatDateFr, qFromH } from "../data/lubiData";

const STORAGE_KEY = "lubi-hydro-settings";

export interface AppSettings {
  notifAlerte: boolean;
  notifCritique: boolean;
  notifVigilance: boolean;
  notifEmail: boolean;
  email: string;
  autoRefresh: boolean;
  refreshInterval: "5" | "15" | "30" | "60";
  unite: "m" | "cm";
  langue: "fr" | "en";
  theme: "dark" | "dim";
  seuil_normal: string;
  seuil_vigilance: string;
  seuil_alerte: string;
  seuil_critique: string;
  profondeur_nav_min: string;
  profondeur_vigilance: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  notifAlerte: true,
  notifCritique: true,
  notifVigilance: false,
  notifEmail: false,
  email: "",
  autoRefresh: true,
  refreshInterval: "15",
  unite: "m",
  langue: "fr",
  theme: "dark",
  seuil_normal: "1.5",
  seuil_vigilance: "1.3",
  seuil_alerte: "1.2",
  seuil_critique: "1.0",
  profondeur_nav_min: "1.5",
  profondeur_vigilance: "1.2",
};

export interface SeuilsActifs {
  navigable: number;
  pluie: number;
  etage: number;
  critique: number;
  normal: number;
  alerte: number;
}

interface SettingsContextValue {
  settings: AppSettings;
  seuils: SeuilsActifs;
  qNavigable: number;
  qEtiage: number;
  savedAt: string | null;
  save: (next: AppSettings) => void;
  reset: () => void;
  formatDepth: (m: number, digits?: number) => string;
  navOf: (h: number) => NavStatus;
  statusOf: (h: number) => StatusLevel;
  alertEnabled: (gravite: string) => boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function parseNum(raw: string, fallback: number): number {
  const n = Number(String(raw).replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const seuils = useMemo<SeuilsActifs>(
    () => ({
      navigable: parseNum(settings.profondeur_nav_min, 1.5),
      etage: parseNum(settings.profondeur_vigilance, 1.2),
      pluie: parseNum(settings.seuil_vigilance, 1.3),
      normal: parseNum(settings.seuil_normal, 1.5),
      alerte: parseNum(settings.seuil_alerte, 1.2),
      critique: parseNum(settings.seuil_critique, 1.0),
    }),
    [settings],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.lang = settings.langue;
  }, [settings.theme, settings.langue]);

  const save = (next: AppSettings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSettings(next);
    setSavedAt(new Date().toISOString());
  };

  const reset = () => save({ ...DEFAULT_SETTINGS });

  const formatDepth = (m: number, digits = 2) => {
    if (settings.unite === "cm") return `${Math.round(m * 100)} cm`;
    return `${m.toLocaleString(settings.langue === "en" ? "en-GB" : "fr-FR", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })} m`;
  };

  const navOf = (h: number): NavStatus => {
    if (h >= seuils.navigable) return "navigable";
    if (h >= seuils.etage) return "vigilance";
    return "non-navigable";
  };

  const statusOf = (h: number): StatusLevel => {
    if (h >= seuils.normal) return "normal";
    if (h >= seuils.pluie) return "vigilance";
    if (h >= seuils.alerte) return "alerte";
    return "critique";
  };

  const alertEnabled = (gravite: string) => {
    if (gravite === "critique") return settings.notifCritique;
    if (gravite === "alerte") return settings.notifAlerte;
    if (gravite === "vigilance") return settings.notifVigilance;
    return true;
  };

  const value: SettingsContextValue = {
    settings,
    seuils,
    qNavigable: qFromH(seuils.navigable),
    qEtiage: qFromH(seuils.etage),
    savedAt,
    save,
    reset,
    formatDepth,
    navOf,
    statusOf,
    alertEnabled,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

export const DATA_STAMP = `${formatDateFr(LAST_DATE)} ${LAST_HEURE}`;
