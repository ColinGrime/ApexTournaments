const commandName = 'stop'
const description = 'Stops the tournament and displays the top kills, damage, and top overall!'

function register(subcommand) {
    return subcommand
        .setName(commandName)
        .setDescription(description)
}

function execute(interaction) {

}

module.exports = { commandName, register, execute }