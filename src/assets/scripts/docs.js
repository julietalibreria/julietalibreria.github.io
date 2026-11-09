/* ==========================================================================
   Julieta UI · docs.js
   Motor de la documentación. NO es parte del núcleo de la librería: solo la
   usan las páginas de /src/pages y el index.html.

   Hace tres cosas:
     1. Construye cabecera, barra lateral, índice y pie desde navigation.json
        (la navegación se define una vez, en un solo archivo).
     2. Convierte cada <div class="d-demo" data-al-demo> en demo + código,
        copiando el HTML real: lo que ves es exactamente lo que copias.
     3. Sustituye {{CDN}} en los fragmentos por la URL elegida en /instalacion.

   Importante: captura el HTML ANTES de cargar julieta.js, para que el código
   mostrado no incluya los atributos que la propia librería añade.
   ========================================================================== */
import { loadJSON, fromRoot, ROOT, SITE_URL, h, $, $$, store, escapeHTML } from "./core.js";

const body = document.body;
const PAGE = body.dataset.page || "";           // p. ej. "src/pages/componentes.html"
const LAYOUT = body.dataset.layout || "docs";   // docs | home | bare

/* ---------- CDN configurable ---------- */
export const CDN_KEY = "julieta-cdn";
export function getCDN() {
  return store.get(CDN_KEY) || SITE_URL;
}
export function setCDN(v) { store.set(CDN_KEY, v.replace(/\/$/, "")); renderCDN(); }
export const CDN_PRESETS = [
  { id: "github-pages", label: "GitHub Pages", url: SITE_URL },
  { id: "jsdelivr-gh", label: "jsDelivr · GitHub", url: "https://cdn.jsdelivr.net/gh/julietalibreria/julietalibreria.github.io@1.0.0" },
  { id: "local", label: "Este servidor", url: ROOT.replace(/\/$/, "") },
];

/* ---------- 1. Capturar demos antes de que Julieta las toque ---------- */
function dedent(text) {
  const lines = text.replace(/\t/g, "  ").replace(/^\s*\n/, "").replace(/\s+$/, "").split("\n");
  const min = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  return lines.map((l) => l.slice(isFinite(min) ? min : 0)).join("\n");
}

const demos = $$("[data-al-demo]").map((el) => ({ el, source: dedent(el.innerHTML), lang: el.dataset.lang || "html" }));

/* Los fragmentos <pre> escritos a mano con {{CDN}} se guardan como plantilla */
$$(".al-code").forEach((box) => {
  const code = $("code", box);
  if (code && /\{\{CDN\}\}/.test(code.textContent)) box.dataset.tpl = code.textContent;
});

/* ---------- 2. Cargar la librería ---------- */
const julieta = (await import("./julieta.js")).Julieta;
const { highlight, block } = julieta.code;

function renderCDN() {
  const cdn = getCDN();
  $$(".al-code[data-tpl]").forEach((box) => {
    const text = box.dataset.tpl.replace(/\{\{CDN\}\}/g, cdn);
    const code = $("code", box);
    box._raw = text;
    code.innerHTML = highlight(text, box.dataset.lang || "html");
  });
  $$("[data-cdn-text]").forEach((n) => { n.textContent = cdn; });
  document.dispatchEvent(new CustomEvent("docs:cdn", { detail: cdn }));
}

/* ---------- Estructura: cabecera, sidebar, índice, pie ---------- */
const nav = await loadJSON("navigation");
const link = (it) => fromRoot(it.href);
const isCurrent = (href) => href === PAGE || (PAGE === "" && href === "index.html");

function iconEl(name, size) { return h("al-icon", { name, size }); }

function buildHeader() {
  const top = [
    ["Instalación", "src/pages/instalacion.html"],
    ["Recursos", "src/pages/recursos.html"],
    ["Fundamentos", "src/pages/fundamentos.html"],
    ["Componentes", "src/pages/componentes.html"],
    ["Plantillas", "src/pages/plantillas.html"],
  ];
  const links = h("nav", { class: "al-navbar__links d-topnav", "aria-label": "Principal" },
    top.map(([t, href]) => h("a", { class: "al-nav-link", href: fromRoot(href), ...(isCurrent(href) || (PAGE.startsWith("src/pages/plantillas/") && href.endsWith("plantillas.html")) ? { "aria-current": "page" } : {}) }, t)));
  const header = h("header", { class: "al-navbar d-header" },
    h("button", { class: "al-btn al-btn--ghost al-btn--icon al-btn--sm d-menu-btn", type: "button", "aria-label": "Abrir navegación", onclick: openMenu }, iconEl("menu", 20)),
    h("a", { class: "al-navbar__brand", href: fromRoot("index.html"), "aria-label": "Julieta UI, inicio" },
      h("img", { src: fromRoot("src/assets/images/mark.svg"), alt: "", width: 28, height: 28 }), "julieta"),
    links,
    h("span", { class: "al-navbar__spacer" }),
    h("button", { class: "d-search", type: "button", "data-al-command-open": "", "aria-label": "Buscar en la documentación" },
      iconEl("search", 18), h("span", { class: "d-search__text" }, "Buscar…"), h("span", { class: "d-search__keys" }, h("kbd", { class: "al-kbd" }, navigator.platform.includes("Mac") ? "⌘" : "Ctrl"), h("kbd", { class: "al-kbd" }, "K"))),
    h("button", { class: "al-btn al-btn--ghost al-btn--icon al-btn--sm", type: "button", "data-al-theme-toggle": "", "data-al-tip": "Cambiar tema", "data-al-tip-pos": "bottom" }, iconEl("moon", 20)),
  );
  return header;
}

