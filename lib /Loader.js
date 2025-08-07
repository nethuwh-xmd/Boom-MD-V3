const fs = require('fs');
const path = require('path');

function loadPlugins(conn, m, body, sender, fromMe) {
  const pluginPath = path.join(__dirname, '..', 'plugins');
  fs.readdirSync(pluginPath).forEach(file => {
    if (file.endsWith('.js') && file !== 'menu.js') {
      try {
        const plugin = require(path.join(pluginPath, file));
        plugin(conn, m, body, sender, fromMe);
      } catch (err) {
        console.error(`❌ Failed to load plugin: ${file}\n`, err);
      }
    }
  });
}

module.exports = { loadPlugins };
