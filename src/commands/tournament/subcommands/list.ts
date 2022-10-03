export const commandName = 'list'
export const description = 'Lists the players in the current tournament.'

export function register(subcommand) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

export function execute(interaction) {

}