function sidebarContent() {
  return h("nav", { class: "al-sidebar", "aria-label": "Documentación" },
    nav.groups.map((g) => h("div", { class: "al-sidebar__group" },
      h("div", { class: "al-sidebar__title" }, g.title),
      g.items.map((it) => h("a", { class: "al-sidebar__link", href: link(it), ...(isCurrent(it.href) ? { "aria-current": "page" } : {}) }, iconEl(it.icon, 18), it.title)),
    )));
}

let menuDialog;
function openMenu() {
  if (!menuDialog) {
    menuDialog = h("dialog", { class: "al-drawer al-drawer--left", "aria-label": "Navegación" },
      h("div", { class: "al-drawer__header" }, h("span", { class: "al-drawer__title" }, "Julieta UI"),
        h("button", { class: "al-btn al-btn--ghost al-btn--icon al-btn--sm", type: "button", "data-al-close": "", "aria-label": "Cerrar" }, iconEl("x", 20))),
      h("div", { class: "al-drawer__body" }, sidebarContent()));
    document.body.append(menuDialog);
    menuDialog.addEventListener("click", (e) => { if (e.target.closest("a")) menuDialog.close(); });
  }
  julieta.modal.open(menuDialog);
}

function buildFooter() {
  const col = (title, items) => h("div", {}, h("div", { class: "al-footer__title" }, title),
    h("ul", { class: "al-footer__links" }, items.map(([t, href]) => h("li", {}, h("a", { href: href.startsWith("http") ? href : fromRoot(href) }, t)))));
  return h("footer", { class: "al-footer d-footer" },
    h("div", { class: "al-container" },
      h("div", { class: "al-footer__grid" },
        h("div", { class: "al-stack", style: "--al-gap:.9rem" },
          h("a", { class: "al-navbar__brand", href: fromRoot("index.html") }, h("img", { src: fromRoot("src/assets/images/mark.svg"), alt: "", width: 28, height: 28 }), "julieta"),
          h("p", { class: "al-text-muted al-text-sm", style: "max-width:30ch" }, "Interfaces con alma. Una librería modular que se instala por CDN y se usa con clases."),
        ),
        col("Empezar", [["Instalación", "src/pages/instalacion.html"], ["Navegador de recursos", "src/pages/recursos.html"], ["Fundamentos", "src/pages/fundamentos.html"]]),
        col("Recursos", [["Componentes", "src/pages/componentes.html"], ["Iconos", "src/pages/iconos.html"], ["Colores", "src/pages/colores.html"], ["Tipografía", "src/pages/tipografia.html"]]),
        col("Plantillas", [["Galería", "src/pages/plantillas.html"], ["Landing", "src/pages/plantillas/landing.html"], ["Panel de control", "src/pages/plantillas/dashboard.html"], ["Acceso", "src/pages/plantillas/acceso.html"], ["Portafolio", "src/pages/plantillas/portafolio.html"]]),
      ),
      h("div", { class: "al-footer__legal" },
        h("span", {}, `Julieta UI ${julieta.version} · Licencia MIT · Hecho con cariño en la Ciudad de México`),
        h("span", {}, "Fuentes: Bricolage Grotesque, Hanken Grotesk y JetBrains Mono (OFL 1.1)"),
      ),
    ),
  );
}

