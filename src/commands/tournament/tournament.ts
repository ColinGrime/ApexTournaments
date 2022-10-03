import 'dotenv/config';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { SlashCommandBuilder } from 'discord.js';

// Main command.
let data = new SlashCommandBuilder()
    .setName('tournament')
    .setDescription('Command for all tournament actions.');

// Subcommands.
const subcommands = new Map();
const subcommandsPath = join(__dirname, 'subcommands');
const subcommandFiles = readdirSync(subcommandsPath).filter(file => file.endsWith('.js'));

// Registers the various subcommands.
for (const file of subcommandFiles) {
    const filePath = join(subcommandsPath, file);
    import(filePath).then(subcommand => {
        data.addSubcommand(sub => subcommand.register(sub));
        subcommands.set(subcommand.commandName, subcommand);
    })
}

// interactionCreate event
async function execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommands.has(subcommand)) {
       subcommands.get(subcommand).execute(interaction);
    }
}

export default { data, execute }