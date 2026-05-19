// =====================================================
// CONFIG CLIENT — Barber Iconique (Maison Faubourg)
// Le SEUL fichier à modifier pour personnaliser.
//
// Sections présentes (structure identique au beaute-iconique) :
//   - Hero (split / photo, scroll-driven, mix-blend-mode title)
//   - Header smart-contrast (transparent, change de couleur selon
//     le data-theme de la section visible)
//   - Section 2 (titre éclaté + portrait qui dépasse, layout magazine)
//   - Section Méthode (3 piliers : Diagnostic / Lame / Suivi)
//   - Facemap interactive (5 prestations sur portrait homme)
//   - Marques pro défilantes
//   - Avis clients (3 colonnes)
//   - Galerie révélation (spotlight + zoom)
//   - Footer 3 colonnes
//
// Doctrine éditoriale : voir DOCTRINE-BARBER.md
// =====================================================

window.SITE_CONFIG = {

  // ─────────────────────────────────────────────────────
  // IDENTITÉ
  // ─────────────────────────────────────────────────────
  nomMarque:    "MAISON FAUBOURG",                 // logo center header (lettres espacées)
  nomCommerce:  "Maison Faubourg",                 // pour identité
  slogan:       "La lame, le geste, le temps.",

  // ─────────────────────────────────────────────────────
  // SEO — balises servies à Google et aux LLM (AISO)
  // Title ≤ 60 c. · Description ≤ 160 c. (au-delà, Google coupe).
  // Le HTML statique reste la source de vérité (lu avant tout JS).
  // apply-config.js sync ces valeurs au runtime pour cohérence.
  // ─────────────────────────────────────────────────────
  seo: {
    title:       "Maison Faubourg · Barbier à Paris 9ᵉ — coupe, barbe, rasage",
    description: "Atelier de barbier à Paris 9ᵉ. Coupe, barbe, rasage au coupe-chou, soin, coloration. Cabines fermées, lames Thiers Issard, savons Truefitt & Hill.",
  },

  // ─────────────────────────────────────────────────────
  // HEADER (smart-contrast)
  // ─────────────────────────────────────────────────────
  header: {
    logoTexte:     "MAISON FAUBOURG",
    ctaTexte:      "PRENDRE RENDEZ-VOUS",
    ctaAction:     "reservation/",          // page de réservation interne (sous-dossier)
    smartContrast: true,                    // change de couleur selon data-theme de la section visible
    blurAuScroll:  true,                    // backdrop blur léger quand scroll > 100px
  },

  // ─────────────────────────────────────────────────────
  // HERO — section principale (split / photo)
  // ─────────────────────────────────────────────────────
  hero: {
    eyebrowNumero:        "001",
    eyebrowMarque:        "ATELIER",
    titre:                "Coupe, barbe, rasage. Cinq postes en cabine fermée.",
    sousTitre:            "",   // désactivé — le titre suffit (doctrine : le luxe respire)
    description:          "Cinq cabines fermées. Coupe-chou Thiers Issard, savons Truefitt & Hill, ciseaux japonais. Séances à l'unité ou en abonnement, après diagnostic du cheveu et de la barbe.",
    photoPath:            "assets/images/hero-photo.jpg",
    photoAlt:             "Coupe-chou en main du barbier — préparation au rasage",
    scrollIndicatorTexte: "DESCENDRE",
    ctaTexte:             "PRENDRE RENDEZ-VOUS",  // utilisé aussi par le header
    ctaAction:            "#contact",
  },

  // ─────────────────────────────────────────────────────
  // SECTION 2 — Titre éclaté magazine
  // Le titre est éclaté en plusieurs mots avec styles alternés.
  // ─────────────────────────────────────────────────────
  sectionPersonalise: {
    actif:        true,

    titreLignes: [
      { mot: "CINQ",     style: "fill" },
      { mot: "lames,",   style: "italic-small", suiteLigne: true },
      { mot: "UN",       style: "fill" },
      { mot: "même",     style: "italic-small", suiteLigne: true, insererPortraitApres: true },
      { mot: "ATELIER",  style: "fill" },
    ],

    portraitPath: "assets/images/portrait-section2.jpg",
    portraitAlt:  "Portrait barbier — Maison Faubourg",

    description:  "Diagnostic en début de séance. La coupe se lit à la matière du cheveu. La barbe se taille au sens du poil. Le même barbier vous suit d'une fois sur l'autre.",
  },

  // ─────────────────────────────────────────────────────
  // SECTION 3 — L'EXPÉRIENCE MAISON FAUBOURG
  // - Titre central énorme en majuscules sans-serif light
  // - 3 piliers en colonnes (Diagnostic / Lame / Suivi)
  // - 2 photos sépia latérales animées en scrub
  // ─────────────────────────────────────────────────────
  sectionExperience: {
    actif:           true,
    marque:          "— L'ATELIER —",
    titre:           "LE",
    titreSousLigne:  "GESTE",
    sousTitre:       "Trois règles tenues sur chaque venue. Pas de protocole standard, pas de lame jetable sur le contour.",

    raisons: [
      {
        titre: "Diagnostic",
        texte: "On lit la matière avant de couper. Implantation, sens du poil, état du cuir chevelu, nature du cheveu. La coupe se définit ensuite — jamais avant.",
      },
      {
        titre: "Lame",
        texte: "Coupe-chou Thiers Issard, ciseaux japonais Kasho, savons Truefitt & Hill, baumes Captain Fawcett. Aucune lame jetable sur les contours, aucun produit de grande surface en cabine.",
      },
      {
        titre: "Suivi",
        texte: "Carnet client tenu à chaque venue. Repousse anticipée, raccord posé à quatre semaines. Le même barbier reprend votre coupe d'un rendez-vous au suivant.",
      },
    ],

    // Photos sépia latérales (animation scrub au scroll)
    photoLeft:     "assets/images/experience-left.jpg",
    photoLeftAlt:  "Détail rasage au coupe-chou",
    photoRight:    "assets/images/experience-right.jpg",
    photoRightAlt: "Coupe ciseau — finition",
  },

  // ─────────────────────────────────────────────────────
  // SECTION 4 — INTERACTIVE FACE MAP
  // Photo portrait full-bleed avec 5 numéros (01-05) positionnés
  // sur la tête, la barbe et le cou. Au hover/clic, la card flottante
  // en bas à gauche met à jour son contenu.
  //
  // Les positions x/y (en %) doivent être ajustées manuellement en
  // fonction de la photo de fond utilisée. Calibrer via Ctrl+E (drag).
  // ─────────────────────────────────────────────────────
  sectionFacemap: {
    actif: true,

    // Photo de fond du portrait facemap (JPG fourni par le client)
    photoFond:    "assets/images/facemap-portrait.jpg",
    photoFondAlt: "Portrait modèle homme - prestations barbier",

    // Marquee défilant en background (boucle infinie horizontale)
    marqueeText: "CINQ LAMES · UN MÊME ATELIER",

    // 5 prestations + positions x/y sur le portrait (en %)
    // Les clés (lash, brow, nails, esthetique, massages) sont conservées
    // car référencées par index.html, apply-config.js et reservation/.
    // Seul le contenu visible est adapté au registre barber.
    prestations: {

      // Clé "brow" → 02 BARBE
      brow: {
        numero:          "02",
        pole:            "BARBE",
        nom:             "Architecture barbe",
        description:     "Tracé travaillé à la tondeuse Wahl, finition affinée à la lame. Architecture posée à la mâchoire, aux pommettes et à l'encolure. Pas de tracé standard.",
        traitements:     ["Architecture complète", "Taille barbe longue", "Contour rasoir", "Vapeur visage barbe"],
        photo:           "assets/images/prestations/barbe.jpg",
        lienReservation: "reservation/?prestation=brow",
        position:        { x: 2.3, y: 47.0 },   // sur la barbe / menton
      },

      // Clé "nails" → 01 COUPE
      nails: {
        numero:          "01",
        pole:            "COUPE",
        nom:             "Coupe ciseau & contour",
        description:     "Diagnostic du cheveu, shampoing assis, coupe au ciseau japonais ou à la tondeuse, contour à la lame. Dégradé, fondu ou raccord selon la matière du cheveu.",
        traitements:     ["Coupe ciseau 45 min", "Dégradé fondu", "Raccord 4 semaines", "Coupe enfant"],
        photo:           "assets/images/prestations/coupeciseaux.jpg",
        lienReservation: "reservation/?prestation=nails",
        position:        { x: 72.9, y: 49.1 },   // sur les cheveux / haut de tête
      },

      // Clé "esthetique" → 03 SOIN
      esthetique: {
        numero:          "03",
        pole:            "SOIN",
        nom:             "Soin visage homme",
        description:     "Vapeur, gommage, masque purifiant ou nourrissant, modelage du cuir chevelu. Protocole calé après lecture du grain de peau et de la pousse de la barbe.",
        traitements:     ["Soin visage 60 min", "Gommage cuir chevelu", "Masque purifiant", "Modelage crânien"],
        photo:           "assets/images/prestations/soins.jpg",
        lienReservation: "reservation/?prestation=esthetique",
        position:        { x: 28.2, y: 48.2 },   // sur la pommette / contour œil
      },

      // Clé "massages" → 04 COLORATION
      massages: {
        numero:          "04",
        pole:            "COLORATION",
        nom:             "Camouflage & coloration",
        description:     "Camouflage progressif des cheveux blancs aux tempes, retour racine, coloration barbe au pinceau. Pose vingt minutes, démarcation lissée, rinçage assis.",
        traitements:     ["Camouflage progressif", "Coloration barbe pinceau", "Mèches naturelles", "Retour racine 6 sem."],
        photo:           "assets/images/prestations/coloration.jpg",
        lienReservation: "reservation/?prestation=massages",
        position:        { x: 63.8, y: 67.2 },
      },

    },
  },

  // ─────────────────────────────────────────────────────
  // SECTION — MARQUES PARTENAIRES (logos défilants + sparkles)
  // Marquee horizontal infini avec progressive blur aux bords,
  // dôme crème en bas + particules sparkles sur canvas.
  // Doctrine §3 : preuve par négation — *Pas de marque grand public.*
  // ─────────────────────────────────────────────────────
  sectionPartenaires: {
    actif:    true,                                    // false pour masquer la section
    eyebrow:  "— SÉLECTION CABINE —",
    titre1:   "Marques de barbier sélectionnées.",     // ligne 1 (régulière, crème)
    titre2:   "Aucune référence de grande surface.",   // ligne 2 (italique, accent) — rime avec sectionExperience.sousTitre

    // Logos défilants (SVG monochromes — couleur héritée du parent via currentColor)
    logos: [
      "assets/logos/partenaires/truefitt-and-hill.svg",
      "assets/logos/partenaires/captain-fawcett.svg",
      "assets/logos/partenaires/proraso.svg",
      "assets/logos/partenaires/reuzel.svg",
      "assets/logos/partenaires/murdock-london.svg",
    ],

    // Vitesse de défilement (durée d'un cycle complet en ms — plus haut = plus lent)
    cycleDurationMs: 40000,

    // Densité des particules sparkles (~200-450 ; au-delà coûteux sur mobile)
    sparklesDensity: 350,
  },

  // ─────────────────────────────────────────────────────
  // SECTION — AVIS CLIENTS (3 colonnes scroll vertical)
  // Doctrine §5 (DOCTRINE-BARBER.md) : un avis crédible décrit un EFFET
  // MESURABLE, pas une émotion. Format type :
  //   « [N rendez-vous espacés de Y]. [Effet constaté]. »
  // Chaque avis : texte court (15-30 mots), prénom + protocole/âge ; pas
  // de remerciement, pas d'adjectif vague, pas de point d'exclamation.
  // ─────────────────────────────────────────────────────
  sectionAvis: {
    actif:    true,
    titre1:   "Ce qu'en disent ceux qui reviennent.",   // ligne 1 (gras ink)
    titre2:   "Effets décrits, séances datées.",        // ligne 2 (italique accent gras)

    // Vitesses de défilement par colonne (secondes par cycle complet).
    // Décalées pour casser la synchronisation visuelle.
    colonnes: { col1: 22, col2: 28, col3: 25 },

    // Liste des avis (répartis en 3 colonnes : avis 1-3 → col 1, 4-6 → col 2, 7-9 → col 3)
    avis: [
      // ─── Colonne 1 ───
      {
        texte:  "Coupe ciseau reprise tous les mois. La forme reste lisible quatre semaines, sans repousse en bordure ni casse sur les côtés.",
        nom:    "Hugo",
        role:   "Coupe — entretien 4 sem.",
      },
      {
        texte:  "Première fois au coupe-chou avec une peau qui marque vite. Test de tolérance fait avant, baume après. Aucun feu du rasoir le lendemain.",
        nom:    "Théo",
        role:   "Rasage — première séance",
      },
      {
        texte:  "Trois venues pour reprendre l'architecture après une barbe laissée pousser. Mâchoire dessinée, joues nettes, encolure tranchée.",
        nom:    "Yanis",
        role:   "Barbe — reprise 3 séances",
      },

      // ─── Colonne 2 ───
      {
        texte:  "Camouflage des tempes posé toutes les six semaines. La repousse se voit à peine, aucun effet bloc, raccord lissé sur les côtés.",
        nom:    "Olivier",
        role:   "Camouflage tempes — 6 sem.",
      },
      {
        texte:  "Cheveux fins coupés au ciseau japonais, jamais à la tondeuse. Volume tenu quatre semaines sans produit coiffant, sans chute carrée.",
        nom:    "Pierre",
        role:   "Coupe ciseau japonais",
      },
      {
        texte:  "Soin visage 60 min programmé après chaque rasage. Vapeur, gommage, masque purifiant. Zone T moins grasse, pores plus fins en deux mois.",
        nom:    "Adrien",
        role:   "Soin visage — bimensuel",
      },

      // ─── Colonne 3 ───
      {
        texte:  "Crâne rasé au coupe-chou une fois par mois. Pas un seul feu du rasoir depuis six mois, finition lisse, baume après-rasage qui apaise vite.",
        nom:    "Sami",
        role:   "Rasage crâne mensuel",
      },
      {
        texte:  "Le barbier explique chaque étape avant de toucher au cheveu. Lame neuve sortie devant moi, formation Murdock London visible dans le geste.",
        nom:    "Maxime",
        role:   "Coupe signature",
      },
      {
        texte:  "Six séances espacées de cinq semaines avec vapeur visage avant la taille. Barbe plus dense aux pommettes, contours qui ne bougent plus.",
        nom:    "Tarek",
        role:   "Barbe — cure 6 séances",
      },
    ],
  },

  // ─────────────────────────────────────────────────────
  // SECTION 5 — GALERIE RÉVÉLATION (Partizan-style spotlight + zoom)
  // Stage immersif fond sombre + spotlight qui suit la souris
  // (mix-blend-mode screen) + bouche SVG qui s'illumine au survol.
  // Au scroll : la bouche zoom (scale 30) jusqu'à révéler une galerie
  // carousel de 6 photos.
  // ─────────────────────────────────────────────────────
  sectionRevelation: {
    actif: true,

    // Texte d'invitation au-dessus de la bouche
    hintText: "Approchez le curseur. Faites défiler pour ouvrir.",

    // Photo révélée par la torche (le curseur agit comme une lampe).
    // Idéalement : photo de l'atelier (ambiance, lieu) — image haute résolution
    // qui mérite d'être "découverte" par fragments.
    torchPhoto:    "assets/images/revelation-portrait.jpg",
    torchPhotoAlt: "Maison Faubourg — l'atelier",

    // Couleur de fond du stage immersif (noir absolu chaud)
    fondColor: "#0A0807",

    // Couleur du spotlight (radial gradient — accent cuir tabac)
    spotColor: "rgba(181, 130, 74, 0.55)",

    // Galerie révélée après le zoom
    galerieEyebrow: "— DANS LA CABINE —",
    galerieTitre:   "En coupe.",

    // 6 photos du carousel (scroll-snap horizontal)
    // Chaque caption nomme une TECHNIQUE plutôt qu'un effet promis
    // (doctrine : preuve > promesse, mécanisme nommé > adjectif vague).
    photos: [
      {
        src:   "assets/images/galerie/galerie-01.jpg",
        alt:   "Lame de coupe-chou en gros plan, manche corne",
        tag:   "RASAGE",
        title: "Coupe-chou Thiers Issard",
      },
      {
        src:   "assets/images/galerie/galerie-02.jpg",
        alt:   "Passage de tondeuse Wahl en dégradé sur la nuque",
        tag:   "COUPE",
        title: "Dégradé tondeuse",
      },
      {
        src:   "assets/images/galerie/galerie-03.jpg",
        alt:   "Finition rasoir sur la mâchoire après tondeuse",
        tag:   "BARBE",
        title: "Contour à la lame",
      },
      {
        src:   "assets/images/galerie/galerie-04.jpg",
        alt:   "Application coloration au pinceau sur tempe grisonnante",
        tag:   "COLORATION",
        title: "Camouflage tempes",
      },
      {
        src:   "assets/images/galerie/galerie-05.jpg",
        alt:   "Serviette chaude posée sur la barbe avant rasage",
        tag:   "SOIN",
        title: "Vapeur & serviette chaude",
      },
      {
        src:   "assets/images/galerie/galerie-06.jpg",
        alt:   "Coupe précise au ciseau Kasho sur cheveu fin",
        tag:   "COUPE",
        title: "Ciseau japonais",
      },
    ],
  },

  // ─────────────────────────────────────────────────────
  // COULEURS — palette barber sombre commune (3 templates)
  // Inversion de la sémantique « clair » : `bgCreme` devient fond charbon chaud,
  // `ink` devient texte crème — l'effet atelier de barbier moderne, profond,
  // terreux, sans aucun blanc ni gris froid. Accent = cuir tabac / laiton.
  // ─────────────────────────────────────────────────────
  couleurs: {
    bgCreme:     "#1F1814",   // charbon chaud — fond principal (sections light)
    bgCremeWarm: "#161210",   // brun-noir profond — fond secondaire / textures
    ink:         "#E8D9BC",   // crème vintage — texte clair sur fond sombre
    inkSoft:     "#A89175",   // cuir café au lait — texte secondaire
    inkWhite:    "#F5E9CE",   // ivoire — sections dark / titres haut contraste
    accent:      "#8B2A2F",   // bordeaux / oxblood — couleur d'appel (remplace cuir tabac/doré)
  },

  // ─────────────────────────────────────────────────────
  // POLICES — Playfair Display PARTOUT (serif unique)
  // --sans aliasé sur --serif → un seul registre typographique sur tout
  // l'iconique : titres, paragraphes, UI, captions, légendes.
  // ─────────────────────────────────────────────────────
  polices: {
    serif:           "Playfair Display",
    sans:            "Playfair Display",
    googleFontsUrl:  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap",
  },

  // ─────────────────────────────────────────────────────
  // SECTION 7 — NOS PARTENAIRES (stack vertical pinned)
  // Section masquée par défaut (cf. index.html). Conservée pour usage futur.
  // ─────────────────────────────────────────────────────
  sectionMarques: {
    actif: false,                            // Section supprimée du DOM (voir index.html)

    eyebrow: "— SÉLECTION CABINE —",
    caption: "Marques de barbier pro",

    // Description par défaut (utilisée si une marque n'a pas son propre texte)
    descriptionText: "Marques de barbier professionnelles : concentrations élevées, traçabilité, distribution réservée aux ateliers.",

    // Liste des 5 marques (ORDRE = ordre d'apparition au scroll).
    marques: [
      {
        nom: "Truefitt & Hill", slug: "truefitt-and-hill",
        logo: "assets/logos/marques/01-truefitt-and-hill.svg",
        description: "Maison londonienne fondée en 1805, plus ancien barbier en activité. Savons à barbe et baumes après-rasage produits selon des formules inchangées depuis le XIXᵉ.",
        previewImage: "assets/images/galerie/galerie-01.jpg",
      },
      {
        nom: "Captain Fawcett", slug: "captain-fawcett",
        logo: "assets/logos/marques/02-captain-fawcett.svg",
        description: "Marque anglaise spécialisée dans l'huile à barbe et la cire à moustache. Concentrations élevées, parfums boisés, flacons en série limitée.",
        previewImage: "assets/images/galerie/galerie-02.jpg",
      },
      {
        nom: "Proraso", slug: "proraso",
        logo: "assets/logos/marques/03-proraso.svg",
        description: "Maison italienne fondée en 1948, référence du rasage en barbier. Crèmes à l'eucalyptus, au menthol, à l'aloe — gammes calibrées par sensibilité de peau.",
        previewImage: "assets/images/galerie/galerie-03.jpg",
      },
      {
        nom: "Reuzel", slug: "reuzel",
        logo: "assets/logos/marques/04-reuzel.svg",
        description: "Pommades hollandaises sorties du Schorem Barbier à Rotterdam. Quatre niveaux de tenue calibrés pour pompadour, sidecut et coupes carrées.",
        previewImage: "assets/images/galerie/galerie-04.jpg",
      },
      {
        nom: "Murdock London", slug: "murdock-london",
        logo: "assets/logos/marques/05-murdock-london.svg",
        description: "Maison londonienne ouverte à Covent Garden en 2006. Soins du cheveu et de la barbe distribués exclusivement en barbier professionnel.",
        previewImage: "assets/images/galerie/galerie-05.jpg",
      },
    ],
  },

  // ─────────────────────────────────────────────────────
  // FOOTER — Minimaliste 3 colonnes
  // Maison / Contact / Réseaux + bottom bar mentions légales
  // ─────────────────────────────────────────────────────
  footer: {
    actif: true,

    // Nom de l'atelier (affiché en bas du footer)
    nomCommerce: "Maison Faubourg",

    // Colonne 1 — Maison (navigation interne ancres)
    colonneMaison: {
      label: "Atelier",
      liens: [
        { texte: "Accueil",      href: "#hero" },
        { texte: "Le geste",     href: "#experience" },
        { texte: "Prestations",  href: "#facemap" },
        { texte: "En coupe",     href: "#revelation" },
      ],
    },

    // Colonne 2 — Contact (tel + email + adresse + CTA)
    colonneContact: {
      label: "Contact",
      telephone: "+33 01 48 78 00 00",
      email:     "contact@maison-faubourg.fr",
      adresse:   "28 rue Notre-Dame-de-Lorette\n75009 Paris",
      ctaTexte:  "Prendre rendez-vous →",
      ctaLien:   "reservation/",
    },

    // Colonne 3 — Réseaux sociaux
    colonneReseaux: {
      label:        "Réseaux",
      instagramUrl: "https://www.instagram.com/maisonfaubourg",
      tiktokUrl:    "https://www.tiktok.com/@maisonfaubourg",
    },

    // Bottom bar (copyright + mentions)
    copyright:           "© 2026 Maison Faubourg",
    mentionsLegalesLien: "/mentions-legales/",
    politiqueLien:       "/mentions-legales/#donnees",
  },

  // ─────────────────────────────────────────────────────
  // ANIMATIONS
  // ─────────────────────────────────────────────────────
  animations: {
    smoothScroll:        true,   // active Lenis sitewide
    heroScrollDriven:    true,   // active la timeline GSAP pinned
    headerSmartContrast: true,   // active IntersectionObserver header
    sectionRevealAnims:  true,   // active reveal au scroll des sections
    desactiverSurMobile: true,   // mobile = layout vertical simple
  },
};
