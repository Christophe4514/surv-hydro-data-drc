import * as XLSX from "xlsx";
import type { RawHydroSeries, StationSeries } from "./hydroTypes";

function isoFromUnknown(v: unknown): string | null {
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return v.toISOString().slice(0, 10);
  }
  if (typeof v === "number" && Number.isFinite(v)) {
    const parsed = XLSX.SSF.parse_date_code(v);
    if (parsed) {
      const y = parsed.y;
      const m = String(parsed.m).padStart(2, "0");
      const d = String(parsed.d).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }
  const s = String(v ?? "").trim();
  if (!s || s === "NaT" || s === "undefined") return null;
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const fr = s.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})/);
  if (fr) return `${fr[3]}-${fr[2].padStart(2, "0")}-${fr[1].padStart(2, "0")}`;
  const dt = new Date(s);
  if (!Number.isNaN(dt.getTime()) && dt.getFullYear() > 1900) return dt.toISOString().slice(0, 10);
  return null;
}

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function slugCode(name: string, i: number): string {
  const slug = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 10);
  return slug ? `ST-${slug}` : `ST-${String(i + 1).padStart(3, "0")}`;
}

function isDateHeader(h: string): boolean {
  return /^(date|jour|day|time|times|datetime|horodatage)$/i.test(h.trim());
}

function isJunctionHeader(h: string): boolean {
  return /^(junction|jonction|total|qtotal|q_tot|debit_total|discharge)$/i.test(h.trim().replace(/\s+/g, ""));
}

function pickSheet(wb: XLSX.WorkBook): XLSX.WorkSheet {
  const preferred = wb.SheetNames.find((n) => /qsim|debit|discharge|hydro/i.test(n));
  return wb.Sheets[preferred ?? wb.SheetNames[0]];
}

export function parseExcelToSeries(
  buffer: ArrayBuffer,
  fileName: string,
  riverName: string,
  lat: number,
  lon: number,
): RawHydroSeries {
  const wb = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheet = pickSheet(wb);
  const rows = XLSX.utils.sheet_to_json<(string | number | Date)[]>(sheet, { header: 1, defval: "" });
  if (rows.length < 2) throw new Error("Le fichier Excel ne contient pas assez de lignes.");

  let headerRow = 0;
  for (let i = 0; i < Math.min(8, rows.length); i++) {
    const cells = rows[i].map((c) => String(c).trim());
    if (cells.some(isDateHeader) || cells.filter((c) => c).length >= 3) {
      headerRow = i;
      if (cells.some(isDateHeader)) break;
    }
  }

  const headers = rows[headerRow].map((c) => String(c).trim());
  let dateIdx = headers.findIndex(isDateHeader);
  if (dateIdx < 0) dateIdx = 0;

  const junctionIdx = headers.findIndex(isJunctionHeader);
  const stationIdx: { i: number; nom: string }[] = [];
  headers.forEach((h, i) => {
    if (!h || i === dateIdx || i === junctionIdx) return;
    if (/heure|hour|times/i.test(h)) return;
    stationIdx.push({ i, nom: h });
  });
  if (!stationIdx.length && junctionIdx < 0) {
    throw new Error("Aucune colonne de débit détectée. Attendu : Date + colonnes Q (m³/s).");
  }

  const dates: string[] = [];
  const heures: string[] = [];
  const stationQs: number[][] = stationIdx.map(() => []);
  const junction: number[] = [];

  for (let r = headerRow + 1; r < rows.length; r++) {
    const row = rows[r];
    const iso = isoFromUnknown(row[dateIdx]);
    if (!iso) continue;
    const qs = stationIdx.map((s) => num(row[s.i]) ?? 0);
    let j = junctionIdx >= 0 ? num(row[junctionIdx]) : null;
    if (j == null || j <= 0) j = qs.reduce((a, b) => a + b, 0);
    if (j <= 0 && qs.every((q) => q <= 0)) continue;
    dates.push(iso);
    heures.push("00:00");
    stationQs.forEach((arr, i) => arr.push(Math.round(qs[i] * 10) / 10));
    junction.push(Math.round(j * 10) / 10);
  }

  if (dates.length < 3) throw new Error("Moins de 3 jours valides dans le fichier.");

  const stations: StationSeries[] = stationIdx.length
    ? stationIdx.map((s, i) => ({ code: slugCode(s.nom, i), nom: s.nom, q: stationQs[i] }))
    : [{ code: "ST-001", nom: riverName, q: [...junction] }];

  return {
    mode: "excel",
    riverName: riverName.trim() || fileName.replace(/\.(xlsx|xls)$/i, ""),
    sourceLabel: fileName,
    dates,
    heures,
    stations,
    junction,
    latitude: lat,
    longitude: lon,
  };
}

