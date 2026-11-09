/* Julieta UI · Plantilla «Precios por uso · Amate»
   Comportamiento de la plantilla. Los ids, atributos data y clases que usa llevan el prefijo julieta-.
   Se carga por CDN como módulo; agrega tu lógica en tu propio archivo JS. */

import { Julieta } from "../../julieta.js";
const fmt = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const mxn = (n) => fmt.format(n);
const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const $ = (s) => document.querySelector(s);

const PRECIO_PERSONA = 89, GB_POR_PERSONA = 10, PRECIO_GB = 1.8, IVA = 0.16, ANUAL = 0.2;
const TRAMOS = [[100, 0.2], [50, 0.15], [25, 0.1], [10, 0.05], [1, 0]];
const descuentoVol = (u) => TRAMOS.find(([min]) => u >= min)[1];
const gbTxt = (gb) => gb >= 1000 ? `${(gb / 1000).toLocaleString("es-MX")} TB` : `${gb.toLocaleString("es-MX")} GB`;

const uEl = $("#julieta-usuarios"), gEl = $("#julieta-almacenamiento");
let ultimo = "";

function calcular() {
  const u = +uEl.value, gb = +gEl.value;
  const anual = $('input[name="ciclo"]:checked').value === "anual";
  const personas = r2(u * PRECIO_PERSONA);
  const incluidos = u * GB_POR_PERSONA;
  const extraGb = Math.max(0, gb - incluidos);
  const extra = r2(extraGb * PRECIO_GB);
  const extras = ["#julieta-x-firma", "#julieta-x-soporte"].reduce((s, id) => s + ($(id).checked ? +$(id).dataset.julietaPrecio : 0), 0);
  const pct = descuentoVol(u);
  const vol = r2((personas + extra) * pct);
  const tras = r2(personas + extra - vol + extras);
  const desAnual = anual ? r2(tras * ANUAL) : 0;
  const sub = r2(tras - desAnual);
  const iva = r2(sub * IVA);
  const total = r2(sub + iva);
  return { u, gb, anual, personas, incluidos, extraGb, extra, extras, pct, vol, desAnual, sub, iva, total };
}

function pintar() {
  const c = calcular();
  $("#julieta-usuarios-val").textContent = c.u.toLocaleString("es-MX");
  $("#julieta-almacenamiento-val").textContent = gbTxt(c.gb);
  $("#julieta-l-personas").textContent = `${c.u.toLocaleString("es-MX")} ${c.u === 1 ? "persona" : "personas"} × ${mxn(PRECIO_PERSONA)}`;
  $("#julieta-v-personas").textContent = mxn(c.personas);
  $("#julieta-l-extra").textContent = c.extraGb > 0 ? `${c.extraGb.toLocaleString("es-MX")} GB adicionales × ${mxn(PRECIO_GB)}` : `Incluye ${c.incluidos.toLocaleString("es-MX")} GB`;
  $("#julieta-v-extra").textContent = c.extraGb > 0 ? mxn(c.extra) : "Incluido";
  $("#julieta-r-extras").hidden = c.extras === 0;
  $("#julieta-v-extras").textContent = mxn(c.extras);
  $("#julieta-r-vol").hidden = c.vol === 0;
  $("#julieta-l-vol").textContent = `Descuento por volumen (${Math.round(c.pct * 100)}%)`;
  $("#julieta-v-vol").textContent = `−${mxn(c.vol)}`;
  $("#julieta-r-anual").hidden = !c.anual;
  $("#julieta-v-anual").textContent = `−${mxn(c.desAnual)}`;
  $("#julieta-v-sub").textContent = mxn(c.sub);
  $("#julieta-v-iva").textContent = mxn(c.iva);
  $("#julieta-v-total").textContent = mxn(c.total);
  $("#julieta-t-label").textContent = c.anual ? "Total al mes, pagado por adelantado al año" : "Total al mes";
  $("#julieta-t-nota").textContent = c.anual ? `${mxn(r2(c.total * 12))} al año con IVA` : `Con IVA incluido. ${mxn(r2(c.sub * 12 * (1 - ANUAL) * (1 + IVA)))} al año si pagas anual.`;
  const ahorro = r2(c.vol + c.desAnual);
  $("#julieta-ahorro").hidden = ahorro === 0;
  $("#julieta-ahorro-txt").textContent = `${mxn(ahorro)} al mes antes de IVA entre descuentos.`;
  document.querySelectorAll(".julieta-am-tier").forEach((t) => {
    const min = +t.dataset.julietaMin, next = TRAMOS.slice().reverse().find(([m]) => m > min);
    t.classList.toggle("is-active", c.u >= min && (!next || c.u < next[0]));
  });
  document.querySelectorAll("#julieta-ejemplos .al-chip").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.julietaU === c.u && +b.dataset.julietaGb === c.gb)));
  ultimo = `Amate · ${c.u} personas, ${gbTxt(c.gb)}${c.anual ? ", facturación anual" : ""}: ${mxn(c.total)} al mes con IVA.`;
}

[uEl, gEl, $("#julieta-x-firma"), $("#julieta-x-soporte")].forEach((el) => el.addEventListener("input", pintar));
document.querySelectorAll('input[name="ciclo"]').forEach((r) => r.addEventListener("change", pintar));
document.querySelectorAll("#julieta-ejemplos .al-chip").forEach((b) => b.addEventListener("click", () => {
  uEl.value = b.dataset.julietaU; gEl.value = b.dataset.julietaGb;
  uEl.dispatchEvent(new Event("input", { bubbles: true })); gEl.dispatchEvent(new Event("input", { bubbles: true }));
}));

$("#julieta-contratar").addEventListener("click", () => {
  const c = calcular();
  Julieta.toast({ type: "success", title: "Configuración lista", text: `${c.u} personas y ${gbTxt(c.gb)} por ${mxn(c.total)} al mes. Aquí iría tu flujo de pago.` });
});
$("#julieta-guardar").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(ultimo); Julieta.toast({ type: "info", title: "Resumen copiado", text: ultimo }); }
  catch { Julieta.toast({ type: "info", title: "Tu resumen", text: ultimo }); }
});
pintar();
