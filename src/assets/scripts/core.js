/* ==========================================================================
   Julieta UI · core.js
   Utilidades compartidas. Todas las rutas se resuelven a partir de la URL de
   este mismo archivo (import.meta.url), así la librería funciona igual desde
   jsDelivr, unpkg, GitHub Pages, un subdirectorio o un servidor local.
   ========================================================================== */

export const VERSION = "1.0.0";

/** URL pública del sitio; también es la URL base del CDN por defecto */
export const SITE_URL = "https://julietalibreria.github.io";

/** Carpeta src/assets/ (termina en "/") */
export const ASSETS = new URL("../", import.meta.url).href;
/** Raíz del paquete (donde viven index.html y src/) */
export const ROOT = new URL("../../../", import.meta.url).href;

/** Resuelve una ruta relativa a src/assets/ → URL absoluta */
export const asset = (path) => new URL(path, ASSETS).href;
/** Resuelve una ruta relativa a la raíz del paquete → URL absoluta */
export const fromRoot = (path) => new URL(path, ROOT).href;

/* ---------- JSON con caché ---------- */
const jsonCache = new Map();
export function loadJSON(name) {
  if (!jsonCache.has(name)) {
    const p = fetch(asset(`json/${name}.json`)).then((r) => {
      if (!r.ok) throw new Error(`Julieta: no se pudo cargar json/${name}.json (${r.status})`);
      return r.json();
    });
    p.catch(() => jsonCache.delete(name));
    jsonCache.set(name, p);
  }
  return jsonCache.get(name);
}

/* ---------- DOM ---------- */
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** Delegación de eventos: on("click", "[data-x]", (e, el) => …) */
export function on(type, selector, handler, root = document) {
  root.addEventListener(type, (e) => {
    const el = e.target instanceof Element ? e.target.closest(selector) : null;
    if (el && root.contains(el)) handler(e, el);
  });
}

/** Crea un elemento: h("div", {class:"x", onclick(){}}, "texto", otroNodo) */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else if (k === "html") el.innerHTML = v;
    else if (k === "class") el.className = v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(c));
  return el;
}

export const escapeHTML = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const debounce = (fn, ms = 120) => {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
};

let uidN = 0;
export const uid = (prefix = "al") => `${prefix}-${++uidN}-${Math.random().toString(36).slice(2, 6)}`;

export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Normaliza texto para búsquedas (sin acentos, minúsculas) */
export const norm = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/* ---------- Portapapeles ---------- */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = h("textarea", { style: "position:fixed;opacity:0;inset:0 auto auto 0", "aria-hidden": "true" });
    ta.value = text;
    document.body.append(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { /* sin soporte */ }
    ta.remove();
    return ok;
  }
}

/** Dispara un evento personalizado con prefijo al: */
export const emit = (el, name, detail = {}) =>
  el.dispatchEvent(new CustomEvent(`al:${name}`, { detail, bubbles: true }));

/** Almacenamiento seguro (puede fallar en ventanas privadas) */
export const store = {
  get(k, fallback = null) { try { const v = localStorage.getItem(k); return v ?? fallback; } catch { return fallback; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignorar */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* ignorar */ } },
};
