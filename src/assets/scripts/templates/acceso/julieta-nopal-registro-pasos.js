/* Julieta UI · Plantilla «Registro · Nopal Ahorro»
   Comportamiento de la plantilla. Los ids, atributos data y clases que usa llevan el prefijo julieta-.
   Se carga por CDN como módulo; agrega tu lógica en tu propio archivo JS. */

import { Julieta } from "../../julieta.js";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const ESTADOS = ["Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas","Chihuahua","Ciudad de México","Coahuila","Colima","Durango","Estado de México","Guanajuato","Guerrero","Hidalgo","Jalisco","Michoacán","Morelos","Nayarit","Nuevo León","Oaxaca","Puebla","Querétaro","Quintana Roo","San Luis Potosí","Sinaloa","Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatán","Zacatecas"];
$("#julieta-estadoMx").append(...ESTADOS.map((e) => new Option(e, e)));

const forms = [$("#julieta-f1"), $("#julieta-f2"), $("#julieta-f3")];
const titulos = ["Cuenta", "Perfil", "Confirmar"];
const items = $$("#julieta-pasos .al-stepper__item");
let actual = 0;

function ir(n, enfocar = true) {
  actual = n;
  forms.forEach((f, i) => { f.hidden = i !== n; });
  $("#julieta-exito").hidden = true;
  items.forEach((li, i) => {
    li.classList.toggle("is-done", i < n);
    li.classList.toggle("is-current", i === n);
    if (i === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
  });
  $("#julieta-estado").textContent = `Paso ${n + 1} de 3: ${titulos[n]}`;
  if (n === 2) resumen();
  if (enfocar) $(`#julieta-t${n + 1}`).focus({ preventScroll: false });
}

const val = (id) => $(id).value.trim();
function resumen() {
  const filas = [
    ["Nombre", val("#julieta-nombre"), 0],
    ["Correo", val("#julieta-correo"), 0],
    ["Contraseña", "•".repeat(Math.min($("#julieta-clave").value.length, 12)), 0],
    ["Celular", "+52 " + $("#julieta-tel").value, 1],
    ["Estado", $("#julieta-estadoMx").value, 1],
    ["Cuenta", `${$("input[name=tipo]:checked").value} · ${$("input[name=meta]:checked")?.value ?? ""}`, 1],
  ];
  $("#julieta-resumen").replaceChildren(...filas.map(([k, v, paso]) => {
    const row = document.createElement("div");
    const main = document.createElement("div"); main.className = "julieta-rg-sum__row-main";
    const dt = document.createElement("dt"); dt.textContent = k;
    const dd = document.createElement("dd"); dd.textContent = v;
    main.append(dt, dd);
    const b = document.createElement("button");
    b.type = "button"; b.className = "al-btn al-btn--ghost al-btn--sm"; b.textContent = "Editar";
    b.setAttribute("aria-label", `Editar ${k.toLowerCase()}`);
    b.addEventListener("click", () => { ir(paso, false); $(paso === 0 ? "#" + (k === "Nombre" ? "nombre" : k === "Correo" ? "correo" : "clave") : k === "Celular" ? "#julieta-tel" : k === "Estado" ? "#julieta-estadoMx" : "input[name=tipo]:checked").focus(); });
    row.append(main, b);
    return row;
  }));
}

// Medidor de fuerza + regla mínima
const clave = $("#julieta-clave");
function puntos(v) { return [v.length >= 8, /[A-Z]/.test(v), /[0-9]/.test(v), /[^A-Za-z0-9]/.test(v)].filter(Boolean).length; }
clave.addEventListener("input", () => {
  const v = clave.value, p = puntos(v);
  const barra = $("#julieta-fuerza");
  barra.style.setProperty("--value", v ? p * 25 : 0);
  barra.setAttribute("aria-valuenow", v ? p * 25 : 0);
  barra.classList.toggle("al-progress--success", p >= 3);
  barra.classList.toggle("al-progress--warning", p === 2);
  $("#julieta-fuerza-txt").textContent = !v ? "Mínimo 8 caracteres, con mayúsculas y números." : ["Muy débil", "Débil", "Aceptable", "Buena", "Excelente"][p];
  clave.setCustomValidity(v.length >= 8 && p < 3 ? "Añade una mayúscula y un número para fortalecerla." : "");
});

// Celular a 10 dígitos con formato
const tel = $("#julieta-tel");
tel.addEventListener("input", () => {
  const d = tel.value.replace(/\D/g, "").slice(0, 10);
  tel.value = d.length > 6 ? `${d.slice(0, 2)} ${d.slice(2, 6)} ${d.slice(6)}` : d.length > 2 ? `${d.slice(0, 2)} ${d.slice(2)}` : d;
  tel.setCustomValidity(d.length === 10 ? "" : "Escribe tu celular a 10 dígitos.");
});
tel.setCustomValidity("Escribe tu celular a 10 dígitos.");

$("#julieta-f1").addEventListener("al:valid", () => ir(1));
$("#julieta-f2").addEventListener("al:valid", () => ir(2));
$$("[data-julieta-atras]").forEach((b) => b.addEventListener("click", () => ir(actual - 1)));

$("#julieta-f3").addEventListener("al:valid", (e) => {
  const btn = e.target.querySelector('[type="submit"]');
  btn.classList.add("is-loading"); btn.setAttribute("aria-busy", "true");
  setTimeout(() => {
    btn.classList.remove("is-loading"); btn.removeAttribute("aria-busy");
    forms.forEach((f) => { f.hidden = true; });
    $("#julieta-pasos").closest("#julieta-encabezado").hidden = true;
    $("#julieta-exito").hidden = false;
    $("#julieta-ok-nombre").textContent = val("#julieta-nombre").split(/\s+/)[0];
    $("#julieta-ok-texto").textContent = `Tu meta: ${$("input[name=meta]:checked").value.toLowerCase()}. Empieza con el primer depósito cuando quieras.`;
    $("#julieta-ok-correo").textContent = `Enviamos un enlace a ${val("#julieta-correo")}.`;
    $("#julieta-estado").textContent = "Cuenta creada correctamente.";
    $("#julieta-t4").focus();
    Julieta.toast({ type: "success", title: "Cuenta creada", text: `Bienvenida, ${val("#julieta-nombre").split(/\s+/)[0]}.` });
  }, 1200);
});

$("#julieta-reiniciar").addEventListener("click", () => {
  forms.forEach((f) => f.reset());
  $$(".al-error", document).forEach((x) => x.remove());
  $$("[aria-invalid]").forEach((x) => x.removeAttribute("aria-invalid"));
  clave.dispatchEvent(new Event("input")); tel.setCustomValidity("Escribe tu celular a 10 dígitos.");
  $("#julieta-encabezado").hidden = false;
  ir(0);
});
$("#julieta-ya-tengo").addEventListener("click", () => Julieta.toast({ type: "info", title: "Inicio de sesión", text: "Aquí enlazarías tu pantalla de acceso." }));
