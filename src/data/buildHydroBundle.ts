import type {
  AlerteItem,
  JourNavigation,
  MesureHistorique,
  NavStatus,
  Station,
  StatusLevel,
} from "./lubiData";
import { formatDateFr, fmtFr } from "./lubiData";
import type { DebitClasse, GenericQsimRow, HydroBundle, RawHydroSeries } from "./hydroTypes";

interface SeuilsNav {
  navigable: number;
  pluie: number;
  etage: number;
  critique: number;
  normal: number;
  alerte: number;
}

const Q_PER_H = 45.5;
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function profondeurFromQ(q: number): number {
  if (!Number.isFinite(q) || q <= 0) return 0;
  return Math.round((q / Q_PER_H) ** 0.6 * 1000) / 1000;
}

function saisonFromIso(iso: string): "pluies" | "seche" {
  const month = Number(iso.slice(5, 7));
  return month >= 4 && month <= 9 ? "seche" : "pluies";
}

function navOf(h: number, seuils: SeuilsNav): NavStatus {
  if (h >= seuils.navigable) return "navigable";
  if (h >= seuils.etage) return "vigilance";
  return "non-navigable";
}

function statusOf(h: number, seuils: SeuilsNav): StatusLevel {
  if (h >= seuils.normal) return "normal";
  if (h >= seuils.pluie) return "vigilance";
  if (h >= seuils.alerte) return "alerte";
  return "critique";
}

function navLabel(status: NavStatus): string {
  if (status === "navigable") return "Navigable";
  if (status === "vigilance") return "Vigilance";
  return "Non navigable";
}

function agg(pairs: { q: number; h: number }[], seuils: SeuilsNav) {
  if (!pairs.length) {
    return {
      debitMoyen: 0, debitMax: 0, debitMin: 0,
      profondeurMoyenne: 0, profondeurMax: 0, profondeurMin: 0,
      joursNavigables: 0, joursNonNavigables: 0,
    };
  }
  const qs = pairs.map((p) => p.q);
  const hs = pairs.map((p) => p.h);
  return {
    debitMoyen: Math.round((qs.reduce((a, b) => a + b, 0) / qs.length) * 10) / 10,
    debitMax: Math.round(Math.max(...qs) * 10) / 10,
    debitMin: Math.round(Math.min(...qs) * 10) / 10,
    profondeurMoyenne: Math.round((hs.reduce((a, b) => a + b, 0) / hs.length) * 100) / 100,
    profondeurMax: Math.round(Math.max(...hs) * 100) / 100,
    profondeurMin: Math.round(Math.min(...hs) * 100) / 100,
    joursNavigables: hs.filter((h) => h >= seuils.navigable).length,
    joursNonNavigables: hs.filter((h) => h < seuils.etage).length,
  };
}

function debitClasseFromQ(qs: number[]): DebitClasse {
  const sorted = qs.filter((q) => Number.isFinite(q) && q > 0).sort((a, b) => b - a);
  const n = sorted.length;
  if (!n) {
    return { n: 0, q10: 0, q50: 0, q90: 0, q95: 0, qMax: 0, qMin: 0, points: [] };
  }
  const full = sorted.map((q, i) => ({
    q: Math.round(q * 10) / 10,
    pct: Math.round(((i + 1) / n) * 100000) / 1000,
  }));
  const at = (target: number) => {
    const hit = full.find((p) => p.pct >= target);
    return hit?.q ?? full[full.length - 1].q;
  };
  const maxPts = 450;
  let points = full;
  if (full.length > maxPts) {
    const step = (full.length - 1) / (maxPts - 1);
    const idxs = new Set<number>([0, full.length - 1]);
    for (let i = 0; i < maxPts; i++) idxs.add(Math.round(i * step));
    points = [...idxs].sort((a, b) => a - b).map((i) => full[i]);
  }
  return {
    n,
    q10: at(10),
    q50: at(50),
    q90: at(90),
    q95: at(95),
    qMax: full[0].q,
    qMin: full[full.length - 1].q,
    points,
  };
}

