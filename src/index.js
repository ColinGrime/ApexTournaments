import 'dotenv/config';
import fs from 'node:fs';
import { join } from 'node:path';
import { Client, GatewayIntentBits, Collection } from 'discord.js';

// Get the path.
import { URL } from 'url';
const __dirname = new URL('.', import.meta.url).pathname;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Get all available command files.
client.commands = new Collection();
const commandsPath = join(__dirname, 'commands');

for (const file of fs.readdirSync(commandsPath)) {
	const filePath = join(commandsPath, file);

    // Check inside directories for larger commands.
    if (fs.lstatSync(filePath).isDirectory()) {
        for (const insideFile of fs.readdirSync(filePath).filter(f => f.endsWith('.js'))) {
            const insideFilePath = join(filePath, insideFile);
            import(insideFilePath).then(command => {
                client.commands.set(command.data.name, command);
            })
        }
        continue;
    }

	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

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
const eventsPath = join(__dirname, 'events');
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