const config = require('../config');
const { cmd, commands } = require('../command');
const axios = require('axios');

cmd({
    pattern: "lyrics",
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

        // Get album art or generate a music image
        let imageUrl = 'https://i.imgur.com/8QmJZ7v.jpeg'; // Default music image
        
        // Try to get album art from the API
        if (song.album_art || song.thumbnail) {
            imageUrl = song.album_art || song.thumbnail;
        } else if (song.image) {
            imageUrl = song.image;
        }

        // Create caption with lyrics
        const caption = `🎵 *${song.title}*\n👤 *${song.artist}*\n\n${lyrics}${lyrics.length >= 3000 ? '...' : ''}\n\n🔗 ${song.url || 'N/A'}\n\n> ${config.DESCRIPTION}`;

        // Send with image
        try {
            await conn.sendMessage(from, {
                image: { url: imageUrl },
                caption: caption
            }, { quoted: mek });
        } catch (imgErr) {
            // If image fails, send as text
            console.error('[Lyrics] Image error:', imgErr.message);
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
