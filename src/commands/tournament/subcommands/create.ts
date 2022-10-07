import { CommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { Tournament } from '../../../tournaments';

export const commandName = 'create'
export const description = 'Creates a tournament for players to opt-in.'

export function register(subcommand: SlashCommandSubcommandBuilder) {
   return subcommand
        .setName(commandName)
        .setDescription(description)
        .addUserOption(option => option.setName('start-time').setDescription('Time to start (seconds)'));
}

export function execute(interaction: CommandInteraction, tournament: Tournament) {
    return interaction.reply(tournament.create());
}