// === Bouton WhatsApp flottant (injecté sur toutes les pages, desktop + mobile) ===
(function() {
  if (document.querySelector('.wa-fab')) return;
  // Message adapté au contexte : tunnel de prospection (landings) vs site vitrine.
  const isProspection = document.body.classList.contains('prosp-body');
  const WA_MSG = isProspection
    ? "Bonjour,%20je%20viens%20de%20voir%20vos%20maquettes%20et%20j'aimerais%20en%20savoir%20plus."
    : "Bonjour,%20je%20vous%20contacte%20au%20sujet%20d'un%20projet%20de%20site.";
  const WA_URL = "https://wa.me/33756851228?text=" + WA_MSG;
  const a = document.createElement('a');
  a.className = 'wa-fab';
  a.href = WA_URL;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.setAttribute('aria-label', 'Contacter VÆON sur WhatsApp');
  a.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.38 9.38 0 0 1-1.44-5.01c0-5.18 4.22-9.4 9.41-9.4 2.51 0 4.87.98 6.64 2.76a9.34 9.34 0 0 1 2.75 6.65c0 5.18-4.22 9.41-9.4 9.41zm8-17.41A11.36 11.36 0 0 0 12.04.75C5.81.75.74 5.82.74 12.05c0 1.99.52 3.94 1.51 5.66L.65 23.25l5.68-1.49a11.3 11.3 0 0 0 5.7 1.46h.01c6.23 0 11.3-5.07 11.3-11.3 0-3.02-1.18-5.86-3.32-8z"/></svg><span class="wa-fab-label">Discuter sur WhatsApp</span>';
  document.body.appendChild(a);

  // Curseur custom : libellé au survol, comme les autres CTA
  const cursor = document.querySelector('.cursor');
  if (cursor) {
    a.addEventListener('mouseenter', () => {
      cursor.classList.add('big');
      cursor.setAttribute('data-label', 'WhatsApp');
    });
    a.addEventListener('mouseleave', () => {
      cursor.classList.remove('big');
      cursor.setAttribute('data-label', '');
    });
  }
})();

// === Mobile burger menu (injecté sur toutes les pages) ===
(function() {
  const existingNav = document.querySelector('header.nav');
  if (!existingNav) return;

  // Read the existing nav links to clone them into the overlay
  const linksEl = existingNav.querySelector('nav.links');
  const ctaEl = existingNav.querySelector('a.cta');
  const links = linksEl ? [...linksEl.querySelectorAll('a')].map(a => ({ href: a.getAttribute('href'), text: a.textContent.trim(), current: a.getAttribute('aria-current') === 'page' })) : [];
  const ctaHref = ctaEl?.getAttribute('href') || '/contact.html';
  const ctaText = ctaEl?.textContent.trim() || 'Contact';

  // Build burger button
  const burger = document.createElement('button');
  burger.className = 'nav-burger';
  burger.type = 'button';
  burger.setAttribute('aria-label', 'Ouvrir le menu');
  burger.setAttribute('aria-expanded', 'false');
  burger.innerHTML = '<span></span><span></span><span></span>';
  document.body.appendChild(burger);

  // Build overlay menu
  const overlay = document.createElement('nav');
  overlay.className = 'nav-menu-overlay';
  overlay.setAttribute('aria-label', 'Menu principal');
  // Use absolute paths when current pathname is not in root, else relative
  const pathDepth = (window.location.pathname.match(/\//g) || []).length;
  const useAbs = pathDepth > 1; // /metiers/X/ has 3 slashes
  const fixHref = (h) => {
    if (!h) return '#';
    if (h.startsWith('/') || h.startsWith('http')) return h;
    return useAbs ? '/' + h : h;
  };
  const linksHtml = links.map(l => `<a href="${fixHref(l.href)}"${l.current ? ' aria-current="page"' : ''}>${l.text}</a>`).join('');
  overlay.innerHTML = `
    <a href="${useAbs ? '/index.html' : 'index.html'}" aria-label="Accueil VÆON" style="font-family:var(--display-mono);font-size:42px;margin-bottom:24px;letter-spacing:-.02em">VÆON</a>
    ${linksHtml}
    <a href="${fixHref(ctaHref)}" class="cta">${ctaText}</a>
  `;
  document.body.appendChild(overlay);

  // Toggle logic
  let isOpen = false;
  const toggle = (force) => {
    isOpen = force !== undefined ? force : !isOpen;
    burger.classList.toggle('open', isOpen);
    overlay.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  burger.addEventListener('click', () => toggle());
  overlay.addEventListener('click', (e) => {
    // Close on any link click
    if (e.target.tagName === 'A') toggle(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) toggle(false);
  });

  // Close on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760 && isOpen) toggle(false);
  });
})();

// === Custom cursor (GPU-accelerated, rAF-throttled) ===
// Skip entirely on touch devices (perf gain : pas de listener mousemove inutile)
const cursor = document.getElementById('cursor');
const hasHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
if (cursor && hasHover) {
  let cx = 0, cy = 0, cursorRaf = null;
  const updateCursor = () => {
    cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
    cursorRaf = null;
  };
  window.addEventListener('mousemove', e => {
    cx = e.clientX;
    cy = e.clientY;
    if (!cursorRaf) cursorRaf = requestAnimationFrame(updateCursor);
  }, { passive: true });
  document.querySelectorAll('a, button, .svc, .proj, .faq-q, .crow').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('big');
      let label = 'Voir';
      if (el.matches('.proj')) label = 'Voir le projet';
      else if (el.matches('.svc')) label = 'Service';
      else if (el.matches('.faq-q')) label = 'Ouvrir';
      else if (el.matches('.crow')) label = 'Voir le site';
      else if (el.matches('button[type="submit"], .submit')) label = 'Envoyer';
      else if (el.matches('a[href*="contact"], .cta, .pill-cta')) label = 'Démarrer';
      cursor.setAttribute('data-label', label);
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('big');
      cursor.setAttribute('data-label', '');
    });
  });
}

