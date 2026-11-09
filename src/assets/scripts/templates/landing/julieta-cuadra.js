/* Julieta UI · Plantilla «Cuadra · Organiza tu tianguis sin perder la cabeza»
   Comportamiento de la plantilla. Los ids, atributos data y clases que usa llevan el prefijo julieta-.
   Se carga por CDN como módulo; agrega tu lógica en tu propio archivo JS. */

import { Julieta } from "../../julieta.js";
// Demo de asistencia
const lista = document.getElementById("julieta-d-lista");
const cuenta = () => {
  const boxes = [...lista.querySelectorAll("input")];
  const n = boxes.filter((b) => b.checked).length, t = boxes.length, p = Math.round((n / t) * 100);
  document.getElementById("julieta-d-conf").textContent = `${n} de ${t}`;
  document.getElementById("julieta-d-libres").textContent = t - n;
  const bar = document.getElementById("julieta-d-prog");
  bar.style.setProperty("--value", p); bar.setAttribute("aria-valuenow", p);
};
lista.addEventListener("change", cuenta);
// Precios mensual / anual
const per = document.querySelectorAll(".julieta-cu-per");
document.querySelectorAll("input[name=ciclo]").forEach((r) => r.addEventListener("change", () => {
  const anual = document.querySelector("input[name=ciclo]:checked").value === "anual";
  document.querySelectorAll("[data-julieta-precio]").forEach((s) => {
    const base = +s.dataset.julietaPrecio; s.textContent = "$" + (anual ? Math.round(base * 10 / 12) : base);
  });
  per.forEach((p) => (p.textContent = "al mes" + (anual ? ", pago anual" : "")));
}));
// Solicitud de acceso
const form = document.getElementById("julieta-acceso");
document.querySelectorAll("[data-julieta-plan]").forEach((b) => b.addEventListener("click", () => { form.dataset.julietaPlan = b.dataset.julietaPlan; }));
form.addEventListener("al:valid", (e) => {
  document.getElementById("julieta-lista").close();
  Julieta.toast({ type: "success", title: "Solicitud enviada", text: `Te escribiremos a ${e.detail.data.correo} cuando abramos tu tanda.` });
  form.reset();
});
