import { CommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { Tournament } from '../../../tournaments.js';
import { createEmbed } from '../../../utils/discord-utils.js';

export const commandName = 'opt-in'
export const description = 'Opt-in to the tournament if one is available.'

export function register(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

export async function execute(interaction: CommandInteraction, tournament: Tournament) {
    if (await tournament.optIn(interaction.user.id)) {
        return interaction.reply({ 
            embeds: [createEmbed(`**${interaction.user.username} has opted into the tournament!**`)] 
        });
    }

    return interaction.reply({
        content: 'There was an **error** opting you into the tournament.\nAre you sure one\'s active?',
        ephemeral: true
    })
}