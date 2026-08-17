"""Convert Modele_Lubi1.xlsx + Shape Lubi into JSON consumed by the app."""

from __future__ import annotations

import json
import math
from pathlib import Path

import pandas as pd
import shapefile

ROOT = Path(__file__).resolve().parents[1]
XLSX = ROOT / "Modele_Lubi1.xlsx"
SHP = ROOT / "Shape Lubi" / "Lubi"
PORT_SHP = ROOT / "Port Lubi" / "PORT"
PORT_CSV = ROOT / "Port Lubi" / "port.csv"
PROF_TIF = ROOT / "Profondeur" / "Profondeur_class.tif"
OUT = ROOT / "src" / "data" / "generated"
PUBLIC = ROOT / "public"

# Manning-style rating used in profondeur-calc:
# Q = 28 * 65 * H^(5/3) * sqrt(0.000625)
WIDTH_M = 28.0
K_MANNING = 65.0
SLOPE = 0.000625
Q_PER_H = WIDTH_M * K_MANNING * math.sqrt(SLOPE)  # 45.5

H_NAV = 1.5
H_PLUIE = 1.3
H_ETIAGE = 1.2

STATION_COLS = [
    ("lubi(2)", "LUB-002", "Lubi (2)"),
    ("Lubi(1)", "LUB-001", "Lubi (1)"),
    ("Lukeshi", "LUB-003", "Lukeshi"),
    ("Bi(A)", "LUB-004", "Bi (A)"),
    ("Lupaka", "LUB-005", "Lupaka"),
]

DISPLAY_NOM = {"LUB-002": "Tshangabeni"}
STATIONS_OPERATIONNELLES = {"LUB-002"}


def profondeur_from_q(q: float) -> float:
    if q is None or q <= 0 or math.isnan(q):
        return 0.0
    return round((q / Q_PER_H) ** 0.6, 3)


def nav_from_h(h: float) -> str:
    if h >= H_NAV:
        return "navigable"
    if h >= H_ETIAGE:
        return "vigilance"
    return "non-navigable"


def status_from_h(h: float) -> str:
    if h >= H_NAV:
        return "normal"
    if h >= H_PLUIE:
        return "vigilance"
    if h >= H_ETIAGE:
        return "alerte"
    return "critique"


def saison_from_month(month: int) -> str:
    return "seche" if 4 <= month <= 9 else "pluies"


def rdp(points: list[list[float]], epsilon: float) -> list[list[float]]:
    if len(points) < 3:
        return points

    def dist(p, a, b):
        ax, ay = a
        bx, by = b
        px, py = p
        dx, dy = bx - ax, by - ay
        if dx == 0 and dy == 0:
            return math.hypot(px - ax, py - ay)
        t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
        return math.hypot(px - (ax + t * dx), py - (ay + t * dy))

    max_d, idx = 0.0, 0
    for i in range(1, len(points) - 1):
        d = dist(points[i], points[0], points[-1])
        if d > max_d:
            max_d, idx = d, i
    if max_d > epsilon:
        left = rdp(points[: idx + 1], epsilon)
        right = rdp(points[idx:], epsilon)
        return left[:-1] + right
    return [points[0], points[-1]]


def ring_centroid(ring: list[list[float]]) -> tuple[float, float]:
    if len(ring) < 3:
        xs = [p[0] for p in ring]
        ys = [p[1] for p in ring]
        return (sum(xs) / len(xs), sum(ys) / len(ys)) if xs else (0.0, 0.0)
    a = cx = cy = 0.0
    for i in range(len(ring) - 1):
        x0, y0 = ring[i]
        x1, y1 = ring[i + 1]
        cross = x0 * y1 - x1 * y0
        a += cross
        cx += (x0 + x1) * cross
        cy += (y0 + y1) * cross
    if abs(a) < 1e-12:
        xs = [p[0] for p in ring]
        ys = [p[1] for p in ring]
        return sum(xs) / len(xs), sum(ys) / len(ys)
    a *= 0.5
    return cx / (6 * a), cy / (6 * a)


