/* Julieta UI · Tema inicial
   Aplica el tema guardado antes de pintar la página para evitar el destello.
   Se carga con <script src="..."> (sin type="module") dentro del <head>. */
try {
  var m = localStorage.getItem("julieta-theme");
  if (m && m !== "system") document.documentElement.setAttribute("data-theme", m);
} catch (e) {}
