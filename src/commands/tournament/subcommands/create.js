const commandName = 'create'
const description = 'Creates a tournament for players to opt-in.'
const { serverData } = require('../tournament.js')

function register(subcommand) {
   return subcommand
        .setName(commandName)
        .setDescription(description)
        .addUserOption(option => option.setName('start-time').setDescription('Time to start (seconds)'));
}

function execute(interaction) {
    console.log(serverData)
    interaction.reply({ content: 'It has been created!' });
}

module.exports = { commandName, register, execute }