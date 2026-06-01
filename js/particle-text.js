// === Particle Text Effect (vanilla JS port) ===
// Original concept by KAINXU — ported to vanilla JS for VÆON
// Particles form words, then morph fluidly to the next word in the list.

class Particle {
  constructor() {
    this.pos = { x: 0, y: 0 };
    this.vel = { x: 0, y: 0 };
    this.acc = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
    this.closeEnoughTarget = 100;
    this.maxSpeed = 1.0;
    this.maxForce = 0.1;
    this.particleSize = 10;
    this.isKilled = false;
    this.startColor = { r: 0, g: 0, b: 0 };
    this.targetColor = { r: 0, g: 0, b: 0 };
    this.colorWeight = 0;
    this.colorBlendRate = 0.01;
  }

  move() {
    let proximityMult = 1;
    const dx = this.pos.x - this.target.x;
    const dy = this.pos.y - this.target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < this.closeEnoughTarget) proximityMult = distance / this.closeEnoughTarget;

    const towardsTarget = { x: this.target.x - this.pos.x, y: this.target.y - this.pos.y };
    const mag = Math.sqrt(towardsTarget.x ** 2 + towardsTarget.y ** 2);
    if (mag > 0) {
      towardsTarget.x = (towardsTarget.x / mag) * this.maxSpeed * proximityMult;
      towardsTarget.y = (towardsTarget.y / mag) * this.maxSpeed * proximityMult;
    }
    const steer = { x: towardsTarget.x - this.vel.x, y: towardsTarget.y - this.vel.y };
    const sm = Math.sqrt(steer.x ** 2 + steer.y ** 2);
    if (sm > 0) {
      steer.x = (steer.x / sm) * this.maxForce;
      steer.y = (steer.y / sm) * this.maxForce;
    }
    this.acc.x += steer.x;
    this.acc.y += steer.y;
    this.vel.x += this.acc.x;
    this.vel.y += this.acc.y;
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.acc.x = 0;
    this.acc.y = 0;
  }

  draw(ctx, drawAsPoints, pointSize) {
    if (this.colorWeight < 1.0) this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0);
    const c = {
      r: Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight),
      g: Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight),
      b: Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight),
    };
    ctx.fillStyle = `rgb(${c.r},${c.g},${c.b})`;
    if (drawAsPoints) {
      const s = pointSize || 2;
      ctx.fillRect(this.pos.x, this.pos.y, s, s);
    } else {
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.particleSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  kill(w, h) {
    if (!this.isKilled) {
      const r = randomEdgePos(w / 2, h / 2, (w + h) / 2, w, h);
      this.target.x = r.x;
      this.target.y = r.y;
      this.startColor = {
        r: this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight,
        g: this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight,
        b: this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight,
      };
      this.targetColor = { r: 0, g: 0, b: 0 };
      this.colorWeight = 0;
      this.isKilled = true;
    }
  }
}

function randomEdgePos(x, y, mag, w, h) {
  const rx = Math.random() * (w || 1000);
  const ry = Math.random() * (h || 500);
  const dir = { x: rx - x, y: ry - y };
  const m = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
  if (m > 0) { dir.x = (dir.x / m) * mag; dir.y = (dir.y / m) * mag; }
  return { x: x + dir.x, y: y + dir.y };
}

