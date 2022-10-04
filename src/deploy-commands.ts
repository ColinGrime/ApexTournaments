import 'dotenv/config';
import { Routes } from 'discord.js';
import { REST } from '@discordjs/rest';
import getCommands from './commands.js';

async function getCommandsData() {
    const commandsData = [];
    const commands: any = await getCommands();

    for (const command of commands) {
        commandsData.push(command.data.toJSON());
    }

    return commandsData;
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
getCommandsData().then(commandsData => {
    rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commandsData })
        .then((data: any) => console.log(`Successfully registered ${data.length} application commands.`))
        .catch(console.error);
})