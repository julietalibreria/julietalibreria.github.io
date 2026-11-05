/* ==========================================================================
   Julieta UI · table.js
   Tablas ordenables y filtrables.
     <table class="al-table" data-al-sortable data-al-filter="#buscar">
       <th aria-sort="none"><button type="button">Nombre</button></th>
       <td data-sort="1299">$1,299</td>   ← valor opcional para ordenar
   Eventos:  al:sort (detail: { column, direction })   al:filter (detail: { visible })
   ========================================================================== */
import { $, $$, emit, norm } from "./core.js";

const collator = new Intl.Collator("es", { numeric: true, sensitivity: "base" });

function cellValue(td) {
  const raw = td.dataset.sort ?? td.textContent.trim();
  const n = parseFloat(String(raw).replace(/[^0-9.\-]/g, ""));
  return /[0-9]/.test(raw) && !Number.isNaN(n) && /^[\s$€£%+\-.,0-9kKmM]*$/.test(String(raw)) ? n : raw;
}

export function sortTable(table, index, direction = "ascending") {
  const body = table.tBodies[0];
  const rows = Array.from(body.rows);
  const dir = direction === "ascending" ? 1 : -1;
  rows.sort((a, b) => {
    const x = cellValue(a.cells[index]), y = cellValue(b.cells[index]);
    return (typeof x === "number" && typeof y === "number" ? x - y : collator.compare(String(x), String(y))) * dir;
  });
  rows.forEach((r) => body.append(r));
  $$("thead th", table).forEach((th, i) => {
    if (th.querySelector("button")) th.setAttribute("aria-sort", i === index ? direction : "none");
  });
  emit(table, "sort", { column: index, direction });
}

function applyFilter(table, query) {
  const q = norm(query).trim();
  let visible = 0;
  Array.from(table.tBodies[0].rows).forEach((r) => {
    const show = !q || norm(r.textContent).includes(q);
    r.hidden = !show;
    if (show) visible++;
  });
  let empty = table.parentElement.querySelector(".al-table__empty");
  if (!visible) {
    if (!empty) {
      empty = document.createElement("div");
      empty.className = "al-table__empty al-empty";
      empty.innerHTML = `<div class="al-empty__title">Sin resultados</div><p class="al-empty__text">Ninguna fila coincide con la búsqueda. Prueba con otra palabra.</p>`;
      table.after(empty);
    }
  } else empty?.remove();
  emit(table, "filter", { visible });
}

export function initTables(root = document) {
  $$("table[data-al-sortable]", root).forEach((table) => {
    if (table._julietaTable) return;
    table._julietaTable = true;
    $$("thead th", table).forEach((th, i) => {
      const btn = th.querySelector("button");
      if (!btn) return;
      btn.type = "button";
      if (!th.hasAttribute("aria-sort")) th.setAttribute("aria-sort", "none");
      btn.addEventListener("click", () => sortTable(table, i, th.getAttribute("aria-sort") === "ascending" ? "descending" : "ascending"));
    });
    const sel = table.dataset.alFilter;
    const input = sel && $(sel);
    if (input) input.addEventListener("input", () => applyFilter(table, input.value));
  });
}
