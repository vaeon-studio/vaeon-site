// =====================================================
// SITE.JS — Beauté Iconique
//
// Modules :
//   1. Burger toggle (placeholder pour futur menu fullscreen)
//   2. Lenis smooth scroll sitewide
//   3. HeaderContrast — change la couleur du header selon
//      le data-theme de la section visible (IntersectionObserver)
//   4. Header scroll detection — ajoute .scrolled au-delà de 100px
// =====================================================

(() => {
  const C = window.SITE_CONFIG || {};
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = ('ontouchstart' in window);

  // ============================================================
  // 1. BURGER (toggle aria-expanded — pour l'instant pas de menu)
  // ============================================================
  const burger = document.getElementById('burger');
  if (burger) {
    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      // Le menu fullscreen sera ajouté dans un prompt ultérieur.
    });
  }

  // ============================================================
  // 2. LENIS — smooth scroll sitewide (graceful fallback)
  // ============================================================
  const enableLenis = C.animations?.smoothScroll !== false;

  if (!enableLenis || isTouch || reduced) {
    window.__lenis = null;
  } else {
    const tryInitLenis = () => {
      if (typeof window.Lenis !== 'function') return false;
      try {
        const lenis = new window.Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          smoothTouch: false,
        });
        const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
        window.__lenis = lenis;
      } catch (e) {
        console.warn('[site] Lenis init failed', e);
        window.__lenis = null;
      }
      return true;
    };
    if (!tryInitLenis()) {
      const checkInterval = setInterval(() => {
        if (tryInitLenis()) clearInterval(checkInterval);
      }, 100);
      setTimeout(() => clearInterval(checkInterval), 5000);
    }
  }

  // ============================================================
  // 3. HEADER SMART-CONTRAST
  // - Observe les sections [data-theme]
  // - Met à jour data-header-theme du header en fonction de la
  //   section actuellement DERRIÈRE le header (au niveau du top du
  //   viewport).
  // - Transition CSS .4s gère le fondu de couleur.
  // ============================================================
  class HeaderContrast {
    constructor(headerSelector = '[data-header]', sectionSelector = '[data-theme]') {
      this.header   = document.querySelector(headerSelector);
      this.sections = Array.from(document.querySelectorAll(sectionSelector));
      this.currentTheme = this.header?.dataset?.headerTheme || 'light';

      if (!this.header || !this.sections.length) return;
      // Désactivable via config
      if (C.header?.smartContrast === false) return;
      if (C.animations?.headerSmartContrast === false) return;

      this.init();
    }

    init() {
      // On observe au niveau du HEADER (tout en haut). Quand une section
      // touche le top du viewport, son data-theme devient celui du header.
      const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;
      const observer = new IntersectionObserver(
        (entries) => {
          // On veut savoir QUELLE section croise le top de l'écran.
          // L'algo : on prend la section dont le boundingClientRect.top
          // est le plus proche de 0 (mais ≤ headerH).
          this.update();
        },
        {
          // Une bande étroite tout en haut (de 0 à 1px sous le header)
          // → on récupère seulement les sections qui sont AU NIVEAU du header.
          rootMargin: `0px 0px -${window.innerHeight - headerH - 1}px 0px`,
          threshold: [0, 0.01],
        }
      );

      this.sections.forEach(section => observer.observe(section));

      // Met à jour aussi au scroll (couvre les cas où l'observer
      // ne déclenche pas — ex. scroll très rapide / Lenis).
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => { this.update(); ticking = false; });
          ticking = true;
        }
      }, { passive: true });

      // État initial
      this.update();
    }

    update() {
      const headerH = this.header.offsetHeight || 64;
      // Cherche la section dont le top est le plus proche du bas du header
      // (sans dépasser).
      let candidate = null;
      let bestTop = -Infinity;
      this.sections.forEach(section => {
        const top = section.getBoundingClientRect().top;
        // La section est "sous le header" si son top est ≤ headerH+1.
        if (top <= headerH + 1 && top > bestTop) {
          bestTop = top;
          candidate = section;
        }
      });
      // Fallback : si aucune ne dépasse, prend la première section dans le viewport
      if (!candidate && this.sections.length) {
        candidate = this.sections[0];
      }
      if (candidate) {
        const theme = candidate.dataset.theme || 'light';
        this.setTheme(theme);
      }
    }

    setTheme(theme) {
      if (theme === this.currentTheme) return;
      this.currentTheme = theme;
      this.header.dataset.headerTheme = theme;
    }
  }

  // ============================================================
  // 4. HEADER SCROLL DETECTION → classe .scrolled
  // Ajoute un léger backdrop-blur quand l'utilisateur a scrollé
  // au-delà de 100px (UX : signale qu'on n'est plus en haut).
  // ============================================================
  class HeaderScrollState {
    constructor(headerSelector = '[data-header]', threshold = 100) {
      this.header = document.querySelector(headerSelector);
      this.threshold = threshold;
      this.scrolled = false;

      if (!this.header) return;
      if (C.header?.blurAuScroll === false) return;

      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => { this.update(); ticking = false; });
          ticking = true;
        }
      }, { passive: true });

      this.update();
    }

    update() {
      const isScrolled = window.scrollY > this.threshold;
      if (isScrolled === this.scrolled) return;
      this.scrolled = isScrolled;
      this.header.classList.toggle('scrolled', isScrolled);
    }
  }

  // ============================================================
  // 5. FACE MAP INTERACTION — section 4
  // 5 numéros (.facemap-point) sur le visage. Au hover/clic, la card
  // flottante (.facemap-card) met à jour son contenu (photo, eyebrow,
  // titre, description, traitements, lien CTA) avec un fade transition.
  // Source des données : window.SITE_CONFIG.sectionFacemap.prestations
  // (mapping id → { numero, pole, nom, description, traitements, photo,
  // lienReservation, position }).
  // ============================================================
  class FaceMapInteraction {
    constructor() {
      this.points          = document.querySelectorAll('.facemap-point');
      this.card            = document.querySelector('[data-card]');
      this.cardImg         = document.querySelector('[data-card-img]');
      this.cardEyebrow     = document.querySelector('[data-card-eyebrow]');
      this.cardTitle       = document.querySelector('[data-card-title]');
      this.cardDescription = document.querySelector('[data-card-description]');
      this.cardTreatments  = document.querySelector('[data-card-treatments]');
      this.cardCta         = document.querySelector('[data-card-cta]');

      this.prestations = (window.SITE_CONFIG && window.SITE_CONFIG.sectionFacemap && window.SITE_CONFIG.sectionFacemap.prestations) || {};
      this.activeId    = null;

      if (this.points.length > 0) this.init();
    }

    init() {
      this.points.forEach(point => {
        const id = point.dataset.prestationId;

        // Hover desktop → met à jour la card
        point.addEventListener('mouseenter', () => this.setActive(id));

        // Clic (mobile + desktop) → idem (preventDefault pour pas de scroll)
        point.addEventListener('click', (e) => {
          e.preventDefault();
          this.setActive(id);
        });
      });

      // Activer le premier point au chargement (instant=true → pas de fade)
      if (this.points[0]) {
        const firstId = this.points[0].dataset.prestationId;
        this.setActive(firstId, true);
      }
    }

    setActive(id, instant = false) {
      if (this.activeId === id && !instant) return;

      const data = this.prestations[id];
      if (!data) return;

      // Met à jour les points actifs
      this.points.forEach(p => {
        p.classList.toggle('active', p.dataset.prestationId === id);
      });

      if (instant) {
        this.updateCardContent(data);
      } else {
        // Transition avec fade
        this.card.classList.add('transitioning');
        setTimeout(() => {
          this.updateCardContent(data);
          setTimeout(() => {
            this.card.classList.remove('transitioning');
          }, 50);
        }, 300);
      }

      this.activeId = id;
    }

    updateCardContent(data) {
      if (this.cardImg) {
        this.cardImg.src = data.photo || '';
        this.cardImg.alt = data.nom || '';
      }
      if (this.cardEyebrow) {
        this.cardEyebrow.textContent = `${data.numero} — ${data.pole}`;
      }
      if (this.cardTitle) {
        this.cardTitle.textContent = data.nom || '';
      }
      if (this.cardDescription) {
        this.cardDescription.textContent = data.description || '';
      }
      if (this.cardTreatments) {
        const treatmentsList = this.cardTreatments.querySelector('.treatments-list');
        if (treatmentsList && Array.isArray(data.traitements)) {
          treatmentsList.textContent = data.traitements.join(' | ');
        }
      }
      if (this.cardCta) {
        this.cardCta.href = data.lienReservation || '#reservation';
      }
    }
  }

  // ============================================================
  // INIT (DCL)
  // ============================================================
  const initAll = () => {
    try { new HeaderContrast(); } catch (e) { console.warn('[site] HeaderContrast failed', e); }
    try { new HeaderScrollState(); } catch (e) { console.warn('[site] HeaderScrollState failed', e); }
    // FaceMapInteraction : on tente d'abord direct, puis avec délai 150ms
    // au cas où apply-config n'aurait pas fini de poser les positions x/y.
    const initFacemap = () => {
      try {
        window.__faceMap = new FaceMapInteraction();
      } catch (e) {
        console.warn('[site] FaceMapInteraction failed', e);
      }
    };
    initFacemap();
    setTimeout(initFacemap, 150);  // 2nd tentative au cas où le DOM était pas prêt
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();

// ═══════════════════════════════════════════════════════════════
// MODE ÉDITION FACE MAP — drag & drop des 5 numéros (HORS IIFE)
// Volontairement hors de l'IIFE pour assurer un binding fiable au
// document keydown, indépendant du timing d'init des autres modules.
//
// Raccourcis :
//   - Ctrl+E (Cmd+E Mac) → toggle mode édition
//   - Ctrl+S → popup avec coordonnées à coller dans config.js
//   - Échap → quitte le mode édition
// ═══════════════════════════════════════════════════════════════

class FaceMapEditor {
  constructor() {
    this.editing = false;
    this.banner = null;
    this.section = document.querySelector('.section-facemap');
    // Wrapper qui matche EXACTEMENT la photo (aspect-ratio).
    // Sert de référentiel pour calculer les % du drag.
    this.pointsWrapper = document.querySelector('.facemap-points');
    this.points = document.querySelectorAll('.facemap-point');
    this.dragHandlers = new Map();  // pour cleanup propre des listeners

    if (!this.section || !this.pointsWrapper || this.points.length === 0) {
      // Section facemap absente ou désactivée → silencieux (condition normale).
      // L'outil d'édition Ctrl+E n'a tout simplement rien à manipuler.
      return;
    }

    this.init();
    console.log('[FaceMapEditor] Prêt. Appuie Ctrl+E pour activer le mode édition.');
  }

  init() {
    document.addEventListener('keydown', (e) => {
      const ctrlOrCmd = e.ctrlKey || e.metaKey;

      // Ctrl+E ou Cmd+E pour toggle
      if (ctrlOrCmd && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        this.toggle();
      }

      // Ctrl+S ou Cmd+S pour sauvegarder (uniquement en mode édition)
      if (this.editing && ctrlOrCmd && e.key.toLowerCase() === 's') {
        e.preventDefault();
        this.save();
      }

      // Échap pour quitter
      if (this.editing && e.key === 'Escape') {
        e.preventDefault();
        this.deactivate();
      }
    });
  }

  toggle() {
    if (this.editing) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  activate() {
    this.editing = true;
    document.body.classList.add('facemap-editing');

    // Créer la bannière
    this.banner = document.createElement('div');
    this.banner.className = 'facemap-edit-banner';
    this.banner.innerHTML = `
      <strong>Mode édition activé</strong>
      <span>Glisse les numéros sur les bonnes zones</span>
      <span>·</span>
      <kbd>Ctrl + S</kbd>
      <span>pour sauvegarder</span>
      <span>·</span>
      <kbd>Échap</kbd>
      <span>pour quitter</span>
      <button class="banner-close" aria-label="Fermer le mode édition" title="Fermer">✕</button>
    `;
    document.body.appendChild(this.banner);

    this.banner.querySelector('.banner-close').addEventListener('click', () => {
      this.deactivate();
    });

    // Activer le drag sur chaque point
    this.points.forEach(point => this.enableDrag(point));
  }

  deactivate() {
    this.editing = false;
    document.body.classList.remove('facemap-editing');

    if (this.banner) {
      this.banner.remove();
      this.banner = null;
    }

    // Désactiver le drag sur chaque point
    this.points.forEach(point => this.disableDrag(point));
  }

  enableDrag(point) {
    const onMouseDown = (e) => {
      e.preventDefault();
      e.stopPropagation();

      point.classList.add('dragging');

      const onMouseMove = (moveEvent) => {
        moveEvent.preventDefault();

        // Référentiel = wrapper .facemap-points qui a la MÊME taille/position
        // que la photo. Les % calculés sont donc relatifs à la PHOTO,
        // pas au conteneur de la section. Stable au resize du viewport.
        const rect = this.pointsWrapper.getBoundingClientRect();
        const x = ((moveEvent.clientX - rect.left) / rect.width) * 100;
        const y = ((moveEvent.clientY - rect.top) / rect.height) * 100;

        // Clamp 0-100
        const clampedX = Math.max(0, Math.min(100, x));
        const clampedY = Math.max(0, Math.min(100, y));

        // Mise à jour visuelle ET stockage
        point.style.left = `${clampedX.toFixed(1)}%`;
        point.style.top = `${clampedY.toFixed(1)}%`;
        point.dataset.x = clampedX.toFixed(1);
        point.dataset.y = clampedY.toFixed(1);
      };

      const onMouseUp = () => {
        point.classList.remove('dragging');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    point.addEventListener('mousedown', onMouseDown);
    this.dragHandlers.set(point, onMouseDown);
  }

  disableDrag(point) {
    const handler = this.dragHandlers.get(point);
    if (handler) {
      point.removeEventListener('mousedown', handler);
      this.dragHandlers.delete(point);
    }
  }

  save() {
    const lines = [];

    this.points.forEach(point => {
      const id = point.dataset.prestationId;

      // Récupère la position actuelle (depuis data-attributes ou style)
      let x = point.dataset.x;
      let y = point.dataset.y;

      if (!x || !y) {
        // Fallback : lit depuis style.left/top
        x = parseFloat(point.style.left) || 50;
        y = parseFloat(point.style.top) || 50;
      }

      lines.push(`    ${id.padEnd(11)}: { x: ${parseFloat(x).toFixed(1)}, y: ${parseFloat(y).toFixed(1)} },`);
    });

    const output = lines.join('\n');

    console.log('═══════════════════════════════════════════════');
    console.log('Positions à coller dans config.js > sectionFacemap > prestations :');
    console.log('═══════════════════════════════════════════════');
    console.log(output);

    this.showPopup(output);
  }

  showPopup(output) {
    // Si une popup existe déjà, la supprimer
    const existing = document.querySelector('.facemap-save-popup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.className = 'facemap-save-popup';
    popup.innerHTML = `
      <div class="popup-content">
        <h3>Positions sauvegardées</h3>
        <p class="popup-instructions">
          Copie ce bloc et colle-le dans <code>js/config.js</code>,
          dans la section <code>sectionFacemap &gt; prestations</code>.
          Remplace les valeurs <code>position: {...}</code> existantes
          par celles-ci :
        </p>
        <pre><code>${output.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
        <div class="popup-actions">
          <button class="popup-copy">📋 Copier dans le presse-papier</button>
          <button class="popup-close">Fermer</button>
        </div>
      </div>
    `;
    document.body.appendChild(popup);

    const copyBtn = popup.querySelector('.popup-copy');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(output).then(() => {
        copyBtn.textContent = '✓ Copié !';
        copyBtn.classList.add('copied');
      }).catch(err => {
        console.error('Erreur copie clipboard:', err);
        copyBtn.textContent = '⚠ Erreur copie';
      });
    });

    popup.querySelector('.popup-close').addEventListener('click', () => {
      popup.remove();
    });

    // Fermer au clic en dehors du contenu
    popup.addEventListener('click', (e) => {
      if (e.target === popup) popup.remove();
    });
  }
}

// Initialisation au chargement complet
window.addEventListener('DOMContentLoaded', () => {
  // Petit délai pour s'assurer que apply-config a injecté le HTML
  setTimeout(() => {
    window.__faceMapEditor = new FaceMapEditor();
  }, 300);
});
// Si DOMContentLoaded est déjà tiré au moment du parse de ce fichier
if (document.readyState !== 'loading') {
  setTimeout(() => {
    if (!window.__faceMapEditor) {
      window.__faceMapEditor = new FaceMapEditor();
    }
  }, 300);
}


// ═══════════════════════════════════════════════════════════
// SECTION 5 — RevelationSpot (spot lumineux qui suit la souris)
// Effet Partizan-like : le curseur est remplacé par un halo rose-or
// avec mix-blend-mode: screen qui éclaire la bouche au passage.
// Skip sur mobile (< 768px) et prefers-reduced-motion.
// ═══════════════════════════════════════════════════════════
class RevelationSpot {
  constructor() {
    this.spot  = document.querySelector('[data-revelation-spot]');
    this.photo = document.querySelector('[data-revelation-photo]');
    this.stage = document.querySelector('[data-revelation-stage]');

    if (!this.stage || (!this.spot && !this.photo)) return;

    // Position initiale = centre de la stage (la torche démarre visible
    // au milieu pour que l'utilisateur voie quelque chose dès l'arrivée).
    const rect = this.stage.getBoundingClientRect();
    this.targetX  = rect.width / 2;
    this.targetY  = rect.height / 2;
    this.currentX = rect.width / 2;
    this.currentY = rect.height / 2;
    this.rafId    = null;

    this.init();
  }

  init() {
    // Suivi de la souris dans la zone .revelation-stage uniquement
    this.stage.addEventListener('mousemove', (e) => {
      const rect = this.stage.getBoundingClientRect();
      this.targetX = e.clientX - rect.left;
      this.targetY = e.clientY - rect.top;
    });

    // Au mouseleave, on RETOURNE AU CENTRE (au lieu d'éloigner à -1000)
    // → la torche reste toujours visible quand l'utilisateur sort.
    this.stage.addEventListener('mouseleave', () => {
      const rect = this.stage.getBoundingClientRect();
      this.targetX = rect.width / 2;
      this.targetY = rect.height / 2;
    });

    // Re-centre si la fenêtre est redimensionnée
    window.addEventListener('resize', () => {
      const rect = this.stage.getBoundingClientRect();
      if (this.targetX < 0 || this.targetX > rect.width) this.targetX = rect.width / 2;
      if (this.targetY < 0 || this.targetY > rect.height) this.targetY = rect.height / 2;
    });

    this.animate();
  }

  animate() {
    // Lerp pour mouvement fluide
    this.currentX += (this.targetX - this.currentX) * 0.12;
    this.currentY += (this.targetY - this.currentY) * 0.12;

    // 1) Spot doré qui suit la souris (effet glow visuel)
    if (this.spot) {
      this.spot.style.transform = `translate(${this.currentX.toFixed(1)}px, ${this.currentY.toFixed(1)}px) translate(-50%, -50%)`;
    }

    // 2) EFFET TORCHE — la photo se révèle uniquement où passe le curseur,
    //    via le mask radial dont on pilote la position en CSS variables.
    if (this.photo) {
      this.photo.style.setProperty('--reveal-x', `${this.currentX.toFixed(1)}px`);
      this.photo.style.setProperty('--reveal-y', `${this.currentY.toFixed(1)}px`);
    }

    this.rafId = requestAnimationFrame(() => this.animate());
  }
}

// ═══════════════════════════════════════════════════════════
// SECTION 5 — GalleryCarousel (flèches navigation scroll-snap)
// ═══════════════════════════════════════════════════════════
class GalleryCarousel {
  constructor() {
    this.carousel = document.querySelector('[data-gallery-carousel]');
    this.prevBtn = document.querySelector('[data-gallery-prev]');
    this.nextBtn = document.querySelector('[data-gallery-next]');

    if (!this.carousel) return;
    this.init();
  }

  init() {
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.scrollByCard(-1));
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.scrollByCard(1));

    this.carousel.addEventListener('scroll', () => this.updateButtons(), { passive: true });
    window.addEventListener('resize', () => this.updateButtons(), { passive: true });

    setTimeout(() => this.updateButtons(), 100);
  }

  getCardWidth() {
    const card = this.carousel.querySelector('.gallery-item');
    if (!card) return 0;
    const gap = 24;
    return card.offsetWidth + gap;
  }

  scrollByCard(direction) {
    const cardWidth = this.getCardWidth();
    this.carousel.scrollBy({
      left: cardWidth * direction,
      behavior: 'smooth',
    });
  }

  updateButtons() {
    if (!this.prevBtn || !this.nextBtn) return;
    const scrollLeft = this.carousel.scrollLeft;
    const maxScroll = this.carousel.scrollWidth - this.carousel.clientWidth;
    this.prevBtn.disabled = scrollLeft <= 5;
    this.nextBtn.disabled = scrollLeft >= maxScroll - 5;
  }
}

// Init Section 5 au chargement
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    // Spot lumineux : skip sur mobile et prefers-reduced-motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (window.innerWidth >= 768 && !reducedMotion) {
      try { window.__revelationSpot = new RevelationSpot(); }
      catch (e) { console.warn('[site] RevelationSpot failed', e); }
    }

    // Galerie carousel : toujours actif
    try { window.__galleryCarousel = new GalleryCarousel(); }
    catch (e) { console.warn('[site] GalleryCarousel failed', e); }
  }, 300);
});
// Fallback si DOMContentLoaded déjà tiré
if (document.readyState !== 'loading') {
  setTimeout(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (window.innerWidth >= 768 && !reducedMotion && !window.__revelationSpot) {
      try { window.__revelationSpot = new RevelationSpot(); }
      catch (e) {}
    }
    if (!window.__galleryCarousel) {
      try { window.__galleryCarousel = new GalleryCarousel(); }
      catch (e) {}
    }
  }, 300);
}


