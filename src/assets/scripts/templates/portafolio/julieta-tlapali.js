/* Julieta UI · Plantilla «Tlapali · Portafolio de diseño y desarrollo web»
   Comportamiento de la plantilla. Los ids, atributos data y clases que usa llevan el prefijo julieta-.
   Se carga por CDN como módulo; agrega tu lógica en tu propio archivo JS. */

import { Julieta } from "../../julieta.js";
document.getElementById("julieta-copiar").addEventListener("click", async () => {
  const ok = await Julieta.copy("hola@valeriamontes.example");
  Julieta.toast({ type: ok ? "success" : "danger", title: ok ? "Correo copiado" : "No se pudo copiar", text: ok ? "Pégalo donde quieras escribirme." : "Tu navegador bloqueó el portapapeles." });
});
document.getElementById("julieta-contacto-form").addEventListener("al:valid", (e) => {
  Julieta.toast({ type: "success", title: "Mensaje enviado", text: `Te escribo a ${e.detail.data.correo} en menos de 24 horas.` });
  e.currentTarget.reset();
});
