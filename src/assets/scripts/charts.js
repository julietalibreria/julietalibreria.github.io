/* ==========================================================================
   Julieta UI · charts.js
   Gráficas SVG sin dependencias: línea, área, barras y sparkline.
   HTML:  <div class="al-chart" data-al-chart='{"type":"area","labels":["L","M"],"series":[{"name":"Visitas","data":[3,5]}]}'></div>
   JS:    Julieta.chart(el, { type, labels, series, format })
   ========================================================================== */
import { $$, h } from "./core.js";

const NS = "http://www.w3.org/2000/svg";
const s = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };

function niceMax(v) {
  const p = 10 ** Math.floor(Math.log10(v || 1));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

export function chart(el, cfg) {
  const { type = "line", labels = [], series = [], format = (v) => v.toLocaleString("es-MX") } = cfg;
  const spark = el.classList.contains("al-chart--spark");
  el.replaceChildren();
  const tip = h("div", { class: "al-chart__tip" });
  const draw = () => {
    const W = el.clientWidth || 400, H = el.clientHeight || 220;
    el.querySelector("svg")?.remove();
    const m = spark ? { t: 4, r: 4, b: 4, l: 4 } : { t: 12, r: 10, b: 26, l: 40 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const all = series.flatMap((x) => x.data);
    const max = niceMax(Math.max(...all, 1)), min = 0;
    const n = labels.length || series[0]?.data.length || 0;
    const bar = type === "bar";
    const x = (i) => m.l + (bar ? (iw / n) * (i + 0.5) : n < 2 ? iw / 2 : (iw / (n - 1)) * i);
    const y = (v) => m.t + ih - ((v - min) / (max - min)) * ih;

    const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": cfg.label || "Gráfica" });
    const defs = s("defs");
    const gid = `g${Math.random().toString(36).slice(2, 7)}`;
    const grad = s("linearGradient", { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 });
    grad.append(s("stop", { offset: "0%", "stop-color": "currentColor", "stop-opacity": ".28" }), s("stop", { offset: "100%", "stop-color": "currentColor", "stop-opacity": "0" }));
    defs.append(grad); svg.append(defs);

    if (!spark) {
      for (let i = 0; i <= 4; i++) {
        const v = (max / 4) * i, yy = y(v);
        svg.append(s("line", { class: "grid-line", x1: m.l, x2: W - m.r, y1: yy, y2: yy }));
        const t = s("text", { class: "axis-label", x: m.l - 8, y: yy + 4, "text-anchor": "end" });
        t.textContent = v >= 1000 ? `${v / 1000}k` : v; svg.append(t);
      }
      const step = Math.ceil(n / Math.max(2, Math.floor(iw / 56)));
      labels.forEach((l, i) => {
        if (i % step) return;
        const t = s("text", { class: "axis-label", x: x(i), y: H - 6, "text-anchor": "middle" }); t.textContent = l; svg.append(t);
      });
    }

    const cursor = s("line", { class: "cursor", y1: m.t, y2: m.t + ih }); svg.append(cursor);
    const dots = [];

    series.forEach((ser, si) => {
      const g = s("g", { style: si ? "color:var(--al-accent)" : "" });
      if (bar) {
        const bw = Math.min(34, (iw / n) * 0.55 / series.length);
        ser.data.forEach((v, i) => {
          const bx = x(i) - (bw * series.length) / 2 + bw * si;
          const r = s("rect", { class: "bar", x: bx, y: y(v), width: bw, height: Math.max(0, m.t + ih - y(v)), rx: Math.min(6, bw / 2) });
          g.append(r);
        });
      } else {
        const pts = ser.data.map((v, i) => [x(i), y(v)]);
        const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
        if (type === "area" && si === 0) g.append(s("path", { d: `${d} L${pts.at(-1)[0]},${m.t + ih} L${pts[0][0]},${m.t + ih} Z`, fill: `url(#${gid})` }));
        const line = s("path", { class: `line${si ? " line--2" : ""}`, d, pathLength: 1 });
        if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
          line.style.strokeDasharray = 1; line.style.strokeDashoffset = 1;
          line.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 900, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards" });
        } else line.style.strokeDasharray = "none";
        g.append(line);
        if (!spark) pts.forEach((p) => { const c = s("circle", { class: "dot", cx: p[0], cy: p[1], r: 5 }); dots.push(c); g.append(c); });
      }
      svg.append(g);
    });

    if (!spark) {
      const hit = s("rect", { x: m.l, y: m.t, width: iw, height: ih, fill: "transparent" });
      const move = (ev) => {
        const r = svg.getBoundingClientRect();
        const px = ((ev.clientX - r.left) / r.width) * W;
        const i = Math.max(0, Math.min(n - 1, Math.round(bar ? (px - m.l) / (iw / n) - 0.5 : ((px - m.l) / iw) * (n - 1))));
        cursor.setAttribute("x1", x(i)); cursor.setAttribute("x2", x(i)); cursor.classList.add("is-on");
        dots.forEach((d, k) => d.classList.toggle("is-on", k % n === i));
        tip.innerHTML = `<strong>${labels[i] ?? i + 1}</strong> ${series.map((q) => `· ${q.name ? q.name + " " : ""}${format(q.data[i])}`).join(" ")}`;
        tip.style.left = `${(x(i) / W) * 100}%`; tip.style.top = `${(y(Math.max(...series.map((q) => q.data[i]))) / H) * 100}%`;
        tip.classList.add("is-on");
      };
      const leave = () => { cursor.classList.remove("is-on"); dots.forEach((d) => d.classList.remove("is-on")); tip.classList.remove("is-on"); };
      hit.addEventListener("pointermove", move); hit.addEventListener("pointerleave", leave);
      svg.append(hit);
    }
    el.prepend(svg);
  };
  el.append(tip);
  draw();
  const ro = new ResizeObserver(() => { clearTimeout(el._rz); el._rz = setTimeout(draw, 80); });
  ro.observe(el);
  return { redraw: draw, destroy: () => ro.disconnect() };
}

export function initCharts(root = document) {
  $$("[data-al-chart]", root).forEach((el) => {
    if (el._julietaChart) return;
    try { el._julietaChart = chart(el, JSON.parse(el.dataset.alChart)); }
    catch (e) { console.error("Julieta: data-al-chart inválido", e); }
  });
}