// ═══════════════════════════════════════════════════════════
// SECTION 7 — BrandsList (V3 — version statique hover-only)
// Plus de scroll-driven, plus d'image preview. Liste verticale
// statique des marques. Au survol d'une marque → logo officiel
// + description apparaissent en fade-in dans le grid.
// ═══════════════════════════════════════════════════════════
class BrandsWheel {
  constructor() {
    this.section     = document.querySelector('.section-marques');
    this.grid        = document.querySelector('.marques-grid');
    this.items       = document.querySelectorAll('.wheel-item');
    this.logoSlides  = document.querySelectorAll('.logo-slide');
    this.descEl      = document.querySelector('[data-cfg="marques-description"]');

    if (!this.section || !this.items.length) return;

    this.currentActive = -1;
    this.hideTimer = null;
    this.initHover();
  }

  initHover() {
    this.items.forEach((item, index) => {
      item.style.cursor = 'pointer';

      item.addEventListener('mouseenter', () => {
        clearTimeout(this.hideTimer);
        this.grid?.classList.add('has-active');
        if (index !== this.currentActive) {
          this.currentActive = index;
          this.syncActive(index);
        }
      });

      item.addEventListener('mouseleave', () => {
        // Petit délai pour éviter le flicker quand on passe d'un item à l'autre
        this.hideTimer = setTimeout(() => {
          this.grid?.classList.remove('has-active');
          this.currentActive = -1;
        }, 220);
      });
    });
  }

