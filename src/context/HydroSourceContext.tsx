import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as lubi from "../data/lubiData";
import type { HydroBundle, HydroMode, RawHydroSeries } from "../data/hydroTypes";
import { buildBundleFromRaw } from "../data/buildHydroBundle";
import { idbClear, idbGet, idbSet } from "../data/idbStore";
import { useSettings } from "./SettingsContext";

const META_KEY = "lubi-hydro-source-meta";

interface SourceMeta {
  mode: HydroMode;
  riverName: string;
}

function loadMeta(): SourceMeta {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return { mode: "lubi", riverName: "Lubi" };
    return { mode: "lubi", riverName: "Lubi", ...JSON.parse(raw) };
  } catch {
    return { mode: "lubi", riverName: "Lubi" };
  }
}

function lubiBundle(): HydroBundle {
  const last = lubi.stations[0];
  return {
    mode: "lubi",
    riverName: "Lubi",
    sourceLabel: lubi.statsGlobales.source,
    hasCatchments: true,
    mapCenter: { lat: last?.latitude ?? -5.73, lon: last?.longitude ?? 23.28 },
    stations: lubi.stations,
    stationCodes: lubi.stationCodes,
    ports: lubi.ports,
    catchments: lubi.catchments,
    exutoire: lubi.exutoire,
    alertes: lubi.alertes,
    statsGlobales: lubi.statsGlobales,
    monthlyAverages: lubi.monthlyAverages,
    debitClasse: lubi.debitClasse,
    navigableByMonth: lubi.navigableByMonth,
    navigableByYear: lubi.navigableByYear,
    saisonStats: lubi.saisonStats,
    DATA_PERIOD: lubi.DATA_PERIOD,
    LAST_DATE: lubi.LAST_DATE,
    LAST_HEURE: lubi.LAST_HEURE,
    FORMULE_PROFONDEUR: lubi.FORMULE_PROFONDEUR,
    seuils: lubi.SEUILS_NAV,
    getStationSeries: lubi.getStationSeries,
    getCalendarDays: lubi.getCalendarDays,
    getQsimRows: () =>
      lubi.getQsimRows().map((r) => ({
        id: r.id,
        date: r.date,
        iso: r.iso,
        heure: r.heure,
        values: {
          "LUB-002": r.lubi2,
          "LUB-001": r.lubi1,
          "LUB-003": r.lukeshi,
          "LUB-004": r.bia,
          "LUB-005": r.lupaka,
          JUNCTION: r.junction,
        },
        junction: r.junction,
        profondeur: r.profondeur,
        navigation: r.navigation,
        saison: r.saison,
      })),
    tableHeaders: ["Date", "Heure", "Lubi (2)", "Lubi (1)", "Lukeshi", "Bi (A)", "Lupaka", "Jonction", "H (m)", "Navigation", "Saison"],
  };
}

interface HydroSourceValue {
  bundle: HydroBundle;
  loading: boolean;
  error: string | null;
  activateLubi: () => Promise<void>;
  activateSeries: (raw: RawHydroSeries) => Promise<void>;
}

const HydroSourceContext = createContext<HydroSourceValue | null>(null);

export function HydroSourceProvider({ children }: { children: ReactNode }) {
  const { seuils } = useSettings();
  const [raw, setRaw] = useState<RawHydroSeries | null>(null);
  const [mode, setMode] = useState<HydroMode>(loadMeta().mode);
  const [loading, setLoading] = useState(mode !== "lubi");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const meta = loadMeta();
      if (meta.mode === "lubi") {
        setLoading(false);
        return;
      }
      try {
        const stored = await idbGet<RawHydroSeries>();
        if (cancelled) return;
        if (stored) {
          setRaw(stored);
          setMode(stored.mode);
        } else {
          setMode("lubi");
          localStorage.setItem(META_KEY, JSON.stringify({ mode: "lubi", riverName: "Lubi" }));
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Lecture source externe impossible");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const bundle = useMemo<HydroBundle>(() => {
    if (mode === "lubi" || !raw) return lubiBundle();
    return buildBundleFromRaw(raw, seuils);
  }, [mode, raw, seuils]);

  const activateLubi = async () => {
    await idbClear();
    localStorage.setItem(META_KEY, JSON.stringify({ mode: "lubi", riverName: "Lubi" }));
    setRaw(null);
    setMode("lubi");
    setError(null);
  };

  const activateSeries = async (next: RawHydroSeries) => {
    await idbSet(next);
    localStorage.setItem(META_KEY, JSON.stringify({ mode: next.mode, riverName: next.riverName }));
    setRaw(next);
    setMode(next.mode);
    setError(null);
  };

  return (
    <HydroSourceContext.Provider value={{ bundle, loading, error, activateLubi, activateSeries }}>
      {children}
    </HydroSourceContext.Provider>
  );
}

export function useHydroSource(): HydroSourceValue {
  const ctx = useContext(HydroSourceContext);
  if (!ctx) throw new Error("useHydroSource must be used within HydroSourceProvider");
  return ctx;
}