def load_catchments() -> dict:
    sf = shapefile.Reader(str(SHP))
    features = []
    by_name: dict[str, dict] = {}
    xmin, ymin, xmax, ymax = sf.bbox

    name_to_code = {
        "Lubi (1)": "LUB-001",
        "Lubi (2)": "LUB-002",
        "Lukeshi": "LUB-003",
        "Bi (A)": "LUB-004",
        "Lupaka": "LUB-005",
    }

    for rec, shp in zip(sf.records(), sf.shapes()):
        data = rec.as_dict()
        name = str(data.get("Name") or "").strip()
        parts = list(shp.parts) + [len(shp.points)]
        rings = []
        for i in range(len(parts) - 1):
            raw = [[float(x), float(y)] for x, y in shp.points[parts[i] : parts[i + 1]]]
            simple = rdp(raw, 0.003)
            if len(simple) >= 4:
                rings.append(simple)
        if not rings:
            continue
        lon, lat = ring_centroid(rings[0])
        props = {
            "code": name_to_code.get(name, name),
            "name": name,
            "territoire": data.get("Territoire"),
            "pays": data.get("Pays"),
            "areaKm2": round(float(data.get("Area") or 0), 1),
            "catchCode": data.get("catch_code"),
            "longitude": round(lon, 5),
            "latitude": round(lat, 5),
        }
        feat = {
            "type": "Feature",
            "properties": props,
            "geometry": {"type": "Polygon", "coordinates": rings},
        }
        features.append(feat)
        by_name[name] = props

    return {
        "type": "FeatureCollection",
        "bbox": [xmin, ymin, xmax, ymax],
        "features": features,
        "stationsMeta": by_name,
    }


def load_debit_classe() -> dict:
    """Courbe de débit classé : Q simulé décroissant vs % cumulé de dépassement."""
    xl = pd.ExcelFile(XLSX)
    name = next((n for n in xl.sheet_names if "courbe" in n.lower() and "class" in n.lower()), None)
    if name is None:
        raise SystemExit("Feuille « courbe debit classé » introuvable dans Modele_Lubi1.xlsx")

    df = pd.read_excel(XLSX, sheet_name=name, header=None)
    q = pd.to_numeric(df.iloc[1:, 0], errors="coerce")
    occ = pd.to_numeric(df.iloc[1:, 1], errors="coerce")
    pct = pd.to_numeric(df.iloc[1:, 3], errors="coerce")
    mask = q.notna() & pct.notna()
    q, occ, pct = q[mask], occ[mask], pct[mask]

    def q_at(target: float) -> float:
        i = (pct - target).abs().idxmin()
        return round(float(q.loc[i]), 1)

    full = [
        {"q": round(float(qi), 1), "pct": round(float(pi), 3)}
        for qi, pi in zip(q, pct)
    ]
    max_pts = 450
    if len(full) > max_pts:
        step = (len(full) - 1) / (max_pts - 1)
        idxs = sorted({round(i * step) for i in range(max_pts)} | {0, len(full) - 1})
        points = [full[i] for i in idxs]
    else:
        points = full

    total = df.iloc[0, 7]
    n = int(total) if pd.notna(total) else int(occ.sum())
    return {
        "n": n,
        "q10": q_at(10),
        "q50": q_at(50),
        "q90": q_at(90),
        "q95": q_at(95),
        "qMax": round(float(q.iloc[0]), 1),
        "qMin": round(float(q.iloc[-1]), 1),
        "points": points,
    }


