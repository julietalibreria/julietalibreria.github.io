# Cambios · Plantillas con CSS y JS por CDN y prefijo `julieta`

## Qué cambió

1. **HTML limpio.** Las 15 plantillas (`src/pages/plantillas/<categoría>/<plantilla>.html`) ya no llevan `<style>` ni `<script>` en línea.
2. **CSS y JS por CDN.** Cada plantilla carga su propio archivo desde `src/assets/styles/templates/` y `src/assets/scripts/templates/` (al copiar el código, las rutas se reescriben a `https://julietalibreria.github.io/src/assets/...`).
3. **Prefijo `julieta`.** Clases, variables CSS, animaciones, ids usados por JS y atributos `data-*` propios de las plantillas ahora empiezan con `julieta-` (en JS, `dataset.julieta…`). Los archivos se llaman `julieta-<plantilla>.css` y `julieta-<plantilla>.js`.
4. **Script del tema.** El pequeño script que aplicaba el tema antes de pintar también salió del HTML: `src/assets/scripts/julieta-theme-init.js`.
5. **Personalización del usuario.** Cada plantilla trae dos comentarios que indican dónde agregar su propio CSS (en el `<head>`, después del nuestro) y su propio JS (antes de `</body>`).

Lo que **no** se renombró, a propósito: las clases `al-*` de la librería, los atributos `data-al-*` y los `data-*` que la propia librería lee (`data-value`, `data-sort`, `data-status`, `data-target`, `data-density`) y las variables internas (`--al-*`, `--size`, `--_bd`…).

## Archivos nuevos (31)
- `src/assets/scripts/julieta-theme-init.js`
- `src/assets/scripts/templates/acceso/julieta-casa-jacaranda.js`
- `src/assets/scripts/templates/acceso/julieta-cenote-recuperar-acceso.js`
- `src/assets/scripts/templates/acceso/julieta-nopal-registro-pasos.js`
- `src/assets/scripts/templates/dashboard/julieta-caja-chica.js`
- `src/assets/scripts/templates/dashboard/julieta-casa-jacaranda.js`
- `src/assets/scripts/templates/dashboard/julieta-estudio-nopal.js`
- `src/assets/scripts/templates/landing/julieta-cuadra.js`
- `src/assets/scripts/templates/landing/julieta-milpa.js`
- `src/assets/scripts/templates/landing/julieta-tejido.js`
- `src/assets/scripts/templates/portafolio/julieta-colibri.js`
- `src/assets/scripts/templates/portafolio/julieta-tlapali.js`
- `src/assets/scripts/templates/portafolio/julieta-vega-lozano.js`
- `src/assets/scripts/templates/precios/julieta-amate-precios-por-uso.js`
- `src/assets/scripts/templates/precios/julieta-cantaro-personal-vs-equipos.js`
- `src/assets/scripts/templates/precios/julieta-tejido.js`
- `src/assets/styles/templates/acceso/julieta-casa-jacaranda.css`
- `src/assets/styles/templates/acceso/julieta-cenote-recuperar-acceso.css`
- `src/assets/styles/templates/acceso/julieta-nopal-registro-pasos.css`
- `src/assets/styles/templates/dashboard/julieta-caja-chica.css`
- `src/assets/styles/templates/dashboard/julieta-casa-jacaranda.css`
- `src/assets/styles/templates/dashboard/julieta-estudio-nopal.css`
- `src/assets/styles/templates/landing/julieta-cuadra.css`
- `src/assets/styles/templates/landing/julieta-milpa.css`
- `src/assets/styles/templates/landing/julieta-tejido.css`
- `src/assets/styles/templates/portafolio/julieta-colibri.css`
- `src/assets/styles/templates/portafolio/julieta-tlapali.css`
- `src/assets/styles/templates/portafolio/julieta-vega-lozano.css`
- `src/assets/styles/templates/precios/julieta-amate-precios-por-uso.css`
- `src/assets/styles/templates/precios/julieta-cantaro-personal-vs-equipos.css`
- `src/assets/styles/templates/precios/julieta-tejido.css`

## Archivos modificados (17)
Plantillas (HTML, ya sin CSS/JS en línea):
- `src/pages/plantillas/acceso/casa-jacaranda.html`
- `src/pages/plantillas/acceso/cenote-recuperar-acceso.html`
- `src/pages/plantillas/acceso/nopal-registro-pasos.html`
- `src/pages/plantillas/dashboard/caja-chica.html`
- `src/pages/plantillas/dashboard/casa-jacaranda.html`
- `src/pages/plantillas/dashboard/estudio-nopal.html`
- `src/pages/plantillas/landing/cuadra.html`
- `src/pages/plantillas/landing/milpa.html`
- `src/pages/plantillas/landing/tejido.html`
- `src/pages/plantillas/portafolio/colibri.html`
- `src/pages/plantillas/portafolio/tlapali.html`
- `src/pages/plantillas/portafolio/vega-lozano.html`
- `src/pages/plantillas/precios/amate-precios-por-uso.html`
- `src/pages/plantillas/precios/cantaro-personal-vs-equipos.html`
- `src/pages/plantillas/precios/tejido.html`

Documentación:
- `README.md`
- `src/pages/plantillas.html`

## Archivos eliminados (0)
Ninguno.

## Dónde va cada cosa
Copia el contenido del zip sobre la raíz del proyecto (`julietalibreria.github.io`) respetando las rutas; los archivos existentes se sobrescriben. Cuando publiques, las plantillas copiadas por los usuarios apuntarán a `https://julietalibreria.github.io/src/assets/styles/templates/…` y `…/scripts/templates/…`.

---

# Modo seguro por defecto (corrección: Julieta ya no altera páginas ajenas)

**Problema:** al cargar `julieta.css` y `julieta.js` en un sitio existente, el CSS aplicaba un reseteo global (`* { box-sizing: border-box; margin: 0 }`, titulares, imágenes, botones, enlaces, `body`, foco…) y `color-scheme: light dark` en `:root`. El JS tomaba atajos de teclado globales (`/` y Ctrl+K) y cambiaba el `<meta name="theme-color">`.

**Corrección:**
- `base.css` solo actúa dentro de `class="julieta"` y de los componentes `al-*` (y lo que contienen). Todo con `:where()`, sin cambiar la especificidad.
- `tokens.css`: el `color-scheme` y el tema claro/oscuro solo se aplican con `class="julieta"`; sin ella, los componentes siguen el esquema de tu sitio.
- `overlays.css` y `forms.css`: `::backdrop` y `.is-invalid` acotados a Julieta.
- `command.js`, `overlays.js`, `theme.js`: sin paleta de Julieta en la página no se toca ningún atajo; el cierre de `<dialog>` solo afecta a modales y cajones de Julieta; `theme-color` y `data-theme` solo se tocan con `class="julieta"`.
- Las 29 páginas propias llevan `<html class="julieta">`.

**Archivos modificados (no HTML):**
- `README.md`
- `src/assets/scripts/command.js`
- `src/assets/scripts/overlays.js`
- `src/assets/scripts/theme.js`
- `src/assets/styles/base.css`
- `src/assets/styles/forms.css`
- `src/assets/styles/overlays.css`
- `src/assets/styles/tokens.css`

**Páginas HTML modificadas:** 29 (se añadió `class="julieta"` al `<html>`; en `src/pages/instalacion.html` además hay una nota nueva).
