// =====================================================
// CONFIG CLIENT — Beauté Iconique (Ever-style)
// Le SEUL fichier à modifier pour personnaliser.
//
// Sections actuellement présentes :
//   - Hero (split crème / photo, scroll-driven, mix-blend-mode title)
//   - Header smart-contrast (transparent, change de couleur selon
//     le data-theme de la section visible)
//   - Section 2 "Révélez votre beauté" (titre éclaté + portrait
//     qui dépasse, layout magazine)
// =====================================================

window.SITE_CONFIG = {

  // ─────────────────────────────────────────────────────
  // IDENTITÉ
  // ─────────────────────────────────────────────────────
  nomMarque:    "MAISON LUMIÈRE",          // logo center header (lettres espacées)
  nomCommerce:  "Maison Lumière",          // pour identité
  slogan:       "Cinq spécialités, une même maison.",

  // ─────────────────────────────────────────────────────
  // SEO — balises servies à Google et aux LLM (AISO)
  // Title ≤ 60 c. · Description ≤ 160 c. (au-delà, Google coupe).
  // Le HTML statique reste la source de vérité (lu avant tout JS).
  // apply-config.js sync ces valeurs au runtime pour cohérence.
  // ─────────────────────────────────────────────────────
  seo: {
    title:       "Maison Lumière · Institut de beauté à Paris 2ᵉ",
    description: "Institut de beauté à Paris 2ᵉ. Cinq cabines, cinq spécialités : cils, sourcils, ongles, peau, massages. Protocoles courts ou en cure, sur diagnostic.",
  },

  // ─────────────────────────────────────────────────────
  // HEADER (smart-contrast)
  // ─────────────────────────────────────────────────────
  header: {
    logoTexte:     "MAISON LUMIÈRE",
    ctaTexte:      "PRENDRE RENDEZ-VOUS",
    ctaAction:     "reservation/",          // page de réservation interne (sous-dossier)
    smartContrast: true,                    // change de couleur selon data-theme de la section visible
    blurAuScroll:  true,                    // backdrop blur léger quand scroll > 100px
  },

  // ─────────────────────────────────────────────────────
  // HERO — section principale (split crème / photo)
  // ─────────────────────────────────────────────────────
  hero: {
    // eyebrowNumero + eyebrowMarque : conservés en config si tu veux
    // réactiver le badge "001 SIGNATURE" en haut à gauche (il faut alors
    // remettre le <p class="hero-eyebrow">…</p> dans index.html).
    eyebrowNumero:        "001",
    eyebrowMarque:        "SIGNATURE",
    titre:                "Cinq cabines, cinq spécialités. Une seule exigence.",
    sousTitre:            "",   // désactivé — le titre suffit (doctrine : le luxe respire)
    description:          "Cinq pôles : cils, sourcils, ongles, peau, massages. Cinq cabines indépendantes, équipe diplômée. Protocoles courts ou en cure, sur diagnostic préalable.",
    photoPath:            "assets/images/hero-photo.jpg",
    photoAlt:             "Soin signature en cours — gros plan",
    scrollIndicatorTexte: "DESCENDRE",
    ctaTexte:             "PRENDRE RENDEZ-VOUS",  // utilisé aussi par le header
    ctaAction:            "#contact",
  },

  // ─────────────────────────────────────────────────────
  // SECTION 2 — "Révélez votre beauté" (layout magazine)
  // ─────────────────────────────────────────────────────
  // Le titre est éclaté en plusieurs mots avec styles alternés.
  // Chaque mot peut avoir :
  //   - mot     : le texte affiché
  //   - style   : "fill" (gros majuscules noir) | "italic-small" (italique petit gris)
  //   - suiteLigne : true → reste sur la même ligne que le mot précédent
  //                  (default false → nouvelle ligne)
  //   - insererPortraitApres : true → la photo portrait vient APRÈS ce mot
  //
  // L'ordre des mots et les flags définissent le layout final.
  // ─────────────────────────────────────────────────────
  sectionPersonalise: {
    actif:        true,

    titreLignes: [
      { mot: "CINQ",     style: "fill" },
      { mot: "pôles,",   style: "italic-small", suiteLigne: true },
      { mot: "UNE",      style: "fill" },
      { mot: "même",     style: "italic-small", suiteLigne: true, insererPortraitApres: true },
      { mot: "EXIGENCE", style: "fill" },
    ],

    portraitPath: "assets/images/portrait-section2.jpg",
    portraitAlt:  "Portrait modèle — Maison Lumière",

    description:  "Diagnostic préalable. Protocole adapté à votre peau. Même équipe d'une cabine à l'autre. La précision se joue à ce niveau.",
  },

  // ─────────────────────────────────────────────────────
  // SECTION 3 — L'EXPÉRIENCE MAISON LUMIÈRE
  // Inspirée de "Why Lash Extensions at EVER?" :
  // - Titre central énorme en majuscules sans-serif light
  // - 3 raisons en colonnes (Sur-mesure, Premium, Expérience)
  // - 2 photos sépia latérales animées en scrub
  // ─────────────────────────────────────────────────────
  sectionExperience: {
    actif:           true,
    marque:          "— LA MAISON —",
    titre:           "LA",
    titreSousLigne:  "MÉTHODE",
    sousTitre:       "Trois principes tenus sur chaque soin. Pas de protocole standard, pas de produit générique.",

    raisons: [
      {
        titre: "Diagnostic",
        texte: "Chaque rendez-vous commence par un examen de la peau : phototype, sensibilité, état de la barrière cutanée. Le protocole est défini ensuite — pas avant.",
      },
      {
        titre: "Matière",
        texte: "Uniquement des marques professionnelles : formules concentrées, traçabilité complète, principes actifs nommés. Aucun produit grand public en cabine.",
      },
      {
        titre: "Suivi",
        texte: "Vos rendez-vous précédents sont consultés à chaque retour. Cures organisées en séances espacées. Une même esthéticienne tient votre dossier, d'un soin à l'autre.",
      },
    ],

    // Photos sépia latérales (animation scrub au scroll)
    photoLeft:     "assets/images/experience-left.jpg",
    photoLeftAlt:  "Détail soin signature",
    photoRight:    "assets/images/experience-right.jpg",
    photoRightAlt: "Soin sur-mesure",
  },

  // ─────────────────────────────────────────────────────
  // SECTION 4 — INTERACTIVE FACE MAP
  // Photo portrait full-bleed avec 5 numéros (01-05) positionnés
  // sur le visage et le corps. Au hover/clic, la card flottante en
  // bas à gauche met à jour son contenu (photo, nom, description,
  // traitements, lien CTA Planity).
  //
  // Les positions x/y (en %) doivent être ajustées manuellement en
  // fonction de la photo de fond utilisée. Les valeurs ci-dessous
  // sont calibrées pour un portrait avec visage centre-droit.
  // ─────────────────────────────────────────────────────
  sectionFacemap: {
    actif: true,

    // Photo de fond : PNG transparent (sujet détouré via remove.bg)
    // Mode LIGHT → fond crème de la section visible derrière la femme
    photoFond:    "assets/images/facemap-portrait.png",
    photoFondAlt: "Portrait modèle - prestations",

    // Marquee défilant en background (boucle infinie horizontale)
    marqueeText: "CINQ PÔLES · UN MÊME PROTOCOLE",

    // 5 prestations + positions x/y sur le visage (en %)
    // Pour ajuster : modifie position.x/position.y → relance la page
    prestations: {

      // POSITIONS CALIBRÉES pour la photo actuelle (femme détourée, visage
       // à droite, chignon haut, boucle d'oreille dorée, top marron).
       // Si tu changes de photo : ajuste ces valeurs en %.
       //   x : 0 (gauche) → 100 (droite)
       //   y : 0 (haut)   → 100 (bas)

      // POSITIONS relatives à la PHOTO (4480×6720), pas au conteneur de la section.
      // Stable peu importe le viewport. Calibrées approximativement pour la photo
      // actuelle (femme avec chignon, peau dorée, top marron).
      // Pour fine-tuner : Ctrl+E → drag → Ctrl+S → coller dans config.js.

      // POSITIONS CALIBRÉES VIA Ctrl+E (mode édition drag & drop) :
      // Ces % sont relatifs à la PHOTO (aspect-ratio 4480/6720), donc
      // stables peu importe le viewport. Pour ré-ajuster : Ctrl+E → drag → Ctrl+S.

      lash: {
        numero:          "03",
        pole:            "LASH BAR",
        nom:             "Extensions de cils",
        description:     "Pose cil à cil, volume russe, hybride, rehaussement kératine. Mapping calibré à la morphologie de l'œil et à la fibre naturelle.",
        traitements:     ["Cil à cil classique", "Volume russe 3D-6D", "Hybride mixte", "Rehaussement kératine"],
        photo:           "assets/images/prestations/lash.jpg",
        lienReservation: "reservation/?prestation=lash",
        position:        { x: 68.6, y: 26.0 },   // sur les cils
      },

      brow: {
        numero:          "02",
        pole:            "BROW BAR",
        nom:             "Sourcils",
        description:     "Restructuration au fil, teinture végétale, brow lamination, microshading. Tracé adapté à la symétrie du visage et au regard.",
        traitements:     ["Architecture personnalisée", "Brow lamination", "Microshading", "Épilation au fil"],
        photo:           "assets/images/prestations/brow.jpg",
        lienReservation: "reservation/?prestation=brow",
        position:        { x: 41.1, y: 16.0 },   // sur les sourcils
      },

      nails: {
        numero:          "01",
        pole:            "NAILS BAR",
        nom:             "Manucure & pédicure",
        description:     "Manucure russe, construction apex en gel, semi-permanent, pose Gel-X. Finition durable, repousse propre, sans agression de la matrice.",
        traitements:     ["Manucure russe", "Construction apex", "Babyboomer", "Pédicure médicale"],
        photo:           "assets/images/prestations/nails.jpg",
        lienReservation: "reservation/?prestation=nails",
        position:        { x: 68.8, y: 70.0 },   // sur les ongles / main
      },

      esthetique: {
        numero:          "04",
        pole:            "ESTHÉTIQUE",
        nom:             "Soins visage",
        description:     "Hydrafacial, peeling, dermaplaning, radiofréquence, LED. Protocole défini après diagnostic de la peau.",
        traitements:     ["HydraFacial", "LED thérapie", "Radiofréquence", "Microneedling"],
        photo:           "assets/images/prestations/esthetique.jpg",
        lienReservation: "reservation/?prestation=esthetique",
        position:        { x: 68.1, y: 41.0 },   // sur la peau / joue
      },

      massages: {
        numero:          "05",
        pole:            "MASSAGES",
        nom:             "Massages",
        description:     "Californien, balinais, deep tissue, pierres chaudes, prénatal. 60 ou 90 minutes selon le protocole. Cabines indépendantes, table chauffante.",
        traitements:     ["Drainage lymphatique", "Réflexologie plantaire", "Shiatsu", "Lomi-lomi"],
        photo:           "assets/images/prestations/massages.jpg",
        lienReservation: "reservation/?prestation=massages",
        position:        { x: 12.1, y: 62.6 },   // sur le cou / clavicule
      },

    },
  },

  // ─────────────────────────────────────────────────────
  // SECTION — MARQUES PARTENAIRES (logos défilants + sparkles)
  // Marquee horizontal infini (rAF) avec progressive blur aux bords,
  // dôme crème en bas + particules sparkles terracotta sur canvas.
  // 12 logos SVG (assets/logos/partenaires/). Pour ajouter/retirer :
  // édite la liste ci-dessous. La copie éditoriale doit rester sobre,
  // factuelle (cf. DOCTRINE-BEAUTE.md §3 : pas de superlatif).
  // ─────────────────────────────────────────────────────
  sectionPartenaires: {
    actif:    true,                                    // false pour masquer la section
    eyebrow:  "— MARQUES PRO —",
    titre1:   "Marques pro présentes en cabine.",      // ligne 1 (régulière, crème)
    titre2:   "Pas de marque grand public.",           // ligne 2 (italique, terracotta) — rime avec sectionExperience.sousTitre

    // Logos défilants (SVG monochromes — couleur héritée du parent via currentColor
    // ou filter:brightness/invert appliqué en CSS pour les rendre crème sur fond sombre)
    logos: [
      "assets/logos/partenaires/chanel.svg",
      "assets/logos/partenaires/dior.svg",
      "assets/logos/partenaires/givenchy.svg",
      "assets/logos/partenaires/sothys.svg",
      "assets/logos/partenaires/maria-galland.svg",
    ],

    // Vitesse de défilement (durée d'un cycle complet en ms — plus haut = plus lent)
    cycleDurationMs: 40000,

    // Densité des particules sparkles (~200-450 ; au-delà coûteux sur mobile)
    sparklesDensity: 350,
  },

  // ─────────────────────────────────────────────────────
  // SECTION — AVIS CLIENTES (3 colonnes scroll vertical)
  // ─────────────────────────────────────────────────────
  // Doctrine §5 (DOCTRINE-BEAUTE.md) : un avis crédible décrit un EFFET
  // MESURABLE, pas une émotion. Format type :
  //   « [N séances de X espacées de Y]. [Effet constaté]. »
  // Chaque avis : texte court (15-30 mots), prénom + protocole/âge ; pas
  // de remerciement, pas d'adjectif vague, pas de point d'exclamation.
  // Pour modifier : édite la liste ci-dessous (9 entrées = 3 colonnes × 3).
  // ─────────────────────────────────────────────────────
  sectionAvis: {
    actif:    true,
    titre1:   "Ce que disent nos clientes.",     // ligne 1 (gras ink)
    titre2:   "Effets mesurés, séances comptées.",// ligne 2 (italique terracotta gras)

    // Vitesses de défilement par colonne (secondes par cycle complet).
    // Décalées pour casser la synchronisation visuelle.
    colonnes: { col1: 22, col2: 28, col3: 25 },

    // Liste des avis (répartis en 3 colonnes : avis 1-3 → col 1, 4-6 → col 2, 7-9 → col 3)
    avis: [
      // ─── Colonne 1 ───
      {
        texte:  "Trois séances de microneedling espacées de quatre semaines. Les cicatrices d'acné sur les joues ont nettement diminué.",
        nom:    "Camille",
        role:   "Cure peau — 3 séances",
      },
      {
        texte:  "Le diagnostic en amont a évité un protocole inadapté à ma peau réactive. Le soin a été ajusté en cabine.",
        nom:    "Sophie",
        role:   "Soin visage sur-mesure",
      },
      {
        texte:  "Brow lamination + restructuration sur six rendez-vous. Mes sourcils retiennent la forme entre deux séances.",
        nom:    "Léa",
        role:   "Brow Bar — cure 6 séances",
      },

      // ─── Colonne 2 ───
      {
        texte:  "Cure de drainage lymphatique de huit séances. Œdèmes du visage au réveil nettement réduits.",
        nom:    "Aïcha",
        role:   "Drainage — 8 séances",
      },
      {
        texte:  "Lash lift kératine plutôt que pose volume. Mes cils tiennent quatre semaines sans surcharge ni casse.",
        nom:    "Inès",
        role:   "Lash Bar — rehaussement",
      },
      {
        texte:  "Manucure semi-permanent avec construction Apex. Quatre semaines de tenue, aucun lift au bout de l'ongle.",
        nom:    "Marion",
        role:   "Nails Bar — Apex",
      },

      // ─── Colonne 3 ───
      {
        texte:  "Kobido 75 minutes, une fois par mois. Le contour du visage est ressorti dès la deuxième séance.",
        nom:    "Nadia",
        role:   "Massage Kobido — mensuel",
      },
      {
        texte:  "L'esthéticienne est formée Biologique Recherche. Diagnostic posé, actifs nommés, protocole expliqué avant chaque étape.",
        nom:    "Charlotte",
        role:   "Soin visage signature",
      },
      {
        texte:  "Hydrafacial une fois par mois sur six mois. Pores resserrés, grain affiné, photos avant/après partagées.",
        nom:    "Anne",
        role:   "Hydrafacial — cure 6 mois",
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
    hintText: "Avancez le curseur. Descendez pour entrer.",

    // Photo révélée par la torche (le curseur agit comme une lampe).
    // Idéalement : photo du salon (ambiance, lieu) — image haute résolution
    // qui mérite d'être "découverte" par fragments.
    torchPhoto:    "assets/images/revelation-portrait.jpg",
    torchPhotoAlt: "Maison Lumière — l'institut",

    // Couleur de fond du stage immersif (brun chaud, continuité Section 3)
    fondColor: "#3A2E1C",

    // Couleur du spotlight (radial gradient)
    spotColor: "rgba(212, 165, 116, 0.55)",

    // Galerie révélée après le zoom
    galerieEyebrow: "— EN IMAGES —",
    galerieTitre:   "En cabine.",

    // 6 photos du carousel (scroll-snap horizontal)
    // Chaque caption nomme une TECHNIQUE plutôt qu'un effet promis
    // (doctrine : preuve > promesse, mécanisme nommé > adjectif vague).
    photos: [
      {
        src:   "assets/images/galerie/galerie-01.jpg",
        alt:   "Hydrafacial — soin du visage en cours",
        tag:   "ESTHÉTIQUE",
        title: "Hydrafacial",
      },
      {
        src:   "assets/images/galerie/galerie-02.jpg",
        alt:   "Volume russe — pose d'extensions de cils",
        tag:   "LASH BAR",
        title: "Volume russe",
      },
      {
        src:   "assets/images/galerie/galerie-03.jpg",
        alt:   "Brow lamination — restructuration du sourcil",
        tag:   "BROW BAR",
        title: "Brow lamination",
      },
      {
        src:   "assets/images/galerie/galerie-04.jpg",
        alt:   "Manucure russe — finition gel",
        tag:   "NAILS BAR",
        title: "Manucure russe",
      },
      {
        src:   "assets/images/galerie/galerie-05.jpg",
        alt:   "Drainage lymphatique — modelage du visage",
        tag:   "MASSAGES",
        title: "Drainage lymphatique",
      },
      {
        src:   "assets/images/galerie/galerie-06.jpg",
        alt:   "Microneedling — protocole peau",
        tag:   "ESTHÉTIQUE",
        title: "Microneedling",
      },
    ],
  },

  // ─────────────────────────────────────────────────────
  // COULEURS (variables CSS injectées dynamiquement)
  // ─────────────────────────────────────────────────────
  couleurs: {
    bgCreme:     "#F5F0E8",   // fond crème chaud — panneau gauche hero + section 2
    bgCremeWarm: "#EDE5D7",   // crème plus chaud (textures, fallback photo)
    ink:         "#1A1814",   // texte foncé sur crème
    inkSoft:     "#5C544A",   // texte secondaire (italique petit gris)
    inkWhite:    "#FFFFFF",   // titre blanc / texte sur fond sombre
    accent:      "#A66B5C",   // terracotta sourd
  },

  // ─────────────────────────────────────────────────────
  // POLICES (Google Fonts)
  // ─────────────────────────────────────────────────────
  polices: {
    // Inter PARTOUT (sans + serif aliasé sur sans dans le CSS).
    // Pour réactiver Fraunces : remettre serif:"Fraunces" + l'URL Google Fonts complète.
    serif:           "Inter",
    sans:            "Inter",
    googleFontsUrl:  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300;1,400&family=Inter:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&display=swap",
  },

  // ─────────────────────────────────────────────────────
  // SECTION 7 — NOS PARTENAIRES (stack vertical pinned, style Fromanother)
  // 5 marques défilent verticalement avec rotation subtile (±3°),
  // marque active centrée + numérotation + logo officiel sync.
  // ─────────────────────────────────────────────────────
  sectionMarques: {
    actif: false,                            // Section supprimée du DOM (voir index.html)

    eyebrow: "— NOS PARTENAIRES —",
    caption: "Ils nous font confiance",

    // Description par défaut (utilisée si une marque n'a pas son propre texte)
    descriptionText: "Nous travaillons uniquement avec des marques d'exception, sélectionnées pour leur expertise et leur engagement envers la beauté authentique.",

    // Liste des 5 marques (ORDRE = ordre d'apparition au scroll).
    // Chaque marque a son propre `description` qui s'affiche quand elle
    // devient active dans la roue (sync via BrandsWheel.syncActive).
    marques: [
      {
        nom: "Chanel",   slug: "chanel",
        logo: "assets/logos/marques/01-chanel.svg",
        description: "Iconique et intemporelle, Chanel sublime nos rituels avec ses fragrances et ses soins emblématiques de la haute parfumerie française.",
        previewImage: "assets/images/galerie/galerie-01.jpg",
      },
      {
        nom: "Dior",     slug: "dior",
        logo: "assets/logos/marques/02-dior.svg",
        description: "Excellence française et innovation : Dior nous accompagne pour des soins haute couture, où chaque texture est pensée comme une œuvre.",
        previewImage: "assets/images/galerie/galerie-02.jpg",
      },
      {
        nom: "La Mer",   slug: "la-mer",
        logo: "assets/logos/marques/03-la-mer.svg",
        description: "Texture précieuse et formules concentrées en Miracle Broth™ : La Mer reste notre référence pour les soins anti-âge d'exception.",
        previewImage: "assets/images/galerie/galerie-03.jpg",
      },
      {
        nom: "Caudalie", slug: "caudalie",
        logo: "assets/logos/marques/04-caudalie.svg",
        description: "Vinothérapie et naturalité : Caudalie apporte expertise botanique et engagement écologique à chacun de nos protocoles signature.",
        previewImage: "assets/images/galerie/galerie-04.jpg",
      },
      {
        nom: "Mádara",   slug: "madara",
        logo: "assets/logos/marques/05-madara.svg",
        description: "Bio-certifiée et baltique, Mádara incarne notre engagement pour une cosmétique propre, performante et profondément respectueuse.",
        previewImage: "assets/images/galerie/galerie-05.jpg",
      },
    ],
  },

  // ─────────────────────────────────────────────────────
  // FOOTER — Minimaliste 3 colonnes (style Ever)
  // Maison / Contact / Réseaux + bottom bar mentions légales
  // ─────────────────────────────────────────────────────
  footer: {
    actif: true,

    // Nom du salon (affiché en bas du footer)
    nomCommerce: "Maison Lumière",

    // Colonne 1 — Maison (navigation interne ancres)
    colonneMaison: {
      label: "Maison",
      liens: [
        { texte: "Accueil",     href: "#hero" },
        { texte: "La méthode",  href: "#experience" },
        { texte: "Prestations", href: "#facemap" },
        { texte: "En cabine",   href: "#revelation" },
      ],
    },

    // Colonne 2 — Contact (tel + email + adresse + CTA Planity)
    colonneContact: {
      label: "Contact",
      telephone: "+33 00 00 00 00",
      email:     "contact@maison-lumiere.fr",
      adresse:   "12 rue de la Paix\n75002 Paris",
      ctaTexte:  "Prendre rendez-vous →",
      ctaLien:   "reservation/",
    },

    // Colonne 3 — Réseaux sociaux
    colonneReseaux: {
      label:        "Réseaux",
      instagramUrl: "https://www.instagram.com/maisonlumiere",
      tiktokUrl:    "https://www.tiktok.com/@maisonlumiere",
    },

    // Bottom bar (copyright + mentions)
    copyright:           "© 2026 Maison Lumière",
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
