export const commandName = 'opt-in'
export const description = 'Opt-in to the tournament if one is available.'

export function register(subcommand) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

export function execute(interaction) {

}