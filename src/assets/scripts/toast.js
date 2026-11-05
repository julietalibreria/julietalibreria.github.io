/* ==========================================================================
   Julieta UI · toast.js
   Notificaciones temporales.   Julieta.toast({ title, text, type, duration })
   type: success | info | warning | danger | primary
   ========================================================================== */
import { h, uid } from "./core.js";

const ICONS = { success: "check-circle", info: "info", warning: "alert-triangle", danger: "alert-circle", primary: "sparkles" };
let region;

function getRegion(pos) {
  if (!region || !region.isConnected) {
    region = h("div", { class: "al-toast-region", role: "region", "aria-label": "Notificaciones", "aria-live": "polite" });
    document.body.append(region);
  }
  region.dataset.pos = pos;
  return region;
}

export function toast(opts = {}) {
  if (typeof opts === "string") opts = { title: opts };
  const { title = "", text = "", type = "primary", duration = 4500, position = "bottom", action } = opts;
  const dur = Math.max(0, duration);
  const el = h("div", { class: `al-toast al-toast--${type}`, role: type === "danger" ? "alert" : "status", id: uid("toast") },
    h("span", { class: "al-toast__icon" }, h("al-icon", { name: ICONS[type] || "info" })),
    h("div", {},
      title && h("div", { class: "al-toast__title" }, title),
      text && h("div", { class: "al-toast__text" }, text),
      action && h("button", { class: "al-btn al-btn--link al-btn--sm", type: "button", style: "margin-top:.4rem", onclick() { action.onClick?.(); close(); } }, action.label),
    ),
    h("button", { class: "al-toast__close", type: "button", "aria-label": "Cerrar notificación", onclick: () => close() }, h("al-icon", { name: "x", size: 16 })),
    dur ? h("span", { class: "al-toast__timer", style: `--_dur:${dur}ms` }) : null,
  );

  let timer;
  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    clearTimeout(timer);
    el.classList.add("is-leaving");
    el.addEventListener("animationend", () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 400);
  }

  getRegion(position).append(el);
  if (dur) {
    let left = dur, started = Date.now();
    const run = () => { started = Date.now(); timer = setTimeout(close, left); };
    el.addEventListener("mouseenter", () => { clearTimeout(timer); left -= Date.now() - started; });
    el.addEventListener("mouseleave", run);
    run();
  }
  return { close, el };
}

toast.success = (title, text) => toast({ title, text, type: "success" });
toast.error = (title, text) => toast({ title, text, type: "danger" });
toast.warning = (title, text) => toast({ title, text, type: "warning" });
toast.info = (title, text) => toast({ title, text, type: "info" });
