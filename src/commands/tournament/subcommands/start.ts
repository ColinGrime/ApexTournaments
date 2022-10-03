export const commandName = 'start'
export const description = 'Automatically starts the tournament if there are enough players and they are all in VC.'

export function register(subcommand) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

export function execute(interaction) {

}