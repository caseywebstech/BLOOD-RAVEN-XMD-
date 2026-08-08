const config = require('../config');
const { cmd, commands } = require('../command');
const crypto = require("crypto");
const ffmpeg = require("fluent-ffmpeg");
const { PassThrough } = require("stream");
const baileys = require("@whiskeysockets/baileys");
const axios = require('axios');

// ─── COLOR MAP (hex) ─────────────────────────────────────────────────────────
const COLORS = {
    blue: "#34B7F1",
    green: "#25D366",
    yellow: "#FFD700",
    orange: "#FF8C00",
    red: "#FF3B30",
    purple: "#9C27B0",
    gray: "#9E9E9E",
    black: "#000000",
    white: "#FFFFFF",
    cyan: "#00BCD4",
};

// Newsletter context for BLOODRAVEN
const newsletterContext = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363420261263259@newsletter',
        newsletterName: 'BLOODRAVEN TECH 亗🧑‍💻',
        serverMessageId: -1
    }
};

cmd({
    pattern: "togstatus|swgc|groupstatus",
    desc: "Send text / image / video / audio as group status",
    category: "group",
    react: "📢",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender, args }) => {
    try {
        if (!isGroup) return reply('❌ This command is only for groups!');
        if (!isCreator) return reply('❌ Only the bot owner can use this command!');

        const jid = from;

        // Parse args: caption|color|groupUrl
        const raw = args.join(" ").trim();
        let [caption, color, groupUrl] = raw.split("|").map((v) => v?.trim());

        // Resolve target group (optional external link)
        let targetGroupId = jid;
        if (groupUrl) {
            try {
                const code = groupUrl.split("/").pop().split("?")[0];
                const info = await conn.groupGetInviteInfo(code);
                targetGroupId = info.id;
                await reply(`🎯 Target group: *${info.subject}*`);
            } catch {
                return reply("❌ Invalid group link or bot is not in that group.");
            }
        }

        // Detect quoted message (handles both reply context and direct media)
        const quotedMsg = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
            (mek.message?.imageMessage ? mek.message : null) ||
            (mek.message?.videoMessage ? mek.message : null) ||
            (mek.message?.audioMessage ? mek.message : null);

        // ── TEXT STATUS ──────────────────────────────────────────────────
        const hasMedia = quotedMsg &&
            (quotedMsg.imageMessage ||
                quotedMsg.videoMessage ||
                quotedMsg.audioMessage);

        if (!hasMedia) {
            if (!caption) {
                return reply(
                    `📝 *Group Status Usage*\n\n` +
                    `.togstatus caption|color\n` +
                    `.togstatus |blue\n` +
                    `Reply to image / video / audio\n\n` +
                    `🎨 Colors:\nblue, green, yellow, orange, red,\npurple, gray, black, white, cyan`
                );
            }

            const bgHex = COLORS[color?.toLowerCase()] || COLORS.blue;

            await sendGroupStatus(conn, targetGroupId, {
                extendedTextMessage: {
                    text: caption,
                    backgroundArgb: hexToArgb(bgHex),
                    font: 0,
                },
            });

            return reply("✅ Text status sent!");
        }

        // ── IMAGE STATUS ─────────────────────────────────────────────────
        if (quotedMsg.imageMessage) {
            const buf = await baileys.downloadMediaMessage(
                buildMsgObj(mek, quotedMsg),
                "buffer",
                {},
                { reuploadRequest: conn.updateMediaMessage }
            );

            const content = await baileys.generateWAMessageContent(
                { image: buf, caption: caption || "" },
                { upload: conn.waUploadToServer }
            );
            await sendGroupStatus(conn, targetGroupId, content);
            return reply("✅ Image status sent!");
        }

        // ── VIDEO STATUS ─────────────────────────────────────────────────
        if (quotedMsg.videoMessage) {
            const buf = await baileys.downloadMediaMessage(
                buildMsgObj(mek, quotedMsg),
                "buffer",
                {},
                { reuploadRequest: conn.updateMediaMessage }
            );

            const content = await baileys.generateWAMessageContent(
                { video: buf, caption: caption || "" },
                { upload: conn.waUploadToServer }
            );
            await sendGroupStatus(conn, targetGroupId, content);
            return reply("✅ Video status sent!");
        }

        // ── AUDIO STATUS ─────────────────────────────────────────────────
        if (quotedMsg.audioMessage) {
            const buf = await baileys.downloadMediaMessage(
                buildMsgObj(mek, quotedMsg),
                "buffer",
                {},
                { reuploadRequest: conn.updateMediaMessage }
            );

            const vn = await toVN(buf);
            const waveform = await generateWaveform(buf);

            const content = await baileys.generateWAMessageContent(
                {
                    audio: vn,
                    mimetype: "audio/ogg; codecs=opus",
                    ptt: true,
                },
                { upload: conn.waUploadToServer }
            );

            // Attach waveform bytes to the audioMessage
            if (content.audioMessage) {
                content.audioMessage.waveform = Buffer.from(waveform, "base64");
            }

            await sendGroupStatus(conn, targetGroupId, content);
            return reply("✅ Audio status sent!");
        }

        return reply("❌ Unsupported media type. Reply to an image, video, or audio.");

    } catch (err) {
        console.error("[togstatus] Error:", err);
        return reply(`❌ Status error:\n${err.message}`);
    }
});

