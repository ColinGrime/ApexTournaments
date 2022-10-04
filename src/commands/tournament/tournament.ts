import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { SlashCommandBuilder } from 'discord.js';

// Get the path.
import { URL } from 'url';
const dirname = new URL('.', import.meta.url).pathname;

// Main command.
export const data = new SlashCommandBuilder()
    .setName('tournament')
    .setDescription('Command for all tournament actions.');

// Map of all subcommands.
const subcommands = new Map();

export async function registerSubcommands() {
    const subcommandsPath = join(dirname, 'subcommands');
    const subcommandFiles = readdirSync(subcommandsPath).filter(file => file.endsWith('.js'));
    
    // Registers the various subcommands.
    for (const subcommandFile of subcommandFiles) {
        const subcommandPath = join(subcommandsPath, subcommandFile);
        const subcommand = await import(subcommandPath);

        data.addSubcommand(sub => subcommand.register(sub));
        subcommands.set(subcommand.commandName, subcommand);
    }
}

// interactionCreate event
export async function execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommands.has(subcommand)) {
       return subcommands.get(subcommand).execute(interaction);
    }
}