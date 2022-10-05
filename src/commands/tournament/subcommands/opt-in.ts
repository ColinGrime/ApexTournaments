import { CommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { Tournament } from '../../../tournaments';

export const commandName = 'opt-in'
export const description = 'Opt-in to the tournament if one is available.'

export function register(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

export function execute(interaction: CommandInteraction, tournament: Tournament) {
    // tournament.optIn
}