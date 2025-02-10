const { log } = require("../../funciones/funciones.js");
const estructura = require('../../estructuras/esctructura');

module.exports = {
    event: 'ready',
    once: true,
    /**
     * 
     * @param {estructura} _ 
     * @param {import('discord.js').Client<true>} client 
     * @returns 
     */
    run: (_, client) => {
        log('Conectado como: ' + client.user.tag, 'completado');
        client.user.setActivity('v0.0.1', { type: 'WATCHING' });
    }
};