export const commandName = 'init'
export const description = 'Initializes the tournament channel and category.'

export function register(subcommand) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

export function execute(interaction) {
    
}