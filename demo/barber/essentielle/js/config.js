// =====================================================
// CONFIG CLIENT — Barber Essentielle (Maison Faubourg)
// Le SEUL fichier à modifier pour livrer un nouveau salon barber.
//
// Astuce italique : dans les champs de titres, encadrer un
// mot par ** pour qu'il s'affiche en italique accent.
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
  description:    "Atelier de barbier à Paris 9ᵉ. Coupe, barbe, rasage, soin, coloration.",

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
  // Charbon chaud + crème vintage + cuir tabac (commun aux 3 templates).
  // ─────────────────────────────────────────────────────
  couleurs: {
    fond:           "#1F1814",   // charbon chaud — fond principal
    fondSoft:       "#161210",   // brun-noir profond — fond secondaire
    fondDeep:       "#0A0807",   // noir absolu chaud — footer
    texte:          "#E8D9BC",   // crème vintage — texte principal
    texteSoft:      "#A89175",   // cuir café au lait — texte paragraphe
    accent:         "#8B2A2F",   // bordeaux / oxblood — couleur signature
    accentFonce:    "#5C1D22",   // bordeaux profond — accent foncé
    muted:          "#7A6850",   // brun fumé — labels secondaires
    line:           "#3A2A2A",   // séparateurs sombres tirant sur bordeaux
  },

  // ─────────────────────────────────────────────────────
  // 5. POLICES — Playfair Display (serif) + Manrope (sans)
  // ─────────────────────────────────────────────────────
  polices: {
    serif:           "Playfair Display",
    sans:            "Manrope",
    googleFontsUrl:  "https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap",
  },

  // ─────────────────────────────────────────────────────
  // 6. HERO (photo statique — pas de vidéo)
  // ─────────────────────────────────────────────────────
  hero: {
    eyebrow:          "Atelier de barbier · Paris 9ᵉ",
    titreLigne1:      "CINQ LAMES,",
    titreLigne2:      "UN MÊME ATELIER.",
    promoTexte:       "Coupe, barbe, rasage au coupe-chou, soin, coloration. Cabines fermées, ciseaux japonais. Séances à l'unité ou en abonnement, après diagnostic.",
    photoBackground:  "assets/images/hero.jpg",
    cta: {
      texte: "Réserver",
      url:   "https://www.planity.com/maison-faubourg",
    },
  },

  // ─────────────────────────────────────────────────────
  // 6bis. HISTOIRE (section méthode)
  // ─────────────────────────────────────────────────────
  histoire: {
    eyebrow:    "— L'ATELIER —",
    titre:      "Le **geste.**",
    intro:      "Trois règles tenues sur chaque venue. Pas de protocole standard, pas de lame jetable sur le contour.",
    image:      "assets/images/experience.jpg",
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
  // 7. PRESTATIONS
  // ─────────────────────────────────────────────────────
  prestationsTitre: "Nos **prestations.**",
  prestations: [
    { numero: "01", nom: "Coupe ciseau",       description: "Diagnostic du cheveu, shampoing assis, coupe au ciseau japonais ou à la tondeuse, contour à la lame. Dégradé, fondu ou raccord selon la matière du cheveu.", image: "assets/images/prestations/coupeciseaux.jpg" },
    { numero: "02", nom: "Architecture barbe", description: "Tracé travaillé à la tondeuse Wahl, finition affinée à la lame. Architecture posée à la mâchoire, aux pommettes et à l'encolure. Pas de tracé standard.",            image: "assets/images/prestations/barbe.jpg" },
    { numero: "03", nom: "Soin visage",        description: "Vapeur, gommage, masque purifiant ou nourrissant, modelage du cuir chevelu. Protocole calé après lecture du grain de peau et de la pousse de la barbe.",        image: "assets/images/prestations/soins.jpg" },
    { numero: "04", nom: "Coloration",         description: "Camouflage progressif des cheveux blancs aux tempes, retour racine, coloration barbe au pinceau. Pose vingt minutes, démarcation lissée, rinçage assis.",       image: "assets/images/prestations/coloration.jpg" },
  ],

  // ─────────────────────────────────────────────────────
  // 8. GALERIE (4 photos statiques — version essentielle)
  // ─────────────────────────────────────────────────────
  galerieActif:    true,
  galerieEyebrow:  "Dans la cabine",
  galerieTitre:    "En **coupe.**",
  galeriePhotos: [
    { src: "assets/images/galerie/galerie-01.jpg", alt: "Rasage au coupe-chou Thiers Issard" },
    { src: "assets/images/galerie/galerie-02.jpg", alt: "Dégradé tondeuse — coupe" },
    { src: "assets/images/galerie/galerie-03.jpg", alt: "Contour à la lame — barbe" },
    { src: "assets/images/galerie/galerie-04.jpg", alt: "Camouflage tempes — coloration" },
  ],

  // ─────────────────────────────────────────────────────
  // 9. AVIS (3 statiques en grille)
  // Doctrine §5 : un avis crédible décrit un EFFET MESURABLE.
  // ─────────────────────────────────────────────────────
  avisActif:    true,
  avisEyebrow:  "Ils reviennent",
  avisTitre:    "Maison Faubourg vue **par ses clients.**",
  avis: [
    { texte: "Coupe ciseau reprise tous les mois. La forme reste lisible quatre semaines, sans repousse en bordure ni casse sur les côtés.", auteur: "Hugo" },
    { texte: "Première fois au coupe-chou avec une peau qui marque vite. Test de tolérance fait avant, baume après. Aucun feu du rasoir le lendemain.", auteur: "Théo" },
    { texte: "Trois venues pour reprendre l'architecture après une barbe laissée pousser. Mâchoire dessinée, joues nettes, encolure tranchée.", auteur: "Yanis" },
  ],

  // ─────────────────────────────────────────────────────
  // 10. HORAIRES
  // ─────────────────────────────────────────────────────
  horaires: [
    { jours: "Lundi",      heures: "Fermé" },
    { jours: "Mar · Mer",  heures: "10h – 19h" },
    { jours: "Jeu · Ven",  heures: "10h – 21h" },
    { jours: "Samedi",     heures: "09h – 19h" },
    { jours: "Dimanche",   heures: "Fermé" },
  ],

  // ─────────────────────────────────────────────────────
  // 11. GOOGLE MAPS — Notre-Dame-de-Lorette, Paris 9ᵉ
  // ─────────────────────────────────────────────────────
  mapsLatitude:         48.8763,
  mapsLongitude:        2.3380,
  mapsAdresseComplete:  "28 rue Notre-Dame-de-Lorette 75009 Paris",

  // ─────────────────────────────────────────────────────
  // 12. RÉSERVATION (lien externe — pas de page interne)
  // ─────────────────────────────────────────────────────
  reservation: {
    urlExterne: "https://www.planity.com/maison-faubourg",
  },

  // ─────────────────────────────────────────────────────
  // 13. MENTIONS LÉGALES
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
  // 14. SEO
  // ─────────────────────────────────────────────────────
  seo: {
    titreOnglet:        "Maison Faubourg · Barbier à Paris 9ᵉ — coupe, barbe, rasage",
    titreMentions:      "Mentions légales · Maison Faubourg",
    metaDescription:    "Atelier de barbier à Paris 9ᵉ. Coupe, barbe, rasage au coupe-chou, soin, coloration. Cabines fermées, lames Thiers Issard, savons Truefitt & Hill.",
    ogImage:            "assets/images/hero.jpg",
  },

  // ─────────────────────────────────────────────────────
  // 15. LOGO + FOOTER
  // ─────────────────────────────────────────────────────
  logo:           "",                                    // TODO: logo SVG/PNG à fournir
  footerTagline:  "Cinq postes, une même main. Paris 9ᵉ.",
  copyrightAnnee: "2026",
};
