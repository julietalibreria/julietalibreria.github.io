/* Julieta UI · Plantilla «Colibrí · Portafolio de diseño gráfico»
   Comportamiento de la plantilla. Los ids, atributos data y clases que usa llevan el prefijo julieta-.
   Se carga por CDN como módulo; agrega tu lógica en tu propio archivo JS. */

import { Julieta } from "../../julieta.js";
document.getElementById("julieta-cotiza").addEventListener("al:valid", (e) => {
  Julieta.toast({ type: "success", title: "¡Mensaje enviado!", text: `Te escribo a ${e.detail.data.correo} en menos de un día.` });
  e.currentTarget.reset();
});
