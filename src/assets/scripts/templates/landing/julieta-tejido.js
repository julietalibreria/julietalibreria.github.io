/* Julieta UI · Plantilla «Tejido · El tablero donde tu taller se organiza»
   Comportamiento de la plantilla. Los ids, atributos data y clases que usa llevan el prefijo julieta-.
   Se carga por CDN como módulo; agrega tu lógica en tu propio archivo JS. */

import { Julieta } from "../../julieta.js";
document.getElementById("julieta-alta").addEventListener("al:valid", (e) => {
  Julieta.toast({ type: "success", title: "¡Listo!", text: `Te escribiremos a ${e.detail.data.correo}.` });
  e.target.reset();
});
