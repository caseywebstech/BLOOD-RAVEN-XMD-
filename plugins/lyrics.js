const config = require('../config');
const { cmd, commands } = require('../command');
const axios = require('axios');

cmd({
    pattern: "lyrics|lyric|songlyrics",
    desc: "Get song lyrics",
    category: "download",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender, args }) => {
    try {
        const query = args.join(' ').trim();
        
        if (!query) {
            return await conn.sendMessage(from, {
                text: `🎵 *SONG LYRICS*\n\n*Usage:* \`${config.PREFIX}lyrics <song name>\`\n\n*Examples:*\n• \`${config.PREFIX}lyrics Shape of You\`\n• \`${config.PREFIX}lyrics Blinding Lights\`\n\n> ${config.DESCRIPTION}`
            }, { quoted: mek });
        }

        // Send reaction
        await conn.sendMessage(from, { react: { text: '🎵', key: mek.key } });

        // Use Popcat API for lyrics
        const url = `https://api.popcat.xyz/v2/lyrics?song=${encodeURIComponent(query)}`;
        const { data } = await axios.get(url, { timeout: 10000 });

        if (data.error || !data.message) {
            return await conn.sendMessage(from, {
                text: `❌ *NOT FOUND*\n\nNo lyrics found for "${query}".\n\nTry checking the spelling or use a different song name.\n\n> ${config.DESCRIPTION}`
            }, { quoted: mek });
        }

        const song = data.message;
        const lyrics = song.lyrics ? song.lyrics.slice(0, 3000) : 'No lyrics available';
        const fullLyrics = song.lyrics || '';

        // Create caption with lyrics
        const caption = `🎵 *${song.title}*\n👤 *${song.artist}*\n\n${lyrics}${lyrics.length >= 3000 ? '...' : ''}\n\n🔗 ${song.url || 'N/A'}\n\n> ${config.DESCRIPTION}`;

        // Try to send with buttons first
        try {
            await conn.sendMessage(from, {
                text: caption,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420261263259@newsletter',
                        newsletterName: 'BLOODRAVEN TECH 亗🧑‍💻',
                        serverMessageId: -1
                    }
                }
            }, { quoted: mek });
        } catch (err) {
            // Fallback to simple text if buttons fail
            await conn.sendMessage(from, {
                text: caption
            }, { quoted: mek });
        }

        // Send success reaction
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (err) {
        console.error('[Lyrics] Error:', err.message);
        await conn.sendMessage(from, {
            text: `❌ *FAILED*\n\n${err.message || 'Unable to fetch lyrics. Please try again later.'}\n\n> ${config.DESCRIPTION}`
        }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    }
});
