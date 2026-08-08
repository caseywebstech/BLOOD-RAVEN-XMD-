const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
    pattern: "tagall",
    desc: "Tag all group members",
    category: "group",
    react: "🏷️",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender }) => {
    try {
        if (!isGroup) return reply('❌ This command is only for groups!');
        if (!isCreator) return reply('❌ Only the bot owner can use this command!');

        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants;
        let message = '👥 *GROUP MEMBERS*\n\n';
        
        participants.forEach((participant, index) => {
            message += `${index + 1}. @${participant.id.split('@')[0]}\n`;
        });

        const mentions = participants.map(p => p.id);
        await conn.sendMessage(from, {
            text: message,
            mentions: mentions
        }, { quoted: mek });

    } catch (e) {
        console.error('Tagall error:', e);
        reply('❌ Failed to tag all members.');
    }
});
