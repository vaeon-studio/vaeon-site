// =====================================================
// CONFIG CLIENT — Template Beauté Essentielle
// Le SEUL fichier à modifier pour livrer un nouveau salon.
//
// Astuce italique : dans les champs de titres, encadrer un
// mot par ** pour qu'il s'affiche en italique accent.
// Ex : "Nos **prestations.**" → Nos *prestations.*
// =====================================================

window.SITE_CONFIG = {

  // ─────────────────────────────────────────────────────
  // 1. IDENTITÉ
  // ─────────────────────────────────────────────────────
  nomCommerce:    "Maison Lumière",
  slogan:         "Cinq spécialités, une même maison.",
  typeCommerce:   "Institut de beauté",
  ville:          "Paris",
  description:    "Institut de beauté à Paris. Ongles, sourcils, cils, esthétique, massage.",

  // ─────────────────────────────────────────────────────
  // 2. CONTACT
  // ─────────────────────────────────────────────────────
  adresse:        "12 rue de la Paix",
  codePostal:     "75002",
  ville_postale:  "Paris",
  telephone:      "+33000000000",      // format international, sans espace
  telephoneSMS:   "+33000000000",      // souvent identique au téléphone
  email:          "contact@maison-lumiere.fr",

  // ─────────────────────────────────────────────────────
  // 3. RÉSEAUX SOCIAUX (URL complètes ; "" pour masquer)
  // ─────────────────────────────────────────────────────
  instagram:  "https://www.instagram.com/maisonlumiere",
  facebook:   "https://www.facebook.com/maisonlumiere",
  tiktok:     "https://www.tiktok.com/@maisonlumiere",

  // ─────────────────────────────────────────────────────
  // 4. COULEURS (variables CSS injectées dynamiquement)
  // ─────────────────────────────────────────────────────
  couleurs: {
    fond:           "#F5EFE5",   // --bg : fond principal
    fondSoft:       "#EBE2D4",   // --bg-soft : fond secondaire (sections alternées)
    fondDeep:       "#2A211C",   // --bg-deep : footer
    texte:          "#1F1A17",   // --ink : texte principal
    texteSoft:      "#3A322C",   // --ink-soft : texte paragraphe
    accent:         "#C98B7A",   // --accent : couleur signature (boutons, italiques)
    accentFonce:    "#A66B5C",   // --accent-d : accent foncé (hover éventuel)
    muted:          "#8A7E6E",   // --muted : labels secondaires
    line:           "#E0D6C8",   // --line : séparateurs
  },

  // ─────────────────────────────────────────────────────
  // 5. POLICES (Google Fonts — URL + noms à utiliser)
  // ─────────────────────────────────────────────────────
  polices: {
    serif:           "Inter",                // Inter PARTOUT — alias historique
    sans:            "Inter",                // texte courant
    googleFontsUrl:  "https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&display=swap",
  },

  // ─────────────────────────────────────────────────────
  // 6. HERO (photo statique — pas de vidéo)
  // ─────────────────────────────────────────────────────
  hero: {
    eyebrow:          "Institut de beauté · Paris 2ᵉ",
    titreLigne1:      "CINQ CABINES,",
    titreLigne2:      "UNE EXIGENCE.",
    promoTexte:       "Ongles, sourcils, cils, esthétique, massages. Cinq cabines indépendantes. Protocoles courts ou en cure, sur diagnostic préalable.",
    photoBackground:  "assets/images/hero.jpg",
    cta: {
      texte: "Réserver",
      url:   "https://www.planity.com/maison-lumiere",
    },
  },

  // ─────────────────────────────────────────────────────
  // 6bis. HISTOIRE (section méthode — alignée Signature)
  // ─────────────────────────────────────────────────────
  histoire: {
    eyebrow:    "— LA MAISON —",
    titre:      "La **méthode.**",
    intro:      "Trois principes tenus sur chaque soin. Pas de protocole standard, pas de produit générique.",
    image:      "assets/images/experience.jpg",
    piliers: [
      { tag: "Diagnostic", texte: "Chaque rendez-vous commence par un examen de la peau : phototype, sensibilité, état de la barrière cutanée." },
      { tag: "Matière",    texte: "Uniquement des marques professionnelles : formules concentrées, traçabilité complète, principes actifs nommés." },
      { tag: "Suivi",      texte: "Vos rendez-vous précédents sont consultés à chaque retour. Cures organisées en séances espacées." },
    ],
    stats: [
      { num: "5",     label: "Pôles" },
      { num: "+2000", label: "Clientes suivies" },
      { num: "4.9★",  label: "Note moyenne" },
    ],
  },

  // ─────────────────────────────────────────────────────
  // 7. PRESTATIONS (3 à 6 items — sans images)
  // ─────────────────────────────────────────────────────
  prestationsTitre: "Nos **prestations.**",
  // Descriptions alignées avec beaute-iconique (sectionFacemap.prestations) — source de vérité unique pour les 3 templates.
  prestations: [
    { numero: "01", nom: "Ongles",       description: "Manucure russe, construction apex en gel, semi-permanent, pose Gel-X. Finition durable, repousse propre, sans agression de la matrice.", image: "assets/images/prestations/nails.jpg" },
    { numero: "02", nom: "Sourcils",     description: "Restructuration au fil, teinture végétale, brow lamination, microshading. Tracé adapté à la symétrie du visage et au regard.",            image: "assets/images/prestations/brow.jpg" },
    { numero: "03", nom: "Cils",         description: "Pose cil à cil, volume russe, hybride, rehaussement kératine. Mapping calibré à la morphologie de l'œil et à la fibre naturelle.",         image: "assets/images/prestations/lash.jpg" },
    { numero: "04", nom: "Esthétique",   description: "Hydrafacial, peeling, dermaplaning, radiofréquence, LED. Protocole défini après diagnostic de la peau.",                                   image: "assets/images/prestations/esthetique.jpg" },
    { numero: "05", nom: "Massages",     description: "Californien, balinais, deep tissue, pierres chaudes, prénatal. 60 ou 90 minutes selon le protocole. Cabines indépendantes, table chauffante.", image: "assets/images/prestations/massages.jpg" },
  ],

  // ─────────────────────────────────────────────────────
  // 8. GALERIE (6 photos statiques)
  // ─────────────────────────────────────────────────────
  galerieActif:    true,
  galerieEyebrow:  "Nos cabines",
  galerieTitre:    "En **cabine.**",
  galeriePhotos: [
    { src: "assets/images/galerie/galerie-01.jpg", alt: "Hydrafacial — soin du visage en cours" },
    { src: "assets/images/galerie/galerie-02.jpg", alt: "Volume russe — pose d'extensions de cils" },
    { src: "assets/images/galerie/galerie-03.jpg", alt: "Brow lamination — restructuration du sourcil" },
    { src: "assets/images/galerie/galerie-04.jpg", alt: "Manucure russe — finition gel" },
  ],

  // ─────────────────────────────────────────────────────
  // 9. AVIS (3 statiques en grille)
  // ─────────────────────────────────────────────────────
  avisActif:    true,
  avisEyebrow:  "Elles en parlent",
  avisTitre:    "Maison Lumière vue **par ses clientes.**",
  avis: [
    { texte: "Première épilation intégrale. Le diagnostic en amont a permis d'adapter la cire à ma peau réactive — aucune irritation après la séance.", auteur: "Camille L." },
    { texte: "Pose en gel sur 4 semaines, aucune retouche nécessaire avant la repousse. La finition près du contour est nette, sans débordement.", auteur: "Sarah M." },
    { texte: "Cure de trois soins visage espacés de trois semaines. Les pores de la zone T sont visiblement plus fins, la barrière cutanée tient mieux entre deux séances.", auteur: "Léa B." },
  ],

  // ─────────────────────────────────────────────────────
  // 10. HORAIRES
  // ─────────────────────────────────────────────────────
  horaires: [
    { jours: "Lundi",      heures: "11h – 18h" },
    { jours: "Mardi",      heures: "Fermé" },
    { jours: "Mer · Jeu",  heures: "11h – 19h" },
    { jours: "Ven · Sam",  heures: "10h – 19h" },
    { jours: "Dimanche",   heures: "10h – 18h" },
  ],

  // ─────────────────────────────────────────────────────
  // 11. GOOGLE MAPS
  // ─────────────────────────────────────────────────────
  mapsLatitude:         48.8694,
  mapsLongitude:        2.3315,
  mapsAdresseComplete:  "12 rue de la Paix 75002 Paris",

  // ─────────────────────────────────────────────────────
  // 12. RÉSERVATION (lien externe — pas de page interne)
  // ─────────────────────────────────────────────────────
  reservation: {
    urlExterne: "https://www.planity.com/maison-lumiere",
  },

  // ─────────────────────────────────────────────────────
  // 13. MENTIONS LÉGALES
  // ─────────────────────────────────────────────────────
  mentionsLegales: {
    raisonSociale:        "MAISON LUMIÈRE",
    formeJuridique:       "Société par Actions Simplifiée (SAS)",
    siren:                "À COMPLÉTER",
    siret:                "À COMPLÉTER",
    tva:                  "À COMPLÉTER",
    codeApe:              "9602B — Soins de beauté",
    siegeSocial:          "12 rue de la Paix, 75002 Paris, France",
    etablissement:        "12 rue de la Paix, 75002 Paris, France",
    directeurPublication: "À compléter par le client",
    emailContact:         "contact@maison-lumiere.fr",
    domaineSite:          "maison-lumiere.fr",
    hebergeurNom:         "Vercel Inc.",
    hebergeurAdresse:     "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
    hebergeurUrl:         "https://vercel.com",
  },

  // ─────────────────────────────────────────────────────
  // 14. SEO
  // ─────────────────────────────────────────────────────
  seo: {
    titreOnglet:        "Maison Lumière · Institut de beauté à Paris 2ᵉ",
    titreMentions:      "Mentions légales · Maison Lumière",
    metaDescription:    "Institut de beauté à Paris 2ᵉ. Cinq spécialités : ongles, sourcils, cils, esthétique, massage. Cabines indépendantes, équipe diplômée.",
    ogImage:            "assets/images/hero.jpg",
  },

  // ─────────────────────────────────────────────────────
  // 15. LOGO + FOOTER
  // ─────────────────────────────────────────────────────
  logo:           "assets/images/logo-white.png",
  footerTagline:  "Cinq cabines, une même équipe. Paris 2ᵉ.",
  copyrightAnnee: "2026",
};
