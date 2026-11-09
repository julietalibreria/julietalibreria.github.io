/* Julieta UI · Plantilla «Panel de finanzas · Caja Chica»
   Comportamiento de la plantilla. Los ids, atributos data y clases que usa llevan el prefijo julieta-.
   Se carga por CDN como módulo; agrega tu lógica en tu propio archivo JS. */

import { Julieta } from "../../julieta.js";
const $ = (s) => document.querySelector(s);
const mxn = (v) => v.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: v % 1 ? 2 : 0 });
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fechaTxt = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
const PRESUPUESTO = 60000;

const inicial = [
  { id: 1, fecha: "2026-10-31", concepto: "Venta de mostrador", tipo: "ingreso", cat: "Ventas", monto: 8420 },
  { id: 2, fecha: "2026-10-30", concepto: "Maíz nixtamalizado (500 kg)", tipo: "egreso", cat: "Insumos", monto: 6250 },
  { id: 3, fecha: "2026-10-29", concepto: "Pedido de fonda Doña Chela", tipo: "ingreso", cat: "Ventas", monto: 12600 },
  { id: 4, fecha: "2026-10-28", concepto: "Recibo de luz", tipo: "egreso", cat: "Servicios", monto: 3180.5 },
  { id: 5, fecha: "2026-10-26", concepto: "Nómina quincenal", tipo: "egreso", cat: "Nómina", monto: 21500 },
  { id: 6, fecha: "2026-10-25", concepto: "Catering de boda", tipo: "ingreso", cat: "Ventas", monto: 15800 },
  { id: 7, fecha: "2026-10-22", concepto: "Gas LP (2 tanques)", tipo: "egreso", cat: "Servicios", monto: 4120 },
  { id: 8, fecha: "2026-10-20", concepto: "Venta de mostrador", tipo: "ingreso", cat: "Ventas", monto: 7940 },
  { id: 9, fecha: "2026-10-18", concepto: "Renta del local", tipo: "egreso", cat: "Renta", monto: 9500 },
  { id: 10, fecha: "2026-10-15", concepto: "Reparación de molino", tipo: "egreso", cat: "Otros", monto: 2380 },
  { id: 11, fecha: "2026-10-12", concepto: "Pedido de la escuela Benito Juárez", tipo: "ingreso", cat: "Ventas", monto: 9800 },
  { id: 12, fecha: "2026-10-08", concepto: "Bolsas y papel encerado", tipo: "egreso", cat: "Insumos", monto: 1460 },
];
let datos = structuredClone(inicial);
let sig = 100, tipoSel = "todos", actual = null;

const cuerpo = $("#julieta-cuerpo"), tabla = $("#julieta-tabla"), filtro = $("#julieta-filtro");

function renderTabla() {
  cuerpo.innerHTML = datos.map((m) => `
    <tr data-julieta-id="${m.id}" data-julieta-tipo="${m.tipo}">
      <td class="julieta-cc-hide-sm" data-sort="${m.fecha}">${fechaTxt(m.fecha)}</td>
      <td><div class="julieta-cc-concept"><span class="al-avatar al-avatar--sm ${m.tipo === "ingreso" ? "al-avatar--agave" : "al-avatar--sol"}" aria-hidden="true"><al-icon name="${m.tipo === "ingreso" ? "arrow-down" : "arrow-up"}" size="16"></al-icon></span><span>${esc(m.concepto)}<small>${m.tipo === "ingreso" ? "Ingreso" : "Egreso"} · ${fechaTxt(m.fecha)}</small></span></div></td>
      <td class="julieta-cc-hide-sm"><span class="al-badge ${m.tipo === "ingreso" ? "al-badge--success" : "al-badge--neutral"}">${esc(m.cat)}</span></td>
      <td class="is-num ${m.tipo === "ingreso" ? "julieta-cc-in" : "julieta-cc-out"}" data-sort="${m.tipo === "ingreso" ? m.monto : -m.monto}">${m.tipo === "ingreso" ? "+" : "−"}${mxn(m.monto)}</td>
      <td class="is-num"><button class="al-btn al-btn--ghost al-btn--icon al-btn--sm" type="button" data-julieta-detalle="${m.id}" aria-label="Ver detalle de ${esc(m.concepto)}"><al-icon name="chevron-right" size="18"></al-icon></button></td>
    </tr>`).join("");
  aplicar();
  resumen();
}

