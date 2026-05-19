// =====================================================
// CONFIG CLIENT — Barber Signature (Maison Faubourg)
// Ce fichier est le SEUL à modifier pour livrer un nouveau salon barber.
//
// Astuce italique : dans les champs de titres, mettez
// **un mot** pour qu'il s'affiche en italique accent.
// Ex : "Nos **prestations.**" → Nos *prestations.*
// =====================================================

window.SITE_CONFIG = {

  // ─────────────────────────────────────────────────────
  // 1. IDENTITÉ
  // ─────────────────────────────────────────────────────
  nomCommerce:    "Atelier Lazare",
  slogan:         "La lame, le geste, le temps.",
  typeCommerce:   "Atelier de barbier",
  ville:          "Paris",
  description:    "Atelier de barbier à Paris 9ᵉ. Coupe, barbe, rasage au coupe-chou, soin, coloration.",

  // ─────────────────────────────────────────────────────
  // 2. CONTACT
  // ─────────────────────────────────────────────────────
  adresse:        "28 rue Notre-Dame-de-Lorette",
  codePostal:     "75009",
  ville_postale:  "Paris",
  telephone:      "+33148780000",
  telephoneSMS:   "+33148780000",
  email:          "contact@maison-faubourg.fr",

  // ─────────────────────────────────────────────────────
  // 3. RÉSEAUX SOCIAUX
  // ─────────────────────────────────────────────────────
  instagram:  "https://www.instagram.com/maisonfaubourg",
  facebook:   "https://www.facebook.com/maisonfaubourg",
  tiktok:     "https://www.tiktok.com/@maisonfaubourg",

  // ─────────────────────────────────────────────────────
  // 4. COULEURS — palette barber Maison Faubourg
  // Charbon chaud + crème vintage + cuir tabac.
  // ─────────────────────────────────────────────────────
  couleurs: {
    fond:           "#1F1814",   // charbon chaud — fond principal
    fondSoft:       "#161210",   // brun-noir profond — fond secondaire
    fondDeep:       "#0A0807",   // noir absolu chaud — footer
    texte:          "#E8D9BC",   // crème vintage — texte principal
    texteSoft:      "#A89175",   // cuir café au lait — texte paragraphe
    accent:         "#8B2A2F",   // bordeaux / oxblood — couleur signature
    accentFonce:    "#5C1D22",   // bordeaux profond — accent foncé
    rose:           "#8B2A2F",   // alias accent
    roseSoft:       "#2A1416",   // halos bordeaux décoratifs
    gold:           "#8B2A2F",   // alias accent (couleur dorée retirée)
    muted:          "#7A6850",   // brun fumé — labels secondaires
    line:           "#3A2A2A",   // séparateurs sombres tirant sur bordeaux
  },

  // ─────────────────────────────────────────────────────
  // 5. POLICES — Playfair Display (serif) + Manrope (sans)
  // ─────────────────────────────────────────────────────
  polices: {
    serif:           "Playfair Display",
    sans:            "Manrope",
    script:          "Playfair Display",
    googleFontsUrl:  "https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap",
  },

  // ─────────────────────────────────────────────────────
  // 6. HERO
  // ─────────────────────────────────────────────────────
  hero: {
    eyebrow:        "Atelier de barbier · Paris 9ᵉ",
    titreLigne1:    "CINQ LAMES,",
    titreLigne2:    "UN MÊME ATELIER.",
    promoTexte:     "Coupe, barbe, rasage au coupe-chou, soin, coloration. Cabines fermées, ciseaux japonais, savons Truefitt & Hill. Séances à l'unité ou en abonnement, après diagnostic du cheveu et de la barbe.",
    videoMobile:    "assets/video/hero.mp4",
    videoDesktop:   "assets/video/hero.mp4",
    poster:         "assets/images/hero-photo.jpg",
    boutonReserver: "Réserver",
    lienDecouvrir:  "Découvrir l'atelier",
  },

  // ─────────────────────────────────────────────────────
  // 7. HISTOIRE (section méthode)
  // ─────────────────────────────────────────────────────
  histoire: {
    eyebrow:    "— L'ATELIER —",
    titre:      "Le **geste.**",
    intro:      "Trois règles tenues sur chaque venue. Pas de protocole standard, pas de lame jetable sur le contour.",
    image:      "assets/images/portrait-section2.jpg",
    piliers: [
      { tag: "Diagnostic", texte: "On lit la matière avant de couper. Implantation, sens du poil, état du cuir chevelu, nature du cheveu. La coupe se définit ensuite — jamais avant." },
      { tag: "Lame",       texte: "Coupe-chou Thiers Issard, ciseaux japonais Kasho, savons Truefitt & Hill, baumes Captain Fawcett. Aucune lame jetable sur les contours, aucun produit de grande surface en cabine." },
      { tag: "Suivi",      texte: "Carnet client tenu à chaque venue. Repousse anticipée, raccord posé à quatre semaines. Le même barbier reprend votre coupe d'un rendez-vous au suivant." },
    ],
    stats: [
      { num: "5",     label: "Postes" },
      { num: "+1500", label: "Clients suivis" },
      { num: "4.9★",  label: "Note moyenne" },
    ],
  },

  // ─────────────────────────────────────────────────────
  // 8. PRESTATIONS
  // ─────────────────────────────────────────────────────
  prestationsEyebrow: "Nos cabines",
  prestationsTitre:   "Nos **prestations.**",
  prestations: [
    {
      nom:         "Coupe **ciseau** & contour",
      description: "Diagnostic du cheveu, shampoing assis, coupe au ciseau japonais ou à la tondeuse, contour à la lame. Dégradé, fondu ou raccord selon la matière du cheveu.",
      image:       "assets/images/prestations/coupeciseaux.jpg",
      planityUrl:  "",
      cta:         "Réserver",
    },
    {
      nom:         "Architecture **barbe**",
      description: "Tracé travaillé à la tondeuse Wahl, finition affinée à la lame. Architecture posée à la mâchoire, aux pommettes et à l'encolure. Pas de tracé standard.",
      image:       "assets/images/prestations/barbe.jpg",
      planityUrl:  "",
      cta:         "Réserver",
    },
    {
      nom:         "Soin **visage** homme",
      description: "Vapeur, gommage, masque purifiant ou nourrissant, modelage du cuir chevelu. Protocole calé après lecture du grain de peau et de la pousse de la barbe.",
      image:       "assets/images/prestations/soins.jpg",
      planityUrl:  "",
      cta:         "Réserver",
    },
    {
      nom:         "Camouflage & **coloration**",
      description: "Camouflage progressif des cheveux blancs aux tempes, retour racine, coloration barbe au pinceau. Pose vingt minutes, démarcation lissée, rinçage assis.",
      image:       "assets/images/prestations/coloration.jpg",
      planityUrl:  "",
      cta:         "Réserver",
    },
  ],

  // ─────────────────────────────────────────────────────
  // 9. PARTENAIRES (logos défilants — déjà intégrés)
  // ─────────────────────────────────────────────────────
  partenairesActif:    true,
  partenairesEyebrow:  "Sélection cabine",
  partenairesTitre:    "Marques de barbier **sélectionnées.**",
  partenairesLogos: [
    "assets/images/logos/truefitt-and-hill.svg",
    "assets/images/logos/captain-fawcett.svg",
    "assets/images/logos/proraso.svg",
    "assets/images/logos/reuzel.svg",
    "assets/images/logos/murdock-london.svg",
  ],

  // ─────────────────────────────────────────────────────
  // 10. GALERIE INSTAGRAM (widget Behold + fallback grid statique)
  //
  //  - Mode par défaut : 6 photos statiques en grid 3 cols carrée façon
  //    feed Insta (avec hover overlay likes/commentaires).
  //  - Mode live (Behold) : créer compte gratuit sur https://behold.so,
  //    connecter @barbier, copier l'ID du feed dans `beholdFeedId`.
  //    apply-config.js injecte alors automatiquement le widget qui
  //    remplace la grid statique. Voir DUPLICATION.md.
  // ─────────────────────────────────────────────────────
  galerieActif:    true,
  galerieEyebrow:  "En direct du shop",
  galerieTitre:    "Instagram **live.**",
  galerieHandle:   "@maisonfaubourg",                     // affiché sous le titre, lien vers Insta
  beholdFeedId:    "",                                    // vide = fallback grid ; ex: "x1y2z3-..."
  galeriePhotos: [
    { src: "assets/images/galerie/galerie-01.jpg", alt: "Rasage au coupe-chou Thiers Issard" },
    { src: "assets/images/galerie/galerie-02.jpg", alt: "Dégradé tondeuse — coupe" },
    { src: "assets/images/galerie/galerie-03.jpg", alt: "Contour à la lame — barbe" },
    { src: "assets/images/galerie/galerie-04.jpg", alt: "Camouflage tempes — coloration" },
    { src: "assets/images/galerie/galerie-05.jpg", alt: "Vapeur et serviette chaude — soin" },
    { src: "assets/images/galerie/galerie-06.jpg", alt: "Ciseau japonais Kasho — coupe" },
  ],

  // ─────────────────────────────────────────────────────
  // 11. AVIS (3 statiques)
  // Doctrine §5 : un avis crédible décrit un EFFET MESURABLE,
  // pas une émotion. Pas de remerciement, pas d'adjectif vague.
  // ─────────────────────────────────────────────────────
  avisActif:          true,
  avisEyebrow:        "Ils reviennent",
  avisTitre:          "Maison Faubourg vue **par ses clients.**",
  avis: [
    { texte: "Coupe ciseau reprise tous les mois. La forme reste lisible quatre semaines, sans repousse en bordure ni casse sur les côtés.", auteur: "Hugo" },
    { texte: "Première fois au coupe-chou avec une peau qui marque vite. Test de tolérance fait avant, baume après. Aucun feu du rasoir le lendemain.", auteur: "Théo" },
    { texte: "Trois venues pour reprendre l'architecture après une barbe laissée pousser. Mâchoire dessinée, joues nettes, encolure tranchée.", auteur: "Yanis" },
  ],

  // ─────────────────────────────────────────────────────
  // 12. HORAIRES
  // ─────────────────────────────────────────────────────
  horaires: [
    { jours: "Lundi",      heures: "Fermé" },
    { jours: "Mar · Mer",  heures: "10h – 19h" },
    { jours: "Jeu · Ven",  heures: "10h – 21h" },
    { jours: "Samedi",     heures: "09h – 19h" },
    { jours: "Dimanche",   heures: "Fermé" },
  ],

  // ─────────────────────────────────────────────────────
  // 13. GOOGLE MAPS — Notre-Dame-de-Lorette, Paris 9ᵉ
  // ─────────────────────────────────────────────────────
  mapsLatitude:         48.8763,
  mapsLongitude:        2.3380,
  mapsAdresseComplete:  "28 rue Notre-Dame-de-Lorette 75009 Paris",

  // ─────────────────────────────────────────────────────
  // 14. PLANITY (réservation en ligne)
  // ─────────────────────────────────────────────────────
  planityActif:           false,
  planityKey:             "",                        // à compléter par le client
  planityCouleurPrimaire: "#B5824A",

  // ─────────────────────────────────────────────────────
  // 15. MENTIONS LÉGALES
  // ─────────────────────────────────────────────────────
  mentionsLegales: {
    raisonSociale:        "MAISON FAUBOURG",
    formeJuridique:       "Société par Actions Simplifiée (SAS)",
    siren:                "À COMPLÉTER",
    siret:                "À COMPLÉTER",
    tva:                  "À COMPLÉTER",
    codeApe:              "9602A — Coiffure",
    siegeSocial:          "28 rue Notre-Dame-de-Lorette, 75009 Paris, France",
    etablissement:        "28 rue Notre-Dame-de-Lorette, 75009 Paris, France",
    directeurPublication: "À compléter par le client",
    emailContact:         "contact@maison-faubourg.fr",
    domaineSite:          "maison-faubourg.fr",
    hebergeurNom:         "Vercel Inc.",
    hebergeurAdresse:     "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
    hebergeurUrl:         "https://vercel.com",
  },

  // ─────────────────────────────────────────────────────
  // 16. SEO
  // ─────────────────────────────────────────────────────
  seo: {
    titreOnglet:        "Maison Faubourg · Barbier à Paris 9ᵉ — coupe, barbe, rasage",
    titreReservation:   "Réservation · Maison Faubourg",
    titreMentions:      "Mentions légales · Maison Faubourg",
    metaDescription:    "Atelier de barbier à Paris 9ᵉ. Coupe, barbe, rasage au coupe-chou, soin, coloration. Cabines fermées, lames Thiers Issard, savons Truefitt & Hill.",
    ogImage:            "assets/images/hero-photo.jpg",
  },

  // ─────────────────────────────────────────────────────
  // 17. LOGO + FOOTER
  // ─────────────────────────────────────────────────────
  logo:               "",                                // TODO: logo SVG/PNG à fournir
  footerTagline:      "Cinq postes, une même main. Paris 9ᵉ.",
  copyrightAnnee:     "2026",
};
