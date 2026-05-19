// =====================================================
// SITE.JS — Logique partagée (Essentielle)
// Ne rien modifier ici : le contenu se règle dans config.js.
//
// Modules :
//   1. Header scroll state (header reste coloré, pas de transparence)
//   2. Mobile menu (burger)
//   3. Reveal on scroll (IntersectionObserver)
// =====================================================

(() => {
  // ============================================================
  // 1. HEADER SCROLL STATE — ombre légère au scroll
  // ============================================================
  const header = document.getElementById('siteHeader');
  if (header) {
    const onScroll = () => { header.dataset.scrolled = window.scrollY > 20 ? 'true' : 'false'; };
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
      if (open) { menu.hidden = true; }
      else      { menu.hidden = false; }
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      burger.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
    }));
  }

  // ============================================================
  // 3. REVEAL ON SCROLL (fade-in IntersectionObserver)
  //    Différé au DOMContentLoaded pour que les .reveal injectés
  //    dynamiquement par apply-config.js (prestations, avis…) soient
  //    aussi observés. apply-config.js enregistre son listener depuis
  //    <head> AVANT site.js, donc son apply() s'exécute en premier.
  //    `data-revealed` empêche la double-observation.
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
})();