def export_profondeur_overlay() -> dict | None:
    """GeoTIFF classé → PNG épaissi, couleurs distinctes des bassins, emprise WGS84."""
    if not PROF_TIF.exists():
        return None

    import numpy as np
    from PIL import Image, ImageFilter

    im = Image.open(PROF_TIF)
    arr = np.array(im)
    height, width = arr.shape
    tags = getattr(im, "tag_v2", {}) or {}
    scale = tags.get(33550)
    tie = tags.get(33922)
    px = float(scale[0]) if scale else 0.0000358756
    west = float(tie[3]) if tie else 23.381396157
    north = float(tie[4]) if tie else -5.23721370568
    east = west + width * px
    south = north - height * px

    step = 2
    small = arr[::step, ::step]

    def paint(value: int, rgb: tuple[int, int, int], dilate: int) -> np.ndarray:
        mask = Image.fromarray((small == value).astype(np.uint8) * 255, "L")
        if dilate >= 3:
            mask = mask.filter(ImageFilter.MaxFilter(dilate if dilate % 2 else dilate + 1))
        a = np.array(mask)
        layer = np.zeros((a.shape[0], a.shape[1], 4), dtype=np.uint8)
        layer[a > 0, 0] = rgb[0]
        layer[a > 0, 1] = rgb[1]
        layer[a > 0, 2] = rgb[2]
        layer[a > 0, 3] = 235
        return layer

    def overlay_layers(base: np.ndarray, top: np.ndarray) -> np.ndarray:
        out = base.copy()
        m = top[:, :, 3] > 0
        out[m] = top[m]
        return out

    # Classe 3 (majoritaire) puis 2 puis 1 par-dessus pour garder les hauts-fonds visibles.
    rgba = paint(255, (34, 211, 238), 17)
    rgba = overlay_layers(rgba, paint(170, (251, 191, 36), 21))
    rgba = overlay_layers(rgba, paint(85, (244, 63, 94), 25))

    PUBLIC.mkdir(exist_ok=True)
    out_png = PUBLIC / "profondeur-class.png"
    Image.fromarray(rgba, "RGBA").save(out_png, optimize=True)

    overlay = {
        "url": "/profondeur-class.png",
        "bounds": [[round(south, 6), round(west, 6)], [round(north, 6), round(east, 6)]],
        "classes": [
            {"value": 1, "label": "Hauteur faible", "color": "#f43f5e"},
            {"value": 2, "label": "Hauteur moyenne", "color": "#fbbf24"},
            {"value": 3, "label": "Hauteur élevée", "color": "#22d3ee"},
        ],
    }
    (OUT / "profondeurOverlay.json").write_text(json.dumps(overlay, ensure_ascii=False), encoding="utf-8")
    return overlay


