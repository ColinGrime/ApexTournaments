const commandName = 'init'
const description = 'Initializes the tournament channel and category.'

function register(subcommand) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

function execute(interaction) {
    
}

module.exports = { commandName, register, execute }