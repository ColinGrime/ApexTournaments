import { CommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import { Tournament } from '../../../tournaments';
import { createEmbed } from '../../../utils/discord-utils.js';

export const commandName = 'create'
export const description = 'Creates a tournament for players to opt-in.'

export function register(subcommand: SlashCommandSubcommandBuilder) {
   return subcommand
        .setName(commandName)
        .setDescription(description)
        .addUserOption(option => option.setName('start-time').setDescription('Time to start (seconds)'));
}

export function execute(interaction: CommandInteraction, tournament: Tournament) {
    if (!tournament.create()) {
        return interaction.reply({ 
            content: 'There was an **error** creating the tournament.\nPlease make sure you have initialized a tournament channel first.',
            ephemeral: true
        })
    }

    return interaction.reply({ 
        content: 'A tournament has officially been created.',
        ephemeral: true
    })
}