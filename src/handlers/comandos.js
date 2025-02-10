const { readdirSync } = require("fs");
const { log } = require("../funciones/funciones.js");
const estructura = require("../estructuras/esctructura");
const path = require("path");

/**
 * Registramos los comandos en el bot.
 * @param {estructura} client - El cliente extendido de Discord.
 */
const registrarComandos = (client) => {
  /**
   * Primero borramos la cache.
   */
  const ruta = path.join(__dirname, "..", "comandos");
  if (require.cache[ruta]) {
    delete require.cache[ruta];
  }

  const comandosPath = path.join(__dirname, '..', 'comandos');

  // Recorremos cada tipo de comando (prefix, slash, etc.)
  for (const tipo of readdirSync(comandosPath)) {
    const tipoPath = path.join(comandosPath, tipo);

    // Recorremos cada ruta dentro del tipo de comando
    for (const ruta of readdirSync(tipoPath)) {
      const rutaPath = path.join(tipoPath, ruta);

      // Recorremos cada archivo dentro de la ruta
      for (const archivo of readdirSync(rutaPath).filter((f) => f.endsWith('.js'))) {
        const modulo = path.join(rutaPath, archivo);

        /**
         * Borramos la cache para el modulo especifico.
         */
        if (require.cache[modulo]) {
          delete require.cache[modulo];
        }

        const moduloExtraido = require(modulo);

        /**
         * Si el módulo no se pudo cargar, continuamos con el siguiente
         */
        if (!moduloExtraido) continue;

        if (tipo === 'prefix') {
          /**
           * Verificamos que el módulo tenga las propiedades necesarias
           */
          if (!moduloExtraido.structure?.name || !moduloExtraido.run) {
            log(
              'Imposible cargar el comando de la ruta ' +
              archivo +
              ' debido a que faltan propiedades en el comando.',
              'advertencia'
            );
            continue;
          }

          /**
           * Añadimos el comando a la colección de comandos con prefijo
           */
          client.collection.prefixComandos.set(
            moduloExtraido.structure.name,
            moduloExtraido
          );

          /**
           * Añadimos los alias del comando a la colección de alias
           */
          if (
            moduloExtraido.structure.alias &&
            Array.isArray(moduloExtraido.structure.alias)
          ) {
            moduloExtraido.structure.alias.forEach((alias) => {
              client.collection.alias.set(
                alias,
                moduloExtraido.structure.name
              );
            });
          }
        } else {
          /**
           * Verificamos que el módulo tenga las propiedades necesarias
           */
          if (!moduloExtraido.structure?.name || !moduloExtraido.run) {
            log(
              'Imposible cargar el comando de la ruta ' +
              archivo +
              ' debido a que faltan propiedades en el comando.',
              'advertencia'
            );
            continue;
          }

          /**
           * Añadimos el comando a la colección de comandos de interacción
           */
          client.collection.interactionComandos.set(
            moduloExtraido.structure.name,
            moduloExtraido
          );
          client.applicationComandosArray.push(moduloExtraido.structure);
        }

        /**
         * Registramos en el log que el comando se ha cargado correctamente
         */
        log('Cargado/Refrescado comando: ' + archivo, 'info');
      }
    }
  }
};

module.exports = registrarComandos;