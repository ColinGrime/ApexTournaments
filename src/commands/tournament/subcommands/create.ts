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

    return interaction.reply({ embeds: [createEmbed(
        '**An apex tournament has just been created.**',
        '**Join now or forever be blacklisted.**',
        '',
        ':regional_indicator_j::regional_indicator_o::regional_indicator_i::regional_indicator_n: :black_small_square: **/tournament opt-in**',
        ':regional_indicator_q::regional_indicator_u::regional_indicator_i::regional_indicator_t: :black_small_square: **/tournament opt-out**',
        ':regional_indicator_l::regional_indicator_i::regional_indicator_s::regional_indicator_t: :black_small_square: **/tournament list**',
        ':regional_indicator_i::regional_indicator_n::regional_indicator_f::regional_indicator_o: :black_small_square: **/tournament current**'
    ).setFooter({ text: '30 SECONDS LEFT' })] });
}