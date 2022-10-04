import fs from 'node:fs';
import { join } from 'node:path';

// Get the directory path.
import { URL } from 'url';
const dirname = new URL('.', import.meta.url).pathname;

const commands = [];
const commandsPath = join(dirname, 'commands');
let hasExecuted: boolean = false;

export default async function getCommands(): Promise<object[]> {
    if (hasExecuted) {
        return commands;
    } else {
        hasExecuted = true;
    }

    // Iterate over each command file.
    for (const commandFile of fs.readdirSync(commandsPath)) {
        const commandPath = join(commandsPath, commandFile);

        // Check inside directories for larger commands (those with subcommands).
        if (fs.lstatSync(commandPath).isDirectory()) {
            for (const largeCommandFile of fs.readdirSync(commandPath).filter(f => f.endsWith('.js'))) {
                const largeCommandPath = join(commandPath, largeCommandFile);
                const command = await import(largeCommandPath);
                
                // Register subcommands and add the command.
                await command.registerSubcommands();
                commands.push(command);
            }
            
            continue;
        }

        // Regular commands.
        const command = await import(commandPath);
        commands.push(command);
    }

    return commands;
}