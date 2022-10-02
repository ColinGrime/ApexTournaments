const commandName = 'next'
const description = 'Starts the next round in the tournament.'

function register(subcommand) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

function execute(interaction) {

}

module.exports = { commandName, register, execute }