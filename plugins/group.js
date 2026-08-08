const config = require('../config');
const { cmd, commands } = require('../command');

// Store welcome and goodbye messages (use database in production)
const welcomeMessages = {};
const goodbyeMessages = {};
const welcomeSettings = {}; // Store welcome on/off status per group
const goodbyeSettings = {}; // Store goodbye on/off status per group

// Newsletter message context
const newsletterContext = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363420261263259@newsletter',
        newsletterName: 'BLOODRAVEN TECH 亗🧑‍💻',
        serverMessageId: -1
    }
};

// ---------- WELCOME ON/OFF ----------
cmd({
    pattern: "welcome",
    desc: "Toggle welcome messages on/off",
    category: "group",
    react: "👋",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender }) => {
    try {
        if (!isGroup) return reply('❌ This command is only for groups!');
        if (!isCreator) return reply('❌ Only the bot owner can use this command!');

        const args = body.split(' ');
        if (args.length < 2) {
            const status = welcomeSettings[from] !== false ? 'ON' : 'OFF';
            return reply(`📋 Welcome messages are currently *${status}*\n\nUsage: .welcome on/off`);
        }

        const option = args[1].toLowerCase();
        if (option === 'on') {
            welcomeSettings[from] = true;
            await conn.sendMessage(from, {
                text: '✅ Welcome messages have been *TURNED ON*!',
                contextInfo: newsletterContext
            }, { quoted: mek });
        } else if (option === 'off') {
            welcomeSettings[from] = false;
            await conn.sendMessage(from, {
                text: '❌ Welcome messages have been *TURNED OFF*!',
                contextInfo: newsletterContext
            }, { quoted: mek });
        } else {
            reply('❌ Invalid option! Use: .welcome on/off');
        }

    } catch (e) {
        console.error('Welcome toggle error:', e);
        reply('❌ Failed to toggle welcome messages.');
    }
});

// ---------- GOODBYE ON/OFF ----------
cmd({
    pattern: "goodbye",
    desc: "Toggle goodbye messages on/off",
    category: "group",
    react: "👋",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender }) => {
    try {
        if (!isGroup) return reply('❌ This command is only for groups!');
        if (!isCreator) return reply('❌ Only the bot owner can use this command!');

        const args = body.split(' ');
        if (args.length < 2) {
            const status = goodbyeSettings[from] !== false ? 'ON' : 'OFF';
            return reply(`📋 Goodbye messages are currently *${status}*\n\nUsage: .goodbye on/off`);
        }

        const option = args[1].toLowerCase();
        if (option === 'on') {
            goodbyeSettings[from] = true;
            await conn.sendMessage(from, {
                text: '✅ Goodbye messages have been *TURNED ON*!',
                contextInfo: newsletterContext
            }, { quoted: mek });
        } else if (option === 'off') {
            goodbyeSettings[from] = false;
            await conn.sendMessage(from, {
                text: '❌ Goodbye messages have been *TURNED OFF*!',
                contextInfo: newsletterContext
            }, { quoted: mek });
        } else {
            reply('❌ Invalid option! Use: .goodbye on/off');
        }

    } catch (e) {
        console.error('Goodbye toggle error:', e);
        reply('❌ Failed to toggle goodbye messages.');
    }
});

