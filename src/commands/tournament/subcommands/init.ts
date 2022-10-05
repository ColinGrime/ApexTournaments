import { CommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import { Tournament } from '../../../tournaments.js'

export const commandName = 'init'
export const description = 'Initializes the tournament channel and category.'

export function register(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

export async function execute(interaction: CommandInteraction, tournament: Tournament) {
    tournament.init(interaction.channelId, interaction.channel.parentId);
    return interaction.reply({
        content: 'Channel has been set as Tournament channel.',
        ephemeral: true
    })
}