let tocObserver;
/** Rellena (o vuelve a rellenar) el índice lateral con los h2/h3 actuales */
export function refreshToc() {
  const main = $(".d-shell > main");
  const aside = $(".d-aside");
  if (!main || !aside) return;
  tocObserver?.disconnect();
  const heads = $$("h2[id], h3[id]", main).filter((x) => !x.closest(".d-demo, dialog"));
  heads.forEach((x) => {
    if (!x.querySelector(".d-anchor")) x.append(h("a", { class: "d-anchor", href: `#${x.id}`, "aria-label": `Enlace a ${x.firstChild?.textContent ?? ""}` }, "#"));
  });
  if (heads.length < 2) { aside.hidden = true; return; }
  aside.hidden = false;
  const toc = h("nav", { class: "al-toc d-toc", "aria-label": "En esta página" },
    heads.map((x) => h("a", { href: `#${x.id}`, "data-level": x.tagName[1] }, x.firstChild?.textContent.trim() || x.textContent.trim())));
  aside.replaceChildren(h("div", { class: "d-aside__title" }, "En esta página"), toc);
  const links = $$("a", toc);
  const map = new Map(heads.map((x, i) => [x, links[i]]));
  tocObserver = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { links.forEach((l) => l.classList.remove("is-active")); map.get(e.target)?.classList.add("is-active"); }
  }, { rootMargin: "-90px 0px -70% 0px" });
  heads.forEach((x) => tocObserver.observe(x));
}

/* ---------- Montaje ---------- */
const skip = h("a", { class: "al-skip-link", href: "#main" }, "Saltar al contenido");
body.prepend(skip);

if (LAYOUT !== "bare") {
  body.insertBefore(buildHeader(), skip.nextSibling);
  const main = $("#main") || $("main");
  if (LAYOUT === "docs" && main) {
    const shell = h("div", { class: "d-shell" },
      h("div", { class: "d-sidebar" }, sidebarContent()),
      main.cloneNode(false),
      h("aside", { class: "d-aside", hidden: true }),
    );
    const newMain = $("main", shell);
    while (main.firstChild) newMain.append(main.firstChild);
    main.replaceWith(shell);
  }
  body.append(buildFooter());
}

/* ---------- Demos ---------- */
demos.forEach(({ el, source, lang }) => {
  if (!el.isConnected) return;
  const stage = h("div", { class: `d-demo__stage ${el.dataset.stage || ""}` });
  while (el.firstChild) stage.append(el.firstChild);
  const code = block(source, lang, lang === "html" ? "HTML" : lang.toUpperCase());
  code.classList.add("d-demo__code");
  const toggle = h("button", { class: "al-btn al-btn--ghost al-btn--sm d-demo__toggle", type: "button", "aria-expanded": "false" }, iconEl("code", 16), h("span", {}, "Ver código"));
  toggle.addEventListener("click", () => {
    const open = el.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector("span").textContent = open ? "Ocultar código" : "Ver código";
  });
  el.classList.add("d-demo");
  el.removeAttribute("data-al-demo");
  el.append(stage, h("div", { class: "d-demo__bar" }, toggle), code);
  julieta.init(stage);
});

/* ---------- Selector de CDN: <div data-cdn-picker [data-editable]> ---------- */
$$("[data-cdn-picker]").forEach((box, n) => {
  const name = `cdn-${n}`;
  const current = getCDN();
  const preset = CDN_PRESETS.find((p) => p.url === current);
  const seg = h("div", { class: "al-segmented", role: "radiogroup", "aria-label": "Origen del CDN" },
    CDN_PRESETS.map((p) => h("label", {}, h("input", { type: "radio", name, value: p.url, ...(preset?.id === p.id ? { checked: "" } : {}) }), h("span", {}, p.label))));
  box.append(seg);
  let input;
  if (box.hasAttribute("data-editable")) {
    input = h("input", { class: "al-input", type: "url", "aria-label": "URL base del CDN", value: current, spellcheck: "false", placeholder: "https://julietalibreria.github.io" });
    box.append(h("div", { class: "al-field" }, h("label", { class: "al-label", for: (input.id = `cdn-input-${n}`) }, "URL base"), input,
      h("p", { class: "al-hint" }, "Escribe la dirección donde publicaste la librería. Todos los fragmentos de esta página se actualizan.")));
    input.addEventListener("input", () => { if (/^https?:\/\//.test(input.value)) setCDN(input.value); });
  }
  seg.addEventListener("change", (e) => { setCDN(e.target.value); if (input) input.value = e.target.value; });
  document.addEventListener("docs:cdn", (e) => {
    $$("input", seg).forEach((r) => { r.checked = r.value === e.detail; });
    if (input && document.activeElement !== input) input.value = e.detail;
  });
});

renderCDN();
julieta.init(document);
refreshToc();

/* Si la URL trae #ancla, vuelve a saltar cuando todo ya existe */
if (location.hash) requestAnimationFrame(() => { try { document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView(); } catch { /* ancla inválida */ } });

export { julieta, escapeHTML };
