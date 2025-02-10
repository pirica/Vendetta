const { readdirSync } = require("fs");
const { log } = require("../funciones/funciones.js");
const esctructura = require("../estructuras/esctructura");
const path = require("path");

/**
 * Registrar eventos para el bot.
 * @param {esctructura} client - El cliente extendido de Discord.
 */
const registrarEventos = (client) => {
  /**
   * Definimos la ruta donde se encuentran los eventos
   */
  const rutaEventos = path.join(__dirname, "..", "eventos");

  /**
   * Recorremos cada tipo de evento (por ejemplo, cliente, guild, etc.)
   */
  for (const tipo of readdirSync(rutaEventos)) {
    /**
     * Recorremos cada archivo dentro del tipo de evento
     */
    for (const archivo of readdirSync(path.join(rutaEventos, tipo)).filter(
      (f) => f.endsWith(".js")
    )) {
      const modulo = path.join(rutaEventos, tipo, archivo);

      /**
       * Borramos la cache para el módulo específico
       */
      if (require.cache[modulo]) {
        delete require.cache[modulo];
      }

      const moduloExtraido = require(modulo);

      /**
       * Si el módulo no se pudo cargar, continuamos con el siguiente
       */
      if (!moduloExtraido) continue;

      /**
       * Verificamos que el módulo tenga las propiedades necesarias
       */
      if (!moduloExtraido.event || !moduloExtraido.run) {
        log(
          "Imposible cargar el evento " +
          archivo +
          " debido a que faltan propiedades.",
          "advertencia"
        );
        continue;
      }

      /**
       * Registramos en el log que el evento se ha cargado correctamente
       */
      log("Cargado nuevo evento: " + archivo, "informacion");

      /**
       * Si el evento debe ejecutarse solo una vez
       */
      if (moduloExtraido.once) {
        client.once(moduloExtraido.event, (...args) =>
          moduloExtraido.run(client, ...args)
        );
      } else {
        /**
         * Si el evento debe ejecutarse cada vez que se emite
         */
        client.on(moduloExtraido.event, (...args) =>
          moduloExtraido.run(client, ...args)
        );
      }
    }
  }
};

module.exports = registrarEventos;