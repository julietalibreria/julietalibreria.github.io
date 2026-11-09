/* Julieta UI · Plantilla «Milpa · Verdura de temporada en tu puerta»
   Comportamiento de la plantilla. Los ids, atributos data y clases que usa llevan el prefijo julieta-.
   Se carga por CDN como módulo; agrega tu lógica en tu propio archivo JS. */

import { Julieta } from "../../julieta.js";
const CAJAS = {
  chica:   { nombre: "Caja chica",   precio: 260, desc: "Para 1 o 2 personas. Unos 3 kg de verdura y fruta, con 3 recetas." },
  mediana: { nombre: "Caja mediana", precio: 420, desc: "Para 3 o 4 personas. Unos 6 kg de verdura y fruta, con 5 recetas." },
  grande:  { nombre: "Caja grande",  precio: 590, desc: "Para 5 o más personas. Unos 9 kg de verdura y fruta, con 7 recetas." },
};
const FREQ = { semanal: "por entrega, cada semana", quincenal: "por entrega, cada 2 semanas", unica: "una sola entrega" };
const form = document.getElementById("julieta-pedido");
const $ = (id) => document.getElementById(id);
const pinta = () => {
  const c = CAJAS[form.tamano.value];
  $("julieta-res-tam").textContent = c.nombre;
  $("julieta-res-precio").textContent = "$" + c.precio;
  $("julieta-res-freq").textContent = FREQ[form.frecuencia.value];
  $("julieta-res-desc").textContent = c.desc;
};
form.addEventListener("change", pinta);
form.addEventListener("al:valid", (e) => {
  const d = e.detail.data;
  Julieta.toast({ type: "success", title: "¡Caja reservada!", text: `${CAJAS[d.tamano].nombre}: te escribiremos a ${d.correo} para confirmar la entrega.` });
  form.reset(); pinta();
});
form.addEventListener("al:invalid", () => Julieta.toast({ type: "warning", title: "Revisa el formulario", text: "Hay campos que necesitan tu atención." }));
