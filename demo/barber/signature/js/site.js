// =====================================================
// SITE.JS — Logique partagée par les 3 pages
// Ne rien modifier ici : le contenu se règle dans config.js.
//
// Modules :
//   1. Header scroll state (data-top)
//   2. Mobile menu (burger)
//   3. Reveal on scroll (IntersectionObserver)
//   4. Hero video bulletproof (autoplay, codec fallback, iOS Safari fixes)
//   5. Marquee partenaires (requestAnimationFrame, iOS-safe)
//   6. Planity modal (home — fallback ouverture nouvelle page)
//   7. Behold Instagram visibility
// =====================================================

(() => {
  // ============================================================
  // 1. HEADER SCROLL STATE — uniquement sur la page d'accueil
  //    (les autres pages ont un header en mode "scrolled" forcé via CSS)
  // ============================================================
  const header = document.getElementById('siteHeader');
  if (header && document.body.dataset.page === 'home') {
    const onScroll = () => { header.dataset.top = window.scrollY < 40 ? 'true' : 'false'; };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ============================================================
  // 2. MOBILE MENU
  // ============================================================
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('mobileMenu');
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      if (open) {
        menu.hidden = true;
      } else {
        menu.hidden = false;
        // Force le header en mode "scrolled" pour la lisibilité (uniquement home)
        if (header && document.body.dataset.page === 'home') header.dataset.top = 'false';
      }
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      burger.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
    }));
  }

  // ============================================================
  // 3. REVEAL ON SCROLL
  //    Différé au DOMContentLoaded pour que le contenu dynamique
  //    injecté par apply-config.js (prestations, avis, piliers…)
  //    soit aussi observé. apply-config.js a enregistré son listener
  //    en premier (depuis <head>), donc apply() s'exécute AVANT ce
  //    callback — tout le DOM est prêt ici.
  //    `data-revealed` empêche la double-observation si appelé 2 fois.
  // ============================================================
  const setupReveal = () => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items  = document.querySelectorAll('.reveal:not([data-revealed])');
    if (!items.length) return;
    items.forEach(el => el.setAttribute('data-revealed', '1'));
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          e.target.style.transitionDelay = `${Math.min(i * 50, 220)}ms`;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(el => io.observe(el));
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupReveal);
  } else {
    setupReveal();
  }

  // ============================================================
  // 4. HERO VIDEO BULLETPROOF (home uniquement)
  //    Lecture autoplay résiliente — Safari iOS, Chrome, Firefox.
  //    Préserve TOUS les fixes Safari : codec fallback, playsinline,
  //    pause/visibility recovery, fallback poster en cas d'erreur.
  // ============================================================
  (() => {
    const v = document.getElementById('heroVideo');
    if (!v) return;

    const DESKTOP_SRC    = v.dataset.srcDesktop || '';
    const MOBILE_SRC     = v.dataset.srcMobile  || '';
    const DESKTOP_MQ     = window.matchMedia('(min-width: 768px)');
    const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 4.1 prefers-reduced-motion → poster fixe, pas de vidéo
    if (REDUCED_MOTION) {
      v.removeAttribute('autoplay');
      v.removeAttribute('loop');
      v.style.display = 'none';
      return;
    }

    // 4.2 Source picker (laisse <source media> faire le job au démarrage)
    const wantedSrc        = () => DESKTOP_MQ.matches ? DESKTOP_SRC : MOBILE_SRC;
    const hasNativeSources = () => v.querySelectorAll('source').length > 0;
    const ensureCorrectSrc = () => {
      const want    = wantedSrc();
      const cur     = v.getAttribute('src') || '';
      const curRes  = v.currentSrc || '';
      if (cur === want || curRes.endsWith(want)) return false;
      // Au tout début, on laisse les <source> natifs gérer (Safari préchargement)
      if (!curRes && hasNativeSources()) return false;
      const wasPlaying = !v.paused;
      v.src = want; v.load();
      if (wasPlaying) tryPlay();
      return true;
    };

    // 4.3 Re-affirme attributs critiques pour autoplay
    const enforceAutoplayFlags = () => {
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
    };
    enforceAutoplayFlags();

    // 4.4 tryPlay sécurisé
    let playInFlight = false;
    const tryPlay = () => {
      if (playInFlight || !v.paused) return;
      playInFlight = true;
      Promise.resolve(v.play())
        .catch(() => {})
        .finally(() => { playInFlight = false; });
    };

    // 4.5 Reveal — montre la vidéo dès qu'on a une frame
    const reveal = () => v.classList.add('is-playing');
    v.addEventListener('loadeddata', reveal, { once: true });
    v.addEventListener('playing',    reveal, { once: true });
    setTimeout(reveal, 4000);

    // 4.6 Listeners de relance
    v.addEventListener('loadedmetadata',  tryPlay);
    v.addEventListener('loadeddata',      tryPlay);
    v.addEventListener('canplay',         tryPlay);
    v.addEventListener('canplaythrough',  tryPlay);

    // 4.7 Pause inopinée (iOS background, throttling) → relance
    v.addEventListener('pause', () => {
      if (document.hidden) return;
      setTimeout(tryPlay, 50);
    });

    // 4.8 loop cassé Android → restart
    v.addEventListener('ended', () => {
      try { v.currentTime = 0; } catch {}
      tryPlay();
    });

    // 4.9 Erreur codec → essai mobile (autre profil H.264)
    let triedMobileFallback = false;
    v.addEventListener('error', () => {
      if (v.error && v.error.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED && !triedMobileFallback) {
        if (v.currentSrc && v.currentSrc.includes('hero-desktop')) {
          triedMobileFallback = true;
          console.warn('[hero-video] codec desktop refusé, bascule sur mobile');
          v.src = MOBILE_SRC; v.load(); tryPlay();
          return;
        }
      }
      console.warn('[hero-video] erreur de lecture, fallback poster', v.error);
      v.style.display = 'none';
    });

    // 4.10 Visibilité onglet
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) tryPlay();
    });

    // 4.11 Premier geste utilisateur (iOS Low Power Mode)
    const firstGesture = () => {
      enforceAutoplayFlags();
      tryPlay();
      window.removeEventListener('pointerdown', firstGesture);
      window.removeEventListener('touchstart',  firstGesture);
      window.removeEventListener('keydown',     firstGesture);
    };
    window.addEventListener('pointerdown', firstGesture, { once: true, passive: true });
    window.addEventListener('touchstart',  firstGesture, { once: true, passive: true });
    window.addEventListener('keydown',     firstGesture, { once: true });

    // 4.12 Resize/rotation — re-pick source au passage du breakpoint
    let resizeTimer = null;
    const onMqChange = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(ensureCorrectSrc, 200);
    };
    if (DESKTOP_MQ.addEventListener) DESKTOP_MQ.addEventListener('change', onMqChange);
    else if (DESKTOP_MQ.addListener)  DESKTOP_MQ.addListener(onMqChange);

    // 4.13 Watchdog : relance si paused, ré-affirme muted (onglet visible)
    let watchdog = null;
    const startWatchdog = () => {
      if (watchdog) return;
      watchdog = setInterval(() => {
        if (document.hidden) return;
        if (!v.muted) v.muted = true;
        if (v.paused && v.readyState >= 2) tryPlay();
      }, 1500);
    };
    const stopWatchdog = () => { if (watchdog) { clearInterval(watchdog); watchdog = null; } };
    startWatchdog();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopWatchdog(); else startWatchdog();
    });

    // 4.14 Lancement initial
    ensureCorrectSrc();
    tryPlay();

    // 4.15 IntersectionObserver — relance dès retour dans le viewport
    if ('IntersectionObserver' in window) {
      const heroSection = v.closest('.hero');
      if (heroSection) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && v.paused && !document.hidden) tryPlay();
          });
        }, { threshold: 0.1 });
        io.observe(heroSection);
      }
    }

    // 4.16 Filet Safari macOS — force load+play après 2s si toujours pause
    setTimeout(() => {
      if (v.paused && v.readyState < 3 && !document.hidden) {
        try { v.load(); } catch {}
        tryPlay();
      } else if (v.paused && !document.hidden) {
        tryPlay();
      }
    }, 2000);
  })();

  // ============================================================
  // 5. MARQUEE PARTENAIRES — animation JS bulletproof
  //    Pourquoi JS et pas CSS ?
  //    Sur Safari iOS privé, les @keyframes infinies sont sujettes à
  //    throttling et éviction de couches compositor. requestAnimationFrame
  //    garantit un défilement frame-par-frame contrôlé.
  // ============================================================
  (() => {
    // On attend que apply-config.js ait peuplé les sets, sinon mesure incorrecte
    const start = () => {
      const sets = document.querySelectorAll('.marquee-soft .partner-set');
      if (!sets.length) return;

      const CYCLE_DURATION_MS = 40000;
      let setWidth = 0, position = 0, lastTs = 0, rafId = null, paused = false;

      const measure = () => { setWidth = sets[0].getBoundingClientRect().width; };

      const tick = (ts) => {
        if (paused) { rafId = requestAnimationFrame(tick); return; }
        if (!lastTs) lastTs = ts;
        const dt = ts - lastTs; lastTs = ts;
        if (setWidth > 0) {
          const speed = setWidth / CYCLE_DURATION_MS;
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

      document.addEventListener('visibilitychange', () => { paused = document.hidden; lastTs = 0; });

      // Démarrage : on attend les images du premier set
      const firstSetImgs = sets[0].querySelectorAll('img');
      let loaded = 0;
      const startIfReady = () => { loaded++; if (loaded >= firstSetImgs.length) launch(); };
      firstSetImgs.forEach(img => {
        if (img.complete && img.naturalWidth > 0) startIfReady();
        else {
          img.addEventListener('load',  startIfReady, { once: true });
          img.addEventListener('error', startIfReady, { once: true });
        }
      });
      // Filet : démarre dans tous les cas après 2s
      setTimeout(() => { if (!rafId) launch(); }, 2000);

      function launch() {
        if (rafId) return;
        measure(); lastTs = 0;
        rafId = requestAnimationFrame(tick);
      }

      if ('ResizeObserver' in window) new ResizeObserver(recalibrate).observe(sets[0]);
      else window.addEventListener('resize', recalibrate);
    };

    // Démarre après l'injection apply-config
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(start, 50));
    } else {
      setTimeout(start, 50);
    }
  })();

  // ============================================================
  // 6. PLANITY MODAL (home)
  //    Depuis A3 : chaque .presta-row contient son propre CTA Planity
  //    (.presta-cta-btn) — plus besoin d'attacher un listener au row.
  // ============================================================
  const planityModal = document.getElementById('planityModal');
  const planityClose = document.getElementById('planityClose');
  if (planityModal) {
    const close = () => { planityModal.dataset.open = 'false'; document.body.style.overflow = ''; };
    planityClose?.addEventListener('click', close);
    planityModal.addEventListener('click', (e) => { if (e.target === planityModal) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && planityModal.dataset.open === 'true') close(); });
  }

  // (section 7 Behold supprimée — section galerie statique gérée par apply-config.js)
})();
