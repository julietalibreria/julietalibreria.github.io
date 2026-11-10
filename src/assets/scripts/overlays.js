/* ==========================================================================
   Julieta UI · overlays.js
   Modal y drawer sobre <dialog> nativo (foco atrapado y Esc gratis).
   HTML:   <button data-al-open="#mi-modal">Abrir</button>
           <dialog class="al-modal" id="mi-modal"> … <button data-al-close>…</button></dialog>
   App:    <button data-al-app-menu> alterna la barra lateral de .al-app en móvil
   JS:     Julieta.modal.open("#mi-modal")   Julieta.confirm({ title, text })
   ========================================================================== */
import { $, h, on, emit, uid } from "./core.js";

const resolve = (t) => (typeof t === "string" ? $(t) : t);

export function openDialog(target, opener) {
  const d = resolve(target);
  if (!d || d.open) return d;
  d._opener = opener || document.activeElement;
  d.showModal();
  emit(d, "open");
  return d;
}

export function closeDialog(target, returnValue = "") {
  const d = resolve(target);
  if (d?.open) d.close(returnValue);
  return d;
}

export const modal = { open: openDialog, close: closeDialog };

/** Confirmación con promesa → true / false */
export function confirmDialog({ title = "¿Seguro?", text = "", confirmText = "Confirmar", cancelText = "Cancelar", danger = false } = {}) {
  return new Promise((resolveP) => {
    const id = uid("confirm");
    const d = h("dialog", { class: "al-modal", "aria-labelledby": `${id}-t`, id },
      h("div", { class: "al-modal__header" }, h("h2", { class: "al-modal__title", id: `${id}-t` }, title)),
      h("div", { class: "al-modal__body" }, h("p", {}, text)),
      h("div", { class: "al-modal__footer" },
        h("button", { class: "al-btn al-btn--ghost", type: "button", "data-al-close": "cancel" }, cancelText),
        h("button", { class: `al-btn ${danger ? "al-btn--danger" : "al-btn--primary"}`, type: "button", "data-al-close": "ok", autofocus: true }, confirmText),
      ),
    );
    document.body.append(d);
    d.addEventListener("close", () => { resolveP(d.returnValue === "ok"); setTimeout(() => d.remove(), 400); });
    openDialog(d);
  });
}

export function initOverlays() {
  on("click", "[data-al-open]", (e, el) => { e.preventDefault(); openDialog(el.dataset.alOpen, el); });
  on("click", "[data-al-close]", (_, el) => { const d = el.closest("dialog"); if (d) d.close(el.dataset.alClose || ""); });

  // Menú lateral de .al-app en pantallas pequeñas
  const app = () => document.querySelector(".al-app");
  on("click", "[data-al-app-menu]", () => app()?.classList.toggle("is-menu-open"));
  document.addEventListener("click", (e) => {
    const a = app();
    if (a?.classList.contains("is-menu-open") && !e.target.closest(".al-app__sidebar, [data-al-app-menu]")) a.classList.remove("is-menu-open");
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") app()?.classList.remove("is-menu-open"); });

  // Clic fuera del contenido (sobre el backdrop) cierra
  document.addEventListener("pointerdown", (e) => {
    const d = e.target;
    if (d instanceof HTMLDialogElement && d.matches(".al-modal, .al-drawer, .al-command")) d._downOnBackdrop = true;
  });
  document.addEventListener("click", (e) => {
    const d = e.target;
    if (d instanceof HTMLDialogElement && d._downOnBackdrop && d.matches(".al-modal, .al-drawer, .al-command") && !d.hasAttribute("data-al-static")) d.close("dismiss");
    document.querySelectorAll("dialog").forEach((x) => { x._downOnBackdrop = false; });
  });

  // Devolver el foco a quien abrió el diálogo
  document.addEventListener("close", (e) => {
    const d = e.target;
    if (d instanceof HTMLDialogElement && d.matches(".al-modal, .al-drawer, .al-command")) { d._opener?.focus?.({ preventScroll: true }); emit(d, "close", { value: d.returnValue }); }
  }, true);
}
