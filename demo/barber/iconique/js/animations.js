// =====================================================
// ANIMATIONS.JS — Barber Iconique (Ever-style hero)
//
// Une seule animation pour l'instant : la timeline scroll-driven
// du hero. Pinned sur 200% de hauteur, avec scrub.
//
// Phases (fraction de progress 0..1) :
//   0.0 → 0.3 : statique (état initial)
//   0.3 → 0.6 : titre fade out, eyebrow/sous-titre fade vers .3
//   0.4 → 0.9 : photo s'étend 50% → 100%, crème rétrécit 50% → 0%
//               + eyebrow / sous-titre / scroll-indicator fade → 0
//   0.7 → 1.0 : photo zoom léger scale 1 → 1.08
//
// Garanties :
//   - prefers-reduced-motion → skip total (CSS gère l'état final)
//   - mobile (< 768px) → skip (CSS gère le layout vertical)
//   - GSAP/ScrollTrigger absents → no-op (pas de bug, juste pas d'anim)
// =====================================================

(() => {
  const C = window.SITE_CONFIG || {};
  const opts = C.animations || {};

  const reduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;
  const isTouch  = ('ontouchstart' in window);

  // Skip TOUT si reduced motion (CSS gère l'état final)
  if (reduced) return;

  // Sur mobile, on garde les reveals au scroll (section 2) mais on
  // désactive le hero scroll-driven (pin) qui est trop lourd / buggy iOS.
  // Sur desktop, tout joue.
  const skipHeroPin = (isMobile && opts.desactiverSurMobile !== false) || (opts.heroScrollDriven === false);

  // Attendre que GSAP + ScrollTrigger soient chargés (defer)
  const start = () => {
    if (typeof window.gsap !== 'object' || typeof window.ScrollTrigger !== 'function') {
      return false;
    }

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    // Helper : appelle gsap.from() uniquement si au moins un élément ciblé
    // existe dans le DOM. Évite les warnings "GSAP target X not found"
    // pour les sélecteurs visant du contenu injecté async par apply-config.js.
    const safeFrom = (target, vars) => {
      const sel = Array.isArray(target) ? target.find(s => document.querySelector(s)) : target;
      if (sel && document.querySelector(sel)) gsap.from(target, vars);
    };

    // Sync Lenis ↔ ScrollTrigger si Lenis dispo
    const lenis = window.__lenis;
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    // ─── Hero scroll-driven timeline ───
    // (skip sur mobile via skipHeroPin → CSS gère le layout vertical)
    const heroSection = document.querySelector('.hero-section');
    if (heroSection && !skipHeroPin) {
      // État initial explicite (au cas où le CSS aurait été modifié)
      gsap.set('.hero-bg-pane',    { width: '50%' });
      gsap.set('.hero-photo-pane', { width: '50%' });
      gsap.set('.hero-photo-pane img, .hero-photo-pane .hero-photo-placeholder', { scale: 1 });
      gsap.set('.hero-title',           { opacity: 1 });
      // .hero-eyebrow : retiré (badge "001 SIGNATURE" désactivé dans index.html).
      // Pour réactiver : remettre le <p class="hero-eyebrow"> + rétablir cette ligne.
      gsap.set('.hero-bottom',          { opacity: 1 });
      gsap.set('.hero-scroll-indicator',{ opacity: 1 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: '+=200%',          // 2 hauteurs d'écran de scroll
          pin: true,
          scrub: 0.8,             // smooth lerp
          anticipatePin: 1,
        },
      });

      // Phase 2 (0.3 → 0.6) : titre fade out
      tl.to('.hero-title',
        { opacity: 0, ease: 'power2.in', duration: 0.3 },
        0.3
      );

      // Phase 2-3 (0.4 → 0.7) : sous-titre + scroll indicator fade out
      // (.hero-eyebrow retiré du tableau — élément intentionnellement absent du HTML)
      tl.to(['.hero-bottom', '.hero-scroll-indicator'],
        { opacity: 0, ease: 'power2.in', duration: 0.3 },
        0.4
      );

      // Phase 3 (0.4 → 0.9) : photo s'étend MODÉRÉMENT, crème reste visible
      // Anciens : 50% → 100% / 0%. Trop fort, donnait un effet "face en plein écran".
      // Nouvelles cibles : 50% → 65% / 35%. Le split crème/photo reste lisible.
      tl.to('.hero-photo-pane',
        { width: '65%', ease: 'power2.out', duration: 0.5 },
        0.4
      );
      tl.to('.hero-bg-pane',
        { width: '35%', ease: 'power2.out', duration: 0.5 },
        0.4
      );

      // Phase 4 — scale-zoom DÉSACTIVÉ (avant: 1 → 1.04)
      // L'expansion 50%→65% suffit à créer l'effet de mise en avant.
      // Pour réactiver : décommenter en abaissant à 1.02 max.
      // tl.to('.hero-photo-pane img, .hero-photo-pane .hero-photo-placeholder',
      //   { scale: 1.02, ease: 'power2.out', duration: 0.3 },
      //   0.7
      // );
    }

    // ─── SECTION 2 — Animations au scroll (reveals progressifs) ───
    // 4 timelines indépendants déclenchés à différents % d'entrée
    // dans le viewport. Toggle "play none none reverse" → revient à
    // l'état initial quand on scroll-up (utile pour le polish).
    if (opts.sectionRevealAnims !== false) {
      const sectionPersonalise = document.querySelector('.section-personalise');
      if (sectionPersonalise) {

        // 1. Eyebrow (numero, ligne, label) — stagger doux
        safeFrom('.personalise-eyebrow > *', {
          scrollTrigger: {
            trigger: sectionPersonalise,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
          opacity: 0,
          y: 20,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out',
        });

        // 2. Lignes du titre (chacune avec stagger 150ms)
        safeFrom('.personalise-title .title-line', {
          scrollTrigger: {
            trigger: sectionPersonalise,
            start: 'top 65%',
            toggleActions: 'play none none reverse',
          },
          opacity: 0,
          y: 40,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
        });

        // 3. Photo portrait — scale-up doux
        safeFrom('.personalise-portrait', {
          scrollTrigger: {
            trigger: sectionPersonalise,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
          opacity: 0,
          scale: 0.92,
          duration: 1.2,
          ease: 'power2.out',
        });

        // 4. Description italique — fade up final
        safeFrom('.personalise-description p', {
          scrollTrigger: {
            trigger: '.personalise-description',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: 'power2.out',
        });
      }
    }

    // ─── SECTION 3 — L'Expérience / Méthode ───
    // Eyebrow + titre + sous-titre + 3 raisons + photos sépia latérales
    if (opts.sectionExperienceAnims !== false) {
      const sectionExperience = document.querySelector('.section-experience');
      if (sectionExperience) {

        // 1. Eyebrow + titre + sous-titre : reveal en cascade
        gsap.from(['.experience-eyebrow', '.experience-title', '.experience-subtitle'], {
          scrollTrigger: {
            trigger: sectionExperience,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
          opacity: 0,
          y: 30,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
        });

        // 2. 3 colonnes raisons : reveal en cascade
        gsap.from('.experience-reason', {
          scrollTrigger: {
            trigger: '.experience-reasons',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
          opacity: 0,
          y: 40,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power2.out',
        });

        // 3. TRANSITION COULEUR — fond dark brown → cream (style Ever)
        //    Anime les variables CSS --section-bg et --section-fg pendant le scroll.
        //    Le texte (titre, sous-titre, reasons) suit automatiquement via var(--section-fg).
        gsap.fromTo(sectionExperience,
          {
            '--section-bg':      '#3A2E1C',
            '--section-fg':      '#F5F0E8',
            '--section-fg-soft': 'rgba(245,240,232,.75)',
          },
          {
            '--section-bg':      '#F5F0E8',
            '--section-fg':      '#1A1814',
            // Fix contraste : brun très foncé presque opaque (était rgba(92,84,74,.85)
            // qui rendait #736B62 sur fond crème = contraste 4:1 limite pour italique fin)
            '--section-fg-soft': 'rgba(40,32,22,.95)',
            ease: 'none',
            scrollTrigger: {
              trigger: sectionExperience,
              start: 'top 70%',
              // Fix lisibilité : scrub finit plus tôt (était 'center 30%')
              // pour que les couleurs soient stabilisées avant que l'utilisateur
              // lise les reasons (qui sont en bas de la section)
              end:   'center 60%',
              scrub: 0.8,
            },
          }
        );

        // 3.5 BASCULE DATA-THEME — header smart-contrast suit le fond.
        //     À mi-transition (progress > 0.5), le fond est devenu suffisamment
        //     clair pour que le header doive repasser en texte sombre.
        //     End aligné avec le scrub couleur pour éviter un décalage visuel.
        ScrollTrigger.create({
          trigger: sectionExperience,
          start:   'top 70%',
          end:     'center 60%',
          onUpdate: (self) => {
            sectionExperience.dataset.theme = self.progress > 0.5 ? 'light' : 'dark';
          },
        });

        // 4. PARALLAX PHOTOS — gauche monte plus vite que droite (effet Ever).
        //    Les deux photos translatent verticalement sur toute la durée
        //    de la section, mais avec des amplitudes différentes.
        //    Gauche : -120vh (rapide), Droite : -60vh (lent).
        gsap.fromTo('.experience-photo-left',
          { yPercent: 80, opacity: 0 },
          {
            yPercent: -80,                    // amplitude grande = rapide
            opacity:  1,
            ease:     'none',
            scrollTrigger: {
              trigger: sectionExperience,
              start:   'top bottom',
              end:     'bottom top',
              scrub:   1,
            },
          }
        );

        gsap.fromTo('.experience-photo-right',
          { yPercent: 40, opacity: 0 },
          {
            yPercent: -40,                    // amplitude moitié moindre = lent
            opacity:  1,
            ease:     'none',
            scrollTrigger: {
              trigger: sectionExperience,
              start:   'top bottom',
              end:     'bottom top',
              scrub:   1,
            },
          }
        );
      }
    }

    // ─── SECTION 4 — Interactive Face Map ───
    // Photo bg parallax + numéros cascade + card slide depuis le bas
    if (opts.sectionFacemapAnims !== false) {
      const sectionFacemap = document.querySelector('.section-facemap');
      if (sectionFacemap) {

        // 1. Photo background : léger parallax au scroll
        gsap.to('.facemap-bg-img', {
          scrollTrigger: {
            trigger: sectionFacemap,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
          y: -60,
          scale: 1.05,
          ease: 'none',
        });

        // 2. Numéros + card : pas d'animation gsap.from car elle laissait
        // les éléments à scale:0/opacity:0 quand ScrollTrigger ne déclenchait
        // pas correctement (race condition avec le mode pinned du hero).
        // À la place : reveal CSS-only via une classe ajoutée au moment où
        // ScrollTrigger detecte l'entrée. Si jamais l'anim ne tire pas,
        // les éléments restent visibles (état naturel CSS).
        ScrollTrigger.create({
          trigger: sectionFacemap,
          start: 'top 80%',
          once: true,
          onEnter: () => sectionFacemap.classList.add('is-revealed'),
        });
        // Sécurité : si la section est déjà passée au load, marque comme révélée
        const rect = sectionFacemap.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          sectionFacemap.classList.add('is-revealed');
        }
      }
    }

    return true;
  };

  // Boot : retry jusqu'à ce que GSAP soit dispo (défer)
  if (!start()) {
    let tries = 0;
    const interval = setInterval(() => {
      tries++;
      if (start() || tries > 50) clearInterval(interval);
    }, 100);
  }
})();


// ═══════════════════════════════════════════════════════════
// SECTION 5 — Zoom into mouth + transition vers galerie
// 4 phases via une seule timeline ScrollTrigger pinned :
//   - Phase 1 (0% → 30%) : hint disparaît
//   - Phase 2 (0% → 70%) : effet torche s'ouvre — le masque radial passe
//                          de 240px à ~4000px (révèle toute la photo)
//   - Phase 3 (50% → 80%) : galerie crème opacity 0 → 1
//   - Phase 4 (70% → 90%) : photo + mot géant fade out
// Skip sur mobile et prefers-reduced-motion.
// ═══════════════════════════════════════════════════════════
function __initRevelationSection() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;

  // Sur mobile/reduced-motion : galerie directement visible (pas de zoom)
  if (reducedMotion || isMobile) {
    const gallery = document.querySelector('[data-revelation-gallery]');
    if (gallery) gallery.classList.add('visible');
    return;
  }

  // Attente des libs CDN (gsap + ScrollTrigger en defer)
  if (typeof window.gsap !== 'object' || typeof window.ScrollTrigger !== 'function') {
    setTimeout(__initRevelationSection, 200);
    return;
  }

  const section = document.querySelector('.section-revelation');
  const stage = document.querySelector('[data-revelation-stage]');
  const mouthWrapper = document.querySelector('[data-mouth-wrapper]');
  const gallery = document.querySelector('[data-revelation-gallery]');
  const hint = document.querySelector('[data-revelation-hint]');

  if (!section || !stage || !mouthWrapper || !gallery) return;

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  // Timeline du zoom progressif (pin sur la stage)
  const zoomTL = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      pin: stage,
      pinSpacing: false,
      anticipatePin: 1,
    },
  });

  // Phase 1 (0% → 30%) : hint disparaît
  if (hint) {
    zoomTL.to(hint, { opacity: 0, y: 20, duration: 0.3 }, 0);
  }

  // Phase 2 (0% → 70%) : EFFET TORCHE — le masque radial s'ouvre
  // progressivement, dévoilant toute la photo. On agrandit --reveal-size
  // de 320px à 4000px (couvre largement le viewport, photo entièrement visible).
  zoomTL.to(mouthWrapper, {
    '--reveal-size': '4000px',
    duration: 0.7,
    ease: 'power2.in',
  }, 0);

  // Phase 3 (50% → 80%) : galerie apparaît
  zoomTL.to(gallery, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.5);

  // Phase 4 (70% → 90%) : photo fade out (galerie prend le relais)
  zoomTL.to(mouthWrapper, { opacity: 0, duration: 0.2, ease: 'power2.in' }, 0.7);

  // Galerie devient interactive quand le scroll atteint 50%
  ScrollTrigger.create({
    trigger: section,
    start: 'center top',
    end: 'bottom bottom',
    onEnter: () => gallery.classList.add('visible'),
    onLeaveBack: () => gallery.classList.remove('visible'),
  });

  // Refresh ScrollTrigger après load complet
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', __initRevelationSection);
} else {
  __initRevelationSection();
}

// ═══════════════════════════════════════════════════════════
// FOOTER — Apparition au scroll
// 3 colonnes en cascade puis bottom bar
// ═══════════════════════════════════════════════════════════
function __initFooterAnimations() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  // Attente des libs CDN (gsap + ScrollTrigger en defer)
  if (typeof window.gsap !== 'object' || typeof window.ScrollTrigger !== 'function') {
    setTimeout(__initFooterAnimations, 200);
    return;
  }

  const footer = document.querySelector('.site-footer');
  if (!footer) return;

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  // Les 3 colonnes apparaissent en cascade
  gsap.from('.footer-column', {
    scrollTrigger: {
      trigger: '.site-footer',
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 30,
    duration: 1,
    stagger: 0.15,
    ease: 'power3.out',
  });

  // Bottom bar (nom + mentions)
  gsap.from('.footer-bottom', {
    scrollTrigger: {
      trigger: '.footer-divider',
      start: 'top 90%',
      toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 20,
    duration: 0.8,
    delay: 0.3,
    ease: 'power2.out',
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', __initFooterAnimations);
} else {
  __initFooterAnimations();
}