// ---------- SET WELCOME ----------
cmd({
    pattern: "setwelcome",
    desc: "Set welcome message for new members",
    category: "group",
    react: "📝",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender }) => {
    try {
        if (!isGroup) return reply('❌ This command is only for groups!');
        if (!isCreator) return reply('❌ Only the bot owner can use this command!');

        const message = body.replace('.setwelcome', '').trim();
        if (!message) return reply('❌ Please provide a welcome message!\n\nExample: .setwelcome Welcome @user to the group!\n\n📌 Use @user to mention the new member');

        welcomeMessages[from] = message;
        
        await conn.sendMessage(from, {
            text: `✅ Welcome message set!\n\n📝 Message: ${message}\n\n📌 Welcome is currently ${welcomeSettings[from] !== false ? 'ON' : 'OFF'}`,
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error('Setwelcome error:', e);
        reply('❌ Failed to set welcome message.');
    }
});

// ---------- SET GOODBYE ----------
cmd({
    pattern: "setgoodbye",
    desc: "Set goodbye message for leaving members",
    category: "group",
    react: "📝",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender }) => {
    try {
        if (!isGroup) return reply('❌ This command is only for groups!');
        if (!isCreator) return reply('❌ Only the bot owner can use this command!');

        const message = body.replace('.setgoodbye', '').trim();
        if (!message) return reply('❌ Please provide a goodbye message!\n\nExample: .setgoodbye Goodbye @user, we\'ll miss you!\n\n📌 Use @user to mention the leaving member');

        goodbyeMessages[from] = message;
        
        await conn.sendMessage(from, {
            text: `✅ Goodbye message set!\n\n📝 Message: ${message}\n\n📌 Goodbye is currently ${goodbyeSettings[from] !== false ? 'ON' : 'OFF'}`,
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error('Setgoodbye error:', e);
        reply('❌ Failed to set goodbye message.');
    }
});

// ---------- ADD MEMBER ----------
cmd({
    pattern: "add",
    desc: "Add a user to the group",
    category: "group",
    react: "➕",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender }) => {
    try {
        if (!isGroup) return reply('❌ This command is only for groups!');
        if (!isCreator) return reply('❌ Only the bot owner can use this command!');

        let number = body.split(' ')[1];
        if (!number && quoted) {
            const quotedNumber = quoted.sender || quoted.participant;
            number = quotedNumber.split('@')[0];
        }
        if (!number) return reply('❌ Please provide a phone number!\nExample: .add 254700000000');

        number = number.replace(/[^0-9]/g, '');
        if (!number.startsWith('254')) number = '254' + number;
        
        const jid = number + '@s.whatsapp.net';

        await conn.groupParticipantsUpdate(from, [jid], "add");
        
        const msg = `✅ Successfully added @${number} to the group!`;
        await conn.sendMessage(from, {
            text: msg,
            mentions: [jid],
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error('Add error:', e);
        reply('❌ Failed to add user. Make sure:\n• Number is valid\n• Bot has admin privileges\n• User hasn\'t blocked the bot');
    }
});

// ---------- REMOVE/KICK MEMBER ----------
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

        const groupMetadata = await conn.groupMetadata(from);
        const isAdmin = groupMetadata.participants.find(p => p.id === userJid)?.admin;
        if (isAdmin) return reply('❌ Cannot remove an admin!');

        await conn.groupParticipantsUpdate(from, [userJid], "remove");
        
        const msg = `✅ Successfully removed @${userJid.split('@')[0]} from the group!`;
        await conn.sendMessage(from, {
            text: msg,
            mentions: [userJid],
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error('Remove error:', e);
        reply('❌ Failed to remove user. Make sure bot has admin privileges.');
    }
});

// ---------- PROMOTE TO ADMIN ----------
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
        
        const msg = `👑 @${userJid.split('@')[0]} has been promoted to admin!`;
        await conn.sendMessage(from, {
            text: msg,
            mentions: [userJid],
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error('Promote error:', e);
        reply('❌ Failed to promote user. Make sure bot has admin privileges.');
    }
});

// ---------- DEMOTE FROM ADMIN ----------
cmd({
    pattern: "demote",
    desc: "Demote an admin to member",
    category: "group",
    react: "⬇️",
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
            return reply('❌ Please mention or reply to the user you want to demote!');
        }

        await conn.groupParticipantsUpdate(from, [userJid], "demote");
        
        const msg = `⬇️ @${userJid.split('@')[0]} has been demoted to member!`;
        await conn.sendMessage(from, {
            text: msg,
            mentions: [userJid],
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error('Demote error:', e);
        reply('❌ Failed to demote user. Make sure bot has admin privileges.');
    }
});

// ---------- TAG ALL MEMBERS ----------
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
            mentions: mentions,
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error('Tagall error:', e);
        reply('❌ Failed to tag all members.');
    }
});

