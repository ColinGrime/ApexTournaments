import { CommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { Tournament } from '../../../tournaments.js';
import messages from '../../../../assets/messages.js';

export const commandName = 'opt-out'
export const description = 'Opt-out of a tournmanet if you are in one.'

export function register(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

export function execute(interaction: CommandInteraction, tournament: Tournament) {
    const res = tournament.optOut(interaction.user.id);
    if (res !== null) {
        return interaction.reply(res);
    }

    return interaction.reply(messages.leaveTournamentResponse);
}