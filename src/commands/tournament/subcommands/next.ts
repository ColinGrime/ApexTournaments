export const commandName = 'next'
export const description = 'Starts the next round in the tournament.'

export function register(subcommand) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

export function execute(interaction) {

}