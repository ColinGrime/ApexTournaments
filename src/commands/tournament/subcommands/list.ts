import { CommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { Tournament } from '../../../tournaments.js';
import { DiscordID } from '../../../../assets/config.js';
import { createEmbed } from '../../../utils/discord-utils.js';

export const commandName = 'list'
export const description = 'Lists the players in the current tournament.'

export function register(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

export function execute(interaction: CommandInteraction, tournament: Tournament) {
    const discordIDs: DiscordID[] = tournament.list();
    const mentions: string[] = ['**Current Participants:**'];

    for (let i=0; i<discordIDs.length; i++) {
        mentions.push(`**${i+1}.** <@${discordIDs.at(i)}>`);
    }

    if (mentions.length === 1) {
        mentions[0] = '**There are no participants registered for this tournament.**';
    }

    return interaction.reply({
        embeds: [createEmbed(...mentions)],
        ephemeral: true
    });
}