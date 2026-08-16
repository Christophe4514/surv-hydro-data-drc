export type StatusLevel = "normal" | "vigilance" | "alerte" | "critique";
export type NavStatus = "navigable" | "vigilance" | "non-navigable";
export type RiskLevel = "faible" | "modere" | "eleve" | "critique";
export type Season = "pluies" | "seche";

function toLocalDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export interface Station {
  id: string;
  code: string;
  nom: string;
  zone: string;
  latitude: number;
  longitude: number;
  km: number;
  svgX: number;
  svgY: number;
  niveau: number;
  debit: number;
  profondeur: number;
  vitesse: number;
  navigation: NavStatus;
  risqueInondation: RiskLevel;
  risqueSecheresse: RiskLevel;
  status: StatusLevel;
  derniereMesure: string;
  seuils: {
    normal: number;
    vigilance: number;
    alerte: number;
    critique: number;
  };
  niveauVariation: number;
  debitVariation: number;
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

export const stations: Station[] = [
  {
    id: "1",
    code: "LUB-001",
    nom: "Luputa-Amont",
    zone: "Zone Nord",
    latitude: -6.82,
    longitude: 23.71,
    km: 0,
    svgX: 200,
    svgY: 60,
    niveau: 3.2,
    debit: 1250,
    profondeur: 2.8,
    vitesse: 1.2,
    navigation: "navigable",
    risqueInondation: "faible",
    risqueSecheresse: "faible",
    status: "normal",
    derniereMesure: "16/08/2026 09:45",
    seuils: { normal: 3.0, vigilance: 4.2, alerte: 5.0, critique: 6.0 },
    niveauVariation: 0.15,
    debitVariation: 8.2,
  },
  {
    id: "2",
    code: "LUB-002",
    nom: "Kaniama-Centrale",
    zone: "Zone Centre-Nord",
    latitude: -7.14,
    longitude: 24.18,
    km: 68,
    svgX: 230,
    svgY: 148,
    niveau: 3.85,
    debit: 1620,
    profondeur: 3.1,
    vitesse: 1.5,
    navigation: "navigable",
    risqueInondation: "faible",
    risqueSecheresse: "faible",
    status: "normal",
    derniereMesure: "16/08/2026 09:30",
    seuils: { normal: 3.5, vigilance: 4.5, alerte: 5.5, critique: 6.5 },
    niveauVariation: 0.22,
    debitVariation: 11.4,
  },
  {
    id: "3",
    code: "LUB-003",
    nom: "Miabi-Gorge",
    zone: "Zone Centre",
    latitude: -7.56,
    longitude: 24.05,
    km: 134,
    svgX: 215,
    svgY: 228,
    niveau: 4.45,
    debit: 2180,
    profondeur: 3.8,
    vitesse: 2.1,
    navigation: "vigilance",
    risqueInondation: "modere",
    risqueSecheresse: "faible",
    status: "vigilance",
    derniereMesure: "16/08/2026 09:15",
    seuils: { normal: 3.8, vigilance: 4.4, alerte: 5.2, critique: 6.2 },
    niveauVariation: 0.38,
    debitVariation: 19.7,
  },
  {
    id: "4",
    code: "LUB-004",
    nom: "Tshilenge-Aval",
    zone: "Zone Centre-Sud",
    latitude: -8.01,
    longitude: 23.88,
    km: 198,
    svgX: 185,
    svgY: 320,
    niveau: 2.15,
    debit: 820,
    profondeur: 1.9,
    vitesse: 0.8,
    navigation: "non-navigable",
    risqueInondation: "faible",
    risqueSecheresse: "modere",
    status: "alerte",
    derniereMesure: "16/08/2026 09:00",
    seuils: { normal: 2.8, vigilance: 1.8, alerte: 1.4, critique: 1.0 },
    niveauVariation: -0.42,
    debitVariation: -18.5,
  },
  {
    id: "5",
    code: "LUB-005",
    nom: "Kabinda-Embouchure",
    zone: "Zone Sud",
    latitude: -8.52,
    longitude: 24.48,
    km: 280,
    svgX: 240,
    svgY: 420,
    niveau: 1.62,
    debit: 590,
    profondeur: 1.4,
    vitesse: 0.5,
    navigation: "non-navigable",
    risqueInondation: "faible",
    risqueSecheresse: "eleve",
    status: "critique",
    derniereMesure: "16/08/2026 08:45",
    seuils: { normal: 2.5, vigilance: 1.8, alerte: 1.4, critique: 1.0 },
    niveauVariation: -0.65,
    debitVariation: -28.3,
  },
];

export const alertes: AlerteItem[] = [
  {
    id: "A001",
    type: "secheresse",
    gravite: "critique",
    station: "LUB-005",
    zone: "Zone Sud",
    parametre: "Niveau d'eau",
    valeurActuelle: 1.62,
    unite: "m",
    seuil: 1.8,
    date: "16/08/2026",
    heure: "08:45",
    statut: "active",
    description: "Niveau critique — risque de sécheresse sévère. Profondeur insuffisante pour navigation.",
  },
  {
    id: "A002",
    type: "navigation",
    gravite: "critique",
    station: "LUB-005",
    zone: "Zone Sud",
    parametre: "Profondeur",
    valeurActuelle: 1.4,
    unite: "m",
    seuil: 1.8,
    date: "16/08/2026",
    heure: "08:45",
    statut: "active",
    description: "Profondeur insuffisante — navigation impossible sur ce segment.",
  },
  {
    id: "A003",
    type: "secheresse",
    gravite: "alerte",
    station: "LUB-004",
    zone: "Zone Centre-Sud",
    parametre: "Niveau d'eau",
    valeurActuelle: 2.15,
    unite: "m",
    seuil: 2.8,
    date: "16/08/2026",
    heure: "09:00",
    statut: "active",
    description: "Baisse significative du niveau — surveillance renforcée requise.",
  },
  {
    id: "A004",
    type: "navigation",
    gravite: "alerte",
    station: "LUB-004",
    zone: "Zone Centre-Sud",
    parametre: "Profondeur",
    valeurActuelle: 1.9,
    unite: "m",
    seuil: 2.0,
    date: "16/08/2026",
    heure: "09:00",
    statut: "active",
    description: "Profondeur en limite de navigabilité — navigation déconseillée.",
  },
  {
    id: "A005",
    type: "debit",
    gravite: "vigilance",
    station: "LUB-003",
    zone: "Zone Centre",
    parametre: "Débit",
    valeurActuelle: 2180,
    unite: "m³/s",
    seuil: 2000,
    date: "16/08/2026",
    heure: "09:15",
    statut: "en-cours",
    description: "Débit en hausse — montée du niveau observée.",
  },
  {
    id: "A006",
    type: "inondation",
    gravite: "vigilance",
    station: "LUB-003",
    zone: "Zone Centre",
    parametre: "Niveau d'eau",
    valeurActuelle: 4.45,
    unite: "m",
    seuil: 4.4,
    date: "15/08/2026",
    heure: "18:30",
    statut: "resolue",
    description: "Niveau de vigilance atteint — surveillance activée.",
  },
  {
    id: "A007",
    type: "debit",
    gravite: "info",
    station: "LUB-001",
    zone: "Zone Nord",
    parametre: "Débit",
    valeurActuelle: 1250,
    unite: "m³/s",
    seuil: 1100,
    date: "15/08/2026",
    heure: "12:00",
    statut: "resolue",
    description: "Hausse du débit — conditions normales maintenues.",
  },
] as AlerteItem[];

function genHistorique(): MesureHistorique[] {
  const data: MesureHistorique[] = [];
  const now = new Date("2026-08-16");
  const stationCodes = ["LUB-001", "LUB-002", "LUB-003"];

  for (let d = 29; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    const dateStr = toLocalDateStr(date);
    const t = (29 - d) / 29;
    const wave = Math.sin(t * Math.PI * 2) * 0.4;
    const trend = d < 10 ? -0.03 * (10 - d) : 0;

    for (const code of stationCodes) {
      const base = code === "LUB-001" ? 3.2 : code === "LUB-002" ? 3.85 : 4.2;
      const niveau = Math.max(1.0, base + wave + trend + (Math.random() - 0.5) * 0.15);
      const debit = Math.max(200, niveau * 380 + (Math.random() - 0.5) * 80);
      const profondeur = Math.max(0.8, niveau * 0.87 + (Math.random() - 0.5) * 0.1);
      const month = date.getMonth() + 1;
      const saison: Season = month >= 4 && month <= 9 ? "seche" : "pluies";
      const nav: NavStatus = profondeur > 2.0 ? "navigable" : profondeur > 1.5 ? "vigilance" : "non-navigable";

      data.push({
        date: dateStr,
        niveau: Math.round(niveau * 100) / 100,
        debit: Math.round(debit),
        profondeur: Math.round(profondeur * 100) / 100,
        saison,
        navigation: nav,
        risqueInondation: niveau > 5.0 ? "eleve" : niveau > 4.2 ? "modere" : "faible",
        risqueSecheresse: niveau < 1.5 ? "eleve" : niveau < 2.0 ? "modere" : "faible",
        station: code,
      });
    }
  }
  return data;
}

export const historiqueData = genHistorique();

export interface JourNavigation {
  date: string;
  status: NavStatus;
  niveau: number;
  debit: number;
  profondeur: number;
  note?: string;
}

function genCalendrier(): JourNavigation[] {
  const cal: JourNavigation[] = [];
  for (let mois = 1; mois <= 8; mois++) {
    const jours = new Date(2026, mois, 0).getDate();
    for (let j = 1; j <= jours; j++) {
      const d = new Date(2026, mois - 1, j);
      const dStr = toLocalDateStr(d);
      const saison = mois >= 4 && mois <= 9;
      const base = saison ? 2.4 : 3.8;
      const noise = (Math.sin(j * 0.7 + mois * 2.1) + Math.random() - 0.5) * 0.6;
      const niveau = Math.max(0.8, base + noise);
      const debit = Math.max(150, niveau * 350 + (Math.random() - 0.5) * 60);
      const profondeur = Math.max(0.5, niveau * 0.86 + (Math.random() - 0.5) * 0.08);
      const status: NavStatus =
        profondeur >= 2.0 ? "navigable" : profondeur >= 1.5 ? "vigilance" : "non-navigable";

      const future = d > new Date("2026-08-16");
      cal.push({
        date: dStr,
        status: future ? "navigable" : status,
        niveau: Math.round(niveau * 100) / 100,
        debit: Math.round(debit),
        profondeur: Math.round(profondeur * 100) / 100,
        note: future ? "Prévision" : undefined,
      });
    }
  }
  return cal;
}

export const calendrierNavigation = genCalendrier();

export interface LigneExcel {
  id: number;
  date: string;
  heure: string;
  station: string;
  zone: string;
  niveau: number;
  debit: number;
  profondeur: number;
  saison: string;
  navigation: string;
  risqueInondation: string;
  risqueSecheresse: string;
}

export function genTableauDonnees(): LigneExcel[] {
  const rows: LigneExcel[] = [];
  let id = 1;
  const heures = ["06:00", "09:00", "12:00", "15:00", "18:00", "21:00"];
  const now = new Date("2026-08-16");

  for (let d = 6; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    const dateStr = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;

    for (const st of stations) {
      for (const h of heures) {
        const base = st.niveau;
        const noise = (Math.random() - 0.5) * 0.3;
        const niv = Math.max(0.8, base + noise);
        const debit = Math.max(100, st.debit + (Math.random() - 0.5) * 200);
        const prof = Math.max(0.5, niv * 0.87 + (Math.random() - 0.5) * 0.1);
        const nav = prof >= 2.0 ? "Navigable" : prof >= 1.5 ? "Vigilance" : "Non navigable";
        rows.push({
          id: id++,
          date: dateStr,
          heure: h,
          station: st.code,
          zone: st.zone,
          niveau: Math.round(niv * 100) / 100,
          debit: Math.round(debit),
          profondeur: Math.round(prof * 100) / 100,
          saison: "Saison sèche",
          navigation: nav,
          risqueInondation: niv > 5 ? "Élevé" : niv > 4.2 ? "Modéré" : "Faible",
          risqueSecheresse: niv < 1.5 ? "Élevé" : niv < 2.2 ? "Modéré" : "Faible",
        });
      }
    }
  }
  return rows;
}

export const tableauDonnees = genTableauDonnees();

export const etatGlobal: StatusLevel = "alerte";

export const statsGlobales = {
  niveauMoyen: 3.06,
  debitMoyen: 1292,
  profondeurMoyenne: 2.6,
  zonesNavigables: 2,
  zonesVigilance: 1,
  zonesNonNavigables: 2,
  alertesActives: 4,
  stationsTotal: 5,
  derniereMiseAJour: "16/08/2026 — 09:45",
};

export const saisonStats = {
  pluies: {
    niveauMoyen: 4.85,
    debitMoyen: 2340,
    niveauMax: 6.12,
    alertes: 12,
    joursARisque: 18,
  },
  seche: {
    niveauMoyen: 2.41,
    debitMoyen: 890,
    niveauMin: 1.42,
    alertes: 8,
    joursSecheresse: 22,
  },
};
