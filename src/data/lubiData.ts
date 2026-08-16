import metaJson from "./generated/meta.json";
import dailyJson from "./generated/daily.json";
import catchmentsJson from "./generated/catchments.json";

export type StatusLevel = "normal" | "vigilance" | "alerte" | "critique";
export type NavStatus = "navigable" | "vigilance" | "non-navigable";
export type RiskLevel = "faible" | "modere" | "eleve" | "critique";
export type Season = "pluies" | "seche";

export interface StationSeuils {
  etage: number;
  pluie: number;
  navigable: number;
}

export interface Station {
  id: string;
  code: string;
  nom: string;
  zone: string;
  excelCol: string;
  latitude: number;
  longitude: number;
  areaKm2: number;
  catchCode: string;
  km: number;
  debit: number;
  profondeur: number;
  niveau: number;
  vitesse: number;
  navigation: NavStatus;
  status: StatusLevel;
  risqueInondation: RiskLevel;
  risqueSecheresse: RiskLevel;
  derniereMesure: string;
  debitVariation: number;
  niveauVariation: number;
  seuils: StationSeuils;
}

export interface AlerteItem {
  id: string;
  type: "inondation" | "secheresse" | "navigation" | "debit";
  gravite: StatusLevel | "info";
  station: string;
  zone: string;
  parametre: string;
  valeurActuelle: number;
  unite: string;
  seuil: number;
  date: string;
  heure: string;
  statut: "active" | "resolue" | "en-cours";
  description: string;
}

export interface MesureHistorique {
  date: string;
  niveau: number;
  debit: number;
  profondeur: number;
  saison: Season;
  navigation: NavStatus;
  risqueInondation: RiskLevel;
  risqueSecheresse: RiskLevel;
  station: string;
}

export interface JourNavigation {
  date: string;
  status: NavStatus;
  niveau: number;
  debit: number;
  profondeur: number;
  note?: string;
}

