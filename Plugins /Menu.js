const setting = require('../setting');

module.exports = async (conn, m, sender) => {
  await conn.sendMessage(sender, {
    image: { url: setting.menuImage },
    caption: `
🔰 *BOOM-MD-V3 MENU* 🔰

*General:*
- .alive
- .menu
- .ping
- .help

*Downloads:*
- .song <name>
- .movie <name>

🧠 Powered by BOOM-MD-V3
`,
  }, { quoted: m });
};
