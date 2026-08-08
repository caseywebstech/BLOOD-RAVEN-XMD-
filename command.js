// command.js - Updated without session management
const isAdmin = require('./lib/isAdmin');
const config = require('./config');

var commands = [];

// Function to check if bot is admin (using the improved isAdmin)
async function checkBotAdmin(conn, chatId) {
    try {
        const { isBotAdmin } = await isAdmin(conn, chatId, conn.user.id);
        return isBotAdmin;
    } catch (error) {
        console.error('Error checking bot admin status:', error);
        return false;
    }
}

// Function to check if user is admin
async function checkUserAdmin(conn, chatId, userId) {
    try {
        const { isSenderAdmin } = await isAdmin(conn, chatId, userId);
        return isSenderAdmin;
    } catch (error) {
        console.error('Error checking user admin status:', error);
        return false;
    }
}

// Function to check if user is owner (update with your actual numbers)
function isOwner(userId) {
    const OWNER_NUMBERS = String(config.OWNER_NUMBER || '')
        .split(',')
        .map(number => number.trim())
        .filter(Boolean)
        .map(number => number.includes('@') ? number : `${number}@s.whatsapp.net`);
    
    if (!userId) return false;
    return OWNER_NUMBERS.some(owner => 
        userId === owner || 
        userId.includes(owner.replace('@s.whatsapp.net', '')) ||
        owner.includes(userId.replace('@s.whatsapp.net', ''))
    );
}

function cmd(info, func) {
    var data = info;
    data.function = func;
    if (!data.dontAddCommandList) data.dontAddCommandList = false;
    if (!info.desc) info.desc = '';
    if (!data.fromMe) data.fromMe = false;
    if (!info.category) data.category = 'misc';
    if(!info.filename) data.filename = "Not Provided";
    commands.push(data);
    return data;
}

module.exports = {
    cmd,
    AddCommand: cmd,
    Function: cmd,
    Module: cmd,
    commands,
    isAdmin,           // The main function that returns {isSenderAdmin, isBotAdmin}
    checkBotAdmin,     // Simplified: returns only isBotAdmin boolean
    checkUserAdmin,    // Simplified: returns only isSenderAdmin boolean
    isOwner
};