  syncActive(index) {
    // Sync logo officiel
    this.logoSlides.forEach((slide, i) => slide.classList.toggle('active', i === index));

    // Sync nom actif (highlight)
    this.items.forEach((it, i) => it.classList.toggle('is-hovered', i === index));

    // Sync description text (alimentée par apply-config.js → window.__marquesDescriptions)
    const descs = window.__marquesDescriptions;
    if (this.descEl && Array.isArray(descs) && descs[index] != null) {
      this.descEl.textContent = descs[index];
    }
  }
}

function __initBrandsWheel() {
  setTimeout(() => {
    try {
      window.__brandsWheel = new BrandsWheel();
      if (typeof window.ScrollTrigger === 'function') window.ScrollTrigger.refresh();
    } catch (e) {
      console.warn('[site] BrandsWheel failed', e);
    }
  }, 250);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', __initBrandsWheel);
} else {
  __initBrandsWheel();
}

// ═══════════════════════════════════════════════════════════
// SECTION PARTENAIRES — marquee logos + sparkles canvas
// ═══════════════════════════════════════════════════════════
// 1. Marquee horizontal infini (rAF, iOS-safe — pas de @keyframes infinies)
//    Pattern : 2 .partenaires-set côte à côte, transform translate3d
//    décrémenté de dt*speed à chaque frame ; quand position <= -setWidth,
//    on remet à zéro pour un loop continu invisible.
// 2. Canvas sparkles : N particules en bas du dôme, opacité oscillante,
//    déplacement Brownien lent. Respecte prefers-reduced-motion.
// ═══════════════════════════════════════════════════════════
function __initPartenaires() {
  const section = document.querySelector('.section-partenaires');
  if (!section) return;

  const cfg = window.__partenairesConfig || { cycleDurationMs: 40000, sparklesDensity: 120 };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ───── 0. Animation word-by-word du titre — déclenchée à l'entrée en vue ─────
  // Chaque .word-animate porte un data-delay (ms) calculé par apply-config.js.
  // Quand la section entre dans le viewport (≥30 %), on pose la classe
  // .is-in-view sur le header → la règle CSS .is-in-view .word-animate active
  // l'animation keyframe partenaires-word-appear. Le stagger est obtenu via
  // animation-delay individuel posé en inline pour chaque mot.
  const header = section.querySelector('[data-partenaires-header]');
  const titleWords = section.querySelectorAll('.partenaires-title .word-animate');
  if (header && titleWords.length) {
    titleWords.forEach(w => {
      const delay = parseInt(w.getAttribute('data-delay'), 10) || 0;
      w.style.animationDelay = `${delay}ms`;
    });
    if (reduceMotion) {
      header.classList.add('is-in-view');
    } else if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            header.classList.add('is-in-view');
            io.disconnect();
          }
        });
      }, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });
      io.observe(header);
    } else {
      header.classList.add('is-in-view');
    }
  }

  // ───── 1. Marquee logos (rAF translate3d) ─────
  const sets = section.querySelectorAll('[data-partenaires-set]');
  if (sets.length && !reduceMotion) {
    let setWidth = 0, position = 0, lastTs = 0, rafId = null, paused = false;
    const CYCLE = cfg.cycleDurationMs;

    const measure = () => { setWidth = sets[0].getBoundingClientRect().width; };

    const tick = (ts) => {
      if (paused) { rafId = requestAnimationFrame(tick); return; }
      if (!lastTs) lastTs = ts;
      const dt = ts - lastTs; lastTs = ts;
      if (setWidth > 0) {
        const speed = setWidth / CYCLE;
        position -= dt * speed;
        if (position <= -setWidth) position += setWidth;
        const tx = `translate3d(${position.toFixed(2)}px, 0, 0)`;
        sets.forEach(s => { s.style.transform = tx; });
      }
      rafId = requestAnimationFrame(tick);
    };

    const recalibrate = () => {
      const old = setWidth; measure();
      if (old > 0 && setWidth > 0) position = (position / old) * setWidth;
    };

    document.addEventListener('visibilitychange', () => {
      paused = document.hidden; lastTs = 0;
    });

    // Démarrage : attendre les images du 1er set (logos SVG)
    const firstSetImgs = sets[0].querySelectorAll('img');
    let loaded = 0;
    const launch = () => {
      if (rafId) return;
      measure(); lastTs = 0;
      rafId = requestAnimationFrame(tick);
    };
    const startIfReady = () => { loaded++; if (loaded >= firstSetImgs.length) launch(); };
    if (firstSetImgs.length === 0) {
      launch();
    } else {
      firstSetImgs.forEach(img => {
        if (img.complete && img.naturalWidth > 0) startIfReady();
        else {
          img.addEventListener('load',  startIfReady, { once: true });
          img.addEventListener('error', startIfReady, { once: true });
        }
      });
      // Filet de sécurité
      setTimeout(() => { if (!rafId) launch(); }, 2000);
    }

    if ('ResizeObserver' in window) new ResizeObserver(recalibrate).observe(sets[0]);
    else window.addEventListener('resize', recalibrate);
  }

  // ───── 2. Canvas sparkles — RETIRÉ.
  // Le dôme + sparkles ont été remplacés par .gradient-blobs (CSS animation,
  // partagé avec la section avis). Voir style.css : @keyframes blob-move-*.
  // Le code ci-dessous est désactivé via un selector qui n'existe plus dans
  // le DOM ; conservé en tant que documentation historique.
  const canvas = section.querySelector('[data-partenaires-sparkles]');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, particles = [], rafId = null, paused = false;

    // Couleur terracotta (#A66B5C, var --accent du système) — chaud, présent
    // sur fond crème, en accord avec le glow du dôme et l'italique du titre.
    const PARTICLE_COLOR = 'rgba(166, 107, 92,';

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width  = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      seedParticles();
    };

    const seedParticles = () => {
      const N = Math.max(100, Math.min(600, cfg.sparklesDensity));
      particles = new Array(N).fill(0).map(() => ({
        x: Math.random() * W,
        y: Math.random() * H,                       // distribution uniforme (masque CSS gère la zone visible)
        r: 1.0 + Math.random() * 2.0,               // 1.0 à 3.0 px — plus gros, visibles à l'œil nu
        // Mouvement Brownien clairement perceptible (~50 px/s)
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        phase: Math.random() * Math.PI * 2,
        freq: 0.0015 + Math.random() * 0.005,       // période 0.8s à 4s (twinkle visible)
        // Opacité élevée — particules ink franches sur fond crème
        maxOp: 0.55 + Math.random() * 0.4,
      }));
    };

    const tick = (ts) => {
      if (paused) { rafId = requestAnimationFrame(tick); return; }
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        // Wrap-around aux bords (continuité de mouvement)
        if (p.x < -2) p.x = W + 2; else if (p.x > W + 2) p.x = -2;
        if (p.y < -2) p.y = H + 2; else if (p.y > H + 2) p.y = -2;
        const op = (Math.sin(ts * p.freq + p.phase) * 0.5 + 0.5) * p.maxOp;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = PARTICLE_COLOR + op.toFixed(3) + ')';
        ctx.fill();
      }
      rafId = requestAnimationFrame(tick);
    };

    document.addEventListener('visibilitychange', () => { paused = document.hidden; });

    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener('resize', resize);

    resize();
    rafId = requestAnimationFrame(tick);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(__initPartenaires, 50));
} else {
  setTimeout(__initPartenaires, 50);
}

