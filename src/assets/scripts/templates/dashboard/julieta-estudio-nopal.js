/* Julieta UI · Plantilla «Tablero de proyectos · Estudio Nopal»
   Comportamiento de la plantilla. Los ids, atributos data y clases que usa llevan el prefijo julieta-.
   Se carga por CDN como módulo; agrega tu lógica en tu propio archivo JS. */

import { Julieta } from "../../julieta.js";
const $ = (s) => document.querySelector(s);
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fechaTxt = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" });
const HOY = "2026-11-02", FIN_SEMANA = "2026-11-08";

const equipo = [
  { n: "Itzel Camacho", ini: "IC", av: "al-avatar--agave", rol: "Dirección de proyecto" },
  { n: "Emiliano Rojas", ini: "ER", av: "", rol: "Arquitectura" },
  { n: "Paloma Quintero", ini: "PQ", av: "al-avatar--sol", rol: "Diseño gráfico" },
  { n: "Ricardo Aguilar", ini: "RA", av: "al-avatar--cielo", rol: "Desarrollo" },
];
const cols = ["Pendiente", "En curso", "En revisión", "Hecho"];
const prioBadge = { Alta: "danger", Media: "warning", Baja: "neutral" };
const inicial = [
  { id: 1, t: "Definir paleta del mercado", p: "Mercado Sonora", r: "Paloma Quintero", pr: "Media", f: "2026-11-05", c: "Pendiente" },
  { id: 2, t: "Levantamiento de la fachada", p: "Casa Tecolote", r: "Emiliano Rojas", pr: "Alta", f: "2026-11-04", c: "Pendiente" },
  { id: 3, t: "Cotizar rotulación de locales", p: "Mercado Sonora", r: "Itzel Camacho", pr: "Baja", f: "2026-11-14", c: "Pendiente" },
  { id: 4, t: "Maquetas de los puestos", p: "Mercado Sonora", r: "Emiliano Rojas", pr: "Alta", f: "2026-11-04", c: "En curso" },
  { id: 5, t: "Mapa interactivo de la ruta", p: "Ruta Mezcal", r: "Ricardo Aguilar", pr: "Alta", f: "2026-11-07", c: "En curso" },
  { id: 6, t: "Planos de instalaciones v3", p: "Casa Tecolote", r: "Emiliano Rojas", pr: "Media", f: "2026-11-09", c: "En curso" },
  { id: 7, t: "Etiquetas de las mezcaleras", p: "Ruta Mezcal", r: "Paloma Quintero", pr: "Media", f: "2026-11-12", c: "En revisión" },
  { id: 8, t: "Contrato con proveedores", p: "Mercado Sonora", r: "Itzel Camacho", pr: "Alta", f: "2026-11-06", c: "En revisión" },
  { id: 9, t: "Logotipo del mercado", p: "Mercado Sonora", r: "Paloma Quintero", pr: "Media", f: "2026-10-28", c: "Hecho" },
  { id: 10, t: "Sitio web de la ruta", p: "Ruta Mezcal", r: "Ricardo Aguilar", pr: "Media", f: "2026-10-30", c: "Hecho" },
  { id: 11, t: "Visita técnica a Casa Tecolote", p: "Casa Tecolote", r: "Itzel Camacho", pr: "Baja", f: "2026-10-26", c: "Hecho" },
];
let tareas = structuredClone(inicial), sig = 100, actual = null, proyecto = "Todos", prio = "todas";
const persona = (n) => equipo.find((e) => e.n === n) || equipo[0];

$("#julieta-t-resp").innerHTML = equipo.map((e) => `<option>${e.n}</option>`).join("");

function visibles() {
  const q = $("#julieta-buscar").value.trim().toLowerCase();
  return tareas.filter((x) => (proyecto === "Todos" || x.p === proyecto) && (prio === "todas" || x.pr === prio) && (!q || (x.t + " " + x.p + " " + x.r).toLowerCase().includes(q)));
}

function renderTablero() {
  const vis = visibles();
  $("#julieta-tablero").innerHTML = cols.map((c) => {
    const items = vis.filter((x) => x.c === c);
    return `<div class="julieta-np-col" aria-label="${c}"><div class="julieta-np-col__head"><span>${c}</span><span class="al-badge al-badge--neutral">${items.length}</span></div>
    ${items.map((x) => { const e = persona(x.r); return `<article class="julieta-np-card">
      <div class="julieta-np-card__top"><span class="julieta-np-card__title">${esc(x.t)}</span>
        <div class="al-dropdown" data-al-dropdown><button class="al-btn al-btn--ghost al-btn--icon al-btn--sm" data-al-dropdown-trigger aria-label="Acciones de ${esc(x.t)}"><al-icon name="more-horizontal" size="18"></al-icon></button>
          <div class="al-menu al-menu--end" role="menu" hidden>
            ${cols.filter((k) => k !== x.c).map((k) => `<button class="al-menu__item" data-julieta-mover="${x.id}" data-julieta-col="${k}"><al-icon name="arrow-right" size="18"></al-icon>Mover a ${k}</button>`).join("")}
            <div class="al-menu__sep"></div>
            <button class="al-menu__item" data-julieta-ver="${x.id}"><al-icon name="eye" size="18"></al-icon>Ver detalle</button>
          </div></div></div>
      <div><span class="al-badge al-badge--${prioBadge[x.pr]}">${x.pr}</span> <span class="al-text-xs al-text-muted">${esc(x.p)}</span></div>
      <div class="julieta-np-card__meta"><span><al-icon name="calendar" size="14"></al-icon>${fechaTxt(x.f)}</span><span class="al-avatar al-avatar--sm ${e.av}" title="${esc(x.r)}" aria-label="${esc(x.r)}">${e.ini}</span></div>
    </article>`; }).join("") || '<div class="julieta-np-empty">Sin tareas</div>'}</div>`;
  }).join("");
  $("#julieta-estado").textContent = `${vis.length} de ${tareas.length} tareas`;
}

