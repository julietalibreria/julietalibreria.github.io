/* Julieta UI · Plantilla «Precios · Cántaro»
   Comportamiento de la plantilla. Los ids, atributos data y clases que usa llevan el prefijo julieta-.
   Se carga por CDN como módulo; agrega tu lógica en tu propio archivo JS. */

import { Julieta } from "../../julieta.js";
const mxn = (n) => n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
const PERSONAL = 149, POR_PERSONA = 249;
const sel = document.getElementById("julieta-personas");
function pintar() {
  const n = Number(sel.value);
  document.getElementById("julieta-p-personal").textContent = mxn(PERSONAL);
  document.getElementById("julieta-p-equipos").textContent = mxn(n * POR_PERSONA);
  document.getElementById("julieta-n-equipos").textContent = `${mxn(POR_PERSONA)} por persona × ${n}. Más IVA.`;
}
sel.addEventListener("change", pintar);
pintar();
document.querySelectorAll("[data-julieta-plan]").forEach((b) => b.addEventListener("click", () => {
  const equipos = b.dataset.julietaPlan === "Equipos";
  const n = Number(sel.value);
  const texto = equipos ? `${n} personas por ${mxn(n * POR_PERSONA)} al mes más IVA.` : `${mxn(PERSONAL)} al mes más IVA.`;
  Julieta.toast({ type: "success", title: `Elegiste ${b.dataset.julietaPlan}`, text: `${texto} Aquí iría tu flujo de pago.` });
}));
document.getElementById("julieta-garantia-btn").addEventListener("click", () => {
  Julieta.toast({ type: "info", title: "Garantía de 30 días", text: "Escribe a ayuda@cantaro.example dentro de tus primeros 30 días y te reembolsamos." });
});
