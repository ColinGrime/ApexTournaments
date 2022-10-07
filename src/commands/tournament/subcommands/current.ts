import { CommandInteraction, SlashCommandSubcommandBuilder, TextChannel } from 'discord.js';
import { getRankings } from '../../../participant.js';
import { Tournament } from '../../../tournaments.js';
import { createEmbed } from '../../../utils/discord-utils.js';
import messages from '../../../../assets/messages.js';

export const commandName = 'current'
export const description = 'Displays the current rankings including top kills, damage, and top overall!'

export function register(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

export async function execute(interaction: CommandInteraction, tournament: Tournament) {
    await tournament.current();

    // List the current rankings.
    return interaction.reply({
        embeds: [createEmbed("**Current Rankings:**", ...getRankings(tournament.participants))],
    })
}