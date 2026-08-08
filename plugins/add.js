const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
    pattern: "remove|kick",
    desc: "Remove a user from the group",
    category: "group",
    react: "⛔",
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
            return reply('❌ Please mention or reply to the user you want to remove!');
        }

        // Check if user is admin
        const groupMetadata = await conn.groupMetadata(from);
        const isAdmin = groupMetadata.participants.find(p => p.id === userJid)?.admin;
        if (isAdmin) return reply('❌ Cannot remove an admin!');

        await conn.groupParticipantsUpdate(from, [userJid], "remove");
        reply(`✅ Successfully removed @${userJid.split('@')[0]} from the group!`, { mentions: [userJid] });
    } catch (e) {
        console.error('Remove error:', e);
        reply('❌ Failed to remove user. Make sure bot has admin privileges.');
    }
});
