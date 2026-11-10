/* ==========================================================================
   Julieta UI · theme.js
   Tema claro / oscuro / sistema. Guarda la preferencia y la aplica en <html>.
   Uso:  <button data-al-theme-toggle>   (alterna)
         <button data-al-theme-set="dark|light|system">
   ========================================================================== */
import { on, store, emit } from "./core.js";

const KEY = "julieta-theme";
const mq = matchMedia("(prefers-color-scheme: dark)");

export const getMode = () => store.get(KEY, "system");
export const getResolved = () => {
  const m = getMode();
  return m === "system" ? (mq.matches ? "dark" : "light") : m;
};

export function setTheme(mode) {
  if (!["light", "dark", "system"].includes(mode)) mode = "system";
  store.set(KEY, mode);
  const root = document.documentElement;
  if (mode === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);
  sync();
  emit(document, "theme", { mode, resolved: getResolved() });
}

function sync() {
  const resolved = getResolved();
  document.querySelectorAll("[data-al-theme-toggle]").forEach((b) => {
    const label = resolved === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro";
    if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
    if (b.getAttribute("aria-pressed") !== String(resolved === "dark")) b.setAttribute("aria-pressed", String(resolved === "dark"));
    const icon = b.querySelector("al-icon");
    const want = resolved === "dark" ? "sun" : "moon";
    if (icon && icon.getAttribute("name") !== want) icon.setAttribute("name", want);
  });
  document.querySelectorAll("[data-al-theme-set]").forEach((b) => {
    const v = String(b.dataset.alThemeSet === getMode());
    if (b.getAttribute("aria-pressed") !== v) b.setAttribute("aria-pressed", v);
  });
  const meta = document.querySelector('meta[name="theme-color"]');
  const color = resolved === "dark" ? "#110e19" : "#f6f4fb";
  if (meta && document.documentElement.classList.contains("julieta") && meta.content !== color) meta.content = color;
}

export function initTheme() {
  const mode = getMode();
  if (mode !== "system" && document.documentElement.classList.contains("julieta")) document.documentElement.setAttribute("data-theme", mode);
  on("click", "[data-al-theme-toggle]", () => setTheme(getResolved() === "dark" ? "light" : "dark"));
  on("click", "[data-al-theme-set]", (_, el) => setTheme(el.dataset.alThemeSet));
  mq.addEventListener("change", () => { if (getMode() === "system") { sync(); emit(document, "theme", { mode: "system", resolved: getResolved() }); } });
  // Los botones pueden insertarse más tarde (p. ej. cabecera de la documentación)
  // Solo observamos nodos añadidos que contengan botones de tema (evita bucles con <al-icon>)
  new MutationObserver((muts) => {
    for (const m of muts) for (const n of m.addedNodes) {
      if (n.nodeType === 1 && (n.matches?.("[data-al-theme-toggle],[data-al-theme-set]") || n.querySelector?.("[data-al-theme-toggle],[data-al-theme-set]"))) { sync(); return; }
    }
  }).observe(document.body, { childList: true, subtree: true });
  sync();
}