export interface CatchmentFeature {
  type: "Feature";
  properties: {
    code: string;
    name: string;
    territoire: string;
    pays: string;
    areaKm2: number;
    catchCode: string;
    longitude: number;
    latitude: number;
  };
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

type DailyFile = {
  dates: string[];
  heures: string[];
  junction: number[];
  profondeur: number[];
  navigation: NavStatus[];
  stations: Record<string, number[]>;
  stationProfondeur: Record<string, number[]>;
  stationNavigation: Record<string, NavStatus[]>;
};

const daily = dailyJson as DailyFile;
const meta = metaJson;

export const FORMULE_PROFONDEUR = meta.formule;
export const SEUILS_NAV = meta.seuils as StationSeuils;
export const DATA_PERIOD = meta.period as { start: string; end: string; nDays: number };
export const LAST_DATE = meta.lastDate as string;
export const LAST_HEURE = (meta.lastHeure as string).slice(0, 5);

export const catchments = catchmentsJson as {
  type: "FeatureCollection";
  bbox: [number, number, number, number];
  features: CatchmentFeature[];
};

function northernmostVertex(features: CatchmentFeature[]): { longitude: number; latitude: number } {
  let longitude = 0;
  let latitude = -90;
  for (const f of features) {
    for (const ring of f.geometry.coordinates) {
      for (const [lon, lat] of ring) {
        if (lat > latitude) {
          latitude = lat;
          longitude = lon;
        }
      }
    }
  }
  return {
    longitude: Math.round(longitude * 1e5) / 1e5,
    latitude: Math.round(latitude * 1e5) / 1e5,
  };
}

export interface Exutoire {
  id: string;
  code: string;
  nom: string;
  zone: string;
  latitude: number;
  longitude: number;
  debit: number;
  profondeur: number;
  navigation: NavStatus;
  status: StatusLevel;
  derniereMesure: string;
}

/** Pourpoint du bassin (pointe nord) — confluence Lubi / Sankuru. */
export const exutoire: Exutoire = {
  id: "exutoire",
  code: "EXU-001",
  nom: "Port Tshangabeni",
  zone: "Exutoire — confluence Lubi / Sankuru",
  ...northernmostVertex(catchments.features),
  debit: meta.junctionLast as number,
  profondeur: meta.profondeurLast as number,
  navigation: meta.navigationLast as NavStatus,
  status: meta.etatGlobal as StatusLevel,
  derniereMesure: `${LAST_DATE} ${LAST_HEURE}`,
};

export const monthlyAverages = meta.monthlyAverages as {
  month: number;
  label: string;
  qMoyenne: number;
  profondeurMoyenne: number;
}[];

export const navigableByMonth = meta.navigableByMonth as {
  date: string;
  year: number;
  month: number;
  jours13: number;
  jours15: number;
  jours12: number;
}[];

export const navigableByYear = meta.navigableByYear as {
  year: number;
  joursNavigables: number;
}[];

const codeOrder = ["LUB-001", "LUB-002", "LUB-003", "LUB-004", "LUB-005"];

export const stations: Station[] = [...(meta.stations as Station[])]
  .map((s) => ({
    ...s,
    km: Math.round(((s.latitude + 7.44) / (7.44 - 4.98)) * 280),
    seuils: s.seuils ?? SEUILS_NAV,
  }))
  .sort((a, b) => codeOrder.indexOf(a.code) - codeOrder.indexOf(b.code));

export const stationCodes = stations.map((s) => s.code);

export const etatGlobal = meta.etatGlobal as StatusLevel;

export const statsGlobales = {
  niveauMoyen: meta.profondeurLast as number,
  debitMoyen: meta.junctionLast as number,
  profondeurMoyenne: meta.profondeurLast as number,
  zonesNavigables: meta.zonesNavigables as number,
  zonesVigilance: meta.zonesVigilance as number,
  zonesNonNavigables: meta.zonesNonNavigables as number,
  alertesActives: 0,
  stationsTotal: stations.length,
  derniereMiseAJour: `${formatDateFr(LAST_DATE)} — ${LAST_HEURE}`,
  junctionDebit: meta.junctionLast as number,
  junctionProfondeur: meta.profondeurLast as number,
  junctionNav: meta.navigationLast as NavStatus,
  source: meta.source as string,
};

export const saisonStats = meta.saisonStats as {
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

export function formatDateFr(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function fmtFr(n: number, digits = 1): string {
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function saisonFromIso(iso: string): Season {
  const month = Number(iso.slice(5, 7));
  return month >= 4 && month <= 9 ? "seche" : "pluies";
}

function navLabel(status: NavStatus): string {
  if (status === "navigable") return "Navigable";
  if (status === "vigilance") return "Vigilance";
  return "Non navigable";
}

export function getDailyLength(): number {
  return daily.dates.length;
}

export function getStationSeries(code: string, lastN?: number): MesureHistorique[] {
  const qs = code === "JUNCTION" ? daily.junction : daily.stations[code];
  const hs = code === "JUNCTION" ? daily.profondeur : daily.stationProfondeur[code];
  const navs = code === "JUNCTION" ? daily.navigation : daily.stationNavigation[code];
  if (!qs || !hs || !navs) return [];
  const start = lastN ? Math.max(0, qs.length - lastN) : 0;
  const out: MesureHistorique[] = [];
  for (let i = start; i < qs.length; i++) {
    const h = hs[i];
    out.push({
      date: daily.dates[i],
      niveau: h,
      debit: qs[i],
      profondeur: h,
      saison: saisonFromIso(daily.dates[i]),
      navigation: navs[i],
      risqueInondation: qs[i] > 250 ? "modere" : "faible",
      risqueSecheresse: h < SEUILS_NAV.etage ? "eleve" : h < SEUILS_NAV.navigable ? "modere" : "faible",
      station: code,
    });
  }
  return out;
}

export function getCalendarDays(year: number, monthIndex: number): JourNavigation[] {
  const prefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}-`;
  const out: JourNavigation[] = [];
  for (let i = 0; i < daily.dates.length; i++) {
    if (!daily.dates[i].startsWith(prefix)) continue;
    out.push({
      date: daily.dates[i],
      status: daily.navigation[i],
      niveau: daily.profondeur[i],
      debit: daily.junction[i],
      profondeur: daily.profondeur[i],
    });
  }
  return out;
}

export interface LigneQsim {
  id: number;
  date: string;
  iso: string;
  heure: string;
  lubi2: number;
  lubi1: number;
  lukeshi: number;
  bia: number;
  lupaka: number;
  junction: number;
  profondeur: number;
  navigation: string;
  saison: string;
}

export function getQsimRows(): LigneQsim[] {
  return daily.dates.map((iso, i) => ({
    id: i + 1,
    date: formatDateFr(iso),
    iso,
    heure: daily.heures[i].slice(0, 5),
    lubi2: daily.stations["LUB-002"][i],
    lubi1: daily.stations["LUB-001"][i],
    lukeshi: daily.stations["LUB-003"][i],
    bia: daily.stations["LUB-004"][i],
    lupaka: daily.stations["LUB-005"][i],
    junction: daily.junction[i],
    profondeur: daily.profondeur[i],
    navigation: navLabel(daily.navigation[i]),
    saison: saisonFromIso(iso) === "pluies" ? "Saison des pluies" : "Saison sèche",
  }));
}

function buildAlertes(): AlerteItem[] {
  const items: AlerteItem[] = [];
  let n = 1;
  const date = formatDateFr(LAST_DATE);
  const heure = LAST_HEURE;
  for (const s of stations) {
    if (s.navigation === "non-navigable") {
      items.push({
        id: `A${String(n++).padStart(3, "0")}`,
        type: "navigation",
        gravite: "critique",
        station: s.code,
        zone: s.nom,
        parametre: "Profondeur",
        valeurActuelle: s.profondeur,
        unite: "m",
        seuil: SEUILS_NAV.etage,
        date,
        heure,
        statut: "active",
        description: `Profondeur ${fmtFr(s.profondeur, 2)} m < seuil d'étiage ${SEUILS_NAV.etage} m — navigation impossible (${s.nom}).`,
      });
      items.push({
        id: `A${String(n++).padStart(3, "0")}`,
        type: "secheresse",
        gravite: "alerte",
        station: s.code,
        zone: s.nom,
        parametre: "Débit",
        valeurActuelle: s.debit,
        unite: "m³/s",
        seuil: 61.7,
        date,
        heure,
        statut: "active",
        description: `Débit simulé ${fmtFr(s.debit, 1)} m³/s insuffisant pour un tirant de ${SEUILS_NAV.etage} m.`,
      });
    } else if (s.navigation === "vigilance") {
      items.push({
        id: `A${String(n++).padStart(3, "0")}`,
        type: "navigation",
        gravite: "vigilance",
        station: s.code,
        zone: s.nom,
        parametre: "Profondeur",
        valeurActuelle: s.profondeur,
        unite: "m",
        seuil: SEUILS_NAV.navigable,
        date,
        heure,
        statut: "active",
        description: `Tirant ${fmtFr(s.profondeur, 2)} m — navigable en étiage (1,2 m) mais sous le seuil 1,5 m (${s.nom}).`,
      });
    }
  }
  return items;
}

export const alertes = buildAlertes();
statsGlobales.alertesActives = alertes.filter((a) => a.statut === "active").length;

export const dailyDates = daily.dates;
export const dailyHeures = daily.heures;
export const dailyJunction = daily.junction;
export const dailyProfondeur = daily.profondeur;
export const dailyNavigation = daily.navigation;
export const dailyStationQ = daily.stations;
export const dailyStationH = daily.stationProfondeur;
export const dailyStationNav = daily.stationNavigation;

export const Q_SEUIL_ETIAGE = 61.7;
export const Q_SEUIL_PLUIE = 70.5;
export const Q_SEUIL_NAV = 89.4;
