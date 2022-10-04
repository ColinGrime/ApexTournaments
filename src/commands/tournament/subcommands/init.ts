import { CommandInteraction } from 'discord.js'
import { Tournament, getTournament } from '../../../tournaments.js'

export const commandName = 'init'
export const description = 'Initializes the tournament channel and category.'

export function register(subcommand) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

export async function execute(interaction: CommandInteraction) {
    const tournament: Tournament = getTournament(interaction.guildId);
    tournament.init(interaction.channelId, interaction.channel.parentId);

    return interaction.reply({
        content: 'Channel has been set as Tournament channel.',
        ephemeral: true
    })
}