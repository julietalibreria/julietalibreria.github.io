/* ==========================================================================
   Julieta UI · forms.js
   Mejoras de formularios, todas por atributos data-*:
     · .al-range                → relleno de la barra + <output data-al-output-for="#id">
     · [data-al-counter="#id"]  → contador de caracteres (usa maxlength)
     · .al-dropzone             → arrastrar y soltar archivos, con lista
     · [data-al-toggle-password="#id"] → mostrar / ocultar contraseña
     · form[data-al-validate]   → validación con mensajes en español; evento al:valid
                                  (si el form no tiene action, no se recarga la página)
     · [data-al-alert-close]    → cierra alertas
     · .al-chip[aria-pressed]   → alterna; .al-chip__remove quita el chip
     · .al-btn-group [aria-pressed] → selección única
     · input[data-indeterminate] → casilla en estado indeterminado
   ========================================================================== */
import { $, $$, on, h, emit } from "./core.js";

const MESSAGES = {
  valueMissing: () => "Este campo es obligatorio.",
  typeMismatch: (el) => (el.type === "email" ? "Escribe un correo válido, como nombre@dominio.com." : el.type === "url" ? "Escribe una URL completa, como https://ejemplo.com." : "El formato no es válido."),
  tooShort: (el) => `Escribe al menos ${el.minLength} caracteres (llevas ${el.value.length}).`,
  tooLong: (el) => `Máximo ${el.maxLength} caracteres.`,
  patternMismatch: (el) => el.title || "El formato no coincide con lo esperado.",
  rangeUnderflow: (el) => `El valor mínimo es ${el.min}.`,
  rangeOverflow: (el) => `El valor máximo es ${el.max}.`,
};

function message(el) {
  const v = el.validity;
  for (const k of Object.keys(MESSAGES)) if (v[k]) return MESSAGES[k](el);
  return el.validationMessage || "Revisa este campo.";
}

function paintRange(r) {
  const min = +r.min || 0, max = +r.max || 100;
  r.style.setProperty("--_fill", `${((r.value - min) / (max - min)) * 100}%`);
  $$(`[data-al-output-for="#${r.id}"]`).forEach((o) => { o.textContent = r.value; });
}

function showError(el, text) {
  const field = el.closest(".al-field") || el.parentElement;
  let err = $(".al-error", field);
  if (text) {
    el.setAttribute("aria-invalid", "true");
    if (!err) { err = h("p", { class: "al-error", id: `${el.id || el.name}-err`, role: "alert" }); field.append(err); }
    err.textContent = text;
    el.setAttribute("aria-describedby", err.id);
  } else {
    el.removeAttribute("aria-invalid");
    el.removeAttribute("aria-describedby");
    err?.remove();
  }
}

let delegated = false;

/** Listeners globales (delegados): se registran una sola vez, aunque llames a init() muchas veces */
function bindDelegates() {
  if (delegated) return;
  delegated = true;
  on("input", ".al-range", (_, el) => paintRange(el));

  on("click", "[data-al-toggle-password]", (_, btn) => {
    const input = $(btn.dataset.alTogglePassword);
    if (!input) return;
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.setAttribute("aria-label", show ? "Ocultar contraseña" : "Mostrar contraseña");
    const ic = $("al-icon", btn);
    if (ic) ic.setAttribute("name", show ? "eye-off" : "eye");
  });

  // Chips alternables y quitables
  on("click", ".al-chip[aria-pressed]", (_, el) => el.setAttribute("aria-pressed", String(el.getAttribute("aria-pressed") !== "true")));
  on("click", ".al-chip__remove", (_, el) => el.closest(".al-chip")?.remove());
  // Grupos de botones con selección única
  on("click", ".al-btn-group > .al-btn[aria-pressed]", (_, el) => {
    el.parentElement.querySelectorAll(":scope > .al-btn[aria-pressed]").forEach((b) => b.setAttribute("aria-pressed", String(b === el)));
  });
  on("click", "[data-al-alert-close]", (_, el) => el.closest(".al-alert")?.remove());

}

export function initForms(root = document) {
  bindDelegates();
  $$(".al-range", root).forEach(paintRange);
  $$("input[data-indeterminate]", root).forEach((i) => { i.indeterminate = true; });
  $$("[data-al-counter]", root).forEach((box) => {
    const target = $(box.dataset.alCounter);
    if (!target) return;
    const upd = () => { box.textContent = `${target.value.length}${target.maxLength > 0 ? ` / ${target.maxLength}` : ""}`; };
    if (box._julietaCounter) return;
    box._julietaCounter = true;
    target.addEventListener("input", upd);
    upd();
  });

  // Dropzone
  $$(".al-dropzone", root).forEach((dz) => {
    if (dz._julietaDZ) return;
    dz._julietaDZ = true;
    const input = $("input[type=file]", dz);
    const list = $(".al-dropzone__files", dz);
    if (!input) return;
    const render = () => {
      if (!list) return;
      list.replaceChildren(...Array.from(input.files).map((f) => h("li", { class: "al-badge" }, `${f.name} · ${(f.size / 1024).toFixed(f.size > 1048576 ? 0 : 1)} KB`)));
      emit(dz, "files", { files: Array.from(input.files) });
    };
    input.addEventListener("change", render);
    dz.addEventListener("dragover", (e) => { e.preventDefault(); dz.classList.add("is-dragover"); });
    dz.addEventListener("dragleave", () => dz.classList.remove("is-dragover"));
    dz.addEventListener("drop", (e) => {
      e.preventDefault(); dz.classList.remove("is-dragover");
      if (e.dataTransfer?.files?.length) { input.files = e.dataTransfer.files; render(); }
    });
    dz.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
  });

  // Validación
  $$("form[data-al-validate]", root).forEach((form) => {
    if (form._julietaValidate) return;
    form._julietaValidate = true;
    form.noValidate = true;
    form.addEventListener("submit", (e) => {
      let first = null;
      $$("input, select, textarea", form).forEach((el) => {
        if (el.willValidate && !el.checkValidity()) { showError(el, message(el)); first ||= el; }
        else showError(el, "");
      });
      if (first) { e.preventDefault(); first.focus(); emit(form, "invalid"); }
      else {
        // Sin action ni method="dialog": la página lo gestiona con el evento al:valid (no se recarga)
        if (!form.getAttribute("action") && form.getAttribute("method") !== "dialog") e.preventDefault();
        emit(form, "valid", { data: Object.fromEntries(new FormData(form)) });
      }
    });
    form.addEventListener("input", (e) => { if (e.target.getAttribute?.("aria-invalid") && e.target.checkValidity()) showError(e.target, ""); });
  });
}