// ---------- TAG ADMINS ----------
cmd({
    pattern: "tagadmins",
    desc: "Tag all group admins",
    category: "group",
    react: "🛡️",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender }) => {
    try {
        if (!isGroup) return reply('❌ This command is only for groups!');

        const groupMetadata = await conn.groupMetadata(from);
        const admins = groupMetadata.participants.filter(p => p.admin);
        
        if (admins.length === 0) return reply('❌ No admins found in this group.');

        let message = '🛡️ *GROUP ADMINS*\n\n';
        admins.forEach((admin, index) => {
            message += `${index + 1}. @${admin.id.split('@')[0]}\n`;
        });

        const mentions = admins.map(a => a.id);
        await conn.sendMessage(from, {
            text: message,
            mentions: mentions,
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error('Tagadmins error:', e);
        reply('❌ Failed to tag admins.');
    }
});

// ---------- HIDE TAG ----------
cmd({
    pattern: "hidetag",
    desc: "Tag all members with custom message",
    category: "group",
    react: "👻",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender }) => {
    try {
        if (!isGroup) return reply('❌ This command is only for groups!');
        if (!isCreator) return reply('❌ Only the bot owner can use this command!');

        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants;
        
        let message = body.replace('.hidetag', '').trim() || '📢 Announcement!';
        const mentions = participants.map(p => p.id);
        
        await conn.sendMessage(from, {
            text: message,
            mentions: mentions,
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error('Hidetag error:', e);
        reply('❌ Failed to send hidden tag.');
    }
});

// ---------- GROUP INFO ----------
cmd({
    pattern: "ginfo",
    desc: "Get group information",
    category: "group",
    react: "📊",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender }) => {
    try {
        if (!isGroup) return reply('❌ This command is only for groups!');

        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants;
        const admins = participants.filter(p => p.admin);
        
        const welcomeStatus = welcomeSettings[from] !== false ? '✅ ON' : '❌ OFF';
        const goodbyeStatus = goodbyeSettings[from] !== false ? '✅ ON' : '❌ OFF';
        
        const info = `
╭━━━〔 *GROUP INFO* 〕━━━┈⊷
┃★╭──────────────
┃★│ 📛 Name: ${groupMetadata.subject}
┃★│ 👥 Members: ${participants.length}
┃★│ 🛡️ Admins: ${admins.length}
┃★│ 👤 Owner: @${groupMetadata.owner?.split('@')[0] || 'Unknown'}
┃★│ 📅 Created: ${new Date(groupMetadata.creation * 1000).toLocaleDateString()}
┃★│ 🔗 Link: https://chat.whatsapp.com/${await conn.groupInviteCode(from) || 'Not available'}
┃★│ 🆔 ID: ${from}
┃★│ 👋 Welcome: ${welcomeStatus}
┃★│ 👋 Goodbye: ${goodbyeStatus}
┃★╰──────────────
╰━━━━━━━━━━━━━━━┈⊷
> ${config.DESCRIPTION}`;

        const mentions = [groupMetadata.owner].filter(Boolean);
        await conn.sendMessage(from, {
            text: info,
            mentions: mentions,
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error('Ginfo error:', e);
        reply('❌ Failed to get group information.');
    }
});

// ---------- GROUP LINK ----------
cmd({
    pattern: "grouplink|link",
    desc: "Get group invite link",
    category: "group",
    react: "🔗",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender }) => {
    try {
        if (!isGroup) return reply('❌ This command is only for groups!');
        if (!isCreator) return reply('❌ Only the bot owner can use this command!');

        const code = await conn.groupInviteCode(from);
        const link = `https://chat.whatsapp.com/${code}`;
        
        await conn.sendMessage(from, {
            text: `🔗 *GROUP LINK*\n\n${link}\n\n📋 Copy the link and share with others!`,
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error('Grouplink error:', e);
        reply('❌ Failed to get group link. Make sure bot has admin privileges.');
    }
});

// ---------- REVOKE LINK ----------
cmd({
    pattern: "revoke",
    desc: "Reset group invite link",
    category: "group",
    react: "🔄",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender }) => {
    try {
        if (!isGroup) return reply('❌ This command is only for groups!');
        if (!isCreator) return reply('❌ Only the bot owner can use this command!');

        await conn.groupRevokeInvite(from);
        const code = await conn.groupInviteCode(from);
        const link = `https://chat.whatsapp.com/${code}`;
        
        await conn.sendMessage(from, {
            text: `✅ Group link has been reset!\n\n🔗 New link: ${link}`,
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error('Revoke error:', e);
        reply('❌ Failed to reset group link.');
    }
});

// ---------- MUTE GROUP ----------
cmd({
    pattern: "mute",
    desc: "Mute group chat",
    category: "group",
    react: "🔇",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender }) => {
    try {
        if (!isGroup) return reply('❌ This command is only for groups!');
        if (!isCreator) return reply('❌ Only the bot owner can use this command!');

        let duration = body.split(' ')[1];
        let time = 'PT1H';

        if (duration) {
            const num = parseInt(duration);
            if (duration.includes('h')) time = `PT${num}H`;
            else if (duration.includes('d')) time = `PT${num * 24}H`;
            else if (duration.includes('m')) time = `PT${num}M`;
        }

        await conn.groupSettingUpdate(from, 'announcement');
        
        await conn.sendMessage(from, {
            text: `🔇 Group has been muted${duration ? ` for ${duration}` : '!'}`,
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error('Mute error:', e);
        reply('❌ Failed to mute group. Make sure bot has admin privileges.');
    }
});

// ---------- UNMUTE GROUP ----------
cmd({
    pattern: "unmute",
    desc: "Unmute group chat",
    category: "group",
    react: "🔊",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender }) => {
    try {
        if (!isGroup) return reply('❌ This command is only for groups!');
        if (!isCreator) return reply('❌ Only the bot owner can use this command!');

        await conn.groupSettingUpdate(from, 'not_announcement');
        
        await conn.sendMessage(from, {
            text: '🔊 Group has been unmuted!',
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error('Unmute error:', e);
        reply('❌ Failed to unmute group. Make sure bot has admin privileges.');
    }
});

// ---------- LOCK GROUP ----------
cmd({
    pattern: "lockgc|lock",
    desc: "Lock group settings",
    category: "group",
    react: "🔒",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender }) => {
    try {
        if (!isGroup) return reply('❌ This command is only for groups!');
        if (!isCreator) return reply('❌ Only the bot owner can use this command!');

        const setting = body.split(' ')[1] || 'all';
        
        if (setting === 'all' || setting === 'messages') {
            await conn.groupSettingUpdate(from, 'announcement');
        }
        
        if (setting === 'all' || setting === 'settings') {
            await conn.groupSettingUpdate(from, 'locked');
        }

        await conn.sendMessage(from, {
            text: '🔒 Group has been locked!',
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error('Lock error:', e);
        reply('❌ Failed to lock group. Make sure bot has admin privileges.');
    }
});

// ---------- UNLOCK GROUP ----------
cmd({
    pattern: "unlockgc|unlock",
    desc: "Unlock group settings",
    category: "group",
    react: "🔓",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender }) => {
    try {
        if (!isGroup) return reply('❌ This command is only for groups!');
        if (!isCreator) return reply('❌ Only the bot owner can use this command!');

        await conn.groupSettingUpdate(from, 'not_announcement');
        await conn.groupSettingUpdate(from, 'unlocked');
        
        await conn.sendMessage(from, {
            text: '🔓 Group has been unlocked!',
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error('Unlock error:', e);
        reply('❌ Failed to unlock group. Make sure bot has admin privileges.');
    }
});

// ---------- GET GROUP PICTURE ----------
cmd({
    pattern: "getpic",
    desc: "Get group profile picture",
    category: "group",
    react: "🖼️",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender }) => {
    try {
        if (!isGroup) return reply('❌ This command is only for groups!');

        try {
            const pp = await conn.profilePictureUrl(from, 'image');
            await conn.sendMessage(from, {
                image: { url: pp },
                caption: '📸 *Group Profile Picture*',
                contextInfo: newsletterContext
            }, { quoted: mek });
        } catch (e) {
            reply('❌ No profile picture found for this group.');
        }

    } catch (e) {
        console.error('Getpic error:', e);
        reply('❌ Failed to get group profile picture.');
    }
});

// ---------- UPDATE GROUP NAME ----------
cmd({
    pattern: "updategname|setgname",
    desc: "Update group name",
    category: "group",
    react: "✏️",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender }) => {
    try {
        if (!isGroup) return reply('❌ This command is only for groups!');
        if (!isCreator) return reply('❌ Only the bot owner can use this command!');

        const name = body.replace(/\.(updategname|setgname)/, '').trim();
        if (!name) return reply('❌ Please provide a new group name!\n\nExample: .updategname BLOODRAVEN XMD');

        await conn.groupUpdateSubject(from, name);
        
        await conn.sendMessage(from, {
            text: `✅ Group name updated to: ${name}`,
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error('Updategname error:', e);
        reply('❌ Failed to update group name.');
    }
});

// ---------- UPDATE GROUP DESCRIPTION ----------
cmd({
    pattern: "updategdesc|setgdesc",
    desc: "Update group description",
    category: "group",
    react: "📝",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender }) => {
    try {
        if (!isGroup) return reply('❌ This command is only for groups!');
        if (!isCreator) return reply('❌ Only the bot owner can use this command!');

        const desc = body.replace(/\.(updategdesc|setgdesc)/, '').trim();
        if (!desc) return reply('❌ Please provide a new group description!');

        await conn.groupUpdateDescription(from, desc);
        
        await conn.sendMessage(from, {
            text: '✅ Group description updated!',
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error('Updategdesc error:', e);
        reply('❌ Failed to update group description.');
    }
});

// ---------- JOIN REQUESTS ----------
cmd({
    pattern: "joinrequests|requests",
    desc: "View pending join requests",
    category: "group",
    react: "📨",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender }) => {
    try {
        if (!isGroup) return reply('❌ This command is only for groups!');
        if (!isCreator) return reply('❌ Only the bot owner can use this command!');

        const requests = await conn.groupRequestParticipantsList(from);
        
        if (!requests || requests.length === 0) {
            return reply('📨 No pending join requests.');
        }

        let message = '📨 *PENDING JOIN REQUESTS*\n\n';
        const mentions = [];
        requests.forEach((req, index) => {
            message += `${index + 1}. @${req.jid.split('@')[0]}\n   Status: ${req.request_method}\n`;
            mentions.push(req.jid);
        });

        await conn.sendMessage(from, {
            text: message,
            mentions: mentions,
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error('Joinrequests error:', e);
        reply('❌ Failed to get join requests.');
    }
});

// ---------- APPROVE JOIN REQUEST ----------
cmd({
    pattern: "approve",
    desc: "Approve a join request",
    category: "group",
    react: "✅",
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
            return reply('❌ Please mention or reply to the user you want to approve!');
        }

        await conn.groupRequestParticipantsUpdate(from, [userJid], "approve");
        
        const msg = `✅ Join request approved for @${userJid.split('@')[0]}!`;
        await conn.sendMessage(from, {
            text: msg,
            mentions: [userJid],
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error('Approve error:', e);
        reply('❌ Failed to approve join request.');
    }
});

// ---------- REJECT JOIN REQUEST ----------
cmd({
    pattern: "reject",
    desc: "Reject a join request",
    category: "group",
    react: "❌",
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
            return reply('❌ Please mention or reply to the user you want to reject!');
        }

        await conn.groupRequestParticipantsUpdate(from, [userJid], "reject");
        
        const msg = `❌ Join request rejected for @${userJid.split('@')[0]}!`;
        await conn.sendMessage(from, {
            text: msg,
            mentions: [userJid],
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error('Reject error:', e);
        reply('❌ Failed to reject join request.');
    }
});

// ---------- DISMISS (KICKALL) ----------
cmd({
    pattern: "dismiss|kickall",
    desc: "Remove all members except admins and owner",
    category: "group",
    react: "🗑️",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender }) => {
    try {
        if (!isGroup) return reply('❌ This command is only for groups!');
        if (!isCreator) return reply('❌ Only the bot owner can use this command!');

        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants;
        
        const admins = participants.filter(p => p.admin);
        const adminIds = admins.map(a => a.id);
        
        let removed = 0;
        for (const participant of participants) {
            if (!adminIds.includes(participant.id) && participant.id !== sender) {
                try {
                    await conn.groupParticipantsUpdate(from, [participant.id], "remove");
                    removed++;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (e) {
                    console.log('Failed to remove:', participant.id);
                }
            }
        }

        await conn.sendMessage(from, {
            text: `✅ Removed ${removed} members from the group!`,
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error('Dismiss error:', e);
        reply('❌ Failed to dismiss members.');
    }
});

// ---------- SEND DM TO MEMBER ----------
cmd({
    pattern: "senddm",
    desc: "Send a direct message to a group member",
    category: "group",
    react: "📨",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender }) => {
    try {
        if (!isGroup) return reply('❌ This command is only for groups!');
        if (!isCreator) return reply('❌ Only the bot owner can use this command!');

        const args = body.split(' ');
        if (args.length < 2) return reply('❌ Usage: .senddm @user Your message here');

        let userJid;
        if (quoted) {
            userJid = quoted.sender || quoted.participant;
        } else if (args[1] && args[1].startsWith('@')) {
            const number = args[1].replace('@', '').replace(/[^0-9]/g, '');
            userJid = number + '@s.whatsapp.net';
        } else {
            return reply('❌ Please mention the user with @ or reply to their message!');
        }

        const message = args.slice(2).join(' ') || 'Hello from BLOODRAVEN!';
        
        await conn.sendMessage(userJid, {
            text: `📨 *Message from Group Admin*\n\n${message}\n\n_This message was sent from the group_`
        });

        reply(`✅ Message sent to @${userJid.split('@')[0]}!`, { mentions: [userJid] });

    } catch (e) {
        console.error('Senddm error:', e);
        reply('❌ Failed to send DM. Make sure the user hasn\'t blocked the bot.');
    }
});

// ---------- INVITE ----------
cmd({
    pattern: "invite",
    desc: "Invite a user to the group",
    category: "group",
    react: "📩",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCreator, isGroup, reply, sender }) => {
    try {
        if (!isGroup) return reply('❌ This command is only for groups!');
        if (!isCreator) return reply('❌ Only the bot owner can use this command!');

        let number = body.split(' ')[1];
        if (!number) return reply('❌ Please provide a phone number!\nExample: .invite 254700000000');

        number = number.replace(/[^0-9]/g, '');
        if (!number.startsWith('254')) number = '254' + number;
        
        const jid = number + '@s.whatsapp.net';
        const code = await conn.groupInviteCode(from);
        const link = `https://chat.whatsapp.com/${code}`;

        await conn.sendMessage(jid, {
            text: `📩 *Invitation to Join Group*\n\nYou have been invited to join our group!\n\n🔗 Link: ${link}\n\nJoin us and be part of the community!`
        });

        reply(`✅ Invitation sent to @${number}!`, { mentions: [jid] });

    } catch (e) {
        console.error('Invite error:', e);
        reply('❌ Failed to send invitation. Make sure the user exists.');
    }
});

// ---------- GROUP EVENTS HANDLER (Welcome/Goodbye) ----------
// This function will be called from the main bot file
async function handleGroupEvents(conn, event) {
    try {
        if (event.action === 'add') {
            const groupId = event.id;
            // Check if welcome is enabled
            if (welcomeSettings[groupId] !== false && welcomeMessages[groupId]) {
                const message = welcomeMessages[groupId];
                const mentions = event.participants;
                
                let finalMsg = message;
                mentions.forEach(user => {
                    finalMsg = finalMsg.replace('@user', `@${user.split('@')[0]}`);
                });
                
                await conn.sendMessage(groupId, {
                    text: finalMsg,
                    mentions: mentions,
                    contextInfo: newsletterContext
                });
            }
        } else if (event.action === 'remove') {
            const groupId = event.id;
            // Check if goodbye is enabled
            if (goodbyeSettings[groupId] !== false && goodbyeMessages[groupId]) {
                const message = goodbyeMessages[groupId];
                const mentions = event.participants;
                
                let finalMsg = message;
                mentions.forEach(user => {
                    finalMsg = finalMsg.replace('@user', `@${user.split('@')[0]}`);
                });
                
                await conn.sendMessage(groupId, {
                    text: finalMsg,
                    mentions: mentions,
                    contextInfo: newsletterContext
                });
            }
        }
    } catch (e) {
        console.error('Group event handler error:', e);
    }
}

// No module.exports - this is a plugin file that registers commands via cmd()
