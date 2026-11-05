/* ==========================================================================
   Julieta UI · code.js
   Bloques de código con resaltado de sintaxis ligero y botón de copiar.
   HTML:  <div class="al-code" data-lang="html"><pre><code>…</code></pre></div>
   JS:    Julieta.code.highlight(texto, "css")  →  HTML con <span class="tok-…">
   ========================================================================== */
import { $$, h, escapeHTML, copyText, on } from "./core.js";

const RULES = {
  html: [
    [/<!--[\s\S]*?-->/y, "com"],
    [/<\/?[a-zA-Z][\w:.-]*/y, "tag"],
    [/"[^"]*"|'[^']*'/y, "str"],
    [/[\w:@.-]+(?==)/y, "attr"],
    [/\/?>/y, "pun"],
  ],
  css: [
    [/\/\*[\s\S]*?\*\//y, "com"],
    [/"[^"]*"|'[^']*'/y, "str"],
    [/@[\w-]+/y, "key"],
    [/--[\w-]+/y, "var"],
    [/#[0-9a-fA-F]{3,8}\b/y, "num"],
    [/-?\d*\.?\d+(?:%|[a-z]{1,4})?/y, "num"],
    [/[\w-]+(?=\s*:(?!:))/y, "attr"],
    [/[\w-]+(?=\()/y, "fn"],
  ],
  js: [
    [/\/\/.*|\/\*[\s\S]*?\*\//y, "com"],
    [/`(?:\\[\s\S]|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/y, "str"],
    [/\b(?:import|export|from|const|let|var|function|return|if|else|for|while|new|await|async|class|extends|default|throw|try|catch|of|in|typeof|null|true|false|undefined)\b/y, "key"],
    [/\b\d+(?:\.\d+)?\b/y, "num"],
    [/[A-Za-z_$][\w$]*(?=\()/y, "fn"],
  ],
  json: [
    [/"(?:\\.|[^"\\])*"(?=\s*:)/y, "attr"],
    [/"(?:\\.|[^"\\])*"/y, "str"],
    [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/y, "num"],
    [/\b(?:true|false|null)\b/y, "key"],
  ],
  bash: [
    [/#.*/y, "com"],
    [/"[^"]*"|'[^']*'/y, "str"],
    [/\$[\w{}]+/y, "var"],
    [/(?<=\s)--?[\w-]+/y, "attr"],
    [/\b(?:npm|npx|yarn|pnpm|git|curl|cd|mkdir|node)\b/y, "key"],
  ],
};
RULES.xml = RULES.svg = RULES.html;
RULES.javascript = RULES.mjs = RULES.js;

export function highlight(code, lang = "html") {
  const rules = RULES[lang];
  if (!rules) return escapeHTML(code);
  let out = "", i = 0, plain = "";
  const flush = () => { if (plain) { out += escapeHTML(plain); plain = ""; } };
  while (i < code.length) {
    let hit = null;
    for (const [re, cls] of rules) {
      re.lastIndex = i;
      const m = re.exec(code);
      if (m && m[0].length) { hit = [m[0], cls]; break; }
    }
    if (hit) { flush(); out += `<span class="tok-${hit[1]}">${escapeHTML(hit[0])}</span>`; i += hit[0].length; }
    else { plain += code[i++]; }
  }
  flush();
  return out;
}

/** Quita la sangría común y los saltos extremos */
export function dedent(text) {
  const lines = text.replace(/\t/g, "  ").replace(/^\n+|\s+$/g, "").split("\n");
  const min = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  return lines.map((l) => l.slice(isFinite(min) ? min : 0)).join("\n");
}

/** Convierte un contenedor .al-code (o crea uno) a partir de texto */
export function codeBlock(text, lang = "html", label) {
  const pre = h("pre", {}, h("code", { html: highlight(text, lang) }));
  const el = h("div", { class: "al-code", "data-lang": lang, "data-enhanced": "" }, pre);
  el._raw = text;
  addBar(el, label || lang);
  return el;
}

function addBar(el, label) {
  const btn = h("button", { class: "al-code__copy", type: "button", "aria-label": "Copiar código" }, h("al-icon", { name: "copy", size: 14 }), h("span", {}, "Copiar"));
  el.prepend(h("div", { class: "al-code__bar" }, h("span", {}, label), btn));
}

export function initCode(root = document) {
  $$(".al-code:not([data-enhanced])", root).forEach((el) => {
    const code = el.querySelector("code");
    if (!code) return;
    const lang = el.dataset.lang || "html";
    const raw = dedent(code.textContent);
    el._raw = raw;
    code.innerHTML = highlight(raw, lang);
    el.dataset.enhanced = "";
    addBar(el, el.dataset.label || lang);
  });
}

on("click", ".al-code__copy", async (_, btn) => {
  const box = btn.closest(".al-code");
  const ok = await copyText(box._raw ?? box.querySelector("code").textContent);
  const label = btn.querySelector("span");
  const icon = btn.querySelector("al-icon");
  btn.classList.toggle("is-copied", ok);
  label.textContent = ok ? "Copiado" : "No se pudo copiar";
  icon?.setAttribute("name", ok ? "check" : "alert-circle");
  setTimeout(() => { label.textContent = "Copiar"; icon?.setAttribute("name", "copy"); btn.classList.remove("is-copied"); }, 1800);
});
