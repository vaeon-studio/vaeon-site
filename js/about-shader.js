// === Cybernetic Grid Shader — about section background ===
// WebGL fullscreen quad with animated grid + mouse warp/glow.
// Pauses when section leaves viewport to save GPU.

(function () {
  const container = document.getElementById('aboutShader');
  if (!container || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const clock = new THREE.Clock();

  const vertexShader = `
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    precision highp float;
    uniform vec2 iResolution;
    uniform float iTime;
    uniform vec2 iMouse;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main() {
      vec2 uv    = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
      vec2 mouse = (iMouse - 0.5 * iResolution.xy) / iResolution.y;

      float t         = iTime * 0.2;
      float mouseDist = length(uv - mouse);

      float warp = sin(mouseDist * 20.0 - t * 4.0) * 0.1;
      warp *= smoothstep(0.4, 0.0, mouseDist);
      uv += warp;

      vec2 gridUv = abs(fract(uv * 10.0) - 0.5);
      float line  = pow(1.0 - min(gridUv.x, gridUv.y), 50.0);

      vec3 gridColor = vec3(0.1, 0.5, 1.0);
      vec3 color     = gridColor * line * (0.5 + sin(t * 2.0) * 0.2);

      float energy = sin(uv.x * 20.0 + t * 5.0) * sin(uv.y * 20.0 + t * 3.0);
      energy = smoothstep(0.8, 1.0, energy);
      color += vec3(1.0, 0.2, 0.8) * energy * line;

      float glow = smoothstep(0.1, 0.0, mouseDist);
      color += vec3(1.0) * glow * 0.5;

      color += random(uv + t * 0.1) * 0.05;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const uniforms = {
    iTime:       { value: 0 },
    iResolution: { value: new THREE.Vector2() },
    iMouse:      { value: new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2) }
  };

  const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
  const geometry = new THREE.PlaneGeometry(2, 2);
  scene.add(new THREE.Mesh(geometry, material));

  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h);
    const dpr = renderer.getPixelRatio();
    uniforms.iResolution.value.set(w * dpr, h * dpr);
  }
  window.addEventListener('resize', onResize);
  onResize();

  // Pause render when about section is off-screen (saves GPU)
  let isVisible = false;
  let cachedRect = container.getBoundingClientRect();
  const io = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
    if (isVisible) cachedRect = container.getBoundingClientRect();
  }, { threshold: 0 });
  io.observe(container);
  // Refresh cached rect on scroll/resize only when visible
  const refreshRect = () => { if (isVisible) cachedRect = container.getBoundingClientRect(); };
  window.addEventListener('scroll', refreshRect, { passive: true });
  window.addEventListener('resize', refreshRect, { passive: true });

  // Track mouse — only when section is visible, throttled with rAF, no synchronous layout read
  let mouseRaf = null, mx = 0, my = 0;
  window.addEventListener('mousemove', (e) => {
    if (!isVisible) return;
    mx = e.clientX; my = e.clientY;
    if (mouseRaf) return;
    mouseRaf = requestAnimationFrame(() => {
      const dpr = renderer.getPixelRatio();
      const x = (mx - cachedRect.left) * dpr;
      const y = (cachedRect.height - (my - cachedRect.top)) * dpr;
      uniforms.iMouse.value.set(x, y);
      mouseRaf = null;
    });
  }, { passive: true });

  renderer.setAnimationLoop(() => {
    if (!isVisible) return;
    uniforms.iTime.value = clock.getElapsedTime();
    renderer.render(scene, camera);
  });
})();