def load_ports() -> list[dict]:
    aliases: dict[int, str] = {}
    if PORT_CSV.exists():
        import csv

        with PORT_CSV.open(encoding="utf-8-sig", newline="") as f:
            for row in csv.DictReader(f):
                try:
                    aliases[int(row["FID"])] = str(row["port_nom"]).strip()
                except (KeyError, ValueError):
                    continue

    sf = shapefile.Reader(str(PORT_SHP))
    ports = []
    for i, (rec, shp) in enumerate(zip(sf.records(), sf.shapes())):
        if not shp.points:
            continue
        data = rec.as_dict()
        name = str(data.get("Name") or "").strip()
        lon, lat = (float(shp.points[0][0]), float(shp.points[0][1]))
        is_exutoire = "TSHANGABENI" in name.upper()
        elev = data.get("Elev_MEAN")
        ports.append(
            {
                "id": f"port-{i + 1}",
                "code": f"PORT-00{i + 1}",
                "nom": aliases.get(i, name),
                "nomCourt": name,
                "role": "exutoire" if is_exutoire else "port",
                "latitude": round(lat, 5),
                "longitude": round(lon, 5),
                "bassin": str(data.get("Name_1") or "").strip(),
                "territoire": str(data.get("Territoire") or "").strip(),
                "catchCode": str(data.get("catch_code") or "").strip(),
                "altitudeM": round(float(elev), 0) if elev not in (None, "") else None,
            }
        )
    return ports


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    qsim = pd.read_excel(XLSX, sheet_name="Qsim_DEC2022")
    qsim = qsim.dropna(subset=["Junction"])
    qsim = qsim[qsim["Junction"] > 0].copy()

    dates = pd.read_excel(XLSX, sheet_name="profondeur-calc", header=None)
    date_series = pd.to_datetime(dates.iloc[1 : 1 + len(qsim), 4], errors="coerce")
    qsim = qsim.iloc[: len(date_series)].copy()
    qsim["date"] = date_series.values
    qsim = qsim.dropna(subset=["date"])
    qsim["heure"] = qsim["times"].astype(str).str.slice(0, 8).replace("nan", "00:00:00")
    qsim.loc[qsim["heure"].isin(["NaT", "None"]), "heure"] = "00:00:00"

    dates_iso = [d.strftime("%Y-%m-%d") for d in qsim["date"]]
    heures = qsim["heure"].tolist()

    series: dict[str, list[float]] = {}
    for col, code, _name in STATION_COLS:
        series[code] = [round(float(v), 1) for v in qsim[col].tolist()]

    junction = [round(float(v), 1) for v in qsim["Junction"].tolist()]
    profondeur = [profondeur_from_q(v) for v in junction]
    navigation = [nav_from_h(h) for h in profondeur]

    # station-level depth / nav from each Q
    station_h = {code: [profondeur_from_q(v) for v in qs] for code, qs in series.items()}
    station_nav = {code: [nav_from_h(h) for h in hs] for code, hs in station_h.items()}

    catchments = load_catchments()
    ports = load_ports()
    meta_by_name = catchments["stationsMeta"]

    last_i = len(dates_iso) - 1
    prev_i = max(0, last_i - 1)
    stations = []
    for col, code, name in STATION_COLS:
        geo = meta_by_name.get(name, {})
        q = series[code][last_i]
        q_prev = series[code][prev_i]
        h = station_h[code][last_i]
        nav = station_nav[code][last_i]
        stations.append(
            {
                "id": code[-1],
                "code": code,
                "nom": DISPLAY_NOM.get(code, name),
                "zone": geo.get("territoire") or "Bassin Lubi",
                "excelCol": col,
                "latitude": geo.get("latitude"),
                "longitude": geo.get("longitude"),
                "areaKm2": geo.get("areaKm2"),
                "catchCode": geo.get("catchCode"),
                "debit": q,
                "profondeur": h,
                "niveau": h,
                "vitesse": round(q / max(WIDTH_M * max(h, 0.1), 1), 2),
                "navigation": nav,
                "status": status_from_h(h),
                "risqueInondation": "modere" if q > 80 else "faible",
                "risqueSecheresse": "eleve" if h < H_ETIAGE else ("modere" if h < H_NAV else "faible"),
                "derniereMesure": f"{dates_iso[last_i]} {heures[last_i][:5]}",
                "debitVariation": round(q - q_prev, 1),
                "niveauVariation": round(h - station_h[code][prev_i], 3),
                "operationnelle": code in STATIONS_OPERATIONNELLES,
                "seuils": {
                    "etage": H_ETIAGE,
                    "pluie": H_PLUIE,
                    "navigable": H_NAV,
                },
            }
        )

    # Courbe de débit classé (FDC) — Q vs % de dépassement
    debit_classe = load_debit_classe()
    profondeur_overlay = export_profondeur_overlay()

    # Qmoyennes — 12 monthly climatology values
    qm = pd.read_excel(XLSX, sheet_name="Qmoyennes", header=None)
    monthly = []
    month_names = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
    ]
    for i in range(12):
        row = qm.iloc[1 + i]
        monthly.append(
            {
                "month": i + 1,
                "label": month_names[i],
                "qMoyenne": round(float(row[4]), 3),
                "profondeurMoyenne": profondeur_from_q(float(row[4])),
            }
        )

    # Jour_Navigable monthly counts (1.3 m, 1.5 m, 1.2 m)
    jn = pd.read_excel(XLSX, sheet_name="Jour_Navigable (3)", header=None)
    nav_months = []
    for i in range(1, len(jn)):
        d = pd.to_datetime(jn.iloc[i, 5], errors="coerce")
        if pd.isna(d):
            break
        nav_months.append(
            {
                "date": d.strftime("%Y-%m-01"),
                "year": int(d.year),
                "month": int(d.month),
                "jours13": int(jn.iloc[i, 6]) if pd.notna(jn.iloc[i, 6]) else 0,
                "jours15": int(jn.iloc[i, 7]) if pd.notna(jn.iloc[i, 7]) else 0,
                "jours12": int(jn.iloc[i, 8]) if pd.notna(jn.iloc[i, 8]) else 0,
            }
        )

    # yearly totals from sheet
    years = []
    for i in range(1, 20):
        y = jn.iloc[i, 21]
        n = jn.iloc[i, 22]
        if pd.isna(y):
            break
        years.append({"year": int(y), "joursNavigables": int(n)})

    # computed daily calendar (junction depth)
    calendar = []
    for d, q, h, nav, heure in zip(dates_iso, junction, profondeur, navigation, heures):
        calendar.append(
            {
                "date": d,
                "heure": heure,
                "debit": q,
                "profondeur": h,
                "status": nav,
            }
        )

    last_h = profondeur[last_i]
    last_q = junction[last_i]
    nav_count = sum(1 for n in station_nav.values() if n[last_i] == "navigable")
    vig_count = sum(1 for n in station_nav.values() if n[last_i] == "vigilance")
    non_count = 5 - nav_count - vig_count

    # seasonal stats from daily junction
    pluie_q, seche_q = [], []
    for d, q, h in zip(qsim["date"], junction, profondeur):
        if saison_from_month(d.month) == "pluies":
            pluie_q.append((q, h))
        else:
            seche_q.append((q, h))

    def agg(pairs):
        qs = [p[0] for p in pairs]
        hs = [p[1] for p in pairs]
        return {
            "debitMoyen": round(sum(qs) / len(qs), 1),
            "debitMax": round(max(qs), 1),
            "debitMin": round(min(qs), 1),
            "profondeurMoyenne": round(sum(hs) / len(hs), 2),
            "profondeurMax": round(max(hs), 2),
            "profondeurMin": round(min(hs), 2),
            "joursNavigables": sum(1 for h in hs if h >= H_NAV),
            "joursNonNavigables": sum(1 for h in hs if h < H_ETIAGE),
        }

    meta = {
        "source": "Modele_Lubi1.xlsx",
        "sheets": ["Qsim_DEC2022", "Jour_Navigable (3)", "Qmoyennes", "profondeur-calc", "courbe debit classé"],
        "formule": "Q = 28 × 65 × H^(5/3) × √0.000625  ⇒  H = (Q / 45.5)^(3/5)",
        "seuils": {"etage": H_ETIAGE, "pluie": H_PLUIE, "navigable": H_NAV},
        "period": {"start": dates_iso[0], "end": dates_iso[-1], "nDays": len(dates_iso)},
        "lastDate": dates_iso[last_i],
        "lastHeure": heures[last_i],
        "junctionLast": last_q,
        "profondeurLast": last_h,
        "navigationLast": nav_from_h(last_h),
        "etatGlobal": status_from_h(last_h),
        "zonesNavigables": nav_count,
        "zonesVigilance": vig_count,
        "zonesNonNavigables": non_count,
        "bbox": catchments["bbox"],
        "stations": stations,
        "ports": ports,
        "monthlyAverages": monthly,
        "navigableByMonth": nav_months,
        "navigableByYear": years,
        "saisonStats": {"pluies": agg(pluie_q), "seche": agg(seche_q)},
    }

    daily = {
        "dates": dates_iso,
        "heures": heures,
        "junction": junction,
        "profondeur": profondeur,
        "navigation": navigation,
        "stations": series,
        "stationProfondeur": station_h,
        "stationNavigation": station_nav,
    }

    (OUT / "meta.json").write_text(json.dumps(meta, ensure_ascii=False), encoding="utf-8")
    (OUT / "daily.json").write_text(json.dumps(daily, ensure_ascii=False), encoding="utf-8")
    (OUT / "catchments.json").write_text(
        json.dumps(
            {"type": "FeatureCollection", "bbox": catchments["bbox"], "features": catchments["features"]},
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    (OUT / "ports.json").write_text(json.dumps(ports, ensure_ascii=False), encoding="utf-8")
    (OUT / "debitClasse.json").write_text(json.dumps(debit_classe, ensure_ascii=False), encoding="utf-8")
    if profondeur_overlay:
        print("profondeur overlay", PUBLIC / "profondeur-class.png")

    print("wrote", OUT)
    print("days", len(dates_iso), "from", dates_iso[0], "to", dates_iso[-1])
    print("last Q", last_q, "H", last_h, nav_from_h(last_h))
    for p in OUT.iterdir():
        print(p.name, p.stat().st_size)


if __name__ == "__main__":
    main()