/* Filtro por tipo: reutiliza el filtro de texto de Julieta y oculta además por tipo */
function aplicarTipo() {
  [...cuerpo.rows].forEach((r) => { if (tipoSel !== "todos" && r.dataset.julietaTipo !== tipoSel) r.hidden = true; });
  const vis = [...cuerpo.rows].filter((r) => !r.hidden).length;
  $("#julieta-tabla-estado").textContent = `${vis} de ${cuerpo.rows.length} movimientos`;
  const wrap = tabla.parentElement, vacio = wrap.querySelector(".al-table__empty");
  if (!vis && !vacio) tabla.after(Object.assign(document.createElement("div"), { className: "al-table__empty al-empty", innerHTML: '<div class="al-empty__title">Sin resultados</div><p class="al-empty__text">Ningún movimiento coincide con los filtros.</p>' }));
  else if (vis && vacio) vacio.remove();
}
const aplicar = () => filtro.dispatchEvent(new Event("input"));
tabla.addEventListener("al:filter", aplicarTipo);

document.querySelectorAll("[data-julieta-tipo]").forEach((b) => b.addEventListener("click", () => {
  tipoSel = b.dataset.julietaTipo;
  document.querySelectorAll("[data-julieta-tipo].al-chip").forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
  aplicar();
}));

/* Indicadores, categorías y presupuesto */
function resumen() {
  const ing = datos.filter((m) => m.tipo === "ingreso").reduce((a, m) => a + m.monto, 0);
  const egr = datos.filter((m) => m.tipo === "egreso").reduce((a, m) => a + m.monto, 0);
  $("#julieta-k-ing").textContent = mxn(ing); $("#julieta-k-egr").textContent = mxn(egr); $("#julieta-k-saldo").textContent = mxn(ing - egr);
  const porCat = {};
  datos.filter((m) => m.tipo === "egreso").forEach((m) => (porCat[m.cat] = (porCat[m.cat] || 0) + m.monto));
  const filas = Object.entries(porCat).sort((a, b) => b[1] - a[1]);
  $("#julieta-cats").innerHTML = filas.map(([c, v]) => `<div><div class="julieta-cc-cats__row"><span>${esc(c)}</span><span class="al-tabular">${mxn(v)}</span></div><div class="al-progress" style="--value:${Math.round((v / egr) * 100)}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round((v / egr) * 100)}" aria-label="${esc(c)}"><span></span></div></div>`).join("") || '<p class="al-text-muted al-text-sm">Aún no hay egresos.</p>';
  const pct = Math.min(100, Math.round((egr / PRESUPUESTO) * 100));
  const p = $("#julieta-pres");
  p.style.setProperty("--value", pct); p.setAttribute("aria-valuenow", pct);
  p.classList.toggle("al-progress--warning", pct >= 75);
  $("#julieta-pres-txt").textContent = `${pct}% de ${mxn(PRESUPUESTO)}`;
}

