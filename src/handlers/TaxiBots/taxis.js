const { readFile, writeFile } = require('fs').promises;
const { log } = require("../../funciones/funciones.js");
const config = require("../../configuraciones/vendetta.js");
const { Client: taxi } = require('fnbr');
let queue = [];

/**
 * Auth de la cuenta 
 * @type {string}
 */
const device = {
    accountId: "",
    deviceId: "",
    secret: ""
}

/**
 * Datos de los taxis
 * @type {Object}
 */
const datosTaxis = {
    "ausente": ".gg/miabot 💖",
    "ocupado": "Ocupado 🌿",
    "tiempo_para_irme": 2,
    "mensajeUnion": "👋 Hola! tienes 2 minutos para empezar una partida | discord.gg/miabot",
    "mensajeAdios": "Gracias por usar los TaxiBots nos vemos! ✨ | discord.gg/miabot"
};

/**
 * IDS autorizadas
 * @type {string[]}
 */
const IDS = [
    "32digitos" // Aqui poneis las ids de las cuentas.
];

/**
 * Indica si el bot es privado o público
 * @type {boolean}
 */
const isPrivado = false;

/**
 * Funcion principal para cargar y gestionar los taxibots.
 * @param {estructura} client - El cliente extendido de Discord.
 */
const TaxiBots = async (client) => {

    /**
     * vamos a añadir un sistema para desactivar esto
     */
    const isActivado = config.taxiBotsConfig.isActivado;

    /**
     * Si esto esta activado no se inician
     */
    if (isActivado) return;

    const taxiClient = new taxi({
        defaultStatus: "Iniciando bot...",
        killOtherTokens: false,
        auth: { deviceAuth: device },
        xmppDebug: false,
        platform: "AND",
        restartOnInvalidRefresh: true,
        partyConfig: {
            privacy: {
                partyType: "Private",
                acceptingMembers: false,
                invitePermission: "AnyMember",
                inviteRestriction: "AnyMember",
                onlyLeaderFriendsCanJoin: false,
                presencePermission: "Leader"
            },
            maxSize: 4,
            joinability: "INVITE_AND_FORMER",
            discoverability: "INVITED_ONLY"
        },
    });

    await taxiClient.login();
    log(`El taxi ${taxiClient.user.self.displayName} esta activo!`, "completado");
    taxiClient.setStatus(datosTaxis.ausente);

    /**
     * Añade la skin al bot
     */
    await taxiClient.party.me.setOutfit("CID_757_Athena_Commando_F_WildCat");
    await taxiClient.party.me.setBanner("OT9Banner");

    let warnsTiempo, byeTiempo;

    /**
     * Procesa la cola de espera
     */
    function procesamientoCola() {
        taxiClient.setStatus(datosTaxis.ocupado);

        setTimeout(() => {
            taxiClient.party.sendMessage(datosTaxis.mensajeUnion).catch(() => ({}));
        }, 2000);

        warnsTiempo = setTimeout(() => {
            taxiClient.party.sendMessage(datosTaxis.mensajeAdios).catch(() => ({}));
        }, datosTaxis.tiempo_para_irme * 60000);

        byeTiempo = setTimeout(async () => {
            if (queue.length > 1) {
                try {
                    await taxiClient.joinParty(queue[0]);
                    queue.shift();
                    procesamientoCola();
                } catch (error) {
                    log(error, "error");
                    queue.shift();
                    clearTimeout(warnsTiempo);
                    clearTimeout(byeTiempo);
                }
            } else {
                taxiClient.leaveParty();
                taxiClient.setStatus(datosTaxis.ausente);
            }
        }, datosTaxis.tiempo_para_irme * 60000 + 1000);
    }

    /**
     * Maneja las solicitudes de amistad
     * @param {Object} friend - El objeto de la solicitud de amistad
     */
    taxiClient.on('friend:request', async (friend) => {
        log(`Recibido solicitud de amistad de ${friend.displayName}`, "informacion");

        if (isPrivado && !IDS.includes(friend.id)) {
            log(`Solicitud de amistad rechazada de ${friend.displayName} (ID no autorizada)`, "informacion");
            await friend.decline();
            return;
        }

        try {
            await friend.accept();
            log(`Acepte la invitacion de amistad de ${friend.displayName}`, "informacion");
        } catch (e) {
            log(`Error al procesar la invitacion de amistad de ${friend.displayName}: ${e}`, "error");
        }
    });

    /**
     * Maneja las invitaciones a partidas
     * @param {Object} request - El objeto de la invitación a la partida
     */
    taxiClient.on('party:invite', async (request) => {
        const userId = request.sender.id;
        const displayName = request.sender.displayName;
        try {
            log(`Invitacion a partida recibida de ${displayName}`, "informacion");

            if (isPrivado && !IDS.includes(userId)) {
                log(`Invitacion rechazada de ${displayName} (ID no autorizada)`, "informacion");
                await request.decline();
                return;
            }

            if (userId !== taxiClient.user.self.id) {
                if (queue.includes(request.party.id)) {
                    log(`${displayName} esta ya en la cola`, "informacion");
                    await request.decline();
                } else {
                    queue.push(request.party.id);
                    await taxiClient.sendFriendMessage(userId, "Actualmente esta la cola del bot llena, espera hasta que el bot se una a tu partida");
                    log(`Añadido el usuario ${displayName} a la cola`, "informacion");
                }
            } else {
                await request.accept();

                /**
                 * lo mas importante para enviar el patch que hara que aumente el poder
                 */
                setTimeout(async () => {
                    const statsJSON = '{"FORTStats":{"fortitude":5797,"offense":5797,"resistance":5797,"tech":5797,"teamFortitude":5797,"teamOffense":0,"teamResistance":0,"teamTech":0,"fortitude_Phoenix":5797,"offense_Phoenix":5797,"resistance_Phoenix":5797,"tech_Phoenix":5797,"teamFortitude_Phoenix":0,"teamOffense_Phoenix":0,"teamResistance_Phoenix":0,"teamTech_Phoenix":0}}';

                    try {
                        await taxiClient.party?.me?.sendPatch({ "Default:FORTStats_j": statsJSON });
                    } catch (error) {
                        log(`Error al enviar Stats JSON error: ${error}`, "error");
                    }
                }, 1000);

                procesamientoCola();
                log(`Se unio a la partida de ${request.party.leader.displayName}`, "informacion");
            }
        } catch (error) {
            log(`Error en el handler de (party:invite): ${error}`, "error");
        }
    });

    /**
     * Maneja la expulsión de miembros de la partida
     * @param {Object} party - El objeto de la partida
     */
    taxiClient.on('party:member:kicked', async (party) => {
        log(`Expulsado de la partida de ${kicked.displayName}`, "informacion");
        try {
            if (party.id === taxiClient.user.id && queue.length > 0) {
                clearTimeout(warnsTiempo);
                clearTimeout(byeTiempo);
                try {
                    await taxiClient.joinParty(queue[0]);
                    queue.shift();
                    procesamientoCola();
                } catch (error) {
                    log(error, "error");
                    queue.shift();
                    clearTimeout(warnsTiempo);
                    clearTimeout(byeTiempo);
                }
            } else if (party.id === taxiClient.user.id) {
                taxiClient.setStatus(datosTaxis.ausente);
                clearTimeout(warnsTiempo);
                clearTimeout(byeTiempo);
            }
        } catch (error) {
            log(`Error en el handler de (party:member:kicked): ${error}`, "error");
        }
    });

    /**
     * Maneja la salida de miembros de la partida
     * @param {Object} party - El objeto de la partida
     */
    taxiClient.on('party:member:left', async (party) => {
        try {
            if (party.party.leader.id === taxiClient.user.id && queue.length > 0) {
                clearTimeout(warnsTiempo);
                clearTimeout(byeTiempo);
                try {
                    await taxiClient.joinParty(queue[0]);
                    queue.shift();
                    procesamientoCola();
                } catch (error) {
                    log(error, "error");
                    queue.shift();
                    clearTimeout(warnsTiempo);
                    clearTimeout(byeTiempo);
                }
            } else if (party.party.leader.id === taxiClient.user.id && queue.length === 0) {
                taxiClient.setStatus(datosTaxis.ausente);
                clearTimeout(warnsTiempo);
                clearTimeout(byeTiempo);
                await taxiClient.leaveParty();
            } else {
                const index = queue.indexOf(party.party.id);
                if (index !== -1) {
                    queue.splice(index, 1);
                }
            }
        } catch (error) {
            log(`Error en el handler de (party:member:left): ${error}`, "error");
        }
    });
};

module.exports = TaxiBots;