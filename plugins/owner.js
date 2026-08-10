const config = require('../config');
const { cmd, commands } = require('../command');
const { sendInteractiveMessage } = require('gifted-btns');

cmd({
    pattern: "owner|creator|developer",
    desc: "Get bot owner information and contact",
    category: "general",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender, args }) => {
    try {
        // Send reaction
        await conn.sendMessage(from, { react: { text: '🤖', key: mek.key } });

        const botOwner = 'BLOODRAVEN';
        const ownerNumber = '254117312277';
        const prefix = config.PREFIX || '.';

        const caption = `🤖 *BOT OWNER DETAILS*\n\n` +
                       `*Name:* ${botOwner}\n` +
                       `*Contact:* ${ownerNumber}\n\n` +
                       `🤖 *BLOODRAVEN-XMD* ⚙️`;

        // Send interactive message with buttons
        try {
            await sendInteractiveMessage(conn, from, {
                title: '🤖 BOT OWNER',
                text: caption,
                footer: '🤖 Powered by BLOODRAVEN-XMD ⚙️',
                interactiveButtons: [
                    {
                        name: 'cta_copy',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📋 Copy Number',
                            copy_code: ownerNumber
                        })
                    },
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: '💬 DM Owner',
                            url: `https://wa.me/${ownerNumber}`
                        })
                    },
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📢 Join Channel',
                            url: config.CHANNEL_LINK || 'https://whatsapp.com/channel/0029Va...'
                        })
                    }
                ]
            });
        } catch (btnErr) {
            // Fallback if interactive buttons fail
            console.error('[Owner] Buttons error:', btnErr.message);
            await conn.sendMessage(from, {
                text: caption + `\n\n*Owner Number:* ${ownerNumber}\n*DM:* https://wa.me/${ownerNumber}`
            }, { quoted: mek });
        }

        // Send success reaction
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (error) {
        console.error('[Owner] Error:', error.message);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        
        // Fallback error message
        try {
            await sendInteractiveMessage(conn, from, {
                title: '❌ ERROR',
                text: `${error.message || 'Unknown error'}\n\nPlease try again later.`,
                footer: '🤖 BLOODRAVEN-XMD ⚙️',
                interactiveButtons: [
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📋 Menu',
                            id: `${config.PREFIX || '.'}menu`
                        })
                    }
                ]
            });
        } catch (fallbackError) {
            await conn.sendMessage(from, {
                text: `❌ *ERROR*\n\n${error.message || 'Unknown error'}\n\n🤖 *BLOODRAVEN-XMD* ⚙️`
            }, { quoted: mek });
        }
    }
});
