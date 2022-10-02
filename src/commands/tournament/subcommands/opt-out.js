const commandName = 'opt-out'
const description = 'Opt-out of a tournmanet if you are in one.'

function register(subcommand) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

function execute(interaction) {

}

module.exports = { commandName, register, execute }