const config = require('../config');
const { cmd, commands } = require('../command');
const fs = require('fs');
const path = require('path');

// Store anti-delete settings in a JSON file
const ANTI_DELETE_FILE = path.join(__dirname, '../data/antidelete.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Load anti-delete settings
let antiDeleteSettings = {
    group: false,
    private: false
};

try {
    if (fs.existsSync(ANTI_DELETE_FILE)) {
        const data = fs.readFileSync(ANTI_DELETE_FILE, 'utf8');
        antiDeleteSettings = JSON.parse(data);
    }
} catch (e) {
    console.log('[ANTIDELETE] Failed to load settings:', e);
}

// Save anti-delete settings
function saveAntiDeleteSettings() {
    try {
        fs.writeFileSync(ANTI_DELETE_FILE, JSON.stringify(antiDeleteSettings, null, 2));
        return true;
    } catch (e) {
        console.log('[ANTIDELETE] Failed to save settings:', e);
        return false;
    }
}

cmd({
    pattern: "antidelete|antidel",
    desc: "Toggle anti-delete — recovers deleted and edited messages",
    category: "owner",
    react: "🛡️",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender, args }) => {
    try {
        // Only bot owner can use this
        if (!isCreator) return reply('❌ Only the bot owner can use this command!');

        const action = (args[0] || '').toLowerCase();

        if (action === 'on') {
            antiDeleteSettings.group = true;
            antiDeleteSettings.private = true;
            
            if (saveAntiDeleteSettings()) {
                await conn.sendMessage(from, {
                    text: `🛡️ *Anti-Delete is ON*\n\n✅ Deleted and edited messages will be recovered and forwarded to you.\n\n📌 *Groups:* ✅ ENABLED\n📌 *Private Chats:* ✅ ENABLED\n\n> ${config.DESCRIPTION}`
                }, { quoted: mek });
            } else {
                reply('❌ Failed to save settings.');
            }
        } else if (action === 'off') {
            antiDeleteSettings.group = false;
            antiDeleteSettings.private = false;
            
            if (saveAntiDeleteSettings()) {
                await conn.sendMessage(from, {
                    text: `🛡️ *Anti-Delete is OFF*\n\n❌ Deleted and edited messages will NOT be recovered.\n\n📌 *Groups:* ❌ DISABLED\n📌 *Private Chats:* ❌ DISABLED\n\n> ${config.DESCRIPTION}`
                }, { quoted: mek });
            } else {
                reply('❌ Failed to save settings.');
            }
        } else if (action === 'group') {
            antiDeleteSettings.group = !antiDeleteSettings.group;
            
            if (saveAntiDeleteSettings()) {
                const status = antiDeleteSettings.group ? 'ENABLED' : 'DISABLED';
                await conn.sendMessage(from, {
                    text: `🛡️ *Group Anti-Delete ${status}*\n\n📌 *Groups:* ${antiDeleteSettings.group ? '✅ ENABLED' : '❌ DISABLED'}\n📌 *Private Chats:* ${antiDeleteSettings.private ? '✅ ENABLED' : '❌ DISABLED'}\n\n> ${config.DESCRIPTION}`
                }, { quoted: mek });
            } else {
                reply('❌ Failed to save settings.');
            }
        } else if (action === 'private') {
            antiDeleteSettings.private = !antiDeleteSettings.private;
            
            if (saveAntiDeleteSettings()) {
                const status = antiDeleteSettings.private ? 'ENABLED' : 'DISABLED';
                await conn.sendMessage(from, {
                    text: `🛡️ *Private Anti-Delete ${status}*\n\n📌 *Groups:* ${antiDeleteSettings.group ? '✅ ENABLED' : '❌ DISABLED'}\n📌 *Private Chats:* ${antiDeleteSettings.private ? '✅ ENABLED' : '❌ DISABLED'}\n\n> ${config.DESCRIPTION}`
                }, { quoted: mek });
            } else {
                reply('❌ Failed to save settings.');
            }
        } else {
            // Show current status
            const groupStatus = antiDeleteSettings.group ? '✅ ON' : '❌ OFF';
            const privateStatus = antiDeleteSettings.private ? '✅ ON' : '❌ OFF';
            
            await conn.sendMessage(from, {
                text: `🛡️ *Anti-Delete Status*\n\n📌 *Groups:* ${groupStatus}\n📌 *Private Chats:* ${privateStatus}\n\n*Usage:*\n• \`${config.PREFIX}antidelete on\` — enable all\n• \`${config.PREFIX}antidelete off\` — disable all\n• \`${config.PREFIX}antidelete group\` — toggle group\n• \`${config.PREFIX}antidelete private\` — toggle private\n\n> ${config.DESCRIPTION}`
            }, { quoted: mek });
        }

    } catch (e) {
        console.error('[ANTIDELETE] Error:', e);
        reply(`❌ Error: ${e.message || 'Something went wrong!'}`);
    }
});
