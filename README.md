# surv-hydro-data-drc

Application web de surveillance hydrologique de la rivière Lubi (RDC) : niveaux, débits, navigation, alertes et stations de mesure.

Prototype UI issu du fichier Figma Make [Navigation Calendar Page](https://www.figma.com/make/raswCf2Q6llnBcl3AXRu6H/Navigation-Calendar-Page). Les données affichées sont des données de démonstration.

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
| Hydrologie | Évolution niveau / débit / profondeur |
| Alertes | Liste filtrable des événements |
| Historique | 30 jours et comparaison saisonnière |
| Stations | Tableau détaillé des 5 stations |
| Données | Table brute type Excel |
| Paramètres | Seuils et notifications (démo) |

## Stack

React 19, Vite, TypeScript, Tailwind CSS v4, Recharts.
