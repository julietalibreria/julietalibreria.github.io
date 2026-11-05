/* ==========================================================================
   Julieta UI · tabs.js
   Pestañas accesibles (WAI-ARIA) con navegación por teclado.
   HTML:  <div data-al-tabs>
            <div class="al-tabs" role="tablist">
              <button class="al-tab" data-target="uno">Uno</button> …
            </div>
            <div class="al-tabpanel" id="uno">…</div> …
          </div>
   ========================================================================== */
import { $$, uid, emit } from "./core.js";

export function initTabs(root = document) {
  $$("[data-al-tabs]", root).forEach((wrap) => {
    if (wrap._julietaTabs) return;
    wrap._julietaTabs = true;
    const list = wrap.querySelector('[role="tablist"], .al-tabs');
    if (!list) return;
    list.setAttribute("role", "tablist");
    const tabs = $$(".al-tab", list);
    const panelFor = (t) => wrap.querySelector(`#${CSS.escape(t.dataset.target)}`);

    tabs.forEach((t) => {
      t.setAttribute("role", "tab");
      t.type = "button";
      t.id ||= uid("tab");
      const p = panelFor(t);
      if (p) { p.setAttribute("role", "tabpanel"); p.setAttribute("aria-labelledby", t.id); t.setAttribute("aria-controls", p.id); p.tabIndex = 0; }
    });

    function select(tab, focus = false) {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        const p = panelFor(t);
        if (p) p.hidden = !on;
      });
      if (focus) tab.focus();
      emit(wrap, "tab", { id: tab.dataset.target });
    }

    list.addEventListener("click", (e) => { const t = e.target.closest(".al-tab"); if (t) select(t); });
    list.addEventListener("keydown", (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      select(tabs[(keys[e.key] + tabs.length) % tabs.length], true);
    });

    select(tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0]);
  });
}
