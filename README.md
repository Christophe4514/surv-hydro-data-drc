# surv-hydro-data-drc

Application web de surveillance hydrologique de la rivière Lubi (RDC) : niveaux, débits, navigation, alertes et stations de mesure.

Prototype UI + données réelles `Modele_Lubi1.xlsx` (Qsim 2009–2022) et bassins `Shape Lubi` (WGS84).

## Données

| Source | Usage |
| --- | --- |
| `Qsim_DEC2022` | Date, heure, débits Lubi(2), Lubi(1), Lukeshi, Bi(A), Lupaka, Junction |
| `Jour_Navigable (3)` | Jours navigables par mois (tirants 1,5 / 1,3 / 1,2 m) |
| `Qmoyennes` | Débits moyens mensuels pour les graphiques |
| `profondeur-calc` | `Q = 28×65×H^(5/3)×√0,000625` → `H = (Q/45,5)^(3/5)` |
| `Shape Lubi/` | Polygones des 5 sous-bassins (géoréférencement WGS84) |
| `Profondeur/` | GeoTIFF classé `Profondeur_class.tif` (hauteur le long du chenal) |

Régénérer les JSON : `npm run ingest` (Python + pandas + pyshp + openpyxl).

## Lancer en local

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173).

## Pages

| Page | Contenu |
| --- | --- |
| Vue générale | KPIs, graphiques, carte schématique, alertes |
| Carte de la Lubi | Stations et filtres cartographiques |
| Navigation | Conditions actuelles, calendrier, seuils |
| Hydrologie | Évolution niveau / débit / hauteur |
| Alertes | Liste filtrable des événements |
| Historique | 30 jours et comparaison saisonnière |
| Stations | Tableau détaillé des 5 stations |
| Données | Table brute type Excel |
| Paramètres | Seuils et notifications (démo) |

## Stack

React 19, Vite, TypeScript, Tailwind CSS v4, Recharts.
