import type {
  AlerteItem,
  CatchmentFeature,
  Exutoire,
  JourNavigation,
  MesureHistorique,
  NavStatus,
  Port,
  Station,
  StationSeuils,
} from "./lubiData";

export type HydroMode = "lubi" | "excel" | "online";

export interface DebitClassePoint {
  q: number;
  pct: number;
}

export interface DebitClasse {
  n: number;
  q10: number;
  q50: number;
  q90: number;
  q95: number;
  qMax: number;
  qMin: number;
  points: DebitClassePoint[];
}

export interface StationSeries {
  code: string;
  nom: string;
  q: number[];
}

export interface RawHydroSeries {
  mode: Exclude<HydroMode, "lubi">;
  riverName: string;
  sourceLabel: string;
  dates: string[];
  heures: string[];
  stations: StationSeries[];
  junction: number[];
  latitude: number;
  longitude: number;
}

export interface GenericQsimRow {
  id: number;
  date: string;
  iso: string;
  heure: string;
  values: Record<string, number>;
  junction: number;
  profondeur: number;
  navigation: string;
  saison: string;
}

export interface HydroBundle {
  mode: HydroMode;
  riverName: string;
  sourceLabel: string;
  hasCatchments: boolean;
  mapCenter: { lat: number; lon: number };
  stations: Station[];
  stationCodes: string[];
  ports: Port[];
  catchments: {
    type: "FeatureCollection";
    bbox: [number, number, number, number];
    features: CatchmentFeature[];
  };
  exutoire: Exutoire | null;
  alertes: AlerteItem[];
  statsGlobales: {
    niveauMoyen: number;
    debitMoyen: number;
    profondeurMoyenne: number;
    zonesNavigables: number;
    zonesVigilance: number;
    zonesNonNavigables: number;
    alertesActives: number;
    stationsTotal: number;
    derniereMiseAJour: string;
    junctionDebit: number;
    junctionProfondeur: number;
    junctionNav: NavStatus;
    source: string;
  };
  monthlyAverages: { month: number; label: string; qMoyenne: number; profondeurMoyenne: number }[];
  debitClasse: DebitClasse;
  navigableByMonth: { date: string; year: number; month: number; jours13: number; jours15: number; jours12: number }[];
  navigableByYear: { year: number; joursNavigables: number }[];
  saisonStats: {
    pluies: {
      debitMoyen: number;
      debitMax: number;
      debitMin: number;
      profondeurMoyenne: number;
      profondeurMax: number;
      profondeurMin: number;
      joursNavigables: number;
      joursNonNavigables: number;
    };
    seche: {
      debitMoyen: number;
      debitMax: number;
      debitMin: number;
      profondeurMoyenne: number;
      profondeurMax: number;
      profondeurMin: number;
      joursNavigables: number;
      joursNonNavigables: number;
    };
  };
  DATA_PERIOD: { start: string; end: string; nDays: number };
  LAST_DATE: string;
  LAST_HEURE: string;
  FORMULE_PROFONDEUR: string;
  seuils: StationSeuils;
  getStationSeries: (code: string, lastN?: number) => MesureHistorique[];
  getCalendarDays: (year: number, monthIndex: number) => JourNavigation[];
  getQsimRows: () => GenericQsimRow[];
  tableHeaders: string[];
}

export const ONLINE_PRESETS = [
  { id: "ubangi", name: "Oubangui — Bangui", lat: 4.361, lon: 18.555 },
  { id: "congo", name: "Congo — Kinshasa", lat: -4.322, lon: 15.307 },
  { id: "kasai", name: "Kasaï — Ilebo", lat: -4.317, lon: 20.583 },
  { id: "sankuru", name: "Sankuru — Lusambo", lat: -4.968, lon: 23.443 },
] as const;
