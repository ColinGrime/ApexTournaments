import { CommandInteraction, SlashCommandSubcommandBuilder, TextChannel } from 'discord.js';
import { Tournament } from '../../../tournaments.js';
import { createEmbed } from '../../../utils/discord-utils.js';

export const commandName = 'opt-in'
export const description = 'Opt-in to the tournament if one is available.'

export function register(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

export function execute(interaction: CommandInteraction, tournament: Tournament) {
    tournament.optIn(interaction.user.id).then(success => {        
        if (success) {
            const channel: TextChannel = interaction.channel as TextChannel;
            channel.send({
                embeds: [createEmbed(`**${interaction.user.username} has opted into the tournament!**`)] 
            });
        } else {
            interaction.user.send({
                content: 'There was an **error** opting you into the tournament.\nAre you sure one\'s active?',
            });
        }
    })

    return interaction.reply({
        content: '*Attempting tracker check and opt-in...*',
        ephemeral: true
    });
}