/* Gráfica */
const meses = ["Nov", "Dic", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct"];
const ingS = [38, 52, 31, 36, 40, 43, 41, 46, 44, 49, 47, 54].map((v) => v * 1000);
const egrS = [30, 34, 28, 31, 33, 35, 36, 37, 38, 40, 39, 41].map((v) => v * 1000);
let graf;
function dibujar(n) {
  graf?.destroy();
  graf = Julieta.chart($("#julieta-grafica"), { type: "bar", labels: meses.slice(-n), series: [{ name: "Ingresos", data: ingS.slice(-n) }, { name: "Egresos", data: egrS.slice(-n) }], format: (v) => `$${v.toLocaleString("es-MX")}` });
  document.querySelectorAll("#julieta-grafica svg [fill]").length;
}
dibujar(6);
document.querySelectorAll('input[name="rango"]').forEach((i) => i.addEventListener("change", () => dibujar(Number(i.value))));

/* Alta de movimientos */
$("#julieta-form-mov").addEventListener("al:valid", (e) => {
  const d = e.detail.data;
  datos.unshift({ id: sig++, fecha: d.fecha, concepto: d.concepto.trim(), tipo: d.tipo, cat: d.categoria, monto: Number(d.monto) });
  $("#julieta-nuevo").close(); e.target.reset();
  renderTabla();
  Julieta.toast({ type: "success", title: d.tipo === "ingreso" ? "Ingreso registrado" : "Egreso registrado", text: `${d.concepto} · ${mxn(Number(d.monto))}` });
});

/* Detalle en drawer */
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-julieta-detalle]");
  if (!b) return;
  actual = datos.find((m) => m.id === Number(b.dataset.julietaDetalle));
  if (!actual) return;
  $("#julieta-det-cuerpo").innerHTML = `<div class="al-stat"><span class="al-stat__label">${actual.tipo === "ingreso" ? "Ingreso" : "Egreso"}</span><span class="al-stat__value">${mxn(actual.monto)}</span></div>
    <dl><dt>Concepto</dt><dd>${esc(actual.concepto)}</dd><dt>Categoría</dt><dd>${esc(actual.cat)}</dd><dt>Fecha</dt><dd>${fechaTxt(actual.fecha)}</dd><dt>Folio</dt><dd>CC-${String(actual.id).padStart(5, "0")}</dd></dl>`;
  $("#julieta-detalle").showModal();
});
$("#julieta-det-borrar").addEventListener("click", () => {
  if (!actual) return;
  datos = datos.filter((m) => m !== actual);
  $("#julieta-detalle").close(); renderTabla();
  Julieta.toast.warning("Movimiento eliminado", actual.concepto);
  actual = null;
});

/* Exportar */
$("#julieta-menu-exportar").addEventListener("al:select", async (e) => {
  if (e.detail.value === "csv") {
    const csv = ["fecha,concepto,tipo,categoria,monto", ...datos.map((m) => [m.fecha, `"${m.concepto.replace(/"/g, '""')}"`, m.tipo, m.cat, m.monto].join(","))].join("\n");
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv" })), download: "movimientos-caja-chica.csv" });
    document.body.append(a); a.click(); a.remove();
    Julieta.toast.success("CSV descargado", `${datos.length} movimientos`);
  } else {
    const txt = `Caja Chica · Octubre 2026\nIngresos: ${$("#julieta-k-ing").textContent}\nEgresos: ${$("#julieta-k-egr").textContent}\nSaldo: ${$("#julieta-k-saldo").textContent}`;
    try { await navigator.clipboard.writeText(txt); Julieta.toast.success("Resumen copiado", "Listo para pegar."); }
    catch { Julieta.toast.info("No se pudo copiar", "Tu navegador bloqueó el portapapeles."); }
  }
});

$("#julieta-btn-reset").addEventListener("click", () => { datos = structuredClone(inicial); renderTabla(); Julieta.toast.info("Datos restablecidos", "Volvieron los movimientos de ejemplo."); });

document.querySelectorAll(".julieta-cc-sub a").forEach((a) => a.addEventListener("click", () => {
  document.querySelectorAll(".julieta-cc-sub a").forEach((x) => x.removeAttribute("aria-current")); a.setAttribute("aria-current", "page");
}));
document.addEventListener("al:select", (e) => { if (e.detail.value === "salir") Julieta.toast.info("Cerraste sesión", "En esta plantilla no hay sesión real."); });

renderTabla();
