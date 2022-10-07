import { CommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { Tournament } from '../../../tournaments.js';
import messages from '../../../../assets/messages.js';

export const commandName = 'start'
export const description = 'Automatically starts the tournament if there are enough players and they are all in VC.'

export function register(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

export function execute(interaction: CommandInteraction, tournament: Tournament) {
    const res = tournament.start();
    if (res === null) {
        return interaction.reply(messages.startTournamentForceStart);
    }

    return interaction.reply({
        content: tournament.start(),
        ephemeral: true
    });
}