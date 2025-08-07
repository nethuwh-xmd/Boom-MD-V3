const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const P = require('pino');
const { loadPlugins } = require('./lib/loader');
const config = require('./config');
const setting = require('./setting');
require('dotenv').config();

async function startBoomMdV3() {
  const { state, saveCreds } = await useMultiFileAuthState(setting.sessionFolder);
  const { version } = await fetchLatestBaileysVersion();

  const conn = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: state,
    logger: P({ level: 'silent' }),
  });

  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (reason === DisconnectReason.loggedOut) {
        console.log('Bot disconnected. Scan QR again.');
        process.exit();
      } else {
        startBoomMdV3();
      }
    } else if (connection === 'open') {
      console.log('✅ BOOM-MD-V3 Connected Successfully!');
      await conn.sendMessage(conn.user.id, {
        image: { url: setting.logo },
        caption: `🎉 *BOOM-MD-V3 Connected Successfully!*`,
      });
    }
  });

  conn.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message) return;
    const body = m.message.conversation || m.message.extendedTextMessage?.text || '';
    const sender = m.key.remoteJid;
    const fromMe = m.key.fromMe;

    // Core commands
    if (body === `${config.prefix}menu`) {
      const menu = require('./plugins/menu');
      await menu(conn, m, sender);
    }

    // Load custom plugins
    loadPlugins(conn, m, body, sender, fromMe);
  });

  conn.ev.on('creds.update', saveCreds);
}

startBoomMdV3();
