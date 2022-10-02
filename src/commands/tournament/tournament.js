require('dotenv/config');
const fs = require('node:fs');
const path = require('node:path');
const { SlashCommandBuilder } = require('discord.js');

// Main command.
let data = new SlashCommandBuilder()
    .setName('tournament')
    .setDescription('Command for all tournament actions.');

// Subcommands.
const subcommands = new Map();
const subcommandsPath = path.join(__dirname, 'subcommands');
const subcommandFiles = fs.readdirSync(subcommandsPath).filter(file => file.endsWith('.js'));

// Registers the various subcommands.
for (const file of subcommandFiles) {
    const filePath = path.join(subcommandsPath, file);
    const subcommand = require(filePath);

    data = data.addSubcommand(sub => subcommand.register(sub));
    subcommands.set(subcommand.commandName, subcommand);
}

// interactionCreate event
async function execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommands.has(subcommand)) {
       subcommands.get(subcommand).execute(interaction);
    }
}

module.exports = { data, execute }