import { CommandInteraction, SlashCommandSubcommandBuilder, TextChannel } from 'discord.js';
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
    tournament.stop().then(() => {
        const participants: Participant[] = tournament.participants;
        const rankings: string[] = ['**Final Rankings:**']
    
        for (let i=0; i<participants.length; i++) {
            const participant = participants.at(i);
            const gameData = participant.gameData;
    
            rankings.push(`**${i+1}.** **<@${participant.discordID}>** (**${participant.points}** points)`);
            rankings.push(`:black_small_square: **${gameData.wins}** wins, **${gameData.kills}** kills, **${gameData.damage}** damage`);
            rankings.push('');
        }

        const channel: TextChannel = interaction.channel as TextChannel;
        channel.send({
            embeds: [createEmbed(...rankings)],
        });
    })

    return interaction.reply({
        content: '*Stopping the tournament...*',
        ephemeral: true
    });
}