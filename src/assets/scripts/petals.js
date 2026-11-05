/* ==========================================================================
   Julieta UI · petals.js
   Pétalos de jacaranda cayendo sobre un <canvas>. Es la firma visual de la
   librería: se pausa fuera de pantalla, con la pestaña oculta y respeta
   prefers-reduced-motion (dibuja un solo cuadro estático).
   HTML:  <canvas class="al-petals" data-al-petals data-density="1"></canvas>
   ========================================================================== */
import { $$ } from "./core.js";

const COLORS = ["#c3a7f1", "#a67be8", "#dccdf8", "#8b56dc", "#ff93c6", "#ece4fb"];

export function petals(canvas, { density = 1, wind = 0.35 } = {}) {
  const ctx = canvas.getContext("2d");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = 0, H = 0, dpr = 1, list = [], raf = 0, visible = true, last = 0;

  const make = (initial) => ({
    x: Math.random() * W,
    y: initial ? Math.random() * H : -20 - Math.random() * 60,
    s: 7 + Math.random() * 13,
    vy: 0.35 + Math.random() * 0.8,
    vx: (Math.random() - 0.3) * 0.5,
    r: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.02,
    f: Math.random() * Math.PI * 2,
    vf: 0.01 + Math.random() * 0.025,
    c: COLORS[(Math.random() * COLORS.length) | 0],
    a: 0.35 + Math.random() * 0.55,
  });

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(90, (W * H) / 16000) * density);
    list = Array.from({ length: count }, () => make(true));
    if (still) frame(0);
  }

  function draw(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.r);
    ctx.scale(1, Math.abs(Math.cos(p.f)) * 0.8 + 0.2); // volteo 3D
    ctx.globalAlpha = p.a;
    const g = ctx.createLinearGradient(0, -p.s, 0, p.s);
    g.addColorStop(0, p.c); g.addColorStop(1, "#ffffff");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -p.s);
    ctx.bezierCurveTo(p.s * 0.9, -p.s * 0.5, p.s * 0.7, p.s * 0.7, 0, p.s);
    ctx.bezierCurveTo(-p.s * 0.7, p.s * 0.7, -p.s * 0.9, -p.s * 0.5, 0, -p.s);
    ctx.fill();
    ctx.restore();
  }

  function frame(t) {
    const dt = Math.min(2.5, (t - last) / 16.67 || 1);
    last = t;
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      if (!still) {
        p.y += p.vy * dt;
        p.x += (p.vx + Math.sin(p.y / 70 + p.f) * wind) * dt;
        p.r += p.vr * dt; p.f += p.vf * dt;
        if (p.y > H + 30 || p.x < -40 || p.x > W + 40) list[i] = make(false);
      }
      draw(p);
    }
    if (!still && visible && !document.hidden) raf = requestAnimationFrame(frame);
    else raf = 0;
  }

  const start = () => { if (!raf && !still) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : (cancelAnimationFrame(raf), (raf = 0)); });
  io.observe(canvas);
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  document.addEventListener("visibilitychange", () => (document.hidden ? (cancelAnimationFrame(raf), (raf = 0)) : start()));
  resize(); start();
  return { destroy() { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); } };
}

export function initPetals(root = document) {
  $$("canvas[data-al-petals]", root).forEach((c) => {
    if (c._julietaPetals) return;
    c.setAttribute("aria-hidden", "true");
    c._julietaPetals = petals(c, { density: parseFloat(c.dataset.density) || 1 });
  });
}