// === Cascade hero (8 heros sectoriels) ===
// Chaque entrée représente un site mockupé dans /mockups, avec un aperçu SVG stylisé qui évoque l'identité visuelle de la marque.

const sites = [
  { name: "L'Olivier",      href: 'mockups/hero-1-restaurant.html', stripe: '#0a0908', ink: '#c9a96e' },
  { name: 'Maison Lumière', href: 'mockups/hero-2-institut.html',   stripe: '#c89a8c', ink: '#3a2a26' },
  { name: 'Mèche & Co',     href: 'mockups/hero-3-coiffeur.html',   stripe: '#d4ff3c', ink: '#0e0e0e' },
  { name: 'Chez Léon',      href: 'mockups/hero-4-bistrot.html',    stripe: '#5e1f25', ink: '#f1e8d4' },
  { name: 'Source Spa',     href: 'mockups/hero-5-spa.html',        stripe: '#5d6e57', ink: '#f5f1e8' },
  { name: 'Atelier Coupe',  href: 'mockups/hero-6-architecte.html', stripe: '#c1462b', ink: '#f7f5f0' },
  { name: 'Verveine',       href: 'mockups/hero-7-fleuriste.html',  stripe: '#3d4f2c', ink: '#faf6ee' },
  { name: 'Cabinet Albret', href: 'mockups/hero-8-avocat.html',     stripe: '#a37f4a', ink: '#f5f1e8' },
  { name: 'FLAME',          href: 'mockups/hero-9-fastfood.html',   stripe: '#e84016', ink: '#f4ecdc' },
];

const cascadeInner = document.getElementById('cascadeInner');
if (cascadeInner) {
  // Double the list for seamless infinite scroll
  const list = [...sites, ...sites];
  cascadeInner.innerHTML = list.map(s => `
    <a class="crow" href="${s.href}" target="_blank" rel="noopener" aria-label="${s.name}">
      <div class="shot"><iframe src="${s.href}" loading="lazy" scrolling="no" tabindex="-1" aria-hidden="true"></iframe></div>
    </a>
  `).join('');
}

// === Reveal animations ===
const revealEls = document.querySelectorAll('[data-r]');
if (revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: .1, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach((el, i) => {
    el.style.transitionDelay = ((i % 5) * 60) + 'ms';
    io.observe(el);
  });
}

// === FAQ ===
document.querySelectorAll('.faq-list .faq').forEach(faq => {
  const q = faq.querySelector('.faq-q');
  const a = faq.querySelector('.faq-a');
  if (!q || !a) return;
  if (faq.classList.contains('open')) a.style.maxHeight = a.scrollHeight + 'px';
  q.addEventListener('click', () => {
    const open = faq.classList.toggle('open');
    a.style.maxHeight = open ? a.scrollHeight + 'px' : '0px';
  });
});

