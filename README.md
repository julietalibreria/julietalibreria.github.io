# Julieta UI

Interfaces con alma. Una librería modular de **componentes, iconos, colores, tipografías y plantillas** que se instala por CDN y se usa con clases. Sin compilar, sin dependencias.

## Instalación (CDN)

```html
<link rel="stylesheet" href="https://julietalibreria.github.io/src/assets/styles/julieta.css">
<script type="module" src="https://julietalibreria.github.io/src/assets/scripts/julieta.js"></script>
```

Funciona con cualquier CDN que sirva archivos estáticos: GitHub Pages (por defecto), jsDelivr, tu propio servidor. Cambia la URL base; las rutas internas se resuelven solas desde `import.meta.url`.

```html
<button class="al-btn al-btn--primary"><al-icon name="rocket"></al-icon>Lanzar</button>
<script>Julieta.toast.success("Listo", "Todo funciona.")</script>
```

## Estructura

```
index.html                 Portada de la documentación
src/
├─ pages/                  Documentación y plantillas (HTML)
│  ├─ instalacion.html  recursos.html  fundamentos.html  colores.html
│  ├─ tipografia.html   iconos.html    componentes.html  plantillas.html
│  └─ plantillas/        4 categorías (landing · dashboard · acceso · precios), 3 plantillas cada una
└─ assets/
   ├─ styles/            CSS por módulo (julieta.css los importa en @layer)
   ├─ scripts/           ES modules (julieta.js es el punto de entrada)
   ├─ json/              Datos: iconos, colores, tipografía, componentes, tokens…
   └─ images/            Marca, ilustraciones, portadas y vistas previas
```

## Módulos

Todo es independiente. Importa solo lo que necesites:

```html
<!-- Solo botones -->
<link rel="stylesheet" href="…/styles/tokens.css">
<link rel="stylesheet" href="…/styles/base.css">
<link rel="stylesheet" href="…/styles/buttons.css">
```

```js
import { toast } from "…/scripts/toast.js";
```

La lista completa, con dependencias y exportaciones, está en `src/assets/json/manifest.json` y en la página **Instalación**.

## Una sola fuente de verdad

Los recursos se declaran una vez y todo lo demás se deriva:

| Archivo | Alimenta |
|---|---|
| `icons.json` | `<al-icon>`, galería de iconos, buscador |
| `colors.json` + `tokens.css` | página de colores (los hex se leen en vivo del CSS) |
| `components.json` | títulos y tablas de API de la página de componentes, buscador |
| `typography.json`, `tokens.json`, `templates.json`, `navigation.json` | sus páginas y el buscador |

El **Navegador de recursos** y la **paleta de comandos** (`Ctrl/⌘ + K` o `/`) buscan sobre el catálogo unificado que construye `catalog.js` a partir de esos JSON.

## Desarrollo local

Los módulos ES y `fetch` requieren HTTP (no funciona con `file://`):

```bash
npx serve .
```

## Publicar

- **GitHub Pages (por defecto):** el sitio vive en `https://julietalibreria.github.io`, que también es la URL base del CDN.
- **GitHub + jsDelivr (alternativa):** crea la etiqueta `v1.0.0` y usa `https://cdn.jsdelivr.net/gh/julietalibreria/julietalibreria.github.io@1.0.0`.

## Compatibilidad

Navegadores actuales: Chrome/Edge 123+, Safari 17.5+, Firefox 129+ (usa `light-dark()`, `color-mix()`, `@layer`, `:has()` y `@starting-style`).

## Accesibilidad

Foco visible, patrones WAI-ARIA (pestañas, menús, diálogos nativos, combobox), contraste AA verificable en la página de Colores y `prefers-reduced-motion` respetado.

## Licencia

MIT. Las fuentes (Bricolage Grotesque, Hanken Grotesk, JetBrains Mono) se cargan desde Google Fonts bajo SIL OFL 1.1.
