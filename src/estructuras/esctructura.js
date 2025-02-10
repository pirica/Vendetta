const {
  Client,
  Partials,
  Collection,
  GatewayIntentBits,
} = require("discord.js");
const config = require("..//configuraciones/vendetta.js");
const comandos = require("../handlers/comandos");
const eventos = require("../handlers/eventos");
const deploy = require("../handlers/deploy");
const db = require("../handlers/mongo");
const componentes = require("../handlers/componentes");

/**
 * Clase extendida del cliente de Discord.
 */
module.exports = class extends Client {
  /**
   * Colecciones para almacenar comandos y componentes.
   */
  collection = {
    interactionComandos: new Collection(),
    prefixComandos: new Collection(),
    alias: new Collection(),
    componentes: {
      botones: new Collection(),
      menus: new Collection(),
      modals: new Collection(),
    },
  };

  /**
   * Array para almacenar los comandos de aplicación.
   */
  applicationComandosArray = [];

  /**
   * Constructor de la clase.
   */
  constructor() {
    super({
      intents: [Object.keys(GatewayIntentBits)],
      partials: [Object.keys(Partials)],
    });
  }

  /**
   * Método para iniciar el cliente de Discord.
   */
  iniciar = async () => {
    /**
     * Registrar comandos
     */
    comandos(this);
    /**
     * Registrar eventos
     */
    eventos(this);
    /**
     * Registrar componentes
     */
    componentes(this);

    /**
     * Conectar a la base de datos si está activado en la configuración
     */
    if (config.handler.mongodb.activado) db();

    /**
     * Iniciar sesión en Discord
     */
    await this.login(process.env.tokenDiscord || config.client.token);

    /**
     * Desplegar comandos si está activado en la configuración
     */
    if (config.handler.deploy) deploy(this, false);
  };
};