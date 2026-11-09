/* Julieta UI · Plantilla «Recuperar acceso · Cenote Seguros»
   Comportamiento de la plantilla. Los ids, atributos data y clases que usa llevan el prefijo julieta-.
   Se carga por CDN como módulo; agrega tu lógica en tu propio archivo JS. */

import { Julieta } from "../../julieta.js";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const CODIGO_OK = "482915", ESPERA = 30, MAX_INTENTOS = 3;
const vistas = ["#julieta-f-correo", "#julieta-f-codigo", "#julieta-f-clave", "#julieta-exito"].map((s) => $(s));
const titulos = ["Recuperar acceso", "Verifica tu código", "Contraseña nueva", "Listo"];
let intentos = 0, timer = null, restante = 0;

function ir(n, enfocar = true) {
  vistas.forEach((v, i) => { v.hidden = i !== n; });
  $$("#julieta-barra li").forEach((li, i) => li.classList.toggle("is-on", i <= Math.min(n, 2)));
  $("#julieta-estado").textContent = `${titulos[n]}.`;
  if (enfocar) $(`#julieta-t${n + 1}`).focus();
}
const cargando = (btn, on) => { btn.classList.toggle("is-loading", on); on ? btn.setAttribute("aria-busy", "true") : btn.removeAttribute("aria-busy"); };

// ---- Código de 6 dígitos ----
const caja = $("#julieta-codigo");
const celdas = Array.from({ length: 6 }, (_, i) => {
  const el = document.createElement("input");
  el.className = "al-input"; el.type = "text"; el.inputMode = "numeric"; el.maxLength = 1;
  el.autocomplete = i === 0 ? "one-time-code" : "off"; el.setAttribute("aria-label", `Dígito ${i + 1} de 6`);
  caja.append(el); return el;
});
const valor = () => celdas.map((c) => c.value).join("");
function errorCodigo(texto) {
  const e = $("#julieta-codigo-err");
  e.hidden = !texto; e.textContent = texto || "";
  celdas.forEach((c) => texto ? c.setAttribute("aria-invalid", "true") : c.removeAttribute("aria-invalid"));
}
function rellenar(desde, digitos) {
  let i = desde;
  for (const d of digitos) { if (i > 5) break; celdas[i++].value = d; }
  celdas[Math.min(i, 5)].focus();
}
celdas.forEach((c, i) => {
  c.addEventListener("input", () => {
    const d = c.value.replace(/\D/g, "");
    c.value = "";
    if (d) { errorCodigo(""); rellenar(i, d); }
    if (valor().length === 6) $("#julieta-f-codigo").requestSubmit();
  });
  c.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !c.value && i > 0) { e.preventDefault(); celdas[i - 1].value = ""; celdas[i - 1].focus(); }
    else if (e.key === "ArrowLeft" && i > 0) { e.preventDefault(); celdas[i - 1].focus(); }
    else if (e.key === "ArrowRight" && i < 5) { e.preventDefault(); celdas[i + 1].focus(); }
  });
  c.addEventListener("focus", () => c.select());
  c.addEventListener("paste", (e) => {
    e.preventDefault();
    const d = (e.clipboardData?.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    if (!d) return;
    errorCodigo("");
    rellenar(d.length === 6 ? 0 : i, d);
    if (valor().length === 6) $("#julieta-f-codigo").requestSubmit();
  });
});

$("#julieta-f-codigo").addEventListener("submit", (e) => {
  e.preventDefault();
  if ($("#julieta-verificar").classList.contains("is-loading")) return;
  const v = valor();
  if (v.length < 6) { errorCodigo("Escribe los 6 dígitos del código."); celdas[v.length].focus(); return; }
  errorCodigo("");
  const btn = $("#julieta-verificar"); cargando(btn, true);
  setTimeout(() => {
    cargando(btn, false);
    if (v === CODIGO_OK) {
      clearInterval(timer);
      ir(2);
      Julieta.toast({ type: "success", title: "Código verificado", text: "Ahora crea tu nueva contraseña." });
    } else {
      intentos++;
      celdas.forEach((c) => { c.value = ""; });
      if (intentos >= MAX_INTENTOS) {
        errorCodigo("Demasiados intentos. Solicita un código nuevo.");
        celdas.forEach((c) => { c.disabled = true; }); btn.disabled = true;
        if (restante > 0) return;
      } else {
        errorCodigo(`El código no es correcto. Te quedan ${MAX_INTENTOS - intentos} intento${MAX_INTENTOS - intentos === 1 ? "" : "s"}.`);
        celdas[0].focus();
      }
    }
  }, 900);
});

