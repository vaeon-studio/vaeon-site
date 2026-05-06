// === Interactive particle text — replaces auto-cycling particle effect ===
// Mouse hover disperses particles around the cursor. They restore on leave.
// Text: "ATELIER NOVA". Palette: Mix A (mono blanc/gris + pink).

(function () {
  function init() {
    const canvas = document.getElementById('particleSection');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const text = 'ATELIER NOVA';
    const colors = ['ffffff', 'ffd1de', 'f3f1ea', 'ff8aaa', 'b9b6ad', 'ff5e8a', '7a7a82', 'c43d6a'];
    const animationForce = 80;
    const particleDensity = 4;

    let particles = [];
    let pointer = { x: undefined, y: undefined };
    let hasPointer = false;
    let interactionRadius = 100;
    let textBox = { str: text, x: 0, y: 0, w: 0, h: 0 };

    const rand = (max = 1, min = 0, dec = 0) => +(min + Math.random() * (max - min)).toFixed(dec);

    class Particle {
      constructor(x, y, rgb) {
        this.ox = x; this.oy = y;
        this.cx = x; this.cy = y;
        this.or = rand(5, 1);
        this.cr = this.or;
        this.f = rand(animationForce + 15, animationForce - 15);
        this.rgb = rgb.map(c => Math.max(0, c + rand(13, -13)));
      }
      draw() {
        ctx.fillStyle = `rgb(${this.rgb.join(',')})`;
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, this.cr, 0, 2 * Math.PI);
        ctx.fill();
      }
      move(radius, has) {
        if (has && pointer.x !== undefined && pointer.y !== undefined) {
          const dx = this.cx - pointer.x;
          const dy = this.cy - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < radius && dist > 0) {
            const force = Math.min(this.f, (radius - dist) / dist * 2);
            this.cx += (dx / dist) * force;
            this.cy += (dy / dist) * force;
          }
        }
        const odx = this.ox - this.cx;
        const ody = this.oy - this.cy;
        const od = Math.hypot(odx, ody);
        if (od > 1) {
          const restore = Math.min(od * 0.1, 3);
          this.cx += (odx / od) * restore;
          this.cy += (ody / od) * restore;
        }
        this.draw();
      }
    }

    function sizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.min(Math.max(Math.round(rect.width), 1000), 1920);
      canvas.height = Math.min(Math.max(Math.round(rect.height), 600), 1080);
    }

    function dottify() {
      const data = ctx.getImageData(textBox.x, textBox.y, textBox.w, textBox.h).data;
      const pixels = [];
      for (let i = 0; i < data.length; i += 4) {
        const idx = i / 4;
        const x = idx % textBox.w;
        const y = Math.floor(idx / textBox.w);
        if (data[i + 3] && !(x % particleDensity) && !(y % particleDensity)) {
          pixels.push({ x, y, rgb: [data[i], data[i + 1], data[i + 2]] });
        }
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pixels.forEach((p, i) => {
        particles[i] = new Particle(textBox.x + p.x, textBox.y + p.y, p.rgb);
        particles[i].draw();
      });
      particles.length = pixels.length;
    }

    function write() {
      textBox.str = text;
      textBox.h = Math.floor(canvas.width / textBox.str.length);
      interactionRadius = Math.max(50, textBox.h * 1.5);
      ctx.font = `900 ${textBox.h}px Verdana, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      textBox.w = Math.round(ctx.measureText(textBox.str).width);
      textBox.x = 0.5 * (canvas.width - textBox.w);
      textBox.y = 0.5 * (canvas.height - textBox.h);
      const grad = ctx.createLinearGradient(textBox.x, textBox.y, textBox.x + textBox.w, textBox.y + textBox.h);
      const N = colors.length - 1;
      colors.forEach((c, i) => grad.addColorStop(i / N, '#' + c));
      ctx.fillStyle = grad;
      ctx.fillText(textBox.str, 0.5 * canvas.width, 0.5 * canvas.height);
      dottify();
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => p.move(interactionRadius, hasPointer));
      requestAnimationFrame(animate);
    }

    sizeCanvas();
    write();
    animate();

    // Pointer interaction
    canvas.addEventListener('pointermove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const sx = canvas.width / rect.width;
      const sy = canvas.height / rect.height;
      pointer.x = (e.clientX - rect.left) * sx;
      pointer.y = (e.clientY - rect.top) * sy;
      hasPointer = true;
    });
    canvas.addEventListener('pointerleave', () => {
      hasPointer = false;
      pointer.x = undefined;
      pointer.y = undefined;
    });
    canvas.addEventListener('pointerenter', () => { hasPointer = true; });

    // Resize
    let resizeT;
    window.addEventListener('resize', () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        sizeCanvas();
        write();
      }, 150);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
