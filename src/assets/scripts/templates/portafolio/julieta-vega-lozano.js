/* Julieta UI · Plantilla «Vega Lozano · Portafolio de arquitectura»
   Comportamiento de la plantilla. Los ids, atributos data y clases que usa llevan el prefijo julieta-.
   Se carga por CDN como módulo; agrega tu lógica en tu propio archivo JS. */

import { Julieta } from "../../julieta.js";
document.getElementById("julieta-reunion").addEventListener("al:valid", (e) => {
  Julieta.toast({ type: "success", title: "Solicitud enviada", text: `Te escribiremos a ${e.detail.data.correo} para acordar la reunión.` });
  e.currentTarget.reset();
});
