import { CommandInteraction, SlashCommandSubcommandBuilder, TextChannel } from 'discord.js';
import { getRankings } from '../../../participant.js';
import { Tournament } from '../../../tournaments.js';
import { createEmbed } from '../../../utils/discord-utils.js';
import messages from '../../../../assets/messages.js';

export const commandName = 'stop'
export const description = 'Stops the tournament and displays the top kills, damage, and top overall!'

export function register(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

export async function execute(interaction: CommandInteraction, tournament: Tournament) {
    tournament.stop().then(() => {
        tournament.channel.send({
            embeds: [createEmbed("**Final Rankings:**", ...getRankings(tournament.participants))],
        });
    }).catch(err => {
        console.log(err);
    })

    return interaction.reply(messages.stopTournamentResponse);
}