export function parseCsvOrJson(
  text: string,
  sourceLabel: string,
  riverName: string,
  lat: number,
  lon: number,
): RawHydroSeries {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return parseJsonPayload(JSON.parse(trimmed), sourceLabel, riverName, lat, lon);
  }
  return parseCsvText(trimmed, sourceLabel, riverName, lat, lon);
}

function parseCsvText(text: string, sourceLabel: string, riverName: string, lat: number, lon: number): RawHydroSeries {
  const wb = XLSX.read(text, { type: "string" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  const parsed = parseExcelToSeries(buf, sourceLabel, riverName, lat, lon);
  parsed.mode = "online";
  parsed.sourceLabel = sourceLabel;
  return parsed;
}

function parseJsonPayload(
  payload: unknown,
  sourceLabel: string,
  riverName: string,
  lat: number,
  lon: number,
): RawHydroSeries {
  const p = payload as Record<string, unknown>;
  if (p.daily && typeof p.daily === "object") {
    const daily = p.daily as { time?: string[]; river_discharge?: number[] };
    const times = daily.time ?? [];
    const q = daily.river_discharge ?? [];
    const n = Math.min(times.length, q.length);
    const dates: string[] = [];
    const junction: number[] = [];
    for (let i = 0; i < n; i++) {
      const iso = isoFromUnknown(times[i]);
      const v = num(q[i]);
      if (!iso || v == null) continue;
      dates.push(iso);
      junction.push(Math.round(v * 10) / 10);
    }
    if (dates.length < 3) throw new Error("La réponse en ligne ne contient pas assez de débits.");
    return {
      mode: "online",
      riverName,
      sourceLabel,
      dates,
      heures: dates.map(() => "00:00"),
      stations: [{ code: "ST-001", nom: riverName, q: [...junction] }],
      junction,
      latitude: lat,
      longitude: lon,
    };
  }

  if (Array.isArray(payload)) {
    const dates: string[] = [];
    const junction: number[] = [];
    for (const row of payload) {
      const r = row as Record<string, unknown>;
      const iso = isoFromUnknown(r.date ?? r.time ?? r.jour);
      const v = num(r.q ?? r.debit ?? r.discharge ?? r.junction ?? r.value);
      if (!iso || v == null) continue;
      dates.push(iso);
      junction.push(Math.round(v * 10) / 10);
    }
    if (dates.length < 3) throw new Error("JSON : colonnes date + q/debit introuvables.");
    return {
      mode: "online",
      riverName,
      sourceLabel,
      dates,
      heures: dates.map(() => "00:00"),
      stations: [{ code: "ST-001", nom: riverName, q: [...junction] }],
      junction,
      latitude: lat,
      longitude: lon,
    };
  }

  throw new Error("Format JSON non reconnu. Attendu : Open-Meteo flood, ou [{date, q}].");
}

export async function fetchOpenMeteoFlood(lat: number, lon: number, riverName: string): Promise<RawHydroSeries> {
  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - 10);
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);
  const url =
    `https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lon}` +
    `&daily=river_discharge&start_date=${startStr}&end_date=${endStr}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
  const json = await res.json();
  return parseJsonPayload(json, `Open-Meteo GloFAS · ${lat.toFixed(3)}, ${lon.toFixed(3)}`, riverName, lat, lon);
}

export async function fetchOnlineUrl(
  url: string,
  riverName: string,
  lat: number,
  lon: number,
): Promise<RawHydroSeries> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} — la source refuse peut-être le navigateur (CORS).`);
  const text = await res.text();
  return parseCsvOrJson(text, url, riverName, lat, lon);
}