function resumen() {
  const hechas = tareas.filter((x) => x.c === "Hecho").length, ab = tareas.length - hechas;
  const pct = tareas.length ? Math.round((hechas / tareas.length) * 100) : 0;
  $("#julieta-k-abiertas").textContent = ab; $("#julieta-k-hechas").textContent = hechas;
  $("#julieta-k-vencen").textContent = tareas.filter((x) => x.c !== "Hecho" && x.f >= HOY && x.f <= FIN_SEMANA).length;
  const r = $("#julieta-ring-av"); r.style.setProperty("--value", pct); r.querySelector("span").textContent = pct + "%"; r.setAttribute("aria-label", `${pct}% de avance general`);
  const sp = $("#julieta-side-prog"); sp.style.setProperty("--value", pct); sp.setAttribute("aria-valuenow", pct);
  $("#julieta-side-txt").textContent = `${hechas} de ${tareas.length} tareas hechas`;
  $("#julieta-cuerpo-eq").innerHTML = equipo.map((e) => {
    const a = tareas.filter((x) => x.r === e.n && x.c !== "Hecho").length, h = tareas.filter((x) => x.r === e.n && x.c === "Hecho").length;
    return `<tr><td><div class="julieta-np-person"><span class="al-avatar al-avatar--sm ${e.av}" aria-hidden="true">${e.ini}</span>${e.n}</div></td><td class="julieta-np-hide-sm">${e.rol}</td><td class="is-num" data-sort="${a}">${a}</td><td class="is-num" data-sort="${h}">${h}</td></tr>`;
  }).join("");
  $("#julieta-filtro-eq").dispatchEvent(new Event("input"));
}
const render = () => { renderTablero(); resumen(); };

document.addEventListener("click", (e) => {
  const m = e.target.closest("[data-julieta-mover]");
  if (m) {
    const t = tareas.find((x) => x.id === Number(m.dataset.julietaMover));
    if (t) { t.c = m.dataset.julietaCol; render(); Julieta.toast({ type: "success", title: "Tarea movida", text: `${t.t} → ${t.c}` }); }
    return;
  }
  const v = e.target.closest("[data-julieta-ver]");
  if (v) {
    actual = tareas.find((x) => x.id === Number(v.dataset.julietaVer)); if (!actual) return;
    const p = persona(actual.r);
    $("#julieta-det-cuerpo").innerHTML = `<h3>${esc(actual.t)}</h3>
      <div class="al-cluster"><span class="al-badge al-badge--${prioBadge[actual.pr]}">Prioridad ${actual.pr.toLowerCase()}</span><span class="al-badge al-badge--info">${actual.c}</span></div>
      <div class="julieta-np-person"><span class="al-avatar ${p.av}" aria-hidden="true">${p.ini}</span><div><div class="al-weight-700">${esc(actual.r)}</div><div class="al-text-sm al-text-muted">${p.rol}</div></div></div>
      <p class="al-text-muted">Proyecto: ${esc(actual.p)}<br>Fecha límite: ${fechaTxt(actual.f)} de 2026<br>Folio: NP-${String(actual.id).padStart(4, "0")}</p>`;
    $("#julieta-detalle").showModal();
  }
});
$("#julieta-det-borrar").addEventListener("click", () => {
  if (!actual) return;
  const t = actual; tareas = tareas.filter((x) => x !== t); actual = null;
  $("#julieta-detalle").close(); render(); Julieta.toast.warning("Tarea eliminada", t.t);
});

$("#julieta-buscar").addEventListener("input", renderTablero);
document.querySelectorAll("[data-julieta-prio]").forEach((b) => b.addEventListener("click", () => {
  prio = b.dataset.julietaPrio;
  document.querySelectorAll("[data-julieta-prio]").forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
  renderTablero();
}));
document.querySelectorAll("[data-julieta-proyecto]").forEach((a) => a.addEventListener("click", () => {
  proyecto = a.dataset.julietaProyecto;
  document.querySelectorAll("[data-julieta-proyecto]").forEach((x) => x.removeAttribute("aria-current")); a.setAttribute("aria-current", "page");
  $("#julieta-sub-proyecto").textContent = `${proyecto === "Todos" ? "Todos los proyectos" : proyecto} · semana del 2 de noviembre de 2026`;
  renderTablero();
}));

$("#julieta-form-tarea").addEventListener("al:valid", (e) => {
  const d = e.detail.data;
  tareas.unshift({ id: sig++, t: d.titulo.trim(), p: d.proyecto, r: d.responsable, pr: d.prioridad, f: d.fecha, c: "Pendiente" });
  $("#julieta-nueva").close(); e.target.reset(); render();
  Julieta.toast({ type: "success", title: "Tarea agregada", text: `${d.titulo} · ${d.responsable}` });
});

document.addEventListener("al:select", (e) => { if (e.detail.value === "salir") Julieta.toast.info("Cerraste sesión", "En esta plantilla no hay sesión real."); });
render();
