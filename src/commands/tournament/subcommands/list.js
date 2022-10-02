const commandName = 'list'
const description = 'Lists the players in the current tournament.'

function register(subcommand) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

function execute(interaction) {

}

module.exports = { commandName, register, execute }