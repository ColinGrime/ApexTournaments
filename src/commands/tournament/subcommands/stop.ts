import { CommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { Tournament } from '../../../tournaments.js';
import messages from '../../../../assets/messages.js';

export const commandName = 'stop'
export const description = 'Stops the tournament and displays the top kills, damage, and top overall!'

export function register(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

export function execute(interaction: CommandInteraction, tournament: Tournament) {
    tournament.stop().catch(err => {
        console.log(err);
    })

    return interaction.reply(messages.stopTournamentResponse);
}