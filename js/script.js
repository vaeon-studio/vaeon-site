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
const faqList = document.getElementById('faqList');
if (faqList) {
  faqList.querySelectorAll('.faq').forEach(faq => {
    const q = faq.querySelector('.faq-q');
    const a = faq.querySelector('.faq-a');
    if (faq.classList.contains('open')) a.style.maxHeight = a.scrollHeight + 'px';
    q.addEventListener('click', () => {
      const open = faq.classList.toggle('open');
      a.style.maxHeight = open ? a.scrollHeight + 'px' : '0px';
    });
  });
}

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
    for (const ch of node.textContent) {
      if (ch === ' ' || ch === '\n' || ch === '\t') {
        frag.appendChild(document.createTextNode(ch));
      } else {
        const span = document.createElement('span');
        span.className = 'scrm';
        span.dataset.original = ch;
        span.textContent = ch;
        frag.appendChild(span);
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

// === Scroll progress bar — barber-pole stripes ===
const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress';
scrollProgress.setAttribute('aria-hidden', 'true');
scrollProgress.innerHTML = `<div class="sp-track"><div class="sp-fill"></div></div>`;
document.body.appendChild(scrollProgress);

// (Nova Orb 3D keycap removed)
let lastScroll = 0;
let scrollVel = 0;
let rafId = null;

// === Particle text effect — full-screen section after hero ===
const particleSectionCanvas = document.getElementById('particleSection');
if (particleSectionCanvas && typeof window.initParticleText === 'function') {
  // Size canvas internal pixels to match its on-screen display
  const sizeCanvas = () => {
    const rect = particleSectionCanvas.getBoundingClientRect();
    particleSectionCanvas.width = Math.min(Math.max(Math.round(rect.width), 1000), 1920);
    particleSectionCanvas.height = Math.min(Math.max(Math.round(rect.height), 600), 1080);
  };
  sizeCanvas();
  window.initParticleText(particleSectionCanvas, [
    'VÆON',
    'DESIGN',
    'CODE',
    'IDENTITÉ',
    'SUR-MESURE',
  ], { fontSize: 200, fontFamily: 'Geist Mono, monospace', wordInterval: 240 });
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
  // Scroll progress bar (set on parent so both fill + reaper inherit)
  scrollProgress.style.setProperty('--p', progress);
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
