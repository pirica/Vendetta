const { logs } = require("../funciones/funciones.js");

/**
 * AntiCrash para hacer que el bot no pete, creado y mejorado por @mynameispako.
 */
const antiCrash = (client) => {
  // Primero removemos los listeners para evitar que se dupliquen
  process.removeAllListeners();

  /**
   * Empezamos a capturar los errores possibles de discord.
   */
  process.on("unhandledRejection", (reason, promise) => {
    logs(`Unhandled Rejection at: ${promise} reason: ${reason}`, "antiCrash");
    // Aqui puedes añadir mas cosas por ejemplo enviar el error a un canal de discord pero yo lo veo inutil xD
  });

  process.on("uncaughtException", (error) => {
    logs(`Uncaught Exception thrown: ${error}`, "antiCrash");
    // Aqui puedes añadir mas cosas por ejemplo enviar el error a un canal de discord pero yo lo veo inutil xD
  });

  process.on("rejectionHandled", (promise) => {
    logs(
      `Promise rejection was handled asynchronously: ${promise}`,
      "antiCrash"
    );
    // Aqui puedes añadir mas cosas por ejemplo enviar el error a un canal de discord pero yo lo veo inutil xD
  });

  process.on("warning", (warning) => {
    logs(`Warning: ${warning}`, "antiCrash");
    // Aqui puedes añadir mas cosas por ejemplo enviar el error a un canal de discord pero yo lo veo inutil xD
  });

  /**
   * Ahora aqui usaremos alguno eventos mas, estos no son importantes pero yo los uso.
   */
  process.on("multipleResolves", () => { });
  process.on("SIGINT", () => process.exit());
  process.on("SIGUSR1", () => process.exit());
  process.on("SIGUSR2", () => process.exit());
};

module.exports = antiCrash;
