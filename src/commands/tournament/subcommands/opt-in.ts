import { CommandInteraction, SlashCommandSubcommandBuilder, TextChannel } from 'discord.js';
import { Tournament } from '../../../tournaments.js';
import messages from '../../../../assets/messages.js';

export const commandName = 'opt-in'
export const description = 'Opt-in to the tournament if one is available.'

export function register(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

export function execute(interaction: CommandInteraction, tournament: Tournament) {
    tournament.optIn(interaction.user.id).then(res => {        
        if (res === null) {
            return;
        }
        
        interaction.user.send(res).catch(() => {
            console.log(messages.failureDirectMessagesDisabled.replace('%username%', interaction.user.username));
        });
    })

    return interaction.reply(messages.joinTournamentResponse);
}