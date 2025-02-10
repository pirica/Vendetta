const { readdirSync } = require("fs");
const { log } = require("../funciones/funciones.js");
const estructura = require("../estructuras/esctructura");
const path = require("path");

/**
 * Aquí cargamos los comandos de la carpeta componentes.
 * @param {estructura} client - El cliente extendido de Discord.
 */
module.exports = (client) => {
  const rutaComponentes = path.join(__dirname, "..", "componentes");

  for (const tipo of readdirSync(rutaComponentes)) {
    for (const archivo of readdirSync(path.join(rutaComponentes, tipo)).filter(
      (f) => f.endsWith(".js")
    )) {
      const modulo = path.join(rutaComponentes, tipo, archivo);

      if (require.cache[modulo]) {
        delete require.cache[modulo];
      }

      const moduloExtraido = require(modulo);

      if (!moduloExtraido) continue;

      if (tipo === "botones") {
        if (!moduloExtraido.customId || !moduloExtraido.run) {
          log(
            "Imposible cargar el componente " +
            archivo +
            " debido a que faltan propiedades.",
            "advertencia"
          );
          continue;
        }

        client.collection.componentes.botones.set(
          moduloExtraido.customId,
          moduloExtraido
        );
      } else if (tipo === "menus") {
        if (!moduloExtraido.customId || !moduloExtraido.run) {
          log(
            "Imposible cargar el selectMenu " +
            archivo +
            " debido a que faltan propiedades.",
            "advertencia"
          );
          continue;
        }

        client.collection.componentes.menus.set(
          moduloExtraido.customId,
          moduloExtraido
        );
      } else if (tipo === "modals") {
        if (!moduloExtraido.customId || !moduloExtraido.run) {
          log(
            "Imposible cargar el modal " +
            archivo +
            " debido a que faltan propiedades.",
            "advertencia"
          );
          continue;
        }

        /**
         * Añadimos el componente a la colección de modals
         */
        client.collection.componentes.modals.set(
          moduloExtraido.customId,
          moduloExtraido
        );
      } else {
        log("Tipo de componente inválido: " + archivo, "advertencia");
        continue;
      }

      log("Cargado nuevo componente: " + archivo, "informacion");
    }
  }
};