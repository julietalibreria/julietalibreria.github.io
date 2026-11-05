/* ==========================================================================
   Julieta UI · gallery.js  (solo documentación)
   Pinta las plantillas de templates.json con la misma composición en todas
   partes: la galería general las agrupa por categoría y cada página de
   categoría muestra solo las suyas. Añadir una plantilla = añadir una entrada
   en templates.json (y su página + vista previa); aquí no hay que tocar nada.
   ========================================================================== */
import { julieta, refreshToc, getCDN } from "./docs.js";
import { h, $, fromRoot } from "./core.js";

/** Quita lo que solo es de la documentación y apunta los recursos al CDN elegido */
async function exportSource(href) {
  const res = await fetch(fromRoot(href));
  if (!res.ok) throw new Error(res.status);
  const cdn = getCDN();
  return (await res.text())
    .replace(/<!-- docs:start -->[\s\S]*?<!-- docs:end -->\n?/g, "")
    .replace(/(?:\.\.\/)+assets\//g, `${cdn}/src/assets/`);
}

async function copyCode(e, t) {
  const b = e.currentTarget; b.classList.add("is-loading");
  try {
    const ok = await julieta.copy(await exportSource(t.href));
    julieta.toast({ type: ok ? "success" : "danger", title: ok ? "Código copiado" : "No se pudo copiar", text: ok ? "Pégalo en un .html: ya apunta a tu CDN." : "Tu navegador bloqueó el portapapeles." });
  } catch { julieta.toast({ type: "danger", title: "No se pudo leer la plantilla", text: "Revisa que el servidor entregue el archivo." }); }
  b.classList.remove("is-loading");
}

function card(t, compName, level) {
  const slug = `${t.category}-${t.id}`;
  const [brand, kind = ""] = t.name.split(" · ");
  return h("article", { class: "d-tpl", id: slug },
    h("a", { class: "d-tpl__shot", href: fromRoot(t.href), "aria-label": `Abrir la plantilla ${t.name}` },
      h("img", { src: fromRoot(t.preview), alt: `Vista previa de la plantilla ${t.name}`, loading: "lazy", width: 1280, height: 800 })),
    h("div", { class: "d-tpl__copy" },
      h("span", { class: "d-tpl__kicker" }, kind),
      h(level, { id: `t-${slug}` }, brand),
      h("p", {}, t.description),
      h("div", { class: "d-tpl__uses" }, t.uses.slice(0, 7).map((u) => h("a", { class: "al-badge", href: fromRoot(`src/pages/componentes.html#${u}`), style: "text-decoration:none" }, compName.get(u) || u))),
      h("div", { class: "al-cluster" },
        h("a", { class: "al-btn al-btn--primary", href: fromRoot(t.href) }, "Abrir plantilla", h("al-icon", { name: "arrow-up-right", size: 18 })),
        h("button", { class: "al-btn al-btn--secondary", type: "button", onclick: (e) => copyCode(e, t) }, h("al-icon", { name: "copy", size: 18 }), "Copiar código"))));
}

/** @param {HTMLElement} root  @param {{category?: string}} opts  sin categoría = todas, agrupadas */
export async function renderGallery(root, { category } = {}) {
  const { tpls, comps } = await julieta.catalog.build();
  const compName = new Map(comps.components.map((c) => [c.id, c.name]));
  const byCat = (id) => tpls.templates.filter((t) => t.category === id);

  if (category) {
    root.replaceChildren(h("div", { class: "d-tpls" }, byCat(category).map((t) => card(t, compName, "h2"))));
  } else {
    root.replaceChildren(...tpls.categories.map((c) => {
      const list = byCat(c.id);
      return h("section", { class: "d-cat", "aria-labelledby": `c-${c.id}` },
        h("header", { class: "d-cat__head" },
          h("div", {},
            h("div", { class: "d-cat__title" }, h("al-icon", { name: c.icon, size: 28 }), h("h2", { id: `c-${c.id}` }, c.name), h("span", { class: "al-badge" }, `${list.length} plantillas`)),
            h("p", {}, c.description)),
          h("a", { class: "al-btn al-btn--ghost", href: fromRoot(`src/pages/plantillas/${c.id}.html`) }, `Ver las ${list.length}`, h("al-icon", { name: "arrow-right", size: 18 }))),
        h("div", { class: "d-tpls" }, list.map((t) => card(t, compName, "h3"))));
    }));
  }
  refreshToc();
  julieta.init(document);
}

/** Barra de categorías (chips) para saltar entre tipos de plantilla */
export async function renderCategoryNav(root, current) {
  const { tpls } = await julieta.catalog.build();
  root.replaceChildren(
    h("a", { class: "d-catnav__item", href: fromRoot("src/pages/plantillas.html"), ...(!current ? { "aria-current": "page" } : {}) }, h("al-icon", { name: "layout", size: 18 }), "Todas", h("span", {}, String(tpls.templates.length))),
    ...tpls.categories.map((c) => h("a", { class: "d-catnav__item", href: fromRoot(`src/pages/plantillas/${c.id}.html`), ...(current === c.id ? { "aria-current": "page" } : {}) },
      h("al-icon", { name: c.icon, size: 18 }), c.name, h("span", {}, String(tpls.templates.filter((t) => t.category === c.id).length)))));
}
