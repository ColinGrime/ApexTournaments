export const commandName = 'opt-out'
export const description = 'Opt-out of a tournmanet if you are in one.'

export function register(subcommand) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

export function execute(interaction) {

}