/* ==========================================================================
   Julieta UI · icons.js
   Elemento personalizado <al-icon name="home" size="24"></al-icon>.
   Los iconos viven en json/icons.json y se cargan una sola vez.
   ========================================================================== */
import { loadJSON, escapeHTML } from "./core.js";

let data = null;
let map = new Map();
let pending = null;

export function loadIcons() {
  pending ??= loadJSON("icons").then((d) => {
    data = d;
    map = new Map(d.icons.map((i) => [i.name, i]));
    return d;
  });
  return pending;
}

/** Devuelve el <svg> completo (string) de un icono ya cargado */
export function iconSVG(name, { size = 24, stroke = data?.strokeWidth ?? 1.75 } = {}) {
  const i = map.get(name);
  if (!i) return "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${i.body}</svg>`;
}

export const getIcon = (name) => map.get(name);

class JulietaIcon extends HTMLElement {
  static observedAttributes = ["name", "size", "label"];

  connectedCallback() { this.#render(); }
  attributeChangedCallback() { if (this.isConnected) this.#render(); }

  #render() {
    const size = this.getAttribute("size");
    if (size) this.style.setProperty("--al-icon-size", /^\d+$/.test(size) ? `${size}px` : size);
    const label = this.getAttribute("label");
    if (label) { this.setAttribute("role", "img"); this.setAttribute("aria-label", label); }
    else { this.setAttribute("aria-hidden", "true"); this.removeAttribute("role"); }

    const name = this.getAttribute("name");
    if (this._drawn === name && this.firstElementChild) return;
    const draw = () => {
      this._drawn = name;
      const i = map.get(name);
      if (!i) {
        this.innerHTML = "";
        if (data && name) console.warn(`Julieta: icono "${escapeHTML(name)}" no existe`);
        return;
      }
      this.innerHTML = `<svg viewBox="0 0 24 24" focusable="false">${i.body}</svg>`;
    };
    if (data) draw();
    else loadIcons().then(() => this.isConnected && this.getAttribute("name") === name && draw()).catch(() => {});
  }
}

export function defineIcon() {
  if (!customElements.get("al-icon")) customElements.define("al-icon", JulietaIcon);
}
