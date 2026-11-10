/* ==========================================================================
   Julieta UI · command.js
   Paleta de comandos (Ctrl/⌘ + K  ó  /). Busca en todo el catálogo.
     ↑ ↓ mover   ↵ abrir   ⇧↵ copiar (iconos, colores, tokens…)   Esc cerrar
   Abrir por código:  Julieta.command.open()
   ========================================================================== */
import { h, $, on, debounce } from "./core.js";
import { buildCatalog, search, TYPES } from "./catalog.js";
import { toast } from "./toast.js";
import { copyText } from "./core.js";

let dlg, input, list, items = [], results = [], active = 0, loaded = false;

function build() {
  input = h("input", { class: "al-command__input", type: "text", placeholder: "Busca componentes, iconos, colores, plantillas…", role: "combobox", "aria-expanded": "true", "aria-controls": "al-cmd-list", "aria-autocomplete": "list", autocomplete: "off", spellcheck: "false" });
  list = h("div", { class: "al-command__list", id: "al-cmd-list", role: "listbox" });
  dlg = h("dialog", { class: "al-command", "aria-label": "Buscar en Julieta UI" },
    h("div", { class: "al-command__search" }, h("al-icon", { name: "search", size: 20 }), input, h("kbd", { class: "al-kbd" }, "Esc")),
    list,
    h("div", { class: "al-command__footer" },
      h("span", {}, h("kbd", { class: "al-kbd" }, "↑"), h("kbd", { class: "al-kbd" }, "↓"), "moverse"),
      h("span", {}, h("kbd", { class: "al-kbd" }, "↵"), "abrir"),
      h("span", {}, h("kbd", { class: "al-kbd" }, "⇧↵"), "copiar"),
    ),
  );
  document.body.append(dlg);
  input.addEventListener("input", debounce(() => render(input.value), 60));
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Enter") { e.preventDefault(); choose(results[active], e.shiftKey); }
  });
  list.addEventListener("click", (e) => { const el = e.target.closest("[data-i]"); if (el) choose(results[+el.dataset.i], e.shiftKey); });
  list.addEventListener("pointermove", (e) => { const el = e.target.closest("[data-i]"); if (el && +el.dataset.i !== active) select(+el.dataset.i, false); });
  dlg.addEventListener("close", () => { input.value = ""; });
}

function row(it, i) {
  const lead = it.swatch
    ? h("span", { style: `width:1.2rem;height:1.2rem;border-radius:50%;background:${it.swatch};box-shadow:inset 0 0 0 1px rgb(0 0 0/.15);flex:none` })
    : h("al-icon", { name: it.icon || TYPES[it.type].icon });
  return h("button", { class: "al-command__item", type: "button", role: "option", id: `al-cmd-${i}`, "data-i": i, "aria-selected": String(i === active) },
    lead,
    h("span", { class: "al-command__text" }, h("span", { class: "al-command__title" }, it.title), it.sub && h("span", { class: "al-command__sub" }, it.sub)),
    h("span", { class: "al-command__hint" }, TYPES[it.type].one),
  );
}

function render(q = "") {
  const query = q.trim();
  let pool;
  if (!query) pool = items.filter((i) => i.type === "pagina" || i.type === "plantilla");
  else pool = search(items, query, { limit: 40 });
  results = pool;
  active = 0;
  list.replaceChildren();
  if (!pool.length) {
    list.append(h("div", { class: "al-command__empty" }, `No hay resultados para “${query}”. Prueba con otra palabra, como “botón” o “flecha”.`));
    return;
  }
  let lastType = null, n = 0;
  for (const it of pool) {
    if (it.type !== lastType) { list.append(h("div", { class: "al-command__group", role: "presentation" }, TYPES[it.type].label)); lastType = it.type; }
    list.append(row(it, n++));
  }
  input.setAttribute("aria-activedescendant", "al-cmd-0");
}

function select(i, scroll = true) {
  active = i;
  list.querySelectorAll("[data-i]").forEach((el) => el.setAttribute("aria-selected", String(+el.dataset.i === i)));
  input.setAttribute("aria-activedescendant", `al-cmd-${i}`);
  if (scroll) $(`#al-cmd-${i}`, list)?.scrollIntoView({ block: "nearest" });
}
const move = (d) => results.length && select((active + d + results.length) % results.length);

async function choose(it, copy) {
  if (!it) return;
  if (copy && it.copy) {
    const ok = await copyText(it.copy);
    toast({ type: ok ? "success" : "danger", title: ok ? "Copiado" : "No se pudo copiar", text: it.copy, duration: 2500 });
    return;
  }
  dlg.close();
  location.href = it.href;
}

export async function openCommand(initial = "") {
  if (!dlg) build();
  dlg.showModal();
  input.value = initial;
  if (!loaded) {
    list.replaceChildren(h("div", { class: "al-command__empty" }, h("span", { class: "al-spinner" })));
    try { ({ items } = await buildCatalog()); loaded = true; }
    catch (err) { list.replaceChildren(h("div", { class: "al-command__empty" }, "No se pudo cargar el catálogo. Revisa tu conexión y vuelve a intentarlo.")); console.error(err); return; }
  }
  render(initial);
  input.focus();
}

export const closeCommand = () => dlg?.open && dlg.close();

export function initCommand() {
  on("click", "[data-al-command-open]", (e) => { e.preventDefault(); openCommand(); });
  document.addEventListener("keydown", (e) => {
    // Modo seguro: sin paleta de Julieta en la página, no tocamos ningún atajo de teclado del sitio
    if (!document.querySelector("[data-al-command-open], dialog.al-command")) return;
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); dlg?.open ? closeCommand() : openCommand(); }
    else if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) { e.preventDefault(); openCommand(); }
  });
}
