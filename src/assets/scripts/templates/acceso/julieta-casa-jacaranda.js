/* Julieta UI · Plantilla «Acceso · Casa Jacaranda»
   Comportamiento de la plantilla. Los ids, atributos data y clases que usa llevan el prefijo julieta-.
   Se carga por CDN como módulo; agrega tu lógica en tu propio archivo JS. */

import { Julieta } from "../../julieta.js";
const $ = (s) => document.querySelector(s);

function enviar(form, mensaje) {
  const btn = form.querySelector('[type="submit"]');
  btn.classList.add("is-loading");
  setTimeout(() => { btn.classList.remove("is-loading"); Julieta.toast({ type: "success", title: mensaje.title, text: mensaje.text }); }, 1100);
}
$("#julieta-f-entrar").addEventListener("al:valid", (e) => enviar(e.target, { title: "Sesión iniciada", text: e.detail.data.correo }));
$("#julieta-f-crear").addEventListener("al:valid", (e) => enviar(e.target, { title: "Cuenta creada", text: `Bienvenida, ${e.detail.data.nombre.split(" ")[0]}.` }));
$("#julieta-olvide").addEventListener("click", (e) => { e.preventDefault(); Julieta.toast({ type: "info", title: "Revisa tu correo", text: "Te enviaremos un enlace para restablecerla." }); });
document.querySelectorAll("[data-julieta-sso]").forEach((b) => b.addEventListener("click", () => Julieta.toast({ type: "info", title: `Acceso con ${b.dataset.julietaSso}`, text: "Conecta aquí tu proveedor de identidad." })));

// Medidor de fuerza de contraseña
$("#julieta-c-clave").addEventListener("input", (e) => {
  const v = e.target.value;
  const puntos = [v.length >= 8, /[A-Z]/.test(v), /[0-9]/.test(v), /[^A-Za-z0-9]/.test(v)].filter(Boolean).length;
  const barra = $("#julieta-fuerza");
  barra.style.setProperty("--value", v ? puntos * 25 : 0);
  barra.classList.toggle("al-progress--success", puntos >= 3);
  barra.classList.toggle("al-progress--warning", puntos === 2);
  $("#julieta-fuerza-txt").textContent = !v ? "Usa al menos 8 caracteres." : ["Muy débil", "Débil", "Aceptable", "Buena", "Excelente"][puntos];
});
