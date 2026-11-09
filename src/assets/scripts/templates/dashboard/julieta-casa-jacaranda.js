/* Julieta UI · Plantilla «Panel · Casa Jacaranda»
   Comportamiento de la plantilla. Los ids, atributos data y clases que usa llevan el prefijo julieta-.
   Se carga por CDN como módulo; agrega tu lógica en tu propio archivo JS. */

import { Julieta } from "../../julieta.js";
const $ = (s) => document.querySelector(s);

/* ---- Gráfica con selector de periodo ---- */
const seed = (n) => { let x = 7; return Array.from({ length: n }, (_, i) => { x = (x * 9301 + 49297) % 233280; return Math.round(1800 + (x / 233280) * 2600 + Math.sin(i / 3) * 500 + i * (n > 30 ? 8 : 25)); }); };
const ranges = {
  7:  { labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"], a: seed(7) },
  30: { labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`), a: seed(30) },
  90: { labels: Array.from({ length: 90 }, (_, i) => `${i + 1}`), a: seed(90) },
};
const money = (v) => `$${v.toLocaleString("es-MX")}`;
let graf;
function draw(r) {
  const d = ranges[r];
  graf?.destroy();
  graf = Julieta.chart($("#julieta-grafica"), { type: r === "7" ? "bar" : "area", labels: d.labels, series: [{ name: "Ventas", data: d.a }], format: money });
}
draw("7");
document.querySelectorAll('input[name="rango"]').forEach((i) => i.addEventListener("change", () => draw(i.value)));

/* ---- Tabla: contador visible y alta de pedidos ---- */
const tabla = $("#julieta-tabla");
const estado = () => { const n = [...tabla.tBodies[0].rows].filter((r) => !r.hidden).length; $("#julieta-tabla-estado").textContent = `${n} ${n === 1 ? "pedido" : "pedidos"}`; $("#julieta-count-badge").textContent = tabla.tBodies[0].rows.length; };
tabla.addEventListener("al:filter", estado);
estado();

const badge = { Pendiente: "warning", Pagado: "success", "En camino": "info" };
$("#julieta-form-pedido").addEventListener("al:valid", (e) => {
  const d = e.detail.data;
  const initials = d.cliente.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const total = Number(d.total);
  const tr = document.createElement("tr");
  tr.innerHTML = `<td><div class="al-cluster" style="flex-wrap:nowrap"><span class="al-avatar al-avatar--sm" aria-hidden="true"></span><span></span></div></td><td></td><td><span class="al-badge al-badge--${badge[d.estado]} al-badge--dot"></span></td><td class="is-num" data-sort="${total}"></td>`;
  tr.querySelector(".al-avatar").textContent = initials;
  tr.querySelector(".al-cluster span:last-child").textContent = d.cliente;
  tr.cells[1].textContent = d.producto;
  tr.querySelector(".al-badge").textContent = d.estado;
  tr.cells[3].textContent = total.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
  tabla.tBodies[0].prepend(tr);
  $("#julieta-nuevo").close();
  e.target.reset();
  estado();
  Julieta.toast({ type: "success", title: "Pedido agregado", text: `${d.cliente} · ${tr.cells[3].textContent}` });
});

document.addEventListener("al:select", (e) => { if (e.detail.value === "salir") Julieta.toast.info("Cerraste sesión", "En esta plantilla no hay sesión real."); });
