// =====================================================
// CONFIG CLIENT — Ce fichier est le SEUL à modifier
// pour livrer un nouveau salon. Ne touchez à rien d'autre.
//
// Astuce italique : dans les champs de titres, mettez
// **un mot** pour qu'il s'affiche en italique accent.
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
  // 2. CONTACT (placeholders — à personnaliser par le client)
  // ─────────────────────────────────────────────────────
  adresse:        "12 rue de la Paix",
  codePostal:     "75002",
  ville_postale:  "Paris",
  telephone:      "+33000000000",      // format international, sans espace
  telephoneSMS:   "+33000000000",      // souvent identique au téléphone
  email:          "contact@maison-lumiere.fr",

  // ─────────────────────────────────────────────────────
  // 3. RÉSEAUX SOCIAUX (URL complètes ; "" pour masquer)
  //    Placeholders — à remplacer par les vrais comptes du salon.
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
    rose:           "#EBCFC2",   // --rose : highlights clairs sur fond sombre
    roseSoft:       "#F6E2D7",   // --rose-soft : halos décoratifs
    gold:           "#C9A77C",   // --gold : esperluettes
    muted:          "#8A7E6E",   // --muted : labels secondaires
    line:           "#E0D6C8",   // --line : séparateurs
  },

  // ─────────────────────────────────────────────────────
  // 5. POLICES (Google Fonts — URL + noms à utiliser)
  // Aligné Iconique V2 : Inter only (--serif aliasé sur --sans en CSS)
  // ─────────────────────────────────────────────────────
  polices: {
    serif:           "Inter",                // aliasé sur Inter (plus de Cormorant)
    sans:            "Inter",                // texte courant
    script:          "Allura",               // signature (favicon décoratif uniquement)
    googleFontsUrl:  "https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&display=swap",
  },

  // ─────────────────────────────────────────────────────
  // 6. HERO (en haut de la home) — textes alignés Iconique V2
  // ─────────────────────────────────────────────────────
  hero: {
    eyebrow:        "Institut de beauté · Paris 2ᵉ",
    titreLigne1:    "CINQ CABINES,",
    titreLigne2:    "UNE EXIGENCE.",              // **xxx** → italique accent
    promoTexte:     "Ongles, sourcils, cils, esthétique, massages. Cinq cabines indépendantes. Protocoles courts ou en cure, sur diagnostic préalable.",
    videoMobile:    "assets/video/videoheor.mp4",
    videoDesktop:   "assets/video/videoheor.mp4",
    poster:         "assets/images/photo-1.jpg",
    boutonReserver: "RÉSERVER",
    lienDecouvrir:  "DÉCOUVRIR",
  },

  // ─────────────────────────────────────────────────────
  // 7. HISTOIRE (section À propos) — alignée Iconique V2 (section 3)
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
  // 8. PRESTATIONS (tableau extensible — 3 à 8 prestations)
  // ─────────────────────────────────────────────────────
  prestationsEyebrow: "Nos cabines",
  prestationsTitre:   "Nos **prestations.**",
  // Chaque prestation a son propre CTA Planity (planityUrl).
  // Si planityUrl est vide ou absent, le CTA pointe sur /reservation
  // (page locale qui héberge le widget Planity global).
  //
  // Descriptions alignées avec beaute-iconique (sectionFacemap.prestations)
  // — source de vérité unique pour les 3 templates beauté.
  prestations: [
    {
      nom:         "Bar à **ongles**",
      description: "Manucure russe, construction apex en gel, semi-permanent, pose Gel-X. Finition durable, repousse propre, sans agression de la matrice.",
      image:       "assets/images/nails-bar.jpg",
      planityUrl:  "",   // ex: "https://www.planity.com/maison-lumiere/nails-bar" — vide = /reservation
      cta:         "Réserver",
    },
    {
      nom:         "Bar à **sourcils**",
      description: "Restructuration au fil, teinture végétale, brow lamination, microshading. Tracé adapté à la symétrie du visage et au regard.",
      image:       "assets/images/brows-bar.jpg",
      planityUrl:  "",
      cta:         "Réserver",
    },
    {
      nom:         "Bar à **cils**",
      description: "Pose cil à cil, volume russe, hybride, rehaussement kératine. Mapping calibré à la morphologie de l'œil et à la fibre naturelle.",
      image:       "assets/images/lashes-bar.jpg",
      planityUrl:  "",
      cta:         "Réserver",
    },
    {
      nom:         "**Esthétique**",
      description: "Hydrafacial, peeling, dermaplaning, radiofréquence, LED. Protocole défini après diagnostic de la peau.",
      image:       "assets/images/photo-5.jpg",
      planityUrl:  "",
      cta:         "Réserver",
    },
    {
      nom:         "**Massages**",
      description: "Californien, balinais, deep tissue, pierres chaudes, prénatal. 60 ou 90 minutes selon le protocole. Cabines indépendantes, table chauffante.",
      image:       "assets/images/massage.jpg",
      planityUrl:  "",
      cta:         "Réserver",
    },
  ],

  // ─────────────────────────────────────────────────────
  // 9. PARTENAIRES (logos défilants)
  // ─────────────────────────────────────────────────────
  partenairesActif:    true,                                    // false pour masquer la section
  partenairesEyebrow:  "Marques pro",
  partenairesTitre:    "Marques **pro** présentes en cabine.",
  partenairesLogos: [
    "assets/images/logos/chanel.svg",
    "assets/images/logos/dior.svg",
    "assets/images/logos/givenchy.svg",
    "assets/images/logos/sothys.svg",
    "assets/images/logos/maria-galland.svg",
  ],

  // ─────────────────────────────────────────────────────
  // 10. GALERIE INSTAGRAM (widget Behold + fallback grid statique)
  //
  //  - Mode par défaut : 6 photos statiques en grid 3 cols carrée façon
  //    feed Insta (avec hover overlay likes/commentaires).
  //  - Mode live (Behold) : créer compte gratuit sur https://behold.so,
  //    connecter le compte de l'institut, copier l'ID du feed dans
  //    `beholdFeedId`. apply-config.js injecte alors automatiquement le
  //    widget qui remplace la grid statique.
  // ─────────────────────────────────────────────────────
  galerieActif:    true,                                  // false pour masquer la section
  galerieEyebrow:  "En direct de l'institut",
  galerieTitre:    "Instagram **live.**",
  galerieHandle:   "@maisonlumiere",                      // affiché sous le titre, lien vers Insta
  beholdFeedId:    "",                                    // vide = fallback grid ; ex: "x1y2z3-..."
  galeriePhotos: [
    { src: "assets/images/galerie/galerie-01.jpg", alt: "Hydrafacial — soin du visage en cours" },
    { src: "assets/images/galerie/galerie-02.jpg", alt: "Volume russe — pose d'extensions de cils" },
    { src: "assets/images/galerie/galerie-03.jpg", alt: "Brow lamination — restructuration du sourcil" },
    { src: "assets/images/galerie/galerie-04.jpg", alt: "Manucure russe — finition gel" },
    { src: "assets/images/galerie/galerie-05.jpg", alt: "Drainage lymphatique — modelage du visage" },
    { src: "assets/images/galerie/galerie-06.jpg", alt: "Microneedling — protocole peau" },
  ],

  // ─────────────────────────────────────────────────────
  // 11. AVIS (3 statiques par défaut)
  // ─────────────────────────────────────────────────────
  avisActif:          true,
  avisEyebrow:        "Elles en parlent",
  avisTitre:          "Maison Lumière vue **par ses clientes.**",
  // Placeholders alignés avec beaute-essentielle — montrent le ton à viser :
  // chaque avis nomme une durée + un effet mesurable (doctrine : preuve > merci).
  avis: [
    { texte: "Première épilation intégrale. Le diagnostic en amont a permis d'adapter la cire à ma peau réactive — aucune irritation après la séance.", auteur: "Camille L." },
    { texte: "Pose en gel sur 4 semaines, aucune retouche nécessaire avant la repousse. La finition près du contour est nette, sans débordement.", auteur: "Sarah M." },
    { texte: "Cure de trois soins visage espacés de trois semaines. Les pores de la zone T sont visiblement plus fins, la barrière cutanée tient mieux entre deux séances.", auteur: "Léa B." },
  ],

  // ─────────────────────────────────────────────────────
  // 12. HORAIRES
  // ─────────────────────────────────────────────────────
  horaires: [
    { jours: "Lundi",      heures: "11h – 18h" },
    { jours: "Mardi",      heures: "Fermé" },
    { jours: "Mer · Jeu",  heures: "11h – 19h" },
    { jours: "Ven · Sam",  heures: "10h – 19h" },
    { jours: "Dimanche",   heures: "10h – 18h" },
  ],

  // ─────────────────────────────────────────────────────
  // 13. GOOGLE MAPS — Place Vendôme, Paris (placeholder)
  //     Le client remplacera ces coordonnées par celles de son salon.
  // ─────────────────────────────────────────────────────
  mapsLatitude:         48.8694,
  mapsLongitude:        2.3315,
  mapsAdresseComplete:  "12 rue de la Paix 75002 Paris",

  // ─────────────────────────────────────────────────────
  // 14. PLANITY (réservation en ligne)
  //     Désactivé en mode template : le widget Planity nécessite une clé
  //     liée au salon réel. Le client active + colle sa clé Planity ici.
  //     Quand planityActif: false → fallback "Réservation par téléphone/SMS".
  // ─────────────────────────────────────────────────────
  planityActif:           false,
  planityKey:             "",                        // à compléter par le client (clé Planity)
  planityCouleurPrimaire: "#fff",                    // souvent #fff, sinon couleur accent

  // ─────────────────────────────────────────────────────
  // 15. MENTIONS LÉGALES
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
  // 16. SEO (titres d'onglet + meta)
  // ─────────────────────────────────────────────────────
  seo: {
    titreOnglet:        "Maison Lumière · Institut de beauté à Paris 2ᵉ",
    titreReservation:   "Réservation · Maison Lumière",
    titreMentions:      "Mentions légales · Maison Lumière",
    metaDescription:    "Institut de beauté à Paris 2ᵉ. Cinq spécialités : ongles, sourcils, cils, esthétique, massage. Cabines indépendantes, équipe diplômée.",
    ogImage:            "assets/images/photo-1.jpg",
  },

  // ─────────────────────────────────────────────────────
  // 17. LOGO + FOOTER
  // ─────────────────────────────────────────────────────
  logo:               "assets/images/logo-white.png",   // logo blanc sur fond foncé (header + footer)
  footerTagline:      "Cinq cabines, une même équipe. Paris 2ᵉ.",
  copyrightAnnee:     "2026",
};