function initParticleText(canvas, words, opts = {}) {
  const ctx = canvas.getContext('2d');
  const particles = [];
  const pixelSteps = opts.pixelSteps || 6;
  const drawAsPoints = opts.drawAsPoints !== false;
  const fontSize = opts.fontSize || 110;
  const fontFamily = opts.fontFamily || 'Geist Mono, monospace';
  const pointSize = opts.pointSize || 2;
  const speed = opts.speed || 1;
  // Brand palette (cyan/pink/amber/lime/pink-vif)
  const palette = opts.palette || [
    { r: 95, g: 201, b: 255 },   // cyan
    { r: 255, g: 94, b: 168 },   // pink
    { r: 255, g: 181, b: 71 },   // amber
    { r: 198, g: 249, b: 100 },  // lime
    { r: 164, g: 127, b: 255 },  // lavender
    { r: 95, g: 255, b: 212 },   // mint
  ];
  let frameCount = 0;
  let wordIndex = 0;
  const mouse = { x: 0, y: 0, isPressed: false, isRightClick: false, isHovering: false };
  let rafId = null;
  let pickedColor = palette[0];
  let lastPointerMove = 0;

  function nextWord(word) {
    const off = document.createElement('canvas');
    off.width = canvas.width;
    off.height = canvas.height;
    const octx = off.getContext('2d');
    octx.fillStyle = 'white';
    // Auto-fit: shrink the font so the whole word fits within the canvas with side margins.
    // Measured against the live font so it self-corrects on narrow screens, any DPR, or font
    // fallback (iOS) — prevents the horizontal clipping that razor-thin margins caused on mobile.
    let fs = fontSize;
    const maxW = canvas.width * 0.82;
    octx.font = `bold ${fs}px ${fontFamily}`;
    const measured = octx.measureText(word).width;
    if (measured > maxW) {
      fs = Math.max(24, Math.floor(fs * (maxW / measured)));
      octx.font = `bold ${fs}px ${fontFamily}`;
    }
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillText(word, canvas.width / 2, canvas.height / 2);

    const data = octx.getImageData(0, 0, canvas.width, canvas.height).data;
    pickedColor = palette[Math.floor(Math.random() * palette.length)];

    let pIdx = 0;
    const indexes = [];
    for (let i = 0; i < data.length; i += pixelSteps * 4) indexes.push(i);
    for (let i = indexes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
    }

    for (const ci of indexes) {
      const alpha = data[ci + 3];
      if (alpha > 0) {
        const x = (ci / 4) % canvas.width;
        const y = Math.floor(ci / 4 / canvas.width);
        let p;
        if (pIdx < particles.length) {
          p = particles[pIdx];
          p.isKilled = false;
          pIdx++;
        } else {
          p = new Particle();
          const r = randomEdgePos(canvas.width / 2, canvas.height / 2, (canvas.width + canvas.height) / 2, canvas.width, canvas.height);
          p.pos.x = r.x; p.pos.y = r.y;
          p.maxSpeed = (Math.random() * 6 + 4) * speed;
          p.maxForce = p.maxSpeed * 0.05;
          p.particleSize = Math.random() * 6 + 6;
          p.colorBlendRate = Math.random() * 0.0275 + 0.0025;
          particles.push(p);
        }
        p.startColor = {
          r: p.startColor.r + (p.targetColor.r - p.startColor.r) * p.colorWeight,
          g: p.startColor.g + (p.targetColor.g - p.startColor.g) * p.colorWeight,
          b: p.startColor.b + (p.targetColor.b - p.startColor.b) * p.colorWeight,
        };
        p.targetColor = pickedColor;
        p.colorWeight = 0;
        p.target.x = x;
        p.target.y = y;
      }
    }
    for (let i = pIdx; i < particles.length; i++) particles[i].kill(canvas.width, canvas.height);
  }

  function tick() {
    ctx.fillStyle = 'rgba(14,14,16,0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.move();
      p.draw(ctx, drawAsPoints, pointSize);
      if (p.isKilled && (p.pos.x < 0 || p.pos.x > canvas.width || p.pos.y < 0 || p.pos.y > canvas.height)) {
        particles.splice(i, 1);
      }
    }

    // Safety net (touch): if the finger hasn't moved for a moment, end the dispersal and
    // force the word to rebuild. Guarantees the word ALWAYS reforms — even if a touchend is
    // missed or iOS leaves a synthetic hover stuck (the root cause of "it never reforms").
    if (isTouchDevice && mouse.isHovering && Date.now() - lastPointerMove > 220) {
      mouse.isHovering = false;
      mouse.isPressed = false;
      reformCurrentWord();
    }
    if (mouse.isHovering || (mouse.isPressed && mouse.isRightClick)) {
      const radius = (mouse.isPressed && mouse.isRightClick) ? 110 : 70;
      particles.forEach(p => {
        const d = Math.sqrt((p.pos.x - mouse.x) ** 2 + (p.pos.y - mouse.y) ** 2);
        if (d < radius) p.kill(canvas.width, canvas.height);
      });
    }

    frameCount++;
    if (frameCount % (opts.wordInterval || 240) === 0) {
      wordIndex = (wordIndex + 1) % words.length;
      nextWord(words[wordIndex]);
    }
    rafId = requestAnimationFrame(tick);
  }

  // Map a client (pointer/touch) coordinate into canvas pixel space
  function setPointer(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    mouse.x = (clientX - r.left) * (canvas.width / r.width);
    mouse.y = (clientY - r.top) * (canvas.height / r.height);
    lastPointerMove = Date.now();
  }
  // Re-assign every particle back to the CURRENT word so it always returns to 100%.
  function reformCurrentWord() { nextWord(words[wordIndex]); }

  // Touch devices have no real hover. A tap emits a synthetic mousemove that would set
  // isHovering=true with no mouseleave to ever clear it — leaving a permanent kill-zone
  // that destroys the word and stops it reforming. So on touch we ignore mouse events and
  // drive dispersal from touch only, clearing the state AND reforming the word on release.
  // Use hover capability (not 'ontouchstart') so a touch laptop WITH a mouse stays on the
  // original desktop path; only true touch-primary devices (phones) take the touch branch.
  const isTouchDevice = !!window.matchMedia && window.matchMedia('(hover:none)').matches;

  // Mouse handlers (hover-capable / desktop only)
  function onDown(e) {
    if (isTouchDevice) return;
    mouse.isPressed = true;
    mouse.isRightClick = e.button === 2;
    setPointer(e.clientX, e.clientY);
  }
  function onUp() { if (isTouchDevice) return; mouse.isPressed = false; mouse.isRightClick = false; }
  function onMove(e) {
    if (isTouchDevice) return;
    setPointer(e.clientX, e.clientY);
    mouse.isHovering = true;
  }
  function onEnter() { if (isTouchDevice) return; mouse.isHovering = true; }
  function onLeave() { if (isTouchDevice) return; mouse.isHovering = false; }
  function onCtx(e) { e.preventDefault(); }

  // Touch handlers: disperse while a finger is down, ALWAYS reform on release.
  function onTouchStart(e) {
    const t = e.touches && e.touches[0];
    if (!t) return;
    setPointer(t.clientX, t.clientY);
    mouse.isHovering = true;
  }
  function onTouchMove(e) {
    const t = e.touches && e.touches[0];
    if (!t) return;
    setPointer(t.clientX, t.clientY);
    mouse.isHovering = true;
  }
  function onTouchEnd() {
    mouse.isHovering = false;
    mouse.isPressed = false;
    mouse.isRightClick = false;
    reformCurrentWord();
  }

  canvas.addEventListener('mousedown', onDown);
  canvas.addEventListener('mouseup', onUp);
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseenter', onEnter);
  canvas.addEventListener('mouseleave', onLeave);
  canvas.addEventListener('contextmenu', onCtx);
  canvas.addEventListener('touchstart', onTouchStart, { passive: true });
  canvas.addEventListener('touchmove', onTouchMove, { passive: true });
  canvas.addEventListener('touchend', onTouchEnd, { passive: true });
  canvas.addEventListener('touchcancel', onTouchEnd, { passive: true });

  // Boot
  nextWord(words[0]);
  tick();

  // Return controller
  return {
    destroy() {
      if (rafId) cancelAnimationFrame(rafId);
      canvas.removeEventListener('mousedown', onDown);
      canvas.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseenter', onEnter);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('contextmenu', onCtx);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
    }
  };
}

window.initParticleText = initParticleText;
