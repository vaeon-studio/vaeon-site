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