export function buildBundleFromRaw(raw: RawHydroSeries, seuils: SeuilsNav): HydroBundle {
  const n = raw.dates.length;
  const last = Math.max(0, n - 1);
  const profondeur = raw.junction.map(profondeurFromQ);
  const navigation = profondeur.map((h) => navOf(h, seuils));
  const stationH = raw.stations.map((s) => s.q.map(profondeurFromQ));
  const stationNav = stationH.map((hs) => hs.map((h) => navOf(h, seuils)));

  const stations: Station[] = raw.stations.map((s, i) => {
    const h = stationH[i][last] ?? 0;
    const q = s.q[last] ?? 0;
    const qPrev = s.q[Math.max(0, last - 1)] ?? q;
    const hPrev = stationH[i][Math.max(0, last - 1)] ?? h;
    const code = s.code || `ST-${String(i + 1).padStart(3, "0")}`;
    const offset = (i - (raw.stations.length - 1) / 2) * 0.04;
    return {
      id: String(i + 1),
      code,
      nom: s.nom,
      zone: raw.riverName,
      excelCol: s.nom,
      latitude: raw.latitude,
      longitude: raw.longitude + offset,
      areaKm2: 0,
      catchCode: "",
      km: 0,
      debit: Math.round(q * 10) / 10,
      profondeur: h,
      niveau: h,
      vitesse: 0,
      navigation: stationNav[i][last] ?? "non-navigable",
      status: statusOf(h, seuils),
      risqueInondation: q > 250 ? "modere" : "faible",
      risqueSecheresse: h < seuils.etage ? "eleve" : h < seuils.navigable ? "modere" : "faible",
      derniereMesure: `${raw.dates[last] ?? ""} ${(raw.heures[last] ?? "00:00").slice(0, 5)}`,
      debitVariation: Math.round((q - qPrev) * 10) / 10,
      niveauVariation: Math.round((h - hPrev) * 1000) / 1000,
      seuils: { etage: seuils.etage, pluie: seuils.pluie, navigable: seuils.navigable },
      operationnelle: false,
    };
  });

  const lastH = profondeur[last] ?? 0;
  const lastQ = raw.junction[last] ?? 0;
  const lastDate = raw.dates[last] ?? "";
  const lastHeure = (raw.heures[last] ?? "00:00").slice(0, 5);
  const navCount = stations.filter((s) => s.navigation === "navigable").length;
  const vigCount = stations.filter((s) => s.navigation === "vigilance").length;

  const monthlyAverages = MONTHS.map((label, mi) => {
    const qs: number[] = [];
    const hs: number[] = [];
    for (let i = 0; i < n; i++) {
      if (Number(raw.dates[i].slice(5, 7)) === mi + 1) {
        qs.push(raw.junction[i]);
        hs.push(profondeur[i]);
      }
    }
    const qMoyenne = qs.length ? qs.reduce((a, b) => a + b, 0) / qs.length : 0;
    return {
      month: mi + 1,
      label,
      qMoyenne: Math.round(qMoyenne * 1000) / 1000,
      profondeurMoyenne: profondeurFromQ(qMoyenne),
    };
  });

  const byMonth = new Map<string, { year: number; month: number; n15: number; n12: number; n13: number }>();
  const byYear = new Map<number, number>();
  for (let i = 0; i < n; i++) {
    const iso = raw.dates[i];
    const year = Number(iso.slice(0, 4));
    const month = Number(iso.slice(5, 7));
    const key = `${year}-${month}`;
    if (!byMonth.has(key)) byMonth.set(key, { year, month, n15: 0, n12: 0, n13: 0 });
    const b = byMonth.get(key)!;
    if (profondeur[i] >= seuils.navigable) b.n15 += 1;
    if (profondeur[i] >= (seuils.navigable + seuils.etage) / 2) b.n13 += 1;
    if (profondeur[i] >= seuils.etage) b.n12 += 1;
    if (navigation[i] === "navigable") byYear.set(year, (byYear.get(year) ?? 0) + 1);
  }

  const pluie: { q: number; h: number }[] = [];
  const seche: { q: number; h: number }[] = [];
  for (let i = 0; i < n; i++) {
    const pair = { q: raw.junction[i], h: profondeur[i] };
    if (saisonFromIso(raw.dates[i]) === "pluies") pluie.push(pair);
    else seche.push(pair);
  }

  const alertes: AlerteItem[] = [];
  let nA = 1;
  for (const s of stations) {
    if (s.navigation === "non-navigable") {
      alertes.push({
        id: `X${String(nA++).padStart(3, "0")}`,
        type: "navigation",
        gravite: "critique",
        station: s.code,
        zone: s.nom,
        parametre: "Hauteur",
        valeurActuelle: s.profondeur,
        unite: "m",
        seuil: seuils.etage,
        date: formatDateFr(lastDate),
        heure: lastHeure,
        statut: "active",
        description: `Hauteur ${fmtFr(s.profondeur, 2)} m < seuil d'étiage ${seuils.etage} m (${s.nom}).`,
      });
    } else if (s.navigation === "vigilance") {
      alertes.push({
        id: `X${String(nA++).padStart(3, "0")}`,
        type: "navigation",
        gravite: "vigilance",
        station: s.code,
        zone: s.nom,
        parametre: "Hauteur",
        valeurActuelle: s.profondeur,
        unite: "m",
        seuil: seuils.navigable,
        date: formatDateFr(lastDate),
        heure: lastHeure,
        statut: "active",
        description: `Tirant ${fmtFr(s.profondeur, 2)} m sous le seuil navigable ${seuils.navigable} m (${s.nom}).`,
      });
    }
  }

  const qByCode = new Map(raw.stations.map((s) => [s.code, s.q]));
  const hByCode = new Map(raw.stations.map((s, i) => [s.code, stationH[i]]));
  const navByCode = new Map(raw.stations.map((s, i) => [s.code, stationNav[i]]));

  const getStationSeries = (code: string, lastN?: number): MesureHistorique[] => {
    const qs = code === "JUNCTION" ? raw.junction : qByCode.get(code);
    const hs = code === "JUNCTION" ? profondeur : hByCode.get(code);
    const navs = code === "JUNCTION" ? navigation : navByCode.get(code);
    if (!qs || !hs || !navs) return [];
    const start = lastN ? Math.max(0, qs.length - lastN) : 0;
    const out: MesureHistorique[] = [];
    for (let i = start; i < qs.length; i++) {
      out.push({
        date: raw.dates[i],
        niveau: hs[i],
        debit: qs[i],
        profondeur: hs[i],
        saison: saisonFromIso(raw.dates[i]),
        navigation: navs[i],
        risqueInondation: qs[i] > 250 ? "modere" : "faible",
        risqueSecheresse: hs[i] < seuils.etage ? "eleve" : hs[i] < seuils.navigable ? "modere" : "faible",
        station: code,
      });
    }
    return out;
  };

  const getCalendarDays = (year: number, monthIndex: number): JourNavigation[] => {
    const prefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}-`;
    const out: JourNavigation[] = [];
    for (let i = 0; i < n; i++) {
      if (!raw.dates[i].startsWith(prefix)) continue;
      out.push({
        date: raw.dates[i],
        status: navigation[i],
        niveau: profondeur[i],
        debit: raw.junction[i],
        profondeur: profondeur[i],
      });
    }
    return out;
  };

  const getQsimRows = (): GenericQsimRow[] =>
    raw.dates.map((iso, i) => {
      const values: Record<string, number> = { JUNCTION: raw.junction[i] };
      for (const s of raw.stations) values[s.code] = s.q[i];
      return {
        id: i + 1,
        date: formatDateFr(iso),
        iso,
        heure: (raw.heures[i] ?? "00:00").slice(0, 5),
        values,
        junction: raw.junction[i],
        profondeur: profondeur[i],
        navigation: navLabel(navigation[i]),
        saison: saisonFromIso(iso) === "pluies" ? "Saison des pluies" : "Saison sèche",
      };
    });

  const pad = 0.35;
  const bbox: [number, number, number, number] = [
    raw.longitude - pad,
    raw.latitude - pad,
    raw.longitude + pad,
    raw.latitude + pad,
  ];

  return {
    mode: raw.mode,
    riverName: raw.riverName,
    sourceLabel: raw.sourceLabel,
    hasCatchments: false,
    mapCenter: { lat: raw.latitude, lon: raw.longitude },
    stations,
    stationCodes: stations.map((s) => s.code),
    ports: [],
    catchments: { type: "FeatureCollection", bbox, features: [] },
    exutoire: {
      id: "exutoire",
      code: "EXU-001",
      nom: raw.riverName,
      zone: "Point de mesure — source externe",
      latitude: raw.latitude,
      longitude: raw.longitude,
      debit: Math.round(lastQ * 10) / 10,
      profondeur: lastH,
      navigation: navOf(lastH, seuils),
      status: statusOf(lastH, seuils),
      derniereMesure: `${lastDate} ${lastHeure}`,
    },
    alertes,
    statsGlobales: {
      niveauMoyen: lastH,
      debitMoyen: lastQ,
      profondeurMoyenne: lastH,
      zonesNavigables: navCount,
      zonesVigilance: vigCount,
      zonesNonNavigables: Math.max(0, stations.length - navCount - vigCount),
      alertesActives: alertes.filter((a) => a.statut === "active").length,
      stationsTotal: stations.length,
      derniereMiseAJour: lastDate ? `${formatDateFr(lastDate)} — ${lastHeure}` : "—",
      junctionDebit: Math.round(lastQ * 10) / 10,
      junctionProfondeur: lastH,
      junctionNav: navOf(lastH, seuils),
      source: raw.sourceLabel,
    },
    monthlyAverages,
    debitClasse: debitClasseFromQ(raw.junction),
    profondeurOverlay: null,
    navigableByMonth: [...byMonth.values()].map((b) => ({
      date: `${b.year}-${String(b.month).padStart(2, "0")}-01`,
      year: b.year,
      month: b.month,
      jours13: b.n13,
      jours15: b.n15,
      jours12: b.n12,
    })),
    navigableByYear: [...byYear.entries()].map(([year, joursNavigables]) => ({ year, joursNavigables })),
    saisonStats: { pluies: agg(pluie, seuils), seche: agg(seche, seuils) },
    DATA_PERIOD: {
      start: raw.dates[0] ?? "",
      end: lastDate,
      nDays: n,
    },
    LAST_DATE: lastDate,
    LAST_HEURE: lastHeure,
    seuils: { etage: seuils.etage, pluie: seuils.pluie, navigable: seuils.navigable },
    getStationSeries,
    getCalendarDays,
    getQsimRows,
    tableHeaders: ["Date", "Heure", ...stations.map((s) => s.nom), "Jonction", "Hauteur (m)", "Navigation", "Saison"],
  };
}
