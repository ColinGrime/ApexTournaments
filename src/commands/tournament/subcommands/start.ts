import { CommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { Tournament } from '../../../tournaments.js';
import { createEmbed } from '../../../utils/discord-utils.js';

export const commandName = 'start'
export const description = 'Automatically starts the tournament if there are enough players and they are all in VC.'

export function register(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

export function execute(interaction: CommandInteraction, tournament: Tournament) {
    if (tournament.start()) {
        return interaction.reply({
            content: 'Tournament has been forcefully started.',
            ephemeral: true
        })
    }

    return interaction.reply({
        content: 'There was an **error** starting the tournament.',
        ephemeral: true
    })
}