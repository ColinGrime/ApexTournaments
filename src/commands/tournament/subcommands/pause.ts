export const commandName = 'pause'
export const description = 'Pauses the tournament by ceasing tracking on all players until /tournament start is called again.'

export function register(subcommand) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

export function execute(interaction) {

}