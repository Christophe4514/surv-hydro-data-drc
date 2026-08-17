export interface TerritoirePhoto {
  src: string;
  alt: string;
  caption: string;
}

export const TERRITOIRE_FAITS = [
  { label: "Superficie", value: "12 572,57 km²" },
  { label: "Périmètre", value: "≈ 1 250 km" },
  { label: "Longueur", value: "1 249,884 km" },
  { label: "Latitude", value: "4°59′09,6″S – 5°02′41,6″S" },
  { label: "Longitude", value: "23°25′55,29″E – 23°34′03,29″E" },
  { label: "Port actif", value: "Ndomba · 2021" },
] as const;

export const TERRITOIRE_PARAGRAPHES = [
  "La rivière Lubi traverse les provinces du Kasaï Oriental, du Sankuru et du Kasaï Central, en République démocratique du Congo, entre 4°59′09,6″ et 5°02′41,6″ de latitude Sud, et 23°25′55,29″ et 23°34′03,29″ de longitude Est. Ce bassin couvre une superficie d’environ 12 572,57 km², pour un périmètre de l’ordre de 1 250 km et une longueur de 1 249,884 km.",
  "Sur le plan géologique, le sous-sol n’est pas homogène : le bassin de la Lubi est calcareux. La région se situe entièrement au sud de l’équateur. Selon la classification de Köppen, deux climats s’y côtoient : un climat équatorial à l’extrême nord-ouest, sans saison sèche, et un climat subéquatorial au centre et dans toute la partie sud, où la saison sèche dure de trois à quatre mois.",
  "La Lubi est une voie stratégique pour le désenclavement du Grand Kasaï. Plusieurs infrastructures portuaires existent, mais elles sont presque inactives à cause de l’ensablement. Seul le port de Ndomba, à Kabeya-Kamwanga, reste plus actif ; il a bénéficié d’une modernisation en 2021. La population de la zone d’étude vit dans des conditions précaires, avec une économie largement informelle et, pour l’heure, sans industries. L’agriculture itinérante sur brûlis provoque la déforestation (COGERNA, 2015), tandis que l’exploitation artisanale des gisements de diamant accélère la sédimentation en aval.",
];

export const TERRITOIRE_PHOTOS: TerritoirePhoto[] = [
  {
    src: "/territoire/image1.jpg",
    alt: "Chenal de la Lubi, eau turbide et banc de sable",
    caption: "Chenal de la Lubi : eau très turbide et banc de sable. L’ensablement gêne la navigation.",
  },
  {
    src: "/territoire/image2.jpg",
    alt: "Barge Lubunga à quai",
    caption: "Barge Lubunga à quai : transport fluvial encore actif malgré un chenal chargé de sédiments.",
  },
  {
    src: "/territoire/image3.jpg",
    alt: "Banc de sable au milieu du chenal",
    caption: "Banc de sable au milieu du chenal — obstacle typique pour les embarcations.",
  },
  {
    src: "/territoire/image4.jpg",
    alt: "Érosion des berges de la Lubi",
    caption: "Érosion des berges : les arbres tombés dans le lit alimentent les obstacles à la navigation.",
  },
  {
    src: "/territoire/image5.jpg",
    alt: "Chargement manuel au débarcadère",
    caption: "Activité portuaire : chargement manuel de sacs, bâche et camion — économie informelle du Grand Kasaï.",
  },
  {
    src: "/territoire/image6.jpg",
    alt: "Échelle limnimétrique dans la Lubi",
    caption: "Échelle limnimétrique pour le suivi de la hauteur d’eau. L’eau brune traduit une forte charge sédimentaire.",
  },
  {
    src: "/territoire/image7.jpg",
    alt: "Chaland de marchandises et pirogue",
    caption: "Chaland de marchandises et pirogue : la Lubi reste un axe de désenclavement.",
  },
  {
    src: "/territoire/image8.jpg",
    alt: "Barges de passagers et pirogues",
    caption: "Transport de passagers : barges bondées et pirogues au débarcadère.",
  },
  {
    src: "/territoire/image9.jpg",
    alt: "Souche et berge cultivée",
    caption: "Berge cultivée et souche dans le lit : agriculture sur brûlis et obstacles dans le chenal.",
  },
  {
    src: "/territoire/image10.jpg",
    alt: "Embarcation chargée en difficulté dans les bas-fonds",
    caption: "Embarcation chargée en difficulté dans les bas-fonds — illustration de l’ensablement.",
  },
];
