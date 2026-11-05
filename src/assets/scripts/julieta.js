/* ==========================================================================
   Julieta UI · julieta.js  (punto de entrada)

   <link rel="stylesheet" href="https://CDN/…/src/assets/styles/julieta.css">
   <script type="module" src="https://CDN/…/src/assets/scripts/julieta.js"></script>

   Inicializa todo automáticamente y expone window.Julieta.
   ¿Quieres solo una parte? Importa los módulos sueltos:
     import { toast } from "https://CDN/…/src/assets/scripts/toast.js";
   ========================================================================== */
import * as core from "./core.js";
import { initTheme, setTheme, getMode, getResolved } from "./theme.js";
import { defineIcon, loadIcons, iconSVG, getIcon } from "./icons.js";
import { toast } from "./toast.js";
import { initOverlays, modal, confirmDialog } from "./overlays.js";
import { initTabs } from "./tabs.js";
import { initDropdowns } from "./dropdown.js";
import { initForms } from "./forms.js";
import { initTables, sortTable } from "./table.js";
import { initCode, highlight, codeBlock } from "./code.js";
import { initCommand, openCommand, closeCommand } from "./command.js";
import { initCharts, chart } from "./charts.js";
import { initPetals, petals } from "./petals.js";
import { buildCatalog, search } from "./catalog.js";

export const Julieta = {
  version: core.VERSION,
  root: core.ROOT,
  assets: core.ASSETS,
  toast,
  confirm: confirmDialog,
  modal,
  theme: { set: setTheme, mode: getMode, resolved: getResolved },
  icons: { load: loadIcons, svg: iconSVG, get: getIcon },
  code: { highlight, block: codeBlock },
  command: { open: openCommand, close: closeCommand },
  table: { sort: sortTable },
  chart,
  petals,
  catalog: { build: buildCatalog, search },
  copy: core.copyText,
  loadJSON: core.loadJSON,
  init(root = document) {
    initTabs(root); initDropdowns(); initForms(); initTables(root); initCode(root); initCharts(root); initPetals(root);
  },
};

function boot() {
  defineIcon();
  initTheme();
  initOverlays();
  initCommand();
  Julieta.init();
  document.documentElement.dataset.julietaReady = "";
  document.dispatchEvent(new CustomEvent("al:ready", { detail: Julieta }));
}

window.Julieta = Julieta;
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
else boot();

export default Julieta;
