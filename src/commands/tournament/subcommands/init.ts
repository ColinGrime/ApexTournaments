import { CommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import messages from '../../../../assets/messages.js'
import { Tournament } from '../../../tournaments.js'

export const commandName = 'init'
export const description = 'Initializes the tournament channel and category.'

export function register(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

export async function execute(interaction: CommandInteraction, tournament: Tournament) {
    await tournament.init(interaction.channelId, interaction.channel.parentId);
    return interaction.reply(messages.initializeTournament);
}