// === Form (envoi réel via FormSubmit — pas de preventDefault) ===
// Si l'URL contient ?sent=1 (redirection après envoi), on affiche le message de succès.
if (new URLSearchParams(location.search).get('sent') === '1') {
  const ok = document.getElementById('ok');
  if (ok) ok.classList.add('show');
}

// === Scramble effect on display titles (hero, page hero, sec-title, footer big, etc.) ===
// On hover, each letter rapidly cycles through punctuation/numbers before resolving back.
const SCRAMBLE_CHARS = '!@#$%&*+-=[]{}|;:<>?/~01234567';
const SCRAMBLE_SELECTOR = '.hero h1, .page-hero h1, .sec-title, .footer-big h2, .contact-side h3';
const SCRAMBLE_EXCLUDE = '.small, em';

function wrapTextNodes(host) {
  const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
      let p = node.parentElement;
      while (p && p !== host) {
        if (p.matches(SCRAMBLE_EXCLUDE)) return NodeFilter.FILTER_REJECT;
        p = p.parentElement;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach(node => {
    const frag = document.createDocumentFragment();
    let wordWrap = null;
    for (const ch of node.textContent) {
      if (ch === ' ' || ch === '\n' || ch === '\t') {
        wordWrap = null;
        frag.appendChild(document.createTextNode(ch));
      } else {
        if (!wordWrap) {
          wordWrap = document.createElement('span');
          wordWrap.className = 'scrm-word';
          frag.appendChild(wordWrap);
        }
        const span = document.createElement('span');
        span.className = 'scrm';
        span.dataset.original = ch;
        span.textContent = ch;
        wordWrap.appendChild(span);
      }
    }
    node.replaceWith(frag);
  });

  // Freeze each char's rendered width so scramble doesn't make the layout jitter
  // (Chillax is sans-serif, not mono — chars like '!' vs 'W' have very different widths)
  // Use document.fonts.ready to wait for the actual font, then lock widths.
  const lockWidths = () => {
    host.querySelectorAll('.scrm').forEach(span => {
      const w = span.getBoundingClientRect().width;
      if (w > 0) {
        span.style.width = w + 'px';
        span.style.textAlign = 'center';
      }
    });
  };
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(lockWidths);
  } else {
    setTimeout(lockWidths, 100);
  }
}

function scrambleHost(host) {
  if (host._scrambling) return;
  host._scrambling = true;

  const letters = host.querySelectorAll('.scrm');
  const totalFrames = 22;
  let frame = 0;

  const interval = setInterval(() => {
    letters.forEach((letter, i) => {
      const original = letter.dataset.original;
      // Stagger resolution: earlier letters resolve sooner
      const resolveAt = (i / letters.length) * totalFrames * 0.55 + 6;
      if (frame >= resolveAt) {
        letter.textContent = original;
      } else {
        letter.textContent = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
    });
    frame++;
    if (frame > totalFrames) {
      clearInterval(interval);
      letters.forEach(l => l.textContent = l.dataset.original);
      host._scrambling = false;
    }
  }, 35);
}

const scrambleHosts = [];
document.querySelectorAll(SCRAMBLE_SELECTOR).forEach(host => {
  if (host.closest('.metier-page')) return; // skip métier pages — animation gêne la lecture
  host.classList.add('scrm-host');
  wrapTextNodes(host);
  host.addEventListener('mouseenter', () => scrambleHost(host));
  scrambleHosts.push(host);
});

// Auto-scramble visible titles every 2 seconds, staggered to avoid all firing at once
const SCRAMBLE_TICK = 2000;
const SCRAMBLE_STAGGER = 140;

function isInViewport(el) {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight;
}

setInterval(() => {
  if (document.hidden) return;
  scrambleHosts.forEach((host, i) => {
    if (!isInViewport(host)) return;
    setTimeout(() => scrambleHost(host), i * SCRAMBLE_STAGGER);
  });
}, SCRAMBLE_TICK);

// (Nova Orb 3D keycap removed)
let lastScroll = 0;
let scrollVel = 0;
let rafId = null;

// === Particle text effect — full-screen section after hero ===
const particleSectionCanvas = document.getElementById('particleSection');
if (particleSectionCanvas && typeof window.initParticleText === 'function') {
  let particleCtrl = null;
  // Size canvas internal pixels to match its on-screen display (avoids stretch on mobile)
  const sizeCanvas = () => {
    const rect = particleSectionCanvas.getBoundingClientRect();
    particleSectionCanvas.width = Math.min(Math.max(Math.round(rect.width), 360), 1920);
    particleSectionCanvas.height = Math.min(Math.max(Math.round(rect.height), 480), 1080);
  };
  const startParticles = () => {
    sizeCanvas();
    if (particleCtrl && typeof particleCtrl.destroy === 'function') particleCtrl.destroy();
    // Scale font with canvas width so words fit on small screens
    const fontSize = Math.max(56, Math.min(200, Math.round(particleSectionCanvas.width / 6)));
    // On phones: denser sampling + bigger dots (fuller letters), faster formation and a
    // longer hold per word, so each word reads as complete instead of perpetually morphing.
    // Desktop keeps the original values (byte-identical look).
    const isMobile = window.matchMedia('(max-width:760px)').matches;
    const tuning = isMobile
      ? { pixelSteps: 4, pointSize: 3, speed: 1.6, wordInterval: 320 }
      : { pixelSteps: 6, pointSize: 2, speed: 1.0, wordInterval: 240 };
    particleCtrl = window.initParticleText(particleSectionCanvas, [
      'VÆON',
      'DESIGN',
      'CODE',
      'IDENTITÉ',
      'SUR-MESURE',
    ], Object.assign({ fontSize, fontFamily: 'Geist Mono, monospace' }, tuning));
  };
  startParticles();
  // Re-init on significant viewport change (orientation, browser resize)
  let resizeRaf = null;
  let lastW = particleSectionCanvas.width;
  let lastH = particleSectionCanvas.height;
  window.addEventListener('resize', () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      const rect = particleSectionCanvas.getBoundingClientRect();
      if (Math.abs(lastW - rect.width) > 40 || Math.abs(lastH - rect.height) > 40) {
        startParticles();
        lastW = particleSectionCanvas.width;
        lastH = particleSectionCanvas.height;
      }
    });
  }, { passive: true });
}

