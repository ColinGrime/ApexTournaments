import 'dotenv/config';
import fs from 'node:fs';
import { join } from 'node:path';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import getCommands from './commands.js';  
import './tournaments.js';

// Define commands collection.
declare module "discord.js" {
    export interface Client {
        commands: Collection<unknown, any>
    }
}

// Get the path.
import { URL } from 'url';
const dirname = new URL('.', import.meta.url).pathname;

// Create a new client instance
export const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.commands = new Collection();

getCommands().then(commands => {
    let command: any;
    for (command of commands) {
        client.commands.set(command.data.name, command);
    }
})

// Listen for all commands.
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

// Get all available event files.
const eventsPath = join(dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('js'));

// Listen for all events.
for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    import(filePath).then(event => {
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    })
}

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);