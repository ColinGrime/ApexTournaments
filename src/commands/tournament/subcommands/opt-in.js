const commandName = 'opt-in'
const description = 'Opt-in to the tournament if one is available.'

function register(subcommand) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

function execute(interaction) {

}

module.exports = { commandName, register, execute }