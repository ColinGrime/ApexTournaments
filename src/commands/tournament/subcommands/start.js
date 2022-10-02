const commandName = 'start'
const description = 'Automatically starts the tournament if there are enough players and they are all in VC.'

function register(subcommand) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

function execute(interaction) {

}

module.exports = { commandName, register, execute }