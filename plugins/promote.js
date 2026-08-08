const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
    pattern: "promote",
    desc: "Promote a member to admin",
    category: "group",
    react: "👑",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender }) => {
    try {
        if (!isGroup) return reply('❌ This command is only for groups!');
        if (!isCreator) return reply('❌ Only the bot owner can use this command!');

        let userJid;
        if (quoted) {
            userJid = quoted.sender || quoted.participant;
        } else if (body.split(' ')[1]) {
            const number = body.split(' ')[1].replace(/[^0-9]/g, '');
            userJid = number + '@s.whatsapp.net';
        } else {
            return reply('❌ Please mention or reply to the user you want to promote!');
        }

        await conn.groupParticipantsUpdate(from, [userJid], "promote");
        reply(`✅ @${userJid.split('@')[0]} has been promoted to admin!`, { mentions: [userJid] });
    } catch (e) {
        console.error('Promote error:', e);
        reply('❌ Failed to promote user. Make sure bot has admin privileges.');
    }
});
