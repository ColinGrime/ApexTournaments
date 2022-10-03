import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { Routes } from 'discord.js';
import { REST } from '@discordjs/rest';

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath);

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);

    // Check inside directories for larger commands.
    if (fs.lstatSync(filePath).isDirectory()) {
        for (const insideFile of fs.readdirSync(filePath).filter(f => f.endsWith('.js'))) {
            const insideFilePath = path.join(filePath, insideFile);
            const command = require(insideFilePath);
            commands.push(command.data.toJSON());
        }
        continue;
    }
    
    // Add the commands.
    const command = require(filePath);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands })
	.then((data: any) => console.log(`Successfully registered ${data.length} application commands.`))
	.catch(console.error);