// ─── HELPERS ────────────────────────────────────────────────────────────────

/**
 * Convert #RRGGBB hex string → unsigned 32-bit ARGB integer.
 * WhatsApp's backgroundArgb field requires an integer, not a hex string.
 */
function hexToArgb(hex) {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return ((0xff << 24) | (r << 16) | (g << 8) | b) >>> 0;
}

/**
 * Build a proper message object for downloadMediaMessage.
 * The key must reference the quoted message's stanza, not the parent message.
 */
function buildMsgObj(originalMessage, quotedContent) {
    const ctxInfo = originalMessage.message?.extendedTextMessage?.contextInfo;
    return {
        key: {
            remoteJid: originalMessage.key.remoteJid,
            fromMe: false,
            id: ctxInfo?.stanzaId || originalMessage.key.id,
            participant: ctxInfo?.participant,
        },
        message: quotedContent,
    };
}

/**
 * Send content as a WhatsApp group status (groupStatusMessageV2).
 */
async function sendGroupStatus(conn, jid, content) {
    const secret = crypto.randomBytes(32);

    // Convert proto → plain object if necessary
    const innerMsg = typeof content.toJSON === "function" ? content.toJSON() : content;

    const fullContent = {
        messageContextInfo: { messageSecret: secret },
        groupStatusMessageV2: {
            message: {
                ...innerMsg,
                messageContextInfo: { messageSecret: secret },
            },
        },
    };

    const msg = baileys.generateWAMessageFromContent(jid, fullContent, {});
    await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
    return msg;
}

/**
 * Convert any audio buffer → Opus/OGG voice note format.
 */
function toVN(buffer) {
    return new Promise((resolve, reject) => {
        const input = new PassThrough();
        const output = new PassThrough();
        const chunks = [];

        input.end(buffer);

        ffmpeg(input)
            .noVideo()
            .audioCodec("libopus")
            .format("ogg")
            .audioChannels(1)
            .audioFrequency(48000)
            .on("error", reject)
            .on("end", () => resolve(Buffer.concat(chunks)))
            .pipe(output);

        output.on("data", (c) => chunks.push(c));
        output.on("error", reject);
    });
}

/**
 * Generate a base64-encoded waveform from an audio buffer.
 */
function generateWaveform(buffer, bars = 64) {
    return new Promise((resolve, reject) => {
        const input = new PassThrough();
        const output = new PassThrough();
        const chunks = [];

        input.end(buffer);

        ffmpeg(input)
            .audioChannels(1)
            .audioFrequency(16000)
            .format("s16le")
            .on("error", reject)
            .on("end", () => {
                const raw = Buffer.concat(chunks);
                const samples = raw.length / 2;
                const amps = [];

                for (let i = 0; i < samples; i++) {
                    amps.push(Math.abs(raw.readInt16LE(i * 2)) / 32768);
                }

                const size = Math.max(1, Math.floor(amps.length / bars));
                const avg = Array.from({ length: bars }, (_, i) => {
                    const slice = amps.slice(i * size, (i + 1) * size);
                    return slice.length
                        ? slice.reduce((a, b) => a + b, 0) / slice.length
                        : 0;
                });

                const max = Math.max(...avg) || 1;
                resolve(
                    Buffer.from(
                        avg.map((v) => Math.floor((v / max) * 100)),
                    ).toString("base64"),
                );
            })
            .pipe(output);

        output.on("data", (c) => chunks.push(c));
        output.on("error", reject);
    });
}
