/* ==========================================================================
   Julieta UI · dropdown.js
   Menús desplegables con teclado completo (↑ ↓ Home End Esc Tab).
   HTML:  <div class="al-dropdown" data-al-dropdown>
            <button data-al-dropdown-trigger>Opciones</button>
            <div class="al-menu" role="menu" hidden>
              <button class="al-menu__item" role="menuitem">Editar</button> …
   ========================================================================== */
import { $, $$, uid, emit } from "./core.js";

const items = (menu) => $$('.al-menu__item:not([aria-disabled="true"])', menu);

function close(dd, focusTrigger = false) {
  const menu = $(".al-menu", dd);
  const trigger = $("[data-al-dropdown-trigger]", dd);
  if (!menu || menu.hidden) return;
  menu.hidden = true;
  trigger.setAttribute("aria-expanded", "false");
  if (focusTrigger) trigger.focus();
}

function open(dd, focusFirst = false, last = false) {
  $$("[data-al-dropdown]").forEach((o) => o !== dd && close(o));
  const menu = $(".al-menu", dd);
  const trigger = $("[data-al-dropdown-trigger]", dd);
  menu.hidden = false;
  trigger.setAttribute("aria-expanded", "true");
  // Si no cabe hacia abajo, se abre hacia arriba
  menu.classList.remove("al-menu--up");
  const r = menu.getBoundingClientRect();
  if (r.bottom > innerHeight - 8 && trigger.getBoundingClientRect().top > r.height + 16) menu.classList.add("al-menu--up");
  const list = items(menu);
  if (focusFirst && list.length) (last ? list.at(-1) : list[0]).focus();
}

let bound = false;

export function initDropdowns() {
  $$("[data-al-dropdown]").forEach((dd) => {
    const trigger = $("[data-al-dropdown-trigger]", dd);
    const menu = $(".al-menu", dd);
    if (!trigger || !menu || dd._julietaDD) return;
    dd._julietaDD = true;
    menu.id ||= uid("menu");
    menu.hidden = true;
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", menu.id);
    $$(".al-menu__item", menu).forEach((i) => { i.setAttribute("role", i.getAttribute("role") || "menuitem"); i.tabIndex = -1; });
  });

  if (bound) return;
  bound = true;

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest?.("[data-al-dropdown-trigger]");
    const dd = trigger?.closest("[data-al-dropdown]");
    if (dd) { $(".al-menu", dd).hidden ? open(dd) : close(dd); return; }
    const item = e.target.closest?.("[data-al-dropdown] .al-menu__item");
    if (item) {
      const host = item.closest("[data-al-dropdown]");
      emit(host, "select", { value: item.dataset.value ?? item.textContent.trim(), item });
      close(host, true);
      return;
    }
    $$("[data-al-dropdown]").forEach((o) => close(o));
  });

  document.addEventListener("keydown", (e) => {
    const dd = document.activeElement?.closest?.("[data-al-dropdown]");
    if (!dd) return;
    const menu = $(".al-menu", dd);
    const trigger = $("[data-al-dropdown-trigger]", dd);
    if (e.key === "Escape") { close(dd, true); return; }
    if (document.activeElement === trigger && ["ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault(); open(dd, true, e.key === "ArrowUp"); return;
    }
    if (menu.hidden) return;
    const list = items(menu);
    const i = list.indexOf(document.activeElement);
    const go = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: list.length - 1 }[e.key];
    if (go != null) { e.preventDefault(); list[(go + list.length) % list.length]?.focus(); }
    if (e.key === "Tab") close(dd);
  });
}
