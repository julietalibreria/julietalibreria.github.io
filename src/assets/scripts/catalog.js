/* ==========================================================================
   Julieta UI · catalog.js
   Catálogo unificado de TODOS los recursos de la librería. Se construye en
   tiempo de ejecución a partir de los JSON, así que una pieza nueva en
   icons.json, components.json, etc. aparece sola en el buscador, la paleta de
   comandos y el navegador de recursos. Una sola fuente de verdad.
   ========================================================================== */
import { loadJSON, fromRoot, norm } from "./core.js";

export const TYPES = {
  pagina:     { label: "Páginas",     one: "Página",     icon: "file-text" },
  componente: { label: "Componentes", one: "Componente", icon: "box" },
  icono:      { label: "Iconos",      one: "Icono",      icon: "sparkles" },
  color:      { label: "Colores",     one: "Color",      icon: "palette" },
  tipografia: { label: "Tipografía",  one: "Tipografía", icon: "type" },
  plantilla:  { label: "Plantillas",  one: "Plantilla",  icon: "layout" },
  token:      { label: "Tokens",      one: "Token",      icon: "sliders" },
  imagen:     { label: "Imágenes",    one: "Imagen",     icon: "image" },
};

let catalogPromise;

export function buildCatalog() {
  catalogPromise ??= (async () => {
    const [nav, comps, icons, colors, type, tpls, tokens] = await Promise.all(
      ["navigation", "components", "icons", "colors", "typography", "templates", "tokens"].map(loadJSON),
    );
    const items = [];
    const add = (o) => items.push({ ...o, _t: norm(o.title), _k: norm([o.keywords, TYPES[o.type].one].join(" ")), _s: norm(o.sub) });

    for (const g of nav.groups) for (const p of g.items)
      add({ type: "pagina", id: p.href, title: p.title, sub: p.description || g.title, href: fromRoot(p.href), icon: p.icon || "file-text", keywords: p.keywords });

    for (const c of comps.components)
      add({ type: "componente", id: c.id, title: c.name, sub: c.description, href: fromRoot(`src/pages/componentes.html#${c.id}`), icon: c.icon || "box", keywords: `${c.category} ${(c.classes || []).map((k) => k.name).join(" ")} ${c.keywords || ""}` });

    for (const i of icons.icons)
      add({ type: "icono", id: i.name, title: i.name, sub: icons.categories.find((c) => c.id === i.category)?.name, href: fromRoot(`src/pages/iconos.html#${i.name}`), icon: i.name, keywords: i.tags.join(" "), copy: `<al-icon name="${i.name}"></al-icon>` });

    for (const f of colors.families) {
      for (const s of colors.shades)
        add({ type: "color", id: `${f.id}-${s}`, title: `${f.name} ${s}`, sub: `--al-${f.id}-${s}`, href: fromRoot(`src/pages/colores.html#${f.id}`), swatch: `var(--al-${f.id}-${s})`, keywords: `${f.role} ${f.id} ${f.keywords || ""}`, copy: `var(--al-${f.id}-${s})` });
    }

    for (const f of type.fonts)
      add({ type: "tipografia", id: f.id, title: f.name, sub: f.role, href: fromRoot(`src/pages/tipografia.html#${f.id}`), icon: "type", keywords: `${f.category} fuente font ${f.cssVar}`, copy: `font-family: var(${f.cssVar});` });
    for (const s of type.scale)
      add({ type: "tipografia", id: s.token, title: `Tamaño ${s.name}`, sub: s.usage, href: fromRoot("src/pages/tipografia.html#escala"), icon: "type", keywords: `escala size ${s.token}`, copy: `font-size: var(${s.token});` });

    for (const t of tpls.templates)
      add({ type: "plantilla", id: t.id, title: t.name, sub: t.description, href: fromRoot(t.href), icon: "layout", keywords: (t.tags || []).join(" "), preview: t.preview && fromRoot(t.preview) });

    for (const g of tokens.groups) for (const t of g.tokens)
      add({ type: "token", id: t.name, title: t.name, sub: `${g.title}${t.note ? " · " + t.note : ""}`, href: fromRoot(`src/pages/fundamentos.html#${g.id}`), icon: g.icon || "sliders", keywords: g.title, copy: `var(${t.name})` });

    for (const im of (await loadJSON("manifest")).images || [])
      add({ type: "imagen", id: im.path, title: im.title, sub: im.description, href: fromRoot(im.path), icon: "image", keywords: im.tags?.join(" "), preview: fromRoot(im.path), copy: fromRoot(im.path) });

    return { items, nav, comps, icons, colors, type, tpls, tokens };
  })();
  return catalogPromise;
}

/** Búsqueda por todas las palabras (sin acentos). El título pesa más que las palabras clave, y estas más que la descripción. */
export function search(items, query, { type, limit = 60 } = {}) {
  const words = norm(query).split(/\s+/).filter(Boolean);
  const pool = type ? items.filter((i) => i.type === type) : items;
  if (!words.length) return pool.slice(0, limit);
  const scored = [];
  for (const it of pool) {
    let score = 0, ok = true;
    for (const w of words) {
      if (it._t === w) score += 100;
      else if (it._t.startsWith(w)) score += 40;
      else if (it._t.includes(w)) score += 20;
      else if (it._k.includes(w)) score += 10;
      else if (it._s.includes(w)) score += 4;
      else { ok = false; break; }
    }
    if (ok) scored.push([score, it]);
  }
  return scored.sort((a, b) => b[0] - a[0]).slice(0, limit).map((x) => x[1]);
}
