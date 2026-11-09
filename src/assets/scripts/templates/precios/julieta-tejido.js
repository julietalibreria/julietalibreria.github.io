/* Julieta UI · Plantilla «Precios · Tejido»
   Comportamiento de la plantilla. Los ids, atributos data y clases que usa llevan el prefijo julieta-.
   Se carga por CDN como módulo; agrega tu lógica en tu propio archivo JS. */

import { Julieta } from "../../julieta.js";
const mxn = (n) => n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
const ANUAL = 0.8;

function pintar(ciclo) {
  document.querySelectorAll("[data-julieta-precio]").forEach((el) => {
    const base = Number(el.dataset.julietaPrecio);
    el.textContent = mxn(ciclo === "anual" ? Math.round(base * ANUAL) : base);
  });
  document.querySelectorAll("[data-julieta-nota]").forEach((el) => {
    const base = Number(el.dataset.julietaNota);
    el.textContent = ciclo === "anual" ? `${mxn(Math.round(base * ANUAL * 12))} al año · ahorras ${mxn(Math.round(base * 12 * (1 - ANUAL)))}` : "Facturado cada mes";
  });
}
document.querySelectorAll('input[name="ciclo"]').forEach((r) => r.addEventListener("change", () => pintar(r.value)));
pintar("mensual");

document.querySelectorAll("[data-julieta-plan]").forEach((a) => a.addEventListener("click", (e) => {
  e.preventDefault();
  const ciclo = document.querySelector('input[name="ciclo"]:checked').value;
  Julieta.toast({ type: "success", title: `Elegiste ${a.dataset.julietaPlan}`, text: `Facturación ${ciclo}. Aquí iría tu flujo de pago.` });
}));