// ---- Cuenta regresiva ----
const fmt = (s) => `0:${String(s).padStart(2, "0")}`;
function arrancar() {
  clearInterval(timer);
  restante = ESPERA;
  $("#julieta-reenviar").disabled = true;
  const pinta = () => { $("#julieta-cuenta").textContent = restante > 0 ? `Podrás reenviar el código en ${fmt(restante)}` : "¿No te llegó el código?"; };
  pinta();
  timer = setInterval(() => {
    restante--; pinta();
    if (restante <= 0) { clearInterval(timer); $("#julieta-reenviar").disabled = false; $("#julieta-estado").textContent = "Ya puedes reenviar el código."; }
  }, 1000);
}
$("#julieta-reenviar").addEventListener("click", () => {
  const btn = $("#julieta-reenviar"); cargando(btn, true);
  setTimeout(() => {
    cargando(btn, false);
    intentos = 0; errorCodigo("");
    celdas.forEach((c) => { c.value = ""; c.disabled = false; }); $("#julieta-verificar").disabled = false;
    arrancar(); celdas[0].focus();
    $("#julieta-estado").textContent = "Código reenviado.";
    Julieta.toast({ type: "success", title: "Código reenviado", text: `Revisa ${$("#julieta-correo-mask").textContent}.` });
  }, 800);
});

// ---- Paso 1: correo ----
const mascara = (c) => { const [u, d] = c.split("@"); return `${u[0]}${"•".repeat(Math.max(u.length - 1, 2))}@${d}`; };
$("#julieta-f-correo").addEventListener("al:valid", (e) => {
  const btn = $("#julieta-f-correo [type=submit]"); cargando(btn, true);
  setTimeout(() => {
    cargando(btn, false);
    $("#julieta-correo-mask").textContent = mascara(e.detail.data.correo.trim());
    intentos = 0; errorCodigo("");
    celdas.forEach((c) => { c.value = ""; c.disabled = false; }); $("#julieta-verificar").disabled = false;
    ir(1, false); arrancar(); celdas[0].focus();
    Julieta.toast({ type: "info", title: "Código enviado", text: "Tarda menos de un minuto en llegar." });
  }, 1000);
});
$("#julieta-cambiar-correo").addEventListener("click", () => { clearInterval(timer); ir(0); $("#julieta-correo").focus(); });

// ---- Paso 3: nueva contraseña ----
const clave = $("#julieta-clave"), clave2 = $("#julieta-clave2");
const puntos = (v) => [v.length >= 8, /[A-Z]/.test(v), /[0-9]/.test(v), /[^A-Za-z0-9]/.test(v)].filter(Boolean).length;
function validarClaves() {
  const v = clave.value, p = puntos(v);
  const barra = $("#julieta-fuerza");
  barra.style.setProperty("--value", v ? p * 25 : 0); barra.setAttribute("aria-valuenow", v ? p * 25 : 0);
  barra.classList.toggle("al-progress--success", p >= 3); barra.classList.toggle("al-progress--warning", p === 2);
  $("#julieta-fuerza-txt").textContent = !v ? "Mínimo 8 caracteres, con mayúsculas y números." : ["Muy débil", "Débil", "Aceptable", "Buena", "Excelente"][p];
  clave.setCustomValidity(v.length >= 8 && p < 3 ? "Añade una mayúscula y un número para fortalecerla." : "");
  clave2.setCustomValidity(clave2.value && clave2.value !== v ? "Las contraseñas no coinciden." : "");
}
clave.addEventListener("input", validarClaves); clave2.addEventListener("input", validarClaves);
$("#julieta-f-clave").addEventListener("al:valid", () => {
  const btn = $("#julieta-f-clave [type=submit]"); cargando(btn, true);
  setTimeout(() => {
    cargando(btn, false); ir(3);
    Julieta.toast({ type: "success", title: "Contraseña actualizada", text: "Tu cuenta está protegida de nuevo." });
  }, 1100);
});

// ---- Otros ----
const aviso = () => Julieta.toast({ type: "info", title: "Inicio de sesión", text: "Aquí enlazarías tu pantalla de acceso." });
$("#julieta-volver-login").addEventListener("click", aviso); $("#julieta-ir-login").addEventListener("click", aviso);
$("#julieta-reiniciar").addEventListener("click", () => {
  $$("form").forEach((f) => f.reset());
  $$(".al-error[id$='-err']").forEach((x) => { if (x.id !== "julieta-codigo-err") x.remove(); });
  $$("[aria-invalid]").forEach((x) => x.removeAttribute("aria-invalid"));
  validarClaves(); errorCodigo(""); ir(0); $("#julieta-correo").focus();
});
