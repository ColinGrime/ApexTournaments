import { CommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { Participant } from '../../../participant.js';
import { Tournament } from '../../../tournaments.js';
import { createEmbed } from '../../../utils/discord-utils.js';

export const commandName = 'stop'
export const description = 'Stops the tournament and displays the top kills, damage, and top overall!'

export function register(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

export async function execute(interaction: CommandInteraction, tournament: Tournament) {
    await tournament.stop();

    const participants: Participant[] = tournament.participants;
    const rankings: string[] = ['**Current Rankings:**']

    for (let i=0; i<participants.length; i++) {
        const participant = participants.at(i);
        const gameData = participant.gameData;

        rankings.push(`**${i+1}.** **<@${participant.discordID}>** (**${participant.points}** points)`);
        rankings.push(`:black_small_square: **${gameData.wins}** wins, **${gameData.kills}** kills, **${gameData.damage}** damage`);
        rankings.push('');
    }

    return interaction.reply({
        embeds: [createEmbed(...rankings)],
        ephemeral: true
    });
}