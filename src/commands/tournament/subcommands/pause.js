const commandName = 'pause'
const description = 'Pauses the tournament by ceasing tracking on all players until /tournament start is called again.'

function register(subcommand) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

function execute(interaction) {

}

module.exports = { commandName, register, execute }