// ═══════════════════════════════════════════════════════════
// SECTION AVIS — 3 colonnes scroll vertical infini + word-appear titre
// ═══════════════════════════════════════════════════════════
// Pour chaque colonne :
//   - Le track contient le set d'avis dupliqué (set + set' empilés)
//   - On translate Y de 0 à -setHeight (hauteur du 1er set + son padding)
//   - Une fois atteint, on remet à 0 (loop continu invisible)
//   - Durée différente par colonne (data-duration en secondes)
// ═══════════════════════════════════════════════════════════
function __initAvis() {
  // Le bloc avis est maintenant nesté DANS .section-partenaires (fusion).
  // On le retrouve via .avis-block ; fallback sur l'ancien .section-avis
  // au cas où un autre template utilise encore l'ancienne structure.
  const section = document.querySelector('.avis-block') || document.querySelector('.section-avis');
  if (!section) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ───── Animation word-by-word du titre ─────
  const header = section.querySelector('[data-avis-header]');
  const titleWords = section.querySelectorAll('.avis-title .word-animate');
  if (header && titleWords.length) {
    titleWords.forEach(w => {
      const delay = parseInt(w.getAttribute('data-delay'), 10) || 0;
      w.style.animationDelay = `${delay}ms`;
    });
    if (reduceMotion) {
      header.classList.add('is-in-view');
    } else if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            header.classList.add('is-in-view');
            io.disconnect();
          }
        });
      }, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });
      io.observe(header);
    } else {
      header.classList.add('is-in-view');
    }
  }

  if (reduceMotion) return; // pas de marquee animé en reduced-motion

  // ───── Marquee vertical par colonne (rAF) ─────
  const cfg = window.__avisConfig || { col1: 22, col2: 28, col3: 25 };
  const durations = [cfg.col1, cfg.col2, cfg.col3];

  document.querySelectorAll('[data-avis-column]').forEach((col, idx) => {
    const track = col.querySelector('[data-avis-track]');
    if (!track) return;
    const duration = (parseFloat(col.getAttribute('data-duration')) || durations[idx] || 22) * 1000;
    if (track.children.length < 2) return; // rien à boucler

    let setHeight = 0, position = 0, lastTs = 0, rafId = null, paused = false;

    // Mesure : la moitié de la hauteur totale du track (puisque le set est dupliqué)
    const measure = () => { setHeight = track.scrollHeight / 2; };

    const tick = (ts) => {
      if (paused) { rafId = requestAnimationFrame(tick); return; }
      if (!lastTs) lastTs = ts;
      const dt = ts - lastTs; lastTs = ts;
      if (setHeight > 0) {
        const speed = setHeight / duration;
        position -= dt * speed;
        if (position <= -setHeight) position += setHeight;
        track.style.transform = `translate3d(0, ${position.toFixed(2)}px, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    const recalibrate = () => {
      const old = setHeight; measure();
      if (old > 0 && setHeight > 0) position = (position / old) * setHeight;
    };

    document.addEventListener('visibilitychange', () => { paused = document.hidden; lastTs = 0; });

    const launch = () => {
      if (rafId) return;
      measure(); lastTs = 0;
      rafId = requestAnimationFrame(tick);
    };

    // Pause quand la section sort du viewport (économie CPU)
    if ('IntersectionObserver' in window) {
      const visIo = new IntersectionObserver((entries) => {
        entries.forEach(e => { paused = !e.isIntersecting; if (!paused) lastTs = 0; });
      }, { threshold: 0 });
      visIo.observe(section);
    }

    // Attendre que les fonts et le layout soient stables
    if ('fonts' in document && document.fonts.ready) {
      document.fonts.ready.then(launch);
    } else {
      setTimeout(launch, 100);
    }

    if ('ResizeObserver' in window) new ResizeObserver(recalibrate).observe(track);
    else window.addEventListener('resize', recalibrate);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(__initAvis, 80));
} else {
  setTimeout(__initAvis, 80);
}

/* === VÆON · Bouton WhatsApp flottant (overlay conversion sur la maquette) ===
   Injecté en couche au-dessus du site client : permet au prospect qui visite
   la maquette de contacter VÆON sans casser l'identité de la démo.
   CSS inclus (classe préfixée .vaeon-wa-* pour éviter toute collision). */
(function(){
  function mount(){
    if (document.querySelector('.vaeon-wa-fab')) return;
    var css =
      '.vaeon-wa-fab{position:fixed;right:24px;bottom:24px;z-index:99999;display:inline-flex;align-items:center;gap:11px;padding:15px 22px;border-radius:999px;background:#25d366;color:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;font-weight:600;font-size:15px;line-height:1;white-space:nowrap;text-decoration:none;box-shadow:0 8px 24px rgba(0,0,0,.30),0 0 0 6px rgba(37,211,102,.16);transition:transform .25s,box-shadow .25s,background .25s;animation:vaeonWaPulse 2.6s ease-in-out infinite}'
    + '.vaeon-wa-fab svg{width:26px;height:26px;display:block;flex-shrink:0}'
    + '.vaeon-wa-fab:hover{background:#1ebe5a;transform:translateY(-3px);box-shadow:0 12px 30px rgba(0,0,0,.42),0 0 0 8px rgba(37,211,102,.22);animation-play-state:paused}'
    + '@keyframes vaeonWaPulse{0%,100%{box-shadow:0 8px 24px rgba(0,0,0,.30),0 0 0 0 rgba(37,211,102,.30)}50%{box-shadow:0 8px 24px rgba(0,0,0,.30),0 0 0 12px rgba(37,211,102,0)}}'
    + '@media(max-width:760px){.vaeon-wa-fab{right:18px;bottom:18px;width:54px;height:54px;padding:0;gap:0;justify-content:center}.vaeon-wa-fab .vaeon-wa-label{display:none}.vaeon-wa-fab svg{width:29px;height:29px}}'
    + '@media(prefers-reduced-motion:reduce){.vaeon-wa-fab{animation:none}}';
    var st = document.createElement('style');
    st.setAttribute('data-vaeon-wa','1');
    st.textContent = css;
    document.head.appendChild(st);
    var a = document.createElement('a');
    a.className = 'vaeon-wa-fab';
    a.href = "https://wa.me/33756851228?text=Bonjour,%20je%20viens%20de%20voir%20vos%20maquettes%20et%20j'aimerais%20en%20savoir%20plus.";
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', 'Contacter VÆON sur WhatsApp');
    a.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.38 9.38 0 0 1-1.44-5.01c0-5.18 4.22-9.4 9.41-9.4 2.51 0 4.87.98 6.64 2.76a9.34 9.34 0 0 1 2.75 6.65c0 5.18-4.22 9.41-9.4 9.41zm8-17.41A11.36 11.36 0 0 0 12.04.75C5.81.75.74 5.82.74 12.05c0 1.99.52 3.94 1.51 5.66L.65 23.25l5.68-1.49a11.3 11.3 0 0 0 5.7 1.46h.01c6.23 0 11.3-5.07 11.3-11.3 0-3.02-1.18-5.86-3.32-8z"/></svg><span class="vaeon-wa-label">Discuter sur WhatsApp</span>';
    document.body.appendChild(a);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
