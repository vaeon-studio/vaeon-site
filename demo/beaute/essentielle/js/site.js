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