// Hero scroll-driven dive (cascade zooms forward as user scrolls through stage)
const scrollStage = document.querySelector('.scroll-stage');
const heroCascade = document.querySelector('.cascade');
const heroFade = document.querySelector('.hero-fade');
const heroFadeEls = document.querySelectorAll('[data-hero-fade]');
const cascadeInnerEl = document.getElementById('cascadeInner');

function updateHeroDive() {
  if (!scrollStage || !heroCascade) return;
  const rect = scrollStage.getBoundingClientRect();
  const max = scrollStage.offsetHeight - window.innerHeight;
  const progress = Math.max(0, Math.min(1, -rect.top / max));

  // Cascade dives subtly: rotation -12° → -4°, scale 1 → 1.1 (no blur, no zoom into image)
  const rot = -12 + progress * 8;
  const scale = 1 + progress * 0.1;
  heroCascade.style.setProperty('--cascade-rot', rot + 'deg');
  heroCascade.style.setProperty('--cascade-scale', scale.toFixed(3));
  if (cascadeInnerEl) cascadeInnerEl.style.animationPlayState = progress > 0.3 ? 'paused' : 'running';

  // Hero text fades out gracefully
  const textOpacity = Math.max(0, 1 - progress * 1.4);
  heroFadeEls.forEach(el => el.style.opacity = textOpacity);
  if (heroFade) heroFade.style.opacity = Math.max(0, 1 - progress * 1.4);
}

function updateOrb() {
  const scroll = window.scrollY;
  const max = Math.max(document.body.scrollHeight - window.innerHeight, 1);
  const progress = Math.min(scroll / max, 1);
  // Velocity tracking (kept for future hooks)
  scrollVel = scrollVel * 0.85 + (scroll - lastScroll) * 0.4;
  lastScroll = scroll;
  rafId = null;
}

// === Manifesto scroll storytelling ===
const manifestoSection = document.querySelector('.manifesto');
const manifestoStatements = document.querySelectorAll('.statement[data-stm]');
const manifestoDots = document.querySelectorAll('.manifesto-progress .mp-dot');
const manifestoNum = document.querySelector('.manifesto-counter .mc-num');

function updateManifesto() {
  if (!manifestoSection || manifestoStatements.length === 0) return;
  const rect = manifestoSection.getBoundingClientRect();
  const max = manifestoSection.offsetHeight - window.innerHeight;
  const progress = Math.max(0, Math.min(1, -rect.top / max));
  const stmCount = manifestoStatements.length;
  const idx = Math.min(stmCount - 1, Math.floor(progress * stmCount * 0.9999));
  manifestoStatements.forEach((stm, i) => {
    stm.classList.toggle('active', i === idx);
  });
  manifestoDots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
  if (manifestoNum) manifestoNum.textContent = String(idx + 1).padStart(2, '0');
}

