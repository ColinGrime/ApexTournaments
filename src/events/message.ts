import { guildData } from '../tournaments.js'

export const name = 'messageCreate';
export const once = false;

export function execute(message) {
    if (message.author.bot) {
        return;
    }

    for (const guildID in guildData) {
        if (guildID === message.guildId && guildData[guildID]['tournamentChannelID'] === message.channelId) {
            message.delete();
        }
    }
}