function tick() {
  updateOrb();
  updateHeroDive();
  updateManifesto();
}

function onScroll() {
  if (rafId === null) rafId = requestAnimationFrame(tick);
}

window.addEventListener('scroll', onScroll, { passive: true });
tick();

// === Matrix text effect (Matrix-style scramble decode on [data-matrix] elements) ===
function matrixifyText(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const textNodes = [];
  let n;
  while ((n = walker.nextNode())) textNodes.push(n);

  const charSpans = [];
  textNodes.forEach(textNode => {
    const frag = document.createDocumentFragment();
    [...textNode.nodeValue].forEach(ch => {
      const span = document.createElement('span');
      span.className = 'mtx-char';
      span.dataset.original = ch;
      span.textContent = ch;
      frag.appendChild(span);
      if (ch.trim()) charSpans.push(span);
    });
    textNode.parentNode.replaceChild(frag, textNode);
  });
  return charSpans;
}

function runMatrixAnimation(charSpans, { initialDelay = 200, letterAnimationDuration = 500, letterInterval = 80 } = {}) {
  setTimeout(() => {
    charSpans.forEach((span, i) => {
      setTimeout(() => {
        span.textContent = Math.random() > 0.5 ? '1' : '0';
        span.classList.add('mtx-on');
        setTimeout(() => {
          span.textContent = span.dataset.original;
          span.classList.remove('mtx-on');
        }, letterAnimationDuration);
      }, i * letterInterval);
    });
  }, initialDelay);
}

document.querySelectorAll('[data-matrix]').forEach(el => {
  const charSpans = matrixifyText(el);
  runMatrixAnimation(charSpans, { initialDelay: 200, letterAnimationDuration: 500, letterInterval: 80 });
});

// === Demo tier pages — banner update + feature-tag reveal on scroll ===
(function () {
  const featureLabel = document.getElementById('currentFeature');
  const sections = document.querySelectorAll('[data-feature]');
  if (!sections.length) return;

  const tagObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const tag = e.target.querySelector(':scope > .feature-tag');
        if (tag) tag.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  const labelObserver = new IntersectionObserver((entries) => {
    let best = null;
    entries.forEach(e => {
      if (e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio)) {
        best = e;
      }
    });
    if (best && featureLabel) {
      featureLabel.textContent = best.target.dataset.feature;
    }
  }, { threshold: [0.4, 0.6, 0.8] });

  sections.forEach(s => {
    tagObserver.observe(s);
    labelObserver.observe(s);
  });
})();

// === Testimonials: clone items for seamless infinite scroll ===
// The CSS animation translates each .testi-list from 0 to -50% to create an
// infinite loop. That only looks seamless if the list contains two identical
// sets — otherwise the list scrolls out and leaves a visible gap at the bottom
// (which is the bug we saw on the live site). We clone on the client to keep
// the HTML clean and only run when the marquee animation is active (not on
// the mobile horizontal carousel breakpoint, which kills the animation).
(function() {
  const lists = document.querySelectorAll('.testi-list');
  if (!lists.length) return;

  const cloneItems = (list) => {
    if (list.dataset.cloned === 'true') return;
    const originals = Array.from(list.children);
    if (!originals.length) return;
    const frag = document.createDocumentFragment();
    originals.forEach(li => {
      const clone = li.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.dataset.clone = 'true';
      frag.appendChild(clone);
    });
    list.appendChild(frag);
    list.dataset.cloned = 'true';
  };

  const removeClones = (list) => {
    if (list.dataset.cloned !== 'true') return;
    list.querySelectorAll('[data-clone="true"]').forEach(n => n.remove());
    list.dataset.cloned = 'false';
  };

  // Only clone above the mobile breakpoint (the mobile layout shows
  // testimonials in a horizontal carousel and we don't want duplicates there).
  const mq = window.matchMedia('(min-width: 761px)');
  const apply = () => {
    lists.forEach(mq.matches ? cloneItems : removeClones);
  };
  apply();
  // Re-evaluate on viewport changes (e.g. resize, orientation change).
  mq.addEventListener ? mq.addEventListener('change', apply) : mq.addListener(apply);
})();
